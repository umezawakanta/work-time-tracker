"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";

interface Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
}

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Omit<Event, "id">) => void;
  selectedDate: Date;
  selectedTime: string;
  event?: Event | null;
}

export function EventModal({
  isOpen,
  onClose,
  onSave,
  selectedDate,
  selectedTime,
  event
}: EventModalProps) {
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState(selectedTime);
  const [endTime, setEndTime] = useState("");

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setStartTime(event.start.toTimeString().slice(0, 5));
      setEndTime(event.end.toTimeString().slice(0, 5));
    } else {
      setTitle("");
      setStartTime(selectedTime);
      setEndTime("");
    }
  }, [event, selectedTime]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const [startHours, startMinutes] = startTime.split(":").map(Number);
    const [endHours, endMinutes] = endTime.split(":").map(Number);
    
    const startDate = new Date(selectedDate);
    startDate.setHours(startHours, startMinutes);
    
    const endDate = new Date(selectedDate);
    endDate.setHours(endHours, endMinutes);
    
    onSave({
      title,
      start: startDate,
      end: endDate
    });
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {event ? "イベントを編集" : "新しいイベント"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">タイトル</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start-time">開始時間</Label>
              <Input
                id="start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="end-time">終了時間</Label>
              <Input
                id="end-time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              キャンセル
            </Button>
            <Button type="submit">
              {event ? "更新" : "作成"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

