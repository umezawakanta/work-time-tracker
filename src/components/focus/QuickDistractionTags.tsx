import React from 'react';

interface QuickDistractionTagsProps {
  onTagClick: (tag: string) => void;
  className?: string;
}

const DISTRACTION_TAGS = [
  { id: 'sns', label: 'SNS', emoji: '📱', color: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
  { id: 'video', label: '動画', emoji: '📺', color: 'bg-red-100 text-red-700 hover:bg-red-200' },
  {
    id: 'shopping',
    label: '買い物',
    emoji: '🛒',
    color: 'bg-green-100 text-green-700 hover:bg-green-200',
  },
  {
    id: 'games',
    label: 'ゲーム',
    emoji: '🎮',
    color: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
  },
  {
    id: 'news',
    label: 'ニュース',
    emoji: '📰',
    color: 'bg-orange-100 text-orange-700 hover:bg-orange-200',
  },
  {
    id: 'other',
    label: 'その他',
    emoji: '💭',
    color: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
  },
];

export const QuickDistractionTags: React.FC<QuickDistractionTagsProps> = ({
  onTagClick,
  className = '',
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      <h3 className="text-sm font-medium text-gray-700 text-center">気が散ったトリガーを記録</h3>
      <div className="grid grid-cols-2 gap-2">
        {DISTRACTION_TAGS.map((tag) => (
          <button
            key={tag.id}
            onClick={() => onTagClick(tag.label)}
            className={`
              flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
              transition-colors duration-200 min-h-[44px]
              ${tag.color}
            `}
            aria-label={`${tag.label}を記録`}
          >
            <span className="text-base">{tag.emoji}</span>
            <span>{tag.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
