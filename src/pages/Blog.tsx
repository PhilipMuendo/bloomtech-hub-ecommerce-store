import React, { useEffect, useState } from 'react';
import BlogCard from '@/components/BlogCard';
import { BlogPost } from '@/types';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

const Blog: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/blog');
        if (!res.ok) throw new Error('Failed to load blog');
        const data = await res.json();
        setPosts(data.items || []);
      } catch (e: any) {
        setError(e.message || 'Failed to load blog');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Blog</h1>
        {user && (user.role === 'admin' || user.role === 'superadmin') && (
          <Button asChild>
            <Link to="/admin/blog">Create Post</Link>
          </Button>
        )}
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : posts.length === 0 ? (
        <div>No posts yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map(p => (
            <BlogCard key={p.id} post={p} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Blog;

