import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Privacy: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <Card className="w-full max-w-3xl shadow-lg">
        <CardHeader>
          <CardTitle>プライバシーポリシー（プレースホルダー）</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-slate-700 text-sm leading-relaxed">
          <p>
            本ページはプライバシーポリシーのプレースホルダーです。正式な文面は順次掲載予定です。
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>通信はTLSで暗号化されます。</li>
            <li>入力データは学習目的に利用しません。</li>
            <li>ローカル保存のAI設定はユーザー端末上で管理されます。</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default Privacy;
