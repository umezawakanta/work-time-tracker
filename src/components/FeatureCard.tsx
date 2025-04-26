// FeatureCard.tsx
import { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";

// 型定義
export type FeatureCardVariant = "default" | "outline" | "secondary";

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
  variant = "default",
  isPremium = false,
}: FeatureCardProps) => {
  const navigate = useNavigate();

  return (
    <Card className={`overflow-hidden transition-all duration-200 hover:shadow-md ${
      isPremium ? "border-amber-200" : ""
    }`}>
      <CardHeader className={`pb-2 ${
        isPremium ? "bg-gradient-to-r from-amber-50 to-amber-100" : ""
      }`}>
        <div className="flex justify-between items-start">
          <CardTitle className="text-md font-semibold flex items-center">
            {icon && <span className="mr-2">{icon}</span>}
            {title}
          </CardTitle>
          {isPremium && (
            <Badge variant="outline" className="bg-amber-100 text-amber-800 flex items-center gap-1">
              <Crown className="h-3 w-3" />
              <span>プレミアム</span>
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-3">
        <p className="text-sm text-gray-600 dark:text-gray-300 min-h-[2.5rem]">{description}</p>
      </CardContent>
      <CardFooter className="pt-0">
        <Button 
          variant={variant} 
          size="sm" 
          className="w-full"
          onClick={() => navigate(path)}
        >
          {buttonText}
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
    <Card className={`overflow-hidden transition-all duration-200 hover:shadow-lg ${
      isPopular ? "border-amber-200 shadow-sm" : ""
    }`}>
      {isPopular && (
        <div className="bg-amber-500 py-1 px-4 text-white text-xs font-medium text-center">
          おすすめプラン
        </div>
      )}
      <CardHeader className={`pb-3 ${
        isPopular ? "bg-gradient-to-r from-amber-50 to-amber-100" : ""
      }`}>
        <CardTitle className="text-center font-bold">
          {plan}
        </CardTitle>
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
          variant={isPopular ? "default" : "outline"} 
          className="w-full"
          onClick={() => onSelect(plan)}
        >
          {isPopular ? "このプランを選択" : "選択する"}
        </Button>
      </CardFooter>
    </Card>
  );
};