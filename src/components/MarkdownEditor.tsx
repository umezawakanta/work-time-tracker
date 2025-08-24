import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import MarkdownRenderer from './MarkdownRenderer';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ value, onChange, label = '内容' }) => {
  return (
    <div className="space-y-4">
      <Tabs defaultValue="edit" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="edit">編集</TabsTrigger>
          <TabsTrigger value="preview">プレビュー</TabsTrigger>
        </TabsList>

        <TabsContent value="edit" className="space-y-2">
          <Label htmlFor="markdown-editor">{label}</Label>
          <Textarea
            id="markdown-editor"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Markdownで記事を書いてください..."
            rows={15}
            className="w-full"
          />
        </TabsContent>

        <TabsContent value="preview">
          <Card className="min-h-[400px] max-h-[600px] overflow-auto">
            <CardContent className="p-6">
              <MarkdownRenderer content={value || '*プレビューするコンテンツがありません*'} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarkdownEditor;
