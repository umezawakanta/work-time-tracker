import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from 'react-hot-toast';
import { createTweet } from '@/services/api/tweetApi';
import { X } from 'lucide-react';
import { Tweet } from '@/types/Tweet';

interface TweetFormProps {
  onTweetAdded: (tweet: Tweet) => void;
}

const TweetForm: React.FC<TweetFormProps> = ({ onTweetAdded }) => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim() || image) {
      if (content.length > 10000) {
        toast.error('ツイートは10000文字以内で入力してください');
        return;
      }
      setIsSubmitting(true);
      try {
        const newTweet = await createTweet(content.trim(), image);
        onTweetAdded(newTweet);
        setContent('');
        setImage(null);
        toast.success('ツイートを投稿しました');
      } catch (error) {
        console.error('Tweet error:', error);
        toast.error('ツイートの投稿に失敗しました');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      toast.error('テキストまたは画像を入力してください');
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
          const reader = new FileReader();
          reader.onload = (e) => {
            setImage(e.target?.result as string);
          };
          reader.readAsDataURL(blob);
        }
      }
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardContent className="pt-4">
          <Textarea
            ref={textareaRef}
            placeholder="いまどうしてる？"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onPaste={handlePaste}
            maxLength={10000}
            rows={6}
          />
          {image && (
            <div className="mt-2 relative">
              <img src={image} alt="Pasted" className="max-w-full h-auto rounded" />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-0 right-0 bg-white rounded-full"
                onClick={handleRemoveImage}
              >
                <X size={20} />
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <div>{content.length}/10000</div>
          <Button type="submit" disabled={isSubmitting || (!content.trim() && !image)}>
            {isSubmitting ? '投稿中...' : 'ツイート'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default TweetForm;
