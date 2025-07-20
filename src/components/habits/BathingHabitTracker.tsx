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
      