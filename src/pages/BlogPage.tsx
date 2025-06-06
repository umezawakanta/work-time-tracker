import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store';
import { fetchBlogPosts, selectBlogPosts, selectBlogStatus } from '@/store/blogSlice';
import {
  Container,
  Typography,
  Box,
  Tab,
  Tabs,
  Card,
  CardContent,
  Chip,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  CircularProgress,
} from '@mui/material';
import { Add } from '@mui/icons-material';

const BlogPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const posts = useSelector(selectBlogPosts);
  const status = useSelector(selectBlogStatus);
  const [selectedTab, setSelectedTab] = useState(0);
  const [category, setCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Redux storeからブログポストを取得
    if (status === 'idle') {
      dispatch(fetchBlogPosts());
    }
  }, [dispatch, status]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const filteredPosts = posts.filter((post) => {
    const matchesCategory =
      category === 'all' || post.category.toLowerCase() === category.toLowerCase();
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (status === 'loading') {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            ブログ ({posts.length}件)
          </Typography>
          <Button
            component={Link}
            to="/blog/new"
            variant="contained"
            startIcon={<Add />}
            sx={{
              height: 'fit-content',
              fontWeight: 'bold',
            }}
          >
            新規投稿
          </Button>
        </Box>

        <Tabs value={selectedTab} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab label="すべて" />
          <Tab label="技術" />
          <Tab label="プロダクト" />
          <Tab label="チーム" />
        </Tabs>

        <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>カテゴリ</InputLabel>
            <Select value={category} label="カテゴリ" onChange={(e) => setCategory(e.target.value)}>
              <MenuItem value="all">すべて</MenuItem>
              <MenuItem value="技術">技術</MenuItem>
              <MenuItem value="テクノロジー">テクノロジー</MenuItem>
              <MenuItem value="ビジネス">ビジネス</MenuItem>
              <MenuItem value="ライフスタイル">ライフスタイル</MenuItem>
              <MenuItem value="教育">教育</MenuItem>
            </Select>
          </FormControl>

          <TextField
            size="small"
            label="検索"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flexGrow: 1 }}
          />
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 3,
          }}
        >
          {filteredPosts.map((post) => (
            <Card key={post._id} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" component="h2" gutterBottom>
                  {post.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {post.content.substring(0, 150)}...
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                  <Chip label={post.category} color="primary" size="small" />
                  {post.tags.map((tag) => (
                    <Chip key={tag} label={tag} size="small" variant="outlined" />
                  ))}
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {post.author} • {new Date(post.createdAt).toLocaleDateString('ja-JP')}
                </Typography>
              </CardContent>
              <Box sx={{ p: 2, pt: 0 }}>
                <Button component={Link} to={`/blog/${post._id}`} size="small" variant="outlined">
                  続きを読む
                </Button>
              </Box>
            </Card>
          ))}
        </Box>

        {filteredPosts.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              記事が見つかりませんでした。
            </Typography>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default BlogPage;
