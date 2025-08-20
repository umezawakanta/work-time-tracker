import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Rocket, Sparkles, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Onboarding: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-xl border-0 shadow-2xl bg-white/85 backdrop-blur">
        <CardHeader className="text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg">
            <Rocket className="h-7 w-7 text-white" />
          </div>
          <CardTitle className="mt-4 text-2xl font-bold text-gray-900">オンボーディング</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-gray-600">
            初期設定ウィザードは準備中です。公開までしばらくお待ちください。
          </p>
          <div className="flex items-center justify-center gap-2">
            <Badge className="bg-blue-100 text-blue-700">プレースホルダー</Badge>
            <Clock className="h-4 w-4 text-blue-600" />
          </div>
          <div className="pt-4 flex items-center justify-center gap-3">
            <Button onClick={() => navigate('/')} variant="outline">
              ホームに戻る
            </Button>
            <Button disabled className="inline-flex items-center">
              <Sparkles className="h-4 w-4 mr-2" />
              開始（近日公開）
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;
