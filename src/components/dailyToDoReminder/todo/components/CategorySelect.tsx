import React from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const PREDEFINED_CATEGORIES = [
  '仕事',
  '学習',
  '健康',
  '趣味',
  '家事',
  '買い物',
  '会議',
  'プロジェクト',
] as const;

interface CategorySelectProps {
  value: string;
  onChange: (value: string) => void;
}

export const CategorySelect = React.memo<CategorySelectProps>(({ value, onChange }) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="category">カテゴリ</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="カテゴリを選択（オプション）" />
        </SelectTrigger>
        <SelectContent>
          {PREDEFINED_CATEGORIES.map((category) => (
            <SelectItem key={category} value={category}>
              {category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
});

CategorySelect.displayName = 'CategorySelect';
