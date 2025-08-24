import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { createWorkTimeEntry } from '../store/workTimeSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { WorkTimeEntry } from '@/types/workTimeEntry';
import { AppDispatch } from '@/store';
import { useAuth } from '@/hooks/useAuth';

const WorkTimeEntryForm: React.FC = () => {
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [endTime, setEndTime] = useState<Date>(new Date());
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth(); // コンポーネントのトップレベルで呼び出す

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // ユーザーが認証されていない場合の処理
    if (!user) {
      // エラーハンドリングや通知を表示するなど
      console.error('ユーザーが認証されていません');
      return;
    }

    const newEntry: Omit<WorkTimeEntry, '_id'> = {
      projectName,
      description,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      duration: (endTime.getTime() - startTime.getTime()) / 1000, // 秒単位で計算
      date: startTime.toISOString().split('T')[0], // YYYY-MM-DD形式の日付
      userId: user.id, // 認証されたユーザーのID
    };

    dispatch(createWorkTimeEntry(newEntry));
    navigate('/reports');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="text-2xl">作業時間の記録</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="projectName">プロジェクト名</Label>
              <Input
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">作業内容</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startTime">開始時間</Label>
              <Input
                id="startTime"
                type="datetime-local"
                value={startTime.toISOString().slice(0, 16)}
                onChange={(e) => setStartTime(new Date(e.target.value))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">終了時間</Label>
              <Input
                id="endTime"
                type="datetime-local"
                value={endTime.toISOString().slice(0, 16)}
                onChange={(e) => setEndTime(new Date(e.target.value))}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              記録を保存
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default WorkTimeEntryForm;
