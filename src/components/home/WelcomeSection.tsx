import React from 'react';
import { Button } from '@/components/ui/button';
import { Clock, Sparkles, ArrowRight, ShoppingBag, Star, Zap, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface WelcomeSectionProps {
  onGetStarted: () => void;
}

export const WelcomeSection: React.FC<WelcomeSectionProps> = ({ onGetStarted }) => {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      {/* 背景エフェクト */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/50"></div>
      </div>

      <div className="relative container mx-auto px-4 py-24 lg:py-32">
        <div className="text-center max-w-4xl mx-auto">
          {/* ヒーローアイコン */}
          <div className="flex justify-center mb-8">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>
              <div className="relative w-32 h-32 bg-gradient-to-br from-white to-blue-50 rounded-3xl flex items-center justify-center shadow-2xl">
                <Clock className="h-16 w-16 text-blue-600" />
                <Sparkles className="absolute -top-2 -right-2 h-8 w-8 text-amber-400 animate-pulse" />
              </div>
            </div>
          </div>

          {/* メインコピー */}
          <div className="space-y-6 mb-12">
            <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-300 bg-clip-text text-transparent">
                人生の舵を、今日から握り直す。
              </span>
            </h1>
            <p className="text-xl lg:text-2xl text-slate-300 mb-8 leading-relaxed max-w-3xl mx-auto">
              あなたの生産性と効率性を最大限に引き出す
              <br />
              <span className="text-blue-300 font-semibold">次世代プラットフォーム</span>
            </p>

            {/* 特徴ポイント */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {[
                { icon: <Zap className="h-4 w-4" />, text: 'AI駆動' },
                { icon: <Target className="h-4 w-4" />, text: '目標達成' },
                { icon: <Star className="h-4 w-4" />, text: '高評価' },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full"
                >
                  <div className="text-amber-400">{item.icon}</div>
                  <span className="text-sm font-medium text-white">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA ボタン */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={onGetStarted}
              className="text-lg px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
            >
              今すぐ始める
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-4 border-2 border-white/30 text-white hover:bg-white hover:text-slate-900 backdrop-blur-sm transition-all duration-300"
              onClick={() => navigate('/shop')}
            >
              <ShoppingBag className="mr-2 h-5 w-5" />
              ストアを見る
            </Button>
          </div>
        </div>
      </div>

      {/* 波のエフェクト */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" className="w-full h-12 text-white">
          <path fill="currentColor" d="M0,0 C720,120 720,120 1440,0 L1440,120 L0,120 Z" />
        </svg>
      </div>
    </section>
  );
};
