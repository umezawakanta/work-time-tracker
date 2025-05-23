import React from "react";
import { Badge } from "@/components/ui/badge";
import { Award, Crown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "compact" | "detailed";

interface PremiumBadgeProps {
  variant?: BadgeVariant;
  className?: string;
  showAnimation?: boolean;
}

/**
 * PremiumBadge Component
 * プレミアムステータスを表示する再利用可能なバッジ
 */
export const PremiumBadge: React.FC<PremiumBadgeProps> = React.memo(
  ({ variant = "default", className, showAnimation = true }) => {
    const baseClasses = "flex items-center gap-1 transition-all";

    const variantStyles = {
      default:
        "bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-800 border-amber-300",
      compact: "bg-amber-100 text-amber-800 border-amber-300",
      detailed:
        "bg-gradient-to-r from-amber-100 via-yellow-50 to-amber-100 text-amber-900 border-amber-400",
    };

    const iconMap = {
      default: Award,
      compact: Crown,
      detailed: Sparkles,
    };

    const Icon = iconMap[variant];

    return (
      <Badge
        variant="outline"
        className={cn(
          baseClasses,
          variantStyles[variant],
          showAnimation && "hover:scale-105 hover:shadow-md",
          "premium-badge",
          className
        )}
      >
        <Icon
          className={cn("h-3 w-3", showAnimation && "animate-pulse")}
          size={12}
          aria-hidden="true"
        />
        <span className="font-medium">
          {variant === "detailed" ? "プレミアムメンバー" : "プレミアム"}
        </span>
      </Badge>
    );
  }
);

PremiumBadge.displayName = "PremiumBadge";
