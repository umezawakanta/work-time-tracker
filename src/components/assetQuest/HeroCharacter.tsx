import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Crown, Zap, TrendingUp, Coins } from 'lucide-react';

interface HeroData {
  level: number;
  experience: number;
  experienceToNext: number;
  title: string;
  avatar: string;
  totalAssets: number;
}

interface HeroCharacterProps {
  hero: HeroData;
}

export const HeroCharacter: React.FC<HeroCharacterProps> = ({ hero }) => {
  const experiencePercentage = (hero.experience / (hero.experience + hero.experienceToNext)) * 100;

  const getHeroEmoji = (level: number): string => {
    if (level >= 50) return '🦸‍♂️'; // スーパーヒーロー
    if (level >= 40) return '👑'; // 王様
    if (level >= 30) return '🏆'; // チャンピオン
    if (level >= 20) return '⚔️'; // 戦士
    if (level >= 10) return '🛡️'; // 騎士
    return '🌱'; // 初心者
  };

  const getHeroBackground = (level: number): string => {
    if (level >= 50) return 'from-purple-500 to-pink-500';
    if (level >= 40) return 'from-yellow-500 to-orange-500';
    if (level >= 30) return 'from-blue-500 to-cyan-500';
    if (level >= 20) return 'from-green-500 to-teal-500';
    if (level >= 10) return 'from-indigo-500 to-purple-500';
    return 'from-gray-400 to-gray-600';
  };

  const formatAssets = (amount: number): string => {
    if (amount >= 100000000) return `${(amount / 100000000).toFixed(1)}億円`;
    if (amount >= 10000) return `${(amount / 10000).toFixed(1)}万円`;
    return `${amount.toLocaleString()}円`;
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-yellow-500" />
          勇者ステータス
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 勇者アバター */}
        <div className="text-center">
          <div
            className={`w-24 h-24 mx-auto rounded-full bg-gradient-to-r ${getHeroBackground(hero.level)} flex items-center justify-center text-4xl mb-4 shadow-lg`}
          >
            {getHeroEmoji(hero.level)}
          </div>
          <h3 className="text-xl font-bold mb-1">{hero.title}</h3>
          <Badge variant="outline" className="text-lg px-3 py-1">
            Lv. {hero.level}
          </Badge>
        </div>

        {/* 経験値バー */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">経験値</span>
            <span className="text-sm text-gray-600">
              {hero.experience.toLocaleString()} /{' '}
              {(hero.experience + hero.experienceToNext).toLocaleString()} EXP
            </span>
          </div>
          <Progress value={experiencePercentage} className="h-3" />
          <div className="text-xs text-gray-500 mt-1 text-center">
            次のレベルまで {hero.experienceToNext.toLocaleString()} EXP
          </div>
        </div>

        {/* ステータス */}
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Coins className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-800">総資産</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {formatAssets(hero.totalAssets)}
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-800">成長度</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium">節約力</div>
                <div className="text-blue-600">{Math.min(100, hero.level * 2)}%</div>
              </div>
              <div>
                <div className="font-medium">投資力</div>
                <div className="text-blue-600">
                  {Math.min(100, Math.max(0, (hero.level - 10) * 3))}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* レベルアップ予告 */}
        {hero.experienceToNext <= 1000 && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-yellow-600" />
              <span className="font-medium text-yellow-800">レベルアップ間近！</span>
            </div>
            <p className="text-sm text-yellow-700">
              あと {hero.experienceToNext} EXP でレベル {hero.level + 1} になります！
            </p>
          </div>
        )}

        {/* 称号の説明 */}
        <div className="text-center">
          <div className="text-xs text-gray-500 mb-2">現在の称号</div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-sm font-medium text-gray-700">{hero.title}</div>
            <div className="text-xs text-gray-500 mt-1">{getTitleDescription(hero.level)}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const getTitleDescription = (level: number): string => {
  if (level >= 50) return '伝説の資産形成マスター。誰もが憧れる存在です。';
  if (level >= 40) return '資産形成の王者。安定した資産運用を実現しています。';
  if (level >= 30) return '投資のチャンピオン。リスク管理も完璧です。';
  if (level >= 20) return '節約の戦士。無駄遣いを撲滅する強者です。';
  if (level >= 10) return '家計管理の騎士。基本的な管理スキルを身につけています。';
  return '資産形成の道を歩み始めた新人勇者です。';
};
