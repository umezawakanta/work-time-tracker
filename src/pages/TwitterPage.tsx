import React from 'react';
import TweetForm from '@/components/TweetForm';
import TweetList from '@/components/TweetList';

const TwitterPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">ツイート</h1>
      <div className="mb-8">
        <TweetForm />
      </div>
      <TweetList />
    </div>
  );
};

export default TwitterPage;