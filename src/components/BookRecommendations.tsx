import React from "react";
import { Book } from "../store/bookSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BookRecommendationsProps {
  books: Book[];
}

const BookRecommendations: React.FC<BookRecommendationsProps> = ({ books }) => {
  const getRecommendations = () => {
    const highlyRatedBooks = books
      .filter((book) => book.rating >= 4)
      .sort((a, b) => b.rating - a.rating);
    return highlyRatedBooks.slice(0, 5);
  };

  const recommendations = getRecommendations();

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">おすすめの本</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.map((book) => (
          <Card key={book._id}>
            <CardHeader>
              <CardTitle>{book.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>著者: {book.author}</p>
              <p>評価: {book.rating} / 5</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BookRecommendations;

