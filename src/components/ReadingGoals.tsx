import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface Goal {
  year: number;
  target: number;
  achieved: number;
}

const ReadingGoals: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoal, setNewGoal] = useState<Goal>({
    year: new Date().getFullYear(),
    target: 0,
    achieved: 0,
  });

  useEffect(() => {
    const savedGoals = localStorage.getItem('readingGoals');
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('readingGoals', JSON.stringify(goals));
  }, [goals]);

  const handleAddGoal = () => {
    setGoals([...goals, newGoal]);
    setNewGoal({ year: new Date().getFullYear(), target: 0, achieved: 0 });
  };

  const handleUpdateAchieved = (index: number, value: number) => {
    const updatedGoals = [...goals];
    updatedGoals[index].achieved = value;
    setGoals(updatedGoals);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>新しい読書目標を設定</CardTitle>
        </CardHeader>
        <CardContent className="flex space-x-2">
          <Input
            type="number"
            placeholder="年"
            value={newGoal.year}
            onChange={(e) => setNewGoal({ ...newGoal, year: parseInt(e.target.value) })}
          />
          <Input
            type="number"
            placeholder="目標冊数"
            value={newGoal.target}
            onChange={(e) => setNewGoal({ ...newGoal, target: parseInt(e.target.value) })}
          />
          <Button onClick={handleAddGoal}>追加</Button>
        </CardContent>
      </Card>
      {goals.map((goal, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle>{goal.year}年の読書目標</CardTitle>
          </CardHeader>
          <CardContent>
            <p>目標: {goal.target}冊</p>
            <p>達成: {goal.achieved}冊</p>
            <Progress value={(goal.achieved / goal.target) * 100} className="mt-2" />
            <div className="mt-2">
              <Input
                type="number"
                value={goal.achieved}
                onChange={(e) => handleUpdateAchieved(index, parseInt(e.target.value))}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ReadingGoals;
