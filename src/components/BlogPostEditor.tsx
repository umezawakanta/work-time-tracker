import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { AppDispatch, RootState } from '@/store';
import { selectBlogPostById, updateBlogPost, addBlogPost, BlogPost } from '@/store/blogSlice';
import { BlogPostForm } from '@/components/BlogPostForm';

const BlogPostEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const existingPost = useSelector((state: RootState) => selectBlogPostById(state, id));

  useEffect(() => {
    if (id && !existingPost) {
      navigate('/404');
    }
  }, [id, existingPost, navigate]);

  const handleSubmit = async (formData: {
    title: string;
    content: string;
    category: string;
    tags: string[];
  }) => {
    if (id) {
      await dispatch(updateBlogPost({ _id: id, updates: formData }));
      navigate(`/blog/${id}`);
    } else {
      const newPost = await dispatch(addBlogPost({ ...formData, status: 'published' } as BlogPost));
      if (addBlogPost.fulfilled.match(newPost)) {
        navigate(`/blog/${newPost.payload._id}`);
      }
    }
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        {id ? 'Edit Blog Post' : 'Create New Blog Post'}
      </h1>
      <BlogPostForm
        initialValues={existingPost}
        onSubmit={handleSubmit}
        submitButtonText={id ? 'Update' : 'Publish'}
      />
      {!id && (
        <div className="mt-4">
          <p className="text-sm text-gray-600">Your changes are automatically saved as a draft.</p>
        </div>
      )}
    </div>
  );
};

export default BlogPostEditor;
