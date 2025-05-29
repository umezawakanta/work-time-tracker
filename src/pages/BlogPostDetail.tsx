import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Chip,
  Button,
  Divider,
  Card,
  CardContent,
} from '@mui/material';
import { ArrowBack, Share } from '@mui/icons-material';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  publishedAt: Date;
  author: string;
  readTime?: number;
}

const BlogPostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, _setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedPosts, _setRelatedPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;

      try {
        // API呼び出しでポストを取得
        // const response = await fetch(/api/blog/{id});
        // const data = await response.json();
        // setPost(data);

        // 関連記事も取得
        // const relatedResponse = await fetch(/api/blog/{id}/related);
        // const relatedData = await relatedResponse.json();
        // setRelatedPosts(relatedData);

        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch post:', error);
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const handleShare = async () => {
    if (!post) return;

    try {
      await navigator.share({
        title: post.title,
        text: post.content.substring(0, 100),
        url: window.location.href,
      });
    } catch {
      // フォールバック: URLをクリップボードにコピー
      navigator.clipboard.writeText(window.location.href);
      console.log('URLをクリップボードにコピーしました');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ py: 4 }}>
          <Typography variant="h4" component="h1">
            読み込み中...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (!post) {
    return (
      <Container maxWidth="md">
        <Box sx={{ py: 4 }}>
          <Typography variant="h4" component="h1">
            記事が見つかりません
          </Typography>
          <Button startIcon={<ArrowBack />} onClick={() => navigate('/blog')} sx={{ mt: 2 }}>
            ブログ一覧に戻る
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/blog')}
            variant="outlined"
            size="small"
          >
            戻る
          </Button>
          <Button startIcon={<Share />} onClick={handleShare} variant="outlined" size="small">
            共有
          </Button>
        </Box>

        <Typography variant="h3" component="h1" gutterBottom>
          {post.title}
        </Typography>

        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Typography variant="body2" color="text.secondary">
            {post.author}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {post.publishedAt.toLocaleDateString()}
          </Typography>
          {post.readTime && (
            <Typography variant="body2" color="text.secondary">
              約{post.readTime}分で読めます
            </Typography>
          )}
        </Box>

        <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {post.tags.map((tag) => (
            <Chip key={tag} label={tag} size="small" />
          ))}
        </Box>

        <Divider sx={{ mb: 4 }} />

        <Box sx={{ mb: 4, lineHeight: 1.8 }}>
          <Typography variant="body1" component="div">
            {post.content.split('\n').map((paragraph, index) => (
              <Typography key={index} paragraph>
                {paragraph}
              </Typography>
            ))}
          </Typography>
        </Box>

        <Divider sx={{ mb: 4 }} />

        {relatedPosts.length > 0 && (
          <Box>
            <Typography variant="h5" component="h2" gutterBottom>
              関連記事
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                gap: 2,
              }}
            >
              {relatedPosts.map((relatedPost) => (
                <Card key={relatedPost.id}>
                  <CardContent>
                    <Typography variant="h6" component="h3" gutterBottom>
                      {relatedPost.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {relatedPost.content.substring(0, 100)}...
                    </Typography>
                    <Button size="small" href={`/blog/${relatedPost.id}`}>
                      続きを読む
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default BlogPostDetail;
