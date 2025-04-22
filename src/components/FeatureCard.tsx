// FeatureCard.tsx
import React, { memo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { Badge } from "./ui/badge";
import { CheckCircle, Crown, Lock } from "lucide-react";
import { Button } from "./ui/button";

// バリアントの型定義
export type FeatureCardVariant = "default" | "outline" | "secondary";

// FeatureCardの型定義
export interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  buttonText: string;
  variant?: FeatureCardVariant;
  isPremium?: boolean;
}

// PricingCardの型定義
export interface PricingCardProps {
  plan: string;
  price: number;
  features: string[];
  isPopular: boolean;
  onSelect: (plan: string) => void;
}

// メモ化したFeatureCardコンポーネント
const FeatureCard = memo(({
  title,
  description,
  icon,
  path,
  buttonText,
  variant = "default",
  isPremium = false,
}: FeatureCardProps) => (
  <div>
    <Card
      className={`w-full h-full hover:shadow-lg transition-shadow duration-300 border-2 hover:border-primary ${
        isPremium ? "border-amber-200 bg-amber-50/30" : ""
      }`}
    >
      <CardHeader className="flex flex-row items-center gap-4">
        {icon}
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">{title}</CardTitle>
            {isPremium && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Badge
                        variant="outline"
                        className="bg-amber-100 text-amber-800 flex items-center gap-1 ml-2"
                        aria-label="プレミアム機能"
                      >
                        <Crown className="h-3 w-3" aria-hidden="true" />
                        <span>プレミアム</span>
                      </Badge>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>プレミアムプラン限定機能</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-gray-600 dark:text-gray-300">{description}</p>
        <Link to={path} className="w-full">
          <Button
            variant={
              variant === "default"
                ? "default"
                : variant === "outline"
                ? "outline"
                : "secondary"
            }
            className="w-full flex items-center gap-2"
            aria-label={`${buttonText}へ移動`}
          >
            {isPremium && <Lock className="h-4 w-4" aria-hidden="true" />}
            {buttonText} <span className="ml-1" aria-hidden="true">→</span>
          </Button>
        </Link>
      </CardContent>
    </Card>
  </div>
));

// パフォーマンス向上のため表示名を設定
FeatureCard.displayName = "FeatureCard";

// 料金プランカードコンポーネント - メモ化と改善済み
const PricingCard = memo(({ 
  plan, 
  price, 
  features, 
  isPopular, 
  onSelect 
}: PricingCardProps) => (
  <Card
    className={`w-full ${isPopular ? "border-primary shadow-lg relative" : ""}`}
  >
    {isPopular && (
      <Badge 
        className="absolute top-0 right-0 translate-x-1/4 -translate-y-1/2 bg-primary px-3 py-1"
        aria-label="おすすめプラン"
      >
        おすすめ
      </Badge>
    )}
    <CardHeader>
      <CardTitle>{plan}</CardTitle>
      <CardDescription>
        {price === 0 ? (
          "無料でご利用いただけます"
        ) : (
          <>
            <span className="text-3xl font-bold">
              ¥{price.toLocaleString()}
            </span>
            <span className="text-sm">/月</span>
          </>
        )}
      </CardDescription>
    </CardHeader>
    <CardContent>
      <ul className="space-y-2" aria-label={`${plan}の特徴`}>
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" aria-hidden="true" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </CardContent>
    <CardFooter>
      <Button
        className={`w-full ${
          isPopular ? "bg-primary hover:bg-primary/90" : ""
        }`}
        variant={isPopular ? "default" : "outline"}
        onClick={() => onSelect(plan)}
        aria-label={`${plan}を選択`}
      >
        {price === 0 ? "無料で始める" : "プランを選択"}
      </Button>
    </CardFooter>
  </Card>
));

PricingCard.displayName = "PricingCard";

export { FeatureCard, PricingCard };