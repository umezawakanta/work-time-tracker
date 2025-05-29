import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchBlogPost, addComment, deleteBlogPost, selectBlogPostById, toggleLike, selectBlogPosts } from '@/store/blogSlice';
import { Container, Typography, Box, Chip, Button, Divider, CircularProgress, TextField, IconButton, Card, CardContent, CardActions } from '@mui/material';
import Grid2 from '@mui/material/Grid';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import TwitterIcon from '@mui/icons-material/Twitter';
import FacebookIcon from '@mui/icons-material/Facebook';
import LinkedInIcon from '@mui/icons-material/LinkedIn';

const BlogPostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const post = useSelector((state: RootState) => selectBlogPostById(state, id));
  const allPosts = useSelector(selectBlogPosts);
  const status = useSelector((state: RootState) => state.blog.status);
  const [newComment, setNewComment] = useState('');
  const currentUserId = 'testUser'; // 螳滄圀縺ｮ螳溯｣・〒縺ｯ縲∬ｪ崎ｨｼ繧ｷ繧ｹ繝・Β縺九ｉ繝ｦ繝ｼ繧ｶ繝ｼID繧貞叙蠕励＠縺ｾ縺・

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
    if (id && window.confirm('譛ｬ蠖薙↓縺薙・謚慕ｨｿ繧貞炎髯､縺励∪縺吶°・・)) {
      await dispatch(deleteBlogPost(id));
      navigate('/blog');
    }
  };

  const handleLike = async () => {
    if (id) {
      await dispatch(toggleLike({ postId: id, userId: currentUserId }));
    }
  };

  const getRelatedPosts = () => {
    if (!post) return [];
    return allPosts
      .filter(p => p._id !== post._id)
      .filter(p => 
        p.category === post.category || 
        p.tags.some(tag => post.tags.includes(tag))
      )
      .slice(0, 3);
  };

  const getShareUrl = () => {
    return `${window.location.origin}/blog/${id}`;
  };

  const getTwitterShareUrl = () => {
    const text = encodeURIComponent(`${post?.title} | `);
    const url = encodeURIComponent(getShareUrl());
    return `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
  };

  const getFacebookShareUrl = () => {
    const url = encodeURIComponent(getShareUrl());
    return `https://www.facebook.com/sharer/sharer.php?u=${url}`;
  };

  const getLinkedInShareUrl = () => {
    const url = encodeURIComponent(getShareUrl());
    const title = encodeURIComponent(post?.title || '');
    return `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${title}`;
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
          謚慕ｨｿ縺瑚ｦ九▽縺九ｊ縺ｾ縺帙ｓ
        </Typography>
        <Button component={Link} to="/blog" variant="contained" color="primary">
          繝悶Ο繧ｰ荳隕ｧ縺ｫ謌ｻ繧・
        </Button>
      </Container>
    );
  }
  
  const isLiked = post.likes.includes(currentUserId);
  const relatedPosts = getRelatedPosts();

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        {post.title}
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" gutterBottom>
        繧ｫ繝・ざ繝ｪ繝ｼ: {post.category || '譛ｪ蛻・｡・}
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
            {post.likes.length} 縺・＞縺ｭ
          </Typography>
        </Box>
        <Box>
          <IconButton component="a" href={getTwitterShareUrl()} target="_blank" rel="noopener noreferrer">
            <TwitterIcon />
          </IconButton>
          <IconButton component="a" href={getFacebookShareUrl()} target="_blank" rel="noopener noreferrer">
            <FacebookIcon />
          </IconButton>
          <IconButton component="a" href={getLinkedInShareUrl()} target="_blank" rel="noopener noreferrer">
            <LinkedInIcon />
          </IconButton>
        </Box>
      </Box>
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button component={Link} to="/blog" variant="outlined" sx={{ mr: 1 }}>
          謌ｻ繧・
        </Button>
        <Button component={Link} to={`/blog/edit/${id}`} variant="contained" color="primary" sx={{ mr: 1 }}>
          邱ｨ髮・
        </Button>
        <Button onClick={handleDelete} variant="contained" color="error">
          蜑企勁
        </Button>
      </Box>
      
      {relatedPosts.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            髢｢騾｣險倅ｺ・
          </Typography>
          <Grid2 container spacing={2}>
            {relatedPosts.map((relatedPost) => (
              <Grid2 xs={12} sm={4} key={relatedPost._id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" component="div" noWrap>
                      {relatedPost.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {relatedPost.content.substring(0, 50)}...
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" component={Link} to={`/blog/${relatedPost._id}`}>
                      隱ｭ繧
                    </Button>
                  </CardActions>
                </Card>
              </Grid2>
            ))}
          </Grid2>
        </Box>
      )}

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          繧ｳ繝｡繝ｳ繝・
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
          <Typography variant="body1">縺ｾ縺繧ｳ繝｡繝ｳ繝医・縺ゅｊ縺ｾ縺帙ｓ縲・/Typography>
        )}
      </Box>
      <Box component="form" onSubmit={handleAddComment} sx={{ mt: 4 }}>
        <TextField
          fullWidth
          label="譁ｰ縺励＞繧ｳ繝｡繝ｳ繝・
          multiline
          rows={4}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          margin="normal"
        />
        <Button type="submit" variant="contained" color="primary">
          繧ｳ繝｡繝ｳ繝医ｒ霑ｽ蜉
        </Button>
      </Box>
    </Container>
  );
};

export default BlogPostDetail;
