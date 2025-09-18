import React, { useState, useEffect } from 'react';
import './TimeTrackingComponent.css';
import type { Project, TimeEntry } from '../types';

interface TimeTrackingComponentProps {
  showTimeTracking: boolean;
  setShowTimeTracking: (show: boolean) => void;
  projects: Project[];
  projectsLoading: boolean;
  timeEntries: TimeEntry[];
  timeEntriesLoading: boolean;
  currentProject: string;
  setCurrentProject: (project: string) => void;
  description: string;
  setDescription: (description: string) => void;
  isTracking: boolean;
  startTime: Date | null;
  elapsedTime: number;
  loadProjects: () => void;
  loadTimeEntries: () => void;
  handleStartTracking: () => void;
  handleStopTracking: () => void;
  handleResetTracking: () => void;
  closeOtherFeatures: (activeFeature: string) => void;
}

const TimeTrackingComponent: React.FC<TimeTrackingComponentProps> = ({
  showTimeTracking,
  setShowTimeTracking,
  projects,
  projectsLoading,
  timeEntries,
  timeEntriesLoading,
  currentProject,
  setCurrentProject,
  description,
  setDescription,
  isTracking,
  startTime,
  elapsedTime,
  loadProjects,
  loadTimeEntries,
  handleStartTracking,
  handleStopTracking,
  handleResetTracking,
  closeOtherFeatures,
}) => {
  const [showTimeEntries, setShowTimeEntries] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  // 時間計算関数
  const calculateTimeBreakdown = () => {
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const todayEntries = timeEntries.filter((entry) => {
      const entryDate = new Date(entry.startTime);
      return entryDate >= startOfDay && entryDate < endOfDay;
    });

    const breakdown: { [key: string]: number } = {};
    todayEntries.forEach((entry) => {
      const duration = entry.duration || 0;
      const projectName = entry.projectName || "未分類";
      breakdown[projectName] = (breakdown[projectName] || 0) + duration;
    });

    return breakdown;
  };

  const calculateProductivityTrend = () => {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6); // 7日間（今日含む）

    const productivityData = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(sevenDaysAgo);
      date.setDate(sevenDaysAgo.getDate() + i);

      const startOfDay = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      );
      const endOfDay = new Date(startOfDay);
      endOfDay.setDate(endOfDay.getDate() + 1);

      const dayEntries = timeEntries.filter((entry) => {
        const entryDate = new Date(entry.startTime);
        return entryDate >= startOfDay && entryDate < endOfDay;
      });

      const workHours = dayEntries.reduce(
        (total, entry) => total + (entry.duration || 0),
        0
      ) / 3600; // 秒を時間に変換

      productivityData.push({
        date: date.toISOString().split("T")[0],
        workHours: Math.round(workHours * 100) / 100,
        dayOfWeek: date.toLocaleDateString("ja-JP", { weekday: "short" }),
      });
    }

    return productivityData;
  };

  const calculateProductivityStats = () => {
    const productivityData = calculateProductivityTrend();
    const workHours = productivityData.map((day) => day.workHours);

    const totalHours = workHours.length > 0 ? workHours.reduce((sum, hours) => sum + hours, 0) : 0;
    const averageHours = totalHours / workHours.length;
    const maxHours = workHours.length > 0 ? Math.max(...workHours) : 0;
    const productiveDays = workHours.filter((hours) => hours > 0).length;
    const productivityRate = (productiveDays / workHours.length) * 100;

    return {
      averageHours: Math.round(averageHours * 100) / 100,
      maxHours: Math.round(maxHours * 100) / 100,
      totalHours: Math.round(totalHours * 100) / 100,
      productiveDays,
      productivityRate: Math.round(productivityRate * 100) / 100,
    };
  };

  // 時間フォーマット関数
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 今日の時間記録を取得
  const getTodayEntries = () => {
    const today = new Date().toDateString();
    return timeEntries.filter(entry => {
      const entryDate = new Date(entry.startTime).toDateString();
      return entryDate === today;
    });
  };

  // 今日の総作業時間を計算
  const getTodayTotalTime = () => {
    return getTodayEntries().reduce((total, entry) => {
      return total + (entry.duration || 0);
    }, 0);
  };

  // プロジェクト別の時間を計算
  const getProjectTimeStats = () => {
    const todayEntries = getTodayEntries();
    const projectStats: { [key: string]: number } = {};
    
    todayEntries.forEach(entry => {
      const projectName = entry.projectName || 'その他';
      projectStats[projectName] = (projectStats[projectName] || 0) + (entry.duration || 0);
    });
    
    return projectStats;
  };

  // プロジェクト作成処理
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    try {
      const response = await fetch('/api/projects/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({
          name: newProjectName.trim(),
        }),
      });

      if (response.ok) {
        loadProjects();
        setNewProjectName('');
        setShowProjectForm(false);
      }
    } catch (error) {
      console.error('プロジェクト作成エラー:', error);
    }
  };

  return (
    <div className="time-tracking-section">
      <div className="section-header">
        <h2>
          <span className="section-icon">⏰</span>
          時間管理
        </h2>
        <div className="section-controls">
          {showTimeTracking ? (
            <button
              onClick={() => setShowTimeTracking(false)}
              className="close-section-button"
              title="セクションを閉じる"
            >
              ✕
            </button>
          ) : (
            <button
              onClick={() => {
                closeOtherFeatures("time-tracking");
                setShowTimeTracking(true);
                loadProjects();
                loadTimeEntries();
              }}
              className="show-section-button"
              title="セクションを表示"
            >
              ▶️
            </button>
          )}
        </div>
      </div>

      {showTimeTracking && (
        <div className="time-tracking-content">
          <div className="time-tracking-header">
            <button
              onClick={() => {
                loadProjects();
                loadTimeEntries();
              }}
              className="refresh-button"
              title="データを更新"
            >
              🔄
            </button>
          </div>

          {/* 現在のタイマー */}
          <div className="timer-card">
            <div className="timer-display">
              <div className="timer-time">
                {formatTime(elapsedTime)}
              </div>
              <div className="timer-status">
                {isTracking ? '⏱️ 計測中' : '⏸️ 停止中'}
              </div>
            </div>

            <div className="timer-controls">
              {!isTracking ? (
                <button
                  onClick={handleStartTracking}
                  className="start-button"
                  disabled={!currentProject || !description.trim()}
                >
                  ▶️ 開始
                </button>
              ) : (
                <button
                  onClick={handleStopTracking}
                  className="stop-button"
                >
                  ⏹️ 停止
                </button>
              )}
              
              <button
                onClick={handleResetTracking}
                className="reset-button"
                disabled={isTracking}
              >
                🔄 リセット
              </button>
            </div>
          </div>

          {/* プロジェクト選択と説明入力 */}
          <div className="tracking-form">
            <div className="form-group">
              <label htmlFor="projectSelect">プロジェクト</label>
              <div className="project-select-container">
                <select
                  id="projectSelect"
                  value={currentProject}
                  onChange={(e) => setCurrentProject(e.target.value)}
                  className="project-select"
                  disabled={isTracking}
                >
                  <option value="">プロジェクトを選択</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setShowProjectForm(!showProjectForm)}
                  className="add-project-button"
                  disabled={isTracking}
                  title="新しいプロジェクトを追加"
                >
                  ➕
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">作業内容</label>
              <input
                type="text"
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="何をしていますか？"
                className="description-input"
                disabled={isTracking}
              />
            </div>
          </div>

          {/* プロジェクト作成フォーム */}
          {showProjectForm && (
            <div className="project-form">
              <h3>新しいプロジェクトを作成</h3>
              <form onSubmit={handleCreateProject}>
                <div className="form-group">
                  <input
                    type="text"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="プロジェクト名を入力"
                    className="project-name-input"
                    required
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="create-button">
                    作成
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowProjectForm(false);
                      setNewProjectName('');
                    }}
                    className="cancel-button"
                  >
                    キャンセル
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 今日の統計 */}
          <div className="today-stats">
            <h3>📊 今日の統計</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">総作業時間</span>
                <span className="stat-value">{formatTime(getTodayTotalTime())}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">記録数</span>
                <span className="stat-value">{getTodayEntries().length}件</span>
              </div>
            </div>
          </div>

          {/* プロジェクト別時間 */}
          {Object.keys(getProjectTimeStats()).length > 0 && (
            <div className="project-stats">
              <h3>📈 プロジェクト別時間</h3>
              <div className="project-list">
                {Object.entries(getProjectTimeStats()).map(([projectName, time]) => (
                  <div key={projectName} className="project-item">
                    <span className="project-name">{projectName}</span>
                    <span className="project-time">{formatTime(time)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 時間記録一覧 */}
          <div className="time-entries">
            <div className="entries-header">
              <h3>📝 今日の記録</h3>
              <button
                onClick={() => setShowTimeEntries(!showTimeEntries)}
                className="toggle-entries-button"
              >
                {showTimeEntries ? '隠す' : '表示'}
              </button>
            </div>

            {showTimeEntries && (
              <div className="entries-list">
                {timeEntriesLoading ? (
                  <div className="loading-message">
                    <div className="spinner"></div>
                    <p>記録を読み込み中...</p>
                  </div>
                ) : getTodayEntries().length === 0 ? (
                  <p className="no-entries">今日の記録はありません</p>
                ) : (
                  getTodayEntries()
                    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
                    .map((entry) => (
                      <div key={entry.id} className="entry-item">
                        <div className="entry-info">
                          <div className="entry-project">{entry.projectName || 'その他'}</div>
                          <div className="entry-description">{entry.description}</div>
                          <div className="entry-time">
                            {new Date(entry.startTime).toLocaleTimeString('ja-JP', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })} - {entry.endTime ? new Date(entry.endTime).toLocaleTimeString('ja-JP', {
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : '進行中'}
                          </div>
                        </div>
                        <div className="entry-duration">
                          {formatTime(entry.duration || 0)}
                        </div>
                      </div>
                    ))
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeTrackingComponent;
