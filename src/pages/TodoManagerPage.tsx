import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import DailyTodoReminder from '@/components/dailyToDoReminder/DailyTodoReminder';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { CheckSquare, Plus, Target, TrendingUp, Calendar, BarChart3, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TodoManagerPage: React.FC = () => {
  const navigate = useNavigate();
  const hasActiveSubscription = useSelector((state: RootState) => state.user.hasActiveSubscription);

  return (
    <PageLayout
      title="ToDo管理"
      subtitle="日々のタスクを効率的に管理し、生産性を向上させましょう"
      badge={{
        text: hasActiveSubscription ? 'プレミアム' : 'スタンダード',
        variant: hasActiveSubscription ? 'default' : 'secondary',
        icon: <CheckSquare className="w-4 h-4" />,
      }}
      actions={
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => navigate('/integrated-dashboard')}
            className="flex items-center gap-2"
          >
            <Target className="h-4 w-4" />
            プロジェクト管理
          </Button>
          <Button
            onClick={() => navigate('/work-time-reports')}
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            分析レポート
          </Button>
        </div>
      }
      headerGradient
    >
      <div className="space-y-8">
        {/* メインのDailyTodoReminder */}
        <div className="col-span-full">
          <DailyTodoReminder isPremium={hasActiveSubscription} />
        </div>

        {/* 追加の機能カード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
                今日の予定
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 mb-4">カレンダーと連携してタスクを効率的に管理</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/calendar')}
                className="w-full"
              >
                カレンダーを見る
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
                生産性分析
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 mb-4">完了率やパフォーマンスの詳細分析</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/work-time-reports')}
                className="w-full"
              >
                レポートを見る
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings className="h-5 w-5 text-purple-600" />
                設定
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 mb-4">通知設定や表示オプションのカスタマイズ</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/profile')}
                className="w-full"
              >
                設定を開く
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* プレミアム機能の案内 */}
        {!hasActiveSubscription && (
          <Card className="border-0 shadow-md bg-gradient-to-r from-blue-50 to-purple-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    プレミアム機能でさらに効率的に
                  </h3>
                  <p className="text-slate-600">
                    AI分析、無制限のプロジェクト、高度なレポート機能をご利用いただけます
                  </p>
                </div>
                <Button
                  onClick={() => navigate('/subscription-management')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  アップグレード
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
};

export default TodoManagerPage;
