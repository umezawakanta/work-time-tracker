import React from 'react';
import BookShelf from '@/components/BookShelf';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReadingGoals from '@/components/ReadingGoals';
import BookImport from '@/components/BookImport';

const BookShelfPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">ネット本棚</h1>
      <Tabs defaultValue="bookshelf" className="w-full mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="bookshelf">本棚</TabsTrigger>
          <TabsTrigger value="goals">読書目標</TabsTrigger>
          <TabsTrigger value="import">本のインポート</TabsTrigger>
        </TabsList>
        <TabsContent value="bookshelf">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>あなたの本棚</CardTitle>
              <CardDescription>
                所有している本を管理し、整理することができます。統計、読書チャレンジ、おすすめ機能も利用できます。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BookShelf />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="goals">
          <ReadingGoals />
        </TabsContent>
        <TabsContent value="import">
          <BookImport />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BookShelfPage;

