// 統合ダッシュボードコンポーネント

import React, { useState, useEffect } from "react";
import { AssetLiabilityManager } from "../utils/assetLiabilityManager";
import { ActionHistoryManager } from "../utils/actionHistoryManager";
import { FuturePlanningManager } from "../utils/futurePlanningManager";
import { WasteAnalysisManager } from "../utils/wasteAnalysisManager";
import { FinancialOverviewManager } from "../utils/financialOverviewManager";
import { WalletBalanceManager } from "../utils/walletBalanceManager";
import { BankAccountManager } from "../utils/bankAccountManager";
import WalletBalanceCalendar from "./WalletBalanceCalendar";
import {
  AssetLiabilitySummary,
  AssetLiabilityAnalysis,
  ASSET_CATEGORIES,
  LIABILITY_CATEGORIES,
} from "../types/assetLiability";
import {
  ActionAnalysis,
  ActionTrend,
  ACTION_CATEGORIES,
  PRODUCTIVITY_CRITERIA,
} from "../types/actionHistory";
import {
  PlanAnalysis,
  PlanRecommendation,
  PLAN_CATEGORIES,
  PLAN_STATUSES,
} from "../types/futurePlanning";
import { Plan, Schedule, BudgetPlan } from "../types";

// FuturePlanningManagerで使用されるPlanの型定義
interface FuturePlan {
  _id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  priority: "low" | "medium" | "high";
  status: "not-started" | "in-progress" | "completed" | "paused";
  startDate: string;
  targetDate: string;
  completedDate?: string;
  progress: number;
  milestones: any[];
  createdAt: string;
  updatedAt: string;
}
import {
  WasteAnalysis,
  WasteRecord,
  WasteGoal,
  WasteAlert,
  WASTE_CATEGORIES,
} from "../types/wasteAnalysis";
import {
  WalletBalance,
  WalletTransaction,
  WalletBalanceSummary,
  WalletBalanceAnalysis,
  WALLET_CATEGORIES,
} from "../types/walletBalance";
import { FinancialSummary } from "../types/financialOverview";
import "./ComprehensiveDashboard.css";

interface ComprehensiveDashboardProps {
  userId: string;
  onClose: () => void;
}

const ComprehensiveDashboard: React.FC<ComprehensiveDashboardProps> = ({
  userId,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "today"
    | "thisweek"
    | "thismonth"
    | "urgent"
    | "goals"
    | "assets"
    | "actions"
    | "plans"
    | "financial"
  >("overview");
  const [selectedPeriod, setSelectedPeriod] = useState<
    "week" | "month" | "year"
  >("month");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // データ状態
  const [assetLiabilitySummary, setAssetLiabilitySummary] =
    useState<AssetLiabilitySummary | null>(null);
  const [assetLiabilityAnalysis, setAssetLiabilityAnalysis] =
    useState<AssetLiabilityAnalysis | null>(null);
  const [actionAnalysis, setActionAnalysis] = useState<ActionAnalysis | null>(
    null
  );
  const [actionTrends, setActionTrends] = useState<ActionTrend[]>([]);
  const [planAnalysis, setPlanAnalysis] = useState<PlanAnalysis | null>(null);
  const [planRecommendations, setPlanRecommendations] = useState<
    PlanRecommendation[]
  >([]);
  const [plans, setPlans] = useState<FuturePlan[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [budgetPlans, setBudgetPlans] = useState<BudgetPlan[]>([]);
  const [wasteAnalysis, setWasteAnalysis] = useState<WasteAnalysis | null>(
    null
  );
  const [wasteRecords, setWasteRecords] = useState<WasteRecord[]>([]);
  const [wasteGoals, setWasteGoals] = useState<WasteGoal[]>([]);
  const [wasteAlerts, setWasteAlerts] = useState<WasteAlert[]>([]);
  const [showAddWasteRecord, setShowAddWasteRecord] = useState(false);
  const [showAddWasteGoal, setShowAddWasteGoal] = useState(false);
  const [showAddReceipt, setShowAddReceipt] = useState(false);
  const [walletBalance, setWalletBalance] = useState<WalletBalance | null>(
    null
  );
  const [walletTransactions, setWalletTransactions] = useState<
    WalletTransaction[]
  >([]);
  const [walletBalanceSummary, setWalletBalanceSummary] =
    useState<WalletBalanceSummary | null>(null);
  const [walletBalanceAnalysis, setWalletBalanceAnalysis] =
    useState<WalletBalanceAnalysis | null>(null);
  const [showAddWalletTransaction, setShowAddWalletTransaction] =
    useState(false);
  const [showUpdateWalletBalance, setShowUpdateWalletBalance] = useState(false);
  const [showWalletCalendar, setShowWalletCalendar] = useState(false);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [showAddBankAccount, setShowAddBankAccount] = useState(false);
  const [showBankAccountUpdate, setShowBankAccountUpdate] = useState(false);
  const [editingBankAccount, setEditingBankAccount] = useState<any>(null);
  const [financialSummary, setFinancialSummary] =
    useState<FinancialSummary | null>(null);
  const [currentDateTime, setCurrentDateTime] = useState<Date>(new Date());
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<FuturePlan | null>(null);
  const [newPlan, setNewPlan] = useState<Partial<FuturePlan>>({
    title: "",
    description: "",
    category: "仕事",
    priority: "medium",
    status: "not-started",
    startDate: new Date().toISOString().split("T")[0] as string,
    targetDate: new Date().toISOString().split("T")[0] as string,
    progress: 0,
    milestones: [],
  });

  // マネージャーインスタンス
  const assetLiabilityManager = AssetLiabilityManager.getInstance();
  const actionHistoryManager = ActionHistoryManager.getInstance();
  const futurePlanningManager = FuturePlanningManager.getInstance();
  const wasteAnalysisManager = WasteAnalysisManager.getInstance();
  const financialOverviewManager = FinancialOverviewManager.getInstance();
  const walletBalanceManager = WalletBalanceManager.getInstance();
  const bankAccountManager = BankAccountManager.getInstance();

  useEffect(() => {
    loadAllData();
  }, [userId, selectedPeriod]);

  // リアルタイムで日時を更新
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000); // 1秒ごとに更新

    return () => clearInterval(timer);
  }, []);

  // 今日のタスクと緊急事項を計算
  const getTodayTasks = () => {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    // 今日のスケジュール
    const todaySchedules = schedules.filter(
      (schedule) =>
        schedule.date === todayStr && schedule.status === "scheduled"
    );

    // 今日締切の計画
    const todayDeadlines = plans.filter(
      (plan) => plan.targetDate === todayStr && plan.status !== "completed"
    );

    // 今週締切の計画（緊急度高い）
    const weekDeadlines = plans.filter((plan) => {
      const targetDate = new Date(plan.targetDate);
      const daysUntilDeadline = Math.ceil(
        (targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysUntilDeadline <= 7 && plan.status !== "completed";
    });

    return {
      schedules: todaySchedules,
      deadlines: todayDeadlines,
      weekDeadlines: weekDeadlines,
    };
  };

  // 緊急の支出・収入を取得
  const getUrgentFinancialItems = () => {
    const urgentItems = [];

    // 負債の警告
    if (
      assetLiabilitySummary &&
      assetLiabilitySummary.totalLiabilities >
        assetLiabilitySummary.totalAssets * 0.5
    ) {
      urgentItems.push({
        type: "warning",
        title: "負債比率が高い",
        message: `負債が資産の50%を超えています（${Math.round(
          (assetLiabilitySummary.totalLiabilities /
            assetLiabilitySummary.totalAssets) *
            100
        )}%）`,
        priority: "high",
      });
    }

    // 予算オーバー
    if (financialSummary) {
      const overBudget =
        financialSummary.totalExpense - financialSummary.budget;
      if (overBudget > 0) {
        urgentItems.push({
          type: "warning",
          title: "予算オーバー",
          message: `予算を${overBudget.toLocaleString()}円超過しています`,
          priority: "high",
        });
      }
    }

    return urgentItems;
  };

  // 今すぐやるべきアクションを取得
  const getImmediateActions = () => {
    const actions: any[] = [];
    const todayTasks = getTodayTasks();
    const urgentFinancial = getUrgentFinancialItems();

    // 今日のスケジュール
    todayTasks.schedules.forEach((schedule) => {
      actions.push({
        type: "schedule",
        title: schedule.title,
        time: schedule.startTime,
        priority: schedule.priority,
        action: "開始する",
      });
    });

    // 今日締切の計画
    todayTasks.deadlines.forEach((plan) => {
      actions.push({
        type: "deadline",
        title: plan.title,
        time: "今日締切",
        priority: "high",
        action: "完了する",
      });
    });

    // 緊急の金銭的問題
    urgentFinancial.forEach((item) => {
      actions.push({
        type: "financial",
        title: item.title,
        time: "緊急",
        priority: item.priority,
        action: "対応する",
      });
    });

    return actions.sort((a, b) => {
      const priorityOrder: { [key: string]: number } = {
        high: 3,
        medium: 2,
        low: 1,
      };
      return (
        (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0)
      );
    });
  };

  // 計画の作成・編集・削除関数
  const handleCreatePlan = () => {
    if (!newPlan.title) {
      return;
    }

    const planData = {
      userId: userId,
      id: Date.now().toString(), // Generate a temporary ID
      title: newPlan.title,
      description: newPlan.description || "",
      category: (newPlan.category || "仕事") as
        | "work"
        | "personal"
        | "health"
        | "learning"
        | "finance"
        | "other",
      priority: newPlan.priority || "medium",
      status: (newPlan.status || "not-started").replace("-", "_") as
        | "completed"
        | "cancelled"
        | "not_started"
        | "in_progress"
        | "on_hold",
      startDate: (newPlan.startDate ||
        new Date().toISOString().split("T")[0]) as string,
      targetDate: (newPlan.targetDate ||
        new Date().toISOString().split("T")[0]) as string,
      progress: newPlan.progress || 0,
      milestones: newPlan.milestones || [],
      tags: [], // Add empty tags array
    };

    futurePlanningManager.addPlan(planData);
    setPlans(
      futurePlanningManager.getPlans(userId).map((plan) => ({
        ...plan,
        priority:
          plan.priority === "urgent"
            ? "high"
            : (plan.priority as "high" | "medium" | "low"),
        status:
          plan.status === "cancelled"
            ? "paused"
            : plan.status === "not_started"
            ? "not-started"
            : plan.status === "in_progress"
            ? "in-progress"
            : plan.status === "on_hold"
            ? "paused"
            : plan.status,
      }))
    );
    setShowPlanForm(false);
    setNewPlan({
      title: "",
      description: "",
      category: "仕事",
      priority: "medium",
      status: "not-started",
      startDate: new Date().toISOString().split("T")[0] as string,
      targetDate: new Date().toISOString().split("T")[0] as string,
      progress: 0,
      milestones: [],
    });
  };

  const handleEditPlan = (plan: FuturePlan) => {
    setEditingPlan(plan);
    setNewPlan(plan);
    setShowPlanForm(true);
  };

  const handleUpdatePlan = () => {
    if (!editingPlan || !newPlan.title) {
      return;
    }

    const updatedPlan = {
      ...newPlan,
      category: newPlan.category as
        | "work"
        | "personal"
        | "health"
        | "learning"
        | "finance"
        | "other",
      status: newPlan.status?.replace("-", "_") as
        | "completed"
        | "cancelled"
        | "not_started"
        | "in_progress"
        | "on_hold",
      updatedAt: new Date().toISOString(),
    };

    futurePlanningManager.updatePlan(editingPlan._id, updatedPlan);
    setPlans(
      futurePlanningManager.getPlans(userId).map((plan) => ({
        ...plan,
        priority:
          plan.priority === "urgent"
            ? "high"
            : (plan.priority as "high" | "medium" | "low"),
        status:
          plan.status === "cancelled"
            ? "paused"
            : plan.status === "not_started"
            ? "not-started"
            : plan.status === "in_progress"
            ? "in-progress"
            : plan.status === "on_hold"
            ? "paused"
            : plan.status,
      }))
    );
    setShowPlanForm(false);
    setEditingPlan(null);
    setNewPlan({
      title: "",
      description: "",
      category: "仕事",
      priority: "medium",
      status: "not-started",
      startDate: new Date().toISOString().split("T")[0] as string,
      targetDate: new Date().toISOString().split("T")[0] as string,
      progress: 0,
      milestones: [],
    });
  };

  const handleDeletePlan = (planId: string) => {
    if (confirm("この計画を削除しますか？")) {
      futurePlanningManager.deletePlan(planId);
      setPlans(
        futurePlanningManager.getPlans(userId).map((plan) => ({
          ...plan,
          priority:
            plan.priority === "urgent"
              ? "high"
              : (plan.priority as "high" | "medium" | "low"),
          status:
            plan.status === "cancelled"
              ? "paused"
              : plan.status === "not_started"
              ? "not-started"
              : plan.status === "in_progress"
              ? "in-progress"
              : plan.status === "on_hold"
              ? "paused"
              : plan.status,
        }))
      );
    }
  };

  const handleCompletePlan = (planId: string) => {
    if (confirm("この計画を完了にしますか？")) {
      futurePlanningManager.completePlan(planId);
      setPlans(
        futurePlanningManager.getPlans(userId).map((plan) => ({
          ...plan,
          priority:
            plan.priority === "urgent"
              ? "high"
              : (plan.priority as "high" | "medium" | "low"),
          status:
            plan.status === "cancelled"
              ? "paused"
              : plan.status === "not_started"
              ? "not-started"
              : plan.status === "in_progress"
              ? "in-progress"
              : plan.status === "on_hold"
              ? "paused"
              : plan.status,
        }))
      );
    }
  };

  // 今やることのタスクを完了する
  const handleCompleteCurrentTask = () => {
    const immediateActions = getImmediateActions();
    if (immediateActions.length > 0) {
      const topAction = immediateActions[0];
      if (topAction.type === "deadline") {
        // 計画の完了
        const plan = plans.find((p) => p.title === topAction.title);
        if (plan) {
          handleCompletePlan(plan._id);
        }
      } else if (topAction.type === "schedule") {
        // スケジュールの完了（スケジュールは完了状態にできないので、メッセージを表示）
        alert("スケジュールは時間が来ると自動的に完了扱いになります。");
      }
    }
  };

  const handleCancelPlan = () => {
    setShowPlanForm(false);
    setEditingPlan(null);
    setNewPlan({
      title: "",
      description: "",
      category: "仕事",
      priority: "medium",
      status: "not-started",
      startDate: new Date().toISOString().split("T")[0] as string,
      targetDate: new Date().toISOString().split("T")[0] as string,
      progress: 0,
      milestones: [],
    });
  };

  // 今やることをひとつ取得
  const getCurrentFocus = () => {
    const immediateActions = getImmediateActions();
    const now = new Date();
    const currentHour = now.getHours();

    // 現在の時間帯に基づいて適切なメッセージを生成
    let timeBasedMessage = "";
    if (currentHour >= 6 && currentHour < 9) {
      timeBasedMessage =
        "朝の時間です。今日の計画を確認して、重要なタスクから始めましょう。";
    } else if (currentHour >= 9 && currentHour < 12) {
      timeBasedMessage =
        "午前中です。集中力が高い時間帯なので、重要な作業に取り組みましょう。";
    } else if (currentHour >= 12 && currentHour < 13) {
      timeBasedMessage =
        "お昼休みの時間です。適度に休憩を取って、午後の準備をしましょう。";
    } else if (currentHour >= 13 && currentHour < 17) {
      timeBasedMessage =
        "午後の時間です。午前の調子を維持して、作業を続けましょう。";
    } else if (currentHour >= 17 && currentHour < 19) {
      timeBasedMessage =
        "夕方の時間です。今日の振り返りと明日の準備をしましょう。";
    } else if (currentHour >= 19 && currentHour < 22) {
      timeBasedMessage =
        "夜の時間です。今日の成果を確認し、明日の準備をしましょう。";
    } else {
      timeBasedMessage =
        "深夜の時間です。十分な休息を取って、明日に備えましょう。";
    }

    // 最優先のアクションがある場合はそれを表示
    if (immediateActions.length > 0) {
      const topAction = immediateActions[0];
      return {
        message: `${topAction.title}を${topAction.action}。`,
        type: topAction.type,
        priority: topAction.priority,
        time: topAction.time,
      };
    }

    // 緊急の金銭的問題がある場合
    const urgentFinancial = getUrgentFinancialItems();
    if (urgentFinancial.length > 0) {
      const firstItem = urgentFinancial[0];
      if (firstItem) {
        return {
          message: `${firstItem.title}。${firstItem.message}`,
          type: "financial",
          priority: "high",
          time: "緊急",
        };
      }
    }

    // 今日のスケジュールがある場合
    const todayTasks = getTodayTasks();
    if (todayTasks.schedules.length > 0) {
      const nextSchedule = todayTasks.schedules[0];
      if (nextSchedule) {
        return {
          message: `${nextSchedule.startTime}から${nextSchedule.title}があります。`,
          type: "schedule",
          priority: nextSchedule.priority,
          time: nextSchedule.startTime,
        };
      }
    }

    // 今週締切の計画がある場合
    if (todayTasks.weekDeadlines.length > 0) {
      const nextDeadline = todayTasks.weekDeadlines[0];
      if (nextDeadline) {
        const targetDate = new Date(nextDeadline.targetDate);
        const daysLeft = Math.ceil(
          (targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );
        return {
          message: `${nextDeadline.title}が${daysLeft}日後に締切です。進捗を確認しましょう。`,
          type: "deadline",
          priority: "medium",
          time: `${daysLeft}日後`,
        };
      }
    }

    // デフォルトの時間帯ベースのメッセージ
    return {
      message: timeBasedMessage,
      type: "general",
      priority: "low",
      time: "今",
    };
  };

  const loadAllData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 各マネージャーからデータを読み込み
      assetLiabilityManager.loadFromLocalStorage();
      actionHistoryManager.loadFromLocalStorage();
      futurePlanningManager.loadFromLocalStorage();
      wasteAnalysisManager.loadFromLocalStorage();
      financialOverviewManager.loadFromLocalStorage();

      // 資産・負債データ
      const assetSummary =
        assetLiabilityManager.getAssetLiabilitySummary(userId);
      const assetAnalysis =
        assetLiabilityManager.generateAssetLiabilityAnalysis(userId);
      setAssetLiabilitySummary(assetSummary);
      setAssetLiabilityAnalysis(assetAnalysis);

      // 行動記録データ
      const actionData = actionHistoryManager.generateActionAnalysis(
        userId,
        selectedPeriod
      );
      const trends = actionHistoryManager.getActionTrends(
        userId,
        selectedPeriod
      );
      setActionAnalysis(actionData);
      setActionTrends(trends);

      // 将来計画データ
      const planData = futurePlanningManager.generatePlanAnalysis(userId);
      const recommendations =
        futurePlanningManager.generateRecommendations(userId);
      const plansData = futurePlanningManager.getPlans(userId);
      const schedulesData = futurePlanningManager.getSchedules(userId);
      const budgetPlansData = futurePlanningManager.getBudgetPlans(userId);
      setPlanAnalysis(planData);
      setPlanRecommendations(recommendations);
      setPlans(
        plansData.map((plan) => ({
          ...plan,
          priority:
            plan.priority === "urgent"
              ? "high"
              : (plan.priority as "high" | "medium" | "low"),
          status:
            plan.status === "cancelled"
              ? "paused"
              : plan.status === "not_started"
              ? "not-started"
              : plan.status === "in_progress"
              ? "in-progress"
              : plan.status === "on_hold"
              ? "paused"
              : plan.status,
        }))
      );
      setSchedules(schedulesData);
      setBudgetPlans(budgetPlansData);

      // 無駄遣い分析データ
      const endDate = new Date();
      const startDate = new Date();
      switch (selectedPeriod) {
        case "week":
          startDate.setDate(endDate.getDate() - 7);
          break;
        case "month":
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case "year":
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }
      const wasteData = wasteAnalysisManager.generateWasteAnalysis(
        userId,
        startDate,
        endDate
      );
      const wasteRecordsData = wasteAnalysisManager.getWasteRecords(userId);
      const wasteGoalsData = wasteAnalysisManager.getWasteGoals(userId);
      const wasteAlertsData = wasteAnalysisManager.getWasteAlerts(userId);
      setWasteAnalysis(wasteData);
      setWasteRecords(wasteRecordsData);
      setWasteGoals(wasteGoalsData);
      setWasteAlerts(wasteAlertsData);

      // 財布の残高データ
      await walletBalanceManager.loadFromServer(userId);
      const walletBalanceData = walletBalanceManager.getWalletBalance(userId);
      const walletTransactionsData = walletBalanceManager.getTransactions(
        userId,
        50
      );
      const walletBalanceSummaryData =
        walletBalanceManager.getWalletBalanceSummary(userId);
      const walletBalanceAnalysisData =
        walletBalanceManager.generateWalletBalanceAnalysis(userId);
      setWalletBalance(walletBalanceData);
      setWalletTransactions(walletTransactionsData);
      setWalletBalanceSummary(walletBalanceSummaryData);
      setWalletBalanceAnalysis(walletBalanceAnalysisData);

      // 銀行口座データ（サーバーから読み込み）
      await bankAccountManager.loadFromServer(userId);
      const bankAccountData = bankAccountManager.getBankAccount(userId);
      setBankAccounts(bankAccountData ? [bankAccountData] : []);

      // 財務概要データ
      const financialData =
        financialOverviewManager.getFinancialSummary(userId);
      setFinancialSummary(financialData);
    } catch (err) {
      console.error("データの読み込みエラー:", err);
      setError("データの読み込みに失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // 日時をフォーマットする関数
  const formatDateTime = (
    date: Date
  ): { date: string; time: string; weekday: string } => {
    const dateStr = date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const timeStr = date.toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    const weekdayStr = date.toLocaleDateString("ja-JP", {
      weekday: "long",
    });

    return {
      date: dateStr,
      time: timeStr,
      weekday: weekdayStr,
    };
  };

  const formatPercentage = (value: number): string => {
    return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
  };

  const getHealthScoreColor = (score: number): string => {
    if (score >= 80) return "#4CAF50";
    if (score >= 60) return "#8BC34A";
    if (score >= 40) return "#FFC107";
    if (score >= 20) return "#FF9800";
    return "#F44336";
  };

  const getHealthScoreLabel = (score: number): string => {
    if (score >= 80) return "優秀";
    if (score >= 60) return "良好";
    if (score >= 40) return "普通";
    if (score >= 20) return "要改善";
    return "危険";
  };

  if (isLoading) {
    return (
      <div className="comprehensive-dashboard">
        <div className="comprehensive-dashboard-header">
          <h2>統合ダッシュボード</h2>
          <button
            onClick={onClose}
            className="close-button"
            title="統合ダッシュボードを閉じる"
            aria-label="統合ダッシュボードを閉じる"
            type="button"
          >
            ×
          </button>
        </div>
        <div className="loading">データを読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="comprehensive-dashboard">
        <div className="comprehensive-dashboard-header">
          <h2>統合ダッシュボード</h2>
          <button
            onClick={onClose}
            className="close-button"
            title="統合ダッシュボードを閉じる"
            aria-label="統合ダッシュボードを閉じる"
            type="button"
          >
            ×
          </button>
        </div>
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="comprehensive-dashboard">
      <div className="comprehensive-dashboard-header">
        <h2>統合ダッシュボード</h2>
        <div className="header-controls">
          <select
            value={selectedPeriod}
            onChange={(e) =>
              setSelectedPeriod(e.target.value as "week" | "month" | "year")
            }
            className="period-selector"
            title="期間を選択"
            aria-label="期間を選択"
          >
            <option value="week">1週間</option>
            <option value="month">1ヶ月</option>
            <option value="year">1年</option>
          </select>
          <button
            onClick={() => {
              console.log("閉じるボタンがクリックされました");
              onClose();
            }}
            className="close-button"
            title="統合ダッシュボードを閉じる"
            aria-label="統合ダッシュボードを閉じる"
            type="button"
          >
            ×
          </button>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button
          className={`tab ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
          title="概要を表示"
        >
          🏠 概要
        </button>
        <button
          className={`tab ${activeTab === "today" ? "active" : ""}`}
          onClick={() => setActiveTab("today")}
          title="今日の情報を表示"
        >
          📅 今日
        </button>
        <button
          className={`tab ${activeTab === "thisweek" ? "active" : ""}`}
          onClick={() => setActiveTab("thisweek")}
          title="今週の情報を表示"
        >
          📊 今週
        </button>
        <button
          className={`tab ${activeTab === "thismonth" ? "active" : ""}`}
          onClick={() => setActiveTab("thismonth")}
          title="今月の情報を表示"
        >
          🗓️ 今月
        </button>
        <button
          className={`tab ${activeTab === "urgent" ? "active" : ""}`}
          onClick={() => setActiveTab("urgent")}
          title="緊急事項を表示"
        >
          ⚠️ 緊急
        </button>
        <button
          className={`tab ${activeTab === "goals" ? "active" : ""}`}
          onClick={() => setActiveTab("goals")}
          title="目標を表示"
        >
          🎯 目標
        </button>
        <button
          className={`tab ${activeTab === "financial" ? "active" : ""}`}
          onClick={() => setActiveTab("financial")}
          title="金融・無駄遣い管理を表示"
        >
          💳 金融・無駄遣い
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === "overview" && (
          <div className="overview-tab">
            {/* 現在日時を表示 */}
            <div className="current-datetime-card">
              <div className="datetime-content">
                <div className="datetime-main">
                  <div className="current-time">
                    {formatDateTime(currentDateTime).time}
                  </div>
                  <div className="current-date">
                    {formatDateTime(currentDateTime).date}
                  </div>
                </div>
                <div className="current-weekday">
                  {formatDateTime(currentDateTime).weekday}
                </div>
              </div>
            </div>

            {/* 今やることをひとつ表示 */}
            <div className="current-focus-card">
              <div className="focus-header">
                <h2>🎯 今やること</h2>
                <span className="focus-time">{getCurrentFocus().time}</span>
              </div>
              <div className="focus-content">
                <div
                  className={`focus-message priority-${
                    getCurrentFocus().priority
                  }`}
                >
                  {getCurrentFocus().message}
                </div>
                {getImmediateActions().length > 0 && (
                  <button
                    className="complete-task-button"
                    onClick={handleCompleteCurrentTask}
                    title="このタスクを完了にする"
                  >
                    ✅ 完了
                  </button>
                )}
              </div>
            </div>

            <div className="overview-grid">
              {/* 財務健全性スコア */}
              <div className="overview-card financial-health">
                <h3>財務健全性</h3>
                {assetLiabilityAnalysis && (
                  <div className="health-score">
                    <div
                      className="score-circle"
                      style={{
                        background: `conic-gradient(${getHealthScoreColor(
                          assetLiabilityAnalysis.financialHealthScore
                        )} 0deg ${
                          assetLiabilityAnalysis.financialHealthScore * 3.6
                        }deg, #e0e0e0 ${
                          assetLiabilityAnalysis.financialHealthScore * 3.6
                        }deg 360deg)`,
                      }}
                    >
                      <div className="score-text">
                        <span className="score-value">
                          {assetLiabilityAnalysis.financialHealthScore}
                        </span>
                        <span className="score-label">
                          {getHealthScoreLabel(
                            assetLiabilityAnalysis.financialHealthScore
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 純資産 */}
              <div className="overview-card net-worth">
                <h3>純資産</h3>
                {assetLiabilitySummary && (
                  <div className="net-worth-content">
                    <div className="net-worth-value">
                      {formatCurrency(assetLiabilitySummary.netWorth)}
                    </div>
                    <div className="net-worth-breakdown">
                      <div className="breakdown-item">
                        <span className="label">資産:</span>
                        <span className="value">
                          {formatCurrency(assetLiabilitySummary.totalAssets)}
                        </span>
                      </div>
                      <div className="breakdown-item">
                        <span className="label">負債:</span>
                        <span className="value">
                          {formatCurrency(
                            assetLiabilitySummary.totalLiabilities
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 生産性スコア */}
              <div className="overview-card productivity">
                <h3>生産性スコア</h3>
                {actionAnalysis && (
                  <div className="productivity-content">
                    <div className="productivity-score">
                      <span className="score-value">
                        {actionAnalysis.productivityScore.toFixed(0)}
                      </span>
                      <span className="score-label">/ 100</span>
                    </div>
                    <div className="productivity-stats">
                      <div className="stat-item">
                        <span className="label">総活動数:</span>
                        <span className="value">
                          {actionAnalysis.totalActions}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 計画進捗 */}
              <div className="overview-card plans">
                <h3>計画進捗</h3>
                {planAnalysis && (
                  <div className="plans-content">
                    <div className="completion-rate">
                      <span className="rate-value">
                        {planAnalysis.completionRate.toFixed(1)}%
                      </span>
                      <span className="rate-label">完了率</span>
                    </div>
                    <div className="plans-stats">
                      <div className="stat-item">
                        <span className="label">総計画数:</span>
                        <span className="value">{planAnalysis.totalPlans}</span>
                      </div>
                      <div className="stat-item">
                        <span className="label">完了:</span>
                        <span className="value">
                          {planAnalysis.completedPlans}
                        </span>
                      </div>
                      <div className="stat-item">
                        <span className="label">進行中:</span>
                        <span className="value">
                          {planAnalysis.inProgressPlans}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 無駄遣いスコア */}
              <div className="overview-card waste">
                <h3>無駄遣いスコア</h3>
                {wasteAnalysis && (
                  <div className="waste-content">
                    <div className="waste-score">
                      <span className="score-value">
                        {wasteAnalysis.wasteScore}
                      </span>
                      <span className="score-label">/ 100</span>
                    </div>
                    <div className="waste-breakdown">
                      <div className="breakdown-item">
                        <span className="label">お金:</span>
                        <span className="value">
                          {formatCurrency(wasteAnalysis.totalWaste.money)}
                        </span>
                      </div>
                      <div className="breakdown-item">
                        <span className="label">時間:</span>
                        <span className="value">
                          {wasteAnalysis.totalWaste.time}分
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 推奨事項 */}
              <div className="overview-card recommendations">
                <h3>推奨事項</h3>
                <div className="recommendations-list">
                  {planRecommendations.slice(0, 3).map((rec, index) => (
                    <div
                      key={index}
                      className={`recommendation-item ${rec.priority}`}
                    >
                      <span className="recommendation-title">{rec.title}</span>
                      <span className="recommendation-description">
                        {rec.description}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 今日のタブ */}
        {activeTab === "today" && (
          <div className="today-tab">
            <div className="today-header">
              <h2>📅 今日やるべきこと</h2>
              <p>
                {new Date().toLocaleDateString("ja-JP", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  weekday: "long",
                })}
              </p>
            </div>

            <div className="today-grid">
              {/* 今すぐやるべきアクション */}
              <div className="today-card immediate-actions">
                <h3>⚡ 今すぐやるべきこと</h3>
                <div className="actions-list">
                  {getImmediateActions().map((action, index) => (
                    <div
                      key={index}
                      className={`action-item priority-${action.priority}`}
                    >
                      <div className="action-content">
                        <span className="action-title">{action.title}</span>
                        <span className="action-time">{action.time}</span>
                      </div>
                      <div className="action-buttons">
                        <button
                          className="action-button"
                          onClick={() => {
                            if (action.type === "deadline") {
                              const plan = plans.find(
                                (p) => p.title === action.title
                              );
                              if (plan) handleCompletePlan(plan._id);
                            } else if (action.type === "schedule") {
                              alert(
                                "スケジュールは時間が来ると自動的に完了扱いになります。"
                              );
                            }
                          }}
                        >
                          {action.action}
                        </button>
                        <button
                          className="complete-action-button"
                          onClick={() => {
                            if (action.type === "deadline") {
                              const plan = plans.find(
                                (p) => p.title === action.title
                              );
                              if (plan) handleCompletePlan(plan._id);
                            } else if (action.type === "schedule") {
                              alert(
                                "スケジュールは時間が来ると自動的に完了扱いになります。"
                              );
                            }
                          }}
                          title="このタスクを完了にする"
                        >
                          ✅
                        </button>
                      </div>
                    </div>
                  ))}
                  {getImmediateActions().length === 0 && (
                    <div className="no-actions">
                      <p>🎉 今すぐやるべきことはありません！</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 今日のスケジュール */}
              <div className="today-card today-schedule">
                <h3>📅 今日のスケジュール</h3>
                <div className="schedule-list">
                  {getTodayTasks().schedules.map((schedule, index) => (
                    <div key={index} className="schedule-item">
                      <div className="schedule-time">{schedule.startTime}</div>
                      <div className="schedule-content">
                        <div className="schedule-title">{schedule.title}</div>
                        <div className="schedule-category">
                          {schedule.category}
                        </div>
                      </div>
                      <div
                        className={`schedule-priority priority-${schedule.priority}`}
                      >
                        {schedule.priority === "high"
                          ? "高"
                          : schedule.priority === "medium"
                          ? "中"
                          : "低"}
                      </div>
                    </div>
                  ))}
                  {getTodayTasks().schedules.length === 0 && (
                    <div className="no-schedule">
                      <p>今日のスケジュールはありません</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 今日締切の計画 */}
              <div className="today-card today-deadlines">
                <h3>⏰ 今日締切の計画</h3>
                <div className="deadlines-list">
                  {getTodayTasks().deadlines.map((plan, index) => (
                    <div key={index} className="deadline-item">
                      <div className="deadline-title">{plan.title}</div>
                      <div className="deadline-progress">
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{ width: `${plan.progress}%` }}
                          ></div>
                        </div>
                        <span className="progress-text">{plan.progress}%</span>
                      </div>
                    </div>
                  ))}
                  {getTodayTasks().deadlines.length === 0 && (
                    <div className="no-deadlines">
                      <p>今日締切の計画はありません</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 今週締切の計画 */}
              <div className="today-card week-deadlines">
                <h3>📊 今週締切の計画</h3>
                <div className="week-deadlines-list">
                  {getTodayTasks().weekDeadlines.map((plan, index) => {
                    const targetDate = new Date(plan.targetDate);
                    const today = new Date();
                    const daysLeft = Math.ceil(
                      (targetDate.getTime() - today.getTime()) /
                        (1000 * 60 * 60 * 24)
                    );

                    return (
                      <div key={index} className="week-deadline-item">
                        <div className="week-deadline-title">{plan.title}</div>
                        <div className="week-deadline-info">
                          <span className="days-left">{daysLeft}日後</span>
                          <div className="week-progress-bar">
                            <div
                              className="week-progress-fill"
                              style={{ width: `${plan.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {getTodayTasks().weekDeadlines.length === 0 && (
                    <div className="no-week-deadlines">
                      <p>今週締切の計画はありません</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 今週のタブ */}
        {activeTab === "thisweek" && (
          <div className="thisweek-tab">
            <div className="thisweek-header">
              <h2>📊 今週の目標と進捗</h2>
              <p>今週の重要な目標と進捗状況を確認しましょう</p>
            </div>

            <div className="thisweek-grid">
              {/* 今週の目標 */}
              <div className="thisweek-card weekly-goals">
                <h3>🎯 今週の目標</h3>
                <div className="goals-list">
                  {plans
                    .filter((plan) => {
                      const targetDate = new Date(plan.targetDate);
                      const today = new Date();
                      const daysUntilDeadline = Math.ceil(
                        (targetDate.getTime() - today.getTime()) /
                          (1000 * 60 * 60 * 24)
                      );
                      return (
                        daysUntilDeadline <= 7 && plan.status !== "completed"
                      );
                    })
                    .map((plan, index) => (
                      <div key={index} className="goal-item">
                        <div className="goal-title">{plan.title}</div>
                        <div className="goal-progress">
                          <div className="progress-bar">
                            <div
                              className="progress-fill"
                              style={{ width: `${plan.progress}%` }}
                            ></div>
                          </div>
                          <span className="progress-text">
                            {plan.progress}%
                          </span>
                        </div>
                        <div className="goal-deadline">
                          締切:{" "}
                          {new Date(plan.targetDate).toLocaleDateString(
                            "ja-JP"
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* 今週のスケジュール */}
              <div className="thisweek-card weekly-schedule">
                <h3>📅 今週のスケジュール</h3>
                <div className="weekly-schedule-list">
                  {schedules
                    .filter((schedule) => {
                      const scheduleDate = new Date(schedule.date);
                      const today = new Date();
                      const daysUntilSchedule = Math.ceil(
                        (scheduleDate.getTime() - today.getTime()) /
                          (1000 * 60 * 60 * 24)
                      );
                      return daysUntilSchedule >= 0 && daysUntilSchedule <= 7;
                    })
                    .map((schedule, index) => (
                      <div key={index} className="weekly-schedule-item">
                        <div className="schedule-date">
                          {new Date(schedule.date).toLocaleDateString("ja-JP", {
                            month: "short",
                            day: "numeric",
                            weekday: "short",
                          })}
                        </div>
                        <div className="schedule-content">
                          <div className="schedule-title">{schedule.title}</div>
                          <div className="schedule-time">
                            {schedule.startTime} - {schedule.endTime}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 今月のタブ */}
        {activeTab === "thismonth" && (
          <div className="thismonth-tab">
            <div className="thismonth-header">
              <h2>🗓️ 今月の目標と進捗</h2>
              <p>今月の重要な目標と進捗状況を確認しましょう</p>
            </div>

            <div className="thismonth-grid">
              {/* 今月の目標 */}
              <div className="thismonth-card monthly-goals">
                <h3>🎯 今月の目標</h3>
                <div className="monthly-goals-list">
                  {plans
                    .filter((plan) => {
                      const targetDate = new Date(plan.targetDate);
                      const today = new Date();
                      const daysUntilDeadline = Math.ceil(
                        (targetDate.getTime() - today.getTime()) /
                          (1000 * 60 * 60 * 24)
                      );
                      return (
                        daysUntilDeadline <= 30 && plan.status !== "completed"
                      );
                    })
                    .map((plan, index) => (
                      <div key={index} className="monthly-goal-item">
                        <div className="monthly-goal-title">{plan.title}</div>
                        <div className="monthly-goal-progress">
                          <div className="progress-bar">
                            <div
                              className="progress-fill"
                              style={{ width: `${plan.progress}%` }}
                            ></div>
                          </div>
                          <span className="progress-text">
                            {plan.progress}%
                          </span>
                        </div>
                        <div className="monthly-goal-deadline">
                          締切:{" "}
                          {new Date(plan.targetDate).toLocaleDateString(
                            "ja-JP"
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* 今月の予算 */}
              <div className="thismonth-card monthly-budget">
                <h3>💰 今月の予算</h3>
                {financialSummary && (
                  <div className="budget-content">
                    <div className="budget-summary">
                      <div className="budget-item">
                        <span className="budget-label">予算:</span>
                        <span className="budget-value">
                          {formatCurrency(financialSummary.budget)}
                        </span>
                      </div>
                      <div className="budget-item">
                        <span className="budget-label">支出:</span>
                        <span className="budget-value">
                          {formatCurrency(financialSummary.expenses)}
                        </span>
                      </div>
                      <div className="budget-item">
                        <span className="budget-label">残り:</span>
                        <span
                          className={`budget-value ${
                            financialSummary.budget -
                              financialSummary.expenses <
                            0
                              ? "over-budget"
                              : ""
                          }`}
                        >
                          {formatCurrency(
                            financialSummary.budget - financialSummary.expenses
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="budget-progress">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${Math.min(
                              100,
                              (financialSummary.expenses /
                                financialSummary.budget) *
                                100
                            )}%`,
                            backgroundColor:
                              financialSummary.expenses >
                              financialSummary.budget
                                ? "#ff4444"
                                : "#4CAF50",
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 緊急のタブ */}
        {activeTab === "urgent" && (
          <div className="urgent-tab">
            <div className="urgent-header">
              <h2>⚠️ 緊急対応が必要な事項</h2>
              <p>今すぐ対応が必要な重要な事項を確認しましょう</p>
            </div>

            <div className="urgent-grid">
              {/* 緊急の金銭的問題 */}
              <div className="urgent-card financial-urgent">
                <h3>💰 緊急の金銭的問題</h3>
                <div className="urgent-financial-list">
                  {getUrgentFinancialItems().map((item, index) => (
                    <div
                      key={index}
                      className={`urgent-item priority-${item.priority}`}
                    >
                      <div className="urgent-icon">⚠️</div>
                      <div className="urgent-content">
                        <div className="urgent-title">{item.title}</div>
                        <div className="urgent-message">{item.message}</div>
                      </div>
                      <button className="urgent-action-button">対応する</button>
                    </div>
                  ))}
                  {getUrgentFinancialItems().length === 0 && (
                    <div className="no-urgent-financial">
                      <p>🎉 緊急の金銭的問題はありません！</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 緊急の計画 */}
              <div className="urgent-card plan-urgent">
                <h3>📋 緊急の計画</h3>
                <div className="urgent-plans-list">
                  {plans
                    .filter((plan) => {
                      const targetDate = new Date(plan.targetDate);
                      const today = new Date();
                      const daysUntilDeadline = Math.ceil(
                        (targetDate.getTime() - today.getTime()) /
                          (1000 * 60 * 60 * 24)
                      );
                      return (
                        daysUntilDeadline <= 3 && plan.status !== "completed"
                      );
                    })
                    .map((plan, index) => {
                      const targetDate = new Date(plan.targetDate);
                      const today = new Date();
                      const daysLeft = Math.ceil(
                        (targetDate.getTime() - today.getTime()) /
                          (1000 * 60 * 60 * 24)
                      );

                      return (
                        <div key={index} className="urgent-plan-item">
                          <div className="urgent-plan-title">{plan.title}</div>
                          <div className="urgent-plan-info">
                            <span className="days-left">
                              {daysLeft}日後締切
                            </span>
                            <div className="urgent-progress-bar">
                              <div
                                className="urgent-progress-fill"
                                style={{ width: `${plan.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  {plans.filter((plan) => {
                    const targetDate = new Date(plan.targetDate);
                    const today = new Date();
                    const daysUntilDeadline = Math.ceil(
                      (targetDate.getTime() - today.getTime()) /
                        (1000 * 60 * 60 * 24)
                    );
                    return (
                      daysUntilDeadline <= 3 && plan.status !== "completed"
                    );
                  }).length === 0 && (
                    <div className="no-urgent-plans">
                      <p>🎉 緊急の計画はありません！</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 目標のタブ */}
        {activeTab === "goals" && (
          <div className="goals-tab">
            <div className="goals-header">
              <h2>🎯 目標と計画</h2>
              <p>あなたの目標と計画の進捗状況を確認しましょう</p>
              <button
                className="create-plan-button"
                onClick={() => setShowPlanForm(true)}
              >
                ➕ 新しい計画を作成
              </button>
            </div>

            {/* 計画作成フォーム */}
            {showPlanForm && (
              <div className="plan-form-overlay">
                <div className="plan-form">
                  <h3>{editingPlan ? "計画を編集" : "新しい計画を作成"}</h3>

                  <div className="form-group">
                    <label>タイトル *</label>
                    <input
                      type="text"
                      value={newPlan.title || ""}
                      onChange={(e) =>
                        setNewPlan({ ...newPlan, title: e.target.value })
                      }
                      placeholder="例: 勤怠のWEB入力"
                    />
                  </div>

                  <div className="form-group">
                    <label>説明</label>
                    <textarea
                      value={newPlan.description || ""}
                      onChange={(e) =>
                        setNewPlan({ ...newPlan, description: e.target.value })
                      }
                      placeholder="計画の詳細を入力してください"
                      rows={3}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>カテゴリ</label>
                      <select
                        value={newPlan.category || "仕事"}
                        onChange={(e) =>
                          setNewPlan({ ...newPlan, category: e.target.value })
                        }
                        title="カテゴリを選択"
                        aria-label="カテゴリを選択"
                      >
                        <option value="仕事">仕事</option>
                        <option value="学習">学習</option>
                        <option value="健康">健康</option>
                        <option value="趣味">趣味</option>
                        <option value="その他">その他</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>優先度</label>
                      <select
                        value={newPlan.priority || "medium"}
                        onChange={(e) =>
                          setNewPlan({
                            ...newPlan,
                            priority: e.target.value as
                              | "low"
                              | "medium"
                              | "high",
                          })
                        }
                        title="優先度を選択"
                        aria-label="優先度を選択"
                      >
                        <option value="low">低</option>
                        <option value="medium">中</option>
                        <option value="high">高</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>開始日</label>
                      <input
                        type="date"
                        value={newPlan.startDate || ""}
                        title="開始日を選択"
                        placeholder="開始日を選択"
                        onChange={(e) =>
                          setNewPlan({ ...newPlan, startDate: e.target.value })
                        }
                      />
                    </div>

                    <div className="form-group">
                      <label>締切日</label>
                      <input
                        type="date"
                        value={newPlan.targetDate || ""}
                        title="締切日を選択"
                        placeholder="締切日を選択"
                        onChange={(e) =>
                          setNewPlan({ ...newPlan, targetDate: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>進捗 (%)</label>
                    <input
                      type="number"
                      min="0"
                      title="進捗を入力"
                      placeholder="進捗を入力"
                      max="100"
                      value={newPlan.progress || 0}
                      onChange={(e) =>
                        setNewPlan({
                          ...newPlan,
                          progress: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>

                  <div className="form-actions">
                    <button
                      className="cancel-button"
                      onClick={handleCancelPlan}
                    >
                      キャンセル
                    </button>
                    <button
                      className="save-button"
                      onClick={
                        editingPlan ? handleUpdatePlan : handleCreatePlan
                      }
                    >
                      {editingPlan ? "更新" : "作成"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="goals-grid">
              {/* 進行中の計画 */}
              <div className="goals-card active-plans">
                <h3>🚀 進行中の計画</h3>
                <div className="active-plans-list">
                  {plans
                    .filter((plan) => plan.status === "in-progress")
                    .map((plan, index) => (
                      <div key={index} className="active-plan-item">
                        <div className="plan-content">
                          <div className="plan-title">{plan.title}</div>
                          <div className="plan-category">{plan.category}</div>
                          <div className="plan-progress">
                            <div className="progress-bar">
                              <div
                                className="progress-fill"
                                style={{ width: `${plan.progress}%` }}
                              ></div>
                            </div>
                            <span className="progress-text">
                              {plan.progress}%
                            </span>
                          </div>
                          <div className="plan-deadline">
                            締切:{" "}
                            {new Date(plan.targetDate).toLocaleDateString(
                              "ja-JP"
                            )}
                          </div>
                        </div>
                        <div className="plan-actions">
                          <button
                            className="complete-button"
                            onClick={() => handleCompletePlan(plan._id)}
                          >
                            完了
                          </button>
                          <button
                            className="edit-button"
                            onClick={() => handleEditPlan(plan)}
                          >
                            編集
                          </button>
                          <button
                            className="delete-button"
                            onClick={() => handleDeletePlan(plan._id)}
                          >
                            削除
                          </button>
                        </div>
                      </div>
                    ))}
                  {plans.filter((plan) => plan.status === "in-progress")
                    .length === 0 && (
                    <div className="no-plans">
                      <p>進行中の計画はありません</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 未開始の計画 */}
              <div className="goals-card pending-plans">
                <h3>📋 未開始の計画</h3>
                <div className="pending-plans-list">
                  {plans
                    .filter((plan) => plan.status === "not-started")
                    .map((plan, index) => (
                      <div key={index} className="pending-plan-item">
                        <div className="plan-content">
                          <div className="plan-title">{plan.title}</div>
                          <div className="plan-category">{plan.category}</div>
                          <div className="plan-deadline">
                            締切:{" "}
                            {new Date(plan.targetDate).toLocaleDateString(
                              "ja-JP"
                            )}
                          </div>
                        </div>
                        <div className="plan-actions">
                          <button
                            className="complete-button"
                            onClick={() => handleCompletePlan(plan._id)}
                          >
                            完了
                          </button>
                          <button
                            className="edit-button"
                            onClick={() => handleEditPlan(plan)}
                          >
                            編集
                          </button>
                          <button
                            className="delete-button"
                            onClick={() => handleDeletePlan(plan._id)}
                          >
                            削除
                          </button>
                        </div>
                      </div>
                    ))}
                  {plans.filter((plan) => plan.status === "not-started")
                    .length === 0 && (
                    <div className="no-plans">
                      <p>未開始の計画はありません</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 完了した計画 */}
              <div className="goals-card completed-plans">
                <h3>✅ 完了した計画</h3>
                <div className="completed-plans-list">
                  {plans
                    .filter((plan) => plan.status === "completed")
                    .slice(0, 5)
                    .map((plan, index) => (
                      <div key={index} className="completed-plan-item">
                        <div className="plan-title">{plan.title}</div>
                        <div className="plan-completed-date">
                          完了:{" "}
                          {plan.completedDate
                            ? new Date(plan.completedDate).toLocaleDateString(
                                "ja-JP"
                              )
                            : "不明"}
                        </div>
                      </div>
                    ))}
                  {plans.filter((plan) => plan.status === "completed")
                    .length === 0 && (
                    <div className="no-plans">
                      <p>完了した計画はありません</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "assets" &&
          assetLiabilitySummary &&
          assetLiabilityAnalysis && (
            <div className="assets-tab">
              <div className="assets-grid">
                <div className="assets-summary">
                  <h3>資産・負債サマリー</h3>
                  <div className="summary-cards">
                    <div className="summary-card assets">
                      <h4>総資産</h4>
                      <div className="amount">
                        {formatCurrency(assetLiabilitySummary.totalAssets)}
                      </div>
                    </div>
                    <div className="summary-card liabilities">
                      <h4>総負債</h4>
                      <div className="amount">
                        {formatCurrency(assetLiabilitySummary.totalLiabilities)}
                      </div>
                    </div>
                    <div className="summary-card net-worth">
                      <h4>純資産</h4>
                      <div className="amount">
                        {formatCurrency(assetLiabilitySummary.netWorth)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="assets-breakdown">
                  <h3>資産内訳</h3>
                  <div className="breakdown-chart">
                    {Object.entries(assetLiabilitySummary.assetBreakdown).map(
                      ([key, value]) => (
                        <div key={key} className="breakdown-item">
                          <span className="label">{key}</span>
                          <div className="bar">
                            <div
                              className="bar-fill"
                              style={{
                                width: `${
                                  (value / assetLiabilitySummary.totalAssets) *
                                  100
                                }%`,
                                backgroundColor:
                                  ASSET_CATEGORIES.find((cat) => cat.id === key)
                                    ?.color || "#2196F3",
                              }}
                            ></div>
                          </div>
                          <span className="value">{formatCurrency(value)}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>

                <div className="liabilities-breakdown">
                  <h3>負債内訳</h3>
                  <div className="breakdown-chart">
                    {Object.entries(
                      assetLiabilitySummary.liabilityBreakdown
                    ).map(([key, value]) => (
                      <div key={key} className="breakdown-item">
                        <span className="label">{key}</span>
                        <div className="bar">
                          <div
                            className="bar-fill"
                            style={{
                              width: `${
                                (value /
                                  assetLiabilitySummary.totalLiabilities) *
                                100
                              }%`,
                              backgroundColor:
                                LIABILITY_CATEGORIES.find(
                                  (cat) => cat.id === key
                                )?.color || "#F44336",
                            }}
                          ></div>
                        </div>
                        <span className="value">{formatCurrency(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="financial-analysis">
                  <h3>財務分析</h3>
                  <div className="analysis-metrics">
                    <div className="metric">
                      <span className="label">純資産変化率</span>
                      <span
                        className={`value ${
                          assetLiabilityAnalysis.netWorthChange >= 0
                            ? "positive"
                            : "negative"
                        }`}
                      >
                        {formatPercentage(
                          assetLiabilityAnalysis.netWorthChange
                        )}
                      </span>
                    </div>
                    <div className="metric">
                      <span className="label">負債比率</span>
                      <span className="value">
                        {assetLiabilityAnalysis.debtToAssetRatio.toFixed(1)}%
                      </span>
                    </div>
                    <div className="metric">
                      <span className="label">緊急資金カバレッジ</span>
                      <span className="value">
                        {assetLiabilityAnalysis.emergencyFundCoverage.toFixed(
                          1
                        )}
                        倍
                      </span>
                    </div>
                    <div className="metric">
                      <span className="label">資産多様性スコア</span>
                      <span className="value">
                        {assetLiabilityAnalysis.assetDiversificationScore.toFixed(
                          0
                        )}
                        /100
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        {activeTab === "actions" && actionAnalysis && (
          <div className="actions-tab">
            <div className="actions-grid">
              <div className="actions-summary">
                <h3>行動記録サマリー</h3>
                <div className="summary-stats">
                  <div className="stat-card">
                    <h4>総活動数</h4>
                    <div className="stat-value">
                      {actionAnalysis.totalActions}
                    </div>
                  </div>
                  <div className="stat-card">
                    <h4>生産性スコア</h4>
                    <div className="stat-value">
                      {actionAnalysis.productivityScore.toFixed(0)}/100
                    </div>
                  </div>
                </div>
              </div>

              <div className="category-stats">
                <h3>カテゴリ別統計</h3>
                <div className="category-chart">
                  {Object.entries(actionAnalysis.categoryStats).map(
                    ([category, stats]) => (
                      <div key={category} className="category-item">
                        <div className="category-header">
                          <span className="category-name">
                            {ACTION_CATEGORIES.find(
                              (cat) => cat.id === category
                            )?.name || category}
                          </span>
                          <span className="category-count">
                            {stats.count}回
                          </span>
                        </div>
                        <div className="category-bar">
                          <div
                            className="bar-fill"
                            style={{
                              width: `${
                                (stats.count / actionAnalysis.totalActions) *
                                100
                              }%`,
                              backgroundColor:
                                ACTION_CATEGORIES.find(
                                  (cat) => cat.id === category
                                )?.color || "#2196F3",
                            }}
                          ></div>
                        </div>
                        <div className="category-details">
                          <span>
                            平均時間: {stats.averageDuration.toFixed(0)}分
                          </span>
                          <span>総時間: {stats.totalDuration}分</span>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="insights">
                <h3>洞察・推奨事項</h3>
                <div className="insights-list">
                  {actionAnalysis.insights.map((insight, index) => (
                    <div
                      key={index}
                      className={`insight-item ${insight.priority}`}
                    >
                      <h4>{insight.title}</h4>
                      <p>{insight.description}</p>
                      <ul className="suggestions">
                        {insight.suggestions.map((suggestion, idx) => (
                          <li key={idx}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "plans" && planAnalysis && (
          <div className="plans-tab">
            <div className="plans-grid">
              <div className="plans-summary">
                <h3>計画サマリー</h3>
                <div className="summary-cards">
                  <div className="summary-card total">
                    <h4>総計画数</h4>
                    <div className="count">{planAnalysis.totalPlans}</div>
                  </div>
                  <div className="summary-card completed">
                    <h4>完了</h4>
                    <div className="count">{planAnalysis.completedPlans}</div>
                  </div>
                  <div className="summary-card in-progress">
                    <h4>進行中</h4>
                    <div className="count">{planAnalysis.inProgressPlans}</div>
                  </div>
                  <div className="summary-card overdue">
                    <h4>期限切れ</h4>
                    <div className="count">{planAnalysis.overduePlans}</div>
                  </div>
                </div>
              </div>

              <div className="completion-rate">
                <h3>完了率</h3>
                <div className="rate-circle">
                  <div
                    className="rate-fill"
                    style={{
                      background: `conic-gradient(#4CAF50 0deg ${
                        planAnalysis.completionRate * 3.6
                      }deg, #e0e0e0 ${
                        planAnalysis.completionRate * 3.6
                      }deg 360deg)`,
                    }}
                  >
                    <div className="rate-text">
                      <span className="rate-value">
                        {planAnalysis.completionRate.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="category-stats">
                <h3>カテゴリ別統計</h3>
                <div className="category-chart">
                  {Object.entries(planAnalysis.categoryStats).map(
                    ([category, stats]) => (
                      <div key={category} className="category-item">
                        <div className="category-header">
                          <span className="category-name">
                            {PLAN_CATEGORIES.find((cat) => cat.id === category)
                              ?.name || category}
                          </span>
                          <span className="category-count">
                            {stats.count}件
                          </span>
                        </div>
                        <div className="category-bar">
                          <div
                            className="bar-fill"
                            style={{
                              width: `${
                                (stats.count / planAnalysis.totalPlans) * 100
                              }%`,
                              backgroundColor:
                                PLAN_CATEGORIES.find(
                                  (cat) => cat.id === category
                                )?.color || "#2196F3",
                            }}
                          ></div>
                        </div>
                        <div className="category-details">
                          <span>完了: {stats.completed}件</span>
                          <span>
                            進捗率: {stats.averageProgress.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="recommendations">
                <h3>推奨事項</h3>
                <div className="recommendations-list">
                  {planRecommendations.map((rec, index) => (
                    <div
                      key={index}
                      className={`recommendation-item ${rec.priority}`}
                    >
                      <h4>{rec.title}</h4>
                      <p>{rec.description}</p>
                      <ul className="suggestions">
                        {rec.suggestions.map((suggestion, idx) => (
                          <li key={idx}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}


        {activeTab === "financial" && (
          <div className="financial-tab">
            <div className="financial-header">
              <h3>金融・無駄遣い管理</h3>
            </div>

            {/* 無駄遣い分析セクション */}
            {wasteAnalysis && (
              <div className="waste-section">
                <div className="section-header">
                  <h4>💸 無駄遣い分析</h4>
                  <div className="waste-actions">
                    <button
                      className="add-record-button"
                      onClick={() => setShowAddWasteRecord(true)}
                    >
                      + 記録を追加
                    </button>
                    <button
                      className="add-goal-button"
                      onClick={() => setShowAddWasteGoal(true)}
                    >
                      + 目標を追加
                    </button>
                    <button
                      className="add-receipt-button"
                      onClick={() => setShowAddReceipt(true)}
                    >
                      + レシート登録
                    </button>
                  </div>
                </div>

                <div className="waste-grid">
                  <div className="waste-summary">
                    <div className="summary-cards">
                      <div className="summary-card money">
                        <h4>お金の無駄</h4>
                        <div className="amount">
                          {formatCurrency(wasteAnalysis.totalWaste.money)}
                        </div>
                      </div>
                      <div className="summary-card time">
                        <h4>時間の無駄</h4>
                        <div className="amount">
                          {wasteAnalysis.totalWaste.time}分
                        </div>
                      </div>
                      <div className="summary-card effort">
                        <h4>労力の無駄</h4>
                        <div className="amount">
                          {wasteAnalysis.totalWaste.effort}ポイント
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="waste-score">
                    <h3>無駄遣いスコア</h3>
                    <div className="score-circle">
                      <div
                        className="score-fill"
                        style={{
                          background: `conic-gradient(#F44336 0deg ${
                            wasteAnalysis.wasteScore * 3.6
                          }deg, #e0e0e0 ${
                            wasteAnalysis.wasteScore * 3.6
                          }deg 360deg)`,
                        }}
                      >
                        <div className="score-text">
                          <span className="score-value">
                            {wasteAnalysis.wasteScore}
                          </span>
                          <span className="score-label">/ 100</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="waste-sources">
                    <h3>無駄遣いの原因</h3>
                    <div className="sources-list">
                      {wasteAnalysis.topWasteSources.map((source, index) => (
                        <div key={index} className="source-item">
                          <span className="source-name">{source.categoryName}</span>
                          <span className="source-amount">
                            {formatCurrency(source.totalAmount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="waste-records">
                    <h3>無駄遣い記録</h3>
                    <div className="records-list">
                      {wasteRecords.map((record) => {
                        const category = WASTE_CATEGORIES.find(
                          (cat) => cat.id === record.categoryId
                        );
                        return (
                          <div
                            key={record.id}
                            className={`record-item ${
                              record.isWasteful ? "wasteful" : "efficient"
                            }`}
                          >
                            <div className="record-icon">{category?.icon}</div>
                            <div className="record-info">
                              <h4>{category?.name}</h4>
                              <p>{record.description}</p>
                              <div className="record-meta">
                                <span className="record-date">
                                  {record.date.toLocaleDateString("ja-JP")}
                                </span>
                                <span className="record-amount">
                                  {record.type === "money" &&
                                    formatCurrency(record.amount)}
                                  {record.type === "time" && `${record.amount}分`}
                                  {record.type === "effort" && `${record.amount}pt`}
                                </span>
                              </div>
                            </div>
                            <div className="record-status">
                              {record.isWasteful ? "無駄" : "効率的"}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="improvement-suggestions">
                    <h3>改善提案</h3>
                    <div className="suggestions-list">
                      {wasteAnalysis.improvementSuggestions.map(
                        (suggestion, index) => (
                          <div key={index} className="suggestion-item">
                            <h4>{suggestion.title}</h4>
                            <p>{suggestion.description}</p>
                            <div className="suggestion-impact">
                              期待効果:{" "}
                              {formatCurrency(
                                suggestion.potentialSavings.money || 0
                              )}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 財布の残高セクション */}
            <div className="wallet-section">
              <div className="section-header">
                <h4>💰 財布の残高</h4>
                <button
                  className="add-balance-button"
                  onClick={() => setShowUpdateWalletBalance(true)}
                >
                  + 残高を更新
                </button>
              </div>

              <div className="wallet-balance-display">
                <div className="current-balance">
                  <span className="balance-label">現在の残高</span>
                  <span className="balance-amount">
                    {formatCurrency(walletBalance?.amount || 0)}
                  </span>
                </div>
                <div className="balance-summary">
                  <div className="summary-item">
                    <span>今月の収入</span>
                    <span className="positive">
                      +{formatCurrency(walletBalanceSummary?.totalIncome || 0)}
                    </span>
                  </div>
                  <div className="summary-item">
                    <span>今月の支出</span>
                    <span className="negative">
                      -{formatCurrency(walletBalanceSummary?.totalExpense || 0)}
                    </span>
                  </div>
                  <div className="summary-item">
                    <span>純変化</span>
                    <span
                      className={
                        ((walletBalanceSummary as any)?.netChange || 0) >= 0
                          ? "positive"
                          : "negative"
                      }
                    >
                      {((walletBalanceSummary as any)?.netChange || 0) >= 0
                        ? "+"
                        : ""}
                      {formatCurrency(
                        (walletBalanceSummary as any)?.netChange || 0
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="wallet-actions">
                <button
                  className="calendar-button"
                  onClick={() => setShowWalletCalendar(true)}
                >
                  📅 カレンダー表示
                </button>
                <button
                  className="add-transaction-button"
                  onClick={() => setShowAddWalletTransaction(true)}
                >
                  + 取引を追加
                </button>
              </div>

              {/* 最近の取引 */}
              <div className="recent-transactions">
                <h5>最近の取引</h5>
                {walletTransactions.slice(0, 5).map((transaction) => (
                  <div
                    key={transaction.id}
                    className={`transaction-item ${transaction.type}`}
                  >
                    <div className="transaction-info">
                      <span className="description">
                        {transaction.description}
                      </span>
                      <span className="category">{transaction.category}</span>
                    </div>
                    <div className="transaction-amount">
                      {transaction.type === "income" ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </div>
                  </div>
                ))}
                {walletTransactions.length === 0 && (
                  <p className="no-transactions">取引履歴がありません</p>
                )}
              </div>
            </div>

            {/* 銀行口座セクション */}
            <div className="banking-section">
              <div className="section-header">
                <h4>🏦 銀行口座</h4>
                <button
                  className="add-bank-account-button"
                  onClick={() => setShowAddBankAccount(true)}
                >
                  + 口座を追加
                </button>
              </div>

              <div className="bank-accounts-grid">
                {bankAccounts.map((account) => (
                  <div key={account.id} className="bank-account-card">
                    <div className="account-header">
                      <h5>{account.bankName}</h5>
                      <span className="account-type">
                        {account.accountType}
                      </span>
                    </div>
                    <div className="account-balance">
                      <span className="balance-amount">
                        {(
                          account.currentBalance ||
                          account.balance ||
                          0
                        ).toLocaleString()}
                        円
                      </span>
                      <span className="balance-label">残高</span>
                    </div>
                    <div className="account-details">
                      <p>口座番号: {account.accountNumber}</p>
                      <p>支店名: {account.branchName}</p>
                    </div>
                    <div className="account-actions">
                      <button
                        className="update-button"
                        onClick={() => {
                          setEditingBankAccount(account);
                          setShowBankAccountUpdate(true);
                        }}
                      >
                        更新
                      </button>
                      <button
                        className="delete-button"
                        onClick={async () => {
                          if (confirm("この口座を削除しますか？")) {
                            await bankAccountManager.deleteBankAccount(
                              account.id
                            );
                            loadAllData();
                          }
                        }}
                      >
                        削除
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {bankAccounts.length === 0 && (
                <div className="empty-state">
                  <p>銀行口座が登録されていません</p>
                  <button
                    className="add-first-account-button"
                    onClick={() => setShowAddBankAccount(true)}
                  >
                    最初の口座を追加
                  </button>
                </div>
              )}
            </div>

            {/* 財務概要セクション */}
            {financialSummary && (
              <div className="financial-summary-section">
                <div className="section-header">
                  <h4>📊 財務概要</h4>
                </div>
                <div className="financial-summary">
                  <div className="summary-card">
                    <h5>総資産</h5>
                    <p className="amount positive">
                      {formatCurrency(
                        financialSummary?.overview?.totalAssets || 0
                      )}
                    </p>
                  </div>
                  <div className="summary-card">
                    <h5>総負債</h5>
                    <p className="amount negative">
                      {formatCurrency(
                        financialSummary?.overview?.totalLiabilities || 0
                      )}
                    </p>
                  </div>
                  <div className="summary-card">
                    <h5>純資産</h5>
                    <p
                      className={`amount ${
                        (financialSummary?.overview?.netWorth || 0) >= 0
                          ? "positive"
                          : "negative"
                      }`}
                    >
                      {formatCurrency(
                        financialSummary?.overview?.netWorth || 0
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 無駄遣い記録追加フォーム */}
        {showAddWasteRecord && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>無駄遣い記録を追加</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  // 記録追加処理
                  setShowAddWasteRecord(false);
                }}
              >
                <div className="form-group">
                  <label htmlFor="waste-category">カテゴリ</label>
                  <select id="waste-category" name="category" required>
                    <option value="">選択してください</option>
                    {WASTE_CATEGORIES.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="waste-description">説明</label>
                  <input
                    type="text"
                    id="waste-description"
                    name="description"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="waste-type">タイプ</label>
                  <select id="waste-type" name="type" required>
                    <option value="money">お金</option>
                    <option value="time">時間</option>
                    <option value="effort">労力</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="waste-amount">金額/時間/ポイント</label>
                  <input
                    type="number"
                    id="waste-amount"
                    name="amount"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>
                    <input type="checkbox" />
                    無駄遣いとして記録
                  </label>
                </div>
                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => setShowAddWasteRecord(false)}
                  >
                    キャンセル
                  </button>
                  <button type="submit">追加</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 無駄遣い目標追加フォーム */}
        {showAddWasteGoal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>無駄遣い目標を追加</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  // 目標追加処理
                  setShowAddWasteGoal(false);
                }}
              >
                <div className="form-group">
                  <label htmlFor="waste-goal-name">目標名</label>
                  <input type="text" id="waste-goal-name" name="name" required />
                </div>
                <div className="form-group">
                  <label htmlFor="waste-goal-target">目標値</label>
                  <input type="number" id="waste-goal-target" name="target" required />
                </div>
                <div className="form-group">
                  <label htmlFor="waste-goal-deadline">期限</label>
                  <input type="date" id="waste-goal-deadline" name="deadline" required />
                </div>
                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => setShowAddWasteGoal(false)}
                  >
                    キャンセル
                  </button>
                  <button type="submit">追加</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ファミリーマートレシート登録フォーム */}
        {showAddReceipt && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>🏪 ファミリーマートレシート登録</h3>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target as HTMLFormElement);
                  const storeName = formData.get("storeName") as string;
                  const purchaseDate = formData.get("purchaseDate") as string;
                  const totalAmount = Number(formData.get("totalAmount"));
                  const items = (formData.get("items") as string)?.split('\n').filter(item => item.trim());
                  const paymentMethod = formData.get("paymentMethod") as string;
                  const notes = formData.get("notes") as string;

                  // バリデーション
                  if (!storeName?.trim()) {
                    alert('店舗名を入力してください');
                    return;
                  }
                  if (!purchaseDate) {
                    alert('購入日を選択してください');
                    return;
                  }
                  if (!totalAmount || totalAmount <= 0) {
                    alert('合計金額を正しく入力してください');
                    return;
                  }
                  if (!items || items.length === 0) {
                    alert('商品を入力してください');
                    return;
                  }

                  try {
                    // レシート情報を無駄遣い記録として登録
                    const receiptData = {
                      categoryId: 'convenience',
                      description: `ファミリーマート ${storeName.trim()}`,
                      type: 'money' as const,
                      amount: totalAmount,
                      date: new Date(purchaseDate),
                      isWasteful: totalAmount > 1000, // 1000円以上は無駄遣いとして判定
                      items: items,
                      paymentMethod: paymentMethod,
                      notes: notes?.trim() || '',
                      storeName: storeName.trim()
                    };

                    // ここでレシートデータを保存する処理を追加
                    console.log('レシート登録:', receiptData);
                    
                    setShowAddReceipt(false);
                    alert('レシートを登録しました');
                  } catch (error) {
                    console.error('レシート登録エラー:', error);
                    alert('レシートの登録に失敗しました');
                  }
                }}
              >
                <div className="form-group">
                  <label htmlFor="receipt-store">店舗名</label>
                  <input 
                    type="text" 
                    id="receipt-store" 
                    name="storeName" 
                    placeholder="例: ファミリーマート 新宿店"
                    required 
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="receipt-date">購入日</label>
                  <input 
                    type="date" 
                    id="receipt-date" 
                    name="purchaseDate" 
                    defaultValue={new Date().toISOString().split('T')[0]}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="receipt-amount">合計金額</label>
                  <input 
                    type="number" 
                    id="receipt-amount" 
                    name="totalAmount" 
                    placeholder="例: 850"
                    required 
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="receipt-items">商品（1行に1つずつ）</label>
                  <textarea 
                    id="receipt-items" 
                    name="items" 
                    rows={5}
                    placeholder="例:&#10;おにぎり 梅&#10;コーヒー ホット&#10;チョコレート"
                    required 
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="receipt-payment">支払い方法</label>
                  <select id="receipt-payment" name="paymentMethod" required>
                    <option value="">選択してください</option>
                    <option value="cash">現金</option>
                    <option value="card">クレジットカード</option>
                    <option value="mobile">モバイル決済</option>
                    <option value="other">その他</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="receipt-notes">メモ</label>
                  <textarea 
                    id="receipt-notes" 
                    name="notes" 
                    rows={3}
                    placeholder="特記事項があれば入力してください"
                  />
                </div>
                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => setShowAddReceipt(false)}
                  >
                    キャンセル
                  </button>
                  <button type="submit">登録</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 財布の残高更新フォーム */}
        {showUpdateWalletBalance && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>財布の残高を更新</h3>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target as HTMLFormElement);
                  const amount = Number(formData.get("amount"));
                  const notes = formData.get("notes") as string;
                  const tags = (formData.get("tags") as string)
                    ?.split(",")
                    .map((tag) => tag.trim())
                    .filter((tag) => tag);

                  const success = await walletBalanceManager.saveToServer(
                    userId,
                    { amount, notes, tags },
                    "balance"
                  );
                  if (success) {
                    loadAllData();
                    setShowUpdateWalletBalance(false);
                  }
                }}
              >
                <div className="form-group">
                  <label htmlFor="wallet-amount">残高</label>
                  <input
                    type="number"
                    id="wallet-amount"
                    name="amount"
                    defaultValue={walletBalance?.amount || 0}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="wallet-notes">メモ</label>
                  <textarea
                    id="wallet-notes"
                    name="notes"
                    defaultValue={walletBalance?.notes || ""}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="wallet-tags">タグ（カンマ区切り）</label>
                  <input
                    type="text"
                    id="wallet-tags"
                    name="tags"
                    defaultValue={walletBalance?.tags?.join(", ") || ""}
                  />
                </div>
                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => setShowUpdateWalletBalance(false)}
                  >
                    キャンセル
                  </button>
                  <button type="submit">更新</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 財布の取引追加フォーム */}
        {showAddWalletTransaction && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>取引を追加</h3>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target as HTMLFormElement);
                  const type = formData.get("type") as "income" | "expense";
                  const amount = Number(formData.get("amount"));
                  const description = formData.get("description") as string;
                  const category = formData.get("category") as string;
                  const tags = (formData.get("tags") as string)
                    ?.split(",")
                    .map((tag) => tag.trim())
                    .filter((tag) => tag);

                  const success = await walletBalanceManager.saveToServer(
                    userId,
                    {
                      type,
                      amount,
                      description,
                      category,
                      tags,
                      date: new Date().toISOString(),
                    },
                    "transaction"
                  );
                  if (success) {
                    loadAllData();
                    setShowAddWalletTransaction(false);
                  }
                }}
              >
                <div className="form-group">
                  <label htmlFor="type">取引タイプ</label>
                  <select id="type" name="type" required>
                    <option value="income">収入</option>
                    <option value="expense">支出</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="amount">金額</label>
                  <input type="number" id="amount" name="amount" required />
                </div>
                <div className="form-group">
                  <label htmlFor="description">説明</label>
                  <input
                    type="text"
                    id="description"
                    name="description"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="category">カテゴリ</label>
                  <select id="category" name="category" required>
                    <option value="">選択してください</option>
                    {WALLET_CATEGORIES.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="tags">タグ（カンマ区切り）</label>
                  <input type="text" id="tags" name="tags" />
                </div>
                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => setShowAddWalletTransaction(false)}
                  >
                    キャンセル
                  </button>
                  <button type="submit">追加</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 銀行口座追加フォーム */}
        {showAddBankAccount && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>銀行口座を追加</h3>
               <form
                 onSubmit={async (e) => {
                   e.preventDefault();
                   const formData = new FormData(e.target as HTMLFormElement);
                   const bankName = formData.get("bankName") as string;
                   const accountType = formData.get("accountType") as string;
                   const accountNumber = formData.get("accountNumber") as string;
                   const accountHolderName = formData.get("accountHolderName") as string;
                   const branchName = formData.get("branchName") as string;
                   const balance = formData.get("balance") as string;
                   const notes = formData.get("notes") as string;

                   // 必須フィールドのバリデーション
                   if (!bankName?.trim()) {
                     alert('銀行名を入力してください');
                     return;
                   }
                   if (!accountType) {
                     alert('口座種別を選択してください');
                     return;
                   }
                   if (!accountNumber?.trim()) {
                     alert('口座番号を入力してください');
                     return;
                   }
                   if (!accountHolderName?.trim()) {
                     alert('口座名義人を入力してください');
                     return;
                   }
                   if (!branchName?.trim()) {
                     alert('支店名を入力してください');
                     return;
                   }

                   const accountData = {
                     bankName: bankName.trim(),
                     accountType: accountType as "普通" | "当座" | "貯蓄" | "定期",
                     accountNumber: accountNumber.trim(),
                     accountHolderName: accountHolderName.trim(),
                     branchName: branchName.trim(),
                     currentBalance: Number(balance) || 0,
                     notes: notes?.trim() || '',
                   };
                   
                   try {
                     await bankAccountManager.createBankAccount(userId, accountData);
                     loadAllData();
                     setShowAddBankAccount(false);
                   } catch (error) {
                     console.error('銀行口座作成エラー:', error);
                     alert('銀行口座の作成に失敗しました');
                   }
                 }}
               >
                <div className="form-group">
                  <label htmlFor="bankName">銀行名</label>
                  <input type="text" id="bankName" name="bankName" required />
                </div>
                <div className="form-group">
                  <label htmlFor="accountType">口座種別</label>
                  <select id="accountType" name="accountType" required>
                    <option value="普通">普通預金</option>
                    <option value="当座">当座預金</option>
                    <option value="定期">定期預金</option>
                    <option value="貯蓄">貯蓄預金</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="accountNumber">口座番号</label>
                  <input
                    type="text"
                    id="accountNumber"
                    name="accountNumber"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="accountHolderName">口座名義人</label>
                  <input
                    type="text"
                    id="accountHolderName"
                    name="accountHolderName"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="branchName">支店名</label>
                  <input
                    type="text"
                    id="branchName"
                    name="branchName"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="balance">残高</label>
                  <input
                    type="number"
                    id="balance"
                    name="balance"
                    defaultValue={0}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="notes">メモ</label>
                  <textarea id="notes" name="notes" />
                </div>
                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => setShowAddBankAccount(false)}
                  >
                    キャンセル
                  </button>
                  <button type="submit">追加</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 銀行口座更新フォーム */}
        {showBankAccountUpdate && editingBankAccount && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>銀行口座を更新</h3>
               <form
                 onSubmit={async (e) => {
                   e.preventDefault();
                   const formData = new FormData(e.target as HTMLFormElement);
                   const bankName = formData.get("bankName") as string;
                   const accountType = formData.get("accountType") as string;
                   const accountNumber = formData.get("accountNumber") as string;
                   const accountHolderName = formData.get("accountHolderName") as string;
                   const branchName = formData.get("branchName") as string;
                   const balance = formData.get("balance") as string;
                   const notes = formData.get("notes") as string;

                   // 必須フィールドのバリデーション
                   if (!bankName?.trim()) {
                     alert('銀行名を入力してください');
                     return;
                   }
                   if (!accountType) {
                     alert('口座種別を選択してください');
                     return;
                   }
                   if (!accountNumber?.trim()) {
                     alert('口座番号を入力してください');
                     return;
                   }
                   if (!accountHolderName?.trim()) {
                     alert('口座名義人を入力してください');
                     return;
                   }
                   if (!branchName?.trim()) {
                     alert('支店名を入力してください');
                     return;
                   }

                   const accountData = {
                     bankName: bankName.trim(),
                     accountType: accountType as "普通" | "当座" | "貯蓄" | "定期",
                     accountNumber: accountNumber.trim(),
                     accountHolderName: accountHolderName.trim(),
                     branchName: branchName.trim(),
                     currentBalance: Number(balance) || 0,
                     notes: notes?.trim() || '',
                   };
                   
                   try {
                     await bankAccountManager.updateBankAccount(editingBankAccount.id, accountData);
                     loadAllData();
                     setShowBankAccountUpdate(false);
                     setEditingBankAccount(null);
                   } catch (error) {
                     console.error('銀行口座更新エラー:', error);
                     alert('銀行口座の更新に失敗しました');
                   }
                 }}
               >
                <div className="form-group">
                  <label htmlFor="update-bankName">銀行名</label>
                  <input
                    type="text"
                    id="update-bankName"
                    name="bankName"
                    defaultValue={editingBankAccount.bankName}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="update-accountType">口座種別</label>
                  <select
                    id="update-accountType"
                    name="accountType"
                    defaultValue={editingBankAccount.accountType}
                    required
                  >
                    <option value="普通">普通預金</option>
                    <option value="当座">当座預金</option>
                    <option value="定期">定期預金</option>
                    <option value="貯蓄">貯蓄預金</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="update-accountNumber">口座番号</label>
                  <input
                    type="text"
                    id="update-accountNumber"
                    name="accountNumber"
                    defaultValue={editingBankAccount.accountNumber}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="update-accountHolderName">口座名義人</label>
                  <input
                    type="text"
                    id="update-accountHolderName"
                    name="accountHolderName"
                    defaultValue={editingBankAccount.accountHolderName || ""}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="update-branchName">支店名</label>
                  <input
                    type="text"
                    id="update-branchName"
                    name="branchName"
                    defaultValue={editingBankAccount.branchName}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="update-balance">残高</label>
                  <input
                    type="number"
                    id="update-balance"
                    name="balance"
                    defaultValue={
                      editingBankAccount.currentBalance ||
                      editingBankAccount.balance ||
                      0
                    }
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="update-notes">メモ</label>
                  <textarea
                    id="update-notes"
                    name="notes"
                    defaultValue={editingBankAccount.notes || ""}
                  />
                </div>
                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => {
                      setShowBankAccountUpdate(false);
                      setEditingBankAccount(null);
                    }}
                  >
                    キャンセル
                  </button>
                  <button type="submit">更新</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 金融残高カレンダー */}
        {showWalletCalendar && (
          <>
            {console.log("Passing bank accounts to calendar:", bankAccounts)}
            <WalletBalanceCalendar
              userId={userId}
              onClose={() => setShowWalletCalendar(false)}
              initialBalance={walletBalance?.amount || 0}
              transactions={walletTransactions}
              bankAccounts={bankAccounts}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default ComprehensiveDashboard;
