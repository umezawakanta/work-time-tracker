import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { AppDispatch, RootState } from '@/store';
import { updateBlogPost, selectBlogPostById } from '@/store/blogSlice';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Chip,
  Paper,
  CircularProgress,
} from '@mui/material';

const EditBlogPost: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const post = useSelector((state: RootState) => selectBlogPostById(state, id));
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');

  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setContent(post.content);
      setCategory(post.category);
      setTags(post.tags);
    }
  }, [post]);

  if (!post) {
    return (
      <Container
        maxWidth="lg"
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}
      >
        <CircularProgress />
      </Container>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(
        updateBlogPost({ _id: post._id, updates: { title, content, category, tags } })
      ).unwrap();
      navigate(`/blog/${post._id}`);
    } catch (error) {
      console.error('Failed to update blog post:', error);
    }
  };

  const handleAddTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const handleDeleteTag = (tagToDelete: string) => {
    setTags(tags.filter((tag) => tag !== tagToDelete));
  };

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
          autoFocus
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
        <Box sx={{ mt: 2, mb: 2 }}>
          <TextField
            fullWidth
            name="tag"
            label="タグ"
            id="tag"
            value={currentTag}
            onChange={(e) => setCurrentTag(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTag();
              }
            }}
          />
          <Button onClick={handleAddTag} variant="outlined" sx={{ mt: 1 }}>
            タグを追加
          </Button>
        </Box>
        <Paper
          sx={{
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            listStyle: 'none',
            p: 0.5,
            m: 0,
          }}
        >
          {tags.map((tag) => (
            <Chip key={tag} label={tag} onDelete={() => handleDeleteTag(tag)} sx={{ m: 0.5 }} />
          ))}
        </Paper>
        <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
          更新する
        </Button>
      </Box>
    </Container>
  );
};

export default EditBlogPost;
