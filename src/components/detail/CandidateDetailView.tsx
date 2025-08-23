import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, Globe, MapPin, Lock, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import SupportRateChart from '@/components/chart/SupportRateChart';
import CandidateTimeline from '@/components/timeline/CandidateTimeline';
import { Candidate } from '@/types';

interface CandidateDetailViewProps {
  candidate: Candidate;
  onClose: () => void;
  onEdit: () => void;
  isPremium: boolean;
}

const CandidateDetailView: React.FC<CandidateDetailViewProps> = ({
  candidate,
  onClose,
  onEdit,
  isPremium,
}) => {
  // 候補者名の頭文字を取得
  const getInitials = (name: string) => {
    return name.charAt(0);
  };

  // ステータスバッジの色を決定
  const getStatusBadgeVariant = (status?: string) => {
    switch (status) {
      case 'confirmed':
        return 'default';
      case 'unofficial':
        return 'secondary';
      case 'rumored':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  // ステータスの日本語表示
  const getStatusText = (status?: string) => {
    switch (status) {
      case 'confirmed':
        return '確定';
      case 'unofficial':
        return '非公式';
      case 'rumored':
        return '噂';
      default:
        return '未定';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">候補者詳細</h2>
        <div className="space-x-2">
          <Button onClick={onEdit} variant="outline">
            編集
          </Button>
          <Button onClick={onClose} variant="secondary">
            閉じる
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 基本情報カード */}
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">基本情報</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center mb-6">
              {candidate.imageUrl ? (
                <img
                  src={candidate.imageUrl}
                  alt={candidate.name}
                  className="h-32 w-32 rounded-full object-cover mb-4"
                  loading="lazy"
                />
              ) : (
                <Avatar className="h-32 w-32 mb-4">
                  <AvatarFallback>{getInitials(candidate.name)}</AvatarFallback>
                </Avatar>
              )}
              <h3 className="text-xl font-bold text-center">{candidate.name}</h3>
              <Badge variant={getStatusBadgeVariant(candidate.status)} className="mt-2">
                {getStatusText(candidate.status)}
              </Badge>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-8 text-gray-500">
                  <Users size={16} />
                </div>
                <span className="font-medium">所属政党:</span>
                <span className="ml-2">{candidate.party}</span>
              </div>

              <div className="flex items-center">
                <div className="w-8 text-gray-500">
                  <MapPin size={16} />
                </div>
                <span className="font-medium">選挙区:</span>
                <span className="ml-2">
                  {candidate.prefecture}
                  {candidate.district !== null ? ` 第${candidate.district}区` : ''}
                </span>
              </div>

              {candidate.proportionalBlock && (
                <div className="flex items-center">
                  <div className="w-8 text-gray-500">
                    <Globe size={16} />
                  </div>
                  <span className="font-medium">比例ブロック:</span>
                  <span className="ml-2">{candidate.proportionalBlock}</span>
                </div>
              )}

              {isPremium && candidate.age && (
                <div className="flex items-center">
                  <div className="w-8 text-gray-500">
                    <Calendar size={16} />
                  </div>
                  <span className="font-medium">年齢:</span>
                  <span className="ml-2">{candidate.age}歳</span>
                </div>
              )}

              {isPremium && candidate.gender && (
                <div className="flex items-center">
                  <div className="w-8 text-gray-500">
                    <Users size={16} />
                  </div>
                  <span className="font-medium">性別:</span>
                  <span className="ml-2">
                    {candidate.gender === 'male'
                      ? '男性'
                      : candidate.gender === 'female'
                        ? '女性'
                        : 'その他'}
                  </span>
                </div>
              )}

              {candidate.lastUpdated && (
                <div className="text-xs text-gray-500 mt-4">
                  最終更新: {new Date(candidate.lastUpdated).toLocaleString('ja-JP')}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 詳細情報タブ */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">詳細情報</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="profile">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profile">プロフィール</TabsTrigger>
                <TabsTrigger value="stats">支持率</TabsTrigger>
                <TabsTrigger value="timeline">活動履歴</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="pt-4">
                {isPremium ? (
                  <div className="space-y-4">
                    {candidate.biography ? (
                      <div>
                        <h4 className="font-medium mb-2">経歴</h4>
                        <p className="text-sm text-gray-700">{candidate.biography}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">経歴情報はありません</p>
                    )}

                    {candidate.pastExperience && candidate.pastExperience.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">過去の経歴</h4>
                        <ul className="list-disc pl-5 text-sm text-gray-700">
                          {candidate.pastExperience.map((exp, index) => (
                            <li key={index}>{exp}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div>
                      <h4 className="font-medium mb-2">ウェブサイト・SNS</h4>
                      <div className="flex flex-wrap gap-2">
                        {candidate.website && (
                          <Link href={candidate.website} passHref>
                            <Button variant="outline" size="sm" className="text-xs" asChild>
                              <a target="_blank" rel="noopener noreferrer">
                                <Globe className="h-3 w-3 mr-1" />
                                ウェブサイト
                              </a>
                            </Button>
                          </Link>
                        )}
                        {candidate.socialMedia?.twitter && (
                          <Link href={candidate.socialMedia.twitter} passHref>
                            <Button variant="outline" size="sm" className="text-xs" asChild>
                              <a target="_blank" rel="noopener noreferrer">
                                Twitter
                              </a>
                            </Button>
                          </Link>
                        )}
                        {candidate.socialMedia?.facebook && (
                          <Link href={candidate.socialMedia.facebook} passHref>
                            <Button variant="outline" size="sm" className="text-xs" asChild>
                              <a target="_blank" rel="noopener noreferrer">
                                Facebook
                              </a>
                            </Button>
                          </Link>
                        )}
                        {candidate.socialMedia?.instagram && (
                          <Link href={candidate.socialMedia.instagram} passHref>
                            <Button variant="outline" size="sm" className="text-xs" asChild>
                              <a target="_blank" rel="noopener noreferrer">
                                Instagram
                              </a>
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 text-center">
                    <Lock className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium mb-2">プレミアム会員限定コンテンツ</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      詳細プロフィール情報を閲覧するには、プレミアム会員にアップグレードしてください。
                    </p>
                    <Link href="/subscription">
                      <Button>プレミアム会員になる</Button>
                    </Link>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="stats" className="pt-4">
                {isPremium ? (
                  <div>
                    <h4 className="font-medium mb-4">支持率推移</h4>
                    <SupportRateChart candidateId={candidate._id || ''} />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 text-center">
                    <Lock className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium mb-2">プレミアム会員限定コンテンツ</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      支持率データを閲覧するには、プレミアム会員にアップグレードしてください。
                    </p>
                    <Link href="/subscription">
                      <Button>プレミアム会員になる</Button>
                    </Link>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="timeline" className="pt-4">
                {isPremium ? (
                  <div>
                    <h4 className="font-medium mb-4">活動履歴</h4>
                    <CandidateTimeline candidateId={candidate._id || ''} />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 text-center">
                    <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium mb-2">プレミアム会員限定コンテンツ</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      活動履歴や詳細情報を閲覧するには、プレミアム会員にアップグレードしてください。
                    </p>
                    <Link href="/subscription">
                      <Button>プレミアム会員になる</Button>
                    </Link>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CandidateDetailView;
