import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  Guitar,
  Music,
  Calendar as CalendarIcon,
  Clock,
  BarChart2,
  Layers,
  Award,
  Plus,
  Sparkles,
  Trash2,
  Edit,
  Crown,
  ExternalLink,
} from 'lucide-react';
import {
  fetchGuitarPractices,
  addGuitarPractice,
  deleteGuitarPractice,
  addMockGuitarPractices,
} from '@/store/guitarPracticeSlice';

// ギター練習のタイプ定義
export interface GuitarPractice {
  _id: string;
  date: string; // ISOフォーマットの日付文字列
  duration: number; // 練習時間（分単位）
  technique: string; // 練習した技術（コード、スケール、アルペジオなど）
  song?: string; // 練習した曲名（任意）
  bpm?: number; // 練習時のテンポ（任意）
  difficulty: number; // 難易度 1-5
  notes?: string; // メモ（任意）
  satisfaction: number; // 満足度 1-5
  isMilestone: boolean; // マイルストーン（重要な進歩）かどうか
  createdAt: string;
}

// フォーム検証スキーマ
const practiceFormSchema = z.object({
  date: z.date({
    required_error: '練習日を選択してください',
  }),
  duration: z
    .number({
      required_error: '練習時間を入力してください',
      invalid_type_error: '練習時間は数値で入力してください',
    })
    .min(1, '1分以上の練習時間を入力してください'),
  technique: z.string({
    required_error: '練習内容を選択してください',
  }),
  song: z.string().optional(),
  bpm: z.number().optional(),
  difficulty: z
    .number({
      required_error: '難易度を選択してください',
    })
    .min(1)
    .max(5),
  notes: z.string().optional(),
  satisfaction: z
    .number({
      required_error: '満足度を選択してください',
    })
    .min(1)
    .max(5),
  isMilestone: z.boolean(), // .default(false)を削除して、明示的にbooleanにする
});

// 日付検証用のヘルパー関数を追加
const isValidDate = (dateString: any): boolean => {
  if (!dateString) return false;
  const date = new Date(dateString);
  return !isNaN(date.getTime()) && date.getTime() > 0;
};

const formatSafeDate = (dateString: any, formatString: string = 'yyyy年MM月dd日'): string => {
  if (!isValidDate(dateString)) {
    console.warn('Invalid date detected:', dateString);
    return '日付不明';
  }

  try {
    return format(new Date(dateString), formatString, { locale: ja });
  } catch (error) {
    console.error('Date formatting error:', error, 'Date value:', dateString);
    return '日付エラー';
  }
};

// 新しい練習記録を作成するコンポーネント
const NewPracticeForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const dispatch = useDispatch<AppDispatch>();

  const form = useForm<z.infer<typeof practiceFormSchema>>({
    resolver: zodResolver(practiceFormSchema),
    defaultValues: {
      date: new Date(),
      duration: 30,
      technique: '',
      song: '',
      bpm: 80,
      difficulty: 3,
      notes: '',
      satisfaction: 3,
      isMilestone: false,
    },
  });

  const onSubmit = async (values: z.infer<typeof practiceFormSchema>) => {
    try {
      // 日付をISOフォーマットに変換
      const dateString = values.date.toISOString();

      await dispatch(
        addGuitarPractice({
          date: dateString,
          duration: values.duration,
          technique: values.technique,
          song: values.song,
          bpm: values.bpm,
          difficulty: values.difficulty,
          notes: values.notes,
          satisfaction: values.satisfaction,
          isMilestone: values.isMilestone,
        })
      );

      form.reset();
      onSuccess();
    } catch (error) {
      console.error('練習記録の保存に失敗しました:', error);
    }
  };

  const techniqueOptions = [
    { value: 'コード', label: 'コード' },
    { value: 'スケール', label: 'スケール' },
    { value: 'アルペジオ', label: 'アルペジオ' },
    { value: 'ピッキング', label: 'ピッキング' },
    { value: 'フィンガリング', label: 'フィンガリング' },
    { value: 'リズム', label: 'リズム' },
    { value: 'ソロ', label: 'ソロ' },
    { value: '曲の練習', label: '曲の練習' },
    { value: '耳コピ', label: '耳コピ' },
    { value: '作曲', label: '作曲' },
    { value: '即興', label: '即興' },
    { value: 'その他', label: 'その他' },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>練習日</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'w-full pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? formatSafeDate(field.value) : <span>日付を選択</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>練習時間（分）</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="technique"
            render={({ field }) => (
              <FormItem>
                <FormLabel>練習内容</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="練習した内容を選択" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {techniqueOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="song"
            render={({ field }) => (
              <FormItem>
                <FormLabel>曲名（任意）</FormLabel>
                <FormControl>
                  <Input placeholder="練習した曲名" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bpm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>BPM（任意）</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="練習時のテンポ"
                    {...field}
                    onChange={(e) =>
                      field.onChange(e.target.value ? parseInt(e.target.value) : undefined)
                    }
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="difficulty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>難易度 ({field.value})</FormLabel>
                <FormControl>
                  <Slider
                    min={1}
                    max={5}
                    step={1}
                    defaultValue={[field.value]}
                    onValueChange={(value) => field.onChange(value[0])}
                    className="pt-2"
                  />
                </FormControl>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>簡単</span>
                  <span>難しい</span>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="satisfaction"
            render={({ field }) => (
              <FormItem>
                <FormLabel>満足度 ({field.value})</FormLabel>
                <FormControl>
                  <Slider
                    min={1}
                    max={5}
                    step={1}
                    defaultValue={[field.value]}
                    onValueChange={(value) => field.onChange(value[0])}
                    className="pt-2"
                  />
                </FormControl>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>不満</span>
                  <span>大満足</span>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>メモ（任意）</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="練習の感想や気づきなど"
                    className="min-h-[100px]"
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isMilestone"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>マイルストーン</FormLabel>
                  <FormDescription>
                    特に重要な練習や進歩があった場合はチェックしてください
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full">
          練習記録を保存
        </Button>
      </form>
    </Form>
  );
};

// 練習記録の詳細を表示するコンポーネント
const PracticeDetails = ({ practice }: { practice: GuitarPractice }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-medium text-muted-foreground">練習日</h4>
          <p>{formatSafeDate(practice.date)}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-muted-foreground">練習時間</h4>
          <p>{practice.duration}分</p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-muted-foreground">練習内容</h4>
          <p>{practice.technique}</p>
        </div>
        {practice.song && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">曲名</h4>
            <p>{practice.song}</p>
          </div>
        )}
        {practice.bpm && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">BPM</h4>
            <p>{practice.bpm}</p>
          </div>
        )}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground">難易度</h4>
          <div className="flex items-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full mr-1 ${
                  i < practice.difficulty ? 'bg-primary' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-sm font-medium text-muted-foreground">満足度</h4>
          <div className="flex items-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full mr-1 ${
                  i < practice.satisfaction ? 'bg-green-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {practice.notes && (
        <div>
          <h4 className="text-sm font-medium text-muted-foreground">メモ</h4>
          <p className="whitespace-pre-wrap">{practice.notes}</p>
        </div>
      )}

      {practice.isMilestone && (
        <Badge className="bg-amber-100 text-amber-800 border-amber-200">
          <Award className="h-3 w-3 mr-1" />
          マイルストーン
        </Badge>
      )}
    </div>
  );
};

// 練習統計の視覚化コンポーネント
const PracticeStats = ({ practices }: { practices: GuitarPractice[] }) => {
  // 総練習時間（分）
  const totalPracticeTime = practices.reduce((total, practice) => total + practice.duration, 0);

  // 練習日数
  const uniqueDatesSet = new Set(practices.map((practice) => practice.date.substring(0, 10)));
  const totalPracticeDays = uniqueDatesSet.size;

  // 最近7日間の練習日数
  const last7Days = new Array(7).fill(0).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().substring(0, 10);
  });

  const practicesByDate = practices.reduce(
    (acc, practice) => {
      const dateStr = practice.date.substring(0, 10);
      if (!acc[dateStr]) {
        acc[dateStr] = [];
      }
      acc[dateStr].push(practice);
      return acc;
    },
    {} as Record<string, GuitarPractice[]>
  );

  const last7DaysPractice = last7Days.map((date) => {
    return {
      date,
      hasPractice: !!practicesByDate[date],
      practices: practicesByDate[date] || [],
    };
  });

  // 練習した技術のカウント
  const techniqueCount: Record<string, number> = {};
  practices.forEach((practice) => {
    if (!techniqueCount[practice.technique]) {
      techniqueCount[practice.technique] = 0;
    }
    techniqueCount[practice.technique] += 1;
  });

  const topTechniques = Object.entries(techniqueCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // 満足度の平均
  const avgSatisfaction =
    practices.length > 0
      ? Math.round(
          (practices.reduce((sum, p) => sum + p.satisfaction, 0) / practices.length) * 10
        ) / 10
      : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">総練習時間</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.floor(totalPracticeTime / 60)}時間 {totalPracticeTime % 60}分
            </div>
            <p className="text-xs text-muted-foreground">{practices.length}回の練習記録</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">練習日数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPracticeDays}日</div>
            <p className="text-xs text-muted-foreground">
              平均: {practices.length > 0 ? Math.round(totalPracticeTime / totalPracticeDays) : 0}
              分/日
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">平均満足度</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgSatisfaction} / 5</div>
            <div className="flex mt-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-5 h-2 mr-1 rounded-sm ${
                    i < Math.floor(avgSatisfaction) ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">マイルストーン</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {practices.filter((p) => p.isMilestone).length}
            </div>
            <p className="text-xs text-muted-foreground">特に意義のある練習</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">最近の練習</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between">
              {last7DaysPractice
                .slice()
                .reverse()
                .map((day, i) => {
                  const date = new Date(day.date);
                  const totalMinutes = day.practices.reduce((total, p) => total + p.duration, 0);

                  return (
                    <div key={i} className="flex flex-col items-center">
                      <div className="text-xs text-muted-foreground">
                        {formatSafeDate(date, 'E')}
                      </div>
                      <div
                        className={`w-8 h-8 flex items-center justify-center rounded-full mt-1 ${
                          day.hasPractice ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {date.getDate()}
                      </div>
                      <div className="text-xs mt-1">
                        {totalMinutes > 0 ? `${totalMinutes}分` : '-'}
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">練習内容の分布</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topTechniques.map(([technique, count], i) => (
                <div key={i}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">{technique}</span>
                    <span className="text-sm text-muted-foreground">
                      {count}回 ({Math.round((count / practices.length) * 100)}
                      %)
                    </span>
                  </div>
                  <Progress value={(count / practices.length) * 100} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// メインのギター練習ページコンポーネント
const GuitarPracticePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const practices = useSelector((state: RootState) => state.guitarPractice.practices);
  const status = useSelector((state: RootState) => state.guitarPractice.status);
  const error = useSelector((state: RootState) => state.guitarPractice.error);
  const isPremium = useSelector((state: RootState) => state.user?.hasActiveSubscription) || false;

  const [activeTab, setActiveTab] = useState<string>('log');
  const [selectedPractice, setSelectedPractice] = useState<GuitarPractice | null>(null);
  const [showMotivationTip, setShowMotivationTip] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // === デイリープラン ===
  type PracticePlanItem = {
    id: string;
    title: string;
    technique: string;
    minutes: number;
    bpm?: number;
    done: boolean;
  };

  const [todayPlan, setTodayPlan] = useState<PracticePlanItem[]>(() => {
    try {
      const saved = localStorage.getItem('guitar_today_plan');
      return saved ? (JSON.parse(saved) as PracticePlanItem[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('guitar_today_plan', JSON.stringify(todayPlan));
  }, [todayPlan]);

  // === メトロノーム・コーチ（技術別推奨BPMの学習） ===
  const [coachBpm, setCoachBpm] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('guitar_bpm_coach');
      return saved ? (JSON.parse(saved) as Record<string, number>) : {};
    } catch {
      return {};
    }
  });

  const persistCoach = (next: Record<string, number>) => {
    setCoachBpm(next);
    try {
      localStorage.setItem('guitar_bpm_coach', JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const adjustBpm = (technique: string, delta: number) => {
    const current =
      coachBpm[technique] ??
      (technique === 'スケール'
        ? 70
        : technique === 'ピッキング'
          ? 80
          : technique === '曲の練習'
            ? 90
            : 70);
    const nextVal = Math.max(40, Math.min(240, current + delta));
    persistCoach({ ...coachBpm, [technique]: nextVal });
    // プラン内の同技術項目にも反映
    setTodayPlan((prev) =>
      prev.map((p) => (p.technique === technique ? { ...p, bpm: nextVal } : p))
    );
  };

  const generateDailyPlan = (totalMinutes: number = 60): PracticePlanItem[] => {
    const blocks: Array<[string, number]> = [
      ['ウォームアップ', Math.max(10, Math.floor(totalMinutes * 0.15))],
      ['スケール', Math.floor(totalMinutes * 0.2)],
      ['ピッキング', Math.floor(totalMinutes * 0.15)],
      ['コード', Math.floor(totalMinutes * 0.15)],
      ['曲の練習', Math.floor(totalMinutes * 0.25)],
      ['耳コピ/即興', 0],
    ];
    const allocated = blocks.slice(0, blocks.length - 1).reduce((s, [, m]) => s + m, 0);
    blocks[blocks.length - 1][1] = Math.max(5, totalMinutes - allocated);

    const newId = () => `plan_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const bpm = (label: string) => {
      const learned = coachBpm[label];
      if (learned) return learned;
      return label === 'スケール'
        ? 70
        : label === 'ピッキング'
          ? 80
          : label === '曲の練習'
            ? 90
            : undefined;
    };
    return blocks.map(([label, minutes]) => ({
      id: newId(),
      title: `${label}（メトロノーム推奨）`,
      technique: label,
      minutes,
      bpm: bpm(label),
      done: false,
    }));
  };

  const startNewPlan = (minutes: number) => {
    setTodayPlan(generateDailyPlan(minutes));
    setActiveTab('plan');
  };

  const togglePlanItem = (id: string) =>
    setTodayPlan((prev) => prev.map((p) => (p.id === id ? { ...p, done: !p.done } : p)));

  const commitDoneItemsToLog = async () => {
    const done = todayPlan.filter((i) => i.done);
    for (const item of done) {
      await dispatch(
        addGuitarPractice({
          date: new Date().toISOString(),
          duration: item.minutes,
          technique: item.technique,
          song: item.technique === '曲の練習' ? 'セットリスト/課題曲' : '',
          bpm: item.bpm,
          difficulty: 3,
          notes: 'デイリープランから自動記録',
          satisfaction: 3,
          isMilestone: false,
        })
      );
      // 達成時は推奨BPMを微増して次回難易度を最適化
      if (item.bpm || coachBpm[item.technique]) {
        adjustBpm(item.technique, 5);
      }
    }
    setTodayPlan((prev) => prev.filter((i) => !i.done));
  };

  // === ロードマップ ===
  type RoadmapTask = {
    id: string;
    label: string;
    technique: string;
    minutes: number;
    completed: boolean;
  };
  type RoadmapLevel = {
    id: 'beginner' | 'intermediate' | 'advanced' | 'pro';
    title: string;
    tasks: RoadmapTask[];
  };

  const defaultRoadmap: RoadmapLevel[] = [
    {
      id: 'beginner',
      title: 'Beginner 基礎固め',
      tasks: [
        {
          id: 'b1',
          label: 'C/G/D/Am 基本コード',
          technique: 'コード',
          minutes: 120,
          completed: false,
        },
        {
          id: 'b2',
          label: 'メトロノーム 60-80bpm 8分音符',
          technique: 'リズム',
          minutes: 90,
          completed: false,
        },
        {
          id: 'b3',
          label: 'ペンタトニック 5ポジション基礎',
          technique: 'スケール',
          minutes: 120,
          completed: false,
        },
      ],
    },
    {
      id: 'intermediate',
      title: 'Intermediate 応用力',
      tasks: [
        {
          id: 'i1',
          label: 'オルタネイト/エコノミー',
          technique: 'ピッキング',
          minutes: 120,
          completed: false,
        },
        {
          id: 'i2',
          label: 'バレーコード移行',
          technique: 'コード',
          minutes: 120,
          completed: false,
        },
        {
          id: 'i3',
          label: '12小節ブルース即興',
          technique: '即興',
          minutes: 120,
          completed: false,
        },
      ],
    },
    {
      id: 'advanced',
      title: 'Advanced 実践/表現',
      tasks: [
        {
          id: 'a1',
          label: '速弾き基礎 120→160bpm',
          technique: 'ピッキング',
          minutes: 150,
          completed: false,
        },
        {
          id: 'a2',
          label: 'コードトーン・アウトライン',
          technique: 'スケール',
          minutes: 150,
          completed: false,
        },
        {
          id: 'a3',
          label: '3曲レパートリー仕上げ',
          technique: '曲の練習',
          minutes: 240,
          completed: false,
        },
      ],
    },
    {
      id: 'pro',
      title: 'Pro 現場対応/創作',
      tasks: [
        {
          id: 'p1',
          label: 'クリック/バンドでの安定演奏',
          technique: 'リズム',
          minutes: 180,
          completed: false,
        },
        {
          id: 'p2',
          label: '週1オーディオ録音&自己レビュー',
          technique: '録音',
          minutes: 60,
          completed: false,
        },
        {
          id: 'p3',
          label: 'オリジナル1曲アレンジ/公開',
          technique: '作曲',
          minutes: 240,
          completed: false,
        },
      ],
    },
  ];

  const [roadmap, setRoadmap] = useState<RoadmapLevel[]>(() => {
    try {
      const saved = localStorage.getItem('guitar_roadmap');
      return saved ? (JSON.parse(saved) as RoadmapLevel[]) : defaultRoadmap;
    } catch {
      return defaultRoadmap;
    }
  });

  useEffect(() => {
    localStorage.setItem('guitar_roadmap', JSON.stringify(roadmap));
  }, [roadmap]);

  const toggleRoadmapTask = (levelId: RoadmapLevel['id'], taskId: string) => {
    setRoadmap((prev) =>
      prev.map((lvl) =>
        lvl.id !== levelId
          ? lvl
          : {
              ...lvl,
              tasks: lvl.tasks.map((t) =>
                t.id === taskId ? { ...t, completed: !t.completed } : t
              ),
            }
      )
    );
  };

  // === 週次ノルマと不足分の自動ブレンド ===
  const weeklyGoals: Record<string, number> = {
    スケール: 120,
    ピッキング: 120,
    コード: 90,
    曲の練習: 180,
    '耳コピ/即興': 60,
  };

  const last7DaysMinutesByTechnique = useMemo(() => {
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 6);
    const acc: Record<string, number> = {};
    for (const p of practices) {
      const d = new Date(p.date);
      if (isNaN(d.getTime())) continue;
      if (d >= new Date(sevenDaysAgo.toDateString())) {
        acc[p.technique] = (acc[p.technique] ?? 0) + p.duration;
      }
    }
    return acc;
  }, [practices]);

  const deficits = useMemo(() => {
    const res: Array<{ technique: string; deficit: number }> = [];
    for (const [tech, goal] of Object.entries(weeklyGoals)) {
      const done = last7DaysMinutesByTechnique[tech] ?? 0;
      const def = Math.max(0, goal - done);
      if (def > 0) res.push({ technique: tech, deficit: def });
    }
    return res.sort((a, b) => b.deficit - a.deficit);
  }, [last7DaysMinutesByTechnique]);

  const addDeficitsToPlan = () => {
    if (deficits.length === 0) return;
    const newItems: PracticePlanItem[] = deficits.flatMap(({ technique, deficit }) => {
      const chunk = Math.max(10, Math.min(30, deficit));
      const n = Math.ceil(deficit / chunk);
      const arr: PracticePlanItem[] = [];
      for (let i = 0; i < n; i++) {
        arr.push({
          id: `def_${technique}_${Date.now()}_${i}`,
          title: `${technique}（不足分対応）`,
          technique,
          minutes: i === n - 1 ? Math.max(10, deficit - chunk * (n - 1)) : chunk,
          bpm: coachBpm[technique],
          done: false,
        });
      }
      return arr;
    });
    setTodayPlan((prev) => [...prev, ...newItems]);
    setActiveTab('plan');
  };

  // === 連続練習ストリーク ===
  const streakDays = useMemo(() => {
    const dates = new Set(
      practices
        .filter((p) => isValidDate(p.date))
        .map((p) => new Date(p.date).toISOString().substring(0, 10))
    );
    let count = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().substring(0, 10);
      if (dates.has(key)) count += 1;
      else break;
    }
    return count;
  }, [practices]);

  // === 週次レビュー自動要約 ===
  const weeklyReview = useMemo(() => {
    const total = Object.values(last7DaysMinutesByTechnique).reduce((s, v) => s + v, 0);
    const most = Object.entries(last7DaysMinutesByTechnique).sort((a, b) => b[1] - a[1])[0];
    const weakest = deficits[0];
    const lines: string[] = [];
    lines.push(`合計 ${Math.floor(total / 60)}時間 ${total % 60}分`);
    if (most) lines.push(`最も練習: ${most[0]}（${most[1]}分）`);
    if (weakest) lines.push(`不足: ${weakest.technique}（残り${weakest.deficit}分）`);
    return lines;
  }, [last7DaysMinutesByTechnique, deficits]);

  // 練習記録のモチベーションヒント
  const motivationTips = [
    '毎日少しずつの練習が大きな進歩につながります。15分でも継続が大切です。',
    '練習を記録することで自分の成長を実感できます。達成感がモチベーションを高めます。',
    '難しいフレーズは遅いテンポから始め、少しずつBPMを上げていくと効果的です。',
    'ギターは音楽を楽しむための道具です。時には好きな曲を演奏する時間も大切にしましょう。',
    '技術的な練習と曲の練習をバランスよく組み合わせると、モチベーションを保ちやすくなります。',
  ];

  // 決定論的なヒント選択（日付ベース）
  const tipIndex = new Date().getDate() % motivationTips.length;
  const dailyTip = motivationTips[tipIndex];

  useEffect(() => {
    if (status === 'idle') {
      // 開発環境では、APIが未実装の場合はモックデータを使用
      if (process.env.NODE_ENV === 'development') {
        // バックエンドAPIが実装されていない場合、モックデータを使用
        dispatch(addMockGuitarPractices());
      } else {
        // 本番環境ではAPIを使用
        dispatch(fetchGuitarPractices());
      }
    }
  }, [status, dispatch]);

  // sortedPracticesの処理も安全にする
  const sortedPractices = useMemo(() => {
    return [...practices]
      .filter((practice) => isValidDate(practice.date)) // 無効な日付をフィルタリング
      .sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB.getTime() - dateA.getTime();
      });
  }, [practices]);

  // データ取得中の表示
  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">練習データを読み込んでいます...</p>
        </div>
      </div>
    );
  }

  // エラー表示
  if (status === 'failed') {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">エラーが発生しました</div>
          <p className="text-gray-600">{error}</p>
          <Button onClick={() => dispatch(fetchGuitarPractices())} className="mt-4">
            再読み込み
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">ギター練習記録</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          練習内容を記録して、あなたのギタースキルの成長を可視化しましょう
        </p>
      </div>

      {/* モチベーションボックス */}
      {showMotivationTip && (
        <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-lg p-4 relative">
          <button
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            onClick={() => setShowMotivationTip(false)}
          >
            &times;
          </button>
          <div className="flex items-start">
            <div className="bg-blue-100 rounded-full p-2 mr-4">
              <Sparkles className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-blue-800 mb-1">今日の練習モチベーション</h3>
              <p className="text-blue-700">{dailyTip}</p>
            </div>
          </div>
        </div>
      )}

      {/* 上達HUD: ストリーク + 週次レビュー */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">上達HUD</CardTitle>
          <CardDescription>連続練習と今週の要点</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="text-sm">
              <span className="font-medium">現在のストリーク:</span> {streakDays} 日
            </div>
            <ul className="list-disc pl-5 text-sm text-muted-foreground">
              {weeklyReview.map((l, i) => (
                <li key={i}>{l}</li>
              ))}
            </ul>
            {deficits.length > 0 && (
              <div className="shrink-0">
                <Button variant="secondary" onClick={addDeficitsToPlan}>
                  不足分をプランに追加
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* メインのタブナビゲーション */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-8">
        <TabsList className="mb-4 flex flex-wrap justify-center">
          <TabsTrigger value="log" className="flex items-center gap-1">
            <Guitar className="h-4 w-4" />
            <span>練習記録</span>
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-1">
            <BarChart2 className="h-4 w-4" />
            <span>統計</span>
          </TabsTrigger>
          <TabsTrigger value="milestones" className="flex items-center gap-1">
            <Award className="h-4 w-4" />
            <span>マイルストーン</span>
          </TabsTrigger>
          <TabsTrigger value="plan" className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>デイリープラン</span>
          </TabsTrigger>
          <TabsTrigger value="roadmap" className="flex items-center gap-1">
            <Layers className="h-4 w-4" />
            <span>ロードマップ</span>
          </TabsTrigger>
          <TabsTrigger value="resources" className="flex items-center gap-1">
            <Music className="h-4 w-4" />
            <span>リソース</span>
          </TabsTrigger>
        </TabsList>

        {/* 練習記録タブ */}
        <TabsContent value="log">
          <Card className="w-full">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Guitar className="h-5 w-5 text-primary" />
                    練習記録
                  </CardTitle>
                  <CardDescription>あなたのギター練習の記録を管理します</CardDescription>
                </div>

                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      練習を記録
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>新しい練習を記録</DialogTitle>
                      <DialogDescription>
                        今日の練習内容を記録して、あなたの上達を追跡しましょう
                      </DialogDescription>
                    </DialogHeader>
                    <NewPracticeForm onSuccess={() => setIsAddDialogOpen(false)} />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {practices.length === 0 ? (
                <div className="text-center p-8">
                  <Guitar className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium mb-2">まだ練習記録がありません</h3>
                  <p className="text-gray-500 mb-4">練習を記録して、あなたの上達を追跡しましょう</p>
                  <Button onClick={() => setIsAddDialogOpen(true)}>最初の練習を記録</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedPractices.map((practice) => (
                    <Card key={practice._id} className="overflow-hidden">
                      <div
                        className={`${practice.isMilestone ? 'border-l-4 border-amber-400' : ''}`}
                      >
                        <div className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium">{practice.technique}</h3>
                                {practice.song && <Badge variant="outline">{practice.song}</Badge>}
                                {practice.isMilestone && (
                                  <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                                    <Award className="h-3 w-3 mr-1" />
                                    マイルストーン
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground mt-1">
                                {formatSafeDate(practice.date)} | {practice.duration}分間
                                {practice.bpm && ` | ${practice.bpm} BPM`}
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedPractice(practice)}
                              >
                                詳細
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => dispatch(deleteGuitarPractice(practice._id))}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="flex items-center mt-2">
                            <div className="mr-4">
                              <Label className="text-xs">難易度</Label>
                              <div className="flex mt-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <div
                                    key={i}
                                    className={`w-4 h-4 rounded-full mr-1 ${
                                      i < practice.difficulty ? 'bg-primary' : 'bg-gray-200'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <div>
                              <Label className="text-xs">満足度</Label>
                              <div className="flex mt-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <div
                                    key={i}
                                    className={`w-4 h-4 rounded-full mr-1 ${
                                      i < practice.satisfaction ? 'bg-green-500' : 'bg-gray-200'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>

                          {practice.notes && (
                            <div className="mt-2 text-sm text-gray-600 line-clamp-2">
                              {practice.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}

                  {/* 選択された練習の詳細ダイアログ */}
                  <Dialog
                    open={!!selectedPractice}
                    onOpenChange={(open) => !open && setSelectedPractice(null)}
                  >
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>練習の詳細</DialogTitle>
                        <DialogDescription>練習記録の詳細情報を確認できます。</DialogDescription>
                      </DialogHeader>
                      {selectedPractice && <PracticeDetails practice={selectedPractice} />}
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* デイリープラン */}
        <TabsContent value="plan">
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-purple-600" />
                今日のデイリープラン
              </CardTitle>
              <CardDescription>
                60分基準の推奨メニュー。完了にチェックすると記録へ自動反映できます。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                <Button variant="outline" onClick={() => startNewPlan(45)}>
                  45分プラン
                </Button>
                <Button variant="outline" onClick={() => startNewPlan(60)}>
                  60分プラン
                </Button>
                <Button variant="outline" onClick={() => startNewPlan(90)}>
                  90分プラン
                </Button>
                {deficits.length > 0 && (
                  <Button variant="secondary" onClick={addDeficitsToPlan}>
                    不足分をプランに追加
                  </Button>
                )}
              </div>
              {todayPlan.length === 0 ? (
                <div className="text-center text-gray-500">
                  プランがありません。「60分プラン」を作成してください。
                </div>
              ) : (
                <div className="space-y-3">
                  {todayPlan.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-md border p-3"
                    >
                      <div>
                        <div className="font-medium">{item.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.technique} ・ {item.minutes}分
                          {item.bpm ? ` ・ ${item.bpm} BPM` : ''}
                        </div>
                        {(item.bpm ?? coachBpm[item.technique]) && (
                          <div className="mt-2 flex items-center gap-2 text-xs">
                            <span>推奨BPM: {item.bpm ?? coachBpm[item.technique]}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => adjustBpm(item.technique, -5)}
                            >
                              -5
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => adjustBpm(item.technique, 5)}
                            >
                              +5
                            </Button>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={item.done}
                          onCheckedChange={() => togglePlanItem(item.id)}
                        />
                        <Label className="text-xs">完了</Label>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" onClick={() => setTodayPlan([])}>
                      プランをクリア
                    </Button>
                    <Button onClick={commitDoneItemsToLog}>完了分を記録</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ロードマップ */}
        <TabsContent value="roadmap">
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-indigo-600" />
                プロギタリスト・ロードマップ
              </CardTitle>
              <CardDescription>基礎→応用→実践→プロの4段階を順に制覇しましょう。</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {roadmap.map((level) => (
                  <div key={level.id} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{level.title}</h3>
                      <div className="text-sm text-muted-foreground">
                        進捗:{' '}
                        {Math.round(
                          (level.tasks.filter((t) => t.completed).length / level.tasks.length) * 100
                        )}
                        %
                      </div>
                    </div>
                    <div className="mt-3 space-y-2">
                      {level.tasks.map((t) => (
                        <div
                          key={t.id}
                          className="flex items-center justify-between rounded-md border p-3"
                        >
                          <div>
                            <div className="font-medium">{t.label}</div>
                            <div className="text-xs text-muted-foreground">
                              {t.technique} ・ 合計 {t.minutes}分
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={t.completed}
                              onCheckedChange={() => toggleRoadmapTask(level.id, t.id)}
                            />
                            <Label className="text-xs">完了</Label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 統計タブ */}
        <TabsContent value="stats">
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart2 className="h-5 w-5 text-blue-500" />
                練習統計
              </CardTitle>
              <CardDescription>あなたの練習履歴と成果を視覚化</CardDescription>
            </CardHeader>
            <CardContent>
              {practices.length > 0 ? (
                <PracticeStats practices={practices} />
              ) : (
                <div className="text-center p-8">
                  <BarChart2 className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium mb-2">まだデータがありません</h3>
                  <p className="text-gray-500 mb-4">
                    練習を記録すると、ここに統計情報が表示されます
                  </p>
                  <Button onClick={() => setIsAddDialogOpen(true)}>最初の練習を記録</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* マイルストーンタブ */}
        <TabsContent value="milestones">
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-500" />
                マイルストーン
              </CardTitle>
              <CardDescription>あなたのギター上達における重要な節目</CardDescription>
            </CardHeader>
            <CardContent>
              {practices.filter((p) => p.isMilestone).length > 0 ? (
                <div className="relative">
                  {/* 縦のタイムライン */}
                  <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                  <div className="space-y-6">
                    {sortedPractices
                      .filter((p) => p.isMilestone)
                      .map((practice) => (
                        <div key={practice._id} className="flex">
                          <div className="relative flex-shrink-0 mr-4">
                            <div className="h-7 w-7 rounded-full bg-amber-400 flex items-center justify-center z-10 relative">
                              <Award className="h-4 w-4 text-white" />
                            </div>
                          </div>
                          <Card className="flex-1">
                            <CardHeader className="pb-2">
                              <div className="flex justify-between items-start">
                                <CardTitle className="text-base">{practice.technique}</CardTitle>
                                <div className="text-sm text-muted-foreground">
                                  {formatSafeDate(practice.date)}
                                </div>
                              </div>
                              {practice.song && (
                                <Badge variant="outline" className="mt-1">
                                  {practice.song}
                                </Badge>
                              )}
                            </CardHeader>
                            <CardContent className="pt-0">
                              {practice.notes && (
                                <p className="text-gray-600 whitespace-pre-wrap">
                                  {practice.notes}
                                </p>
                              )}
                              <div className="flex items-center mt-3 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4 mr-1" />
                                <span>{practice.duration}分間</span>
                                {practice.bpm && (
                                  <>
                                    <span className="mx-2">•</span>
                                    <span>{practice.bpm} BPM</span>
                                  </>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      ))}
                  </div>
                </div>
              ) : (
                <div className="text-center p-8">
                  <Award className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium mb-2">マイルストーンがありません</h3>
                  <p className="text-gray-500 mb-4">
                    特に重要な進歩や達成があった練習を「マイルストーン」としてマークしましょう
                  </p>
                  <Button onClick={() => setIsAddDialogOpen(true)}>練習を記録</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* テクニックタブ */}
        <TabsContent value="techniques">
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-indigo-500" />
                テクニック分析
              </CardTitle>
              <CardDescription>各テクニックの練習時間と進捗</CardDescription>
            </CardHeader>
            <CardContent>
              {practices.length > 0 ? (
                <div className="space-y-8">
                  {/* テクニック別グラフ - 簡易的な実装 */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">テクニック別練習時間</h3>
                    <div className="space-y-4">
                      {Object.entries(
                        practices.reduce(
                          (acc, practice) => {
                            if (!acc[practice.technique]) {
                              acc[practice.technique] = 0;
                            }
                            acc[practice.technique] += practice.duration;
                            return acc;
                          },
                          {} as Record<string, number>
                        )
                      )
                        .sort((a, b) => b[1] - a[1])
                        .map(([technique, totalMinutes], i) => (
                          <div key={i}>
                            <div className="flex justify-between mb-1">
                              <span className="font-medium">{technique}</span>
                              <span>
                                {Math.floor(totalMinutes / 60) > 0
                                  ? `${Math.floor(totalMinutes / 60)}時間 `
                                  : ''}
                                {totalMinutes % 60}分
                              </span>
                            </div>
                            <Progress
                              value={
                                (totalMinutes / practices.reduce((sum, p) => sum + p.duration, 0)) *
                                100
                              }
                              className="h-2"
                            />
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* テクニック詳細テーブル */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">テクニック別詳細</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>テクニック</TableHead>
                          <TableHead>練習回数</TableHead>
                          <TableHead>総時間</TableHead>
                          <TableHead>平均難易度</TableHead>
                          <TableHead>平均満足度</TableHead>
                          <TableHead>最新の練習日</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Object.entries(
                          practices
                            .filter((practice) => isValidDate(practice.date)) // 無効な日付をフィルタリング
                            .reduce(
                              (acc, practice) => {
                                if (!acc[practice.technique]) {
                                  acc[practice.technique] = {
                                    count: 0,
                                    totalTime: 0,
                                    totalDifficulty: 0,
                                    totalSatisfaction: 0,
                                    latestDate: new Date(0),
                                  };
                                }

                                const entry = acc[practice.technique];
                                entry.count += 1;
                                entry.totalTime += practice.duration;
                                entry.totalDifficulty += practice.difficulty;
                                entry.totalSatisfaction += practice.satisfaction;

                                const practiceDate = new Date(practice.date);
                                if (isValidDate(practice.date) && practiceDate > entry.latestDate) {
                                  entry.latestDate = practiceDate;
                                }

                                return acc;
                              },
                              {} as Record<
                                string,
                                {
                                  count: number;
                                  totalTime: number;
                                  totalDifficulty: number;
                                  totalSatisfaction: number;
                                  latestDate: Date;
                                }
                              >
                            )
                        )
                          .sort((a, b) => b[1].totalTime - a[1].totalTime)
                          .map(([technique, data], i) => (
                            <TableRow key={i}>
                              <TableCell className="font-medium">{technique}</TableCell>
                              <TableCell>{data.count}回</TableCell>
                              <TableCell>
                                {Math.floor(data.totalTime / 60) > 0
                                  ? `${Math.floor(data.totalTime / 60)}時間 `
                                  : ''}
                                {data.totalTime % 60}分
                              </TableCell>
                              <TableCell>
                                {(data.totalDifficulty / data.count).toFixed(1)}
                              </TableCell>
                              <TableCell>
                                {(data.totalSatisfaction / data.count).toFixed(1)}
                              </TableCell>
                              <TableCell>
                                {data.latestDate.getTime() > 0
                                  ? formatSafeDate(data.latestDate, 'yyyy年MM月dd日')
                                  : '記録なし'}
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8">
                  <Layers className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium mb-2">まだデータがありません</h3>
                  <p className="text-gray-500 mb-4">
                    練習を記録すると、テクニック別の分析が表示されます
                  </p>
                  <Button onClick={() => setIsAddDialogOpen(true)}>練習を記録</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* リソースタブ */}
        <TabsContent value="resources">
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="h-5 w-5 text-green-500" />
                ギター練習リソース
              </CardTitle>
              <CardDescription>効果的な練習のための参考資料とリンク集</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* ビデオレッスン */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">おすすめのビデオレッスン</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border rounded-md p-3">
                      <h4 className="font-medium flex items-center">
                        初心者向けコードマスター講座
                        {!isPremium && (
                          <Badge className="ml-2 bg-amber-100 text-amber-800">
                            <Crown className="h-3 w-3 mr-1" />
                            プレミアム
                          </Badge>
                        )}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        基本コードから応用まで、段階的に学べるレッスン
                      </p>
                      <Button variant="outline" size="sm" className="mt-2" disabled={!isPremium}>
                        {isPremium ? (
                          <>
                            <ExternalLink className="h-3 w-3 mr-1" />
                            視聴する
                          </>
                        ) : (
                          'プレミアム限定'
                        )}
                      </Button>
                    </div>

                    <div className="border rounded-md p-3">
                      <h4 className="font-medium">指の独立トレーニング</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        各指の独立した動きを向上させる練習方法
                      </p>
                      <Button variant="outline" size="sm" className="mt-2">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        視聴する
                      </Button>
                    </div>

                    <div className="border rounded-md p-3">
                      <h4 className="font-medium">リズムギター上達法</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        リズム感を鍛える練習とストロークパターン
                      </p>
                      <Button variant="outline" size="sm" className="mt-2">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        視聴する
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* 練習方法ガイド */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">効果的な練習方法</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border rounded-md p-3">
                      <h4 className="font-medium">メトロノームを使った練習</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        正確なリズム感を身につけるメトロノーム活用法
                      </p>
                      <Button variant="outline" size="sm" className="mt-2">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        記事を読む
                      </Button>
                    </div>

                    <div className="border rounded-md p-3">
                      <h4 className="font-medium flex items-center">
                        高速ピッキング上達法
                        {!isPremium && (
                          <Badge className="ml-2 bg-amber-100 text-amber-800">
                            <Crown className="h-3 w-3 mr-1" />
                            プレミアム
                          </Badge>
                        )}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        正確で速いピッキングを身につける練習メニュー
                      </p>
                      <Button variant="outline" size="sm" className="mt-2" disabled={!isPremium}>
                        {isPremium ? (
                          <>
                            <ExternalLink className="h-3 w-3 mr-1" />
                            記事を読む
                          </>
                        ) : (
                          'プレミアム限定'
                        )}
                      </Button>
                    </div>

                    <div className="border rounded-md p-3">
                      <h4 className="font-medium">5分間練習法</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        忙しい日でも上達できる効率的な練習方法
                      </p>
                      <Button variant="outline" size="sm" className="mt-2">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        記事を読む
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* コード表 */}
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-base">基本コード表</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>コード</TableHead>
                            <TableHead>タイプ</TableHead>
                            <TableHead>構成音</TableHead>
                            <TableHead>指使い</TableHead>
                            <TableHead>難易度</TableHead>
                            <TableHead>練習曲</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">C</TableCell>
                            <TableCell>メジャー</TableCell>
                            <TableCell>C, E, G</TableCell>
                            <TableCell>1弦: 0, 2弦: 1, 3弦: 0, 4弦: 2, 5弦: 3, 6弦: X</TableCell>
                            <TableCell>★</TableCell>
                            <TableCell>Let It Be</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">G</TableCell>
                            <TableCell>メジャー</TableCell>
                            <TableCell>G, B, D</TableCell>
                            <TableCell>1弦: 3, 2弦: 0, 3弦: 0, 4弦: 0, 5弦: 2, 6弦: 3</TableCell>
                            <TableCell>★</TableCell>
                            <TableCell>Country Roads</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">D</TableCell>
                            <TableCell>メジャー</TableCell>
                            <TableCell>D, F#, A</TableCell>
                            <TableCell>1弦: 2, 2弦: 3, 3弦: 2, 4弦: 0, 5弦: X, 6弦: X</TableCell>
                            <TableCell>★</TableCell>
                            <TableCell>Knockin' on Heaven's Door</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Am</TableCell>
                            <TableCell>マイナー</TableCell>
                            <TableCell>A, C, E</TableCell>
                            <TableCell>1弦: 0, 2弦: 1, 3弦: 2, 4弦: 2, 5弦: 0, 6弦: X</TableCell>
                            <TableCell>★</TableCell>
                            <TableCell>House of the Rising Sun</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">F</TableCell>
                            <TableCell>メジャー</TableCell>
                            <TableCell>F, A, C</TableCell>
                            <TableCell>1弦: 1, 2弦: 1, 3弦: 2, 4弦: 3, 5弦: 3, 6弦: 1</TableCell>
                            <TableCell>★★★</TableCell>
                            <TableCell>Hey Jude</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                    {!isPremium && (
                      <div className="mt-4 text-right">
                        <Button>
                          <Crown className="h-4 w-4 mr-2" />
                          すべてのコード表を見る（プレミアム）
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* プレミアム紹介セクション */}
      {!isPremium && (
        <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-500" />
              ギター練習をさらに効果的に
            </CardTitle>
            <CardDescription>
              プレミアム機能でより速く上達し、練習を続けるモチベーションを維持しましょう
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex">
                <div className="mr-4">
                  <div className="bg-amber-100 p-3 rounded-full">
                    <Music className="h-5 w-5 text-amber-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-1">ビデオレッスンライブラリ</h3>
                  <p className="text-sm text-muted-foreground">
                    プロギタリストによる100以上の詳細なレッスン動画が見放題
                  </p>
                </div>
              </div>

              <div className="flex">
                <div className="mr-4">
                  <div className="bg-amber-100 p-3 rounded-full">
                    <BarChart2 className="h-5 w-5 text-amber-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-1">高度な練習分析</h3>
                  <p className="text-sm text-muted-foreground">
                    AIが練習パターンを分析し、上達を加速させるアドバイスを提供
                  </p>
                </div>
              </div>

              <div className="flex">
                <div className="mr-4">
                  <div className="bg-amber-100 p-3 rounded-full">
                    <Guitar className="h-5 w-5 text-amber-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-1">練習レコーダー</h3>
                  <p className="text-sm text-muted-foreground">
                    自分の演奏を録音して再生し、客観的に上達度を確認できます
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div>
              <span className="font-bold text-2xl">¥980</span>
              <span className="text-sm text-muted-foreground ml-1">/ 月</span>
            </div>
            <Button className="bg-amber-600 hover:bg-amber-700">プレミアムを始める</Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default GuitarPracticePage;
