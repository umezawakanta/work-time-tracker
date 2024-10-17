import { AxiosResponse } from "axios";
import { BlogPost, Comment } from "@/store/blogSlice";
import { api } from "./apiConfig";

interface BlogApiResponse {
    message: string;
    post: BlogPost;
}

interface CommentApiResponse {
    message: string;
    comment: Comment;
}

interface LikeApiResponse {
    message: string;
    likes: string[];
}

interface DraftApiResponse {
    message: string;
    draft: BlogPost;
}

export const blogApi = {
    getAll: (): Promise<AxiosResponse<BlogPost[]>> => {
        return api.get<BlogPost[]>("/blog");
    },

    create: (post: Omit<BlogPost, "_id" | "createdAt" | "updatedAt" | "likes" | "comments">): Promise<AxiosResponse<BlogApiResponse>> => {
        return api.post<BlogApiResponse>("/blog", post);
    },

    update: (
        _id: string,
        updates: Partial<BlogPost>
    ): Promise<AxiosResponse<BlogApiResponse>> => {
        return api.put<BlogApiResponse>(`/blog/${_id}`, updates);
    },

    delete: (_id: string): Promise<AxiosResponse<void>> => {
        return api.delete(`/blog/${_id}`);
    },

    addComment: (
        postId: string,
        comment: Omit<Comment, "_id" | "createdAt">
    ): Promise<AxiosResponse<CommentApiResponse>> => {
        return api.post<CommentApiResponse>(`/blog/${postId}/comments`, comment);
    },

    getById: (id: string): Promise<AxiosResponse<BlogPost>> => {
        return api.get<BlogPost>(`/blog/${id}`);
    },

    toggleLike: (postId: string, userId: string): Promise<AxiosResponse<LikeApiResponse>> => {
        return api.post<LikeApiResponse>(`/blog/${postId}/like`, { userId });
    },

    saveDraft: (draft: Partial<BlogPost>): Promise<AxiosResponse<DraftApiResponse>> => {
        return api.post<DraftApiResponse>("/blog/draft", draft);
    },

    publishPost: (postId: string): Promise<AxiosResponse<BlogApiResponse>> => {
        return api.put<BlogApiResponse>(`/blog/${postId}/publish`);
    },
};