import React, { useState, useEffect } from 'react';
import TweetForm from '@/components/forms/TweetForm';
import TweetList from '@/components/list/TweetList';
import { getTweets } from '@/services/api/tweetApi';
import { Tweet } from '@/types/Tweet';

const TwitterPage: React.FC = () => {
  const [tweets, setTweets] = useState<Tweet[]>([]);

  useEffect(() => {
    fetchTweets();
  }, []);

  const fetchTweets = async () => {
    try {
      const fetchedTweets = await getTweets();
      setTweets(fetchedTweets);
    } catch (error) {
      console.error('Error fetching tweets:', error);
    }
  };

  const addNewTweet = (newTweet: Tweet) => {
    setTweets(prevTweets => [newTweet, ...prevTweets]);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">ツイート</h1>
      <TweetForm onTweetAdded={addNewTweet} />
      <TweetList tweets={tweets} />
    </div>
  );
};

export default TwitterPage;