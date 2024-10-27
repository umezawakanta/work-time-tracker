import React from 'react';
import { Card, CardContent } from "@/components/ui/card"
import { Tweet } from '@/types/Tweet';

interface TweetListProps {
  tweets: Tweet[];
}

const TweetList: React.FC<TweetListProps> = ({ tweets }) => {
  return (
    <div className="space-y-4 mt-4">
      {tweets.map((tweet) => (
        <Card key={tweet._id.toString()}>
          <CardContent className="pt-4">
            <p>{tweet.content}</p>
            {tweet.image && (
              <img src={`/uploads/${tweet.image}`} alt="Tweet" className="mt-2 max-w-full h-auto rounded" />
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