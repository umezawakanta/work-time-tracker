import React from 'react';
import BookShelf from '@/components/BookShelf';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const BookShelfPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">ネット本棚</h1>
      <Card className="w-full mb-8">
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
    </div>
  );
};

export default BookShelfPage;

