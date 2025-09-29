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
}

export const badgeManager = new BadgeManager();
