Analytics Dashboard 要件定義（Basic）

本ドキュメントは、計測/分析の基本ダッシュボード要件（P1）を定義します。対象は Web フロント（React）とバックエンド（Express）の最小構成で、事業・UX意思決定に直結するコア指標の可視化を目的とします。

対象イベント（ファネル設計）

- page_view(home): ホームページ訪問（実装イベントIDは page_view_home）
- cta_click: ヒーロー CTA（例: 「今すぐ始める」「3分でセットアップ」）押下
- ai_suggest_click: AI提案モーダルの「提案を受ける」押下
- ai_success: AI提案の成功（結果の提示完了）

実装マッピング:

- src/lib/track.ts
  - trackPageViewHome() → page_view_home
  - trackCtaClick() → cta_click（該当CTAは同時にファネル記録）
  - trackAISuggestClick() → ai_suggest_click
  - trackAISuccess() → ai_success
- src/services/analytics/UserTrackingService.ts
  - trackFunnel(event, meta) により funnel_event として保存
  - 既存の trackCTA, trackAIUsage, trackPageView と併用可能

イベントのメタデータ（例）

- page_view_home: { path }
- cta_click: { id, label, variant, location, page }
- ai_suggest_click: { contextLength }
- ai_success: { durationMs }

ダッシュボードで可視化するKPI

- ファネル件数/率
  - S1: page_view(home)
  - S2: cta_click
  - S3: ai_suggest_click
  - S4: ai_success
  - 変換率: S2/S1, S3/S2, S4/S3, 総合CVR=S4/S1
- AI成功までの平均時間: ai_success.durationMs の平均/中央値（要メタ保存）
- CTA CTR: cta_click / page_view_home
- デバイス/ブラウザ別内訳: desktop/mobile/tablet、Browser、OS
- 期間別推移: 日/週/月のイベント時系列

画面要件（最小）

- Funnelカード: S1〜S4値、各ステージの変換率、ドロップ率
- 時系列チャート: 日次/週次のイベント数（総数・イベント種別スタック）
- 内訳カード: デバイス種別、CTAバリアント、CTA配置（location）
- 最近のイベントテーブル: 直近N件（イベント、時刻、page、metadataサマリ）
- 期間/フィルタ: 日付範囲、デバイス、ブラウザ、language（ロケール）、ログイン有無、プラン

データモデル/保存仕様（既存）

- UserSession: セッション・UA・デバイス等
- PageView: ページ別の時間・スクロール量・インタラクション
- UserInteraction: type と metadata
  - 既存に funnel_event を追加済み（trackFunnel()）
- 送信エンドポイント: POST /api/analytics/track
- 集計取得: GET /api/analytics/summary?range=day|week|month

参考: src/services/analytics/UserTrackingService.ts

集計ロジック（概要）

- 粒度: 1イベント=1行（funnel_event 他）
- ファネル計算:
  - 期間内の page_view_home を母数（S1）
  - 期間内の cta_click, ai_suggest_click, ai_success を S2〜S4
  - セッション紐付けあり: 可能であれば同一セッション内の連鎖率も別指標として算出
- 時系列:
  - イベントの timestamp を日/週/月で集計
- 内訳:
  - UserSession.device, browser, location.language などでグルーピング

API 要件（拡張）

- GET /api/analytics/funnel?start=ISO&end=ISO
  - 戻り値: { s1, s2, s3, s4, rates: { s2_over_s1, s3_over_s2, s4_over_s3, s4_over_s1 } }
- GET /api/analytics/timeseries?start=ISO&end=ISO&bucket=day|week|month
  - 戻り値: [{ bucketStart, counts: { page_view_home, cta_click, ai_suggest_click, ai_success } }]
- GET /api/analytics/breakdown?dimension=device|browser|locale&start=ISO&end=ISO
  - 戻り値: { dimension: 'device', items: [{ key: 'desktop', count, ratio }] }

（最初は既存 summary の拡張で代替可。負荷と優先度に応じ段階的に分割）

プライバシー/セキュリティ

- 収集データの最小化（既存方針準拠）
  - PIIは保存しない。
  - APIキー等の秘匿情報は送信しない。
- 送信はTLS前提。第三者提供なし。
- ログ保持期間: 90日（初期値。後日設定化）
- オプトアウト対応: Do Not Track 等の考慮（将来項目）

パフォーマンス要件

- 送信は非同期・失敗時はUX阻害しない（既存実装）
- イベント送信は1アクション=1POST（初期）。必要ならバッチ化・スロットリング導入
- ダッシュボードの初期レンダリング < 2s（LCP目安）。重いグラフは遅延ロード

テスト要件

- 単体: trackFunnel()/trackCTA() が POST /analytics/track を正しく呼ぶ
- 統合: ファネル4イベントのカウントが想定通りに増加
- E2E: Home → CTA → AI提案 → 成功までの流れでイベントが順に生成されること

実装ポイント（既存コードへのひも付け）

- Home表示: src/pages/Home.tsx → trackPageViewHome()
- CTA: src/components/hero/Hero.tsx など → trackCtaClick()
- AIモーダル: src/components/ai/AIPriorityTaskModal.tsx
  - クリック: ai_suggest_click
  - 成功: ai_success
- サービス: src/services/analytics/UserTrackingService.ts
  - trackFunnel() / trackCTA() / trackPageView()

今後の拡張（メモ）

- コーホート分析、セッションファネル（セッション内完走率）
- A/B テスト軸でのファネル比較
- 収益関連ファネル（課金導線）
- バッチ送信・圧縮、再送制御、耐障害性強化
