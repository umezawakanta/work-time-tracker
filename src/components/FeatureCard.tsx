// FeatureCard.tsx
import { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// 型定義
export type FeatureCardVariant = 'default' | 'outline' | 'secondary';

export interface FeatureCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  path: string;
  buttonText: string;
  variant?: FeatureCardVariant;
  isPremium?: boolean;
}

export interface PricingCardProps {
  plan: string;
  price: number;
  features: string[];
  isPopular?: boolean;
  onSelect: (plan: string) => void;
}

// 機能カードコンポーネント
export const FeatureCard = ({
  title,
  description,
  icon,
  path,
  buttonText,
  variant = 'default',
  isPremium = false,
}: FeatureCardProps) => {
  const navigate = useNavigate();

  return (
    <Card
      className={`group overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 cursor-pointer card-hover ${
        isPremium
          ? 'border-amber-200 bg-gradient-to-br from-amber-50/50 to-orange-50/30'
          : 'hover:shadow-lg'
      }`}
      onClick={() => navigate(path)}
    >
      <CardHeader
        className={`pb-3 relative ${
          isPremium ? 'bg-gradient-to-r from-amber-50 to-orange-50' : ''
        }`}
      >
        {isPremium && (
          <div className="absolute top-3 right-3">
            <Badge
              variant="outline"
              className="bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border-amber-200 flex items-center gap-1"
            >
              <Crown className="h-3 w-3" />
              <span className="text-xs font-semibold">Premium</span>
            </Badge>
          </div>
        )}
        <div className="flex items-center gap-3">
          <div
            className={`p-3 rounded-xl transition-all duration-300 group-hover:scale-110 ${
              isPremium
                ? 'bg-gradient-to-br from-amber-100 to-orange-100 text-amber-600'
                : 'bg-gradient-to-br from-blue-100 to-purple-100 text-blue-600'
            }`}
          >
            {icon}
          </div>
          <CardTitle className="text-lg font-semibold text-slate-800 group-hover:text-slate-900 transition-colors">
            {title}
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="pt-2 pb-4">
        <p className="text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors">
          {description}
        </p>
      </CardContent>

      <CardFooter className="pt-0">
        <Button
          variant={variant}
          className={`w-full group-hover:bg-primary group-hover:text-white transition-all duration-300 ${
            isPremium
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600'
              : ''
          }`}
          onClick={(e) => {
            e.stopPropagation();
            navigate(path);
          }}
        >
          <span>{buttonText}</span>
          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
        </Button>
      </CardFooter>
    </Card>
  );
};

// 料金プランカードコンポーネント
export const PricingCard = ({
  plan,
  price,
  features,
  isPopular = false,
  onSelect,
}: PricingCardProps) => {
  return (
    <Card
      className={`overflow-hidden transition-all duration-200 hover:shadow-lg ${
        isPopular ? 'border-amber-200 shadow-sm' : ''
      }`}
    >
      {isPopular && (
        <div className="bg-amber-500 py-1 px-4 text-white text-xs font-medium text-center">
          おすすめプラン
        </div>
      )}
      <CardHeader
        className={`pb-3 ${isPopular ? 'bg-gradient-to-r from-amber-50 to-amber-100' : ''}`}
      >
        <CardTitle className="text-center font-bold">{plan}</CardTitle>
        <div className="text-center pt-2">
          <span className="text-3xl font-bold">¥{price.toLocaleString()}</span>
          <span className="text-sm text-gray-500 ml-1">/月</span>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <svg
                className="h-5 w-5 text-green-500 mr-2 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="pt-0 pb-4">
        <Button
          variant={isPopular ? 'default' : 'outline'}
          className="w-full"
          onClick={() => onSelect(plan)}
        >
          {isPopular ? 'このプランを選択' : '選択する'}
        </Button>
      </CardFooter>
    </Card>
  );
};
