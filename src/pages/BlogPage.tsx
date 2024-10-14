import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBlogPosts, addBlogPost, selectBlogPosts, selectBlogStatus } from '@/store/blogSlice';
import { AppDispatch } from '@/store';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function BlogPage() {
  const dispatch = useDispatch<AppDispatch>();
  const blogPosts = useSelector(selectBlogPosts);
  const status = useSelector(selectBlogStatus);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('all');

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchBlogPosts());
    }
  }, [status, dispatch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title && content) {
      dispatch(addBlogPost({ title, content, author: 'Current User', category }));
      setTitle('');
      setContent('');
    }
  };

  const filteredPosts = category === 'all' ? blogPosts : blogPosts.filter(post => post.category === category);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">ブログ</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>新規投稿</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              placeholder="タイトル"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <Textarea
              placeholder="本文"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2 border rounded"
              aria-label="カテゴリー選択"
            >
              <option value="all">カテゴリーを選択</option>
              <option value="productivity">生産性</option>
              <option value="remote-work">リモートワーク</option>
              <option value="work-life-balance">ワークライフバランス</option>
              <option value="time-management">タイムマネジメント</option>
            </select>
            <Button type="submit">投稿</Button>
          </form>
        </CardContent>
      </Card>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">すべて</TabsTrigger>
          <TabsTrigger value="productivity">生産性</TabsTrigger>
          <TabsTrigger value="remote-work">リモートワーク</TabsTrigger>
          <TabsTrigger value="work-life-balance">ワークライフバランス</TabsTrigger>
          <TabsTrigger value="time-management">タイムマネジメント</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          {filteredPosts.map((post) => (
            <Card key={post._id} className="mb-4">
              <CardHeader>
                <CardTitle>{post.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{post.content}</p>
                <p className="text-sm text-gray-500 mt-2">投稿者: {post.author}</p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}