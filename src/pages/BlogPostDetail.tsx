import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchBlogPosts, selectBlogPosts } from '@/store/blogSlice';
import { Container, Typography, Box, Button, Divider, CircularProgress } from '@mui/material';

const BlogPostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const blogPosts = useSelector(selectBlogPosts);
  const status = useSelector((state: RootState) => state.blog.status);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchBlogPosts());
    }
  }, [status, dispatch]);

  const post = blogPosts.find(post => post._id === id);

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
        カテゴリー: {post.category}
      </Typography>
      <Typography variant="body1" paragraph>
        {post.content}
      </Typography>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          コメント
        </Typography>
        <Divider />
        {post.comments.length > 0 ? (
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
      <Button component={Link} to="/blog" variant="contained" color="primary" sx={{ mt: 4 }}>
        ブログ一覧に戻る
      </Button>
    </Container>
  );
};

export default BlogPostDetail;