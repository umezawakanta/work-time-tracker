import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface CompareOverlayProps {
  mediaList: string[];
  activeMedia: string;
  selectedMedia: string | null;
  onSelectMedia: (media: string) => void;
  onClose: () => void;
}

const CompareOverlay: React.FC<CompareOverlayProps> = ({
  mediaList,
  activeMedia,
  selectedMedia,
  onSelectMedia,
  onClose,
}) => {
  return (
    <Card className="absolute top-0 right-0 w-64 z-10 shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-medium">データ比較</CardTitle>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="py-2">
        <p className="text-xs text-muted-foreground mb-3">
          {activeMedia}と比較するメディアを選択してください
        </p>
        <RadioGroup value={selectedMedia || ''} onValueChange={onSelectMedia}>
          {mediaList.map((media) => (
            <div key={media} className="flex items-center space-x-2 mb-2">
              <RadioGroupItem value={media} id={media} />
              <Label htmlFor={media} className="text-sm cursor-pointer">
                {media}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
      <CardFooter className="pt-2">
        <Button variant="default" size="sm" className="w-full" disabled={!selectedMedia}>
          比較を実行
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CompareOverlay;
