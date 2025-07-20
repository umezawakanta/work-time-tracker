/**
 * 🛁 入浴習慣トラッカー
 * 毎日の入浴を確実に実現するための包括的支援ダッシュボード
 */

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Droplets,
  Clock,
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Zap,
  Award,
  Calendar,
  Settings,
  BarChart3,
  Thermometer,
  Timer,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  bathingHabitService,
  BathingRecord,
  BathingPlan,
  HabitStats,
  Barrier,
} from '@/services/habits/BathingHabitService';

export const BathingHabitTracker: React.FC = () => {
  const [todayRecord, setTodayRecord] = useState<BathingRecord | null>(null);
  const [stats, setStats] = useState<HabitStats | null>(null);
  const [showRecordForm, setShowRecordForm] = useState(false);
  const [showPlanSetup, setShowPlanSetup] = useState(false);
  const [motivationalMessage, setMotivationalMessage] = useState<any>(null);

  // フォームステート
  const [bathingType, setBathingType] = useState<BathingRecord['bathingType']>('shower');
  const [duration, setDuration] = useState(15);
  const [temperature, setTemperature] = useState<BathingRecord['temperature']>('warm');
  const [mood, setMood] = useState<BathingRecord['mood']>('good');
  const [barriers, setBarriers] = useState<Barrier[]>([]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    // 初期データ読み込み
    loadInitialData();

    // イベントリスナーの設定
    const handleBathingCompleted = (record: BathingRecord) => {
      setTodayRecord(record);
      setShowRecordForm(false);
      loadStats();
      loadMotivationalMessage();
    };

    const handleBathingSkipped = () => {
      loadStats();
      loadMotivationalMessage();
    };

    bathingHabitService.on('bathingCompleted', handleBathingCompleted);
    bathingHabitService.on('bathingSkipped', handleBathingSkipped);

    return () => {
      bathingHabitService.off('bathingCompleted', handleBathingCompleted);
      bathingHabitService.off('bathingSkipped', handleBathingSkipped);
    };
  }, []);

  const loadInitialData = () => {
    loadStats();
    loadMotivationalMessage();
  };

  const loadStats = () => {
    const habitStats = bathingHabitService.getHabitStats();
    setStats(habitStats);
  };

  const loadMotivationalMessage = () => {
    const message = bathingHabitService.getMotivationalMessage();
    setMotivationalMessage(message);
  };

  if (!stats) {
    return <div>読み込み中...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4">
      <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-cyan-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Droplets className="w-6 h-6 text-blue-600" />
            🛁 入浴習慣トラッカー
            <Badge variant="outline" className="bg-blue-100 text-blue-700">
              習慣化支援
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            毎日の入浴習慣を確実に実現するための包括的支援システム
          </p>
        </CardContent>
      </Card>

      {/* 統計表示 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="font-medium">現在のストリーク</p>
                <p className="text-2xl font-bold text-blue-600">{stats.currentStreak}日</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Award className="w-8 h-8 text-purple-600" />
              <div>
                <p className="font-medium">最長記録</p>
                <p className="text-2xl font-bold text-purple-600">{stats.longestStreak}日</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <div>
                <p className="font-medium">成功率</p>
                <p className="text-2xl font-bold text-green-600">{stats.successRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 今日のアクション */}
      <Card>
        <CardHeader>
          <CardTitle>今日の入浴</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => {
              bathingHabitService.recordBathing('shower', 15, 'warm', 'good');
            }}
            className="w-full"
          >
            入浴完了を記録
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default BathingHabitTracker;
