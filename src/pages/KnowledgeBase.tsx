import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Book, Tag, Calendar, Bot } from 'lucide-react';
import { KnowledgeEntry } from '@/types/knowledge';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

const KnowledgeBase: React.FC = () => {
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // 知識エントリーの取得
  useEffect(() => {
    loadKnowledgeEntries();
  }, []);

  const loadKnowledgeEntries = async () => {
    try {
      // APIから取得（実装予定）
      // const data = await KnowledgeService.getAll();
      // setEntries(data);
    } catch (error) {
      console.error('知識ベースの読み込みエラー:', error);
    }
  };

  // フィルタリング
  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      entry.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.definition.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || entry.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Book className="h-8 w-8" />
          知識ベース
        </h1>
      </div>

      {/* 検索バー */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="用語や定義を検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* カテゴリータブ */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList>
          <TabsTrigger value="all">すべて</TabsTrigger>
          <TabsTrigger value="research">調査</TabsTrigger>
          <TabsTrigger value="technical">技術</TabsTrigger>
          <TabsTrigger value="business">ビジネス</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          <div className="grid gap-4">
            {filteredEntries.map((entry) => (
              <Card key={entry.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-xl">{entry.term}</CardTitle>
                    <div className="flex items-center gap-2">
                      {entry.metadata?.aiGenerated && (
                        <Badge variant="secondary">
                          <Bot className="h-3 w-3 mr-1" />
                          AI生成
                        </Badge>
                      )}
                      <Badge variant="outline">{entry.category}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap">{entry.definition}</p>

                  {/* タグ */}
                  {entry.tags.length > 0 && (
                    <div className="flex items-center gap-2 mt-4">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      <div className="flex flex-wrap gap-1">
                        {entry.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* メタ情報 */}
                  <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(entry.createdAt), 'yyyy/MM/dd', { locale: ja })}
                    </div>
                    {entry.source && <span>出典: {entry.source}</span>}
                    {entry.metadata?.confidence && (
                      <span>信頼度: {Math.round(entry.metadata.confidence * 100)}%</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {filteredEntries.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">
              {searchTerm ? '検索結果が見つかりませんでした' : 'まだ知識エントリーがありません'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default KnowledgeBase;
