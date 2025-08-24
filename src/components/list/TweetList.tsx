import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tweet } from '@/types/Tweet';
import { ExternalLink, Edit, Save } from 'lucide-react';

interface TweetListProps {
  tweets: Tweet[];
  onUpdateTweet: (id: string, content: string) => Promise<void>;
}

const TweetList: React.FC<TweetListProps> = ({ tweets, onUpdateTweet }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<string>('');

  const renderContent = (content: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = content.split(urlRegex);
    const matches = Array.from(content.matchAll(urlRegex));
    const urls = matches.map((match) => match[0]);

    return parts.map((part, index) => {
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
      return <span key={index}>{part}</span>;
    });
  };

  const handleEdit = (tweet: Tweet) => {
    setEditingId(tweet._id.toString());
    setEditContent(tweet.content || ''); // ここで undefined の可能性を処理
  };

  const handleSave = async (id: string) => {
    try {
      await onUpdateTweet(id, editContent);
      setEditingId(null);
    } catch (error) {
      console.error('Failed to update tweet:', error);
      // ここでエラー処理を行う（例：エラーメッセージを表示する）
    }
  };

  return (
    <div className="space-y-4 mt-4">
      {tweets.map((tweet) => (
        <Card key={tweet._id.toString()}>
          <CardContent className="pt-4">
            {editingId === tweet._id.toString() ? (
              <>
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="mb-2"
                />
                <Button onClick={() => handleSave(tweet._id.toString())} className="mr-2">
                  <Save size={16} className="mr-2" />
                  保存
                </Button>
                <Button variant="outline" onClick={() => setEditingId(null)}>
                  キャンセル
                </Button>
              </>
            ) : (
              <>
                <p className="whitespace-pre-wrap break-words">
                  {tweet.content && renderContent(tweet.content)}
                </p>
                <Button variant="ghost" onClick={() => handleEdit(tweet)} className="mt-2">
                  <Edit size={16} className="mr-2" />
                  編集
                </Button>
              </>
            )}
            {tweet.image && (
              <img
                src={`/uploads/${tweet.image}`}
                alt="Tweet"
                className="mt-2 max-w-full h-auto rounded"
              />
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
