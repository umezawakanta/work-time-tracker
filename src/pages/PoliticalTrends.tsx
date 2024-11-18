// src/pages/PoliticalTrends.tsx
import { useState } from 'react';
import PoliticalChart from '@/components/chart/PoliticalChart';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PartyRegistrationForm } from '@/components/forms/PartyRegistrationForm';
import { SurveyRegistrationForm } from '@/components/forms/SurveyRegistrationForm';

export default function PoliticalTrends() {
  const [showPartyForm, setShowPartyForm] = useState(false);
  const [showSurveyForm, setShowSurveyForm] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">政党支持率トレンド</h1>
      
      <div className="flex gap-4 mb-4">
        <Button onClick={() => setShowPartyForm(!showPartyForm)}>
          {showPartyForm ? '政党登録を閉じる' : '政党を登録'}
        </Button>
        <Button onClick={() => setShowSurveyForm(!showSurveyForm)}>
          {showSurveyForm ? '調査結果登録を閉じる' : '調査結果を登録'}
        </Button>
      </div>

      {showPartyForm && (
        <Card className="p-4 mb-4">
          <h2 className="text-xl font-bold mb-4">政党登録</h2>
          <PartyRegistrationForm />
        </Card>
      )}

      {showSurveyForm && (
        <Card className="p-4 mb-4">
          <h2 className="text-xl font-bold mb-4">調査結果登録</h2>
          <SurveyRegistrationForm />
        </Card>
      )}

      <div className="w-full h-[600px] bg-black rounded-lg shadow-lg overflow-hidden">
        <PoliticalChart />
      </div>
    </div>
  );
}