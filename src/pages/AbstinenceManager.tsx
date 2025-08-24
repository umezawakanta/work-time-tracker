import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAbstinence } from '@/hooks/useAbstinence';
import { AbstinenceType } from '@/types/abstinence';
import { Plus, Calendar, Trophy, TrendingUp } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ABSTINENCE_TYPES: { value: AbstinenceType; label: string; emoji: string }[] = [
  { value: 'alcohol', label: '禁酒', emoji: '🍺' },
  { value: 'smoking', label: '禁煙', emoji: '🚭' },
  { value: 'gambling', label: '禁ギャンブル', emoji: '🎰' },
  { value: 'masturbation', label: '禁オナニー', emoji: '🔞' },
  { value: 'pornography', label: '禁ポルノ', emoji: '📱' },
  { value: 'prostitution', label: '禁風俗', emoji: '💸' },
  { value: 'shopping', label: '禁無駄遣い', emoji: '💳' },
  { value: 'social_media', label: 'SNS断ち', emoji: '📵' },
  { value: 'gaming', label: 'ゲーム断ち', emoji: '🎮' },
  { value: 'junk_food', label: 'ジャンクフード断ち', emoji: '🍟' },
];

const AbstinenceManager: React.FC = () => {
  const { challenges, stats, isLoading, createChallenge, recordDaily } = useAbstinence();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<AbstinenceType>('alcohol');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleCreateChallenge = async () => {
    if (!title.trim()) {
      toast.error('タイトルを入力してください');
      return;
    }

    const success = await createChallenge(selectedType, title, description);
    if (success) {
      toast.success('チャレンジを作成しました！');
      setIsCreateDialogOpen(false);
      setTitle('');
      setDescription('');
    } else {
      toast.error('チャレンジの作成に失敗しました');
    }
  };

  const handleRecordDaily = async (challengeId: string, status: 'success' | 'failure') => {
    const success = await recordDaily(challengeId, status);
    if (success) {
      toast.success(
        status === 'success' ? '今日も成功です！' : '記録しました。明日頑張りましょう！'
      );
    } else {
      toast.error('記録の保存に失敗しました');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">節制チャレンジ</h1>
          <p className="text-gray-600 mt-2">自分を変える第一歩を踏み出しましょう</p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              新しいチャレンジ
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>新しいチャレンジを作成</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">チャレンジタイプ</label>
                <Select
                  value={selectedType}
                  onValueChange={(value) => setSelectedType(value as AbstinenceType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ABSTINENCE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.emoji} {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">タイトル</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="例: 30日間の禁酒チャレンジ"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">説明（任意）</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="チャレンジの理由や目標を書きましょう"
                  rows={3}
                />
              </div>

              <Button onClick={handleCreateChallenge} className="w-full">
                チャレンジを開始
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* 統計情報 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Calendar className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalDays}</p>
                  <p className="text-sm text-gray-600">累計日数</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeChallenges}</p>
                  <p className="text-sm text-gray-600">進行中</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Trophy className="h-8 w-8 text-yellow-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.achievements}</p>
                  <p className="text-sm text-gray-600">達成数</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-lg px-3 py-1">
                  {stats.rank}
                </Badge>
                <div>
                  <p className="text-sm text-gray-600">現在のランク</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* アクティブなチャレンジ */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">進行中のチャレンジ</h2>

        {challenges.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-500 text-lg mb-4">まだチャレンジがありません</p>
              <p className="text-gray-400">上のボタンから新しいチャレンジを始めましょう！</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {challenges
              .filter((challenge) => challenge.isActive)
              .map((challenge) => {
                const typeInfo = ABSTINENCE_TYPES.find((t) => t.value === challenge.type);
                return (
                  <Card key={challenge.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <span className="text-2xl">{typeInfo?.emoji}</span>
                          {challenge.title}
                        </CardTitle>
                        <Badge variant="outline">Lv.{challenge.level}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-600">現在の記録</p>
                          <p className="text-2xl font-bold text-green-600">
                            {challenge.currentStreak}日
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-600">最長記録</p>
                          <p className="text-lg font-semibold">{challenge.longestStreak}日</p>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleRecordDaily(challenge.id, 'success')}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            成功
                          </Button>
                          <Button
                            onClick={() => handleRecordDaily(challenge.id, 'failure')}
                            variant="outline"
                            className="flex-1"
                          >
                            失敗
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AbstinenceManager;
