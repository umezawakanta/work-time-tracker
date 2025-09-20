import React, { useState } from 'react';
import './ResponseFormModal.css';

interface Memo {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  postType?: string;
  status?: string;
}

interface ResponseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  memo: Memo | null;
  onSubmit: (response: {
    memoId: string;
    response: string;
    status: 'pending' | 'in_progress' | 'resolved' | 'closed';
  }) => Promise<void>;
  loading?: boolean;
}

const ResponseFormModal: React.FC<ResponseFormModalProps> = ({
  isOpen,
  onClose,
  memo,
  onSubmit,
  loading = false
}) => {
  const [adminResponse, setAdminResponse] = useState('');
  const [memoStatus, setMemoStatus] = useState<'pending' | 'in_progress' | 'resolved' | 'closed'>('pending');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // モーダルが開かれた時の初期化
  React.useEffect(() => {
    if (isOpen && memo) {
      setAdminResponse('');
      setMemoStatus(memo.status as any || 'pending');
    }
  }, [isOpen, memo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!memo || !adminResponse.trim()) {
      alert('返信内容を入力してください。');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit({
        memoId: memo.id,
        response: adminResponse.trim(),
        status: memoStatus
      });
      
      // 成功時はフォームをリセット
      setAdminResponse('');
      setMemoStatus('pending');
      onClose();
    } catch (error) {
      console.error('返信の送信に失敗しました:', error);
      alert('返信の送信に失敗しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setAdminResponse('');
    setMemoStatus('pending');
    onClose();
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen || !memo) {
    return null;
  }

  return (
    <div className="response-form-overlay">
      <div className="response-form-modal">
        <div className="response-form-header">
          <h4>
            <i className="bi bi-reply"></i>
            管理者返信
          </h4>
          <button
            onClick={handleClose}
            className="close-response-button"
            title="閉じる"
          >
            <i className="bi bi-x"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="response-form-body">
            <div className="memo-preview">
              <h5>対象メモ</h5>
              <div className="memo-preview-content">
                <p><strong>タイトル:</strong> {memo.title}</p>
                <p><strong>内容:</strong> {memo.content}</p>
                <p><strong>投稿者:</strong> {memo.author}</p>
                <p><strong>投稿日時:</strong> {formatDateTime(memo.createdAt)}</p>
                {memo.postType && (
                  <p><strong>投稿タイプ:</strong> {
                    memo.postType === 'error_report' ? '不具合報告' :
                    memo.postType === 'update_request' ? '更新要望' :
                    memo.postType
                  }</p>
                )}
              </div>
            </div>

            <div className="response-form">
              <div className="form-group">
                <label htmlFor="memoStatus">ステータス</label>
                <select
                  id="memoStatus"
                  value={memoStatus}
                  onChange={(e) => setMemoStatus(e.target.value as any)}
                  className="form-control"
                  disabled={loading}
                >
                  <option value="pending">未対応</option>
                  <option value="in_progress">対応中</option>
                  <option value="resolved">解決済み</option>
                  <option value="closed">クローズ</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="adminResponse">管理者からの返信</label>
                <textarea
                  id="adminResponse"
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  placeholder="対応内容や返信を入力してください..."
                  className="form-control"
                  rows={4}
                  disabled={loading}
                  required
                />
              </div>
            </div>
          </div>

          <div className="response-form-footer">
            <button
              type="button"
              onClick={handleClose}
              className="btn btn-secondary"
              disabled={loading || isSubmitting}
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || isSubmitting || !adminResponse.trim()}
            >
              {isSubmitting ? (
                <>
                  <i className="bi bi-hourglass-split"></i>
                  送信中...
                </>
              ) : (
                <>
                  <i className="bi bi-send"></i>
                  返信を送信
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResponseFormModal;
