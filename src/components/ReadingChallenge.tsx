import React, { useState } from 'react';
import { Book } from '../store/bookSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ReadingChallengeProps {
  books: Book[];
}

const ReadingChallenge: React.FC<ReadingChallengeProps> = ({ books }) => {
  const [challengeGoal, setChallengeGoal] = useState(12);
  const completedBooks = books.filter((book) => book.readPages === book.totalPages).length;

  const handleGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setChallengeGoal(isNaN(value) ? 0 : value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>読書チャレンジ</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 mb-4">
          <Input type="number" value={challengeGoal} onChange={handleGoalChange} className="w-20" />
          <span>冊 / 年</span>
          <Button onClick={() => setChallengeGoal(12)}>リセット</Button>
        </div>
        <Progress value={(completedBooks / challengeGoal) * 100} className="mb-2" />
        <p>
          {completedBooks} / {challengeGoal} 冊完了
        </p>
      </CardContent>
    </Card>
  );
};

export default ReadingChallenge;
