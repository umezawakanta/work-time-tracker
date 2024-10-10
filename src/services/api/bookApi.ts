import { AxiosResponse } from "axios";
import { Book } from "@/store/bookSlice";
import { api } from "./apiConfig";

interface BookApiResponse {
  message: string;
  book: Book;
}

export const bookApi = {
  getAll: (): Promise<AxiosResponse<Book[]>> => {
    return api.get<Book[]>("/books");
  },

  create: (book: Omit<Book, 'id'>): Promise<AxiosResponse<BookApiResponse>> => {
    return api.post<BookApiResponse>("/books", book);
  },

  update: (
    id: string,
    updates: Partial<Book>
  ): Promise<AxiosResponse<BookApiResponse>> => {
    return api.put<BookApiResponse>(`/books/${id}`, updates);
  },

  delete: (id: string): Promise<AxiosResponse<void>> => {
    return api.delete(`/books/${id}`);
  },
};