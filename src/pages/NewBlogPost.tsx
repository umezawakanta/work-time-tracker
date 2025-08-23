import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addBlogPost } from '@/store/blogSlice';
import { AppDispatch } from '@/store';
import { EnhancedBlogPostForm } from '@/components/EnhancedBlogPostForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
// Icons from lucide-react
import {
  Sparkles,
  Brain,
  Lightbulb,
  FolderOpen,
  Tag,
  CheckCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Copy,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const NewBlogPost: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [showAiHelp, setShowAiHelp] = useState(true);

  const handleSubmit = async (formData: {
    title: string;
    content: string;
    category: string;
    tags: string[];
  }) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const blogPost = {
        ...formData,
        author: 'Current User', // This should come from auth context
        status: 'published' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        likes: [],
        comments: [],
        viewCount: 0,
      };
      // Add an explicit timeout guard; abort create if it hangs > 20s
      const result = await Promise.race([
        // @ts-ignore unwrap is available on returned thunk
        (dispatch as any)(addBlogPost(blogPost)).unwrap(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout while publishing')), 20000)
        ),
      ]);
      void result;
      toast.success('Blog post created successfully!');
      navigate('/blog');
    } catch (error) {
      console.error('Failed to create blog post:', error);
      const message =
        (error as any)?.response?.data?.message ||
        (error as Error).message ||
        'Failed to create blog post. Please try again.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate('/blog');
  };

  const aiWritingTips = [
    {
      icon: <Brain className="h-5 w-5 text-blue-500" />,
      title: 'Structure Your Content',
      description:
        'Use clear headings, bullet points, and short paragraphs for better readability.',
    },
    {
      icon: <Lightbulb className="h-5 w-5 text-yellow-500" />,
      title: 'Engaging Introduction',
      description:
        "Start with a hook, question, or interesting fact to capture readers' attention.",
    },
    {
      icon: <Tag className="h-5 w-5 text-green-500" />,
      title: 'SEO Optimization',
      description: 'Use relevant keywords naturally throughout your content and in headings.',
    },
    {
      icon: <CheckCircle className="h-5 w-5 text-purple-500" />,
      title: 'Call to Action',
      description: 'End with a clear call to action or question to encourage engagement.',
    },
  ];

  const contentGuidelines = [
    'Write in a conversational tone',
    'Use examples and case studies',
    'Include relevant images or code snippets',
    'Proofread for grammar and spelling',
    'Add internal and external links',
    'Consider your target audience',
  ];

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Blog Post</h1>
          <p className="text-gray-600 mt-2">Share your thoughts and insights with the community</p>
        </div>
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Blog
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <EnhancedBlogPostForm
            onSubmit={handleSubmit}
            submitButtonText={isSubmitting ? 'Publishing...' : 'Publish Post'}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* AI Writing Tips */}
          {showAiHelp && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Writing Tips
                </CardTitle>
                <CardDescription>AI-powered suggestions to improve your blog post</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {aiWritingTips.map((tip, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex-shrink-0">{tip.icon}</div>
                    <div>
                      <h4 className="font-medium text-sm">{tip.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{tip.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Content Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                Content Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {contentGuidelines.map((guideline, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    {guideline}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Publishing Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-sm">Publishing post...</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto" />
                    <p className="text-sm text-gray-600">Ready to publish</p>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <Badge variant="outline">Draft</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Visibility:</span>
                  <Badge variant="default">Public</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Author:</span>
                  <span>Current User</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Help & Support */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Need Help?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600">
                Having trouble with your blog post? Check out our writing resources.
              </p>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  📝 Writing Guide
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  🎨 Formatting Tips
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  🚀 SEO Best Practices
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Loading Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                <h3 className="font-semibold">Publishing Your Post</h3>
                <p className="text-sm text-gray-600">
                  Please wait while we publish your blog post...
                </p>
                <Progress value={75} className="w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default NewBlogPost;
