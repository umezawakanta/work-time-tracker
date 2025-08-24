import { api } from './apiConfig';

export const createTweet = async (content: string, image: string | null) => {
  try {
    const formData = new FormData();
    formData.append('content', content);
    if (image) {
      const blob = await fetch(image).then((r) => r.blob());
      formData.append('image', blob, 'image.png');
    }
    const response = await api.post('/tweets', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Create tweet error:', error);
    throw error;
  }
};

export const getTweets = async (search?: string) => {
  try {
    const response = await api.get('/tweets', {
      params: { search },
    });
    return response.data;
  } catch (error) {
    console.error('Get tweets error:', error);
    throw error;
  }
};

export const updateTweet = async (id: string, content: string) => {
  try {
    const response = await api.put(`/tweets/${id}`, { content });
    return response.data;
  } catch (error) {
    console.error('Update tweet error:', error);
    throw error;
  }
};
