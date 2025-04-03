"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { Trash2Icon, MapPinIcon, ClockIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import "@/styles/EventModal.css";

interface Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color?: string;
  description?: string;
  location?: string;
  isPrivate?: boolean;
}

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Omit<Event, "id">) => void;
  onDelete?: (eventId: string) => void;
  selectedDate: Date;
  selectedTime: string;
  event: Event | null;
  isPremium: boolean;
}

// カラーオプションのマッピング（値とCSSクラス名）
const COLOR_CLASS_MAP = {
  // 基本カラー
  "#3b82f6": "color-blue",
  "#ef4444": "color-red",
  "#22c55e": "color-green",
  "#f59e0b": "color-orange",
  "#8b5cf6": "color-purple",
  "#ec4899": "color-pink",
  "#64748b": "color-gray",
  // プレミアムカラー
  "#06b6d4": "color-cyan",
  "#14b8a6": "color-teal",
  "#84cc16": "color-lime",
  "#a855f7": "color-violet",
  "#f43f5e": "color-rose"
};

export function EventModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  selectedDate,
  selectedTime,
  event,
  isPremium
}: EventModalProps) {
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState(selectedTime);
  const [endTime, setEndTime] = useState("");
  const [color, setColor] = useState("#3b82f6"); // Default color
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setStartTime(event.start.toTimeString().slice(0, 5));
      setEndTime(event.end.toTimeString().slice(0, 5));
      setColor(event.color || "#3b82f6");
      setDescription(event.description || "");
      setLocation(event.location || "");
      setIsPrivate(event.isPrivate || false);
    } else {
      setTitle("");
      setStartTime(selectedTime);
      
      // 開始時間から1時間後をデフォルトの終了時間に設定
      const [hours, minutes] = selectedTime.split(":");
      const endDate = new Date(selectedDate);
      endDate.setHours(parseInt(hours) + 1);
      endDate.setMinutes(parseInt(minutes));
      setEndTime(endDate.toTimeString().slice(0, 5));
      
      setColor("#3b82f6");
      setDescription("");
      setLocation("");
      setIsPrivate(false);
    }
    
    // 削除確認モードをリセット
    setIsDeleteConfirmOpen(false);
  }, [event, selectedDate, selectedTime]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const [startHours, startMinutes] = startTime.split(":").map(Number);
    const [endHours, endMinutes] = endTime.split(":").map(Number);
    
    const startDate = new Date(selectedDate);
    startDate.setHours(startHours, startMinutes);
    
    const endDate = new Date(selectedDate);
    endDate.setHours(endHours, endMinutes);
    
    // 終了時間が開始時間より前の場合は翌日に設定
    if (endDate < startDate) {
      endDate.setDate(endDate.getDate() + 1);
    }
    
    onSave({
      title,
      start: startDate,
      end: endDate,
      color,
      description,
      location,
      isPrivate
    });
    
    onClose();
  };

  // 利用可能な色リスト
  const colorOptions = [
    { value: "#3b82f6", label: "ブルー" },
    { value: "#ef4444", label: "レッド" },
    { value: "#22c55e", label: "グリーン" },
    { value: "#f59e0b", label: "オレンジ" },
    { value: "#8b5cf6", label: "パープル" },
    { value: "#ec4899", label: "ピンク" },
    { value: "#64748b", label: "グレー" },
  ];
  
  // プレミアム限定の色
  const premiumColorOptions = [
    { value: "#06b6d4", label: "シアン" },
    { value: "#14b8a6", label: "ティール" },
    { value: "#84cc16", label: "ライム" },
    { value: "#a855f7", label: "バイオレット" },
    { value: "#f43f5e", label: "ローズ" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
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
              placeholder="ミーティング、予定など"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start-time">開始時間</Label>
              <div className="flex">
                <ClockIcon className="mr-2 h-4 w-4 self-center" />
                <Input
                  id="start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="end-time">終了時間</Label>
              <div className="flex">
                <ClockIcon className="mr-2 h-4 w-4 self-center" />
                <Input
                  id="end-time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
          
          <div>
            <Label htmlFor="color">色</Label>
            <div className="grid grid-cols-7 gap-2 mt-1">
              {colorOptions.map((colorOption) => (
                <button
                  key={colorOption.value}
                  type="button"
                  className={cn(
                    "color-option",
                    COLOR_CLASS_MAP[colorOption.value as keyof typeof COLOR_CLASS_MAP],
                    color === colorOption.value ? "selected" : "not-selected"
                  )}
                  onClick={() => setColor(colorOption.value)}
                  title={colorOption.label}
                />
              ))}
            </div>
            
            {/* プレミアム限定の色オプション */}
            {premiumColorOptions.length > 0 && (
              <div className="mt-2">
                <div className="text-xs text-gray-500 mb-1">
                  {isPremium ? "プレミアムカラー" : "プレミアム限定カラー"}
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {premiumColorOptions.map((colorOption) => (
                    <TooltipProvider key={colorOption.value}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className={cn(
                              "color-option relative",
                              COLOR_CLASS_MAP[colorOption.value as keyof typeof COLOR_CLASS_MAP],
                              color === colorOption.value ? "selected" : "not-selected",
                              !isPremium && "disabled"
                            )}
                            onClick={() => isPremium && setColor(colorOption.value)}
                            disabled={!isPremium}
                          >
                            {!isPremium && (
                              <span className="premium-badge">
                                P
                              </span>
                            )}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {isPremium ? colorOption.label : `${colorOption.label} (プレミアム限定)`}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div>
            <Label htmlFor="location">場所</Label>
            <div className="flex">
              <MapPinIcon className="mr-2 h-4 w-4 self-center" />
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="会議室、オンラインなど"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="description">詳細</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="イベントの詳細を入力してください"
              rows={3}
            />
          </div>
          
          {/* プレミアム限定機能: プライベートイベント設定 */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2 items-center">
              <Label htmlFor="private" className="cursor-pointer">
                プライベートイベント
              </Label>
              {!isPremium && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-800 rounded">
                        プレミアム
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      プレミアムプランでご利用いただける機能です
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <Switch
              id="private"
              checked={isPrivate}
              onCheckedChange={setIsPrivate}
              disabled={!isPremium}
            />
          </div>
        </form>
        
        <DialogFooter className="flex justify-between sm:justify-between">
          <div>
            {event && onDelete && (
              <Button
                variant="destructive"
                type="button"
                onClick={() => {
                  if (isDeleteConfirmOpen) {
                    onDelete(event.id);
                  } else {
                    setIsDeleteConfirmOpen(true);
                  }
                }}
                size="sm"
              >
                <Trash2Icon className="h-4 w-4 mr-2" />
                {isDeleteConfirmOpen ? "削除確認" : "削除"}
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              キャンセル
            </Button>
            <Button type="button" onClick={handleSubmit}>
              {event ? "更新" : "作成"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}