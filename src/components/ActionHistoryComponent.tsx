import React, { useState, useEffect } from 'react';
import './ActionHistoryComponent.css';
import type { ActionRecord, User } from '../types';
import { actionHistoryManager } from '../utils/actionHistoryManager';

interface ActionHistoryComponentProps {
  showActionHistory: boolean;
  setShowActionHistory: (show: boolean) => void;
  closeOtherFeatures: (activeFeature: string) => void;
  user: User | null;
}

const ActionHistoryComponent: React.FC<ActionHistoryComponentProps> = ({
  showActionHistory,
  setShowActionHistory,
  closeOtherFeatures,
  user
}) => {
  const [actionRecords, setActionRecords] = useState<ActionRecord[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ActionRecord | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('week');

  // フォームの状態
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'work' | 'personal' | 'health' | 'learning' | 'social' | 'finance' | 'other'>('work');
  const [subcategory, setSubcategory] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [participants, setParticipants] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [mood, setMood] = useState<number>(3);
  const [energy, setEnergy] = useState<number>(3);
  const [productivity, setProductivity] = useState<number>(3);
  const [notes, setNotes] = useState('');
  const [isCompleted, setIsCompleted] = useState(true);

  const categories = [
    { value: 'work', label: '仕事', subcategories: ['会議', '作業', '学習', 'その他'] },
    { value: 'personal', label: '個人', subcategories: ['家事', '趣味', '休息', 'その他'] },
    { value: 'health', label: '健康', subcategories: ['運動', '食事', '医療', 'その他'] },
    { value: 'learning', label: '学習', subcategories: ['読書', '講座', '実践', 'その他'] },
    { value: 'social', label: '社交', subcategories: ['家族', '友人', '同僚', 'その他'] },
    { value: 'finance', label: '財務', subcategories: ['投資', '節約', '収入', 'その他'] },
    { value: 'other', label: 'その他', subcategories: ['その他'] }
  ];

  useEffect(() => {
    if (showActionHistory) {
      loadActionRecords();
    }
  }, [showActionHistory]);

  const loadActionRecords = () => {
    const records = actionHistoryManager.getActionRecords();
    setActionRecords(records);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    const recordData = {
      userId: user.id,
      title,
      description,
      category,
      subcategory: subcategory || undefined,
      startTime: new Date(startTime).toISOString(),
      endTime: endTime ? new Date(endTime).toISOString() : undefined,
      duration: endTime ? Math.round((new Date(endTime).getTime() - new Date(startTime).getTime()) / (1000 * 60)) : undefined,
      location: location || undefined,
      participants: participants.length > 0 ? participants : undefined,
      tags,
      mood,
      energy,
      productivity,
      notes: notes || undefined,
      isCompleted,
    };

    if (editingRecord) {
      actionHistoryManager.updateActionRecord(editingRecord._id, recordData);
    } else {
      actionHistoryManager.addActionRecord(recordData);
    }

    resetForm();
    loadActionRecords();
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('work');
    setSubcategory('');
    setStartTime('');
    setEndTime('');
    setLocation('');
    setParticipants([]);
    setTags([]);
    setMood(3);
    setEnergy(3);
    setProductivity(3);
    setNotes('');
    setIsCompleted(true);
    setEditingRecord(null);
    setShowForm(false);
  };

  const editRecord = (record: ActionRecord) => {
    setTitle(record.title);
    setDescription(record.description);
    setCategory(record.category);
    setSubcategory(record.subcategory || '');
    setStartTime(new Date(record.startTime).toISOString().slice(0, 16));
    setEndTime(record.endTime ? new Date(record.endTime).toISOString().slice(0, 16) : '');
    setLocation(record.location || '');
    setParticipants(record.participants || []);
    setTags(record.tags);
    setMood(record.mood || 3);
    setEnergy(record.energy || 3);
    setProductivity(record.productivity || 3);
    setNotes(record.notes || '');
    setIsCompleted(record.isCompleted);
    setEditingRecord(record);
    setShowForm(true);
  };

  const deleteRecord = (id: string) => {
    if (window.confirm('この行動記録を削除しますか？')) {
      actionHistoryManager.deleteActionRecord(id);
      loadActionRecords();
    }
  };

  const filteredRecords = actionRecords.filter(record => {
    if (selectedCategory !== 'all' && record.category !== selectedCategory) {
      return false;
    }
    return true;
  });

  if (!showActionHistory) return null;

  return (
    <div className="action-history-component">
      <div className="action-history-header">
        <h2>行動記録</h2>
        <div className="action-history-controls">
          <button
            className="add-action-btn"
            onClick={() => setShowForm(true)}
          >
            + 行動を記録
          </button>
          <button
            className="close-btn"
            onClick={() => setShowActionHistory(false)}
          >
            ×
          </button>
        </div>
      </div>

      <div className="action-history-filters">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          title="カテゴリを選択"
          aria-label="カテゴリを選択"
        >
          <option value="all">すべてのカテゴリ</option>
          {categories.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
      </div>

      <div className="action-records-list">
        {filteredRecords.length === 0 ? (
          <p className="no-records">記録がありません</p>
        ) : (
          filteredRecords.map(record => (
            <div key={record._id} className="action-record-item">
              <div className="record-header">
                <h3>{record.title}</h3>
                <div className="record-actions">
                  <button onClick={() => editRecord(record)}>編集</button>
                  <button onClick={() => deleteRecord(record._id)}>削除</button>
                </div>
              </div>
              <div className="record-details">
                <p><strong>カテゴリ:</strong> {categories.find(c => c.value === record.category)?.label}</p>
                {record.subcategory && <p><strong>サブカテゴリ:</strong> {record.subcategory}</p>}
                <p><strong>開始時間:</strong> {new Date(record.startTime).toLocaleString()}</p>
                {record.endTime && <p><strong>終了時間:</strong> {new Date(record.endTime).toLocaleString()}</p>}
                {record.duration && <p><strong>継続時間:</strong> {record.duration}分</p>}
                {record.location && <p><strong>場所:</strong> {record.location}</p>}
                {record.participants && record.participants.length > 0 && (
                  <p><strong>参加者:</strong> {record.participants.join(', ')}</p>
                )}
                {record.tags.length > 0 && (
                  <p><strong>タグ:</strong> {record.tags.join(', ')}</p>
                )}
                <div className="record-scores">
                  <span>気分: {record.mood}/5</span>
                  <span>エネルギー: {record.energy}/5</span>
                  <span>生産性: {record.productivity}/5</span>
                </div>
                {record.notes && <p><strong>メモ:</strong> {record.notes}</p>}
              </div>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <div className="form-overlay">
          <div className="form-container">
            <h3>{editingRecord ? '行動記録を編集' : '行動記録を追加'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>タイトル *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="行動のタイトルを入力"
                  title="行動のタイトル"
                  required
                />
              </div>
              <div className="form-group">
                <label>説明</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="行動の詳細説明を入力"
                  title="行動の説明"
                  rows={3}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>カテゴリ *</label>
                  <select
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value as any);
                      setSubcategory('');
                    }}
                    title="カテゴリを選択"
                    aria-label="カテゴリを選択"
                    required
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>サブカテゴリ</label>
                  <select
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    title="サブカテゴリを選択"
                    aria-label="サブカテゴリを選択"
                  >
                    <option value="">選択してください</option>
                    {categories.find(c => c.value === category)?.subcategories.map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>開始時間 *</label>
                  <input
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    title="開始時間を選択"
                    placeholder="開始時間を選択"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>終了時間</label>
                  <input
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    title="終了時間を選択"
                    placeholder="終了時間を選択"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>場所</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  title="場所を入力"
                  placeholder="場所を入力"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>気分 (1-5)</label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={mood}
                    onChange={(e) => setMood(parseInt(e.target.value))}
                    title="気分を選択"
                    aria-label="気分を選択"
                  />
                  <span>{mood}</span>
                </div>
                <div className="form-group">
                  <label>エネルギー (1-5)</label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={energy}
                    onChange={(e) => setEnergy(parseInt(e.target.value))}
                  />
                  <span>{energy}</span>
                </div>
                <div className="form-group">
                  <label>生産性 (1-5)</label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={productivity}
                    onChange={(e) => setProductivity(parseInt(e.target.value))}
                  />
                  <span>{productivity}</span>
                </div>
              </div>
              <div className="form-group">
                <label>メモ</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="submit-btn">
                  {editingRecord ? '更新' : '追加'}
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

export default ActionHistoryComponent;
