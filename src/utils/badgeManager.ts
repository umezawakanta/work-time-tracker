// バッジ管理ユーティリティ

import { Badge, UserBadge, BadgeProgress, BadgeShareData } from '../types/badge';
import { BADGES } from '../constants/badges';

class BadgeManager {
  private userBadges: UserBadge[] = [];
  private badgeProgress: BadgeProgress[] = [];

  constructor() {
    this.loadUserBadges();
    this.initializeBadgeProgress();
  }

  // ユーザーバッジを読み込み
  private loadUserBadges(): void {
    const saved = localStorage.getItem('userBadges');
    if (saved) {
      try {
        this.userBadges = JSON.parse(saved).map((badge: any) => ({
          ...badge,
          unlockedAt: new Date(badge.unlockedAt)
        }));
      } catch (error) {
        console.error('Failed to load user badges:', error);
        this.userBadges = [];
      }
    }
  }

  // ユーザーバッジを保存
  private saveUserBadges(): void {
    localStorage.setItem('userBadges', JSON.stringify(this.userBadges));
  }

  // バッジ進捗を初期化
  private initializeBadgeProgress(): void {
    this.badgeProgress = BADGES.map(badge => ({
      badgeId: badge.id,
      progress: this.calculateBadgeProgress(badge),
      isUnlocked: this.isBadgeUnlocked(badge.id)
    }));
  }

  // バッジの進捗を計算
  private calculateBadgeProgress(badge: Badge): number {
    // 実際の実装では、各バッジの条件に応じて進捗を計算
    // ここでは簡易的な実装
    if (this.isBadgeUnlocked(badge.id)) {
      return 100;
    }
    return 0;
  }

  // バッジがアンロックされているかチェック
  public isBadgeUnlocked(badgeId: string): boolean {
    return this.userBadges.some(badge => badge.badgeId === badgeId);
  }

  // バッジをアンロック
  public unlockBadge(badgeId: string): boolean {
    if (this.isBadgeUnlocked(badgeId)) {
      return false; // 既にアンロック済み
    }

    const badge = BADGES.find(b => b.id === badgeId);
    if (!badge) {
      return false; // バッジが見つからない
    }

    const userBadge: UserBadge = {
      badgeId,
      unlockedAt: new Date(),
      isNew: true
    };

    this.userBadges.push(userBadge);
    this.saveUserBadges();
    this.updateBadgeProgress(badgeId);

    return true;
  }

  // バッジ進捗を更新
  private updateBadgeProgress(badgeId: string): void {
    const progress = this.badgeProgress.find(p => p.badgeId === badgeId);
    if (progress) {
      progress.progress = 100;
      progress.isUnlocked = true;
    }
  }

  // 新しく獲得したバッジを取得
  public getNewBadges(): Badge[] {
    const newBadgeIds = this.userBadges
      .filter(badge => badge.isNew)
      .map(badge => badge.badgeId);

    return BADGES.filter(badge => newBadgeIds.includes(badge.id));
  }

  // 新しく獲得したバッジを既読にする
  public markBadgesAsRead(): void {
    this.userBadges.forEach(badge => {
      badge.isNew = false;
    });
    this.saveUserBadges();
  }

  // ユーザーの全バッジを取得
  public getUserBadges(): Badge[] {
    const unlockedBadgeIds = this.userBadges.map(badge => badge.badgeId);
    return BADGES.filter(badge => unlockedBadgeIds.includes(badge.id));
  }

  // バッジ進捗を取得
  public getBadgeProgress(): BadgeProgress[] {
    return this.badgeProgress;
  }

  // 特定のカテゴリのバッジを取得
  public getBadgesByCategory(category: string): Badge[] {
    return BADGES.filter(badge => badge.category === category);
  }

  // 特定のレアリティのバッジを取得
  public getBadgesByRarity(rarity: string): Badge[] {
    return BADGES.filter(badge => badge.rarity === rarity);
  }

  // シェア用データを生成
  public generateShareData(badgeId: string, user: { name: string; displayName?: string }): BadgeShareData | null {
    const badge = BADGES.find(b => b.id === badgeId);
    if (!badge || !this.isBadgeUnlocked(badgeId)) {
      return null;
    }

    const shareUrl = `${window.location.origin}?badge=${badgeId}`;
    
    return {
      badge,
      user,
      shareUrl,
      shareText: badge.shareText,
      shareImageUrl: badge.shareImageUrl
    };
  }

  // ユーザー登録時のバッジをチェック
  public checkRegistrationBadges(): Badge[] {
    const registrationBadges = this.getBadgesByCategory('registration');
    const unlockedBadges: Badge[] = [];

    registrationBadges.forEach(badge => {
      if (this.unlockBadge(badge.id)) {
        unlockedBadges.push(badge);
      }
    });

    return unlockedBadges;
  }

  // 作業開始時のバッジをチェック
  public checkWorkStartBadges(): Badge[] {
    const unlockedBadges: Badge[] = [];

    // 初めての作業バッジ
    const firstWorkBadge = BADGES.find(b => b.id === 'first_work');
    if (firstWorkBadge && this.unlockBadge(firstWorkBadge.id)) {
      unlockedBadges.push(firstWorkBadge);
    }

    return unlockedBadges;
  }

  // 作業完了時のバッジをチェック
  public checkWorkCompleteBadges(workMinutes: number, startTime?: Date): Badge[] {
    const unlockedBadges: Badge[] = [];

    // 早起きバッジ（朝6時前）
    if (startTime) {
      const hour = startTime.getHours();
      if (hour < 6) {
        const earlyBirdBadge = BADGES.find(b => b.id === 'early_bird');
        if (earlyBirdBadge && this.unlockBadge(earlyBirdBadge.id)) {
          unlockedBadges.push(earlyBirdBadge);
        }
      }
    }

    // 夜型バッジ（夜22時以降）
    if (startTime) {
      const hour = startTime.getHours();
      if (hour >= 22) {
        const nightOwlBadge = BADGES.find(b => b.id === 'night_owl');
        if (nightOwlBadge && this.unlockBadge(nightOwlBadge.id)) {
          unlockedBadges.push(nightOwlBadge);
        }
      }
    }

    // 完璧な一日バッジ（8時間以上）
    if (workMinutes >= 480) { // 8時間 = 480分
      const perfectDayBadge = BADGES.find(b => b.id === 'perfect_day');
      if (perfectDayBadge && this.unlockBadge(perfectDayBadge.id)) {
        unlockedBadges.push(perfectDayBadge);
      }
    }

    return unlockedBadges;
  }

  // ログインボーナスをチェック・付与
  public checkLoginBonus(): Badge | null {
    const today = new Date().toDateString();
    const lastLoginDate = localStorage.getItem('lastLoginDate');
    
    // 今日初回ログインの場合のみボーナス付与
    if (lastLoginDate !== today) {
      localStorage.setItem('lastLoginDate', today);
      
      const loginBadge = BADGES.find(b => b.id === 'login_bonus');
      if (loginBadge && this.unlockBadge(loginBadge.id)) {
        return loginBadge;
      }
    }
    
    return null;
  }

  // ログアウトボーナスをチェック・付与
  public checkLogoutBonus(): Badge | null {
    const today = new Date().toDateString();
    const lastLogoutDate = localStorage.getItem('lastLogoutDate');
    
    // 今日初回ログアウトの場合のみボーナス付与
    if (lastLogoutDate !== today) {
      localStorage.setItem('lastLogoutDate', today);
      
      const logoutBadge = BADGES.find(b => b.id === 'logout_achievement');
      if (logoutBadge && this.unlockBadge(logoutBadge.id)) {
        return logoutBadge;
      }
    }
    
    return null;
  }

  // 作業時間に基づくバッジをチェック
  public checkWorkTimeBadges(totalWorkHours: number): Badge[] {
    const unlockedBadges: Badge[] = [];
    
    // 作業時間バッジをチェック
    const workTimeBadges = BADGES.filter(b => b.category === 'work');
    workTimeBadges.forEach(badge => {
      const hours = parseInt(badge.id.split('_')[2]);
      if (totalWorkHours >= hours && !this.isBadgeUnlocked(badge.id)) {
        if (this.unlockBadge(badge.id)) {
          unlockedBadges.push(badge);
        }
      }
    });
    
    return unlockedBadges;
  }

  // 連続作業日数に基づくバッジをチェック
  public checkStreakBadges(consecutiveDays: number): Badge[] {
    const unlockedBadges: Badge[] = [];
    
    // 連続作業バッジをチェック
    const streakBadges = BADGES.filter(b => b.category === 'streak');
    streakBadges.forEach(badge => {
      const days = parseInt(badge.id.split('_')[2]);
      if (consecutiveDays >= days && !this.isBadgeUnlocked(badge.id)) {
        if (this.unlockBadge(badge.id)) {
          unlockedBadges.push(badge);
        }
      }
    });
    
    return unlockedBadges;
  }

  // 時間管理バッジをチェック
  public checkTimingBadges(workStartTime: Date, workEndTime: Date, plannedDuration: number): Badge[] {
    const unlockedBadges: Badge[] = [];
    
    // 完璧なタイミングバッジ
    const actualDuration = (workEndTime.getTime() - workStartTime.getTime()) / (1000 * 60 * 60); // 時間
    const timeDiff = Math.abs(actualDuration - plannedDuration);
    
    if (timeDiff <= 0.1 && !this.isBadgeUnlocked('perfect_timing')) { // 6分以内の誤差
      if (this.unlockBadge('perfect_timing')) {
        const badge = BADGES.find(b => b.id === 'perfect_timing');
        if (badge) unlockedBadges.push(badge);
      }
    }
    
    // 早起きバッジ
    const startHour = workStartTime.getHours();
    if (startHour < 6 && !this.isBadgeUnlocked('early_bird')) {
      if (this.unlockBadge('early_bird')) {
        const badge = BADGES.find(b => b.id === 'early_bird');
        if (badge) unlockedBadges.push(badge);
      }
    }
    
    // 夜型バッジ
    const endHour = workEndTime.getHours();
    if (endHour >= 23 && !this.isBadgeUnlocked('night_owl')) {
      if (this.unlockBadge('night_owl')) {
        const badge = BADGES.find(b => b.id === 'night_owl');
        if (badge) unlockedBadges.push(badge);
      }
    }
    
    return unlockedBadges;
  }

  // ソーシャルバッジをチェック
  public checkSocialBadges(shareCount: number, badgeShareCount: number): Badge[] {
    const unlockedBadges: Badge[] = [];
    
    // ソーシャルバタフライバッジ
    if (shareCount >= 5 && !this.isBadgeUnlocked('social_butterfly')) {
      if (this.unlockBadge('social_butterfly')) {
        const badge = BADGES.find(b => b.id === 'social_butterfly');
        if (badge) unlockedBadges.push(badge);
      }
    }
    
    // インフルエンサーバッジ
    if (badgeShareCount >= 10 && !this.isBadgeUnlocked('influencer')) {
      if (this.unlockBadge('influencer')) {
        const badge = BADGES.find(b => b.id === 'influencer');
        if (badge) unlockedBadges.push(badge);
      }
    }
    
    return unlockedBadges;
  }

  // コレクションバッジをチェック
  public checkCollectionBadges(): Badge[] {
    const unlockedBadges: Badge[] = [];
    const totalBadges = this.userBadges.length;
    
    // ファーストブラッドバッジ
    if (totalBadges === 1 && !this.isBadgeUnlocked('first_blood')) {
      if (this.unlockBadge('first_blood')) {
        const badge = BADGES.find(b => b.id === 'first_blood');
        if (badge) unlockedBadges.push(badge);
      }
    }
    
    // コレクターバッジ
    if (totalBadges >= 10 && !this.isBadgeUnlocked('collector')) {
      if (this.unlockBadge('collector')) {
        const badge = BADGES.find(b => b.id === 'collector');
        if (badge) unlockedBadges.push(badge);
      }
    }
    
    // マスターコレクターバッジ
    if (totalBadges >= 25 && !this.isBadgeUnlocked('master_collector')) {
      if (this.unlockBadge('master_collector')) {
        const badge = BADGES.find(b => b.id === 'master_collector');
        if (badge) unlockedBadges.push(badge);
      }
    }
    
    // レジェンダリーコレクターバッジ
    if (totalBadges >= 50 && !this.isBadgeUnlocked('legendary_collector')) {
      if (this.unlockBadge('legendary_collector')) {
        const badge = BADGES.find(b => b.id === 'legendary_collector');
        if (badge) unlockedBadges.push(badge);
      }
    }
    
    return unlockedBadges;
  }


  // ユーザーのバッジ統計を取得
  public getBadgeStats(): {
    total: number;
    byCategory: { [category: string]: number };
    byRarity: { [rarity: string]: number };
    completionRate: number;
  } {
    const total = this.userBadges.length;
    const byCategory: { [category: string]: number } = {};
    const byRarity: { [rarity: string]: number } = {};
    
    this.userBadges.forEach(userBadge => {
      const badge = BADGES.find(b => b.id === userBadge.badgeId);
      if (badge) {
        byCategory[badge.category] = (byCategory[badge.category] || 0) + 1;
        byRarity[badge.rarity] = (byRarity[badge.rarity] || 0) + 1;
      }
    });
    
    const completionRate = total / BADGES.length;
    
    return {
      total,
      byCategory,
      byRarity,
      completionRate
    };
  }

  // 既存ユーザー向けのバッジ付与
  public grantExistingUserBadges(): Badge[] {
    const unlockedBadges: Badge[] = [];

    // 登録バッジを強制付与
    const registrationBadges = this.getBadgesByCategory('registration');
    registrationBadges.forEach(badge => {
      if (this.unlockBadge(badge.id)) {
        unlockedBadges.push(badge);
      }
    });

    // 既存の作業データに基づくバッジをチェック
    // ここでは簡易的に基本的なバッジを付与
    const basicBadges = ['first_work', 'diary_writer'];
    basicBadges.forEach(badgeId => {
      const badge = BADGES.find(b => b.id === badgeId);
      if (badge && this.unlockBadge(badgeId)) {
        unlockedBadges.push(badge);
      }
    });

    return unlockedBadges;
  }

  // バッジの総経験値を計算
  public getTotalBadgeXP(): number {
    const userBadges = this.getUserBadges();
    return userBadges.reduce((total, badge) => total + badge.xpReward, 0);
  }


  // 不具合報告のバッジをチェック
  public checkBugReportBadges(reportType: 'bug' | 'feature' | 'improvement'): Badge[] {
    const unlockedBadges: Badge[] = [];
    
    // 初回報告バッジ
    const firstReportBadge = this.checkFirstReportBadge(reportType);
    if (firstReportBadge) {
      unlockedBadges.push(firstReportBadge);
    }

    // 累計報告バッジ
    const cumulativeBadges = this.checkCumulativeReportBadges();
    unlockedBadges.push(...cumulativeBadges);

    return unlockedBadges;
  }

  // 初回報告バッジをチェック
  private checkFirstReportBadge(reportType: 'bug' | 'feature' | 'improvement'): Badge | null {
    const reportCounts = this.getReportCounts();
    
    if (reportType === 'bug' && reportCounts.bug === 1) {
      const badge = BADGES.find(b => b.id === 'bug_reporter');
      if (badge && this.unlockBadge(badge.id)) {
        return badge;
      }
    }
    
    if (reportType === 'feature' && reportCounts.feature === 1) {
      const badge = BADGES.find(b => b.id === 'feature_advocate');
      if (badge && this.unlockBadge(badge.id)) {
        return badge;
      }
    }
    
    if (reportType === 'improvement' && reportCounts.improvement === 1) {
      const badge = BADGES.find(b => b.id === 'improvement_suggester');
      if (badge && this.unlockBadge(badge.id)) {
        return badge;
      }
    }

    return null;
  }

  // 累計報告バッジをチェック
  private checkCumulativeReportBadges(): Badge[] {
    const unlockedBadges: Badge[] = [];
    const reportCounts = this.getReportCounts();
    const totalReports = reportCounts.bug + reportCounts.feature + reportCounts.improvement;

    // バグハンター（5個の不具合報告）
    if (reportCounts.bug >= 5) {
      const badge = BADGES.find(b => b.id === 'bug_hunter');
      if (badge && !this.isBadgeUnlocked(badge.id) && this.unlockBadge(badge.id)) {
        unlockedBadges.push(badge);
      }
    }

    // コミュニティヘルパー（10個の報告・提案）
    if (totalReports >= 10) {
      const badge = BADGES.find(b => b.id === 'community_helper');
      if (badge && !this.isBadgeUnlocked(badge.id) && this.unlockBadge(badge.id)) {
        unlockedBadges.push(badge);
      }
    }

    // 品質ガーディアン（25個の報告・提案）
    if (totalReports >= 25) {
      const badge = BADGES.find(b => b.id === 'quality_guardian');
      if (badge && !this.isBadgeUnlocked(badge.id) && this.unlockBadge(badge.id)) {
        unlockedBadges.push(badge);
      }
    }

    return unlockedBadges;
  }

  // 報告数を取得
  private getReportCounts(): { bug: number; feature: number; improvement: number } {
    const reportHistory = JSON.parse(localStorage.getItem('reportHistory') || '[]');
    
    return reportHistory.reduce((counts: any, report: any) => {
      if (report.type === 'bug') counts.bug++;
      else if (report.type === 'feature') counts.feature++;
      else if (report.type === 'improvement') counts.improvement++;
      return counts;
    }, { bug: 0, feature: 0, improvement: 0 });
  }

  // 報告履歴を記録
  public recordReport(reportType: 'bug' | 'feature' | 'improvement', reportId: string): void {
    const reportHistory = JSON.parse(localStorage.getItem('reportHistory') || '[]');
    reportHistory.push({
      type: reportType,
      id: reportId,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('reportHistory', JSON.stringify(reportHistory));
  }

  // メモ投稿のバッジをチェック
  public checkMemoBadges(isPublic: boolean = false): Badge[] {
    const unlockedBadges: Badge[] = [];
    
    // 初回メモ投稿バッジ
    const firstMemoBadge = this.checkFirstMemoBadge();
    if (firstMemoBadge) {
      unlockedBadges.push(firstMemoBadge);
    }

    // 累計メモ投稿バッジ
    const cumulativeBadges = this.checkCumulativeMemoBadges();
    unlockedBadges.push(...cumulativeBadges);

    // 連続投稿バッジ
    const streakBadge = this.checkMemoStreakBadge();
    if (streakBadge) {
      unlockedBadges.push(streakBadge);
    }

    // 公開メモバッジ
    if (isPublic) {
      const publicMemoBadge = this.checkPublicMemoBadge();
      if (publicMemoBadge) {
        unlockedBadges.push(publicMemoBadge);
      }
    }

    return unlockedBadges;
  }

  // 初回メモ投稿バッジをチェック
  private checkFirstMemoBadge(): Badge | null {
    const memoCount = this.getMemoCount();
    
    if (memoCount === 1) {
      const badge = BADGES.find(b => b.id === 'first_memo');
      if (badge && this.unlockBadge(badge.id)) {
        return badge;
      }
    }

    return null;
  }

  // 累計メモ投稿バッジをチェック
  private checkCumulativeMemoBadges(): Badge[] {
    const unlockedBadges: Badge[] = [];
    const memoCount = this.getMemoCount();

    // メモライター（10個のメモ投稿）
    if (memoCount >= 10) {
      const badge = BADGES.find(b => b.id === 'memo_writer');
      if (badge && !this.isBadgeUnlocked(badge.id) && this.unlockBadge(badge.id)) {
        unlockedBadges.push(badge);
      }
    }

    // メモマスター（50個のメモ投稿）
    if (memoCount >= 50) {
      const badge = BADGES.find(b => b.id === 'memo_master');
      if (badge && !this.isBadgeUnlocked(badge.id) && this.unlockBadge(badge.id)) {
        unlockedBadges.push(badge);
      }
    }

    // メモレジェンド（100個のメモ投稿）
    if (memoCount >= 100) {
      const badge = BADGES.find(b => b.id === 'memo_legend');
      if (badge && !this.isBadgeUnlocked(badge.id) && this.unlockBadge(badge.id)) {
        unlockedBadges.push(badge);
      }
    }

    return unlockedBadges;
  }

  // 連続投稿バッジをチェック
  private checkMemoStreakBadge(): Badge | null {
    const streak = this.getMemoStreak();
    
    if (streak >= 7) {
      const badge = BADGES.find(b => b.id === 'daily_writer');
      if (badge && !this.isBadgeUnlocked(badge.id) && this.unlockBadge(badge.id)) {
        return badge;
      }
    }

    return null;
  }

  // 公開メモバッジをチェック
  private checkPublicMemoBadge(): Badge | null {
    const publicMemoCount = this.getPublicMemoCount();
    
    if (publicMemoCount >= 10) {
      const badge = BADGES.find(b => b.id === 'thought_leader');
      if (badge && !this.isBadgeUnlocked(badge.id) && this.unlockBadge(badge.id)) {
        return badge;
      }
    }

    return null;
  }

  // メモ数を取得
  private getMemoCount(): number {
    const memoHistory = JSON.parse(localStorage.getItem('memoHistory') || '[]');
    return memoHistory.length;
  }

  // 公開メモ数を取得
  private getPublicMemoCount(): number {
    const memoHistory = JSON.parse(localStorage.getItem('memoHistory') || '[]');
    return memoHistory.filter((memo: any) => memo.isPublic).length;
  }

  // 連続投稿日数を取得
  private getMemoStreak(): number {
    const memoHistory = JSON.parse(localStorage.getItem('memoHistory') || '[]');
    if (memoHistory.length === 0) return 0;

    // 日付でソート
    const sortedMemos = memoHistory.sort((a: any, b: any) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const memo of sortedMemos) {
      const memoDate = new Date(memo.timestamp);
      memoDate.setHours(0, 0, 0, 0);
      
      const diffTime = currentDate.getTime() - memoDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === streak) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }

  // メモ履歴を記録
  public recordMemo(memoId: string, isPublic: boolean = false): void {
    const memoHistory = JSON.parse(localStorage.getItem('memoHistory') || '[]');
    memoHistory.push({
      id: memoId,
      isPublic,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('memoHistory', JSON.stringify(memoHistory));
  }
}

export const badgeManager = new BadgeManager();
