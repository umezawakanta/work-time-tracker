import React, { useState, useEffect } from 'react';
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
} from '@mui/material';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  publishedAt: Date;
  author: string;
}

const BlogPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [posts, _setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // ブログポストを取得
    const fetchPosts = async () => {
      try {
        // API呼び出しの実装
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const filteredPosts = posts.filter((post) => {
    const matchesCategory = category === 'all' || post.category === category;
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            読み込み中...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          ブログ
        </Typography>

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
              <MenuItem value="tech">技術</MenuItem>
              <MenuItem value="product">プロダクト</MenuItem>
              <MenuItem value="team">チーム</MenuItem>
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
            <Card key={post.id} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" component="h2" gutterBottom>
                  {post.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {post.content.substring(0, 150)}...
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                  {post.tags.map((tag) => (
                    <Chip key={tag} label={tag} size="small" />
                  ))}
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {post.author} {post.publishedAt.toLocaleDateString()}
                </Typography>
              </CardContent>
              <Box sx={{ p: 2, pt: 0 }}>
                <Button size="small" href={`/blog/${post.id}`}>
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
