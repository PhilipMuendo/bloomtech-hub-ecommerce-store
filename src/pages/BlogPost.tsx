import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BlogPost } from '@/types';

const BlogPostPage: React.FC = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/blog/${slug}`);
        if (!res.ok) throw new Error('Failed to load post');
        const data = await res.json();
        setPost(data);
      } catch (e: any) {
        setError(e.message || 'Failed to load post');
      } finally {
        setLoading(false);
      }
    };
    if (slug) load();
  }, [slug]);

  if (loading) return <div className="container mx-auto px-4 py-8">Loading...</div>;
  if (error) return <div className="container mx-auto px-4 py-8 text-red-600">{error}</div>;
  if (!post) return <div className="container mx-auto px-4 py-8">Not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      {post.coverImage && (
        <img src={post.coverImage} alt={post.title} className="w-full max-h-96 object-cover rounded" />
      )}
      <h1 className="text-3xl font-bold mt-6">{post.title}</h1>
      <p className="text-sm text-muted-foreground mt-2">
        {new Date(post.createdAt).toLocaleDateString()} {post.authorName ? `· ${post.authorName}` : ''}
      </p>
      <article className="prose max-w-none mt-6" dangerouslySetInnerHTML={{ __html: post.content }} />
    </div>
  );
};

export default BlogPostPage;

