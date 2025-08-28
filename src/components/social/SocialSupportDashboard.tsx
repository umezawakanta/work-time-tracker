import { useAuth } from '@/hooks/useAuth';
/**
 * 🤝 ソーシャルサポートダッシュボード
 * ADHD/ASDコミュニティとピアサポートの統合UI
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import SocialSupportNetworkService from '@/services/social/SocialSupportNetworkService';
import {
  Users,
  MessageCircle,
  Heart,
  Shield,
  Search,
  Plus,
  Star,
  Clock,
  AlertTriangle,
  CheckCircle2,
  UserPlus,
  MessageSquare,
  Globe,
  Lock,
  Eye,
  Zap,
  Target,
  BookOpen,
  HelpCircle,
  Phone,
  Video,
  Mail,
  Calendar,
  ThumbsUp,
  ThumbsDown,
  Filter,
  ArrowRight,
  Activity,
  TrendingUp,
  Award,
  Coffee,
  Lightbulb,
  Sparkles,
  Brain,
  Handshake,
  Smile,
  Frown,
  Meh,
  ExternalLink,
  Settings,
  Bell,
  Share,
} from 'lucide-react';

interface SupportGroup {
  id: string;
  name: string;
  description: string;
  type: string;
  category: string;
  memberCount: number;
  maxMembers: number;
  isActive: boolean;
  lastActivity: Date;
}

interface CommunityPost {
  id: string;
  authorId: string;
  groupId?: string;
  type: string;
  title: string;
  content: string;
  emotionalTone: string;
  reactions: any[];
  replies: any[];
  createdAt: Date;
}

interface SupportMatch {
  id: string;
  requesterId: string;
  supporterId?: string;
  status: string;
  type: string;
  urgency: string;
  duration: string;
  topics: string[];
  createdAt: Date;
}

interface KnowledgeResource {
  id: string;
  title: string;
  description: string;
  type: string;
  category: string;
  difficulty: string;
  timeToConsume: number;
  adhdRelevance: number;
  asdRelevance: number;
  ratings: {
    helpfulness: number;
    total_ratings: number;
  };
  tags: string[];
}

export const SocialSupportDashboard: React.FC = () => {
  // State Management
  const [socialService] = useState(() => new SocialSupportNetworkService());
  const { user, isAuthenticated } = useAuth();
  const resolvedUserId = user?.id || user?._id || user?.uid || user?.email || '';
  const [supportGroups, setSupportGroups] = useState<SupportGroup[]>([]);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
  const [supportMatches, setSupportMatches] = useState<SupportMatch[]>([]);
  const [knowledgeResources, setKnowledgeResources] = useState<KnowledgeResource[]>([]);
  const [selectedTab, setSelectedTab] = useState('community');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [newPostContent, setNewPostContent] = useState('');
  const [showNewPostDialog, setShowNewPostDialog] = useState(false);
  const [communityStats, setCommunityStats] = useState<any>(null);

  // データ取得
  const loadSocialData = useCallback(async () => {
    try {
      const groups = socialService.getSupportGroups();
      const posts = socialService.getCommunityPosts();
      const matches = resolvedUserId ? socialService.getSupportMatches(resolvedUserId) : [];
      const resources = socialService.searchKnowledgeResources('');
      const stats = socialService.getCommunityStatistics();

      setSupportGroups(groups);
      setCommunityPosts(posts);
      setSupportMatches(matches);
      setKnowledgeResources(resources.slice(0, 10)); // 最初の10件
      setCommunityStats(stats);
    } catch (error) {
      console.error('Social data loading error:', error);
    }
  }, [socialService, resolvedUserId]);

  // 初期データ読み込み
  useEffect(() => {
    loadSocialData();

    // イベントリスナー
    const handleUserJoined = () => loadSocialData();
    const handlePostCreated = () => loadSocialData();
    const handleMatchFound = () => loadSocialData();

    socialService.on('userJoinedGroup', handleUserJoined);
    socialService.on('postCreated', handlePostCreated);
    socialService.on('matchFound', handleMatchFound);

    return () => {
      socialService.off('userJoinedGroup', handleUserJoined);
      socialService.off('postCreated', handlePostCreated);
      socialService.off('matchFound', handleMatchFound);
    };
  }, [loadSocialData, socialService]);

  // Utility functions
  const getGroupTypeIcon = (type: string) => {
    switch (type) {
      case 'adhd_focused':
        return <Zap className="h-4 w-4 text-orange-600" />;
      case 'asd_focused':
        return <Brain className="h-4 w-4 text-blue-600" />;
      case 'dual_diagnosis':
        return <Target className="h-4 w-4 text-purple-600" />;
      case 'family':
        return <Heart className="h-4 w-4 text-pink-600" />;
      case 'general':
        return <Users className="h-4 w-4 text-green-600" />;
      default:
        return <MessageCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getEmotionalToneIcon = (tone: string) => {
    switch (tone) {
      case 'positive':
        return <Smile className="h-4 w-4 text-green-600" />;
      case 'neutral':
        return <Meh className="h-4 w-4 text-gray-600" />;
      case 'struggling':
        return <Frown className="h-4 w-4 text-yellow-600" />;
      case 'crisis':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-600" />;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'crisis':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const joinGroup = async (groupId: string) => {
    try {
      if (!isAuthenticated || !resolvedUserId) throw new Error('ログインが必要です');
      const success = await socialService.joinSupportGroup(resolvedUserId, groupId);
      if (success) {
        loadSocialData();
      }
    } catch (error) {
      console.error('Group join error:', error);
    }
  };

  const createPost = async () => {
    if (!newPostContent.trim()) return;

    try {
      if (!isAuthenticated || !resolvedUserId) throw new Error('ログインが必要です');
      await socialService.createCommunityPost(resolvedUserId, {
        groupId: selectedGroup || undefined,
        type: 'discussion',
        title: newPostContent.split('\n')[0] || 'タイトルなし',
        content: newPostContent,
        tags: [],
        emotionalTone: 'neutral',
        sensitivityLevel: 'low',
        isPinned: false,
        isModerated: false,
        visibility: 'community',
      });

      setNewPostContent('');
      setShowNewPostDialog(false);
      loadSocialData();
    } catch (error) {
      console.error('Post creation error:', error);
    }
  };

  const requestSupport = async (type: string, urgency: string) => {
    try {
      if (!isAuthenticated || !resolvedUserId) throw new Error('ログインが必要です');
      await socialService.requestSupportMatch(resolvedUserId, {
        type: type as any,
        urgency: urgency as any,
        duration: 'short_term',
        topics: ['一般的なサポート'],
        preferredSupporter: {
          experience: [],
          traits: [],
          communicationStyle: [],
          availability: [],
        },
      });

      loadSocialData();
    } catch (error) {
      console.error('Support request error:', error);
    }
  };

  const SupportGroupCard: React.FC<{ group: SupportGroup }> = ({ group }) => (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getGroupTypeIcon(group.type)}
            <CardTitle className="text-lg">{group.name}</CardTitle>
          </div>
          <Badge variant="outline" className="text-xs">
            {group.memberCount}/{group.maxMembers}
          </Badge>
        </div>
        <CardDescription className="text-sm">{group.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">参加者</span>
            <div className="flex items-center gap-2">
              <Progress value={(group.memberCount / group.maxMembers) * 100} className="w-16 h-2" />
              <span>{group.memberCount}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">最終活動</span>
            <span>{group.lastActivity.toLocaleDateString('ja-JP')}</span>
          </div>

          <div className="flex gap-2 pt-2">
            <Button size="sm" onClick={() => joinGroup(group.id)} className="flex-1">
              <UserPlus className="h-3 w-3 mr-1" />
              参加
            </Button>
            <Button size="sm" variant="outline" onClick={() => setSelectedGroup(group.id)}>
              <Eye className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const CommunityPostCard: React.FC<{ post: CommunityPost }> = ({ post }) => (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarFallback>{post.authorId.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base">{post.title}</CardTitle>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span>{post.authorId}</span>
                <span>•</span>
                <span>{post.createdAt.toLocaleDateString('ja-JP')}</span>
                {getEmotionalToneIcon(post.emotionalTone)}
              </div>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            {post.type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-700 mb-3">{post.content}</p>

        <div className="flex items-center gap-4 text-sm">
          <Button variant="ghost" size="sm" className="p-1 h-auto">
            <ThumbsUp className="h-3 w-3 mr-1" />
            {post.reactions.filter((r) => r.type === 'helpful').length}
          </Button>
          <Button variant="ghost" size="sm" className="p-1 h-auto">
            <Heart className="h-3 w-3 mr-1" />
            {post.reactions.filter((r) => r.type === 'empathy').length}
          </Button>
          <Button variant="ghost" size="sm" className="p-1 h-auto">
            <MessageSquare className="h-3 w-3 mr-1" />
            {post.replies.length}
          </Button>
          <Button variant="ghost" size="sm" className="p-1 h-auto ml-auto">
            <Share className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const SupportMatchCard: React.FC<{ match: SupportMatch }> = ({ match }) => (
    <Card className="mb-3">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">
            {match.type === 'peer_support'
              ? 'ピアサポート'
              : match.type === 'mentoring'
                ? 'メンタリング'
                : match.type === 'crisis_support'
                  ? 'クライシスサポート'
                  : 'サポート'}
          </CardTitle>
          <Badge className={getUrgencyColor(match.urgency)}>
            {match.urgency === 'crisis'
              ? '緊急'
              : match.urgency === 'high'
                ? '高'
                : match.urgency === 'medium'
                  ? '中'
                  : '低'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">ステータス</span>
            <span>
              {match.status === 'pending'
                ? '待機中'
                : match.status === 'matched'
                  ? 'マッチ済み'
                  : match.status === 'active'
                    ? '進行中'
                    : '完了'}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">期間</span>
            <span>
              {match.duration === 'one_time'
                ? '1回'
                : match.duration === 'short_term'
                  ? '短期'
                  : match.duration === 'long_term'
                    ? '長期'
                    : '継続'}
            </span>
          </div>

          {match.topics.length > 0 && (
            <div className="pt-2">
              <div className="text-xs text-gray-600 mb-1">トピック</div>
              <div className="flex flex-wrap gap-1">
                {match.topics.map((topic, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {match.status === 'matched' && (
            <Button size="sm" className="w-full mt-2">
              <MessageCircle className="h-3 w-3 mr-1" />
              セッション開始
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const KnowledgeResourceCard: React.FC<{ resource: KnowledgeResource }> = ({ resource }) => (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base">{resource.title}</CardTitle>
          <Badge variant="outline" className="text-xs">
            {resource.type}
          </Badge>
        </div>
        <CardDescription className="text-sm">{resource.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">難易度</span>
            <Badge variant="outline" className="text-xs">
              {resource.difficulty === 'beginner'
                ? '初級'
                : resource.difficulty === 'intermediate'
                  ? '中級'
                  : '上級'}
            </Badge>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">所要時間</span>
            <span>{resource.timeToConsume}分</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">評価</span>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 text-yellow-500 fill-current" />
              <span>{resource.ratings.helpfulness.toFixed(1)}</span>
              <span className="text-gray-500">({resource.ratings.total_ratings})</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-center">
              <div className="font-medium">ADHD関連度</div>
              <Progress value={resource.adhdRelevance} className="h-1 mt-1" />
            </div>
            <div className="text-center">
              <div className="font-medium">ASD関連度</div>
              <Progress value={resource.asdRelevance} className="h-1 mt-1" />
            </div>
          </div>

          {resource.tags.length > 0 && (
            <div className="pt-2">
              <div className="flex flex-wrap gap-1">
                {resource.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Button size="sm" className="w-full">
            <BookOpen className="h-3 w-3 mr-1" />
            学習開始
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8 text-blue-600" />
            ソーシャルサポートネットワーク
          </h1>
          <p className="text-gray-600 mt-1">
            ADHD/ASDコミュニティとピアサポートによる包括的生活支援
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={() => setShowNewPostDialog(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            投稿作成
          </Button>

          <Button
            onClick={() => requestSupport('peer_support', 'medium')}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Handshake className="h-4 w-4" />
            サポート要請
          </Button>
        </div>
      </div>

      {/* コミュニティ統計 */}
      {communityStats && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Activity className="h-5 w-5" />
              コミュニティ状況
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{communityStats.totalUsers}</div>
                <div className="text-sm text-gray-600">メンバー</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {communityStats.totalGroups}
                </div>
                <div className="text-sm text-gray-600">サポートグループ</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {communityStats.totalPosts}
                </div>
                <div className="text-sm text-gray-600">投稿数</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {communityStats.activeMatches}
                </div>
                <div className="text-sm text-gray-600">アクティブマッチ</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {Math.round(communityStats.communityHealth)}
                </div>
                <div className="text-sm text-gray-600">健康度</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* クライシスサポートアラート */}
      <Alert className="border-red-200 bg-red-50">
        <Shield className="h-4 w-4 text-red-600" />
        <AlertTitle className="text-red-800">🆘 24時間クライシスサポート</AlertTitle>
        <AlertDescription className="text-red-700">
          緊急時や危機的状況では躊躇なく専門機関にご連絡ください。
          当コミュニティでは24時間体制でクライシスサポートを提供しています。
          <Button size="sm" className="ml-2 bg-red-600 hover:bg-red-700">
            <Phone className="h-3 w-3 mr-1" />
            緊急サポート
          </Button>
        </AlertDescription>
      </Alert>

      {/* メインタブ */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="community">コミュニティ ({communityPosts.length})</TabsTrigger>
          <TabsTrigger value="groups">グループ ({supportGroups.length})</TabsTrigger>
          <TabsTrigger value="support">サポートマッチ ({supportMatches.length})</TabsTrigger>
          <TabsTrigger value="resources">知識リソース ({knowledgeResources.length})</TabsTrigger>
          <TabsTrigger value="professionals">専門家連携</TabsTrigger>
        </TabsList>

        {/* コミュニティタブ */}
        <TabsContent value="community" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                placeholder="投稿を検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              フィルター
            </Button>
          </div>

          <div className="space-y-4">
            {communityPosts
              .filter(
                (post) =>
                  !searchQuery ||
                  post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  post.content.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .slice(0, 10)
              .map((post) => (
                <CommunityPostCard key={post.id} post={post} />
              ))}
          </div>

          {communityPosts.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">まだ投稿がありません</h3>
                <p className="text-gray-600 mb-4">
                  最初の投稿を作成して、コミュニティを活性化させましょう。
                </p>
                <Button onClick={() => setShowNewPostDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  最初の投稿を作成
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* グループタブ */}
        <TabsContent value="groups" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {supportGroups.map((group) => (
              <SupportGroupCard key={group.id} group={group} />
            ))}
          </div>
        </TabsContent>

        {/* サポートマッチタブ */}
        <TabsContent value="support" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">アクティブなサポート</h3>
              {supportMatches.length > 0 ? (
                <div className="space-y-3">
                  {supportMatches.map((match) => (
                    <SupportMatchCard key={match.id} match={match} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-6 text-center">
                    <Handshake className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">サポートマッチなし</h3>
                    <p className="text-gray-600 mb-4">
                      まだサポートマッチがありません。サポートを要請してみましょう。
                    </p>
                    <Button onClick={() => requestSupport('peer_support', 'medium')}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      サポート要請
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">サポート提供</h3>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">サポーターとして活動</CardTitle>
                  <CardDescription>
                    他のメンバーをサポートして、コミュニティに貢献しましょう
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full" variant="outline">
                    <Heart className="h-4 w-4 mr-2" />
                    ピアサポーター登録
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Star className="h-4 w-4 mr-2" />
                    メンター登録
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Shield className="h-4 w-4 mr-2" />
                    クライシスサポーター登録
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* 知識リソースタブ */}
        <TabsContent value="resources" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                placeholder="リソースを検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              カテゴリ
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {knowledgeResources
              .filter(
                (resource) =>
                  !searchQuery ||
                  resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  resource.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
              )
              .map((resource) => (
                <KnowledgeResourceCard key={resource.id} resource={resource} />
              ))}
          </div>
        </TabsContent>

        {/* 専門家連携タブ */}
        <TabsContent value="professionals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-purple-600" />
                専門家との連携
              </CardTitle>
              <CardDescription>
                認定された専門家からの支援とガイダンスを受けることができます
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button className="h-auto p-4 flex flex-col items-start gap-2" variant="outline">
                  <div className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">臨床心理士</span>
                  </div>
                  <span className="text-sm text-gray-600">
                    ADHD/ASD専門の心理療法・カウンセリング
                  </span>
                </Button>

                <Button className="h-auto p-4 flex flex-col items-start gap-2" variant="outline">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-600" />
                    <span className="font-medium">精神科医</span>
                  </div>
                  <span className="text-sm text-gray-600">診断・薬物療法・医学的管理</span>
                </Button>

                <Button className="h-auto p-4 flex flex-col items-start gap-2" variant="outline">
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-purple-600" />
                    <span className="font-medium">作業療法士</span>
                  </div>
                  <span className="text-sm text-gray-600">感覚統合・日常生活スキル向上</span>
                </Button>

                <Button className="h-auto p-4 flex flex-col items-start gap-2" variant="outline">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-600" />
                    <span className="font-medium">ADHDコーチ</span>
                  </div>
                  <span className="text-sm text-gray-600">実行機能・生活スキル指導</span>
                </Button>
              </div>

              <Alert className="bg-blue-50 border-blue-200">
                <HelpCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-700">
                  すべての専門家は資格認証済みで、ADHD/ASD支援の専門知識を持っています。
                  相談は有料ですが、初回相談は無料で受けられます。
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 新規投稿ダイアログ */}
      {showNewPostDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="max-w-md w-full mx-4">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                新しい投稿
                <Button variant="ghost" size="sm" onClick={() => setShowNewPostDialog(false)}>
                  ×
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="投稿内容を入力してください..."
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                rows={4}
              />

              <div className="flex gap-2">
                <Button onClick={createPost} className="flex-1">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  投稿
                </Button>
                <Button variant="outline" onClick={() => setShowNewPostDialog(false)}>
                  キャンセル
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SocialSupportDashboard;
