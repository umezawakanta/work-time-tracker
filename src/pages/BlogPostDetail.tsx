import React, { useEffect, useState, Suspense, lazy } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import {
  fetchBlogPost,
  selectBlogPostById,
  selectBlogPosts,
  deleteBlogPost,
} from '@/store/blogSlice';
import { useAuth } from '@/hooks/useAuth';

// ⚡ Dynamic Import for Heavy Components
const MarkdownRenderer = lazy(() => import('@/components/MarkdownRenderer'));

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Icons from lucide-react
import {
  ArrowLeft,
  Share,
  Edit,
  Trash2,
  MoreVertical,
  Shield,
  Loader2,
  Calendar,
  User,
  Clock,
  Tag,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import SocialShareButton from '@/components/ui/SocialShareButton';

const BlogPostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();

  const post = useSelector((state: RootState) => selectBlogPostById(state, id));
  const allPosts = useSelector(selectBlogPosts);

  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (id && !post) {
      setLoading(true);
      dispatch(fetchBlogPost(id)).finally(() => setLoading(false));
    }
  }, [id, post, dispatch]);

  const handleBack = () => {
    navigate('/blog');
  };

  const handleEdit = () => {
    navigate(`/blog/edit/${id}`);
  };

  const handleDelete = async () => {
    if (!id) return;

    setIsDeleting(true);
    try {
      await dispatch(deleteBlogPost(id));
      toast.success('Blog post deleted successfully');
      navigate('/blog');
    } catch (error) {
      toast.error('Failed to delete blog post');
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.title,
        text: post?.content.substring(0, 100) + '...',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  const canModifyPost = () => {
    if (!user || !post) return false;
    return user.isAdmin || post.author === user.email || post.author === user.name;
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading blog post...</span>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>Blog post not found.</AlertDescription>
        </Alert>
        <Button onClick={handleBack} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Blog
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Blog
        </Button>

        <div className="flex items-center gap-2">
          <SocialShareButton
            variant="outline"
            size="sm"
            url={window.location.href}
            title={post.title}
            description={`${post.content.substring(0, 100)}...`}
          />

          {canModifyPost() && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setDeleteDialogOpen(true)}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Admin Notice */}
      {user?.isAdmin && post.author !== user.email && post.author !== user.name && (
        <Alert className="mb-6">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>Admin Mode:</strong> You can edit/delete this post created by {post.author}
          </AlertDescription>
        </Alert>
      )}

      {/* Article */}
      <article>
        <Card>
          <CardHeader>
            <div className="space-y-4">
              <h1 className="text-3xl font-bold text-gray-900">{post.title}</h1>

              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {post.author}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(post.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {Math.ceil(post.content.length / 200)} min read
                </div>
              </div>

              {/* Tags and Category */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="default">{post.category}</Badge>
                {post.tags.map((tag, index) => (
                  <Badge key={index} variant="outline">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </CardHeader>

          <Separator />

          <CardContent className="pt-6">
            <Suspense
              fallback={
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading content...</span>
                </div>
              }
            >
              <MarkdownRenderer content={post.content} />
            </Suspense>
          </CardContent>
        </Card>
      </article>

      {/* Related Posts */}
      {allPosts.length > 1 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Related Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {allPosts
                .filter((p) => p._id !== post._id && p.category === post.category)
                .slice(0, 4)
                .map((relatedPost) => (
                  <Card
                    key={relatedPost._id}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <CardContent
                      className="p-4"
                      onClick={() => navigate(`/blog/${relatedPost._id}`)}
                    >
                      <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                        {relatedPost.title}
                      </h3>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {relatedPost.content.substring(0, 100)}...
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <Badge variant="outline" className="text-xs">
                          {relatedPost.category}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(relatedPost.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>

            {allPosts.filter((p) => p._id !== post._id && p.category === post.category).length ===
              0 && <p className="text-gray-500 text-center py-4">No related posts found.</p>}
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Blog Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{post.title}"? This action cannot be undone.
              {user?.isAdmin && post.author !== user.email && post.author !== user.name && (
                <div className="mt-2 text-orange-600">
                  <strong>Note:</strong> You are deleting another user's post with admin privileges.
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BlogPostDetail;
