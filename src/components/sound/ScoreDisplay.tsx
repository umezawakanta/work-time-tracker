import React, { useRef, useCallback } from "react";
import {
  Renderer,
  Stave,
  StaveNote,
  Voice,
  Formatter,
  Accidental,
} from "vexflow";
import { SUPPORTED_KEY_SIGNATURES, type KeySignature } from "./MusicConstants";
import { CategoryRatio, MusicGenre } from "./types";
import { DEFAULT_NOTE_MAPPING, getNoteDuration } from "./ScoreConstants";

export interface NoteData {
  pitch: string;
  duration: string;
  time: number;
  instrument: string;
}

export interface ScoreData {
  notes: NoteData[];
  timeSignature: string;
  tempo: number;
  key: string;
}


// Voice.Modeの型安全なアクセス
const VOICE_MODE_SOFT = 3; // VexFlowの定数値

interface ScoreDisplayProps {
  currentScore: ScoreData | null;
  showScore: boolean;
  onToggleScore: () => void;
  onExportScore: () => void;
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({
  currentScore,
  showScore,
  onToggleScore,
  onExportScore,
}) => {
  const scoreContainerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<any>(null);

  // 楽譜を描画する関数
  const renderScore = useCallback((scoreData: ScoreData) => {
    if (!scoreContainerRef.current) {
      return;
    }

    // 既存の楽譜をクリア
    scoreContainerRef.current.innerHTML = "";

    try {
      // コンテナ要素の存在確認
      if (!scoreContainerRef.current) {
        throw new Error("Score container element not found");
      }

      // レンダラーの作成
      const renderer = new Renderer(
        scoreContainerRef.current,
        Renderer.Backends.SVG
      );
      
      if (!renderer) {
        throw new Error("Failed to create VexFlow renderer");
      }
      
      renderer.resize(800, 200);
      const context = renderer.getContext();
      
      if (!context) {
        throw new Error("Failed to get renderer context");
      }
      context.setFont("Arial", 10);

      // 譜表の作成（位置を少し調整）
      const stave = new Stave(10, 40, 780);

      // 拍子記号と調号を追加（VexFlowが解釈できない場合はCにフォールバック）
      const keyForVexflow = (() => {
        if (typeof scoreData.key === "string" && 
            SUPPORTED_KEY_SIGNATURES.includes(scoreData.key as typeof SUPPORTED_KEY_SIGNATURES[number])) {
          return scoreData.key;
        }
        return "C";
      })();
      stave
        .addClef("treble")
        .addTimeSignature(scoreData.timeSignature || "4/4")
        .addKeySignature(keyForVexflow);

      stave.setContext(context).draw();

      // 音符の作成
      const notes = scoreData.notes.map((note) => {
        // VexFlowは大文字の音名を期待（C/4, F#/3形式）
        const vfPitch = note.pitch && note.pitch.includes('/') 
          ? note.pitch.replace(/^([a-g])/, (_, p1) => p1.toUpperCase())
          : "C/4"; // デフォルト値
        const staveNote = new StaveNote({
          clef: "treble",
          keys: [vfPitch],
          duration: note.duration,
          autoStem: true,
        });

        // シャープやフラットを追加（メソッド名を修正）
        if (note.pitch && note.pitch.includes("#")) {
          staveNote.addModifier(new Accidental("#"), 0); // シャープをaddModifierで追加
        } else if (note.pitch && note.pitch.includes("b")) {
          staveNote.addModifier(new Accidental("b"), 0); // フラットをaddModifierで追加
        }

        return staveNote;
      });

      // 音符がない場合は休符を追加
      if (notes.length === 0) {
        notes.push(
          new StaveNote({
            clef: "treble", // ← clefを追加
            keys: ["b/4"],
            duration: "wr",
          })
        );
      }

      // Voice の作成
      try {
        const voice = new Voice({
          numBeats: 4,
          beatValue: 4,
        });

        // setMode: SOFT モード（型安全な定数を使用）
        voice.setMode(VOICE_MODE_SOFT);
        voice.addTickables(notes);

        // Formatterで配置
        const formatter = new Formatter();

        // シンプルな形式でフォーマット（まず基本を動作させる）
        formatter.joinVoices([voice]);
        formatter.format([voice], 750);

        // 描画
        voice.draw(context, stave);

        // ビームの追加（後で対応）
        // 一旦コメントアウトして基本描画を確認
      } catch (voiceError) {
        console.error("Voice error:", voiceError);
        // エラー詳細を表示
        console.error("Voice error details:", {
          notesLength: notes.length,
          scoreData: scoreData,
        });
      }

      rendererRef.current = renderer;
    } catch (error) {
      console.error("Score rendering error:", error);
      // エラー詳細を表示
      console.error("Error details:", {
        scoreData: scoreData,
        containerExists: !!scoreContainerRef.current,
      });
    }
  }, []);

  // 楽譜データを生成する関数
  const generateScoreData = useCallback(
    (categoryRatios: CategoryRatio[], genre: MusicGenre): ScoreData => {
      const notes: NoteData[] = [];
      let currentTime = 0;

      // アクティブなカテゴリから音符を生成
      categoryRatios
        .filter((cat) => cat.ratio > 0)
        .forEach((category, index) => {
          // 音符マッピングは外部から渡される想定
          const noteMapping = DEFAULT_NOTE_MAPPING;
          
          // 音の長さを音符の長さに変換
          const duration = getNoteDuration(category.sound.duration);

          notes.push({
            pitch: noteMapping, // すでに正しいVexFlow形式
            duration: duration,
            time: currentTime,
            instrument: category.instrument || "unknown",
          });

          currentTime += category.sound.duration;
        });

      return {
        notes,
        timeSignature: "4/4",
        tempo: genre.baseTempo || 120,
        key: genre.keySignature || "C",
      };
    },
    []
  );

  // 楽譜をPDFとしてエクスポートする関数
  const exportScoreToPDF = useCallback(() => {
    if (!scoreContainerRef.current) {
      return;
    }

    // SVGをcanvasに変換してPDF化（簡易実装）
    const svg = scoreContainerRef.current.querySelector("svg");
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const blob = new Blob([svgData], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `score_${Date.now()}.svg`;
      link.click();

      URL.revokeObjectURL(url);
    }
  }, []);

  return (
    <>
      {/* 楽譜表示エリア */}
      {showScore && (
        <div className="score-section">
          <div className="score-header">
            <h3>🎼 楽譜</h3>
            <div className="score-controls">
              <button onClick={onToggleScore}>
                {showScore ? "楽譜を隠す" : "楽譜を表示"}
              </button>
              <button onClick={exportScoreToPDF} disabled={!currentScore}>
                📥 楽譜をダウンロード
              </button>
            </div>
          </div>
          <div
            ref={scoreContainerRef}
            className="score-container"
          />
        </div>
      )}
    </>
  );
};

export default ScoreDisplay;
