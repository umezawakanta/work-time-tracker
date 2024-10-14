import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchBlogPost, addComment, deleteBlogPost, selectBlogPostById } from '@/store/blogSlice';
import { Container, Typography, Box, Button, Divider, CircularProgress, TextField } from '@mui/material';

const BlogPostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const post = useSelector((state: RootState) => selectBlogPostById(state, id));
  const status = useSelector((state: RootState) => state.blog.status);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    if (id) {
      dispatch(fetchBlogPost(id));
    }
  }, [id, dispatch]);

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

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        {post.title}
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" gutterBottom>
        カテゴリー: {post.category || '未分類'}
      </Typography>
      <Typography variant="body1" paragraph>
        {post.content}
      </Typography>
      <Box sx={{ mt: 2, mb: 4 }}>
        <Button component={Link} to={`/blog/edit/${id}`} variant="contained" color="primary" sx={{ mr: 2 }}>
          編集
        </Button>
        <Button onClick={handleDelete} variant="contained" color="error">
          削除
        </Button>
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
      <Button component={Link} to="/blog" variant="contained" color="primary" sx={{ mt: 4 }}>
        ブログ一覧に戻る
      </Button>
    </Container>
  );
};

export default BlogPostDetail;