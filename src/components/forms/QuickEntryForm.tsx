// src/components/forms/QuickEntryForm.tsx

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PoliticalParty } from '@/types/survey';
import { DialogFooter } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import './QuickEntryForm.css'; // CSSファイルをインポート

// 送信データの型定義
interface SurveySubmitData {
  mediaOutlet: string;
  surveyEndDate: string;
  sampleSize?: number;
  supportRates: Array<{
    partyId: string;
    supportRate: number;
  }>;
  cabinetSupport?: number;
  cabinetOppose?: number;
}

interface QuickEntryFormProps {
  parties: PoliticalParty[];
  mediaOutlet?: string;
  onSubmit: (data: SurveySubmitData) => void;
  onCancel: () => void;
}

export const QuickEntryForm: React.FC<QuickEntryFormProps> = ({
  parties,
  mediaOutlet,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    mediaOutlet: mediaOutlet || '',
    surveyDate: format(new Date(), 'yyyy-MM-dd'),
    sampleSize: '',
    supportRates: {} as Record<string, string>,
    cabinetSupport: '',
    cabinetOppose: '',
  });

  const mediaOptions = ['NHK', '読売新聞', '朝日新聞', '毎日新聞', '日経新聞', '共同通信'];

  const handleRateChange = (partyId: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      supportRates: {
        ...prev.supportRates,
        [partyId]: value,
      },
    }));
  };

  const handleSubmit = () => {
    // 入力値を検証
    if (!formData.mediaOutlet) {
      alert('調査機関を選択してください');
      return;
    }

    // 支持率を数値に変換
    const supportRates = Object.entries(formData.supportRates)
      .map(([partyId, rate]) => ({
        partyId,
        supportRate: parseFloat(rate),
      }))
      .filter((item) => !isNaN(item.supportRate));

    // 送信データを整形
    const submitData: SurveySubmitData = {
      mediaOutlet: formData.mediaOutlet,
      surveyEndDate: formData.surveyDate,
      sampleSize: formData.sampleSize ? parseInt(formData.sampleSize) : undefined,
      supportRates,
      cabinetSupport: formData.cabinetSupport ? parseFloat(formData.cabinetSupport) : undefined,
      cabinetOppose: formData.cabinetOppose ? parseFloat(formData.cabinetOppose) : undefined,
    };

    onSubmit(submitData);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="media-outlet">調査機関</Label>
          <Select
            value={formData.mediaOutlet}
            onValueChange={(value) => setFormData({ ...formData, mediaOutlet: value })}
            disabled={!!mediaOutlet}
          >
            <SelectTrigger id="media-outlet">
              <SelectValue placeholder="調査機関を選択" />
            </SelectTrigger>
            <SelectContent>
              {mediaOptions.map((media) => (
                <SelectItem key={media} value={media}>
                  {media}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="survey-date">調査日</Label>
          <Input
            id="survey-date"
            type="date"
            value={formData.surveyDate}
            onChange={(e) => setFormData({ ...formData, surveyDate: e.target.value })}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="sample-size">サンプルサイズ</Label>
        <Input
          id="sample-size"
          type="number"
          placeholder="例: 1000"
          value={formData.sampleSize}
          onChange={(e) => setFormData({ ...formData, sampleSize: e.target.value })}
        />
      </div>

      <div>
        <Label>政党支持率 (%)</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">
          {parties.map((party) => (
            <div key={party._id} className="flex items-center space-x-2">
              <div
                className="party-color-indicator"
                ref={(el) => {
                  if (el) {
                    el.style.setProperty('--party-color', party.colorCode);
                  }
                }}
              ></div>
              <Label htmlFor={`party-${party._id}`} className="w-full">
                {party.name}
              </Label>
              <Input
                id={`party-${party._id}`}
                type="number"
                placeholder="%"
                className="w-16"
                value={formData.supportRates[party._id] || ''}
                onChange={(e) => handleRateChange(party._id, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label>内閣支持率 (%)</Label>
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div>
            <Label htmlFor="cabinet-support">支持</Label>
            <Input
              id="cabinet-support"
              type="number"
              placeholder="%"
              value={formData.cabinetSupport}
              onChange={(e) => setFormData({ ...formData, cabinetSupport: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="cabinet-oppose">不支持</Label>
            <Input
              id="cabinet-oppose"
              type="number"
              placeholder="%"
              value={formData.cabinetOppose}
              onChange={(e) => setFormData({ ...formData, cabinetOppose: e.target.value })}
            />
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          キャンセル
        </Button>
        <Button onClick={handleSubmit}>登録</Button>
      </DialogFooter>
    </div>
  );
};
