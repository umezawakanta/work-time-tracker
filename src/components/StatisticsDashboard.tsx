import React from "react";
import { Book } from "../store/bookSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface StatisticsDashboardProps {
  books: Book[];
}

const StatisticsDashboard: React.FC<StatisticsDashboardProps> = ({ books }) => {
  const totalBooks = books.length;
  const totalPages = books.reduce((sum, book) => sum + book.totalPages, 0);
  const readPages = books.reduce((sum, book) => sum + book.readPages, 0);
  const completedBooks = books.filter(
    (book) => book.readPages === book.totalPages
  ).length;

  const averageRating =
    books.reduce((sum, book) => sum + book.rating, 0) / totalBooks;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>総本数</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">{totalBooks}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>読了本数</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">{completedBooks}</p>
          <Progress
            value={(completedBooks / totalBooks) * 100}
            className="mt-2"
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>総ページ数</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">{totalPages}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>読了ページ数</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">{readPages}</p>
          <Progress value={(readPages / totalPages) * 100} className="mt-2" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>平均評価</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">{averageRating.toFixed(1)}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatisticsDashboard;

