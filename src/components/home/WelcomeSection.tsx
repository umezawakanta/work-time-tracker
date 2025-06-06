import React from 'react';
import { Button } from '@/components/ui/button';
import { Clock, Sparkles, ArrowRight, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface WelcomeSectionProps {
  onGetStarted: () => void;
}

export const WelcomeSection: React.FC<WelcomeSectionProps> = ({ onGetStarted }) => {
  const navigate = useNavigate();

  return (
    <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-32">
      <div className="container mx-auto px-4 text-center">
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="h-32 w-32 text-white/20" />
            </div>
            <Clock className="h-32 w-32 text-white relative z-10" />
          </div>
        </div>

        <h1 className="text-6xl font-bold mb-6">LifeSync</h1>
        <p className="text-2xl mb-8 opacity-90">あなたの生産性と効率性を最大限に引き出すツール</p>

        <div className="space-x-4">
          <Button
            size="lg"
            onClick={onGetStarted}
            className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4"
          >
            今すぐ始める
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-4"
            onClick={() => navigate('/shop')}
          >
            <ShoppingBag className="mr-2 h-5 w-5" />
            ストアを見る
          </Button>
        </div>
      </div>
    </section>
  );
};
