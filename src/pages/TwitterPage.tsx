import React, { useState, useEffect } from 'react';
import TweetForm from '@/components/forms/TweetForm';
import TweetList from '@/components/list/TweetList';
import { getTweets, updateTweet } from '@/services/api/tweetApi';
import { Tweet } from '@/types/Tweet';
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from 'lucide-react';

const TwitterPage: React.FC = () => {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTweets();
  }, []);

  const fetchTweets = async (search?: string) => {
    try {
      const fetchedTweets = await getTweets(search);
      setTweets(fetchedTweets);
    } catch (error) {
      console.error('Error fetching tweets:', error);
    }
  };

  const addNewTweet = (newTweet: Tweet) => {
    setTweets(prevTweets => [newTweet, ...prevTweets]);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTweets(searchTerm);
  };

  const handleUpdateTweet = async (id: string, content: string) => {
    try {
      const updatedTweet = await updateTweet(id, content);
      setTweets(prevTweets =>
        prevTweets.map(tweet =>
          tweet._id.toString() === id ? { ...tweet, ...updatedTweet } : tweet
        )
      );
    } catch (error) {
      console.error('Error updating tweet:', error);
      // ここでエラー処理を行う（例：エラーメッセージを表示する）
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">ツイート</h1>
      <TweetForm onTweetAdded={addNewTweet} />
      <form onSubmit={handleSearch} className="mt-4 mb-4 flex gap-2">
        <Input
          type="text"
          placeholder="ツイートを検索..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow"
        />
        <Button type="submit">
          <Search className="mr-2 h-4 w-4" /> 検索
        </Button>
      </form>
      <TweetList tweets={tweets} onUpdateTweet={handleUpdateTweet} />
    </div>
  );
};

export default TwitterPage;