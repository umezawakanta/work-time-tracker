import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store';
import { Link } from 'react-router-dom';
import { fetchBlogPosts, selectBlogPosts, selectBlogStatus } from '@/store/blogSlice';
import { 
  Button, 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  CircularProgress, 
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Box,
  TextField,
  Chip
} from '@mui/material';

const POSTS_PER_PAGE = 6;

const BlogPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const blogPosts = useSelector(selectBlogPosts);
  const status = useSelector(selectBlogStatus);
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('');

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

  if (status === 'loading') {
    return (
      <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'center', 
        alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  const filteredPosts = blogPosts
    .filter(post => selectedCategory === 'all' || post.category === selectedCategory)
    .filter(post => 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .filter(post => selectedTag === '' || post.tags.includes(selectedTag));

  const indexOfLastPost = page * POSTS_PER_PAGE;
  const indexOfFirstPost = indexOfLastPost - POSTS_PER_PAGE;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);

  const categories = ['all', ...new Set(blogPosts.map(post => post.category))];
  const allTags = Array.from(new Set(blogPosts.flatMap(post => post.tags)));

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        ブログ
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Button component={Link} to="/blog/new" variant="contained" color="primary">
          新規投稿
        </Button>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel id="category-select-label">カテゴリー</InputLabel>
          <Select
            labelId="category-select-label"
            id="category-select"
            value={selectedCategory}
            label="カテゴリー"
            onChange={handleCategoryChange}
          >
            {categories.map((category) => (
              <MenuItem key={category} value={category}>
                {category === 'all' ? 'すべて' : category}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <TextField
        fullWidth
        label="検索"
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
      <Grid container spacing={4}>
        {currentPosts.map((post) => (
          <Grid item xs={12} sm={6} md={4} key={post._id}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="h2">
                  {post.title}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  カテゴリー: {post.category}
                </Typography>
                <Typography variant="body2" component="p">
                  {post.content.substring(0, 100)}...
                </Typography>
                <Box sx={{ mt: 1 }}>
                  {post.tags.map((tag) => (
                    <Chip key={tag} label={tag} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                  ))}
                </Box>
              </CardContent>
              <CardActions>
                <Button size="small" component={Link} to={`/blog/${post._id}`}>
                  続きを読む
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Pagination
        count={Math.ceil(filteredPosts.length / POSTS_PER_PAGE)}
        page={page}
        onChange={handleChangePage}
        color="primary"
        sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}
      />
    </Container>
  );
};

export default BlogPage;