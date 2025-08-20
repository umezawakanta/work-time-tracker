import React from 'react';
import { USER_STORIES_COPY } from '@/constants/copy';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface UserStoriesProps {
  className?: string;
}

export const UserStories: React.FC<UserStoriesProps> = ({ className }) => {
  return (
    <section className={className || ''} aria-label="User stories">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">{USER_STORIES_COPY.title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {USER_STORIES_COPY.items.map((item, idx) => (
          <Card key={idx} className="bg-white/80 backdrop-blur border border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg text-slate-900">
                {item.name} <span className="text-slate-500 text-sm">/ {item.role}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-slate-700">「{item.quote}」</p>
              <p className="text-slate-600 text-sm">{item.result}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default UserStories;
