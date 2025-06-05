import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addBlogPost } from '@/store/blogSlice';
import { AppDispatch } from '@/store';
import { EnhancedBlogPostForm } from '@/components/EnhancedBlogPostForm';
import { Container, Typography, Box, Alert, LinearProgress } from '@mui/material';

const NewBlogPost: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (formData: {
    title: string;
    content: string;
    category: string;
    tags: string[];
  }) => {
    console.log('🚀 [NewBlogPost] Starting blog post submission:', {
      title: formData.title,
      contentLength: formData.content.length,
      category: formData.category,
      tagsCount: formData.tags.length,
      timestamp: new Date().toISOString(),
    });

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      console.log('📤 [NewBlogPost] Dispatching addBlogPost action...');

      const resultAction = await dispatch(
        addBlogPost({
          ...formData,
          author: 'Current User', // Replace with actual user data
          status: 'published',
        })
      );

      console.log('🔄 [NewBlogPost] Action result:', {
        type: resultAction.type,
        fulfilled: addBlogPost.fulfilled.match(resultAction),
        rejected: addBlogPost.rejected.match(resultAction),
        payload: resultAction.payload,
      });

      if (addBlogPost.fulfilled.match(resultAction)) {
        const postId = resultAction.payload._id;
        console.log('✅ [NewBlogPost] Blog post created successfully:', {
          postId,
          response: resultAction.payload,
        });

        setSuccess('ブログ投稿が正常に作成されました！リダイレクト中...');

        // 2秒後にリダイレクト
        setTimeout(() => {
          console.log('🔄 [NewBlogPost] Navigating to blog post detail:', `/blog/${postId}`);
          navigate(`/blog/${postId}`);
        }, 2000);
      } else if (addBlogPost.rejected.match(resultAction)) {
        const errorMessage = resultAction.error?.message || 'ブログ投稿の作成に失敗しました';
        console.error('❌ [NewBlogPost] Blog post creation rejected:', {
          error: resultAction.error,
          payload: resultAction.payload,
        });
        setError(errorMessage);
      } else {
        console.warn('⚠️ [NewBlogPost] Unexpected action result:', resultAction);
        setError('予期しないエラーが発生しました');
      }
    } catch (error) {
      console.error('💥 [NewBlogPost] Exception during blog post creation:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      setError(
        `投稿中にエラーが発生しました: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setIsSubmitting(false);
      console.log('🏁 [NewBlogPost] Submission process completed');
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        AI分析機能付きブログ投稿
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        AIが投稿内容を分析し、タグの提案や改善案を提供します
      </Typography>

      {/* 投稿中の進行状況表示 */}
      {isSubmitting && (
        <Box mb={2}>
          <Alert severity="info" sx={{ mb: 1 }}>
            ブログ投稿を作成中です...
          </Alert>
          <LinearProgress />
        </Box>
      )}

      {/* 成功メッセージ */}
      {success && (
        <Box mb={2}>
          <Alert severity="success">{success}</Alert>
        </Box>
      )}

      {/* エラーメッセージ */}
      {error && (
        <Box mb={2}>
          <Alert severity="error" sx={{ whiteSpace: 'pre-wrap' }}>
            {error}
          </Alert>
        </Box>
      )}

      <EnhancedBlogPostForm
        onSubmit={handleSubmit}
        submitButtonText={isSubmitting ? '投稿中...' : '投稿する'}
        disabled={isSubmitting}
      />
    </Container>
  );
};

export default NewBlogPost;
