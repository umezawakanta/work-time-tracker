import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { AppDispatch, RootState } from '@/store';
import { updateBlogPost, selectBlogPostById } from '@/store/blogSlice';
import { Container, Typography, TextField, Button, Box } from '@mui/material';

const EditBlogPost: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const post = useSelector((state: RootState) => selectBlogPostById(state, id));
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setContent(post.content);
      setCategory(post.category);
    }
  }, [post]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (id) {
      try {
        await dispatch(updateBlogPost({ _id: id, updates: { title, content, category } })).unwrap();
        navigate(`/blog/${id}`);
      } catch (error) {
        console.error('Failed to update blog post:', error);
      }
    }
  };

  if (!post) {
    return <Typography>投稿が見つかりません</Typography>;
  }

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        投稿を編集
      </Typography>
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
        <TextField
          margin="normal"
          required
          fullWidth
          id="title"
          label="タイトル"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          name="category"
          label="カテゴリー"
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          name="content"
          label="内容"
          id="content"
          multiline
          rows={6}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
        >
          更新する
        </Button>
      </Box>
    </Container>
  );
};

export default EditBlogPost;