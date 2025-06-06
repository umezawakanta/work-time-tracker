import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FeatureCard, FeatureCardVariant } from '@/components/FeatureCard';
import {
  Clock,
  BarChart2,
  Briefcase,
  Target,
  Database,
  Calendar,
  FileText,
  Moon,
  UserCircle,
} from 'lucide-react';

interface FeatureItem {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  buttonText: string;
  variant: FeatureCardVariant;
  isPremium?: boolean;
}

const productivityTools: FeatureItem[] = [
  {
    title: '効率的な時間管理',
    description: '作業時間を記録し、生産性を向上させましょう。',
    icon: <Clock className="h-6 w-6 text-primary" />,
    path: '/work-time',
    buttonText: '時間管理を開始',
    variant: 'default',
  },
  {
    title: '詳細な分析',
    description: '作業時間のデータを可視化し、インサイトを得る',
    icon: <BarChart2 className="h-6 w-6 text-indigo-500" />,
    path: '/work-time-reports',
    buttonText: 'レポートを見る',
    variant: 'outline',
  },
  {
    title: 'WBS作成ツール',
    description: 'プロジェクトの作業分解構造を作成',
    icon: <Briefcase className="h-6 w-6 text-emerald-500" />,
    path: '/wbs-creator',
    buttonText: 'WBS作成',
    variant: 'secondary',
    isPremium: true,
  },
  {
    title: '統合ダッシュボード',
    description: 'すべてのプロジェクトを一元管理',
    icon: <Target className="h-6 w-6 text-blue-500" />,
    path: '/integrated-dashboard',
    buttonText: 'ダッシュボードを開く',
    variant: 'secondary',
  },
];

const financeTools: FeatureItem[] = [
  {
    title: '資産/負債レポート',
    description: '資産と負債の状況を分析',
    icon: <Database className="h-6 w-6 text-emerald-500" />,
    path: '/asset-liability-report',
    buttonText: 'レポートを見る',
    variant: 'secondary',
  },
  {
    title: '資産増減カレンダー',
    description: '日々の資産変動を視覚的に確認',
    icon: <Calendar className="h-6 w-6 text-amber-500" />,
    path: '/asset-calendar',
    buttonText: 'カレンダーを見る',
    variant: 'secondary',
    isPremium: true,
  },
];

const personalTools: FeatureItem[] = [
  {
    title: 'ブログ',
    description: '生産性向上のヒントや体験談を共有',
    icon: <FileText className="h-6 w-6 text-orange-500" />,
    path: '/blog',
    buttonText: 'ブログを見る',
    variant: 'secondary',
  },
  {
    title: '睡眠トラッカー',
    description: '睡眠パターンを記録・分析',
    icon: <Moon className="h-6 w-6 text-blue-500" />,
    path: '/sleep-tracker',
    buttonText: '睡眠管理',
    variant: 'secondary',
  },
  {
    title: 'ユーザープロフィール',
    description: 'あなたの情報を管理',
    icon: <UserCircle className="h-6 w-6 text-purple-500" />,
    path: '/profile',
    buttonText: 'プロフィール',
    variant: 'outline',
  },
];

export const FeatureGrid: React.FC = () => {
  return (
    <Tabs defaultValue="productivity" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="productivity">生産性ツール</TabsTrigger>
        <TabsTrigger value="finance">資産管理</TabsTrigger>
        <TabsTrigger value="personal">個人管理</TabsTrigger>
      </TabsList>

      <TabsContent value="productivity" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {productivityTools.map((tool, index) => (
            <FeatureCard key={index} {...tool} />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="finance" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {financeTools.map((tool, index) => (
            <FeatureCard key={index} {...tool} />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="personal" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {personalTools.map((tool, index) => (
            <FeatureCard key={index} {...tool} />
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
};
