import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { selectBlogPostById, updateBlogPost } from '@/store/blogSlice';
import { BlogPostForm } from '@/components/BlogPostForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
// Icons from lucide-react
import { ArrowLeft, Save, Loader2, AlertTriangle, Clock, User, Calendar } from 'lucide-react';
import { toast } from 'react-hot-toast';

const EditBlogPost: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const post = useSelector((state: RootState) => selectBlogPostById(state, id));

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (!id) {
      navigate('/blog');
      return;
    }

    if (!post) {
      // If post not found, redirect back to blog list
      navigate('/blog');
      toast.error('Blog post not found');
    }
  }, [id, post, navigate]);

  const handleSubmit = async (formData: {
    title: string;
    content: string;
    category: string;
    tags: string[];
  }) => {
    if (!id) return;

    setIsSubmitting(true);
    try {
      await dispatch(
        updateBlogPost({
          _id: id,
          updates: {
            ...formData,
            updatedAt: new Date().toISOString(),
          },
        })
      );

      toast.success('Blog post updated successfully!');
      navigate(`/blog/${id}`);
    } catch (error) {
      console.error('Failed to update blog post:', error);
      toast.error('Failed to update blog post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (hasChanges) {
      const shouldLeave = window.confirm(
        'You have unsaved changes. Are you sure you want to leave?'
      );
      if (!shouldLeave) return;
    }
    navigate(`/blog/${id}`);
  };

  if (!post) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Blog Post</h1>
          <p className="text-gray-600 mt-2">Make changes to your blog post</p>
        </div>
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Post
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <BlogPostForm
            initialValues={post}
            onSubmit={handleSubmit}
            submitButtonText={isSubmitting ? 'Updating...' : 'Update Post'}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Post Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Post Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status:</span>
                  <Badge variant={post.status === 'published' ? 'default' : 'outline'}>
                    {post.status}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Author:</span>
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{post.author}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Created:</span>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Updated:</span>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(post.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {(post as any).viewCount !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Views:</span>
                    <span>{(post as any).viewCount}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Current Tags & Category */}
          <Card>
            <CardHeader>
              <CardTitle>Current Tags & Category</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-sm mb-2">Category</h4>
                <Badge variant="default">{post.category}</Badge>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium text-sm mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Publishing Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Save className="h-5 w-5" />
                Publishing Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={() => handleSubmit(post)} disabled={isSubmitting} className="w-full">
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Quick Update
                  </>
                )}
              </Button>

              <Button variant="outline" onClick={handleBack} className="w-full">
                Cancel Changes
              </Button>
            </CardContent>
          </Card>

          {/* Help */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Editing Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Preview your changes before saving</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Changes are saved automatically as you type</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Use markdown for rich formatting</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Add relevant tags to improve discoverability</span>
                </div>
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
                <h3 className="font-semibold">Updating Post</h3>
                <p className="text-sm text-gray-600">Please wait while we save your changes...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default EditBlogPost;
