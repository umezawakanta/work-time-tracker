/**
 * 📋 承認ワークフローサービス
 * 勤怠データの承認申請・管理者による承認・差し戻し・修正申請機能
 * 階層的承認フローとADHD/ASD特性配慮のコミュニケーション最適化
 */

import { BrowserEventEmitter as EventEmitter } from '@/lib/BrowserEventEmitter';

// 承認対象データ型定義
interface ApprovalRequestData {
  id: string;
  userId: string;
  type: 'timesheet' | 'leave_request' | 'overtime' | 'correction' | 'schedule_change';

  // 申請データ
  targetData: {
    timesheet?: {
      month: string; // YYYY-MM
      totalWorkingHours: number;
      overtimeHours: number;
      leaveHours: number;
      modifications: any[];
    };
    leaveRequest?: {
      startDate: Date;
      endDate: Date;
      leaveType: 'paid' | 'sick' | 'personal' | 'special';
      reason: string;
      emergencyContact?: string;
    };
    correction?: {
      originalEntry: any;
      correctedEntry: any;
      reason: string;
      evidence?: string[];
    };
    scheduleChange?: {
      originalSchedule: any;
      newSchedule: any;
      reason: string;
      effectiveDate: Date;
    };
  };

  // 申請メタデータ
  submittedAt: Date;
  submittedBy: string;
  title: string;
  description: string;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  deadline?: Date;
  attachments: string[];

  // 承認フロー
  approvalFlow: ApprovalStep[];
  currentStepIndex: number;
  status: 'draft' | 'submitted' | 'in_review' | 'approved' | 'rejected' | 'withdrawn';

  // コミュニケーション
  comments: ApprovalComment[];
  notifications: ApprovalNotification[];

  // ADHD/ASD配慮
  cognitiveSupport: {
    structuredFormat: boolean; // 構造化された申請フォーマット
    reminderSettings: {
      enabled: boolean;
      frequency: number; // 日数
      escalationDays: number;
    };
    clarificationSupport: boolean; // 明確化支援
    visualAids: boolean; // 視覚的補助
  };
}

// 承認ステップ
interface ApprovalStep {
  id: string;
  stepNumber: number;
  approverRole: 'supervisor' | 'manager' | 'hr' | 'admin';
  approverIds: string[];
  requiredApprovals: number; // 必要な承認数
  currentApprovals: ApprovalDecision[];
  status: 'pending' | 'approved' | 'rejected' | 'skipped';
  deadline?: Date;
  escalationSettings?: {
    enabled: boolean;
    escalationDays: number;
    escalationTo: string[];
  };
}

// 承認決定
interface ApprovalDecision {
  id: string;
  approverId: string;
  decision: 'approve' | 'reject' | 'request_changes';
  timestamp: Date;
  comments: string;
  conditions?: string[]; // 承認条件
  nextReviewDate?: Date;
}

// 承認コメント
interface ApprovalComment {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  timestamp: Date;
  type: 'general' | 'question' | 'clarification' | 'decision_note';
  isInternal: boolean; // 管理者間のみ表示
  mentionedUsers: string[];
}

// 承認通知
interface ApprovalNotification {
  id: string;
  recipientId: string;
  type: 'submitted' | 'approved' | 'rejected' | 'reminder' | 'escalation' | 'comment';
  message: string;
  timestamp: Date;
  read: boolean;
  actionRequired: boolean;
  actionUrl?: string;
}

// 承認履歴
interface ApprovalHistory {
  userId: string;
  month: string;
  totalRequests: number;
  approved: number;
  rejected: number;
  pending: number;
  averageApprovalTime: number; // 時間（時間）
  complianceScore: number; // 0-100
  commonRejectionReasons: string[];
}

// 承認設定
interface ApprovalSettings {
  id: string;
  organizationId: string;

  // 自動承認設定
  autoApproval: {
    enabled: boolean;
    conditions: {
      maxOvertimeHours: number;
      maxLeaveHours: number;
      trustedEmployees: string[];
      lowRiskPeriods: string[]; // 月など
    };
  };

  // エスカレーション設定
  escalationRules: {
    timesheet: { days: number; escalateTo: string[] };
    leaveRequest: { days: number; escalateTo: string[] };
    overtime: { days: number; escalateTo: string[] };
  };

  // 通知設定
  notificationSettings: {
    reminderFrequency: number; // 日数
    urgentNotificationMethods: string[];
    batchNotificationTime: string; // HH:mm
  };

  // ADHD/ASD配慮
  inclusiveFeatures: {
    structuredTemplates: boolean;
    visualWorkflow: boolean;
    clearDeadlines: boolean;
    progressTracking: boolean;
    supportiveLanguage: boolean;
  };
}

export class ApprovalWorkflowService extends EventEmitter {
  private approvalRequests: Map<string, ApprovalRequestData> = new Map();
  private approvalHistory: Map<string, ApprovalHistory[]> = new Map();
  private organizationSettings: ApprovalSettings;
  private userRoles: Map<string, string[]> = new Map(); // userId -> roles

  constructor() {
    super();
    this.organizationSettings = this.createDefaultSettings();
    this.initializeDemoData();
    this.startWorkflowEngine();
  }

  /**
   * デフォルト設定を作成
   */
  private createDefaultSettings(): ApprovalSettings {
    return {
      id: 'default-approval-settings',
      organizationId: 'demo-org',

      autoApproval: {
        enabled: true,
        conditions: {
          maxOvertimeHours: 10,
          maxLeaveHours: 8,
          trustedEmployees: ['demo-user'],
          lowRiskPeriods: ['2024-01', '2024-02'],
        },
      },

      escalationRules: {
        timesheet: { days: 3, escalateTo: ['manager-1', 'hr-1'] },
        leaveRequest: { days: 2, escalateTo: ['manager-1'] },
        overtime: { days: 1, escalateTo: ['manager-1', 'admin-1'] },
      },

      notificationSettings: {
        reminderFrequency: 2,
        urgentNotificationMethods: ['email', 'browser'],
        batchNotificationTime: '09:00',
      },

      inclusiveFeatures: {
        structuredTemplates: true,
        visualWorkflow: true,
        clearDeadlines: true,
        progressTracking: true,
        supportiveLanguage: true,
      },
    };
  }

  /**
   * デモデータの初期化
   */
  private initializeDemoData(): void {
    // ユーザーロール設定
    this.userRoles.set('demo-user', ['employee']);
    this.userRoles.set('supervisor-1', ['supervisor']);
    this.userRoles.set('manager-1', ['manager']);
    this.userRoles.set('hr-1', ['hr']);
    this.userRoles.set('admin-1', ['admin']);

    // デモ承認リクエスト
    const demoRequests = this.generateDemoRequests();
    demoRequests.forEach((request) => {
      this.approvalRequests.set(request.id, request);
    });

    // デモ承認履歴
    this.generateDemoHistory();
  }

  /**
   * デモ承認リクエストを生成
   */
  private generateDemoRequests(): ApprovalRequestData[] {
    const baseDate = new Date();

    return [
      {
        id: 'approval-001',
        userId: 'demo-user',
        type: 'timesheet',
        targetData: {
          timesheet: {
            month: '2024-11',
            totalWorkingHours: 168,
            overtimeHours: 12,
            leaveHours: 8,
            modifications: [
              { date: '2024-11-15', reason: '打刻忘れ修正', oldTime: null, newTime: '09:00' },
            ],
          },
        },
        submittedAt: new Date(baseDate.getTime() - 2 * 24 * 60 * 60 * 1000),
        submittedBy: 'demo-user',
        title: '2024年11月 勤怠データ承認申請',
        description: '通常の月次勤怠データです。打刻忘れによる1件の修正が含まれています。',
        urgency: 'medium',
        deadline: new Date(baseDate.getTime() + 3 * 24 * 60 * 60 * 1000),
        attachments: [],
        approvalFlow: [
          {
            id: 'step-1',
            stepNumber: 1,
            approverRole: 'supervisor',
            approverIds: ['supervisor-1'],
            requiredApprovals: 1,
            currentApprovals: [],
            status: 'pending',
            deadline: new Date(baseDate.getTime() + 2 * 24 * 60 * 60 * 1000),
          },
          {
            id: 'step-2',
            stepNumber: 2,
            approverRole: 'hr',
            approverIds: ['hr-1'],
            requiredApprovals: 1,
            currentApprovals: [],
            status: 'pending',
          },
        ],
        currentStepIndex: 0,
        status: 'in_review',
        comments: [
          {
            id: 'comment-1',
            authorId: 'demo-user',
            authorName: 'Demo User',
            content: '15日の打刻忘れは電車遅延が原因でした。遅延証明書は別途提出します。',
            timestamp: new Date(baseDate.getTime() - 1 * 24 * 60 * 60 * 1000),
            type: 'clarification',
            isInternal: false,
            mentionedUsers: ['supervisor-1'],
          },
        ],
        notifications: [],
        cognitiveSupport: {
          structuredFormat: true,
          reminderSettings: {
            enabled: true,
            frequency: 2,
            escalationDays: 3,
          },
          clarificationSupport: true,
          visualAids: true,
        },
      },

      {
        id: 'approval-002',
        userId: 'demo-user',
        type: 'leave_request',
        targetData: {
          leaveRequest: {
            startDate: new Date(baseDate.getTime() + 7 * 24 * 60 * 60 * 1000),
            endDate: new Date(baseDate.getTime() + 7 * 24 * 60 * 60 * 1000),
            leaveType: 'paid',
            reason: '私用のため',
            emergencyContact: '090-1234-5678',
          },
        },
        submittedAt: new Date(baseDate.getTime() - 1 * 24 * 60 * 60 * 1000),
        submittedBy: 'demo-user',
        title: '有給休暇申請（11/28）',
        description: '私用による有給休暇の申請です。',
        urgency: 'low',
        deadline: new Date(baseDate.getTime() + 5 * 24 * 60 * 60 * 1000),
        attachments: [],
        approvalFlow: [
          {
            id: 'step-1',
            stepNumber: 1,
            approverRole: 'supervisor',
            approverIds: ['supervisor-1'],
            requiredApprovals: 1,
            currentApprovals: [
              {
                id: 'decision-1',
                approverId: 'supervisor-1',
                decision: 'approve',
                timestamp: new Date(baseDate.getTime() - 4 * 60 * 60 * 1000),
                comments: '承認します。お疲れ様です。',
                conditions: [],
              },
            ],
            status: 'approved',
          },
        ],
        currentStepIndex: 1,
        status: 'approved',
        comments: [],
        notifications: [],
        cognitiveSupport: {
          structuredFormat: true,
          reminderSettings: {
            enabled: true,
            frequency: 1,
            escalationDays: 2,
          },
          clarificationSupport: true,
          visualAids: true,
        },
      },
    ];
  }

  /**
   * デモ承認履歴を生成
   */
  private generateDemoHistory(): void {
    const demoHistory: ApprovalHistory[] = [];

    for (let i = 0; i < 6; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStr = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;

      demoHistory.push({
        userId: 'demo-user',
        month: monthStr,
        totalRequests: 3 + Math.floor(Math.random() * 3),
        approved: 2 + Math.floor(Math.random() * 3),
        rejected: Math.floor(Math.random() * 2),
        pending: Math.floor(Math.random() * 2),
        averageApprovalTime: 24 + Math.random() * 48,
        complianceScore: 85 + Math.floor(Math.random() * 15),
        commonRejectionReasons: ['書類不備', '申請期限超過'],
      });
    }

    this.approvalHistory.set('demo-user', demoHistory);
  }

  /**
   * ワークフローエンジンを開始
   */
  private startWorkflowEngine(): void {
    // 毎時間エスカレーションチェック
    setInterval(
      () => {
        this.checkEscalations();
      },
      60 * 60 * 1000
    );

    // 毎日リマインダーチェック
    setInterval(
      () => {
        this.sendReminders();
      },
      24 * 60 * 60 * 1000
    );
  }

  /**
   * 承認申請を作成
   */
  createApprovalRequest(
    requestData: Omit<ApprovalRequestData, 'id' | 'submittedAt' | 'status' | 'currentStepIndex'>
  ): string {
    const id = `approval-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const request: ApprovalRequestData = {
      ...requestData,
      id,
      submittedAt: new Date(),
      status: 'submitted',
      currentStepIndex: 0,
      comments: [],
      notifications: [],
    };

    // 承認フローの初期化
    if (request.approvalFlow.length > 0) {
      request.approvalFlow[0].status = 'pending';
    }

    this.approvalRequests.set(id, request);
    this.emit('requestCreated', request);

    // 承認者に通知
    this.notifyApprovers(request);

    return id;
  }

  /**
   * 承認決定を処理
   */
  processApprovalDecision(
    requestId: string,
    approverId: string,
    decision: Omit<ApprovalDecision, 'id' | 'timestamp'>
  ): boolean {
    const request = this.approvalRequests.get(requestId);
    if (!request) return false;

    const currentStep = request.approvalFlow[request.currentStepIndex];
    if (!currentStep || !currentStep.approverIds.includes(approverId)) {
      return false;
    }

    // 決定を記録
    const approvalDecision: ApprovalDecision = {
      ...decision,
      id: `decision-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };

    currentStep.currentApprovals.push(approvalDecision);

    // ステップの状態を更新
    if (decision.decision === 'reject') {
      currentStep.status = 'rejected';
      request.status = 'rejected';
    } else if (currentStep.currentApprovals.length >= currentStep.requiredApprovals) {
      currentStep.status = 'approved';

      // 次のステップへ進む
      if (request.currentStepIndex < request.approvalFlow.length - 1) {
        request.currentStepIndex++;
        request.approvalFlow[request.currentStepIndex].status = 'pending';
        this.notifyApprovers(request);
      } else {
        // 全ステップ完了
        request.status = 'approved';
        this.onApprovalCompleted(request);
      }
    }

    this.approvalRequests.set(requestId, request);
    this.emit('decisionProcessed', { request, decision: approvalDecision });

    // 申請者に通知
    this.notifyRequestor(request, decision.decision);

    return true;
  }

  /**
   * コメントを追加
   */
  addComment(
    requestId: string,
    authorId: string,
    content: string,
    type: ApprovalComment['type'] = 'general'
  ): boolean {
    const request = this.approvalRequests.get(requestId);
    if (!request) return false;

    const comment: ApprovalComment = {
      id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      authorId,
      authorName: this.getUserName(authorId),
      content,
      timestamp: new Date(),
      type,
      isInternal: this.isInternalUser(authorId),
      mentionedUsers: this.extractMentions(content),
    };

    request.comments.push(comment);
    this.approvalRequests.set(requestId, request);

    this.emit('commentAdded', { request, comment });

    // メンションされたユーザーに通知
    this.notifyMentionedUsers(comment, request);

    return true;
  }

  /**
   * 申請を撤回
   */
  withdrawRequest(requestId: string, userId: string): boolean {
    const request = this.approvalRequests.get(requestId);
    if (!request || request.userId !== userId) return false;

    if (request.status === 'approved' || request.status === 'rejected') {
      return false; // 既に承認/拒否された申請は撤回できない
    }

    request.status = 'withdrawn';
    this.approvalRequests.set(requestId, request);

    this.emit('requestWithdrawn', request);
    this.notifyWithdrawal(request);

    return true;
  }

  /**
   * ユーザーの承認申請一覧を取得
   */
  getUserRequests(userId: string, status?: ApprovalRequestData['status']): ApprovalRequestData[] {
    const requests = Array.from(this.approvalRequests.values()).filter(
      (request) => request.userId === userId
    );

    if (status) {
      return requests.filter((request) => request.status === status);
    }

    return requests.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
  }

  /**
   * 承認者の承認待ち一覧を取得
   */
  getPendingApprovals(approverId: string): ApprovalRequestData[] {
    return Array.from(this.approvalRequests.values())
      .filter((request) => {
        if (request.status !== 'in_review') return false;

        const currentStep = request.approvalFlow[request.currentStepIndex];
        return (
          currentStep &&
          currentStep.approverIds.includes(approverId) &&
          currentStep.status === 'pending'
        );
      })
      .sort((a, b) => {
        // 緊急度順、その後期限順
        const urgencyOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
        const urgencyDiff = urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
        if (urgencyDiff !== 0) return urgencyDiff;

        if (a.deadline && b.deadline) {
          return a.deadline.getTime() - b.deadline.getTime();
        }
        return b.submittedAt.getTime() - a.submittedAt.getTime();
      });
  }

  /**
   * 承認履歴を取得
   */
  getApprovalHistory(userId: string, months: number = 6): ApprovalHistory[] {
    const history = this.approvalHistory.get(userId) || [];
    return history.slice(0, months);
  }

  /**
   * 承認統計を取得
   */
  getApprovalStatistics(userId?: string): any {
    let requests: ApprovalRequestData[];

    if (userId) {
      requests = this.getUserRequests(userId);
    } else {
      requests = Array.from(this.approvalRequests.values());
    }

    const now = new Date();
    const thisMonth = requests.filter(
      (r) =>
        r.submittedAt.getMonth() === now.getMonth() &&
        r.submittedAt.getFullYear() === now.getFullYear()
    );

    return {
      total: requests.length,
      thisMonth: thisMonth.length,
      approved: requests.filter((r) => r.status === 'approved').length,
      rejected: requests.filter((r) => r.status === 'rejected').length,
      pending: requests.filter((r) => r.status === 'in_review').length,
      averageApprovalTime: this.calculateAverageApprovalTime(requests),
      complianceRate: this.calculateComplianceRate(requests),
    };
  }

  // ヘルパーメソッド（実装は簡略化）
  private notifyApprovers(request: ApprovalRequestData): void {
    const currentStep = request.approvalFlow[request.currentStepIndex];
    if (!currentStep) return;

    currentStep.approverIds.forEach((approverId) => {
      const notification: ApprovalNotification = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        recipientId: approverId,
        type: 'submitted',
        message: `新しい承認申請: ${request.title}`,
        timestamp: new Date(),
        read: false,
        actionRequired: true,
        actionUrl: `/approval/${request.id}`,
      };

      // 実際の実装では通知システムに送信
      this.emit('notificationCreated', notification);
    });
  }

  private notifyRequestor(request: ApprovalRequestData, decision: string): void {
    const notification: ApprovalNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      recipientId: request.userId,
      type: decision === 'approve' ? 'approved' : 'rejected',
      message: `申請「${request.title}」が${decision === 'approve' ? '承認' : '拒否'}されました`,
      timestamp: new Date(),
      read: false,
      actionRequired: false,
      actionUrl: `/approval/${request.id}`,
    };

    this.emit('notificationCreated', notification);
  }

  private notifyWithdrawal(request: ApprovalRequestData): void {
    const currentStep = request.approvalFlow[request.currentStepIndex];
    if (!currentStep) return;

    currentStep.approverIds.forEach((approverId) => {
      const notification: ApprovalNotification = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        recipientId: approverId,
        type: 'submitted',
        message: `申請「${request.title}」が撤回されました`,
        timestamp: new Date(),
        read: false,
        actionRequired: false,
      };

      this.emit('notificationCreated', notification);
    });
  }

  private notifyMentionedUsers(comment: ApprovalComment, request: ApprovalRequestData): void {
    comment.mentionedUsers.forEach((userId) => {
      const notification: ApprovalNotification = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        recipientId: userId,
        type: 'comment',
        message: `「${request.title}」でメンションされました`,
        timestamp: new Date(),
        read: false,
        actionRequired: false,
        actionUrl: `/approval/${request.id}`,
      };

      this.emit('notificationCreated', notification);
    });
  }

  private onApprovalCompleted(request: ApprovalRequestData): void {
    // 承認完了時の処理
    this.emit('approvalCompleted', request);

    // 勤怠データの場合は勤怠システムに反映
    if (request.type === 'timesheet' && request.targetData.timesheet) {
      this.emit('timesheetApproved', {
        userId: request.userId,
        timesheetData: request.targetData.timesheet,
      });
    }
  }

  private checkEscalations(): void {
    // エスカレーションチェックの実装
    const now = new Date();

    this.approvalRequests.forEach((request) => {
      if (request.status !== 'in_review') return;

      const currentStep = request.approvalFlow[request.currentStepIndex];
      if (!currentStep || currentStep.status !== 'pending') return;

      if (currentStep.deadline && now > currentStep.deadline) {
        this.escalateRequest(request);
      }
    });
  }

  private escalateRequest(request: ApprovalRequestData): void {
    const escalationRules = this.organizationSettings.escalationRules[request.type];
    if (!escalationRules) return;

    escalationRules.escalateTo.forEach((escalationApproverId) => {
      const notification: ApprovalNotification = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        recipientId: escalationApproverId,
        type: 'escalation',
        message: `承認期限を過ぎた申請: ${request.title}`,
        timestamp: new Date(),
        read: false,
        actionRequired: true,
        actionUrl: `/approval/${request.id}`,
      };

      this.emit('notificationCreated', notification);
    });
  }

  private sendReminders(): void {
    // リマインダー送信の実装
    const reminderFrequency = this.organizationSettings.notificationSettings.reminderFrequency;
    const now = new Date();

    this.approvalRequests.forEach((request) => {
      if (request.status !== 'in_review') return;

      const daysSinceSubmission = Math.floor(
        (now.getTime() - request.submittedAt.getTime()) / (24 * 60 * 60 * 1000)
      );

      if (daysSinceSubmission % reminderFrequency === 0) {
        this.sendReminderNotification(request);
      }
    });
  }

  private sendReminderNotification(request: ApprovalRequestData): void {
    const currentStep = request.approvalFlow[request.currentStepIndex];
    if (!currentStep) return;

    currentStep.approverIds.forEach((approverId) => {
      const notification: ApprovalNotification = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        recipientId: approverId,
        type: 'reminder',
        message: `承認待ちのリマインダー: ${request.title}`,
        timestamp: new Date(),
        read: false,
        actionRequired: true,
        actionUrl: `/approval/${request.id}`,
      };

      this.emit('notificationCreated', notification);
    });
  }

  private getUserName(userId: string): string {
    // 実際の実装ではユーザー管理システムから取得
    const userNames: Record<string, string> = {
      'demo-user': 'Demo User',
      'supervisor-1': 'Supervisor',
      'manager-1': 'Manager',
      'hr-1': 'HR',
      'admin-1': 'Admin',
    };
    return userNames[userId] || 'Unknown User';
  }

  private isInternalUser(userId: string): boolean {
    const roles = this.userRoles.get(userId) || [];
    return roles.some((role) => ['supervisor', 'manager', 'hr', 'admin'].includes(role));
  }

  private extractMentions(content: string): string[] {
    // @ユーザー名の抽出
    const mentions = content.match(/@([a-zA-Z0-9-_]+)/g) || [];
    return mentions.map((mention) => mention.substring(1));
  }

  private calculateAverageApprovalTime(requests: ApprovalRequestData[]): number {
    const approvedRequests = requests.filter((r) => r.status === 'approved');
    if (approvedRequests.length === 0) return 0;

    const totalTime = approvedRequests.reduce((sum, request) => {
      const approvalTime = request.approvalFlow
        .filter((step) => step.status === 'approved')
        .reduce((stepSum, step) => {
          const latestApproval = step.currentApprovals[step.currentApprovals.length - 1];
          if (latestApproval) {
            return stepSum + (latestApproval.timestamp.getTime() - request.submittedAt.getTime());
          }
          return stepSum;
        }, 0);

      return sum + approvalTime;
    }, 0);

    return Math.round(totalTime / (approvedRequests.length * 60 * 60 * 1000)); // 時間単位
  }

  private calculateComplianceRate(requests: ApprovalRequestData[]): number {
    if (requests.length === 0) return 100;

    const compliantRequests = requests.filter((request) => {
      // 期限内に提出されているかなどの条件をチェック
      return request.deadline ? request.submittedAt < request.deadline : true;
    });

    return Math.round((compliantRequests.length / requests.length) * 100);
  }
}

export default ApprovalWorkflowService;
