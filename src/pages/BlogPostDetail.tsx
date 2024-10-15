import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchBlogPost, addComment, deleteBlogPost, selectBlogPostById, toggleLike } from '@/store/blogSlice';
import { Container, Typography, Box, Chip, Button, Divider, CircularProgress, TextField, IconButton } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

const BlogPostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const post = useSelector((state: RootState) => selectBlogPostById(state, id));
  const status = useSelector((state: RootState) => state.blog.status);
  const [newComment, setNewComment] = useState('');
  const currentUserId = 'testUser'; // 実際の実装では、認証システムからユーザーIDを取得します

  useEffect(() => {
    if (id) {
      dispatch(fetchBlogPost(id));
    }
  }, [dispatch, id]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (id && newComment.trim()) {
      await dispatch(addComment({ postId: id, comment: { content: newComment, author: 'Current User' } }));
      setNewComment('');
    }
  };

  const handleDelete = async () => {
    if (id && window.confirm('本当にこの投稿を削除しますか？')) {
      await dispatch(deleteBlogPost(id));
      navigate('/blog');
    }
  };

  const handleLike = async () => {
    if (id) {
      await dispatch(toggleLike({ postId: id, userId: currentUserId }));
    }
  };

  if (status === 'loading') {
    return (
      <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!post) {
    return (
      <Container maxWidth="lg">
        <Typography variant="h4" component="h1" gutterBottom>
          投稿が見つかりません
        </Typography>
        <Button component={Link} to="/blog" variant="contained" color="primary">
          ブログ一覧に戻る
        </Button>
      </Container>
    );
  }
  
  const isLiked = post.likes.includes(currentUserId);

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        {post.title}
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" gutterBottom>
        カテゴリー: {post.category || '未分類'}
      </Typography>
      <Box sx={{ mb: 2 }}>
        {post.tags.map((tag) => (
          <Chip key={tag} label={tag} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
        ))}
      </Box>
      <Typography variant="body1" paragraph>
        {post.content}
      </Typography>
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <IconButton onClick={handleLike} color={isLiked ? 'secondary' : 'default'}>
            {isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          </IconButton>
          <Typography variant="body2" component="span">
            {post.likes.length} いいね
          </Typography>
        </Box>
        <Box>
          <Button component={Link} to="/blog" variant="outlined" sx={{ mr: 1 }}>
            戻る
          </Button>
          <Button component={Link} to={`/blog/edit/${id}`} variant="contained" color="primary" sx={{ mr: 1 }}>
            編集
          </Button>
          <Button onClick={handleDelete} variant="contained" color="error">
            削除
          </Button>
        </Box>
      </Box>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          コメント
        </Typography>
        <Divider />
        {post.comments && post.comments.length > 0 ? (
          post.comments.map((comment) => (
            <Box key={comment._id} sx={{ my: 2 }}>
              <Typography variant="body2" color="textSecondary">
                {comment.author} - {new Date(comment.createdAt).toLocaleString()}
              </Typography>
              <Typography variant="body1">{comment.content}</Typography>
            </Box>
          ))
        ) : (
          <Typography variant="body1">まだコメントはありません。</Typography>
        )}
      </Box>
      <Box component="form" onSubmit={handleAddComment} sx={{ mt: 4 }}>
        <TextField
          fullWidth
          label="新しいコメント"
          multiline
          rows={4}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          margin="normal"
        />
        <Button type="submit" variant="contained" color="primary">
          コメントを追加
        </Button>
      </Box>
    </Container>
  );
};

export default BlogPostDetail;