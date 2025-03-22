import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import BookShelf from '@/components/BookShelf';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  BookOpen, 
  Import, 
  BookMarked, 
  Users, 
  Target,
  Trophy,
  BarChart,
  Sparkles,
  PenTool,
  Crown,
  BookText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import ReadingGoals from '@/components/ReadingGoals';
import BookImport from '@/components/BookImport';
import ReadingList from '@/components/ReadingList';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// モチベーションを高める読書チャレンジコンポーネント
const ReadingChallenges = () => {
    // selectedChallengeの型を明示的に定義し、初期値をnullではなく未定義に
    const [selectedChallenge, setSelectedChallenge] = useState<{
      id: number;
      title: string;
      description: string;
      progress: number;
      total: number;
      deadline: string;
      badge: string;
      isPremium: boolean;
    } | undefined>(undefined);
  
  const challenges = [
    {
      id: 1,
      title: "52冊チャレンジ",
      description: "1年間で52冊の本を読破する",
      progress: 12,
      total: 52,
      deadline: "2024年12月31日",
      badge: "ブックマスター",
      isPremium: false
    },
    {
      id: 2,
      title: "ジャンル拡大",
      description: "10の異なるジャンルから本を読む",
      progress: 4,
      total: 10,
      deadline: "2024年6月30日",
      badge: "エクスプローラー",
      isPremium: false
    },
    {
      id: 3,
      title: "古典文学マスター",
      description: "世界の古典文学20選を読破する",
      progress: 3,
      total: 20,
      deadline: "2024年12月31日",
      badge: "文学の達人",
      isPremium: true
    }
  ];
  
  // 選択されたチャレンジを表示するコンポーネント（実際に値を使用）
  const renderSelectedChallenge = () => {
    if (!selectedChallenge) return null;
    
    return (
      <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-md">
        <h3 className="font-medium text-lg mb-2">{selectedChallenge.title}</h3>
        <p className="mb-2">{selectedChallenge.description}</p>
        <div className="flex justify-between text-sm mb-1">
          <span>進捗状況</span>
          <span>{selectedChallenge.progress} / {selectedChallenge.total}</span>
        </div>
        <Progress 
          value={(selectedChallenge.progress / selectedChallenge.total) * 100} 
          className="h-2 mb-3" 
        />
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">目標達成まで: {selectedChallenge.total - selectedChallenge.progress}冊</span>
          <span className="text-sm text-gray-600">獲得バッジ: {selectedChallenge.badge}</span>
        </div>
        <div className="mt-3 text-right">
          <Button size="sm" variant="outline" onClick={() => setSelectedChallenge(undefined)}>
            閉じる
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" />
          読書チャレンジ
        </CardTitle>
        <CardDescription>
          読書のモチベーションを高めるためのチャレンジに挑戦しましょう
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {challenges.map(challenge => (
            <Card 
              key={challenge.id} 
              className={`hover:shadow-md transition-shadow ${challenge.isPremium ? 'border-amber-200' : ''}`}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base">{challenge.title}</CardTitle>
                  {challenge.isPremium && (
                    <Badge variant="outline" className="bg-amber-100 text-amber-800">
                      <Crown className="h-3 w-3 mr-1" />
                      プレミアム
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-xs">{challenge.description}</CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>進捗</span>
                    <span className="font-medium">{challenge.progress}/{challenge.total}</span>
                  </div>
                  <Progress value={(challenge.progress / challenge.total) * 100} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>期限: {challenge.deadline}</span>
                    <span>獲得バッジ: {challenge.badge}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => setSelectedChallenge(challenge)}
                >
                  詳細を見る
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        {/* 選択されたチャレンジの詳細を表示 */}
        {renderSelectedChallenge()}
      </CardContent>
      <CardFooter className="flex justify-between">
        <span className="text-sm text-muted-foreground">
          チャレンジを完了すると特別なバッジが獲得できます
        </span>
        <Button variant="link" size="sm">
          すべてのチャレンジを見る
        </Button>
      </CardFooter>
    </Card>
  );
};

// 読書コミュニティコンポーネント
const ReadingCommunity = ({ isPremium = false }) => {
  const bookClubs = [
    {
      id: 1,
      name: "SF愛好会",
      members: 128,
      currentBook: "ニューロマンサー",
      meetingDate: "毎週水曜日 20:00",
      avatar: "/images/sf-club.jpg"
    },
    {
      id: 2,
      name: "ビジネス書読書会",
      members: 85,
      currentBook: "アトミック・ハビット",
      meetingDate: "隔週金曜日 19:00",
      avatar: "/images/business-club.jpg"
    },
    {
      id: 3,
      name: "古典文学クラブ",
      members: 52,
      currentBook: "罪と罰",
      meetingDate: "毎月第一土曜日 15:00",
      avatar: "/images/classic-club.jpg",
      isPremium: true
    }
  ];
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-500" />
          読書コミュニティ
        </CardTitle>
        <CardDescription>
          同じ本を読む仲間と交流し、読書体験を共有しましょう
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {bookClubs.map(club => (
            <div 
              key={club.id} 
              className={`flex items-center p-4 rounded-lg border ${
                club.isPremium ? 'border-amber-200 bg-amber-50' : 'border-gray-200'
              }`}
            >
              <Avatar className="h-12 w-12 mr-4">
                <AvatarImage src={club.avatar} alt={club.name} />
                <AvatarFallback>{club.name.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center">
                  <h3 className="font-medium">{club.name}</h3>
                  {club.isPremium && (
                    <Badge variant="outline" className="ml-2 bg-amber-100 text-amber-800">
                      <Crown className="h-3 w-3 mr-1" />
                      プレミアム
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">メンバー: {club.members}人</p>
                <p className="text-sm">現在の本: {club.currentBook}</p>
                <p className="text-xs text-muted-foreground">次回ミーティング: {club.meetingDate}</p>
              </div>
              <Button 
                variant={club.isPremium && !isPremium ? "outline" : "default"} 
                size="sm"
                disabled={club.isPremium && !isPremium}
              >
                {club.isPremium && !isPremium ? "プレミアム限定" : "参加する"}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">
          すべてのコミュニティを見る
        </Button>
      </CardFooter>
    </Card>
  );
};

// 読書分析コンポーネント
const ReadingAnalytics = ({ isPremium = false }) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart className="h-5 w-5 text-indigo-500" />
          読書分析
        </CardTitle>
        <CardDescription>
          あなたの読書傾向とハビットを可視化します
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm">読書ペース</CardTitle>
            </CardHeader>
            <CardContent className="py-2">
              <div className="text-2xl font-bold mb-1">2.5 冊/週</div>
              <div className="text-xs text-muted-foreground">前週比 +0.5冊</div>
              <div className="h-[100px] w-full bg-gray-100 rounded mt-2 flex items-end">
                <div className="w-1/7 h-[30px] bg-primary mx-0.5 rounded-t"></div>
                <div className="w-1/7 h-[50px] bg-primary mx-0.5 rounded-t"></div>
                <div className="w-1/7 h-[20px] bg-primary mx-0.5 rounded-t"></div>
                <div className="w-1/7 h-[60px] bg-primary mx-0.5 rounded-t"></div>
                <div className="w-1/7 h-[40px] bg-primary mx-0.5 rounded-t"></div>
                <div className="w-1/7 h-[10px] bg-primary mx-0.5 rounded-t"></div>
                <div className="w-1/7 h-[70px] bg-primary mx-0.5 rounded-t"></div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm">ジャンル分布</CardTitle>
            </CardHeader>
            <CardContent className="py-2">
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>SF・ファンタジー</span>
                    <span>35%</span>
                  </div>
                  <Progress value={35} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>ビジネス</span>
                    <span>25%</span>
                  </div>
                  <Progress value={25} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>小説</span>
                    <span>20%</span>
                  </div>
                  <Progress value={20} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>その他</span>
                    <span>20%</span>
                  </div>
                  <Progress value={20} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {isPremium ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="py-2">
                <CardTitle className="text-sm">読書時間帯</CardTitle>
              </CardHeader>
              <CardContent className="py-2">
                <div className="text-center p-4">
                  <div className="text-xl font-bold">21:00 - 23:00</div>
                  <div className="text-xs text-muted-foreground">最も集中できる時間帯</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="py-2">
                <CardTitle className="text-sm">集中力スコア</CardTitle>
              </CardHeader>
              <CardContent className="py-2">
                <div className="text-center p-4">
                  <div className="text-xl font-bold">8.5 / 10</div>
                  <div className="text-xs text-muted-foreground">前月比 +1.2ポイント</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="py-2">
                <CardTitle className="text-sm">読書速度</CardTitle>
              </CardHeader>
              <CardContent className="py-2">
                <div className="text-center p-4">
                  <div className="text-xl font-bold">320 WPM</div>
                  <div className="text-xs text-muted-foreground">平均より15%速い</div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="border-dashed border-2 border-gray-300 bg-gray-50">
            <CardContent className="flex flex-col items-center justify-center p-6">
              <Crown className="h-8 w-8 text-amber-500 mb-2" />
              <h3 className="font-medium text-center mb-1">プレミアム分析</h3>
              <p className="text-sm text-center text-muted-foreground mb-4">
                プレミアムプランで詳細な読書分析、集中力スコア、読書速度などの高度な分析が利用できます
              </p>
              <Button>プレミアムにアップグレード</Button>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};

// メインコンポーネント
const BookShelfPage: React.FC = () => {
  const [showMotivationTip, setShowMotivationTip] = useState(true);
  const [activeTab, setActiveTab] = useState("bookshelf");
  const isPremium = useSelector((state: RootState) => state.user?.hasActiveSubscription) || false;
  
  // 読書モチベーションのヒント
  const motivationTips = [
    "1日15分の読書習慣を始めましょう。短い時間から始めることで継続しやすくなります。",
    "本棚を見える場所に置くと、読書を思い出すきっかけになります。",
    "読書記録をつけることで、達成感を得られ、モチベーションが続きます。",
    "読書仲間を見つけると、本の話で盛り上がり、新しい視点も得られます。",
    "自分の興味のあるジャンルから始め、少しずつ範囲を広げていきましょう。"
  ];
  
  const randomTip = motivationTips[Math.floor(Math.random() * motivationTips.length)];
  
  // 読書の統計
  const stats = {
    totalBooks: 87,
    completedThisYear: 12,
    currentlyReading: 3,
    averagePagesPerDay: 28,
    streak: 15 // 連続読書日数
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">パーソナル読書管理</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          読書習慣を育て、知識を広げ、人生を豊かにするための本棚アプリです
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
              <h3 className="font-medium text-blue-800 mb-1">今日の読書モチベーション</h3>
              <p className="text-blue-700">{randomTip}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* 読書ステータスカード */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <BookText className="h-5 w-5 text-primary" />
              読書の統計
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">総読書冊数</p>
                <p className="text-xl font-bold">{stats.totalBooks}冊</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">今年読了</p>
                <p className="text-xl font-bold">{stats.completedThisYear}冊</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">現在読書中</p>
                <p className="text-xl font-bold">{stats.currentlyReading}冊</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">平均ページ/日</p>
                <p className="text-xl font-bold">{stats.averagePagesPerDay}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">読書ストリーク</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="mr-4">
                <div className="text-3xl font-bold text-primary">{stats.streak}</div>
                <div className="text-sm text-muted-foreground">連続日数</div>
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span>目標: 30日間</span>
                  <span>{Math.round((stats.streak / 30) * 100)}%</span>
                </div>
                <Progress value={(stats.streak / 30) * 100} className="h-2 mb-2" />
                <p className="text-xs text-muted-foreground">
                  あと{30 - stats.streak}日で30日間の読書習慣達成！
                </p>
              </div>
            </div>
            <div className="mt-3 flex justify-center gap-1">
              {Array.from({ length: 7 }).map((_, i) => (
                <div 
                  key={i} 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                    i < 5 ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {(new Date(Date.now() - (6-i) * 86400000)).getDate()}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* メインタブ */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-8">
        <TabsList className="mb-4 flex flex-wrap justify-center">
          <TabsTrigger value="bookshelf" className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            <span>本棚</span>
          </TabsTrigger>
          <TabsTrigger value="reading-list" className="flex items-center gap-1">
            <BookMarked className="h-4 w-4" />
            <span>読書リスト</span>
          </TabsTrigger>
          <TabsTrigger value="goals" className="flex items-center gap-1">
            <Target className="h-4 w-4" />
            <span>読書目標</span>
          </TabsTrigger>
          <TabsTrigger value="challenges" className="flex items-center gap-1">
            <Trophy className="h-4 w-4" />
            <span>チャレンジ</span>
          </TabsTrigger>
          <TabsTrigger value="community" className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>コミュニティ</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-1">
            <BarChart className="h-4 w-4" />
            <span>分析</span>
          </TabsTrigger>
          <TabsTrigger value="import" className="flex items-center gap-1">
            <Import className="h-4 w-4" />
            <span>インポート</span>
          </TabsTrigger>
        </TabsList>
        
        {/* 本棚タブ */}
        <TabsContent value="bookshelf">
          <Card className="w-full">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    あなたの本棚
                  </CardTitle>
                  <CardDescription>
                    所有している本を管理し、整理することができます
                  </CardDescription>
                </div>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <PenTool className="h-4 w-4 mr-2" />
                      メモを記録
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>読書メモを記録</DialogTitle>
                      <DialogDescription>
                        読んだ本の感想や学び、引用したい文章を記録しましょう
                      </DialogDescription>
                    </DialogHeader>
                    {/* ダイアログの内容 */}
                    <DialogFooter>
                      <Button type="submit">保存する</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <BookShelf />
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* 読書リストタブ */}
        <TabsContent value="reading-list">
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookMarked className="h-5 w-5 text-indigo-500" />
                読書リスト
              </CardTitle>
              <CardDescription>
                読みたい本のリストを管理します。優先順位を設定したり、メモを追加したりできます。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReadingList />
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* 読書目標タブ */}
        <TabsContent value="goals">
          <ReadingGoals />
        </TabsContent>
        
        {/* チャレンジタブ */}
        <TabsContent value="challenges">
          <ReadingChallenges />
        </TabsContent>
        
        {/* コミュニティタブ */}
        <TabsContent value="community">
          <ReadingCommunity isPremium={isPremium} />
        </TabsContent>
        
        {/* 分析タブ */}
        <TabsContent value="analytics">
          <ReadingAnalytics isPremium={isPremium} />
        </TabsContent>
        
        {/* インポートタブ */}
        <TabsContent value="import">
          <BookImport />
        </TabsContent>
      </Tabs>
      
      {/* プレミアム紹介セクション */}
      {!isPremium && (
        <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-500" />
              読書の冒険をさらに豊かに
            </CardTitle>
            <CardDescription>
              プレミアム機能であなたの読書体験がさらに充実します
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex">
                <div className="mr-4">
                  <div className="bg-amber-100 p-3 rounded-full">
                    <Users className="h-5 w-5 text-amber-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-1">プライベート読書会</h3>
                  <p className="text-sm text-muted-foreground">
                    同じ興味を持つ読書家との深い交流が可能になります
                  </p>
                </div>
              </div>
              
              <div className="flex">
                <div className="mr-4">
                  <div className="bg-amber-100 p-3 rounded-full">
                    <BarChart className="h-5 w-5 text-amber-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-1">高度な読書分析</h3>
                  <p className="text-sm text-muted-foreground">
                    あなたの読書習慣と効率を可視化し、最適化します
                  </p>
                </div>
              </div>
              
              <div className="flex">
                <div className="mr-4">
                  <div className="bg-amber-100 p-3 rounded-full">
                    <PenTool className="h-5 w-5 text-amber-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-1">AI読書アシスタント</h3>
                  <p className="text-sm text-muted-foreground">
                    AIがあなたの興味に合わせて本をレコメンドします
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
            <Button className="bg-amber-600 hover:bg-amber-700">
              プレミアムを始める
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default BookShelfPage;