import React from 'react';
import './PrivacyPolicyComponent.css';

const PrivacyPolicyComponent: React.FC = () => {
  return (
    <div className="privacy-policy-container">
      <div className="privacy-policy-content">
        <h1>プライバシーポリシー</h1>
        <p className="last-updated">最終更新日: 2024年12月19日</p>
        
        <section>
          <h2>1. はじめに</h2>
          <p>
            Work Time Tracker（以下「当サービス」）は、ユーザーの個人情報の保護を重要な責務と考え、
            以下のプライバシーポリシーに従って個人情報を適切に取り扱います。
          </p>
        </section>

        <section>
          <h2>2. 収集する情報</h2>
          <h3>2.1 アカウント情報</h3>
          <ul>
            <li>ユーザー名</li>
            <li>メールアドレス</li>
            <li>パスワード（暗号化して保存）</li>
          </ul>
          
          <h3>2.2 作業記録情報</h3>
          <ul>
            <li>作業時間の記録</li>
            <li>プロジェクト情報</li>
            <li>メモ内容</li>
            <li>給与記録</li>
            <li>日記内容</li>
          </ul>
        </section>

        <section>
          <h2>3. 情報の利用目的</h2>
          <p>収集した情報は以下の目的で利用します：</p>
          <ul>
            <li>サービスの提供・運営</li>
            <li>ユーザー認証・セキュリティ</li>
            <li>データの分析・統計</li>
            <li>サービス改善・新機能開発</li>
            <li>お客様サポート</li>
          </ul>
        </section>

        <section>
          <h2>4. 情報の保存・管理</h2>
          <p>
            個人情報は適切なセキュリティ対策を講じて保存・管理し、
            不正アクセス、紛失、破壊、改ざん、漏洩を防止します。
          </p>
        </section>

        <section>
          <h2>5. 第三者への提供</h2>
          <p>
            法令に基づく場合を除き、ユーザーの同意なく個人情報を第三者に提供することはありません。
          </p>
        </section>

        <section>
          <h2>6. クッキー・トラッキング技術</h2>
          <p>
            当サービスでは、サービス向上のためクッキーを使用する場合があります。
            ブラウザの設定によりクッキーの受け入れを拒否できますが、
            一部機能が利用できなくなる場合があります。
          </p>
        </section>

        <section>
          <h2>7. データの削除</h2>
          <p>
            ユーザーはアカウント削除により、個人情報の削除を求めることができます。
            削除後は復元できませんのでご注意ください。
          </p>
        </section>

        <section>
          <h2>8. プライバシーポリシーの変更</h2>
          <p>
            本ポリシーは必要に応じて変更される場合があります。
            重要な変更については、サービス内でお知らせします。
          </p>
        </section>

        <section>
          <h2>9. お問い合わせ</h2>
          <p>
            プライバシーポリシーに関するお問い合わせは、
            サービス内のお問い合わせ機能よりご連絡ください。
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicyComponent;
