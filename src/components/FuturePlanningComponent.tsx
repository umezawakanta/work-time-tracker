import React, { useState, useEffect } from 'react';
import './FuturePlanningComponent.css';
import type { Plan, Schedule, BudgetPlan, User } from '../types';
import { futurePlanningManager } from '../utils/futurePlanningManager';

interface FuturePlanningComponentProps {
  showFuturePlanning: boolean;
  setShowFuturePlanning: (show: boolean) => void;
  closeOtherFeatures: (activeFeature: string) => void;
  user: User | null;
}

const FuturePlanningComponent: React.FC<FuturePlanningComponentProps> = ({
  showFuturePlanning,
  setShowFuturePlanning,
  closeOtherFeatures,
  user
}) => {
  const [activeTab, setActiveTab] = useState<'plans' | 'schedules' | 'budgets'>('plans');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [budgetPlans, setBudgetPlans] = useState<BudgetPlan[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // フォームの状態
  const [formType, setFormType] = useState<'plan' | 'schedule' | 'budget'>('plan');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>('work');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [progress, setProgress] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  const categories = [
    { value: 'work', label: '仕事' },
    { value: 'personal', label: '個人' },
    { value: 'health', label: '健康' },
    { value: 'learning', label: '学習' },
    { value: 'finance', label: '財務' },
    { value: 'other', label: 'その他' }
  ];

  useEffect(() => {
    if (showFuturePlanning) {
      loadData();
    }
  }, [showFuturePlanning]);

  const loadData = () => {
    setPlans(futurePlanningManager.getPlans());
    setSchedules(futurePlanningManager.getSchedules());
    setBudgetPlans(futurePlanningManager.getBudgetPlans());
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('work');
    setPriority('medium');
    setStartDate('');
    setEndDate('');
    setProgress(0);
    setTags([]);
    setNotes('');
    setEditingItem(null);
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    const baseData = {
      userId: user.id,
      title,
      description,
      category: category as any,
      priority,
      startDate,
      endDate,
      ...(notes && { notes }),
    };

    if (formType === 'plan') {
      const planData = {
        ...baseData,
        id: Date.now().toString(),
        status: 'not_started' as const,
        targetDate: endDate,
        progress,
        tags,
        milestones: [],
      };
      
      if (editingItem) {
        futurePlanningManager.updatePlan(editingItem._id, planData);
      } else {
        futurePlanningManager.addPlan(planData);
      }
    } else if (formType === 'schedule') {
      const scheduleData = {
        ...baseData,
        id: Date.now().toString(),
        priority: priority === 'urgent' ? 'high' : priority as 'low' | 'medium' | 'high',
        status: 'scheduled' as const,
        date: startDate,
        startTime: new Date(startDate).toISOString(),
        endTime: new Date(endDate).toISOString(),
        isRecurring: false,
        isCompleted: false,
      };
      
      if (editingItem) {
        futurePlanningManager.updateSchedule(editingItem._id, scheduleData);
      } else {
        futurePlanningManager.addSchedule(scheduleData);
      }
    } else if (formType === 'budget') {
      const budgetData = {
        ...baseData,
        id: Date.now().toString(),
        status: 'active' as const,
        amount: parseFloat(endDate) || 0,
        targetAmount: parseFloat(endDate) || 0,
        currentAmount: 0,
        period: 'monthly' as const,
        isActive: true,
      };
      
      if (editingItem) {
        futurePlanningManager.updateBudgetPlan(editingItem._id, budgetData);
      } else {
        futurePlanningManager.addBudgetPlan(budgetData);
      }
    }

    resetForm();
    loadData();
  };

  const editItem = (item: any, type: 'plan' | 'schedule' | 'budget') => {
    setFormType(type);
    setTitle(item.title);
    setDescription(item.description || '');
    setCategory(item.category);
    setPriority(item.priority);
    setStartDate(item.startDate || item.startTime?.split('T')[0] || '');
    setEndDate(item.endDate || item.endTime?.split('T')[0] || item.targetAmount?.toString() || '');
    setProgress(item.progress || 0);
    setTags(item.tags || []);
    setNotes(item.notes || '');
    setEditingItem(item);
    setShowForm(true);
  };

  const deleteItem = (id: string, type: 'plan' | 'schedule' | 'budget') => {
    if (window.confirm('この項目を削除しますか？')) {
      if (type === 'plan') {
        futurePlanningManager.deletePlan(id);
      } else if (type === 'schedule') {
        futurePlanningManager.deleteSchedule(id);
      } else if (type === 'budget') {
        futurePlanningManager.deleteBudgetPlan(id);
      }
      loadData();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'in_progress': return '#2196F3';
      case 'cancelled': return '#f44336';
      case 'on_hold': return '#ff9800';
      default: return '#9e9e9e';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#f44336';
      case 'high': return '#ff9800';
      case 'medium': return '#2196F3';
      case 'low': return '#4CAF50';
      default: return '#9e9e9e';
    }
  };

  if (!showFuturePlanning) return null;

  return (
    <div className="future-planning-component">
      <div className="planning-header">
        <h2>未来計画</h2>
        <div className="planning-controls">
          <button
            className="close-btn"
            onClick={() => setShowFuturePlanning(false)}
          >
            ×
          </button>
        </div>
      </div>

      <div className="planning-tabs">
        <button
          className={`tab ${activeTab === 'plans' ? 'active' : ''}`}
          onClick={() => setActiveTab('plans')}
        >
          計画・目標
        </button>
        <button
          className={`tab ${activeTab === 'schedules' ? 'active' : ''}`}
          onClick={() => setActiveTab('schedules')}
        >
          スケジュール
        </button>
        <button
          className={`tab ${activeTab === 'budgets' ? 'active' : ''}`}
          onClick={() => setActiveTab('budgets')}
        >
          予算計画
        </button>
      </div>

      <div className="planning-content">
        {activeTab === 'plans' && (
          <div className="plans-section">
            <div className="section-header">
              <h3>計画・目標</h3>
              <button
                className="add-btn"
                onClick={() => {
                  setFormType('plan');
                  resetForm();
                  setShowForm(true);
                }}
              >
                + 計画を追加
              </button>
            </div>
            <div className="plans-list">
              {plans.length === 0 ? (
                <p className="no-items">計画がありません</p>
              ) : (
                plans.map(plan => (
                  <div key={plan._id} className="plan-item">
                    <div className="item-header">
                      <h4>{plan.title}</h4>
                      <div className="item-actions">
                        <button onClick={() => editItem(plan, 'plan')}>編集</button>
                        <button onClick={() => deleteItem(plan._id, 'plan')}>削除</button>
                      </div>
                    </div>
                    <div className="item-details">
                      <p>{plan.description}</p>
                      <div className="item-meta">
                        <span className="status" style={{ color: getStatusColor(plan.status) }}>
                          {plan.status}
                        </span>
                        <span className="priority" style={{ color: getPriorityColor(plan.priority) }}>
                          {plan.priority}
                        </span>
                        <span className="progress">進捗: {plan.progress}%</span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${plan.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'schedules' && (
          <div className="schedules-section">
            <div className="section-header">
              <h3>スケジュール</h3>
              <button
                className="add-btn"
                onClick={() => {
                  setFormType('schedule');
                  resetForm();
                  setShowForm(true);
                }}
              >
                + 予定を追加
              </button>
            </div>
            <div className="schedules-list">
              {schedules.length === 0 ? (
                <p className="no-items">予定がありません</p>
              ) : (
                schedules.map(schedule => (
                  <div key={schedule._id} className="schedule-item">
                    <div className="item-header">
                      <h4>{schedule.title}</h4>
                      <div className="item-actions">
                        <button onClick={() => editItem(schedule, 'schedule')}>編集</button>
                        <button onClick={() => deleteItem(schedule._id, 'schedule')}>削除</button>
                      </div>
                    </div>
                    <div className="item-details">
                      <p>{schedule.description}</p>
                      <div className="item-meta">
                        <span>開始: {new Date(schedule.startTime).toLocaleString()}</span>
                        <span>終了: {new Date(schedule.endTime).toLocaleString()}</span>
                        <span className="priority" style={{ color: getPriorityColor(schedule.priority) }}>
                          {schedule.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'budgets' && (
          <div className="budgets-section">
            <div className="section-header">
              <h3>予算計画</h3>
              <button
                className="add-btn"
                onClick={() => {
                  setFormType('budget');
                  resetForm();
                  setShowForm(true);
                }}
              >
                + 予算計画を追加
              </button>
            </div>
            <div className="budgets-list">
              {budgetPlans.length === 0 ? (
                <p className="no-items">予算計画がありません</p>
              ) : (
                budgetPlans.map(budget => (
                  <div key={budget._id} className="budget-item">
                    <div className="item-header">
                      <h4>{budget.title}</h4>
                      <div className="item-actions">
                        <button onClick={() => editItem(budget, 'budget')}>編集</button>
                        <button onClick={() => deleteItem(budget._id, 'budget')}>削除</button>
                      </div>
                    </div>
                    <div className="item-details">
                      <p>{budget.description}</p>
                      <div className="budget-progress">
                        <span>目標: ¥{budget.targetAmount.toLocaleString()}</span>
                        <span>現在: ¥{budget.currentAmount.toLocaleString()}</span>
                        <span>進捗: {Math.round((budget.currentAmount / budget.targetAmount) * 100)}%</span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${Math.min((budget.currentAmount / budget.targetAmount) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <div className="form-overlay">
          <div className="form-container">
            <h3>{editingItem ? `${formType}を編集` : `${formType}を追加`}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>タイトル *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  title="タイトルを入力"
                  placeholder="タイトルを入力してください"
                  aria-label="タイトルを入力"
                />
              </div>
              <div className="form-group">
                <label>説明</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  title="説明を入力"
                  placeholder="説明を入力してください"
                  aria-label="説明を入力"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>カテゴリ *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                    title="カテゴリを選択"
                    aria-label="カテゴリを選択"
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>優先度 *</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    required
                  >
                    <option value="low">低</option>
                    <option value="medium">中</option>
                    <option value="high">高</option>
                    <option value="urgent">緊急</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>開始日 *</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>{formType === 'budget' ? '目標金額' : '終了日'} *</label>
                  <input
                    type={formType === 'budget' ? 'number' : 'date'}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>
              </div>
              {formType === 'plan' && (
                <div className="form-group">
                  <label>進捗率 (0-100%)</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={progress}
                    onChange={(e) => setProgress(parseInt(e.target.value))}
                  />
                  <span>{progress}%</span>
                </div>
              )}
              <div className="form-group">
                <label>メモ</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="submit-btn">
                  {editingItem ? '更新' : '追加'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="cancel-btn"
                >
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FuturePlanningComponent;
