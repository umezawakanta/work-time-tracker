import React, { useState, useEffect } from 'react';
import './WorkRecordsComponent.css';
import type { SalaryRecord, WorkDiary } from '../types';

interface WorkRecordsComponentProps {
  showWorkRecords: boolean;
  setShowWorkRecords: (show: boolean) => void;
  showSalaryForm: boolean;
  setShowSalaryForm: (show: boolean) => void;
  showDiaryForm: boolean;
  setShowDiaryForm: (show: boolean) => void;
  showCalendar: boolean;
  setShowCalendar: (show: boolean) => void;
  salaryRecords: SalaryRecord[];
  workDiaries: WorkDiary[];
  salaryLoading: boolean;
  diaryLoading: boolean;
  workRecordsLoading: boolean;
  currentMonth: Date;
  setCurrentMonth: (date: Date) => void;
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
  selectedRecord: any;
  setSelectedRecord: (record: any) => void;
  selectedRecordType: "salary" | "diary" | null;
  setSelectedRecordType: (type: "salary" | "diary" | null) => void;
  editingSalaryRecord: SalaryRecord | null;
  setEditingSalaryRecord: (record: SalaryRecord | null) => void;
  editingDiary: WorkDiary | null;
  setEditingDiary: (diary: WorkDiary | null) => void;
  salaryAmount: string;
  setSalaryAmount: (amount: string) => void;
  salaryDate: string;
  setSalaryDate: (date: string) => void;
  salaryNotes: string;
  setSalaryNotes: (notes: string) => void;
  diaryDate: string;
  setDiaryDate: (date: string) => void;
  diaryTitle: string;
  setDiaryTitle: (title: string) => void;
  diaryContent: string;
  setDiaryContent: (content: string) => void;
  diaryMood: string;
  setDiaryMood: (mood: string) => void;
  diaryActivities: string[];
  setDiaryActivities: (activities: string[]) => void;
  diaryNotes: string;
  setDiaryNotes: (notes: string) => void;
  diaryNextGoals: string[];
  setDiaryNextGoals: (goals: string[]) => void;
  diaryChallenges: string[];
  setDiaryChallenges: (challenges: string[]) => void;
  diaryAchievements: string[];
  setDiaryAchievements: (achievements: string[]) => void;
  monthlyMemo: string;
  setMonthlyMemo: (memo: string) => void;
  editingMonthlyMemo: boolean;
  setEditingMonthlyMemo: (editing: boolean) => void;
  loadSalaryRecords: () => void;
  loadWorkDiaries: () => void;
  handleCreateSalaryRecord: (e: React.FormEvent) => void;
  handleUpdateSalaryRecord: (e: React.FormEvent) => void;
  handleCreateDiary: (e: React.FormEvent) => void;
  handleUpdateDiary: (e: React.FormEvent) => void;
  handleDeleteSalaryRecord: (id: string) => void;
  handleDeleteDiary: (id: string) => void;
  openDiaryForm: () => void;
  loadMonthlyMemo: () => void;
  saveMonthlyMemo: () => void;
  startEditingMonthlyMemo: () => void;
  cancelEditingMonthlyMemo: () => void;
  closeOtherFeatures: (activeFeature: string) => void;
}

const WorkRecordsComponent: React.FC<WorkRecordsComponentProps> = ({
  showWorkRecords,
  setShowWorkRecords,
  showSalaryForm,
  setShowSalaryForm,
  showDiaryForm,
  setShowDiaryForm,
  showCalendar,
  setShowCalendar,
  salaryRecords,
  workDiaries,
  salaryLoading,
  diaryLoading,
  workRecordsLoading,
  currentMonth,
  setCurrentMonth,
  selectedDate,
  setSelectedDate,
  selectedRecord,
  setSelectedRecord,
  selectedRecordType,
  setSelectedRecordType,
  editingSalaryRecord,
  setEditingSalaryRecord,
  editingDiary,
  setEditingDiary,
  salaryAmount,
  setSalaryAmount,
  salaryDate,
  setSalaryDate,
  salaryNotes,
  setSalaryNotes,
  diaryDate,
  setDiaryDate,
  diaryTitle,
  setDiaryTitle,
  diaryContent,
  setDiaryContent,
  diaryMood,
  setDiaryMood,
  diaryActivities,
  setDiaryActivities,
  diaryNotes,
  setDiaryNotes,
  diaryNextGoals,
  setDiaryNextGoals,
  diaryChallenges,
  setDiaryChallenges,
  diaryAchievements,
  setDiaryAchievements,
  diaryGratitude,
  setDiaryGratitude,
  diaryReflection,
  setDiaryReflection,
  monthlyMemo,
  setMonthlyMemo,
  editingMonthlyMemo,
  setEditingMonthlyMemo,
  loadSalaryRecords,
  loadWorkDiaries,
  handleCreateSalaryRecord,
  handleUpdateSalaryRecord,
  handleCreateDiary,
  handleUpdateDiary,
  handleDeleteSalaryRecord,
  handleDeleteDiary,
  openDiaryForm,
  loadMonthlyMemo,
  saveMonthlyMemo,
  startEditingMonthlyMemo,
  cancelEditingMonthlyMemo,
  closeOtherFeatures,
}) => {
  // カレンダーの日付を生成
  const getCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDate = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };

  // 指定された日付の記録を取得
  const getRecordsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    const salaryRecord = salaryRecords.find(record => 
      new Date(record.date).toISOString().split('T')[0] === dateString
    );
    const diaryRecord = workDiaries.find(diary => 
      new Date(diary.date).toISOString().split('T')[0] === dateString
    );
    
    return { salaryRecord, diaryRecord };
  };

  // 月の統計を計算
  const getMonthlySummary = (year: number, month: number) => {
    const monthlySalaryRecords = salaryRecords.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate.getFullYear() === year && recordDate.getMonth() === month;
    });
    
    const monthlyDiaries = workDiaries.filter(diary => {
      const diaryDate = new Date(diary.date);
      return diaryDate.getFullYear() === year && diaryDate.getMonth() === month;
    });
    
    const totalSalary = monthlySalaryRecords.length > 0 ? monthlySalaryRecords.reduce((sum, record) => sum + record.amount, 0) : 0;
    const averageMood = monthlyDiaries.length > 0 
      ? monthlyDiaries.reduce((sum, diary) => sum + (diary.mood || 0), 0) / monthlyDiaries.length 
      : 0;
    
    return {
      totalSalary,
      averageMood,
      salaryRecordsCount: monthlySalaryRecords.length,
      diariesCount: monthlyDiaries.length,
    };
  };

  // 日付クリックハンドラー
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    const records = getRecordsForDate(date);
    if (records.salaryRecord || records.diaryRecord) {
      setSelectedRecord(records);
      setSelectedRecordType(records.salaryRecord ? "salary" : "diary");
    } else {
      setSelectedRecord(null);
      setSelectedRecordType(null);
    }
  };

  // 記録クリックハンドラー
  const handleRecordClick = (type: "salary" | "diary", date: Date) => {
    const records = getRecordsForDate(date);
    if (type === "salary" && records.salaryRecord) {
      setSelectedRecord(records);
      setSelectedRecordType("salary");
    } else if (type === "diary" && records.diaryRecord) {
      setSelectedRecord(records);
      setSelectedRecordType("diary");
    }
  };

  // 月移動ハンドラー
  const navigateMonth = (direction: "prev" | "next") => {
    const newMonth = new Date(currentMonth);
    if (direction === "prev") {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  // 配列項目を管理する関数
  const addArrayItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, value: string, setValue: React.Dispatch<React.SetStateAction<string>>) => {
    if (value.trim()) {
      setter(prev => [...prev, value.trim()]);
      setValue("");
    }
  };

  const removeArrayItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, index: number) => {
    setter(prev => prev.filter((_, i) => i !== index));
  };

  const monthlySummary = getMonthlySummary(currentMonth.getFullYear(), currentMonth.getMonth());

  return (
    <div className="work-records-section">
      <div className="section-header">
        <h2>
          <span className="section-icon">💼</span>
          おしごと記録
        </h2>
        <div className="section-controls">
          {showWorkRecords ? (
            <button
              onClick={() => setShowWorkRecords(false)}
              className="close-section-button"
              title="セクションを閉じる"
            >
              ✕
            </button>
          ) : (
            <button
              onClick={() => {
                closeOtherFeatures("work-records");
                setShowWorkRecords(true);
                if (salaryRecords.length === 0) {
                  loadSalaryRecords();
                }
                if (workDiaries.length === 0) {
                  loadWorkDiaries();
                }
              }}
              className="show-section-button"
              title="セクションを表示"
            >
              ▶️
            </button>
          )}
        </div>
      </div>

      {showWorkRecords && (
        <div className="work-records-content">
          {/* 月別統計 */}
          <div className="monthly-summary">
            <h3>📊 {currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月の統計</h3>
            <div className="summary-grid">
              <div className="summary-item">
                <span className="summary-label">総給与</span>
                <span className="summary-value">¥{monthlySummary.totalSalary.toLocaleString()}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">平均気分</span>
                <span className="summary-value">
                  {monthlySummary.averageMood > 0 ? `😊 ${monthlySummary.averageMood.toFixed(1)}` : 'なし'}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">給与記録</span>
                <span className="summary-value">{monthlySummary.salaryRecordsCount}件</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">日記</span>
                <span className="summary-value">{monthlySummary.diariesCount}件</span>
              </div>
            </div>
          </div>

          {/* カレンダー */}
          <div className="work-records-calendar">
            <div className="calendar-header">
              <button
                onClick={() => navigateMonth("prev")}
                className="calendar-nav-button"
              >
                ← 前月
              </button>
              <h3>
                {currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月
              </h3>
              <button
                onClick={() => navigateMonth("next")}
                className="calendar-nav-button"
              >
                次月 →
              </button>
            </div>
            
            <div className="calendar-grid">
              <div className="calendar-weekdays">
                {['日', '月', '火', '水', '木', '金', '土'].map(day => (
                  <div key={day} className="weekday">{day}</div>
                ))}
              </div>
              
              <div className="calendar-days">
                {getCalendarDays().map((date, index) => {
                  const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
                  const isToday = date.toDateString() === new Date().toDateString();
                  const isSelected = selectedDate?.toDateString() === date.toDateString();
                  const records = getRecordsForDate(date);
                  
                  return (
                    <div
                      key={index}
                      className={`calendar-day ${isCurrentMonth ? 'current-month' : 'other-month'} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleDateClick(date)}
                    >
                      <span className="day-number">{date.getDate()}</span>
                      <div className="day-indicators">
                        {records.salaryRecord && (
                          <span className="salary-indicator" title="給与記録">💰</span>
                        )}
                        {records.diaryRecord && (
                          <span className="diary-indicator" title="日記">📝</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 選択された記録の詳細 */}
          {selectedRecord && selectedRecordType && (
            <div className="record-details">
              <h3>選択された記録</h3>
              {selectedRecordType === "salary" && selectedRecord.salaryRecord && (
                <div className="salary-record-detail">
                  <h4>💰 給与記録</h4>
                  <p><strong>金額:</strong> ¥{selectedRecord.salaryRecord.amount.toLocaleString()}</p>
                  <p><strong>日付:</strong> {new Date(selectedRecord.salaryRecord.date).toLocaleDateString()}</p>
                  {selectedRecord.salaryRecord.notes && (
                    <p><strong>メモ:</strong> {selectedRecord.salaryRecord.notes}</p>
                  )}
                  <div className="record-actions">
                    <button
                      onClick={() => setEditingSalaryRecord(selectedRecord.salaryRecord)}
                      className="edit-button"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => handleDeleteSalaryRecord(selectedRecord.salaryRecord.id)}
                      className="delete-button"
                    >
                      削除
                    </button>
                  </div>
                </div>
              )}
              
              {selectedRecordType === "diary" && selectedRecord.diaryRecord && (
                <div className="diary-record-detail">
                  <h4>📝 日記</h4>
                  <p><strong>タイトル:</strong> {selectedRecord.diaryRecord.title}</p>
                  <p><strong>日付:</strong> {new Date(selectedRecord.diaryRecord.date).toLocaleDateString()}</p>
                  <p><strong>気分:</strong> {selectedRecord.diaryRecord.mood || '未設定'}</p>
                  <p><strong>内容:</strong> {selectedRecord.diaryRecord.content}</p>
                  <div className="record-actions">
                    <button
                      onClick={() => setEditingDiary(selectedRecord.diaryRecord)}
                      className="edit-button"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => handleDeleteDiary(selectedRecord.diaryRecord.id)}
                      className="delete-button"
                    >
                      削除
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 給与記録フォーム */}
          {showSalaryForm && (
            <div className="salary-form">
              <h3>{editingSalaryRecord ? '給与記録を編集' : '新しい給与記録'}</h3>
              <form onSubmit={editingSalaryRecord ? handleUpdateSalaryRecord : handleCreateSalaryRecord}>
                <div className="form-group">
                  <label>金額</label>
                  <input
                    type="number"
                    value={salaryAmount}
                    onChange={(e) => setSalaryAmount(e.target.value)}
                    placeholder="給与金額を入力"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>日付</label>
                  <input
                    type="date"
                    value={salaryDate}
                    onChange={(e) => setSalaryDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>メモ</label>
                  <textarea
                    value={salaryNotes}
                    onChange={(e) => setSalaryNotes(e.target.value)}
                    placeholder="メモを入力（任意）"
                    rows={3}
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="save-button">
                    {editingSalaryRecord ? '更新' : '保存'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowSalaryForm(false);
                      setEditingSalaryRecord(null);
                      setSalaryAmount('');
                      setSalaryDate('');
                      setSalaryNotes('');
                    }}
                    className="cancel-button"
                  >
                    キャンセル
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 日記フォーム */}
          {showDiaryForm && (
            <div className="diary-form">
              <h3>{editingDiary ? '日記を編集' : '新しい日記'}</h3>
              <form onSubmit={editingDiary ? handleUpdateDiary : handleCreateDiary}>
                <div className="form-group">
                  <label>タイトル</label>
                  <input
                    type="text"
                    value={diaryTitle}
                    onChange={(e) => setDiaryTitle(e.target.value)}
                    placeholder="日記のタイトル"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>日付</label>
                  <input
                    type="date"
                    value={diaryDate}
                    onChange={(e) => setDiaryDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>気分 (1-5)</label>
                  <select
                    value={diaryMood}
                    onChange={(e) => setDiaryMood(e.target.value)}
                  >
                    <option value="">選択してください</option>
                    <option value="1">😢 1 (とても悪い)</option>
                    <option value="2">😔 2 (悪い)</option>
                    <option value="3">😐 3 (普通)</option>
                    <option value="4">😊 4 (良い)</option>
                    <option value="5">😄 5 (とても良い)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>内容</label>
                  <textarea
                    value={diaryContent}
                    onChange={(e) => setDiaryContent(e.target.value)}
                    placeholder="今日の出来事や感想を書いてください"
                    rows={5}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>活動</label>
                  <div className="array-input">
                    <input
                      type="text"
                      placeholder="活動を入力"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addArrayItem(setDiaryActivities, e.currentTarget.value, () => {});
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.querySelector('.array-input input') as HTMLInputElement;
                        if (input) {
                          addArrayItem(setDiaryActivities, input.value, () => {});
                          input.value = '';
                        }
                      }}
                    >
                      追加
                    </button>
                  </div>
                  <div className="array-list">
                    {diaryActivities.map((activity, index) => (
                      <div key={index} className="array-item">
                        <span>{activity}</span>
                        <button
                          type="button"
                          onClick={() => removeArrayItem(setDiaryActivities, index)}
                          className="remove-button"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label>メモ</label>
                  <textarea
                    value={diaryNotes}
                    onChange={(e) => setDiaryNotes(e.target.value)}
                    placeholder="追加のメモ"
                    rows={3}
                  />
                </div>
                <div className="form-group">
                  <label>次回の目標</label>
                  <textarea
                    value={diaryNextGoals}
                    onChange={(e) => setDiaryNextGoals(e.target.value)}
                    placeholder="次回の目標を書いてください"
                    rows={2}
                  />
                </div>
                <div className="form-group">
                  <label>課題</label>
                  <textarea
                    value={diaryChallenges}
                    onChange={(e) => setDiaryChallenges(e.target.value)}
                    placeholder="現在の課題を書いてください"
                    rows={2}
                  />
                </div>
                <div className="form-group">
                  <label>達成したこと</label>
                  <div className="array-input">
                    <input
                      type="text"
                      placeholder="達成したことを入力"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addArrayItem(setDiaryAchievements, e.currentTarget.value, () => {});
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.querySelector('.array-input input') as HTMLInputElement;
                        if (input) {
                          addArrayItem(setDiaryAchievements, input.value, () => {});
                          input.value = '';
                        }
                      }}
                    >
                      追加
                    </button>
                  </div>
                  <div className="array-list">
                    {diaryAchievements.map((achievement, index) => (
                      <div key={index} className="array-item">
                        <span>{achievement}</span>
                        <button
                          type="button"
                          onClick={() => removeArrayItem(setDiaryAchievements, index)}
                          className="remove-button"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label>感謝</label>
                  <textarea
                    value={diaryGratitude}
                    onChange={(e) => setDiaryGratitude(e.target.value)}
                    placeholder="感謝していることを書いてください"
                    rows={2}
                  />
                </div>
                <div className="form-group">
                  <label>振り返り</label>
                  <textarea
                    value={diaryReflection}
                    onChange={(e) => setDiaryReflection(e.target.value)}
                    placeholder="今日の振り返りを書いてください"
                    rows={3}
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="save-button">
                    {editingDiary ? '更新' : '保存'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowDiaryForm(false);
                      setEditingDiary(null);
                      setDiaryTitle('');
                      setDiaryDate('');
                      setDiaryContent('');
                      setDiaryMood('');
                      setDiaryActivities([]);
                      setDiaryNotes('');
                      setDiaryNextGoals('');
                      setDiaryChallenges('');
                      setDiaryAchievements([]);
                      setDiaryGratitude('');
                      setDiaryReflection('');
                    }}
                    className="cancel-button"
                  >
                    キャンセル
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 月次メモ */}
          <div className="monthly-memo">
            <h3>📝 月次メモ</h3>
            {editingMonthlyMemo ? (
              <div className="memo-edit">
                <textarea
                  value={monthlyMemo}
                  onChange={(e) => setMonthlyMemo(e.target.value)}
                  placeholder="今月の振り返りや来月の目標を書いてください"
                  rows={4}
                />
                <div className="memo-actions">
                  <button onClick={saveMonthlyMemo} className="save-button">
                    保存
                  </button>
                  <button onClick={cancelEditingMonthlyMemo} className="cancel-button">
                    キャンセル
                  </button>
                </div>
              </div>
            ) : (
              <div className="memo-display">
                <p>{monthlyMemo || '月次メモがありません'}</p>
                <button onClick={startEditingMonthlyMemo} className="edit-button">
                  編集
                </button>
              </div>
            )}
          </div>

          {/* アクションボタン */}
          <div className="action-buttons">
            <button
              onClick={() => {
                setShowSalaryForm(true);
                setShowDiaryForm(false);
                setEditingSalaryRecord(null);
                setSalaryAmount('');
                setSalaryDate('');
                setSalaryNotes('');
              }}
              className="action-button salary-button"
            >
              💰 給与記録を追加
            </button>
            <button
              onClick={openDiaryForm}
              className="action-button diary-button"
            >
              📝 日記を追加
            </button>
            <button
              onClick={() => {
                loadSalaryRecords();
                loadWorkDiaries();
              }}
              className="action-button refresh-button"
            >
              🔄 更新
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkRecordsComponent;
