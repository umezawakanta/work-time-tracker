import React, { useState } from 'react';
import './SelfAnalysisComponent.css';
import type { Habit, Goal, LearningRecord, MoodLog } from '../types';
import HetamaIconComponent from './HetamaIconComponent';

interface PersonalProfile {
  values: string[];
  goals: string[];
  skills: string[];
  interests: string[];
  strengths: string[];
  weaknesses: string[];
  personality: string;
  lifestyle: string;
  workStyle: string;
  learningStyle: string;
  motivation: string;
  challenges: string[];
  achievements: string[];
  futureVision: string;
  notes: string;
}

interface SelfAnalysisComponentProps {
  showSelfAnalysis: boolean;
  setShowSelfAnalysis: (show: boolean) => void;
  selfAnalysisTab: string;
  setSelfAnalysisTab: (tab: string) => void;
  personalProfile: PersonalProfile;
  setPersonalProfile: React.Dispatch<React.SetStateAction<PersonalProfile>>;
  habits: Habit[];
  setHabits: React.Dispatch<React.SetStateAction<Habit[]>>;
  habitHistory: { [habitId: string]: string[] };
  setHabitHistory: React.Dispatch<React.SetStateAction<{ [habitId: string]: string[] }>>;
  habitStreak: { [habitId: string]: number };
  setHabitStreak: React.Dispatch<React.SetStateAction<{ [habitId: string]: number }>>;
  moodLogs: any[];
  setMoodLogs: React.Dispatch<React.SetStateAction<any[]>>;
  goals: Goal[];
  setGoals: (goals: Goal[]) => void;
  learningRecords: LearningRecord[];
  setLearningRecords: React.Dispatch<React.SetStateAction<LearningRecord[]>>;
  timeEntries: any[];
  calculateTimeBreakdown: () => { [key: string]: number };
  calculateProductivityTrend: () => Array<{date: string, workHours: number, dayOfWeek: string}>;
  calculateProductivityStats: () => {averageHours: number, maxHours: number, totalHours: number, productiveDays: number, productivityRate: number};
  loadTimeEntries: () => void;
  closeOtherFeatures: (activeFeature: string) => void;
}

const SelfAnalysisComponent: React.FC<SelfAnalysisComponentProps> = ({
  showSelfAnalysis,
  setShowSelfAnalysis,
  selfAnalysisTab,
  setSelfAnalysisTab,
  personalProfile,
  setPersonalProfile,
  habits,
  setHabits,
  habitHistory,
  setHabitHistory,
  habitStreak,
  setHabitStreak,
  moodLogs,
  setMoodLogs,
  goals,
  setGoals,
  learningRecords,
  setLearningRecords,
  timeEntries,
  calculateTimeBreakdown,
  calculateProductivityTrend,
  calculateProductivityStats,
  loadTimeEntries,
  closeOtherFeatures,
}) => {
  // 内部状態
  const [editingProfile, setEditingProfile] = useState(false);
  const [newValue, setNewValue] = useState("");
  const [newGoal, setNewGoal] = useState("");
  const [newSkill, setNewSkill] = useState("");
  const [newInterest, setNewInterest] = useState("");
  const [newStrength, setNewStrength] = useState("");
  const [newWeakness, setNewWeakness] = useState("");
  const [newPersonality, setNewPersonality] = useState("");
  const [newHabit, setNewHabit] = useState("");
  const [moodForm, setMoodForm] = useState({
    date: new Date().toISOString().split("T")[0],
    mood: 5,
    energy: 5,
    stress: 5,
    activities: [] as string[],
    notes: "",
  });
  const [newActivity, setNewActivity] = useState("");
  const [editingMoodLog, setEditingMoodLog] = useState<MoodLog | null>(null);
  const [goalForm, setGoalForm] = useState({
    title: "",
    description: "",
    category: "personal",
    priority: "medium",
    status: "not-started",
    milestones: [] as Array<{ id: string; title: string; description: string; completed: boolean }>,
  });
  const [newMilestone, setNewMilestone] = useState("");
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  // プロフィール管理関数
  const addToProfile = (field: keyof PersonalProfile, value: string) => {
    if (!value.trim()) {
      return;
    }
    setPersonalProfile((prev) => ({
      ...prev,
      [field]: [...(prev[field] as string[]), value.trim()],
    }));
  };

  const removeFromProfile = (field: keyof PersonalProfile, index: number) => {
    setPersonalProfile((prev) => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index),
    }));
  };

  // 習慣管理関数
  const addHabit = () => {
    if (!newHabit.trim()) {
      return;
    }
    const habitId = Date.now().toString();
    const newHabitObj: Habit = {
      id: habitId,
      name: newHabit.trim(),
      description: "",
      category: "personal",
      frequency: "daily",
      targetDays: 7,
      completedDays: 0,
      streak: 0,
      bestStreak: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setHabits((prev) => [...prev, newHabitObj]);
    setNewHabit("");
  };

  const updateHabit = (habitId: string, updates: Partial<Habit>) => {
    setHabits((prev) =>
      prev.map((habit) =>
        habit.id === habitId
          ? { ...habit, ...updates, updatedAt: new Date().toISOString() }
          : habit
      )
    );
  };

  const deleteHabit = (habitId: string) => {
    setHabits((prev) => prev.filter((habit) => habit.id !== habitId));
    setHabitStreak((prev) => {
      const newStreak = { ...prev };
      delete newStreak[habitId];
      return newStreak;
    });
  };

  const toggleHabitCompletion = (habitId: string, date: string) => {
    const history = habitHistory[habitId] || [];
    const isCompleted = history.includes(date);

    if (isCompleted) {
      setHabitHistory((prev) => ({
        ...prev,
        [habitId]: history.filter((d) => d !== date),
      }));
    } else {
      setHabitHistory((prev) => ({
        ...prev,
        [habitId]: [...history, date],
      }));
    }
  };

  const getHabitCompletionRate = (habitId: string) => {
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) {
      return 0;
    }

    const history = habitHistory[habitId] || [];
    const daysSinceStart = Math.ceil(
      (Date.now() - new Date(habit.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSinceStart > 0 ? (history.length / daysSinceStart) * 100 : 0;
  };

  // 気分ログ管理関数
  const addMoodLog = () => {
    if (!moodForm.date) return;
    const moodLogId = Date.now().toString();
    const newMoodLog: MoodLog = {
      id: moodLogId,
      date: moodForm.date,
      mood: moodForm.mood,
      energy: moodForm.energy,
      stress: moodForm.stress,
      activities: moodForm.activities,
      notes: moodForm.notes,
      weather: '',
      sleep: 0,
      createdAt: new Date().toISOString(),
    };
    setMoodLogs((prev) => [...prev, newMoodLog]);
    resetMoodForm();
  };

  const updateMoodLog = (moodLogId: string, updates: Partial<MoodLog>) => {
    setMoodLogs((prev) =>
      prev.map((log) => (log.id === moodLogId ? { ...log, ...updates } : log))
    );
  };

  const deleteMoodLog = (moodLogId: string) => {
    setMoodLogs((prev) => prev.filter((log) => log.id !== moodLogId));
  };

  const resetMoodForm = () => {
    setMoodForm({
      date: new Date().toISOString().split("T")[0],
      mood: 5,
      energy: 5,
      stress: 5,
      activities: [],
      notes: "",
    });
    setEditingMoodLog(null);
  };

  const addActivity = () => {
    if (!newActivity.trim()) return;
    setMoodForm((prev) => ({
      ...prev,
      activities: [...prev.activities, newActivity.trim()],
    }));
    setNewActivity("");
  };

  const removeActivity = (index: number) => {
    setMoodForm((prev) => ({
      ...prev,
      activities: prev.activities.filter((_, i) => i !== index),
    }));
  };

  const editMoodLog = (log: MoodLog) => {
    setMoodForm({
      date: log.date,
      mood: log.mood,
      energy: log.energy,
      stress: log.stress,
      activities: log.activities,
      notes: log.notes,
    });
    setEditingMoodLog(log);
  };

  const saveMoodLog = () => {
    if (editingMoodLog) {
      updateMoodLog(editingMoodLog.id, {
        date: moodForm.date,
        mood: moodForm.mood,
        energy: moodForm.energy,
        stress: moodForm.stress,
        activities: moodForm.activities,
        notes: moodForm.notes,
      });
    } else {
      addMoodLog();
    }
  };

  const getMoodEmoji = (mood: number) => {
    if (mood <= 2) return "😢";
    if (mood <= 4) return "😔";
    if (mood <= 6) return "😐";
    if (mood <= 8) return "😊";
    return "😄";
  };

  const getAverageMood = () => {
    if (moodLogs.length === 0) return 0;
    return moodLogs.reduce((sum, log) => sum + (log.mood || 0), 0) / moodLogs.length;
  };

  // 目標管理関数
  const addGoal = () => {
    if (!goalForm.title.trim()) return;
    const goalId = Date.now().toString();
    const newGoal: Goal = {
      id: goalId,
      title: goalForm.title.trim(),
      description: goalForm.description.trim(),
      category: goalForm.category,
      priority: goalForm.priority as "high" | "medium" | "low",
      status: goalForm.status as "not-started" | "in-progress" | "completed" | "paused",
      milestones: goalForm.milestones,
      startDate: new Date().toISOString().split('T')[0],
      targetDate: '',
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setGoals([...goals, newGoal]);
    resetGoalForm();
  };

  const updateGoal = (goalId: string, updates: Partial<Goal>) => {
    const updatedGoals = goals.map((goal) =>
      goal.id === goalId
        ? { ...goal, ...updates, updatedAt: new Date().toISOString() }
        : goal
    );
    setGoals(updatedGoals);
  };

  const deleteGoal = (goalId: string) => {
    const updatedGoals = goals.filter((goal) => goal.id !== goalId);
    setGoals(updatedGoals);
  };

  const addLearningRecord = (record: Omit<LearningRecord, "id">) => {
    const newRecord = {
      ...record,
      id: Date.now().toString(),
    };
    setLearningRecords((prev) => [...prev, newRecord]);
  };

  const updateLearningRecord = (recordId: string, updates: Partial<LearningRecord>) => {
    setLearningRecords((prev) =>
      prev.map((r) => (r.id === recordId ? { ...r, ...updates } : r))
    );
  };

  const deleteLearningRecord = (recordId: string) => {
    setLearningRecords((prev) => prev.filter((r) => r.id !== recordId));
  };

  const resetGoalForm = () => {
    setGoalForm({
      title: "",
      description: "",
      category: "personal",
      priority: "medium",
      status: "not-started",
      milestones: [],
    });
    setEditingGoal(null);
  };

  const addMilestone = () => {
    if (!newMilestone.trim()) return;
    const milestoneId = Date.now().toString();
    setGoalForm((prev) => ({
      ...prev,
      milestones: [
        ...prev.milestones,
        { id: milestoneId, title: newMilestone.trim(), description: "", completed: false },
      ],
    }));
    setNewMilestone("");
  };

  const removeMilestone = (milestoneId: string) => {
    setGoalForm((prev) => ({
      ...prev,
      milestones: prev.milestones.filter((m) => m.id !== milestoneId),
    }));
  };

  const toggleMilestone = (milestoneId: string) => {
    setGoalForm((prev) => ({
      ...prev,
      milestones: prev.milestones.map((m) =>
        m.id === milestoneId ? { ...m, completed: !m.completed } : m
      ),
    }));
  };

  const editGoal = (goal: Goal) => {
    setGoalForm({
      title: goal.title,
      description: goal.description,
      category: goal.category,
      priority: goal.priority,
      status: goal.status,
      milestones: goal.milestones,
    });
    setEditingGoal(goal);
  };

  const saveGoal = () => {
    if (editingGoal) {
      updateGoal(editingGoal.id, {
        title: goalForm.title,
        description: goalForm.description,
        category: goalForm.category,
        priority: goalForm.priority as "high" | "medium" | "low",
        status: goalForm.status as "not-started" | "in-progress" | "completed" | "paused",
        milestones: goalForm.milestones,
      });
    } else {
      addGoal();
    }
  };

  const getGoalStatusColor = (status: string) => {
    switch (status) {
      case "not-started":
        return "#666";
      case "in-progress":
        return "#ff9800";
      case "completed":
        return "#4caf50";
      case "cancelled":
        return "#f44336";
      default:
        return "#666";
    }
  };

  const getGoalStatusText = (status: string) => {
    switch (status) {
      case "not-started":
        return "未開始";
      case "in-progress":
        return "進行中";
      case "completed":
        return "完了";
      case "cancelled":
        return "キャンセル";
      default:
        return "不明";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "#4caf50";
      case "medium":
        return "#ff9800";
      case "high":
        return "#f44336";
      default:
        return "#666";
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "low":
        return "低";
      case "medium":
        return "中";
      case "high":
        return "高";
      default:
        return "不明";
    }
  };
  const today = new Date().toISOString().split('T')[0];
  
  return (
    <div className="self-analysis-section">
      <div className="section-header">
        <h2>
          <span className="section-icon">
            <HetamaIconComponent featureId="self-analysis" size="large" />
          </span>
          じぶん図鑑
        </h2>
        <div className="section-controls">
          {showSelfAnalysis ? (
            <button 
              onClick={() => setShowSelfAnalysis(false)}
              className="close-section-button"
              title="セクションを閉じる"
            >
              ✕
            </button>
          ) : (
            <button 
              onClick={() => {
                closeOtherFeatures('self-analysis');
                setShowSelfAnalysis(true);
              }}
              className="show-section-button"
              title="セクションを表示"
            >
              ▶️
            </button>
          )}
        </div>
      </div>

      {showSelfAnalysis && (
        <div className="self-analysis-content">
          <div className="self-analysis-header">
            <button 
              onClick={() => {
                // 時間記録データを更新
                loadTimeEntries();
                // じぶん図鑑のデータは主にローカルストレージに保存されているため、
                // ページをリロードしてデータを再読み込み
                window.location.reload();
              }}
              className="refresh-button"
              title="じぶん図鑑を更新"
            >
              🔄
            </button>
          </div>
          <div className="analysis-tabs">
            <button 
              className={`tab-button ${selfAnalysisTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setSelfAnalysisTab('dashboard')}
            >
              📊 分析ダッシュボード
            </button>
            <button 
              className={`tab-button ${selfAnalysisTab === 'profile' ? 'active' : ''}`}
              onClick={() => setSelfAnalysisTab('profile')}
            >
              👤 プロフィール
            </button>
            <button 
              className={`tab-button ${selfAnalysisTab === 'habits' ? 'active' : ''}`}
              onClick={() => setSelfAnalysisTab('habits')}
            >
              📈 習慣トラッカー
            </button>
            <button 
              className={`tab-button ${selfAnalysisTab === 'mood' ? 'active' : ''}`}
              onClick={() => setSelfAnalysisTab('mood')}
            >
              😊 感情ログ
            </button>
            <button 
              className={`tab-button ${selfAnalysisTab === 'goals' ? 'active' : ''}`}
              onClick={() => setSelfAnalysisTab('goals')}
            >
              🎯 目標管理
            </button>
            <button 
              className={`tab-button ${selfAnalysisTab === 'learning' ? 'active' : ''}`}
              onClick={() => setSelfAnalysisTab('learning')}
            >
              📚 学習記録
            </button>
          </div>

          {selfAnalysisTab === 'dashboard' && (
            <div className="analysis-dashboard">
              <div className="dashboard-grid">
                <div className="analysis-card">
                  <h3>📊 時間の使い方分析</h3>
                  <div className="analysis-content">
                    <div className="time-breakdown">
                      {(() => {
                        const timeBreakdown = calculateTimeBreakdown();
                        const totalHours = Object.values(timeBreakdown).length > 0 
                          ? Object.values(timeBreakdown).reduce((sum, hours) => sum + hours, 0)
                          : 0;
                        
                        if (totalHours === 0) {
                          return (
                            <div className="no-data-message">
                              <p>📝 今日の時間記録がありません</p>
                              <p>時間記録機能を使って作業時間を記録してみましょう！</p>
                            </div>
                          );
                        }
                        
                        return Object.entries(timeBreakdown).map(([category, hours]) => {
                          const percentage = totalHours > 0 ? (hours / totalHours) * 100 : 0;
                          return (
                            <div key={category} className="time-category">
                              <span className="category-label">{category}</span>
                              <div className="progress-bar">
                                <div 
                                  className="progress-fill" 
                                  style={{'--percentage': `${percentage}%`} as React.CSSProperties}
                                ></div>
                              </div>
                              <span className="time-value">{hours.toFixed(1)}h</span>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                </div>

                <div className="analysis-card">
                  <h3>📈 生産性トレンド</h3>
                  <div className="analysis-content">
                    <div className="productivity-chart">
                      {(() => {
                        const productivityData = calculateProductivityTrend();
                        const stats = calculateProductivityStats();
                        
                        if (stats.totalHours === 0) {
                          return (
                            <div className="no-data-message">
                              <p>📝 過去7日間の作業記録がありません</p>
                              <p>時間記録機能を使って作業時間を記録してみましょう！</p>
                            </div>
                          );
                        }
                        
                        return (
                          <>
                            <div className="productivity-graph">
                              <div className="graph-container">
                                {productivityData.map((day, index) => {
                                  const maxHours = Math.max(...productivityData.map(d => d.workHours));
                                  const height = maxHours > 0 ? (day.workHours / maxHours) * 100 : 0;
                                  
                                  return (
                                    <div key={day.date} className="graph-bar">
                                      <div 
                                        className="bar-fill"
                                        style={{'--bar-height': `${height}%`} as React.CSSProperties}
                                        title={`${day.dayOfWeek} ${day.workHours.toFixed(1)}h`}
                                      ></div>
                                      <div className="bar-label">{day.dayOfWeek}</div>
                                      <div className="bar-value">{day.workHours > 0 ? `${day.workHours.toFixed(1)}h` : ''}</div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                            <div className="productivity-stats">
                              <div className="stat">
                                <span className="stat-label">平均作業時間</span>
                                <span className="stat-value">{stats.averageHours.toFixed(1)}h</span>
                              </div>
                              <div className="stat">
                                <span className="stat-label">最高記録</span>
                                <span className="stat-value">{stats.maxHours.toFixed(1)}h</span>
                              </div>
                              <div className="stat">
                                <span className="stat-label">生産性日数</span>
                                <span className="stat-value">{stats.productiveDays}/7日</span>
                              </div>
                              <div className="stat">
                                <span className="stat-label">生産性率</span>
                                <span className="stat-value">{stats.productivityRate.toFixed(0)}%</span>
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                <div className="analysis-card">
                  <h3>🎯 目標達成率</h3>
                  <div className="analysis-content">
                    <div className="goals-overview">
                      <div className="goal-progress">
                        <span className="goal-label">今月の目標</span>
                        <div className="circular-progress">
                          <div className="progress-circle">
                            <span className="progress-text">75%</span>
                          </div>
                        </div>
                      </div>
                      <div className="goals-list">
                        <div className="goal-item completed">
                          ✅ 毎日読書する
                        </div>
                        <div className="goal-item in-progress">
                          🔄 新しいスキルを学ぶ
                        </div>
                        <div className="goal-item pending">
                          ⏳ 運動習慣をつける
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="analysis-card">
                  <h3>😊 感情・体調分析</h3>
                  <div className="analysis-content">
                    <div className="mood-overview">
                      <div className="mood-average">
                        <span className="mood-label">平均気分</span>
                        <div className="mood-scale">
                          <div className="mood-indicator" style={{'--indicator-position': '70%'} as React.CSSProperties}>😊</div>
                          <div className="scale-line"></div>
                        </div>
                        <span className="mood-value">7.2/10</span>
                      </div>
                      <div className="mood-factors">
                        <div className="factor">
                          <span className="factor-label">睡眠</span>
                          <span className="factor-value">7.5h</span>
                        </div>
                        <div className="factor">
                          <span className="factor-label">ストレス</span>
                          <span className="factor-value">3.2/10</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="analysis-card">
                  <h3>📚 学習・成長記録</h3>
                  <div className="analysis-content">
                    <div className="learning-stats">
                      <div className="learning-summary">
                        <div className="summary-item">
                          <span className="summary-label">今月の学習時間</span>
                          <span className="summary-value">24.5h</span>
                        </div>
                        <div className="summary-item">
                          <span className="summary-label">完了したコース</span>
                          <span className="summary-value">3</span>
                        </div>
                        <div className="summary-item">
                          <span className="summary-label">読んだ本</span>
                          <span className="summary-value">2冊</span>
                        </div>
                      </div>
                      <div className="recent-learning">
                        <h4>最近の学習</h4>
                        <div className="learning-item">
                          📖 React開発の基礎
                        </div>
                        <div className="learning-item">
                          🎥 TypeScript入門
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="analysis-card">
                  <h3>💡 おすすめアクション</h3>
                  <div className="analysis-content">
                    <div className="recommendations">
                      <div className="recommendation-item">
                        <div className="recommendation-icon">⏰</div>
                        <div className="recommendation-text">
                          <strong>集中時間を増やしましょう</strong>
                          <p>午前中の集中力が高い傾向があります。重要なタスクを午前に配置することをお勧めします。</p>
                        </div>
                      </div>
                      <div className="recommendation-item">
                        <div className="recommendation-icon">😴</div>
                        <div className="recommendation-text">
                          <strong>睡眠パターンを改善</strong>
                          <p>睡眠時間が少ない日は生産性が下がる傾向があります。7-8時間の睡眠を心がけましょう。</p>
                        </div>
                      </div>
                      <div className="recommendation-item">
                        <div className="recommendation-icon">🎯</div>
                        <div className="recommendation-text">
                          <strong>小さな目標を設定</strong>
                          <p>大きな目標を小さなステップに分けることで、達成感を得やすくなります。</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selfAnalysisTab === 'profile' && (
            <div className="profile-content">
              <div className="profile-header">
                <h3>👤 パーソナルプロフィール</h3>
                <button 
                  className="edit-profile-button"
                  onClick={() => setEditingProfile(!editingProfile)}
                >
                  {editingProfile ? '保存' : '編集'}
                </button>
              </div>

              <div className="profile-sections">
                {/* 価値観 */}
                <div className="profile-section">
                  <h4>💎 価値観</h4>
                  <div className="profile-items">
                    {personalProfile.values.map((value, index) => (
                      <div key={index} className="profile-item">
                        <span>{value}</span>
                        {editingProfile && (
                          <button 
                            className="remove-item-button"
                            onClick={() => removeFromProfile('values', index)}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    {editingProfile && (
                      <div className="add-item-form">
                        <input
                          type="text"
                          value={newValue}
                          onChange={(e) => setNewValue(e.target.value)}
                          placeholder="価値観を追加..."
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              addToProfile('values', newValue);
                              setNewValue('');
                            }
                          }}
                        />
                        <button 
                          onClick={() => {
                            addToProfile('values', newValue);
                            setNewValue('');
                          }}
                          className="add-item-button"
                        >
                          追加
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* 目標 */}
                <div className="profile-section">
                  <h4>🎯 目標</h4>
                  <div className="profile-items">
                    {personalProfile.goals.map((goal, index) => (
                      <div key={index} className="profile-item">
                        <span>{goal}</span>
                        {editingProfile && (
                          <button 
                            className="remove-item-button"
                            onClick={() => removeFromProfile('goals', index)}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    {editingProfile && (
                      <div className="add-item-form">
                        <input
                          type="text"
                          value={newGoal}
                          onChange={(e) => setNewGoal(e.target.value)}
                          placeholder="目標を追加..."
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              addToProfile('goals', newGoal);
                              setNewGoal('');
                            }
                          }}
                        />
                        <button 
                          onClick={() => {
                            addToProfile('goals', newGoal);
                            setNewGoal('');
                          }}
                          className="add-item-button"
                        >
                          追加
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* スキル */}
                <div className="profile-section">
                  <h4>🛠️ スキル</h4>
                  <div className="profile-items">
                    {personalProfile.skills.map((skill, index) => (
                      <div key={index} className="profile-item">
                        <span>{skill}</span>
                        {editingProfile && (
                          <button 
                            className="remove-item-button"
                            onClick={() => removeFromProfile('skills', index)}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    {editingProfile && (
                      <div className="add-item-form">
                        <input
                          type="text"
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          placeholder="スキルを追加..."
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              addToProfile('skills', newSkill);
                              setNewSkill('');
                            }
                          }}
                        />
                        <button 
                          onClick={() => {
                            addToProfile('skills', newSkill);
                            setNewSkill('');
                          }}
                          className="add-item-button"
                        >
                          追加
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* 興味・関心 */}
                <div className="profile-section">
                  <h4>🌟 興味・関心</h4>
                  <div className="profile-items">
                    {personalProfile.interests.map((interest, index) => (
                      <div key={index} className="profile-item">
                        <span>{interest}</span>
                        {editingProfile && (
                          <button 
                            className="remove-item-button"
                            onClick={() => removeFromProfile('interests', index)}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    {editingProfile && (
                      <div className="add-item-form">
                        <input
                          type="text"
                          value={newInterest}
                          onChange={(e) => setNewInterest(e.target.value)}
                          placeholder="興味・関心を追加..."
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              addToProfile('interests', newInterest);
                              setNewInterest('');
                            }
                          }}
                        />
                        <button 
                          onClick={() => {
                            addToProfile('interests', newInterest);
                            setNewInterest('');
                          }}
                          className="add-item-button"
                        >
                          追加
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* 強み */}
                <div className="profile-section">
                  <h4>💪 強み</h4>
                  <div className="profile-items">
                    {personalProfile.strengths.map((strength, index) => (
                      <div key={index} className="profile-item">
                        <span>{strength}</span>
                        {editingProfile && (
                          <button 
                            className="remove-item-button"
                            onClick={() => removeFromProfile('strengths', index)}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    {editingProfile && (
                      <div className="add-item-form">
                        <input
                          type="text"
                          value={newStrength}
                          onChange={(e) => setNewStrength(e.target.value)}
                          placeholder="強みを追加..."
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              addToProfile('strengths', newStrength);
                              setNewStrength('');
                            }
                          }}
                        />
                        <button 
                          onClick={() => {
                            addToProfile('strengths', newStrength);
                            setNewStrength('');
                          }}
                          className="add-item-button"
                        >
                          追加
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* 改善点 */}
                <div className="profile-section">
                  <h4>🔧 改善点</h4>
                  <div className="profile-items">
                    {personalProfile.weaknesses.map((weakness, index) => (
                      <div key={index} className="profile-item">
                        <span>{weakness}</span>
                        {editingProfile && (
                          <button 
                            className="remove-item-button"
                            onClick={() => removeFromProfile('weaknesses', index)}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    {editingProfile && (
                      <div className="add-item-form">
                        <input
                          type="text"
                          value={newWeakness}
                          onChange={(e) => setNewWeakness(e.target.value)}
                          placeholder="改善点を追加..."
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              addToProfile('weaknesses', newWeakness);
                              setNewWeakness('');
                            }
                          }}
                        />
                        <button 
                          onClick={() => {
                            addToProfile('weaknesses', newWeakness);
                            setNewWeakness('');
                          }}
                          className="add-item-button"
                        >
                          追加
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* 性格・特徴 */}
                <div className="profile-section">
                  <h4>🧠 性格・特徴</h4>
                  <div className="profile-personality">
                    {editingProfile ? (
                      <textarea
                        value={personalProfile.personality}
                        onChange={(e) => setNewPersonality(e.target.value)}
                        placeholder="あなたの性格や特徴を自由に記述してください..."
                        className="personality-textarea"
                      />
                    ) : (
                      <p className="personality-text">
                        {personalProfile.personality || 'まだ記述されていません。編集ボタンから自由に記述してください。'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {selfAnalysisTab === 'habits' && (
            <div className="habits-content">
              <div className="habits-header">
                <h3>📈 習慣トラッカー</h3>
                <button 
                  className="add-habit-button"
                  onClick={() => {
                    addHabit();
                  }}
                >
                  + 新しい習慣
                </button>
              </div>

              <div className="habits-list">
                {habits.length === 0 ? (
                  <div className="empty-state">
                    <p>まだ習慣が登録されていません</p>
                    <p>「+ 新しい習慣」ボタンから習慣を追加してください</p>
                  </div>
                ) : (
                  <div className="habits-grid">
                    {habits.map(habit => (
                      <div key={habit.id} className="habit-card">
                        <div className="habit-header">
                          <h4 className="habit-name">{habit.name}</h4>
                          <button 
                            className="delete-habit-button"
                            onClick={() => deleteHabit(habit.id)}
                          >
                            ✕
                          </button>
                        </div>
                        
                        {habit.description && (
                          <p className="habit-description">{habit.description}</p>
                        )}

                        <div className="habit-frequency">
                          <span className="frequency-label">頻度:</span>
                          <span className="frequency-value">
                            {habit.frequency === 'daily' && '毎日'}
                            {habit.frequency === 'weekly' && '毎週'}
                            {habit.frequency === 'monthly' && '毎月'}
                          </span>
                          <span className="frequency-target">
                            {habit.targetDays}日
                          </span>
                        </div>

                        <div className="habit-today">
                          <div className="today-header">
                            <span className="today-label">今日の進捗</span>
                            <span className="today-date">{today}</span>
                          </div>
                          <div className="today-progress">
                                      <button 
                                        className={`completion-button ${habitHistory[habit.id]?.includes(today) ? 'completed' : ''}`}
                                        onClick={() => toggleHabitCompletion(habit.id, today)}
                                      >
                                        {habitHistory[habit.id]?.includes(today) ? '✅' : '⭕'}
                                      </button>
                                      <span className="today-status">
                                        {habitHistory[habit.id]?.includes(today) ? '完了' : '未完了'}
                                      </span>
                          </div>
                        </div>

                        <div className="habit-stats">
                          <div className="stat-item">
                            <span className="stat-label">連続日数</span>
                            <span className="stat-value">
                            {(() => {
                              let streak = 0;
                              const today = new Date();
                              const history = habitHistory[habit.id] || [];
                              for (let i = 0; i < 365; i++) {
                                const checkDate = new Date(today);
                                checkDate.setDate(checkDate.getDate() - i);
                                const dateStr = checkDate.toISOString().split('T')[0];
                                if (history.includes(dateStr)) {
                                  streak++;
                                } else {
                                  break;
                                }
                              }
                              return streak;
                            })()}日
                            </span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-label">完了率</span>
                            <span className="stat-value">
                            {(() => {
                              const history = habitHistory[habit.id] || [];
                              if (habit.frequency === 'daily') {
                                return `${Math.round((history.length / 30) * 100)}%`;
                              } else if (habit.frequency === 'weekly') {
                                return `${Math.round((history.length / 4) * 100)}%`;
                              } else {
                                return `${Math.round((history.length / 1) * 100)}%`;
                              }
                            })()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {selfAnalysisTab === 'mood' && (
            <div className="mood-content">
              <div className="mood-header">
                <h3>😊 感情ログ</h3>
                <button 
                  className="add-mood-button"
                  onClick={() => {
                    addMoodLog();
                  }}
                >
                  + 今日の気分を記録
                </button>
              </div>

              <div className="mood-stats">
                <div className="mood-summary">
                  <div className="stat-card">
                    <div className="stat-value">
                      {moodLogs.length > 0 ? getAverageMood().toFixed(1) : '0.0'}
                    </div>
                    <div className="stat-label">平均気分</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">
                      {moodLogs.length}
                    </div>
                    <div className="stat-label">記録日数</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">
                      {moodLogs.length > 0 ? moodLogs[moodLogs.length - 1].mood : 0}
                    </div>
                    <div className="stat-label">最新の気分</div>
                  </div>
                </div>
              </div>

              <div className="mood-list">
                {moodLogs.length === 0 ? (
                  <div className="empty-state">
                    <p>まだ感情ログがありません</p>
                    <p>「+ 今日の気分を記録」ボタンから気分を記録してください</p>
                  </div>
                ) : (
                  <div className="mood-grid">
                    {moodLogs.map(log => (
                      <div key={log.id} className="mood-card">
                        <div className="mood-card-header">
                          <div className="mood-date">{log.date}</div>
                          <button 
                            className="delete-mood-button"
                            onClick={() => deleteMoodLog(log.id)}
                          >
                            ✕
                          </button>
                        </div>
                        
                        <div className="mood-display">
                          <div className="mood-emoji">{getMoodEmoji(log.mood)}</div>
                          <div className="mood-text">
                            {log.mood === 5 ? '最高！' :
                             log.mood === 4 ? '良い' :
                             log.mood === 3 ? '普通' :
                             log.mood === 2 ? '少し低い' : '低い'}
                          </div>
                        </div>

                        <div className="mood-details">
                          <div className="mood-factor">
                            <span className="factor-label">エネルギー:</span>
                            <div className="factor-bar">
                              <div 
                                className="factor-fill" 
                                style={{'--percentage': `${(log.energy / 5) * 100}%`} as React.CSSProperties}
                              ></div>
                            </div>
                            <span className="factor-value">{log.energy}/5</span>
                          </div>
                          <div className="mood-factor">
                            <span className="factor-label">ストレス:</span>
                            <div className="factor-bar">
                              <div 
                                className="factor-fill stress" 
                                style={{'--percentage': `${(log.stress / 5) * 100}%`} as React.CSSProperties}
                              ></div>
                            </div>
                            <span className="factor-value">{log.stress}/5</span>
                          </div>
                          <div className="mood-factor">
                            <span className="factor-label">睡眠:</span>
                            <span className="factor-value">{log.sleep}時間</span>
                          </div>
                          <div className="mood-factor">
                            <span className="factor-label">天気:</span>
                            <span className="factor-value">
                              {log.weather === 'sunny' && '☀️ 晴れ'}
                              {log.weather === 'cloudy' && '☁️ 曇り'}
                              {log.weather === 'rainy' && '🌧️ 雨'}
                              {log.weather === 'snowy' && '❄️ 雪'}
                            </span>
                          </div>
                        </div>

                        {log.activities.length > 0 && (
                          <div className="mood-activities">
                            <h5>活動:</h5>
                            <div className="activities-tags">
                              {log.activities.map((activity: string, index: number) => (
                                <span key={index} className="activity-tag">
                                  {activity}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {log.notes && (
                          <div className="mood-notes">
                            <h5>メモ:</h5>
                            <p>{log.notes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {selfAnalysisTab === 'goals' && (
            <div className="goals-content">
              <div className="goals-header">
                <h3>🎯 目標・夢の管理</h3>
                <button 
                  className="add-goal-button"
                  onClick={() => {
                    addGoal();
                  }}
                >
                  + 新しい目標
                </button>
              </div>

              <div className="goals-list">
                {goals.length === 0 ? (
                  <div className="empty-state">
                    <p>まだ目標が設定されていません</p>
                    <p>「+ 新しい目標」ボタンから目標を追加してください</p>
                  </div>
                ) : (
                  <div className="goals-grid">
                    {goals.map(goal => (
                      <div key={goal.id} className="goal-card">
                        <div className="goal-header">
                          <h4 className="goal-title">{goal.title}</h4>
                          <button 
                            className="delete-goal-button"
                            onClick={() => deleteGoal(goal.id)}
                          >
                            ✕
                          </button>
                        </div>
                        
                        {goal.description && (
                          <p className="goal-description">{goal.description}</p>
                        )}

                        <div className="goal-meta">
                          <div className="goal-category">
                            <span className="category-label">カテゴリ:</span>
                            <span className="category-value">{goal.category}</span>
                          </div>
                          <div className="goal-priority">
                            <span className="priority-label">優先度:</span>
                            <span className={`priority-value ${goal.priority}`}>
                              {goal.priority === 'low' && '低'}
                              {goal.priority === 'medium' && '中'}
                              {goal.priority === 'high' && '高'}
                            </span>
                          </div>
                          <div className="goal-status">
                            <span className="status-label">ステータス:</span>
                            <span className={`status-value ${goal.status}`}>
                              {goal.status === 'not-started' && '未開始'}
                              {goal.status === 'in-progress' && '進行中'}
                              {goal.status === 'completed' && '完了'}
                              {goal.status === 'paused' && '一時停止'}
                            </span>
                          </div>
                        </div>

                        {goal.targetDate && (
                          <div className="goal-target-date">
                            <span className="target-date-label">目標日:</span>
                            <span className="target-date-value">{goal.targetDate}</span>
                          </div>
                        )}

                        {goal.milestones.length > 0 && (
                          <div className="goal-milestones">
                            <h5>マイルストーン</h5>
                            <div className="milestones-list">
                              {goal.milestones.map((milestone, index) => (
                                <div key={milestone.id} className={`milestone-item ${milestone.completed ? 'completed' : ''}`}>
                                  <span className="milestone-text">{milestone.title}</span>
                                  <span className="milestone-status">
                                    {milestone.completed ? '✅' : '⏳'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {selfAnalysisTab === 'learning' && (
            <div className="learning-content">
              <div className="learning-header">
                <h3>📚 学習記録</h3>
                <button 
                  className="add-learning-button"
                  onClick={() => {
                    const newRecord = {
                      title: '新しい学習記録',
                      description: '',
                      type: 'other' as const,
                      category: 'その他',
                      status: 'not-started' as const,
                      rating: 3,
                      startDate: new Date().toISOString().split('T')[0],
                      skills: [],
                      notes: '',
                      resources: [],
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString()
                    };
                    addLearningRecord(newRecord);
                  }}
                >
                  + 新しい学習記録
                </button>
              </div>

              <div className="learning-stats">
                <div className="learning-summary">
                  <div className="stat-card">
                    <div className="stat-value">
                      {learningRecords.length}
                    </div>
                    <div className="stat-label">総数</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">
                      {learningRecords.filter(r => r.status === 'completed').length}
                    </div>
                    <div className="stat-label">完了済み</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">
                      {learningRecords.filter(r => r.status === 'in-progress').length}
                    </div>
                    <div className="stat-label">進行中</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">
                      {learningRecords.length > 0 
                        ? Math.round(learningRecords.reduce((sum, r) => sum + (r.rating || 0), 0) / learningRecords.length * 10) / 10
                        : 0
                      }
                    </div>
                    <div className="stat-label">平均評価</div>
                  </div>
                </div>
              </div>

              <div className="learning-list">
                {learningRecords.length === 0 ? (
                  <div className="empty-state">
                    <p>まだ学習記録がありません</p>
                    <p>「+ 新しい学習記録」ボタンから学習内容を記録してください</p>
                  </div>
                ) : (
                  <div className="learning-grid">
                    {learningRecords.map(record => (
                      <div key={record.id} className="learning-card">
                        <div className="learning-header">
                          <h4 className="learning-title">{record.title}</h4>
                          <button 
                            className="delete-learning-button"
                            onClick={() => deleteLearningRecord(record.id)}
                          >
                            ✕
                          </button>
                        </div>

                        <div className="learning-description">
                          <p>{record.description}</p>
                        </div>

                        <div className="learning-meta">
                          <div className="learning-category">
                            <span className="category-label">カテゴリ:</span>
                            <span className="category-value">{record.category}</span>
                          </div>
                          <div className="learning-rating">
                            <span className="rating-label">評価:</span>
                            <span className="rating-value">
                              {'★'.repeat(record.rating)}{'☆'.repeat(5 - record.rating)}
                            </span>
                          </div>
                          <div className="learning-status">
                            <span className={`status-badge ${record.status}`}>
                              {record.status === 'not-started' && '未開始'}
                              {record.status === 'in-progress' && '進行中'}
                              {record.status === 'completed' && '完了'}
                              {record.status === 'paused' && '一時停止'}
                            </span>
                          </div>
                        </div>

                        {record.skills.length > 0 && (
                          <div className="learning-skills">
                            <h5>習得スキル</h5>
                            <div className="skills-tags">
                              {record.skills.map((skill, index) => (
                                <span key={index} className="skill-tag">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="learning-dates">
                          <div className="date-item">
                            <span className="date-label">開始日:</span>
                            <span className="date-value">{record.startDate}</span>
                          </div>
                          {record.completedDate && (
                            <div className="date-item">
                              <span className="date-label">完了日:</span>
                              <span className="date-value">{record.completedDate}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SelfAnalysisComponent;
