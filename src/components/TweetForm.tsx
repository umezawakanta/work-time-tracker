import React, { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { toast } from 'react-hot-toast'
import { createTweet } from '@/services/api/tweetApi';

const TweetForm: React.FC = () => {
  const [content, setContent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      try {
        await createTweet(content);
        setContent('');
        toast.success('ツイートを投稿しました');
      } catch (error) {
        console.error('Tweet error:', error);
        toast.error('ツイートの投稿に失敗しました');
      }
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardContent className="pt-4">
          <Textarea
            placeholder="いまどうしてる？"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={280}
          />
        </CardContent>
        <CardFooter className="flex justify-between">
          <div>{content.length}/280</div>
          <Button type="submit" disabled={!content.trim()}>ツイート</Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default TweetForm;