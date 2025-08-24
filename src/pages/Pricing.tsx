import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Clock } from 'lucide-react';

const Pricing: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-2xl border-0 shadow-xl bg-white/80 backdrop-blur">
        <CardContent className="p-8 text-center space-y-4">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg">
            <CreditCard className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">料金プラン</h1>
          <p className="text-gray-600">
            現在、プラン内容を準備中です。公開までしばらくお待ちください。
          </p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Badge className="bg-blue-100 text-blue-700">プレースホルダー</Badge>
            <Clock className="h-4 w-4 text-blue-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Pricing;
