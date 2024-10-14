import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { blogApi } from "@/services/api/blogApi";
import { RootState } from "./index";

export interface BlogPost {
  _id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  likes: number;
  comments: Comment[];
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
  async (post: Omit<BlogPost, "_id" | "createdAt" | "updatedAt" | "likes" | "comments">) => {
    const response = await blogApi.create(post);
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
      });
  },
});

export const selectBlogPosts = (state: RootState) => state.blog.posts;
export const selectBlogStatus = (state: RootState) => state.blog.status;
export const selectBlogError = (state: RootState) => state.blog.error;

export default blogSlice.reducer;