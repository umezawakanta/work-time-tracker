import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const KpiNamingRules: React.FC = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>KPI命名ルール（1ページ）</CardTitle>
          <CardDescription>分析・計測の一貫性のための命名規則</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-gray-800">
          <section>
            <h3 className="font-semibold mb-1">1. イベント命名</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                形式: <code>area_action_object</code>（snake_case）
              </li>
              <li>
                例: <code>ai_assistant_reply</code>, <code>assessment_saved</code>,{' '}
                <code>learning_progress_saved</code>
              </li>
              <li>
                初回成功統一: <code>activation_first_success</code>（sourceに元イベントを含める）
              </li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold mb-1">2. パラメータ</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <code>ok</code>: boolean（成功/失敗）
              </li>
              <li>
                <code>source</code>: string（誘導元やソース名）
              </li>
              <li>
                <code>path</code>: string（<code>window.location.pathname</code>）
              </li>
              <li>
                <code>at</code>: ISO8601（タイムスタンプ）
              </li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold mb-1">3. ファネル（funnel_*）</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <code>funnel_visit</code>: ステップ訪問（<code>step</code>）
              </li>
              <li>
                <code>funnel_action</code>: 行動（<code>step</code>）
              </li>
              <li>
                <code>funnel_success</code>: 成功（<code>step</code>）
              </li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold mb-1">4. 共有（share_*）</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <code>share_clicked</code>: 共有UIクリック（<code>platform</code>, <code>path</code>
                ）
              </li>
              <li>
                <code>social_share</code>: サーバー受信イベント（同上）
              </li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold mb-1">5. スカラーKPI</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                命名は <code>area_metric_window</code> 例: <code>ai_dau_7d</code>,{' '}
                <code>referral_conv_7d</code>
              </li>
              <li>
                単位明示: <code>ms</code>, <code>pct</code>, <code>yen</code> など
              </li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold mb-1">6. 予約語</h3>
            <p>
              <code>visit</code>, <code>action</code>, <code>success</code>, <code>error</code>,{' '}
              <code>conv</code>, <code>pct</code>, <code>ms</code> は共通に使用
            </p>
          </section>

          <section>
            <h3 className="font-semibold mb-1">7. 例まとめ</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <code>activation_first_success</code>（初回成功）
              </li>
              <li>
                <code>nps_inline_submitted</code>（NPS送信: <code>score</code>, <code>path</code>）
              </li>
              <li>
                <code>daily_nudge_action</code>, <code>daily_nudge_snooze</code>
              </li>
            </ul>
          </section>
        </CardContent>
      </Card>
    </div>
  );
};

export default KpiNamingRules;
