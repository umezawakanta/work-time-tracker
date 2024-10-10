import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { bookApi } from '@/services/api/bookApi';

export interface Book {
    _id: string;
    title: string;
    author: string;
    isbn: string;
    publishedYear: number;
    totalPages: number;
    readPages: number;
    category: string;
    rating: number;
    createdAt: Date;
  }
  
interface BookState {
  books: Book[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: BookState = {
  books: [],
  status: 'idle',
  error: null,
};

export const fetchBooks = createAsyncThunk<Book[], void, { rejectValue: string }>(
  'book/fetchBooks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await bookApi.getAll();
      return response.data;
    } catch (error) {
      console.error('本の取得中にエラーが発生しました:', error);
      return rejectWithValue(error instanceof Error ? error.message : '本の取得に失敗しました');
    }
  }
);

export const addBook = createAsyncThunk<Book, Omit<Book, '_id' | 'createdAt'>, { rejectValue: string }>(
  'book/addBook',
  async (book, { rejectWithValue }) => {
    try {
      const response = await bookApi.create(book);
      return response.data.book;
    } catch (error) {
      console.error('本の追加中にエラーが発生しました:', error);
      return rejectWithValue(error instanceof Error ? error.message : '本の追加に失敗しました');
    }
  }
);

export const updateBook = createAsyncThunk<Book, Book, { rejectValue: string }>(
  'book/updateBook',
  async (book, { rejectWithValue }) => {
    try {
      console.log('Updating book in slice:', book);
      const response = await bookApi.update(book._id, book);
      console.log('Update response:', response);
      return response.data.book;
    } catch (error) {
      console.error('本の更新中にエラーが発生しました:', error);
      return rejectWithValue(error instanceof Error ? error.message : '本の更新に失敗しました');
    }
  }
);

export const removeBook = createAsyncThunk<string, string, { rejectValue: string }>(
  'book/removeBook',
  async (id, { rejectWithValue }) => {
    try {
      await bookApi.delete(id);
      return id;
    } catch (error) {
      console.error('本の削除中にエラーが発生しました:', error);
      return rejectWithValue(error instanceof Error ? error.message : '本の削除に失敗しました');
    }
  }
);

const bookSlice = createSlice({
  name: 'book',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBooks.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchBooks.fulfilled, (state, action: PayloadAction<Book[]>) => {
        state.status = 'succeeded';
        state.books = action.payload;
        state.error = null;
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || '本の取得に失敗しました';
      })
      .addCase(addBook.fulfilled, (state, action: PayloadAction<Book>) => {
        state.books.push(action.payload);
        state.error = null;
      })
      .addCase(addBook.rejected, (state, action) => {
        state.error = action.payload || '本の追加に失敗しました';
      })
      .addCase(updateBook.fulfilled, (state, action: PayloadAction<Book>) => {
        const index = state.books.findIndex(book => book._id === action.payload._id);
        if (index !== -1) {
          state.books[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateBook.rejected, (state, action) => {
        state.error = action.payload || '本の更新に失敗しました';
      })
      .addCase(removeBook.fulfilled, (state, action: PayloadAction<string>) => {
        state.books = state.books.filter(book => book._id !== action.payload);
        state.error = null;
      })
      .addCase(removeBook.rejected, (state, action) => {
        state.error = action.payload || '本の削除に失敗しました';
      });
  },
});

export default bookSlice.reducer;