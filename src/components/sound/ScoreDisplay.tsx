import React, { useRef, useCallback, useEffect } from "react";
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
const VOICE_MODE_SOFT = Voice.Mode.SOFT; // VexFlowの公式定数を使用

// 有効な調号を取得する関数
const getValidKeySignature = (key: string): KeySignature => {
  if (typeof key === "string" && 
      SUPPORTED_KEY_SIGNATURES.includes(key as KeySignature)) {
    return key as KeySignature;
  }
  return "C";
};

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

  // 楽譜データが変更された時に描画
  useEffect(() => {
    if (currentScore && showScore) {
      console.log("Score data changed, rendering...", currentScore);
      renderScore(currentScore);
    }
  }, [currentScore, showScore, renderScore]);

  // 楽譜を描画する関数
  const renderScore = useCallback((scoreData: ScoreData) => {
    console.log("Rendering score:", scoreData);
    if (!scoreContainerRef.current) {
      console.log("Score container not found");
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
      const keyForVexflow = getValidKeySignature(scoreData.key);
      stave
        .addClef("treble")
        .addTimeSignature(scoreData.timeSignature || "4/4")
        .addKeySignature(keyForVexflow);

      stave.setContext(context).draw();

      // 音符の作成
      const notes = scoreData.notes.map((note) => {
        // VexFlowは大文字の音名を期待（C/4, F#/3形式）
        const vfPitch = note.pitch && note.pitch.includes('/') 
          ? note.pitch.replace(/^([a-g])/i, (_, p1) => p1.toUpperCase())
          : "C/4"; // デフォルト値
        const staveNote = new StaveNote({
          clef: "treble",
          keys: [vfPitch],
          duration: note.duration,
          autoStem: true,
        });

        // シャープやフラットを追加（メソッド名を修正）
        if (note.pitch) {
          // 臨時記号を検出（大文字小文字を区別しない、#とbをサポート）
          const accidentalMatch = note.pitch.match(/^([a-gA-G])([#b]{1,2})/i);
          if (accidentalMatch) {
            const accidental = accidentalMatch[2].toLowerCase();
            staveNote.addModifier(new Accidental(accidental), 0);
          }
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
          // カテゴリ固有の音符マッピングを使用、なければデフォルト
          const noteMapping = category.noteMapping || DEFAULT_NOTE_MAPPING;
          
          // 音の長さを音符の長さに変換
          const soundDuration = category.sound?.duration || 0.5; // デフォルト0.5秒
          const duration = getNoteDuration(soundDuration);

          notes.push({
            pitch: noteMapping, // すでに正しいVexFlow形式
            duration: duration,
            time: currentTime,
            instrument: category.instrument || "unknown",
          });

          currentTime += soundDuration;
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
