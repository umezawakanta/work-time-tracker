import React from 'react';
import { Book } from '../../store/bookSlice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BaseDashboard, MetricCard } from '@/components/ui/BaseDashboard';
import { BookOpen, Target, TrendingUp, Star } from 'lucide-react';

interface StatisticsDashboardProps {
  books: Book[];
}

const StatisticsDashboard: React.FC<StatisticsDashboardProps> = ({ books }) => {
  const totalBooks = books.length;
  const totalPages = books.reduce((sum, book) => sum + book.totalPages, 0);
  const readPages = books.reduce((sum, book) => sum + book.readPages, 0);
  const completedBooks = books.filter((book) => book.readPages === book.totalPages).length;

  const averageRating =
    totalBooks > 0 ? books.reduce((sum, book) => sum + book.rating, 0) / totalBooks : 0;
  const completionRate = totalBooks > 0 ? (completedBooks / totalBooks) * 100 : 0;
  const readingProgress = totalPages > 0 ? (readPages / totalPages) * 100 : 0;

  const metrics: MetricCard[] = [
    {
      id: 'total-books',
      title: '総本数',
      value: totalBooks.toString(),
      icon: <BookOpen className="h-4 w-4" />,
      color: 'blue',
    },
    {
      id: 'completed-books',
      title: '読了本数',
      value: `${completedBooks} (${completionRate.toFixed(1)}%)`,
      icon: <Target className="h-4 w-4" />,
      color: 'green',
    },
    {
      id: 'total-pages',
      title: '総ページ数',
      value: totalPages.toLocaleString(),
      icon: <BookOpen className="h-4 w-4" />,
      color: 'purple',
    },
    {
      id: 'read-pages',
      title: '読了ページ数',
      value: `${readPages.toLocaleString()} (${readingProgress.toFixed(1)}%)`,
      icon: <TrendingUp className="h-4 w-4" />,
      color: 'red',
    },
    {
      id: 'average-rating',
      title: '平均評価',
      value: `${averageRating.toFixed(1)} / 5`,
      icon: <Star className="h-4 w-4" />,
      color: 'yellow',
    },
  ];

  return (
    <BaseDashboard
      title="読書統計"
      description="読書の進捗と統計情報"
      icon={<BookOpen className="h-5 w-5" />}
      metrics={metrics}
      isEmpty={totalBooks === 0}
      emptyMessage="まだ本が登録されていません"
      compactMode
    />
  );
};

export default StatisticsDashboard;
