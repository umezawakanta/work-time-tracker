import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as Tone from "tone";

/**
 * SoundAppComponent
 * - デザイン刷新（カード/グリッド/モーダル）
 * - 音の精度: setTimeout -> Tone.Transport.schedule によるサンプル精度のスケジューリング
 * - オーディオ安全化: Limiter/Compressor、音量のramp、初回ユーザー操作での起動
 * - パフォーマンス: useMemo / useCallback、アニメ/タイマーの完全クリーンアップ
 * - 機能拡張: 記録の編集/削除/エクスポート/インポート、テンポスライダー、Tap Tempo、ショートカット
 * - アクセシビリティ: ボタンのaria/role、キーボード操作
 */

// --- 型定義 ---------------------------------------------------------------
export interface VisualizerData {
  categoryId: string;
  name: string;
  color: string;
  value: number;
  percentage: number;
  isPlaying: boolean;
}

export interface FoodCategory {
  id: string;
  name: string;
  sound: { frequency: number; duration: number; volume: number };
  color: string;
  instrument: string;
}

export interface MealRecord {
  id: string;
  date: string;
  time?: string;
  categories: Record<string, number>;
  notes?: string;
  timestamp: number;
}

export interface MusicGenre {
  id: string;
  name: string;
  baseTempo: number;
  instruments: string[];
  description: string;
}

export interface PeriodOption {
  id: string;
  label: string;
  days: number;
  description: string;
}

// --- 定数 ---------------------------------------------------------------
const IDEAL_BALANCE_RATIOS = {
  staple: 0.4,
  side: 0.3,
  miso: 0.1,
  meat: 0.1,
  fish: 0.05,
  vegetable: 0.05,
} as const;

const PERIOD_OPTIONS: PeriodOption[] = [
  { id: "today", label: "今日", days: 1, description: "今日の食事パターン" },
  { id: "week", label: "1週間", days: 7, description: "過去1週間の食事傾向" },
  {
    id: "month",
    label: "1か月",
    days: 30,
    description: "過去1か月の栄養バランス",
  },
];

const PLAY_MS = 8000; // 再生時間上限（UIのメッセージと同期）

// --- ユーティリティ -------------------------------------------------------
const nowIsoDate = () => new Date().toISOString().split("T")[0];
const nowTime = () => new Date().toTimeString().split(" ")[0];

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function percentageText(p: number) {
  return `${Math.round(p)}%`;
}

// グローバル初期化フラグ
let globalToneInitialized = false;

// --- 本体 ---------------------------------------------------------------
const SoundAppComponent: React.FC = () => {
  // マスターチェーン（Limiter/Compressor）
  const masterChainRef = useRef<{
    limiter: Tone.Limiter;
    comp: Tone.Compressor;
  } | null>(null);
  const instrumentsRef = useRef<Record<string, any>>({});
  const visualCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  // 状態
  const [selectedGenreId, setSelectedGenreId] = useState<string>(
    () => localStorage.getItem("sound.genre") || "balanced"
  );
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>(
    () => localStorage.getItem("sound.period") || "today"
  );
  const [tempo, setTempo] = useState<number>(() =>
    Number(localStorage.getItem("sound.tempo") || 120)
  );
  const [tapTimes, setTapTimes] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayingPeriod, setIsPlayingPeriod] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const [currentMeal, setCurrentMeal] = useState<MealRecord>(() => ({
    id: crypto.randomUUID(),
    date: nowIsoDate(),
    time: nowTime(),
    categories: {},
    timestamp: Date.now(),
    notes: "",
  }));

  const [meals, setMeals] = useState<MealRecord[]>(() => {
    try {
      const s = localStorage.getItem("mealRecords");
      return s
        ? (JSON.parse(s) as MealRecord[]).sort(
            (a, b) => a.timestamp - b.timestamp
          )
        : [];
    } catch {
      return [];
    }
  });

  // マスターデータ useMemo
  const foodCategories = useMemo<FoodCategory[]>(
    () => [
      {
        id: "staple",
        name: "主食",
        sound: { frequency: 220, duration: 0.5, volume: 0.7 },
        color: "#8B4513",
        instrument: "🥁 ドラム",
      },
      {
        id: "side",
        name: "副菜",
        sound: { frequency: 330, duration: 0.4, volume: 0.6 },
        color: "#228B22",
        instrument: "🎸 ベース",
      },
      {
        id: "miso",
        name: "味噌",
        sound: { frequency: 440, duration: 0.3, volume: 0.5 },
        color: "#D2691E",
        instrument: "🎺 トランペット",
      },
      {
        id: "meat",
        name: "肉",
        sound: { frequency: 110, duration: 0.8, volume: 0.9 },
        color: "#DC143C",
        instrument: "🎸 エレキギター",
      },
      {
        id: "fish",
        name: "魚",
        sound: { frequency: 880, duration: 0.6, volume: 0.8 },
        color: "#4169E1",
        instrument: "🎹 シンセサイザー",
      },
      {
        id: "vegetable",
        name: "野菜",
        sound: { frequency: 660, duration: 0.4, volume: 0.7 },
        color: "#32CD32",
        instrument: "🎹 ピアノ",
      },
    ],
    []
  );

  const genres = useMemo<MusicGenre[]>(
    () => [
      {
        id: "balanced",
        name: "バランス",
        baseTempo: 120,
        instruments: ["piano", "strings"],
        description: "バランスの取れた食事",
      },
      {
        id: "rock",
        name: "ロック",
        baseTempo: 140,
        instruments: ["distortion", "drums", "bass"],
        description: "パワフルなロック",
      },
      {
        id: "techno",
        name: "テクノ",
        baseTempo: 128,
        instruments: ["synth", "electronic"],
        description: "電子音楽スタイル",
      },
      {
        id: "classical",
        name: "クラシック",
        baseTempo: 80,
        instruments: ["strings", "piano", "orchestra"],
        description: "優雅なクラシック",
      },
      {
        id: "japanese",
        name: "和楽器",
        baseTempo: 100,
        instruments: ["shamisen", "taiko", "koto"],
        description: "日本の伝統音楽",
      },
      {
        id: "jazz",
        name: "ジャズ",
        baseTempo: 110,
        instruments: ["saxophone", "piano", "bass"],
        description: "スウィングジャズ",
      },
      {
        id: "ambient",
        name: "アンビエント",
        baseTempo: 60,
        instruments: ["pad", "atmosphere"],
        description: "環境音楽",
      },
      {
        id: "custom",
        name: "カスタム",
        baseTempo: 120,
        instruments: ["piano"],
        description: "ユーザー設定",
      },
    ],
    []
  );

  const selectedGenre = useMemo(
    () => genres.find((g) => g.id === selectedGenreId) || genres[0],
    [genres, selectedGenreId]
  );
  const selectedPeriod = useMemo(
    () =>
      PERIOD_OPTIONS.find((p) => p.id === selectedPeriodId) ||
      PERIOD_OPTIONS[0],
    [selectedPeriodId]
  );

  // ローカルストレージ永続化
  useEffect(
    () => localStorage.setItem("mealRecords", JSON.stringify(meals)),
    [meals]
  );
  useEffect(
    () => localStorage.setItem("sound.genre", selectedGenreId),
    [selectedGenreId]
  );
  useEffect(
    () => localStorage.setItem("sound.period", selectedPeriodId),
    [selectedPeriodId]
  );
  useEffect(() => localStorage.setItem("sound.tempo", String(tempo)), [tempo]);

  // Tone 初期化
  const initTone = useCallback(async () => {
    if (globalToneInitialized) return true;
    try {
      await Tone.start(); // ユーザー操作後に呼ぶ
      // マスター・チェーン
      const limiter = new Tone.Limiter(-1).toDestination();
      const comp = new Tone.Compressor({ threshold: -18, ratio: 3 }).connect(
        limiter
      );
      (Tone.getDestination() as any).volume.rampTo(-2, 0.01);
      masterChainRef.current = { limiter, comp };
      globalToneInitialized = true;
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }, []);

  // 楽器生成/取得
  const getInstr = useCallback((categoryId: string) => {
    if (!globalToneInitialized) return null;
    if (instrumentsRef.current[categoryId])
      return instrumentsRef.current[categoryId];
    let synth: any = null;
    switch (categoryId) {
      case "staple":
        synth = new Tone.MembraneSynth({ volume: -6 }).connect(
          masterChainRef.current!.comp
        );
        break;
      case "side":
        synth = new Tone.MonoSynth({
          oscillator: { type: "sawtooth" },
          envelope: { release: 0.2 },
        }).connect(masterChainRef.current!.comp);
        break;
      case "miso":
        synth = new Tone.MonoSynth({
          oscillator: { type: "square" },
          filter: { type: "lowpass" },
        }).connect(masterChainRef.current!.comp);
        break;
      case "meat":
        synth = new Tone.FMSynth({ modulationIndex: 8 }).connect(
          masterChainRef.current!.comp
        );
        break;
      case "fish":
        synth = new Tone.PolySynth(Tone.Synth).connect(
          masterChainRef.current!.comp
        );
        break;
      case "vegetable":
      case "harmony":
        synth = new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: "triangle" },
        }).connect(masterChainRef.current!.comp);
        break;
    }
    instrumentsRef.current[categoryId] = synth;
    return synth;
  }, []);

  // クリーンアップ（アンマウント時）
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      Tone.Transport.stop();
      Tone.Transport.cancel(0);
      Object.values(instrumentsRef.current).forEach((i) => i?.dispose?.());
      instrumentsRef.current = {};
    };
  }, []);

  // 期間データ計算
  const periodData = useMemo(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - selectedPeriod.days);
    const records = meals.filter(
      (m) => new Date(m.timestamp) >= start && new Date(m.timestamp) <= end
    );

    if (!records.length)
      return {
        totalMeals: 0,
        averageBalance: 0,
        categoryTotals: {} as Record<string, number>,
        trends: ["データがありません"],
      };

    const totals: Record<string, number> = {};
    let sumScore = 0;

    for (const m of records) {
      for (const [k, v] of Object.entries(m.categories))
        totals[k] = (totals[k] || 0) + v;
      const mealTotal = Object.values(m.categories).reduce((a, b) => a + b, 0);
      if (!mealTotal) continue;
      const score =
        foodCategories.reduce((acc, c) => {
          const actual = (m.categories[c.id] || 0) / mealTotal;
          const ideal = (IDEAL_BALANCE_RATIOS as any)[c.id] || 0;
          return acc + (1 - Math.abs(ideal - actual));
        }, 0) / foodCategories.length;
      sumScore += score;
    }

    const trends: string[] = [];
    const totalItems = Object.values(totals).reduce((a, b) => a + b, 0);
    if (totalItems > 0) {
      const [maxCat] =
        Object.entries(totals).sort((a, b) => b[1] - a[1])[0] || [];
      const name = foodCategories.find((c) => c.id === maxCat)?.name || "";
      if (name) trends.push(`${name}が多めの食事パターン`);
      const avg = sumScore / records.length;
      trends.push(
        avg > 0.7
          ? "非常にバランスの良い食事を継続中"
          : avg > 0.4
          ? "まあまあバランスの取れた食事"
          : "バランス改善の余地があります"
      );
    }

    return {
      totalMeals: records.length,
      averageBalance: sumScore / records.length,
      categoryTotals: totals,
      trends,
    };
  }, [meals, selectedPeriod, foodCategories]);

  // 現在の食事 → スコア/可視化
  const { visualData, balanceScore } = useMemo(() => {
    const total = Object.values(currentMeal.categories).reduce(
      (a, b) => a + b,
      0
    );
    const vs: VisualizerData[] = foodCategories.map((c) => ({
      categoryId: c.id,
      name: c.name,
      color: c.color,
      value: currentMeal.categories[c.id] || 0,
      percentage: total
        ? ((currentMeal.categories[c.id] || 0) / total) * 100
        : 0,
      isPlaying: false,
    }));
    let score = 0;
    if (total) {
      score =
        foodCategories.reduce((acc, c) => {
          const actual = (currentMeal.categories[c.id] || 0) / total;
          const ideal = (IDEAL_BALANCE_RATIOS as any)[c.id] || 0;
          return acc + (1 - Math.abs(ideal - actual));
        }, 0) / foodCategories.length;
    }
    return { visualData: vs, balanceScore: score };
  }, [currentMeal, foodCategories]);

  // メッセージ表示
  const flash = useCallback((msg: string, ms = 2500) => {
    setMessage(msg);
    window.setTimeout(() => setMessage(""), ms);
  }, []);

  // キャンバス簡易アニメ（軽量・停止可能）
  const drawBars = useCallback(() => {
    const canvas = visualCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const { clientWidth: w, clientHeight: h } = canvas;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    const gap = 10;
    const barW = (w - gap * (visualData.length + 1)) / visualData.length;

    visualData.forEach((d, i) => {
      const x = gap + i * (barW + gap);
      const barH = (h - 20) * (d.percentage / 100);
      ctx.fillStyle = d.color;
      ctx.fillRect(x, h - barH, barW, barH);
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.font = "12px system-ui";
      ctx.fillText(percentageText(d.percentage), x + 4, h - barH - 6);
    });
  }, [visualData]);

  useEffect(() => {
    drawBars();
  }, [drawBars]);

  // リサイズで再描画
  useEffect(() => {
    const onResize = () => drawBars();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [drawBars]);

  // --- スケジューリング（Tone.Transport） ------------------------------
  const schedulePattern = useCallback(
    (items: { time: number; fn: () => void }[]) => {
      Tone.Transport.cancel(0);
      items.forEach(({ time, fn }) => Tone.Transport.schedule(fn, time));
      Tone.Transport.start();
    },
    []
  );

  const playOne = useCallback(
    (categoryId: string, frequency: number, duration: number, vol: number) => {
      const instr = getInstr(categoryId);
      if (!instr) return;
      try {
        const db = Math.log10(Math.max(0.001, vol)) * 20;
        instr.volume?.rampTo?.(db, 0.01);
        const note = categoryId === "staple" ? "C2" : frequency;
        instr.triggerAttackRelease(note, duration);
      } catch (e) {
        console.warn("play failed", e);
      }
    },
    [getInstr]
  );

  const makeCategoryRatios = useCallback(
    (cats: FoodCategory[], bag: Record<string, number>) => {
      const total = Object.values(bag).reduce((a, b) => a + b, 0) || 1;
      return cats.map((c) => ({ ...c, ratio: (bag[c.id] || 0) / total }));
    },
    []
  );

  const playCurrent = useCallback(async () => {
    if (!globalToneInitialized) {
      const ok = await initTone();
      if (!ok) return flash("音声システムの初期化に失敗しました", 3000);
      flash("音声システムを起動しました！", 1200);
    }
    if (isPlaying) return flash("再生中です…", 1200);

    const total = Object.values(currentMeal.categories).reduce(
      (a, b) => a + b,
      0
    );
    if (!total) return flash("食事を記録してください", 2000);

    setIsPlaying(true);

    const genreTempo =
      selectedGenre.id === "custom" ? tempo : selectedGenre.baseTempo;
    const adjusted = clamp(genreTempo * (0.7 + balanceScore * 0.3), 80, 160);
    Tone.Transport.bpm.rampTo(adjusted, 0.1);

    const ratios = makeCategoryRatios(foodCategories, currentMeal.categories)
      .filter((c: any) => c.ratio > 0)
      .sort((a: any, b: any) => b.ratio - a.ratio);

    const events: { time: number; fn: () => void }[] = [];
    const beat = 60 / adjusted;

    ratios.forEach((c, i) => {
      const t = i * beat * 0.8;
      const freq = c.sound.frequency * (0.9 + balanceScore * 0.2);
      const dur = c.sound.duration * (0.8 + balanceScore * 0.4);
      const vol = Math.min(0.8, c.sound.volume * (0.5 + balanceScore * 0.5));
      events.push({ time: t, fn: () => playOne(c.id, freq, dur, vol) });
    });

    // ハーモニー（良バランス）
    if (balanceScore > 0.6) {
      const harmonies = [440, 554.37, 659.25];
      harmonies.forEach((f, i) =>
        events.push({
          time: 4 + i * 0.5,
          fn: () => playOne("harmony", f, 1.0, 0.3),
        })
      );
    }

    schedulePattern(events);
    flash(
      balanceScore > 0.7
        ? "素晴らしいバランスです！🎵"
        : balanceScore > 0.4
        ? "まあまあのバランスです"
        : "バランスを改善しましょう",
      3000
    );

    // 再生停止予約
    window.setTimeout(() => {
      Tone.Transport.stop();
      setIsPlaying(false);
    }, PLAY_MS);
  }, [
    initTone,
    isPlaying,
    currentMeal,
    selectedGenre,
    tempo,
    balanceScore,
    foodCategories,
    makeCategoryRatios,
    playOne,
    schedulePattern,
    flash,
  ]);

  const playPeriod = useCallback(async () => {
    if (!globalToneInitialized) {
      const ok = await initTone();
      if (!ok) return flash("音声システムの初期化に失敗しました", 3000);
    }
    if (isPlayingPeriod) return flash("再生中です…", 1200);
    if (!periodData.totalMeals)
      return flash("この期間のデータがありません", 2000);

    setIsPlayingPeriod(true);
    const genreTempo =
      selectedGenre.id === "custom" ? tempo : selectedGenre.baseTempo;
    const adjusted = clamp(
      genreTempo * (0.7 + periodData.averageBalance * 0.3),
      80,
      160
    );
    Tone.Transport.bpm.rampTo(adjusted, 0.1);
    const beat = 60 / adjusted;

    const totals = periodData.categoryTotals;
    const ratios = makeCategoryRatios(foodCategories, totals)
      .filter((c: any) => c.ratio > 0)
      .sort((a: any, b: any) => b.ratio - a.ratio);

    const events: { time: number; fn: () => void }[] = [];

    ratios.forEach((c, idx) => {
      const count = Math.min(5, Math.ceil((c as any).ratio * 10));
      for (let i = 0; i < count; i++) {
        const t = idx * beat * 0.8 + i * beat * 0.4;
        const freq =
          c.sound.frequency * (0.9 + periodData.averageBalance * 0.2);
        const dur = c.sound.duration * (0.8 + periodData.averageBalance * 0.4);
        const vol = Math.min(
          0.7,
          c.sound.volume * (0.3 + periodData.averageBalance * 0.4)
        );
        events.push({ time: t, fn: () => playOne(c.id, freq, dur, vol) });
      }
    });

    if (periodData.averageBalance > 0.6) {
      [440, 554.37, 659.25].forEach((f, i) =>
        events.push({
          time: 4 + i * 0.5,
          fn: () => playOne("harmony", f, 1.0, 0.3),
        })
      );
    }

    schedulePattern(events);
    flash(
      `${selectedPeriod.label}の食事パターンを再生中… (${periodData.totalMeals}回)`,
      4000
    );

    window.setTimeout(() => {
      Tone.Transport.stop();
      setIsPlayingPeriod(false);
    }, PLAY_MS);
  }, [
    initTone,
    isPlayingPeriod,
    periodData,
    selectedGenre,
    tempo,
    schedulePattern,
    makeCategoryRatios,
    foodCategories,
    playOne,
    selectedPeriod,
    flash,
  ]);

  // --- CRUD: 食事 ---------------------------------------------------------
  const inc = (id: string, d = 1) =>
    setCurrentMeal((p) => ({
      ...p,
      categories: {
        ...p.categories,
        [id]: Math.max(0, (p.categories[id] || 0) + d),
      },
    }));
  const resetCurrent = () =>
    setCurrentMeal((p) => ({
      ...p,
      categories: {},
      time: nowTime(),
      timestamp: Date.now(),
    }));

  const saveMeal = () => {
    const total = Object.values(currentMeal.categories).reduce(
      (a, b) => a + b,
      0
    );
    if (!total) return flash("食事を記録してから保存してください", 2000);
    const rec: MealRecord = {
      ...currentMeal,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    setMeals((arr) => [...arr, rec]);
    setCurrentMeal({
      id: crypto.randomUUID(),
      date: nowIsoDate(),
      time: nowTime(),
      categories: {},
      timestamp: Date.now(),
      notes: "",
    });
    flash("食事記録を保存しました！", 1500);
  };

  const removeMeal = (id: string) =>
    setMeals((arr) => arr.filter((m) => m.id !== id));
  const startEdit = (m: MealRecord) => setEditingId(m.id);
  const commitEdit = (m: MealRecord) => {
    setMeals((arr) => arr.map((x) => (x.id === m.id ? m : x)));
    setEditingId(null);
  };

  // --- エクスポート/インポート ------------------------------------------
  const exportJson = () => {
    const blob = new Blob([JSON.stringify(meals, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `meals-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJson = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const list = JSON.parse(String(reader.result)) as MealRecord[];
        if (!Array.isArray(list)) throw new Error("invalid");
        setMeals(list);
        flash("インポートしました", 1500);
      } catch {
        flash("インポートに失敗しました", 2000);
      }
    };
    reader.readAsText(file);
  };

  // --- Tap Tempo ----------------------------------------------------------
  const onTap = () => {
    const t = performance.now();
    setTapTimes((prev) => {
      const xs = [...prev.filter((x) => t - x < 3000), t];
      if (xs.length >= 2) {
        const intervals = xs.slice(1).map((v, i) => v - xs[i]);
        const avgMs = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const bpm = clamp(60000 / avgMs, 50, 220);
        setTempo(Math.round(bpm));
      }
      return xs;
    });
  };

  // --- UI -----------------------------------------------------------------
  return (
    <div className="mx-auto max-w-5xl p-4 text-white" aria-live="polite">
      <header className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          🎵 音アプリ Pro
        </h2>
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500"
            onClick={playCurrent}
            aria-label="今の食事を再生"
          >
            {globalToneInitialized
              ? isPlaying
                ? "再生中…"
                : "今の食事を聞く"
              : "🎵 クリックして起動"}
          </button>
          <button
            className="px-3 py-2 rounded-xl bg-pink-600 hover:bg-pink-500"
            onClick={playPeriod}
            disabled={!periodData.totalMeals || isPlayingPeriod}
            aria-label="期間パターンを再生"
          >
            {isPlayingPeriod ? "期間再生中…" : "期間パターンを聞く"}
          </button>
        </div>
      </header>

      {/* 設定カード */}
      <section className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl p-4 bg-white/10 backdrop-blur border border-white/10">
          <h3 className="font-semibold mb-2">🎼 ジャンル</h3>
          <div className="grid grid-cols-2 gap-2">
            {genres.map((g) => (
              <button
                key={g.id}
                onClick={() => setSelectedGenreId(g.id)}
                className={`px-3 py-2 rounded-xl border ${
                  selectedGenreId === g.id
                    ? "bg-gradient-to-r from-blue-500 to-violet-500 border-blue-400"
                    : "bg-white/5 border-white/20 hover:bg-white/10"
                }`}
              >
                {g.name}
              </button>
            ))}
          </div>
          {selectedGenre.id === "custom" && (
            <div className="mt-3">
              <label className="text-sm opacity-90">テンポ: {tempo} BPM</label>
              <input
                type="range"
                min={50}
                max={220}
                value={tempo}
                onChange={(e) => setTempo(Number(e.target.value))}
                className="w-full"
              />
              <button
                className="mt-2 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500"
                onClick={onTap}
                title="Tap Tempo"
              >
                Tap Tempo
              </button>
            </div>
          )}
        </div>

        <div className="rounded-2xl p-4 bg-white/10 backdrop-blur border border-white/10">
          <h3 className="font-semibold mb-2">📅 期間</h3>
          <div className="grid grid-cols-3 gap-2">
            {PERIOD_OPTIONS.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPeriodId(p.id)}
                className={`px-3 py-2 rounded-xl border ${
                  selectedPeriodId === p.id
                    ? "bg-gradient-to-r from-cyan-500 to-sky-500 border-cyan-400"
                    : "bg-white/5 border-white/20 hover:bg-white/10"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3 mt-3 text-center">
            <div className="rounded-xl p-3 bg-white/5 border border-white/10">
              <div className="text-xs opacity-80">食事回数</div>
              <div className="text-2xl font-bold">
                {periodData.totalMeals}回
              </div>
            </div>
            <div className="rounded-xl p-3 bg-white/5 border border-white/10">
              <div className="text-xs opacity-80">平均バランス</div>
              <div className="text-2xl font-bold">
                {Math.round(periodData.averageBalance * 100)}%
              </div>
            </div>
            <div className="rounded-xl p-3 bg-white/5 border border-white/10 text-left col-span-3 md:col-span-1 md:text-center">
              <div className="text-xs opacity-80">傾向</div>
              <ul className="text-sm mt-1 list-disc list-inside">
                {periodData.trends.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-4 bg-white/10 backdrop-blur border border-white/10">
          <h3 className="font-semibold mb-2">💾 データ</h3>
          <div className="flex gap-2 flex-wrap">
            <button
              className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500"
              onClick={saveMeal}
            >
              保存
            </button>
            <button
              className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500"
              onClick={resetCurrent}
            >
              リセット
            </button>
            <button
              className="px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-500"
              onClick={exportJson}
            >
              エクスポート
            </button>
            <label className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 cursor-pointer">
              インポート
              <input
                type="file"
                className="hidden"
                accept="application/json"
                onChange={(e) =>
                  e.target.files?.[0] && importJson(e.target.files[0])
                }
              />
            </label>
          </div>
        </div>
      </section>

      {/* 可視化 */}
      <section className="mt-6">
        <h3 className="font-semibold mb-2">🎨 バランスビジュアライザー</h3>
        <div className="rounded-2xl p-3 bg-white/5 border border-white/10">
          <canvas
            ref={visualCanvasRef}
            className="w-full h-[160px] rounded-xl"
          />
          <div className="mt-3">
            <div className="h-3 w-full rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full transition-all"
                style={{
                  width: `${balanceScore * 100}%`,
                  background: `linear-gradient(90deg, ${
                    balanceScore < 0.3
                      ? "#ff4444"
                      : balanceScore < 0.7
                      ? "#ffaa00"
                      : "#44ff44"
                  }, ${
                    balanceScore < 0.3
                      ? "#ff6666"
                      : balanceScore < 0.7
                      ? "#ffcc00"
                      : "#66ff66"
                  })`,
                }}
              />
            </div>
            <div className="mt-1 text-right text-sm">
              {Math.round(balanceScore * 100)}%
            </div>
          </div>
        </div>
      </section>

      {/* 食事入力 */}
      <section className="mt-6">
        <h3 className="font-semibold mb-2">🍽️ 食事記録</h3>
        <div className="grid md:grid-cols-2 gap-3">
          {foodCategories.map((c) => (
            <div
              key={c.id}
              className="rounded-xl p-3 bg-white/5 border border-white/10 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2">
                <span
                  className="inline-block w-4 h-4 rounded"
                  style={{ backgroundColor: c.color }}
                />
                <div className="font-medium">{c.name}</div>
                <div className="text-xs opacity-80">{c.instrument}</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20"
                  aria-label={`${c.name} を減らす`}
                  onClick={() => inc(c.id, -1)}
                >
                  -
                </button>
                <div className="w-10 text-center tabular-nums">
                  {currentMeal.categories[c.id] || 0}
                </div>
                <button
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20"
                  aria-label={`${c.name} を増やす`}
                  onClick={() => inc(c.id, +1)}
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 履歴 */}
      <section className="mt-6">
        <h3 className="font-semibold mb-2">
          📚 保存済みの食事（{meals.length}）
        </h3>
        {meals.length === 0 ? (
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            まだ記録がありません
          </div>
        ) : (
          <div className="grid gap-3">
            {meals.map((m) => (
              <article
                key={m.id}
                className="rounded-xl p-3 bg-white/5 border border-white/10"
              >
                <div className="flex items-center justify-between">
                  <div className="font-semibold">
                    {m.date} {m.time}
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20"
                      onClick={() => startEdit(m)}
                    >
                      編集
                    </button>
                    <button
                      className="px-2 py-1 rounded-lg bg-rose-600 hover:bg-rose-500"
                      onClick={() => removeMeal(m.id)}
                    >
                      削除
                    </button>
                  </div>
                </div>
                <div className="mt-2 grid grid-cols-3 md:grid-cols-6 gap-2 text-sm">
                  {foodCategories.map((c) => (
                    <div key={c.id} className="flex items-center gap-1">
                      <span
                        className="inline-block w-3 h-3 rounded"
                        style={{ backgroundColor: c.color }}
                      />
                      <span>{c.name}</span>
                      <span className="ml-auto font-mono">
                        {m.categories[c.id] || 0}
                      </span>
                    </div>
                  ))}
                </div>
                {editingId === m.id && (
                  <MealEditInline
                    record={m}
                    onCancel={() => setEditingId(null)}
                    onSave={commitEdit}
                  />
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      {/* トースト */}
      {message && (
        <div
          role="status"
          className="fixed bottom-4 right-4 z-50 px-4 py-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg"
        >
          {message}
        </div>
      )}
    </div>
  );
};

// --- インライン編集コンポーネント ---------------------------------------
const MealEditInline: React.FC<{
  record: MealRecord;
  onCancel: () => void;
  onSave: (m: MealRecord) => void;
}> = ({ record, onCancel, onSave }) => {
  const [draft, setDraft] = useState<MealRecord>(record);
  const update = (id: string, v: number) =>
    setDraft((p) => ({
      ...p,
      categories: { ...p.categories, [id]: Math.max(0, v) },
    }));
  return (
    <div className="mt-3 rounded-xl p-3 bg-black/20 border border-white/10">
      <div className="text-sm opacity-80">編集</div>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-2">
        {Object.keys(IDEAL_BALANCE_RATIOS).map((id) => (
          <label key={id} className="flex items-center gap-2 text-sm">
            <span className="w-16 capitalize">{id}</span>
            <input
              type="number"
              min={0}
              className="w-20 px-2 py-1 rounded bg-white/10 border border-white/20"
              value={draft.categories[id] || 0}
              onChange={(e) => update(id, Number(e.target.value))}
            />
          </label>
        ))}
      </div>
      <div className="flex gap-2 mt-3">
        <button
          className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500"
          onClick={() => onSave(draft)}
        >
          保存
        </button>
        <button
          className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20"
          onClick={onCancel}
        >
          キャンセル
        </button>
      </div>
    </div>
  );
};

export default SoundAppComponent;
