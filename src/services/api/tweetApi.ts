import { api } from "./apiConfig";

export const createTweet = async (content: string) => {
  try {
    const response = await api.post('/tweets', { content });
    return response.data;
  } catch (error) {
    console.error('Create tweet error:', error);
    throw error;
  }
};

export const getTweets = async () => {
  try {
    const response = await api.get('/tweets');
    return response.data;
  } catch (error) {
    console.error('Get tweets error:', error);
    throw error;
  }
};