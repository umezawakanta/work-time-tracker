import React from 'react';
import { Card, CardContent } from "@/components/ui/card"
import { Tweet } from '@/types/Tweet';
import { ExternalLink } from 'lucide-react';

interface TweetListProps {
  tweets: Tweet[];
}

const TweetList: React.FC<TweetListProps> = ({ tweets }) => {
  const renderContent = (content: string) => {
    // URLを検出する正規表現
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    
    // テキストをURLとそれ以外のパーツに分割
    const parts = content.split(urlRegex);
    const matches = Array.from(content.matchAll(urlRegex));
    const urls = matches.map(match => match[0]);
    
    return parts.map((part, index) => {
      // URLに一致する場合
      if (urls.includes(part)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1"
          >
            {part}
            <ExternalLink size={14} className="inline" />
          </a>
        );
      }
      // 通常のテキストの場合
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="space-y-4 mt-4">
      {tweets.map((tweet) => (
        <Card key={tweet._id.toString()}>
          <CardContent className="pt-4">
            <p className="whitespace-pre-wrap break-words">
              {tweet.content && renderContent(tweet.content)}
            </p>
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