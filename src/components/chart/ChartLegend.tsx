import React from 'react';
import { PoliticalParty } from '@/types/survey';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ChartLegendProps {
  parties: PoliticalParty[];
  onToggleHighlight: (partyShortName: string) => void;
  highlightedParties: string[];
}

const ChartLegend: React.FC<ChartLegendProps> = ({
  parties,
  onToggleHighlight,
  highlightedParties,
}) => {
  // activeMediaパラメータを削除

  // 政党を支持率に基づいてソート
  const sortedParties = [...parties].sort((a, b) => {
    // ここでの順序はとりあえず固定されたもの（実際のデータでは支持率に基づいてソートする）
    const partyOrder: Record<string, number> = {
      自民: 1,
      立民: 2,
      公明: 3,
      維新: 4,
      共産: 5,
      国民: 6,
      れいわ: 7,
      社民: 8,
      N党: 9,
    };

    return (partyOrder[a.shortName] || 100) - (partyOrder[b.shortName] || 100);
  });

  // 残りのコードは変更なし

  return (
    <div className="flex flex-wrap gap-2">
      <TooltipProvider>
        {sortedParties.map((party) => (
          <Tooltip key={party.shortName}>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={`px-3 py-1 h-8 border-l-4 transition-all ${
                  highlightedParties.includes(party.shortName)
                    ? 'bg-gray-100 dark:bg-gray-800 ring-2 ring-offset-2 ring-opacity-50'
                    : highlightedParties.length > 0
                      ? 'opacity-50'
                      : ''
                }`}
                style={{
                  borderLeftColor: party.colorCode,
                }}
                onClick={() => onToggleHighlight(party.shortName)}
              >
                <span className="font-medium">{party.name}</span>
                {highlightedParties.includes(party.shortName) && (
                  <Badge variant="default" className="ml-2 bg-primary">
                    表示中
                  </Badge>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>クリックすると{party.name}をハイライト表示</p>
            </TooltipContent>
          </Tooltip>
        ))}

        {highlightedParties.length > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="px-3 py-1 h-8"
                onClick={() => {
                  // すべてのハイライトをクリア
                  sortedParties.forEach((party) => {
                    if (highlightedParties.includes(party.shortName)) {
                      onToggleHighlight(party.shortName);
                    }
                  });
                }}
              >
                すべて表示
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>すべての政党を表示</p>
            </TooltipContent>
          </Tooltip>
        )}
      </TooltipProvider>
    </div>
  );
};

export default ChartLegend;
