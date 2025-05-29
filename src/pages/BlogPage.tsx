import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store';
import { Link } from 'react-router-dom';
import { fetchBlogPosts, selectBlogPosts, selectBlogStatus, selectDrafts } from '@/store/blogSlice';
import { Button, Container, Typography, Card, CardContent, CardActions, CircularProgress, Pagination, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent, Box, TextField, Chip, Tabs, Tab } from '@mui/material';
import Grid2 from '@mui/material/Grid';

const POSTS_PER_PAGE = 6;

const BlogPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const blogPosts = useSelector(selectBlogPosts);
  const drafts = useSelector(selectDrafts);
  const status = useSelector(selectBlogStatus);
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [sortOption, setSortOption] = useState<string>('newest');
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchBlogPosts());
    }
  }, [status, dispatch]);

  const handleChangePage = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleCategoryChange = (event: SelectChangeEvent) => {
    setSelectedCategory(event.target.value as string);
    setPage(1);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(1);
  };

  const handleTagClick = (tag: string) => {
    setSelectedTag(selectedTag === tag ? '' : tag);
    setPage(1);
  };

  const handleSortChange = (event: SelectChangeEvent) => {
    setSortOption(event.target.value as string);
    setPage(1);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (status === 'loading') {
    return (
      <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'center', 
        alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  const filteredPosts = (tabValue === 0 ? blogPosts : drafts)
    .filter(post => selectedCategory === 'all' || post.category === selectedCategory)
    .filter(post => 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .filter(post => selectedTag === '' || post.tags.includes(selectedTag));

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    switch (sortOption) {
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'mostLiked':
        return b.likes.length - a.likes.length;
      case 'mostCommented':
        return b.comments.length - a.comments.length;
      case 'newest':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const indexOfLastPost = page * POSTS_PER_PAGE;
  const indexOfFirstPost = indexOfLastPost - POSTS_PER_PAGE;
  const currentPosts = sortedPosts.slice(indexOfFirstPost, indexOfLastPost);

  const categories = ['all', ...new Set(blogPosts.map(post => post.category))];
  const allTags = Array.from(new Set(blogPosts.flatMap(post => post.tags)));

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        繝悶Ο繧ｰ
      </Typography>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="blog tabs">
          <Tab label="蜈ｬ髢区ｸ医∩" />
          <Tab label="荳区嶌縺・ />
        </Tabs>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Button component={Link} to="/blog/new" variant="contained" color="primary">
          譁ｰ隕乗兜遞ｿ
        </Button>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel id="category-select-label">繧ｫ繝・ざ繝ｪ繝ｼ</InputLabel>
            <Select
              labelId="category-select-label"
              id="category-select"
              value={selectedCategory}
              label="繧ｫ繝・ざ繝ｪ繝ｼ"
              onChange={handleCategoryChange}
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category === 'all' ? '縺吶∋縺ｦ' : category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel id="sort-select-label">荳ｦ縺ｳ譖ｿ縺・/InputLabel>
            <Select
              labelId="sort-select-label"
              id="sort-select"
              value={sortOption}
              label="荳ｦ縺ｳ譖ｿ縺・
              onChange={handleSortChange}
            >
              <MenuItem value="newest">譛譁ｰ鬆・/MenuItem>
              <MenuItem value="oldest">蜿､縺・・/MenuItem>
              <MenuItem value="mostLiked">縺・＞縺ｭ謨ｰ鬆・/MenuItem>
              <MenuItem value="mostCommented">繧ｳ繝｡繝ｳ繝域焚鬆・/MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>
      <TextField
        fullWidth
        label="讀懃ｴ｢"
        variant="outlined"
        value={searchTerm}
        onChange={handleSearchChange}
        sx={{ mb: 2 }}
      />
      <Box sx={{ mb: 2 }}>
        {allTags.map((tag) => (
          <Chip
            key={tag}
            label={tag}
            onClick={() => handleTagClick(tag)}
            color={selectedTag === tag ? 'primary' : 'default'}
            sx={{ mr: 1, mb: 1 }}
          />
        ))}
      </Box>
      <Grid2 spacing={4}>
        {currentPosts.map((post) => (
          <Grid2 size={{ xs: 12, sm: 6, md: 4 }} key={post._id}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="h2">
                  {post.title}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  繧ｫ繝・ざ繝ｪ繝ｼ: {post.category}
                </Typography>
                <Typography variant="body2" component="p">
                  {post.content.substring(0, 100)}...
                </Typography>
                <Box sx={{ mt: 1 }}>
                  {post.tags.map((tag) => (
                    <Chip key={tag} label={tag} size="small" sx={{ mr: 0.5, mb: 0.5 }} 
                    />
                  ))}
                </Box>
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  縺・＞縺ｭ: {post.likes.length} | 繧ｳ繝｡繝ｳ繝・ {post.comments.length}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" component={Link} to={`/blog/${post._id}`}>
                  {post.status === 'draft' ? '邱ｨ髮・ : '邯壹″繧定ｪｭ繧'}
                </Button>
              </CardActions>
            </Card>
          </Grid2>
        ))}
      </Grid2>
      <Pagination
        count={Math.ceil(sortedPosts.length / POSTS_PER_PAGE)}
        page={page}
        onChange={handleChangePage}
        color="primary"
        sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}
      />
    </Container>
  );
};

export default BlogPage;
