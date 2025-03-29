import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface PlanFeature {
  name: string;
  included: boolean;
  info?: string;
}

export interface SubscriptionPlanProps {
  id: string;
  name: string;
  price: number;
  interval: "month" | "year"; // 厳密な列挙型
  description: string;
  features: PlanFeature[];
  isPopular?: boolean;
  isCurrent?: boolean;
  onSelect: (planId: string) => void;
  disabled?: boolean;
}

export function SubscriptionPlanCard({
  id,
  name,
  price,
  interval,
  description,
  features,
  isPopular,
  isCurrent,
  onSelect,
  disabled = false,
}: SubscriptionPlanProps) {
  return (
    <Card className={cn("flex flex-col h-full", 
      isPopular && "border-primary shadow-md",
      isCurrent && "border-2 border-green-500"
    )}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center">
              {name}
              {name.toLowerCase().includes("premium") && <Crown className="h-5 w-5 text-amber-500 ml-2" />}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {isPopular && (
            <Badge className="bg-primary hover:bg-primary/90">人気</Badge>
          )}
          {isCurrent && (
            <Badge className="bg-green-500 hover:bg-green-600">現在のプラン</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="mb-4">
          <p className="text-3xl font-bold">
            {price === 0 ? "無料" : `¥${price.toLocaleString()}`}
            {price > 0 && (
              <span className="text-sm font-normal text-gray-500">
                /{interval === "month" ? "月" : "年"}
              </span>
            )}
          </p>
          {interval === "year" && price > 0 && (
            <p className="text-sm text-green-600 mt-1">
              ¥{(price / 12).toFixed(0).toLocaleString()}/月相当（16%お得）
            </p>
          )}
        </div>
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <div className="flex-shrink-0 mt-0.5">
                <Check 
                  className={cn(
                    "h-5 w-5", 
                    feature.included ? "text-green-500" : "text-gray-300"
                  )} 
                />
              </div>
              <div className="ml-2 flex items-center">
                <span className={cn(
                  "text-sm",
                  !feature.included && "text-gray-500 line-through"
                )}>
                  {feature.name}
                </span>
                {feature.info && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-gray-400 ml-1 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">{feature.info}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button 
          className={cn("w-full", 
            isPopular && !isCurrent && "bg-primary hover:bg-primary/90",
            isCurrent && "bg-green-500 hover:bg-green-600"
          )}
          onClick={() => onSelect(id)}
          disabled={disabled || isCurrent}
        >
          {isCurrent ? "現在のプラン" : "選択する"}
        </Button>
      </CardFooter>
    </Card>
  );
}