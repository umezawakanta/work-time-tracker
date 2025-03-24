// GoalForm.jsx
// FinancialGoalの設定と編集を行うフォームコンポーネント

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Target } from "lucide-react";
import { format } from "date-fns";
import { toast } from "react-hot-toast";

// 目標のタイプ定義（参考）
/*
interface FinancialGoal {
  id: string;
  title: string;
  type: "asset" | "debt" | "networth" | "savings" | "investment";
  startValue: number;
  currentValue: number;
  targetValue: number;
  startDate: string;
  targetDate: string;
  period: "weekly" | "monthly" | "quarterly" | "yearly";
  autoUpdate: boolean;
  history: Array<{ date: string; value: number }>;
}
*/

export function GoalForm({ goal, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    id: "",
    title: "",
    type: "asset",
    startValue: 0,
    currentValue: 0, 
    targetValue: 0,
    startDate: new Date().toISOString().split("T")[0],
    targetDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split("T")[0],
    period: "monthly",
    autoUpdate: true,
    history: [],
  });

  const [errors, setErrors] = useState({});
  const [progress, setProgress] = useState(0);

  // 既存の目標データを編集する場合、フォームを初期化
  useEffect(() => {
    if (goal) {
      setFormData({
        ...goal,
        startDate: goal.startDate || new Date().toISOString().split("T")[0],
        targetDate: goal.targetDate || new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split("T")[0],
      });
      
      // 進捗率の計算
      const range = goal.targetValue - goal.startValue;
      if (range !== 0) {
        const achieved = goal.currentValue - goal.startValue;
        const progressPercent = (achieved / range) * 100;
        setProgress(goal.type === "debt" ? 100 - progressPercent : progressPercent);
      }
    }
  }, [goal]);

  // 進捗率の計算 (フォーム入力に基づく更新)
  useEffect(() => {
    const range = formData.targetValue - formData.startValue;
    if (range !== 0) {
      const achieved = formData.currentValue - formData.startValue;
      const progressPercent = (achieved / range) * 100;
      setProgress(formData.type === "debt" ? 100 - progressPercent : progressPercent);
    }
  }, [formData.currentValue, formData.startValue, formData.targetValue, formData.type]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "startValue" || name === "currentValue" || name === "targetValue" 
        ? parseFloat(value) || 0 
        : value,
    });
  };

  const handleSelectChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSwitchChange = (checked) => {
    setFormData({
      ...formData,
      autoUpdate: checked,
    });
  };

  const handleDateChange = (name, date) => {
    setFormData({
      ...formData,
      [name]: date.toISOString().split("T")[0],
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = "目標名を入力してください";
    }
    
    if (formData.targetValue <= 0) {
      newErrors.targetValue = "目標値は0より大きい値にしてください";
    }

    if (formData.type === "debt" && formData.targetValue > formData.startValue) {
      newErrors.targetValue = "負債削減の目標値は開始値より小さくしてください";
    }

    if (formData.type !== "debt" && formData.targetValue < formData.startValue) {
      newErrors.targetValue = "目標値は開始値より大きくしてください";
    }

    const startDateObj = new Date(formData.startDate);
    const targetDateObj = new Date(formData.targetDate);
    
    if (targetDateObj <= startDateObj) {
      newErrors.targetDate = "目標日は開始日より後に設定してください";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // 新規作成の場合、現在の日付を履歴に追加
      let updatedFormData = { ...formData };
      
      if (!goal || goal.history.length === 0) {
        updatedFormData.history = [
          { date: new Date().toISOString().split("T")[0], value: formData.currentValue }
        ];
      }
      
      onSave(updatedFormData);
      toast.success(goal ? "目標を更新しました！" : "新しい目標を設定しました！");
    } else {
      toast.error("入力内容を確認してください");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {/* 目標名 */}
        <div className="space-y-2">
          <Label htmlFor="title">目標名 <span className="text-red-500">*</span></Label>
          <Input
            id="title"
            name="title"
            placeholder="例: 緊急資金の構築"
            value={formData.title}
            onChange={handleInputChange}
            className={errors.title ? "border-red-500" : ""}
          />
          {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
        </div>

        {/* 目標タイプ */}
        <div className="space-y-2">
          <Label htmlFor="type">目標タイプ</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => handleSelectChange("type", value)}
          >
            <SelectTrigger id="type">
              <SelectValue placeholder="タイプを選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asset">資産構築</SelectItem>
              <SelectItem value="debt">負債削減</SelectItem>
              <SelectItem value="networth">純資産</SelectItem>
              <SelectItem value="savings">貯蓄</SelectItem>
              <SelectItem value="investment">投資</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 開始値 */}
        <div className="space-y-2">
          <Label htmlFor="startValue">開始値 (円)</Label>
          <Input
            id="startValue"
            name="startValue"
            type="number"
            placeholder="0"
            value={formData.startValue}
            onChange={handleInputChange}
          />
        </div>

        {/* 現在値 */}
        <div className="space-y-2">
          <Label htmlFor="currentValue">現在値 (円)</Label>
          <Input
            id="currentValue"
            name="currentValue"
            type="number"
            placeholder="0"
            value={formData.currentValue}
            onChange={handleInputChange}
          />
          
          {/* 進捗バー */}
          <div className="mt-2">
            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full ${
                  progress >= 100 ? "bg-green-500" : 
                  progress >= 75 ? "bg-blue-500" : 
                  progress >= 50 ? "bg-yellow-500" : 
                  progress >= 25 ? "bg-orange-500" : "bg-red-500"
                }`}
                style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
              ></div>
            </div>
            <p className="text-right text-xs text-gray-500 mt-1">
              {Math.round(progress)}% 達成
            </p>
          </div>
        </div>

        {/* 目標値 */}
        <div className="space-y-2">
          <Label htmlFor="targetValue">目標値 (円) <span className="text-red-500">*</span></Label>
          <Input
            id="targetValue"
            name="targetValue"
            type="number"
            placeholder="1000000"
            value={formData.targetValue}
            onChange={handleInputChange}
            className={errors.targetValue ? "border-red-500" : ""}
          />
          {errors.targetValue && <p className="text-red-500 text-sm">{errors.targetValue}</p>}
        </div>

        {/* 日付範囲 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">開始日</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-full justify-start text-left font-normal ${
                    errors.startDate ? "border-red-500" : ""
                  }`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.startDate
                    ? format(new Date(formData.startDate), "yyyy/MM/dd")
                    : "日付を選択"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.startDate ? new Date(formData.startDate) : undefined}
                  onSelect={(date) => date && handleDateChange("startDate", date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetDate">目標日 <span className="text-red-500">*</span></Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-full justify-start text-left font-normal ${
                    errors.targetDate ? "border-red-500" : ""
                  }`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.targetDate
                    ? format(new Date(formData.targetDate), "yyyy/MM/dd")
                    : "日付を選択"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.targetDate ? new Date(formData.targetDate) : undefined}
                  onSelect={(date) => date && handleDateChange("targetDate", date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.targetDate && <p className="text-red-500 text-sm">{errors.targetDate}</p>}
          </div>
        </div>

        {/* 更新頻度 */}
        <div className="space-y-2">
          <Label htmlFor="period">更新頻度</Label>
          <Select
            value={formData.period}
            onValueChange={(value) => handleSelectChange("period", value)}
          >
            <SelectTrigger id="period">
              <SelectValue placeholder="頻度を選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">毎週</SelectItem>
              <SelectItem value="monthly">毎月</SelectItem>
              <SelectItem value="quarterly">四半期</SelectItem>
              <SelectItem value="yearly">毎年</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 自動更新 */}
        <div className="flex items-center space-x-2">
          <Switch
            id="autoUpdate"
            checked={formData.autoUpdate}
            onCheckedChange={handleSwitchChange}
          />
          <Label htmlFor="autoUpdate">資産の変化を自動反映する</Label>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          キャンセル
        </Button>
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
          {goal ? "更新する" : "目標を設定する"}
        </Button>
      </div>
    </form>
  );
}