import React, { useEffect, useState } from 'react';
import { getTweets } from '@/services/api/tweetApi';
import { Card, CardContent } from "@/components/ui/card"

interface Tweet {
  _id: string;
  content: string;
  image?: string;
  createdAt: string;
}

const TweetList: React.FC = () => {
  const [tweets, setTweets] = useState<Tweet[]>([]);

  useEffect(() => {
    const fetchTweets = async () => {
      try {
        const fetchedTweets = await getTweets();
        setTweets(fetchedTweets);
      } catch (error) {
        console.error('Error fetching tweets:', error);
      }
    };

    fetchTweets();
  }, []);

  return (
    <div className="space-y-4">
      {tweets.map((tweet) => (
        <Card key={tweet._id}>
          <CardContent className="pt-4">
            <p>{tweet.content}</p>
            {tweet.image && (
              <img src={tweet.image} alt="Tweet" className="mt-2 max-w-full h-auto rounded" />
            )}
            <p className="text-sm text-gray-500 mt-2">
              {new Date(tweet.createdAt).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TweetList;