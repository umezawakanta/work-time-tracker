import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Check, Info, ChevronDown, ChevronUp, X } from 'lucide-react';
import { PlanFeature } from './PremiumPromotion';

export interface PlanFeaturesComparisonProps {
  features: PlanFeature[];
  initialShowCount?: number;
}

/**
 * プラン機能比較表コンポーネント
 * 各プランで利用可能な機能を一覧表示します
 */
export const PlanFeaturesComparison: React.FC<PlanFeaturesComparisonProps> = ({
  features,
  initialShowCount = 5,
}) => {
  const [showAllFeatures, setShowAllFeatures] = useState(false);

  // 表示する機能の数を制御
  const displayedFeatures = showAllFeatures ? features : features.slice(0, initialShowCount);

  // 機能の表示/非表示を切り替える
  const toggleFeatureDisplay = () => {
    setShowAllFeatures(!showAllFeatures);
  };

  // 機能値を表示用に変換する関数
  const renderFeatureValue = (value: boolean | string) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="h-5 w-5 text-green-500 mx-auto" />
      ) : (
        <X className="h-5 w-5 text-gray-300 mx-auto" />
      );
    }
    return <span className="text-center text-sm">{value}</span>;
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-xl font-bold mb-2">機能比較</h3>
        <p className="text-gray-600 mb-4">各プランで利用可能な機能を比較</p>
      </div>

      <div className="overflow-x-auto">
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/3">機能</TableHead>
              <TableHead className="text-center">無料</TableHead>
              <TableHead className="text-center">ベーシック</TableHead>
              <TableHead className="text-center">プロフェッショナル</TableHead>
              <TableHead className="text-center">エンタープライズ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedFeatures.map((feature, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">
                  {feature.feature}
                  {feature.tooltip && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 inline-block ml-1 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{feature.tooltip}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </TableCell>
                <TableCell className="text-center">{renderFeatureValue(feature.free)}</TableCell>
                <TableCell className="text-center">{renderFeatureValue(feature.basic)}</TableCell>
                <TableCell className="text-center">
                  {renderFeatureValue(feature.professional)}
                </TableCell>
                <TableCell className="text-center">
                  {renderFeatureValue(feature.enterprise)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {features.length > initialShowCount && (
        <div className="text-center">
          <Button variant="ghost" onClick={toggleFeatureDisplay} className="text-gray-500">
            {showAllFeatures ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                機能を折りたたむ
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                すべての機能を表示 ({features.length - initialShowCount}項目追加)
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
