import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import {
  ChevronDown, 
  ChevronUp, 
  Trophy, 
  Flame, 
  Target, 
  Info, 
  Plus,
  Star,
  Filter,
  BarChart2
} from 'lucide-react'
import { useHabitTracker } from '@/hooks/useHabitTracker'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

// デフォルトの習慣リスト
const defaultHabits = [
  "酒", "たばこ", "ジャンクフード", "睡眠不足", "SNSの過剰利用",
  "姿勢が悪い", "コンビニ弁当", "後回し癖", "ネガティブ思考"
]

// 習慣のカテゴリ定義
const habitCategories = {
  "健康": ["酒", "たばこ", "ジャンクフード", "睡眠不足", "姿勢が悪い", "コンビニ弁当", "エナジードリンク"],
  "生活": ["昼夜逆転", "後回し癖", "すぐSNS開く"],
  "マインド": ["ネガティブ", "失敗を恐れる", "嘘をつく", "すぐ否定する", "謎のプライド"],
  "その他": []
}

export default function HabitTracker() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [viewMode, setViewMode] = useState('active') // 'active', 'all', 'archived'
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [currentTab, setCurrentTab] = useState('list') // 'list', 'stats', 'calendar'
  const [newHabit, setNewHabit] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  
  const {
    currentDate,
    stats,
    isLoading,
    error,
    showCongrats,
    toggleHabit,
    handleMonthChange,
    getHabitData,
    addCustomHabit,
    archiveHabit,
    unarchiveHabit,
    deleteHabit,
    getActiveHabits,
    getArchivedHabits,
    getAllHabits,
    getCategoryHabits
  } = useHabitTracker(defaultHabits)

  // 表示する習慣のリストを取得
  const getVisibleHabits = () => {
    let habitsList: string[] = [];
    
    // ビューモードによるフィルタリング
    if (viewMode === 'active') {
      habitsList = getActiveHabits();
    } else if (viewMode === 'archived') {
      habitsList = getArchivedHabits();
    } else {
      habitsList = getAllHabits();
    }
    
    // カテゴリによるフィルタリング
    if (selectedCategory !== 'all') {
      habitsList = habitsList.filter(habit => 
        getCategoryHabits(selectedCategory).includes(habit)
      );
    }
    
    return habitsList;
  }

  // 新しい習慣を追加
  const handleAddHabit = () => {
    if (newHabit.trim()) {
      addCustomHabit(newHabit.trim());
      setNewHabit('');
      setShowAddForm(false);
    }
  }

  // ヒートマップの描画
  const renderHeatmap = (habit) => {
    const habitData = getHabitData(habit)
    const today = new Date().getDate()
    
    return habitData.map((avoided, index) => {
      // 今日以降の日付はグレーアウト
      const isFutureDate = index + 1 > today
      
      return (
        <div
          key={index}
          className={`w-4 h-4 ${
            isFutureDate 
              ? 'bg-gray-200 cursor-not-allowed' 
              : avoided 
                ? 'bg-green-500 hover:opacity-75 cursor-pointer' 
                : 'bg-red-200 hover:opacity-75 cursor-pointer'
          } transition-opacity rounded`}
          title={`${currentDate.getFullYear()}年${currentDate.getMonth() + 1}月${index + 1}日: ${avoided ? '達成' : '未達成'}`}
          onClick={() => !isFutureDate && toggleHabit(habit, index)}
          aria-label={`${avoided ? '達成' : '未達成'}: ${index + 1}日目`}
        />
      )
    })
  }

  // 達成率バッジの生成
  const getAchievementBadge = (percentage) => {
    if (percentage >= 90) {
      return <Badge className="bg-green-500">優秀</Badge>
    } else if (percentage >= 70) {
      return <Badge className="bg-blue-500">良好</Badge>
    } else if (percentage >= 50) {
      return <Badge className="bg-yellow-500">普通</Badge>
    } else {
      return <Badge className="bg-red-500">要改善</Badge>
    }
  }

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="flex justify-center items-center h-32">
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription className="flex items-center gap-2">
          <Info className="h-4 w-4" />
          {error}
        </AlertDescription>
      </Alert>
    )
  }

  const visibleHabits = getVisibleHabits();

  return (
    <Card className="w-full shadow-sm">
      <CardHeader 
        className="cursor-pointer hover:bg-gray-50 transition-colors flex flex-row items-center justify-between space-y-0 pb-2" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <CardTitle className="text-md font-semibold flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" aria-hidden="true" />
          やらないこと トラッカー
        </CardTitle>
        <div className="flex items-center gap-2">
          {showCongrats && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Trophy className="h-3 w-3 mr-1" />
              1週間達成!
            </Badge>
          )}
          <Button variant="ghost" size="sm" className="p-1 h-auto">
            {isExpanded ? <ChevronUp size={18} aria-label="折りたたむ" /> : <ChevronDown size={18} aria-label="展開する" />}
          </Button>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <>
          <CardContent className="pt-3">
            <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
              <div className="flex justify-between items-center mb-4">
                <TabsList>
                  <TabsTrigger value="list" className="text-sm px-3">
                    リスト
                  </TabsTrigger>
                  <TabsTrigger value="stats" className="text-sm px-3">
                    統計
                  </TabsTrigger>
                  <TabsTrigger value="calendar" className="text-sm px-3">
                    カレンダー
                  </TabsTrigger>
                </TabsList>
                
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8">
                        <Filter className="h-3 w-3 mr-1" />
                        <span className="text-xs">
                          {viewMode === 'active' ? '進行中' : viewMode === 'archived' ? 'アーカイブ' : 'すべて'}
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setViewMode('active')}>
                        進行中
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setViewMode('archived')}>
                        アーカイブ済み
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setViewMode('all')}>
                        すべて表示
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8">
                        <Filter className="h-3 w-3 mr-1" />
                        <span className="text-xs">
                          {selectedCategory === 'all' ? 'すべて' : selectedCategory}
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setSelectedCategory('all')}>
                        すべてのカテゴリ
                      </DropdownMenuItem>
                      {Object.keys(habitCategories).map(category => (
                        <DropdownMenuItem 
                          key={category} 
                          onClick={() => setSelectedCategory(category)}
                        >
                          {category}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <Button 
                    size="sm" 
                    variant="ghost"
                    className="h-8"
                    onClick={() => setShowAddForm(!showAddForm)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {showAddForm && (
                <div className="mb-4 flex items-center gap-2 bg-gray-50 p-3 rounded-md">
                  <Input
                    value={newHabit}
                    onChange={(e) => setNewHabit(e.target.value)}
                    placeholder="新しい習慣を入力"
                    className="flex-1"
                  />
                  <Button 
                    size="sm" 
                    onClick={handleAddHabit}
                    disabled={!newHabit.trim()}
                  >
                    追加
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => setShowAddForm(false)}
                  >
                    キャンセル
                  </Button>
                </div>
              )}
              
              <TabsContent value="list" className="mt-0">
                {visibleHabits.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-md border border-dashed border-gray-300">
                    <Target className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500">
                      {viewMode === 'active' 
                        ? '進行中の習慣がありません' 
                        : viewMode === 'archived' 
                          ? 'アーカイブされた習慣はありません' 
                          : '習慣が登録されていません'}
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-4"
                      onClick={() => setShowAddForm(true)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      新しい習慣を追加
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[180px]">やらないこと</TableHead>
                          <TableHead className="w-[80px]">今日</TableHead>
                          <TableHead>継続状況</TableHead>
                          <TableHead className="w-[100px]">ステータス</TableHead>
                          <TableHead className="w-[60px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {visibleHabits.map((habit, index) => {
                          const habitStats = stats[habit] || {
                            currentStreak: 0,
                            longestStreak: 0,
                            monthlyProgress: 0
                          }
                          
                          return (
                            <TableRow key={index} className="h-[60px]">
                              <TableCell className="font-medium">
                                <div className="flex items-center">
                                  <span>{habit}</span>
                                  {habitStats.longestStreak >= 30 && (
                                    <Badge variant="outline" className="ml-2 bg-yellow-50">
                                      <Star className="h-3 w-3 text-yellow-500 mr-1" />
                                      マスター
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Checkbox
                                  checked={getHabitData(habit)[currentDate.getDate() - 1] || false}
                                  onCheckedChange={() => toggleHabit(habit, currentDate.getDate() - 1)}
                                  aria-label={`${habit}を今日達成したかどうか`}
                                />
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col gap-1">
                                  <div className="flex flex-wrap gap-1">
                                    {renderHeatmap(habit)}
                                  </div>
                                  <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <Flame className="h-3 w-3 text-orange-500" />
                                    <span>{habitStats.currentStreak}日連続</span>
                                    {habitStats.currentStreak >= 7 && (
                                      <Badge variant="outline" className="h-5 px-1 bg-yellow-50 text-xs">
                                        🔥
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col gap-1">
                                  <Progress
                                    value={habitStats.monthlyProgress}
                                    className="h-2 w-full"
                                  />
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-500">
                                      {habitStats.monthlyProgress}%
                                    </span>
                                    {getAchievementBadge(habitStats.monthlyProgress)}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                      <span className="sr-only">メニューを開く</span>
                                      <ChevronDown className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    {viewMode !== 'archived' ? (
                                      <DropdownMenuItem onClick={() => archiveHabit(habit)}>
                                        アーカイブする
                                      </DropdownMenuItem>
                                    ) : (
                                      <DropdownMenuItem onClick={() => unarchiveHabit(habit)}>
                                        アーカイブから戻す
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem 
                                      className="text-red-600"
                                      onClick={() => deleteHabit(habit)}
                                    >
                                      削除する
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="stats" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center">
                        <BarChart2 className="h-4 w-4 mr-2 text-blue-500" />
                        達成率トップ5
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {Object.entries(stats)
                        .filter(([habit]) => getActiveHabits().includes(habit))
                        .sort((a, b) => b[1].monthlyProgress - a[1].monthlyProgress)
                        .slice(0, 5)
                        .map(([habit, habitStats], index) => (
                          <div key={index} className="mb-2">
                            <div className="flex justify-between text-sm mb-1">
                              <span>{habit}</span>
                              <span>{habitStats.monthlyProgress}%</span>
                            </div>
                            <Progress value={habitStats.monthlyProgress} className="h-2" />
                          </div>
                        ))
                      }
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center">
                        <Flame className="h-4 w-4 mr-2 text-orange-500" />
                        最長継続記録
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {Object.entries(stats)
                        .filter(([habit]) => getActiveHabits().includes(habit))
                        .sort((a, b) => b[1].longestStreak - a[1].longestStreak)
                        .slice(0, 5)
                        .map(([habit, habitStats], index) => (
                          <div key={index} className="flex justify-between items-center mb-2 pb-2 border-b last:border-0">
                            <span className="text-sm">{habit}</span>
                            <Badge className={habitStats.longestStreak >= 30 ? 'bg-yellow-500' : 'bg-blue-500'}>
                              {habitStats.longestStreak}日
                            </Badge>
                          </div>
                        ))
                      }
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="calendar" className="mt-0">
                <div className="mb-4 flex items-center justify-center gap-4">
                  <Button 
                    onClick={() => handleMonthChange(-1)}
                    variant="outline"
                    size="sm"
                    aria-label="前月へ移動"
                  >
                    前月
                  </Button>
                  <span className="text-lg font-medium">
                    {currentDate.getFullYear()}年 {currentDate.getMonth() + 1}月
                  </span>
                  <Button 
                    onClick={() => handleMonthChange(1)}
                    variant="outline"
                    size="sm"
                    aria-label="次月へ移動"
                  >
                    次月
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getActiveHabits().slice(0, 4).map((habit, index) => {
                    const habitStats = stats[habit] || {
                      currentStreak: 0,
                      longestStreak: 0,
                      monthlyProgress: 0
                    }
                    
                    return (
                      <Card key={index}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium flex items-center justify-between">
                            <span>{habit}</span>
                            <Badge>{habitStats.monthlyProgress}% 達成</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-1">
                            {renderHeatmap(habit)}
                          </div>
                          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                            <div className="flex items-center">
                              <Flame className="h-3 w-3 text-orange-500 mr-1" />
                              <span>現在: {habitStats.currentStreak}日連続</span>
                            </div>
                            <div className="flex items-center">
                              <Trophy className="h-3 w-3 text-yellow-500 mr-1" />
                              <span>最長: {habitStats.longestStreak}日</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          
          <CardFooter className="pt-0 justify-between text-xs text-gray-500">
            <p>継続は力なり。日々の小さな変化が大きな変化を生み出します。</p>
            <div className="flex items-center gap-2">
              <Flame className="h-3 w-3 text-orange-500" />
              <span>合計{Object.values(stats).reduce((sum, stat) => sum + stat.currentStreak, 0)}日継続中</span>
            </div>
          </CardFooter>
        </>
      )}
    </Card>
  )
}