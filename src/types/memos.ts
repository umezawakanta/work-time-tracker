// メモ関連の型定義

export interface MemosComponentProps {
  showMemos: boolean;
  setShowMemos: (show: boolean) => void;
  closeOtherFeatures: (activeFeature: string) => void;
  memos: Memo[];
  showMemoForm: boolean;
  setShowMemoForm: (show: boolean) => void;
  editingMemo: Memo | null;
  setEditingMemo: (memo: Memo | null) => void;
  memoTitle: string;
  setMemoTitle: (title: string) => void;
  memoContent: string;
  setMemoContent: (content: string) => void;
  memoCategory: string;
  setMemoCategory: (category: string) => void;
  memoTags: string[];
  setMemoTags: (tags: string[]) => void;
  memoIsPublic: boolean;
  setMemoIsPublic: (isPublic: boolean) => void;
  memoIsFamilyOnly: boolean;
  setMemoIsFamilyOnly: (isFamilyOnly: boolean) => void;
  memoIsAdminOnly: boolean;
  setMemoIsAdminOnly: (isAdminOnly: boolean) => void;
  selectedMemoCategory: string;
  setSelectedMemoCategory: (category: string) => void;
  getMemoCategories: () => string[];
  loading: boolean;
  loadMemos: () => Promise<void>;
  handleCreateMemo: (e: React.FormEvent) => void;
  handleUpdateMemo: (e: React.FormEvent) => void;
  handleEditMemo: (memo: Memo) => void;
  handleDeleteMemo: (memoId: string, memoTitle: string) => void;
  handleMemoCategoryChange: (category: string) => void;
  handleLikeMemo: (memoId: string) => Promise<void>;
  handleUnlikeMemo: (memoId: string) => Promise<void>;
  handleReplyToMemo: (memoId: string, content: string) => Promise<void>;
  handleDeleteReply: (replyId: string) => Promise<void>;
  handleLikeReply: (replyId: string) => Promise<void>;
  handleUnlikeReply: (replyId: string) => Promise<void>;
}

export interface GenreManagementProps {
  isOpen: boolean;
  onClose: () => void;
  customCategories: string[];
  setCustomCategories: (categories: string[]) => void;
  deletedDefaultCategories: string[];
  setDeletedDefaultCategories: (categories: string[]) => void;
  onSave: () => void;
  DEFAULT_CATEGORIES?: string[];
}

export interface MemoItemProps {
  memo: Memo;
  onEdit: (memo: Memo) => void;
  onDelete: (memoId: string, memoTitle: string) => void;
  onLike: (memoId: string) => Promise<void>;
  onUnlike: (memoId: string) => Promise<void>;
  onReply: (memoId: string, content: string) => Promise<void>;
  onDeleteReply: (replyId: string) => Promise<void>;
  onLikeReply: (replyId: string) => Promise<void>;
  onUnlikeReply: (replyId: string) => Promise<void>;
  currentUserId: string;
  isLiked: boolean;
  isReplyLiked: (replyId: string) => boolean;
}

export interface MemoFormProps {
  isEditing: boolean;
  title: string;
  setTitle: (title: string) => void;
  content: string;
  setContent: (content: string) => void;
  category: string;
  setCategory: (category: string) => void;
  tags: string[];
  setTags: (tags: string[]) => void;
  isPublic: boolean;
  setIsPublic: (isPublic: boolean) => void;
  isFamilyOnly: boolean;
  setIsFamilyOnly: (isFamilyOnly: boolean) => void;
  isAdminOnly: boolean;
  setIsAdminOnly: (isAdminOnly: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  loading: boolean;
  availableCategories: string[];
}

export interface RepliesSectionProps {
  replies: Reply[];
  memoId: string;
  onReply: (memoId: string, content: string) => Promise<void>;
  onDeleteReply: (replyId: string) => Promise<void>;
  onLikeReply: (replyId: string) => Promise<void>;
  onUnlikeReply: (replyId: string) => Promise<void>;
  currentUserId: string;
  isReplyLiked: (replyId: string) => boolean;
}

export interface MemoFiltersProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  onReset: () => void;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}
