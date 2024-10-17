import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addBlogPost } from '@/store/blogSlice';
import { AppDispatch } from '@/store';
import { BlogPostForm } from '@/components/BlogPostForm';
import { Container, Typography, Box } from '@mui/material';

const NewBlogPost: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: {
    title: string;
    content: string;
    category: string;
    tags: string[];
  }) => {
    try {
      const resultAction = await dispatch(
        addBlogPost({
          ...formData,
          author: 'Current User', // Replace with actual user data
          status: 'published'
        })
      );
      if (addBlogPost.fulfilled.match(resultAction)) {
        navigate(`/blog/${resultAction.payload._id}`);
      } else {
        setError('Failed to create blog post');
      }
    } catch (error) {
      setError('An error occurred while creating the blog post');
      console.error('Error creating blog post:', error);
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        Create New Blog Post
      </Typography>
      {error && (
        <Box mb={2}>
          <Typography color="error">{error}</Typography>
        </Box>
      )}
      <BlogPostForm onSubmit={handleSubmit} submitButtonText="Publish" />
    </Container>
  );
};

export default NewBlogPost;