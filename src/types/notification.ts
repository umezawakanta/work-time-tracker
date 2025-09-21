export interface Notification {
  _id: string;
  type: 'memo_response' | 'status_update' | 'admin_message' | 'memo_reply' | 'admin_announcement';
  title: string;
  message: string;
  relatedMemoId?: string;
  isRead: boolean;
  createdAt: string;
}
