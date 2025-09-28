/**
 * 協奏機能コンポーネント
 * Phase 5: 協奏機能 - 複数ユーザーでの音楽制作
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import './CollaborativeMusic.css';

export interface Collaborator {
  id: string;
  name: string;
  color: string;
  avatar: string;
  isOnline: boolean;
  lastSeen: Date;
  currentInstrument: string;
  isPlaying: boolean;
}

export interface CollaborativeSession {
  id: string;
  name: string;
  hostId: string;
  participants: Collaborator[];
  maxParticipants: number;
  isPublic: boolean;
  password?: string;
  createdAt: Date;
  lastActivity: Date;
  currentScore: any;
  chatMessages: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
  type: 'text' | 'system' | 'music';
}

export interface CollaborativeMusicProps {
  currentUser: Collaborator;
  onJoinSession: (sessionId: string) => void;
  onLeaveSession: () => void;
  onCreateSession: (sessionData: Partial<CollaborativeSession>) => void;
  onSendMessage: (message: string) => void;
  onPlayNote: (note: number, duration: number, instrument: string) => void;
  onStopPlayback: () => void;
}

const CollaborativeMusic: React.FC<CollaborativeMusicProps> = ({
  currentUser,
  onJoinSession,
  onLeaveSession,
  onCreateSession,
  onSendMessage,
  onPlayNote,
  onStopPlayback
}) => {
  const [currentSession, setCurrentSession] = useState<CollaborativeSession | null>(null);
  const [availableSessions, setAvailableSessions] = useState<CollaborativeSession[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [selectedInstrument, setSelectedInstrument] = useState('piano');
  const [isRecording, setIsRecording] = useState(false);
  const [recordedNotes, setRecordedNotes] = useState<any[]>([]);
  const [showParticipants, setShowParticipants] = useState(false);
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const recordingStartTime = useRef<number>(0);

  // 利用可能なセッションを取得
  useEffect(() => {
    loadAvailableSessions();
    const interval = setInterval(loadAvailableSessions, 5000);
    return () => clearInterval(interval);
  }, []);

  // チャットの自動スクロール
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [currentSession?.chatMessages]);

  const loadAvailableSessions = useCallback(async () => {
    try {
      // 実際の実装では、APIからセッション一覧を取得
      const mockSessions: CollaborativeSession[] = [
        {
          id: 'session1',
          name: '朝の音楽セッション',
          hostId: 'user1',
          participants: [
            { id: 'user1', name: '田中さん', color: '#ff6b6b', avatar: '👨‍💼', isOnline: true, lastSeen: new Date(), currentInstrument: 'piano', isPlaying: false },
            { id: 'user2', name: '佐藤さん', color: '#4ecdc4', avatar: '👩‍🎨', isOnline: true, lastSeen: new Date(), currentInstrument: 'guitar', isPlaying: true }
          ],
          maxParticipants: 4,
          isPublic: true,
          createdAt: new Date(Date.now() - 3600000),
          lastActivity: new Date(),
          currentScore: null,
          chatMessages: []
        },
        {
          id: 'session2',
          name: '夜のジャムセッション',
          hostId: 'user3',
          participants: [
            { id: 'user3', name: '山田さん', color: '#45b7d1', avatar: '👨‍🎤', isOnline: true, lastSeen: new Date(), currentInstrument: 'drums', isPlaying: false }
          ],
          maxParticipants: 6,
          isPublic: true,
          password: 'jam2024',
          createdAt: new Date(Date.now() - 1800000),
          lastActivity: new Date(),
          currentScore: null,
          chatMessages: []
        }
      ];
      setAvailableSessions(mockSessions);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  }, []);

  const handleCreateSession = useCallback((sessionData: Partial<CollaborativeSession>) => {
    const newSession: CollaborativeSession = {
      id: `session_${Date.now()}`,
      name: sessionData.name || '新しいセッション',
      hostId: currentUser.id,
      participants: [currentUser],
      maxParticipants: sessionData.maxParticipants || 4,
      isPublic: sessionData.isPublic ?? true,
      password: sessionData.password,
      createdAt: new Date(),
      lastActivity: new Date(),
      currentScore: null,
      chatMessages: []
    };
    
    setCurrentSession(newSession);
    setShowCreateModal(false);
    onCreateSession(newSession);
  }, [currentUser, onCreateSession]);

  const handleJoinSession = useCallback((sessionId: string) => {
    const session = availableSessions.find(s => s.id === sessionId);
    if (session && session.participants.length < session.maxParticipants) {
      setCurrentSession(session);
      setShowJoinModal(false);
      onJoinSession(sessionId);
    }
  }, [availableSessions, onJoinSession]);

  const handleLeaveSession = useCallback(() => {
    setCurrentSession(null);
    onLeaveSession();
  }, [onLeaveSession]);

  const handleSendMessage = useCallback(() => {
    if (newMessage.trim() && currentSession) {
      const message: ChatMessage = {
        id: `msg_${Date.now()}`,
        userId: currentUser.id,
        userName: currentUser.name,
        message: newMessage.trim(),
        timestamp: new Date(),
        type: 'text'
      };
      
      setCurrentSession(prev => prev ? {
        ...prev,
        chatMessages: [...prev.chatMessages, message]
      } : null);
      
      setNewMessage('');
      onSendMessage(newMessage.trim());
    }
  }, [newMessage, currentSession, currentUser, onSendMessage]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const handlePlayNote = useCallback((note: number) => {
    const duration = 1.0;
    onPlayNote(note, duration, selectedInstrument);
    
    if (isRecording) {
      const recordedNote = {
        note,
        duration,
        instrument: selectedInstrument,
        timestamp: Date.now() - recordingStartTime.current
      };
      setRecordedNotes(prev => [...prev, recordedNote]);
    }
  }, [onPlayNote, selectedInstrument, isRecording]);

  const handleStartRecording = useCallback(() => {
    setIsRecording(true);
    setRecordedNotes([]);
    recordingStartTime.current = Date.now();
  }, []);

  const handleStopRecording = useCallback(() => {
    setIsRecording(false);
    // 録音したノートをセッションに送信
    if (currentSession && recordedNotes.length > 0) {
      const message: ChatMessage = {
        id: `msg_${Date.now()}`,
        userId: currentUser.id,
        userName: currentUser.name,
        message: `録音した音楽を共有しました (${recordedNotes.length}個のノート)`,
        timestamp: new Date(),
        type: 'music'
      };
      
      setCurrentSession(prev => prev ? {
        ...prev,
        chatMessages: [...prev.chatMessages, message]
      } : null);
    }
  }, [isRecording, recordedNotes, currentSession, currentUser]);

  const handleStopPlayback = useCallback(() => {
    onStopPlayback();
  }, [onStopPlayback]);

  if (!currentSession) {
    return (
      <div className="collaborative-music">
        <div className="session-browser">
          <h2>🎵 協奏セッション</h2>
          
          <div className="session-actions">
            <button 
              className="create-session-btn"
              onClick={() => setShowCreateModal(true)}
            >
              ➕ 新しいセッションを作成
            </button>
            <button 
              className="join-session-btn"
              onClick={() => setShowJoinModal(true)}
            >
              🔍 セッションに参加
            </button>
          </div>

          <div className="available-sessions">
            <h3>利用可能なセッション</h3>
            {availableSessions.map(session => (
              <div key={session.id} className="session-card">
                <div className="session-info">
                  <h4>{session.name}</h4>
                  <p>参加者: {session.participants.length}/{session.maxParticipants}</p>
                  <p>ホスト: {session.participants.find(p => p.id === session.hostId)?.name}</p>
                  <p>作成: {session.createdAt.toLocaleString()}</p>
                </div>
                <div className="session-participants">
                  {session.participants.map(participant => (
                    <span 
                      key={participant.id}
                      className="participant-avatar"
                      style={{ backgroundColor: participant.color }}
                      title={participant.name}
                    >
                      {participant.avatar}
                    </span>
                  ))}
                </div>
                <button 
                  className="join-btn"
                  onClick={() => handleJoinSession(session.id)}
                  disabled={session.participants.length >= session.maxParticipants}
                >
                  参加
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* セッション作成モーダル */}
        {showCreateModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>新しいセッションを作成</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleCreateSession({
                  name: formData.get('name') as string,
                  maxParticipants: parseInt(formData.get('maxParticipants') as string),
                  isPublic: formData.get('isPublic') === 'on',
                  password: formData.get('password') as string || undefined
                });
              }}>
                <label>
                  セッション名:
                  <input type="text" name="name" required />
                </label>
                <label>
                  最大参加者数:
                  <input type="number" name="maxParticipants" min="2" max="10" defaultValue="4" />
                </label>
                <label>
                  <input type="checkbox" name="isPublic" defaultChecked />
                  公開セッション
                </label>
                <label>
                  パスワード (任意):
                  <input type="password" name="password" />
                </label>
                <div className="modal-actions">
                  <button type="submit">作成</button>
                  <button type="button" onClick={() => setShowCreateModal(false)}>キャンセル</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* セッション参加モーダル */}
        {showJoinModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>セッションに参加</h3>
              <div className="session-list">
                {availableSessions.map(session => (
                  <div key={session.id} className="session-item">
                    <div className="session-details">
                      <h4>{session.name}</h4>
                      <p>{session.participants.length}/{session.maxParticipants} 参加者</p>
                    </div>
                    <button 
                      onClick={() => handleJoinSession(session.id)}
                      disabled={session.participants.length >= session.maxParticipants}
                    >
                      参加
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={() => setShowJoinModal(false)}>閉じる</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="collaborative-music">
      <div className="session-header">
        <div className="session-title">
          <h2>{currentSession.name}</h2>
          <span className="participant-count">
            {currentSession.participants.length}/{currentSession.maxParticipants}
          </span>
        </div>
        <div className="session-controls">
          <button 
            className="participants-btn"
            onClick={() => setShowParticipants(!showParticipants)}
          >
            👥 参加者
          </button>
          <button 
            className="leave-btn"
            onClick={handleLeaveSession}
          >
            🚪 退出
          </button>
        </div>
      </div>

      <div className="session-content">
        {/* 参加者一覧 */}
        {showParticipants && (
          <div className="participants-panel">
            <h3>参加者</h3>
            {currentSession.participants.map(participant => (
              <div key={participant.id} className="participant-item">
                <span 
                  className="participant-avatar"
                  style={{ backgroundColor: participant.color }}
                >
                  {participant.avatar}
                </span>
                <span className="participant-name">{participant.name}</span>
                <span className="participant-status">
                  {participant.isOnline ? '🟢' : '🔴'}
                </span>
                <span className="participant-instrument">
                  {participant.currentInstrument}
                </span>
                {participant.isPlaying && (
                  <span className="playing-indicator">🎵</span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 音楽制作エリア */}
        <div className="music-creation">
          <div className="instrument-selector">
            <label htmlFor="instrument-selector">楽器:</label>
            <select 
              id="instrument-selector"
              value={selectedInstrument} 
              onChange={(e) => setSelectedInstrument(e.target.value)}
            >
              <option value="piano">ピアノ</option>
              <option value="guitar">ギター</option>
              <option value="drums">ドラム</option>
              <option value="bass">ベース</option>
              <option value="synth">シンセ</option>
            </select>
          </div>

          <div className="piano-keyboard">
            {[60, 62, 64, 65, 67, 69, 71, 72].map(note => (
              <button
                key={note}
                className={`piano-key ${note % 12 === 0 || note % 12 === 2 || note % 12 === 4 || note % 12 === 5 || note % 12 === 7 || note % 12 === 9 || note % 12 === 11 ? 'white' : 'black'}`}
                onMouseDown={() => handlePlayNote(note)}
                onTouchStart={() => handlePlayNote(note)}
              >
                {note}
              </button>
            ))}
          </div>

          <div className="recording-controls">
            <button 
              className={`record-btn ${isRecording ? 'recording' : ''}`}
              onClick={isRecording ? handleStopRecording : handleStartRecording}
            >
              {isRecording ? '⏹️ 録音停止' : '⏺️ 録音開始'}
            </button>
            <button 
              className="stop-btn"
              onClick={handleStopPlayback}
            >
              ⏹️ 停止
            </button>
            {recordedNotes.length > 0 && (
              <span className="recorded-count">
                録音済み: {recordedNotes.length}個のノート
              </span>
            )}
          </div>
        </div>

        {/* チャットエリア */}
        <div className="chat-area">
          <div className="chat-messages" ref={chatContainerRef}>
            {currentSession.chatMessages.map(message => (
              <div key={message.id} className={`message ${message.userId === currentUser.id ? 'own' : 'other'}`}>
                <span className="message-user">{message.userName}:</span>
                <span className="message-content">{message.message}</span>
                <span className="message-time">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
          <div className="chat-input">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="メッセージを入力..."
            />
            <button onClick={handleSendMessage}>送信</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollaborativeMusic;
