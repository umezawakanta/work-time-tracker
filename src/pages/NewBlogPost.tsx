import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AppDispatch } from '@/store';
import { addBlogPost } from '@/store/blogSlice';
import { Container, Typography, TextField, Button, Box, Chip, Paper } from '@mui/material';

const NewBlogPost: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(addBlogPost({ title, content, category, tags, author: 'Current User' })).unwrap();
      navigate('/blog');
    } catch (error) {
      console.error('Failed to create blog post:', error);
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
        新規投稿
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
        <Paper sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', listStyle: 'none', p: 0.5, m: 0 }}>
          {tags.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              onDelete={() => handleDeleteTag(tag)}
              sx={{ m: 0.5 }}
            />
          ))}
        </Paper>
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
        >
          投稿する
        </Button>
      </Box>
    </Container>
  );
};

export default NewBlogPost;