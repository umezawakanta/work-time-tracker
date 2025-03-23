import { useState } from 'react'
import SleepTracker from '@/components/SleepTracker'
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Moon, Sun, Settings, Crown, Bell } from 'lucide-react'

export default function SleepTrackerPage() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  
  // ダークモード切り替え
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    // 実際のダークモード実装はここに追加
  }
  
  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-50'}`}>
      {/* ヘッダー */}
      <header className="sticky top-0 bg-white dark:bg-gray-800 shadow z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <Moon className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mr-2" />
            <h1 className="text-xl font-bold">Sleep Tracker Pro</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
            <div className="flex items-center">
              <Badge className="mr-2 bg-gradient-to-r from-purple-600 to-blue-500">
                <Crown className="h-3 w-3 mr-1" />
                PRO
              </Badge>
              <Avatar className="h-8 w-8">
                <AvatarImage src="/avatar.png" alt="User" />
                <AvatarFallback>ユ</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>
      
      {/* メインコンテンツ */}
      <main className="container mx-auto px-4 py-8 mb-16">
        <div className="mb-6 text-center">
          <h1 className="text-4xl font-bold mb-2">あなたの睡眠を可視化</h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            より良い睡眠習慣を身につけ、日中のパフォーマンスを向上させましょう。
            あなたの睡眠パターンを分析し、最適な睡眠サイクルを見つけましょう。
          </p>
        </div>
        
        <SleepTracker />
      </main>
      
      {/* フッター */}
      <footer className="bg-white dark:bg-gray-800 border-t py-8 mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center">
                <Moon className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mr-2" />
                <span className="text-lg font-bold">Sleep Tracker Pro</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                ©2025 Sleep Tracker Pro. All rights reserved.
              </p>
            </div>
            
            <div className="flex space-x-6">
              <a href="#" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                利用規約
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                プライバシーポリシー
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                ヘルプ
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                お問い合わせ
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}