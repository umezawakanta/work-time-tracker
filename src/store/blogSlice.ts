import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import { blogApi } from '@/services/api/blogApi';
import { RootState } from './index';

export interface BlogPost {
  _id: string;
  title: string;
  content: string;
  author: string;
  category: string;
  tags: string[];
  likes: string[];
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'published';
}

export interface Comment {
  _id: string;
  content: string;
  author: string;
  createdAt: string;
}

interface BlogState {
  posts: BlogPost[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  todoHistory: Record<string, number>;
}

const initialState: BlogState = {
  posts: [],
  status: 'idle',
  error: null,
  todoHistory: {},
};

export const fetchBlogPosts = createAsyncThunk('blog/fetchBlogPosts', async () => {
  const response = await blogApi.getAll();
  return response.data;
});

export const addBlogPost = createAsyncThunk(
  'blog/addBlogPost',
  async (post: Omit<BlogPost, '_id' | 'createdAt' | 'updatedAt' | 'likes' | 'comments'>) => {
    const response = await blogApi.create(post);
    return response.data.post;
  }
);

export const updateBlogPost = createAsyncThunk(
  'blog/updateBlogPost',
  async ({ _id, updates }: { _id: string; updates: Partial<BlogPost> }) => {
    const response = await blogApi.update(_id, updates);
    return response.data.post;
  }
);

export const deleteBlogPost = createAsyncThunk('blog/deleteBlogPost', async (id: string) => {
  await blogApi.delete(id);
  return id;
});

export const fetchBlogPost = createAsyncThunk('blog/fetchBlogPost', async (id: string) => {
  const response = await blogApi.getById(id);
  return response.data;
});

export const addComment = createAsyncThunk(
  'blog/addComment',
  async ({ postId, comment }: { postId: string; comment: Omit<Comment, '_id' | 'createdAt'> }) => {
    const response = await blogApi.addComment(postId, comment);
    return { postId, comment: response.data.comment };
  }
);

export const toggleLike = createAsyncThunk(
  'blog/toggleLike',
  async ({ postId, userId }: { postId: string; userId: string }) => {
    const response = await blogApi.toggleLike(postId, userId);
    return { postId, likes: response.data.likes };
  }
);

export const saveDraft = createAsyncThunk('blog/saveDraft', async (postData: Partial<BlogPost>) => {
  const response = await blogApi.saveDraft(postData);
  return response.data.draft;
});

export const publishPost = createAsyncThunk('blog/publishPost', async (postId: string) => {
  const response = await blogApi.publishPost(postId);
  return response.data.post;
});

const blogSlice = createSlice({
  name: 'blog',
  initialState,
  reducers: {
    updateTodoHistory: (state) => {
      const today = new Date().toISOString().split('T')[0];
      state.todoHistory[today] = (state.todoHistory[today] || 0) + 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBlogPosts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchBlogPosts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.posts = action.payload;
      })
      .addCase(fetchBlogPosts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })
      .addCase(addBlogPost.fulfilled, (state, action) => {
        state.posts.push(action.payload);
      })
      .addCase(updateBlogPost.fulfilled, (state, action) => {
        const index = state.posts.findIndex((post) => post._id === action.payload._id);
        if (index !== -1) {
          state.posts[index] = action.payload;
        }
      })
      .addCase(deleteBlogPost.fulfilled, (state, action) => {
        state.posts = state.posts.filter((post) => post._id !== action.payload);
      })
      .addCase(fetchBlogPost.fulfilled, (state, action) => {
        const index = state.posts.findIndex((post) => post._id === action.payload._id);
        if (index !== -1) {
          state.posts[index] = action.payload;
        } else {
          state.posts.push(action.payload);
        }
      })
      .addCase(addComment.fulfilled, (state, action) => {
        const post = state.posts.find((post) => post._id === action.payload.postId);
        if (post) {
          post.comments.push(action.payload.comment);
        }
      })
      .addCase(toggleLike.fulfilled, (state, action) => {
        const post = state.posts.find((post) => post._id === action.payload.postId);
        if (post) {
          post.likes = action.payload.likes;
        }
      })
      .addCase(saveDraft.fulfilled, (state, action) => {
        const index = state.posts.findIndex((post) => post._id === action.payload._id);
        if (index !== -1) {
          state.posts[index] = action.payload;
        } else {
          state.posts.push(action.payload);
        }
      })
      .addCase(publishPost.fulfilled, (state, action) => {
        const index = state.posts.findIndex((post) => post._id === action.payload._id);
        if (index !== -1) {
          state.posts[index] = action.payload;
        }
      });
  },
});

export const { updateTodoHistory } = blogSlice.actions;

export const selectBlogPosts = (state: RootState) => state.blog.posts;
export const selectBlogStatus = (state: RootState) => state.blog.status;
export const selectBlogError = (state: RootState) => state.blog.error;
export const selectBlogPostById = (state: RootState, postId: string | undefined) =>
  state.blog.posts.find((post) => post._id === postId);
export const selectTodoHistory = (state: RootState) => state.blog.todoHistory;

// Memoized selector for drafts
export const selectDrafts = createSelector([selectBlogPosts], (posts) =>
  posts.filter((post) => post.status === 'draft')
);

export default blogSlice.reducer;
