import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store';
import { Link } from 'react-router-dom';
import { fetchBlogPosts, selectBlogPosts, selectBlogStatus } from '@/store/blogSlice';
import { Button, Container, Typography, Grid, Card, CardContent, CardActions, CircularProgress, Pagination } from '@mui/material';

const POSTS_PER_PAGE = 6;

const BlogPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const blogPosts = useSelector(selectBlogPosts);
  const status = useSelector(selectBlogStatus);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchBlogPosts());
    }
  }, [status, dispatch]);

  const handleChangePage = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  if (status === 'loading') {
    return (
      <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  const indexOfLastPost = page * POSTS_PER_PAGE;
  const indexOfFirstPost = indexOfLastPost - POSTS_PER_PAGE;
  const currentPosts = blogPosts.slice(indexOfFirstPost, indexOfLastPost);

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        ブログ
      </Typography>
      <Button component={Link} to="/blog/new" variant="contained" color="primary" sx={{ mb: 2 }}>
        新規投稿
      </Button>
      <Grid container spacing={4}>
        {currentPosts.map((post) => (
          <Grid item xs={12} sm={6} md={4} key={post._id}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="h2">
                  {post.title}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  カテゴリー: {post.category}
                </Typography>
                <Typography variant="body2" component="p">
                  {post.content.substring(0, 100)}...
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" component={Link} to={`/blog/${post._id}`}>
                  続きを読む
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Pagination
        count={Math.ceil(blogPosts.length / POSTS_PER_PAGE)}
        page={page}
        onChange={handleChangePage}
        color="primary"
        sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}
      />
    </Container>
  );
};

export default BlogPage;