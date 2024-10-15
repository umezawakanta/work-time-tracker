import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { blogApi } from "@/services/api/blogApi";
import { RootState } from "./index";

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
}

export interface Comment {
  _id: string;
  content: string;
  author: string;
  createdAt: string;
}

interface BlogState {
  posts: BlogPost[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: BlogState = {
  posts: [],
  status: "idle",
  error: null,
};

export const fetchBlogPosts = createAsyncThunk(
  "blog/fetchBlogPosts",
  async () => {
    const response = await blogApi.getAll();
    return response.data;
  }
);

export const addBlogPost = createAsyncThunk(
  "blog/addBlogPost",
  async (postData: Pick<BlogPost, "title" | "content" | "author" | "category" | "tags">) => {
    const response = await blogApi.create(postData);
    return response.data.post;
  }
);

export const updateBlogPost = createAsyncThunk(
  "blog/updateBlogPost",
  async ({ _id, updates }: { _id: string; updates: Partial<BlogPost> }) => {
    const response = await blogApi.update(_id, updates);
    return response.data.post;
  }
);

export const deleteBlogPost = createAsyncThunk(
  "blog/deleteBlogPost",
  async (_id: string) => {
    await blogApi.delete(_id);
    return _id;
  }
);

export const addComment = createAsyncThunk(
  "blog/addComment",
  async ({ postId, comment }: { postId: string; comment: Omit<Comment, "_id" | "createdAt"> }) => {
    const response = await blogApi.addComment(postId, comment);
    return { postId, comment: response.data.comment };
  }
);

export const fetchBlogPost = createAsyncThunk(
  "blog/fetchBlogPost",
  async (id: string) => {
    const response = await blogApi.getById(id);
    return response.data;
  }
);

export const toggleLike = createAsyncThunk(
  "blog/toggleLike",
  async ({ postId, userId }: { postId: string; userId: string }) => {
    const response = await blogApi.toggleLike(postId, userId);
    return { postId, likes: response.data.likes };
  }
);

const blogSlice = createSlice({
  name: "blog",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBlogPosts.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchBlogPosts.fulfilled, (state, action: PayloadAction<BlogPost[]>) => {
        state.status = "succeeded";
        state.posts = action.payload;
        state.error = null;
      })
      .addCase(fetchBlogPosts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Something went wrong";
      })
      .addCase(addBlogPost.fulfilled, (state, action: PayloadAction<BlogPost>) => {
        state.posts.push(action.payload);
        state.error = null;
      })
      .addCase(updateBlogPost.fulfilled, (state, action: PayloadAction<BlogPost>) => {
        const index = state.posts.findIndex((post) => post._id === action.payload._id);
        if (index !== -1) {
          state.posts[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(deleteBlogPost.fulfilled, (state, action: PayloadAction<string>) => {
        state.posts = state.posts.filter((post) => post._id !== action.payload);
        state.error = null;
      })
      .addCase(addComment.fulfilled, (state, action: PayloadAction<{ postId: string; comment: Comment }>) => {
        const post = state.posts.find((post) => post._id === action.payload.postId);
        if (post) {
          post.comments.push(action.payload.comment);
        }
        state.error = null;
      })
      .addCase(fetchBlogPost.fulfilled, (state, action: PayloadAction<BlogPost>) => {
        const index = state.posts.findIndex(post => post._id === action.payload._id);
        if (index !== -1) {
          state.posts[index] = action.payload;
        } else {
          state.posts.push(action.payload);
        }
        state.error = null;
      })
      .addCase(toggleLike.fulfilled, (state, action: PayloadAction<{ postId: string; likes: string[] }>) => {
        const post = state.posts.find(post => post._id === action.payload.postId);
        if (post) {
          post.likes = action.payload.likes;
        }
      });
  },
});

export const selectBlogPosts = (state: RootState) => state.blog.posts;
export const selectBlogStatus = (state: RootState) => state.blog.status;
export const selectBlogError = (state: RootState) => state.blog.error;

export const selectBlogPostById = (state: RootState, id: string | undefined) =>
  state.blog.posts.find(post => post._id === id);

export default blogSlice.reducer;