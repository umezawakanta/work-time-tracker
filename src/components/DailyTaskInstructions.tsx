import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ExternalLink,
  FileText,
  Building2,
  CreditCard,
  DollarSign,
  Lightbulb,
  Home,
  Music,
  Utensils,
  Droplets,
  BookOpen,
  Code,
  Newspaper,
  Refrigerator,
  Sparkles,
  Shirt,
  Sun,
  Folders,
  Archive,
} from 'lucide-react';

interface DailyTaskInstructionsProps {
  taskId: string;
  taskName: string;
  category: string;
}

const taskInstructions: {
  [key: string]: { steps: string[]; links: { label: string; url: string; description: string }[] };
} = {
  '1': {
    steps: [
      '財布を開いて現金を数える',
      '硬貨と紙幣を分けて計算する',
      '資産負債レポートページで現金残高を入力する',
      '前日との差額を確認する',
    ],
    links: [
      {
        label: '資産負債レポート',
        url: '/asset-liability-report',
        description: '現金残高を入力・管理',
      },
    ],
  },
  '2': {
    steps: [
      '銀行口座管理ページでメイン口座を確認する',
      'オンラインバンキングで残高をチェックする',
      '入出金履歴を確認する',
      '資産負債レポートに反映させる',
    ],
    links: [
      {
        label: '銀行口座管理',
        url: '/bank-accounts',
        description: '口座情報の管理・CSVインポート',
      },
      {
        label: '三井住友銀行オンラインバンキング',
        url: 'https://www.smbc.co.jp/kojin/',
        description: '三井住友銀行大塚支店普通預金口座の9月分の入出金履歴をダウンロード',
      },
      {
        label: '横浜銀行オンラインバンキング',
        url: 'https://www.yokohamabank.co.jp/kojin/',
        description: '横浜銀行の取引明細をダウンロード',
      },
      {
        label: 'じぶん銀行オンラインバンキング',
        url: 'https://www.jibunbank.co.jp/',
        description: 'じぶん銀行の取引明細をダウンロード',
      },
    ],
  },
  '3': {
    steps: [
      'カレンダーアプリを開く',
      '今日の予定を確認する',
      '明日以降の重要な予定をチェックする',
      '必要に応じて予定を追加・修正する',
    ],
    links: [{ label: 'カレンダー', url: '/calendar', description: '予定の管理・確認' }],
  },
  '4': {
    steps: [
      'サブスクリプション管理ページを開く',
      '固定費の支払い状況を確認する',
      '未払いがないかチェックする',
      '必要に応じて支払いを実行する',
    ],
    links: [
      {
        label: 'サブスクリプション管理',
        url: '/subscriptions',
        description: '固定費・サブスクの管理',
      },
      {
        label: '三井住友銀行オンラインバンキング',
        url: 'https://www.smbc.co.jp/kojin/',
        description: '固定費の支払い実行',
      },
    ],
  },
  '5': {
    steps: [
      '負債管理ページを開く',
      '利息の支払い状況を確認する',
      '返済計画をチェックする',
      '必要に応じて返済を実行する',
    ],
    links: [
      { label: '負債管理', url: '/debt', description: '借金・ローン・クレジットカードの管理' },
    ],
  },
  '6': {
    steps: [
      '光熱費管理ページを開く',
      '電気・ガス・水道の使用量を確認する',
      '前月との比較を行う',
      '節約のポイントを確認する',
    ],
    links: [
      { label: '光熱費管理', url: '/utilities', description: '電気・ガス・水道の使用量管理' },
    ],
  },
  '7': {
    steps: [
      'ギターを手に取る',
      '前回の練習内容を確認する',
      '今日の練習メニューを決める',
      '練習記録を入力する',
    ],
    links: [
      { label: 'ギター練習記録', url: '/guitar-practice', description: '練習内容・進捗の記録' },
    ],
  },
  '8': {
    steps: ['食器を集める', '洗剤を準備する', '食器を洗う', '水気を切って乾かす'],
    links: [{ label: '家事管理', url: '/household', description: '家事の記録・管理' }],
  },
  '9': {
    steps: [
      '冷蔵庫を開ける',
      '中身を確認する',
      '期限切れの食材をチェックする',
      '今日の料理を決める',
    ],
    links: [{ label: '料理管理', url: '/cooking', description: 'レシピ・食材の管理' }],
  },
  '10': {
    steps: ['お風呂の準備をする', '温度を確認する', '入浴する', '体を拭いて着替える'],
    links: [{ label: '個人ケア', url: '/personal-care', description: '健康・美容の記録' }],
  },
  '11': {
    steps: ['読書したい本を選ぶ', '静かな場所に移動する', '集中して読書する', '読書記録を入力する'],
    links: [{ label: '読書記録', url: '/reading', description: '読書の記録・管理' }],
  },
  '12': {
    steps: [
      '開発環境を開く',
      '前回の作業内容を確認する',
      '今日の開発タスクを決める',
      '進捗を記録する',
    ],
    links: [{ label: '開発進捗', url: '/development', description: 'プログラミング・開発の記録' }],
  },
  '13': {
    steps: ['古い新聞を集める', '日付を確認する', '不要なものを分別する', 'リサイクルに出す'],
    links: [{ label: '家事管理', url: '/household', description: '家事の記録・管理' }],
  },
  '14': {
    steps: [
      'チラシを集める',
      '種類別に分類する',
      'リサイクル可能なものを選別する',
      '分別して処分する',
    ],
    links: [{ label: '家事管理', url: '/household', description: '家事の記録・管理' }],
  },
  '15': {
    steps: ['冷蔵庫を開ける', '中身を確認する', '期限切れの食材をチェックする', '整理整頓する'],
    links: [{ label: '料理管理', url: '/cooking', description: 'レシピ・食材の管理' }],
  },
  '16': {
    steps: ['掃除機を準備する', '床の上にあるものを片付ける', '掃除機をかける', '完了を記録する'],
    links: [{ label: '家事管理', url: '/household', description: '家事の記録・管理' }],
  },
  '17': {
    steps: ['洗濯物を集める', '色別・素材別に分ける', '洗濯機に入れる', '洗濯を開始する'],
    links: [{ label: '家事管理', url: '/household', description: '家事の記録・管理' }],
  },
  '18': {
    steps: ['洗濯物を取り出す', '干し場を準備する', '洗濯物を干す', '完了を記録する'],
    links: [{ label: '家事管理', url: '/household', description: '家事の記録・管理' }],
  },
  '19': {
    steps: ['乾いた洗濯物を集める', '種類別に分ける', 'たたむ', '収納場所にしまう'],
    links: [{ label: '家事管理', url: '/household', description: '家事の記録・管理' }],
  },
  '20': {
    steps: ['押入れを開ける', '中身を確認する', '不要なものを選別する', '整理整頓する'],
    links: [{ label: '家事管理', url: '/household', description: '家事の記録・管理' }],
  },
};

const categoryIcons: { [key: string]: React.ComponentType<any> } = {
  finance: DollarSign,
  planning: FileText,
  personal: Home,
  hobby: Music,
  household: Utensils,
  work: Code,
};

export const DailyTaskInstructions: React.FC<DailyTaskInstructionsProps> = ({
  taskId,
  taskName,
  category,
}) => {
  const instructions = taskInstructions[taskId];
  const IconComponent = categoryIcons[category] || FileText;

  if (!instructions) {
    return null;
  }

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconComponent className="h-5 w-5" />
          {taskName} - 詳細手順
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 手順 */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">📋 実行手順</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
              {instructions.steps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </div>

          {/* 関連リンク */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">🔗 関連ページ・外部サイト</h4>
            <div className="space-y-2">
              {instructions.links.map((link, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <ExternalLink className="h-4 w-4 text-gray-500" />
                  <div className="flex-1">
                    <a
                      href={link.url}
                      target={link.url.startsWith('http') ? '_blank' : '_self'}
                      rel={link.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="text-blue-600 hover:text-blue-800 underline font-medium"
                    >
                      {link.label}
                    </a>
                    <p className="text-xs text-gray-600 mt-1">{link.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
