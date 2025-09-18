import React from 'react';
import './SiteIntroComponent.css';

const SiteIntroComponent: React.FC = () => {
  return (
    <div className="site-intro">
      <div className="intro-content">
        <div className="intro-header">
          <h1 className="intro-title">
            <span className="title-icon">⏰</span>
            Work Time Tracker
          </h1>
          <p className="intro-subtitle">
            可愛いキャラクターと一緒に作業時間を管理しよう！
          </p>
        </div>
        
        <div className="intro-features">
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>タイマー機能</h3>
            <p>作業時間を正確に計測し、集中力を維持</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>記録管理</h3>
            <p>作業記録を自動保存し、進捗を可視化</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">📝</div>
            <h3>メモ機能</h3>
            <p>作業内容や気づきを記録して振り返り</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🎨</div>
            <h3>カスタマイズ</h3>
            <p>テーマやフォントを自由に変更可能</p>
          </div>
        </div>
        
        <div className="intro-description">
          <h2>Work Time Trackerとは？</h2>
          <p>
            Work Time Trackerは、可愛いキャラクターと一緒に作業時間を管理できる
            革新的な時間管理アプリケーションです。従来の堅い時間管理ツールとは違い、
            楽しく継続できるデザインと機能を提供します。
          </p>
          
          <h3>主な特徴</h3>
          <ul>
            <li>🎭 <strong>可愛いキャラクター</strong> - ヘタウマキャラクターが作業を応援</li>
            <li>⏱️ <strong>直感的なタイマー</strong> - ワンクリックで作業開始・終了</li>
            <li>📈 <strong>詳細な分析</strong> - 作業時間の統計とグラフ表示</li>
            <li>🎨 <strong>豊富なテーマ</strong> - お気に入りのデザインを選択</li>
            <li>📱 <strong>レスポンシブ対応</strong> - PC・タブレット・スマホで快適利用</li>
            <li>🔒 <strong>プライバシー重視</strong> - データは安全に管理</li>
          </ul>
          
          <h3>こんな方におすすめ</h3>
          <ul>
            <li>📚 学生 - 勉強時間の管理と集中力向上</li>
            <li>💼 フリーランサー - 作業時間の正確な計測と請求</li>
            <li>🏠 在宅ワーカー - リモートワークの時間管理</li>
            <li>🎯 目標達成者 - 習慣化と継続的な改善</li>
          </ul>
        </div>
        
        <div className="intro-cta">
          <h2>今すぐ始めよう！</h2>
          <p>
            無料で利用開始できます。アカウント作成は簡単で、
            すぐに作業時間の管理を始められます。
          </p>
        </div>
      </div>
    </div>
  );
};

export default SiteIntroComponent;
