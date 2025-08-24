/**
 * 📱 タッチジェスチャーハンドラー
 * スワイプナビゲーション・タッチフィードバック・ADHD/ASD特化タッチ操作最適化
 */

import { EventEmitter } from 'eventemitter3';

// タッチジェスチャーの種類
export type GestureType =
  | 'tap'
  | 'double-tap'
  | 'long-press'
  | 'swipe-left'
  | 'swipe-right'
  | 'swipe-up'
  | 'swipe-down'
  | 'pinch-in'
  | 'pinch-out'
  | 'pan'
  | 'rotate';

// タッチイベントデータ
export interface TouchEventData {
  type: GestureType;
  element: HTMLElement;
  startPosition: { x: number; y: number };
  endPosition: { x: number; y: number };
  deltaX: number;
  deltaY: number;
  distance: number;
  duration: number;
  velocity: number;
  force?: number; // 圧力感知
  timestamp: number;
  touches: number; // 同時タッチ数
}

// ADHD特化設定
export interface ADHDTouchSettings {
  enabled: boolean;
  sensitivity: 'low' | 'medium' | 'high';

  // タッチターゲット
  targetSize: {
    minimum: number; // 最小44px (アクセシビリティ標準)
    preferred: number; // 推奨48px
    spacing: number; // ターゲット間隔
  };

  // フィードバック
  feedback: {
    haptic: boolean; // 振動フィードバック
    visual: boolean; // 視覚フィードバック
    audio: boolean; // 音声フィードバック
    delay: number; // フィードバック遅延 (ms)
  };

  // 操作支援
  assistance: {
    doubleConfirm: boolean; // 重要操作の二重確認
    undoTimeout: number; // 操作取り消し可能時間 (ms)
    gestureGuide: boolean; // ジェスチャーガイド表示
    errorPrevention: boolean; // 誤操作防止
  };

  // 認知負荷考慮
  cognitiveAdaptation: {
    simplifyOnOverload: boolean; // 負荷高時の簡略化
    pauseOnFatigue: boolean; // 疲労時の一時停止
    contextualHelp: boolean; // 文脈ヘルプ
  };
}

// ナビゲーション設定
export interface SwipeNavigation {
  enabled: boolean;
  routes: {
    left: string | (() => void);
    right: string | (() => void);
    up: string | (() => void);
    down: string | (() => void);
  };
  threshold: number; // スワイプ判定距離
  velocity: number; // 速度閾値
}

class TouchGestureHandler extends EventEmitter {
  private static instance: TouchGestureHandler | null = null;
  private isActive: boolean = false;
  private element: HTMLElement | null = null;
  private adhdSettings!: ADHDTouchSettings;
  private swipeNavigation!: SwipeNavigation;

  // タッチ状態
  private touches: Map<number, TouchEventData> = new Map();
  private lastTap: number = 0;
  private longPressTimeout: NodeJS.Timeout | null = null;
  private undoStack: Array<{ action: string; data: any; timestamp: number }> = [];

  private constructor() {
    super();
    this.initializeADHDSettings();
    this.initializeSwipeNavigation();
    console.log('📱 Touch Gesture Handler initialized');
  }

  static getInstance(): TouchGestureHandler {
    if (!TouchGestureHandler.instance) {
      TouchGestureHandler.instance = new TouchGestureHandler();
    }
    return TouchGestureHandler.instance;
  }

  /**
   * ADHD特化設定の初期化
   */
  private initializeADHDSettings(): void {
    this.adhdSettings = {
      enabled: true,
      sensitivity: 'medium',

      targetSize: {
        minimum: 44,
        preferred: 48,
        spacing: 8,
      },

      feedback: {
        haptic: true,
        visual: true,
        audio: false,
        delay: 0,
      },

      assistance: {
        doubleConfirm: true,
        undoTimeout: 5000,
        gestureGuide: true,
        errorPrevention: true,
      },

      cognitiveAdaptation: {
        simplifyOnOverload: true,
        pauseOnFatigue: true,
        contextualHelp: true,
      },
    };
  }

  /**
   * スワイプナビゲーションの初期化
   */
  private initializeSwipeNavigation(): void {
    this.swipeNavigation = {
      enabled: true,
      routes: {
        left: '/cognitive-analytics',
        right: '/adhd-task-manager',
        up: '/dashboard',
        down: '/settings',
      },
      threshold: 50,
      velocity: 0.3,
    };
  }

  /**
   * ジェスチャー認識の開始
   */
  public initialize(element: HTMLElement = document.body): void {
    if (this.isActive) return;

    this.element = element;
    this.isActive = true;

    // タッチイベントリスナーの設定
    this.setupTouchListeners();

    // ADHD特化UI調整
    this.applyADHDOptimizations();

    console.log('📱 Touch gesture recognition started');
    this.emit('gestureHandlerInitialized');
  }

  /**
   * ジェスチャー認識の停止
   */
  public destroy(): void {
    if (!this.isActive) return;

    this.removeTouchListeners();
    this.isActive = false;
    this.element = null;

    // タイマーのクリア
    if (this.longPressTimeout) {
      clearTimeout(this.longPressTimeout);
      this.longPressTimeout = null;
    }

    console.log('📱 Touch gesture recognition stopped');
    this.emit('gestureHandlerDestroyed');
  }

  /**
   * タッチイベントリスナーの設定
   */
  private setupTouchListeners(): void {
    if (!this.element) return;

    this.element.addEventListener('touchstart', this.handleTouchStart.bind(this), {
      passive: false,
    });
    this.element.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    this.element.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
    this.element.addEventListener('touchcancel', this.handleTouchCancel.bind(this), {
      passive: false,
    });

    // デスクトップでのマウスイベント（開発用）
    this.element.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.element.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.element.addEventListener('mouseup', this.handleMouseUp.bind(this));
  }

  /**
   * タッチイベントリスナーの削除
   */
  private removeTouchListeners(): void {
    if (!this.element) return;

    this.element.removeEventListener('touchstart', this.handleTouchStart.bind(this));
    this.element.removeEventListener('touchmove', this.handleTouchMove.bind(this));
    this.element.removeEventListener('touchend', this.handleTouchEnd.bind(this));
    this.element.removeEventListener('touchcancel', this.handleTouchCancel.bind(this));

    this.element.removeEventListener('mousedown', this.handleMouseDown.bind(this));
    this.element.removeEventListener('mousemove', this.handleMouseMove.bind(this));
    this.element.removeEventListener('mouseup', this.handleMouseUp.bind(this));
  }

  /**
   * タッチ開始
   */
  private handleTouchStart(event: TouchEvent): void {
    const now = Date.now();

    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];
      const touchData: TouchEventData = {
        type: 'tap',
        element: event.target as HTMLElement,
        startPosition: { x: touch.clientX, y: touch.clientY },
        endPosition: { x: touch.clientX, y: touch.clientY },
        deltaX: 0,
        deltaY: 0,
        distance: 0,
        duration: 0,
        velocity: 0,
        force: (touch as any).force,
        timestamp: now,
        touches: event.touches.length,
      };

      this.touches.set(touch.identifier, touchData);
    }

    // ロングプレス検出
    this.longPressTimeout = setTimeout(() => {
      this.detectLongPress();
    }, 500);

    // ダブルタップ検出
    if (now - this.lastTap < 300) {
      this.detectDoubleTap(event);
    }
    this.lastTap = now;

    // ADHD支援: タッチフィードバック
    this.provideTouchFeedback('start');
  }

  /**
   * タッチ移動
   */
  private handleTouchMove(event: TouchEvent): void {
    event.preventDefault(); // スクロール防止

    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];
      const touchData = this.touches.get(touch.identifier);

      if (touchData) {
        touchData.endPosition = { x: touch.clientX, y: touch.clientY };
        touchData.deltaX = touch.clientX - touchData.startPosition.x;
        touchData.deltaY = touch.clientY - touchData.startPosition.y;
        touchData.distance = Math.sqrt(
          touchData.deltaX * touchData.deltaX + touchData.deltaY * touchData.deltaY
        );

        // スワイプ検出
        if (touchData.distance > this.swipeNavigation.threshold) {
          this.detectSwipe(touchData);
        }
      }
    }

    // ロングプレスキャンセル（移動した場合）
    if (this.longPressTimeout) {
      clearTimeout(this.longPressTimeout);
      this.longPressTimeout = null;
    }
  }

  /**
   * タッチ終了
   */
  private handleTouchEnd(event: TouchEvent): void {
    const now = Date.now();

    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];
      const touchData = this.touches.get(touch.identifier);

      if (touchData) {
        touchData.duration = now - touchData.timestamp;
        touchData.velocity = touchData.distance / touchData.duration;

        // ジェスチャー判定
        this.classifyGesture(touchData);

        this.touches.delete(touch.identifier);
      }
    }

    // ロングプレスタイマーのクリア
    if (this.longPressTimeout) {
      clearTimeout(this.longPressTimeout);
      this.longPressTimeout = null;
    }

    // ADHD支援: タッチフィードバック
    this.provideTouchFeedback('end');
  }

  /**
   * タッチキャンセル
   */
  private handleTouchCancel(event: TouchEvent): void {
    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];
      this.touches.delete(touch.identifier);
    }

    if (this.longPressTimeout) {
      clearTimeout(this.longPressTimeout);
      this.longPressTimeout = null;
    }
  }

  /**
   * マウスイベント（開発用）
   */
  private handleMouseDown(event: MouseEvent): void {
    const touchData: TouchEventData = {
      type: 'tap',
      element: event.target as HTMLElement,
      startPosition: { x: event.clientX, y: event.clientY },
      endPosition: { x: event.clientX, y: event.clientY },
      deltaX: 0,
      deltaY: 0,
      distance: 0,
      duration: 0,
      velocity: 0,
      timestamp: Date.now(),
      touches: 1,
    };

    this.touches.set(0, touchData);
  }

  private handleMouseMove(event: MouseEvent): void {
    const touchData = this.touches.get(0);
    if (touchData) {
      touchData.endPosition = { x: event.clientX, y: event.clientY };
      touchData.deltaX = event.clientX - touchData.startPosition.x;
      touchData.deltaY = event.clientY - touchData.startPosition.y;
      touchData.distance = Math.sqrt(
        touchData.deltaX * touchData.deltaX + touchData.deltaY * touchData.deltaY
      );
    }
  }

  private handleMouseUp(event: MouseEvent): void {
    const touchData = this.touches.get(0);
    if (touchData) {
      touchData.duration = Date.now() - touchData.timestamp;
      touchData.velocity = touchData.distance / touchData.duration;

      this.classifyGesture(touchData);
      this.touches.delete(0);
    }
  }

  /**
   * ジェスチャー分類
   */
  private classifyGesture(touchData: TouchEventData): void {
    const { distance, deltaX, deltaY, velocity, duration } = touchData;

    // タップ
    if (distance < 10 && duration < 200) {
      touchData.type = 'tap';
      this.handleTap(touchData);
      return;
    }

    // スワイプ
    if (distance > this.swipeNavigation.threshold && velocity > this.swipeNavigation.velocity) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        touchData.type = deltaX > 0 ? 'swipe-right' : 'swipe-left';
      } else {
        touchData.type = deltaY > 0 ? 'swipe-down' : 'swipe-up';
      }
      this.handleSwipe(touchData);
      return;
    }

    // パン
    if (distance > 10 && velocity < this.swipeNavigation.velocity) {
      touchData.type = 'pan';
      this.handlePan(touchData);
      return;
    }
  }

  /**
   * ロングプレス検出
   */
  private detectLongPress(): void {
    if (this.touches.size > 0) {
      const touchData = Array.from(this.touches.values())[0];
      touchData.type = 'long-press';
      this.handleLongPress(touchData);
    }
  }

  /**
   * ダブルタップ検出
   */
  private detectDoubleTap(event: TouchEvent): void {
    if (this.touches.size > 0) {
      const touchData = Array.from(this.touches.values())[0];
      touchData.type = 'double-tap';
      this.handleDoubleTap(touchData);
    }
  }

  /**
   * スワイプ検出（移動中）
   */
  private detectSwipe(touchData: TouchEventData): void {
    // リアルタイムスワイプフィードバック
    this.provideTouchFeedback('swipe');
  }

  /**
   * ジェスチャーハンドラー
   */
  private handleTap(touchData: TouchEventData): void {
    this.emit('gesture', touchData);

    // ADHD支援: 視覚的フィードバック
    this.showTapFeedback(touchData.endPosition);

    // アンドゥスタックに追加
    this.addToUndoStack('tap', touchData);
  }

  private handleDoubleTap(touchData: TouchEventData): void {
    this.emit('gesture', touchData);

    // ADHD支援: 特別なフィードバック
    this.showDoubleTapFeedback(touchData.endPosition);
  }

  private handleLongPress(touchData: TouchEventData): void {
    this.emit('gesture', touchData);

    // ADHD支援: 長押しメニュー表示
    this.showLongPressMenu(touchData);
  }

  private handleSwipe(touchData: TouchEventData): void {
    this.emit('gesture', touchData);

    // スワイプナビゲーション
    if (this.swipeNavigation.enabled) {
      this.executeSwipeNavigation(touchData.type);
    }

    // ADHD支援: スワイプ軌跡表示
    this.showSwipeTrail(touchData);
  }

  private handlePan(touchData: TouchEventData): void {
    this.emit('gesture', touchData);
  }

  /**
   * スワイプナビゲーション実行
   */
  private executeSwipeNavigation(gestureType: GestureType): void {
    let route: string | (() => void) | undefined;

    switch (gestureType) {
      case 'swipe-left':
        route = this.swipeNavigation.routes.left;
        break;
      case 'swipe-right':
        route = this.swipeNavigation.routes.right;
        break;
      case 'swipe-up':
        route = this.swipeNavigation.routes.up;
        break;
      case 'swipe-down':
        route = this.swipeNavigation.routes.down;
        break;
    }

    if (route) {
      if (typeof route === 'string') {
        // ルート遷移
        this.emit('navigate', route);
      } else {
        // 関数実行
        route();
      }
    }
  }

  /**
   * ADHD特化UI最適化
   */
  private applyADHDOptimizations(): void {
    if (!this.adhdSettings.enabled) return;

    // タッチターゲットサイズの調整
    this.adjustTouchTargets();

    // 視覚的ガイドの追加
    if (this.adhdSettings.assistance.gestureGuide) {
      this.showGestureGuides();
    }
  }

  /**
   * タッチターゲットサイズ調整
   */
  private adjustTouchTargets(): void {
    const interactiveElements = document.querySelectorAll(
      'button, input, select, a, [role="button"]'
    );

    interactiveElements.forEach((element) => {
      const htmlElement = element as HTMLElement;
      const rect = htmlElement.getBoundingClientRect();

      // 最小サイズチェック
      if (
        rect.width < this.adhdSettings.targetSize.minimum ||
        rect.height < this.adhdSettings.targetSize.minimum
      ) {
        htmlElement.style.minWidth = `${this.adhdSettings.targetSize.preferred}px`;
        htmlElement.style.minHeight = `${this.adhdSettings.targetSize.preferred}px`;
        htmlElement.style.padding = `${this.adhdSettings.targetSize.spacing}px`;
      }
    });
  }

  /**
   * タッチフィードバック提供
   */
  private provideTouchFeedback(type: 'start' | 'end' | 'swipe'): void {
    if (!this.adhdSettings.feedback.haptic) return;

    // 振動フィードバック
    if (navigator.vibrate) {
      switch (type) {
        case 'start':
          navigator.vibrate(10);
          break;
        case 'end':
          navigator.vibrate(5);
          break;
        case 'swipe':
          navigator.vibrate([5, 10, 5]);
          break;
      }
    }
  }

  /**
   * 視覚的フィードバック
   */
  private showTapFeedback(position: { x: number; y: number }): void {
    if (!this.adhdSettings.feedback.visual) return;

    const feedback = document.createElement('div');
    feedback.className = 'touch-feedback tap';
    feedback.style.cssText = `
      position: fixed;
      left: ${position.x - 15}px;
      top: ${position.y - 15}px;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: rgba(59, 130, 246, 0.3);
      border: 2px solid #3B82F6;
      pointer-events: none;
      z-index: 9999;
      animation: tapFeedback 0.3s ease-out forwards;
    `;

    document.body.appendChild(feedback);

    setTimeout(() => {
      feedback.remove();
    }, 300);
  }

  private showDoubleTapFeedback(position: { x: number; y: number }): void {
    // ダブルタップ用の特別なフィードバック
    const feedback = document.createElement('div');
    feedback.innerHTML = '✨';
    feedback.style.cssText = `
      position: fixed;
      left: ${position.x - 10}px;
      top: ${position.y - 10}px;
      font-size: 20px;
      pointer-events: none;
      z-index: 9999;
      animation: doubleTapFeedback 0.5s ease-out forwards;
    `;

    document.body.appendChild(feedback);

    setTimeout(() => {
      feedback.remove();
    }, 500);
  }

  private showSwipeTrail(touchData: TouchEventData): void {
    // スワイプ軌跡の表示
    const trail = document.createElement('div');
    trail.style.cssText = `
      position: fixed;
      left: ${touchData.startPosition.x}px;
      top: ${touchData.startPosition.y}px;
      width: ${Math.abs(touchData.deltaX)}px;
      height: ${Math.abs(touchData.deltaY)}px;
      background: linear-gradient(45deg, rgba(59, 130, 246, 0.3), transparent);
      pointer-events: none;
      z-index: 9998;
      animation: swipeTrail 0.5s ease-out forwards;
    `;

    document.body.appendChild(trail);

    setTimeout(() => {
      trail.remove();
    }, 500);
  }

  private showLongPressMenu(touchData: TouchEventData): void {
    // 長押しメニューの表示
    const menu = document.createElement('div');
    menu.className = 'longpress-menu';
    menu.innerHTML = `
      <div class="menu-item" data-action="undo">元に戻す</div>
      <div class="menu-item" data-action="help">ヘルプ</div>
      <div class="menu-item" data-action="settings">設定</div>
    `;

    menu.style.cssText = `
      position: fixed;
      left: ${touchData.endPosition.x}px;
      top: ${touchData.endPosition.y - 100}px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      z-index: 10000;
      animation: longPressMenu 0.2s ease-out forwards;
    `;

    document.body.appendChild(menu);

    // メニューアイテムのクリックハンドラー
    menu.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const action = target.dataset.action;

      if (action) {
        this.emit('menuAction', action);
      }

      menu.remove();
    });

    // 外部クリックで閉じる
    setTimeout(() => {
      const closeMenu = () => {
        menu.remove();
        document.removeEventListener('click', closeMenu);
      };
      document.addEventListener('click', closeMenu);
    }, 100);
  }

  private showGestureGuides(): void {
    // ジェスチャーガイドの表示
    const guide = document.createElement('div');
    guide.className = 'gesture-guide';
    guide.innerHTML = `
      <div class="guide-content">
        <div class="guide-item">← スワイプで前のページ</div>
        <div class="guide-item">→ スワイプで次のページ</div>
        <div class="guide-item">↑ スワイプでダッシュボード</div>
        <div class="guide-item">↓ スワイプで設定</div>
        <div class="guide-item">長押しでメニュー</div>
      </div>
    `;

    guide.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 12px;
      border-radius: 8px;
      font-size: 12px;
      z-index: 9999;
      max-width: 200px;
    `;

    document.body.appendChild(guide);

    // 5秒後に自動で消える
    setTimeout(() => {
      guide.remove();
    }, 5000);
  }

  /**
   * アンドゥ機能
   */
  private addToUndoStack(action: string, data: any): void {
    this.undoStack.push({
      action,
      data,
      timestamp: Date.now(),
    });

    // 最大10件まで保持
    if (this.undoStack.length > 10) {
      this.undoStack.shift();
    }

    // タイムアウト後に自動削除
    setTimeout(() => {
      this.undoStack = this.undoStack.filter(
        (item) => Date.now() - item.timestamp < this.adhdSettings.assistance.undoTimeout
      );
    }, this.adhdSettings.assistance.undoTimeout);
  }

  public undo(): boolean {
    const lastAction = this.undoStack.pop();
    if (lastAction) {
      this.emit('undo', lastAction);
      return true;
    }
    return false;
  }

  /**
   * 設定の更新
   */
  public updateADHDSettings(settings: Partial<ADHDTouchSettings>): void {
    this.adhdSettings = { ...this.adhdSettings, ...settings };
    this.emit('settingsUpdated', this.adhdSettings);
  }

  public updateSwipeNavigation(navigation: Partial<SwipeNavigation>): void {
    this.swipeNavigation = { ...this.swipeNavigation, ...navigation };
    this.emit('navigationUpdated', this.swipeNavigation);
  }

  /**
   * 公開メソッド
   */
  public getSettings(): ADHDTouchSettings {
    return { ...this.adhdSettings };
  }

  public getSwipeNavigation(): SwipeNavigation {
    return { ...this.swipeNavigation };
  }

  public getDashboardData() {
    return {
      isActive: this.isActive,
      activeTouches: this.touches.size,
      undoStackSize: this.undoStack.length,
      settings: this.adhdSettings,
      navigation: this.swipeNavigation,
    };
  }
}

// CSS アニメーション
const style = document.createElement('style');
style.textContent = `
  @keyframes tapFeedback {
    0% { transform: scale(0.8); opacity: 1; }
    100% { transform: scale(2); opacity: 0; }
  }
  
  @keyframes doubleTapFeedback {
    0% { transform: scale(1) rotate(0deg); opacity: 1; }
    50% { transform: scale(1.5) rotate(180deg); opacity: 0.7; }
    100% { transform: scale(2) rotate(360deg); opacity: 0; }
  }
  
  @keyframes swipeTrail {
    0% { opacity: 0.5; }
    100% { opacity: 0; }
  }
  
  @keyframes longPressMenu {
    0% { transform: scale(0.8); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
  }
  
  .longpress-menu .menu-item {
    padding: 12px 16px;
    cursor: pointer;
    border-bottom: 1px solid #eee;
  }
  
  .longpress-menu .menu-item:hover {
    background: #f5f5f5;
  }
  
  .longpress-menu .menu-item:last-child {
    border-bottom: none;
  }
  
  .gesture-guide .guide-item {
    margin: 4px 0;
    font-size: 11px;
    opacity: 0.9;
  }
`;

if (typeof document !== 'undefined') {
  document.head.appendChild(style);
}

export const touchGestureHandler = TouchGestureHandler.getInstance();
export default touchGestureHandler;
