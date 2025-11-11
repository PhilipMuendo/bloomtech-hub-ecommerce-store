import React, { useEffect, useMemo, useState } from 'react';
import BlogCard from '@/components/BlogCard';
import { BlogPost } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const Blog: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/blog?limit=50&status=published', {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error('Failed to load blog');
        const data = await res.json();
        setPosts(data.items || []);
      } catch (e: any) {
        if (e.name === 'AbortError') return;
        setError(e.message || 'Failed to load blog');
      } finally {
        setLoading(false);
      }
    };
    load();

    return () => controller.abort();
  }, []);

  const categories = useMemo(() => {
    const unique = new Set<string>();
    posts.forEach((post) => {
      if (post.category) unique.add(post.category);
    });
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [posts]);

  const filteredPosts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return posts.filter((post) => {
      const matchesCategory =
        categoryFilter === 'all' || (post.category ?? '').toLowerCase() === categoryFilter.toLowerCase();

      if (!matchesCategory) return false;

      if (!term) return true;
      const haystack = [post.title, post.excerpt, post.authorName]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [posts, searchTerm, categoryFilter]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">BloomTech Hub Insights</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Explore product deep dives, deployment notes, and engineering learnings from the BloomTech Hub team.
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 md:max-w-sm">
          <div>
            <Label htmlFor="blog-search" className="mb-1 block text-sm font-medium">
              Search articles
            </Label>
            <Input
              id="blog-search"
              placeholder="Search by title, summary, or author"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <Label className="mb-1 block text-sm font-medium">Category</Label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-muted-foreground">Loading posts...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-muted-foreground">No posts match your filters just yet. Check back soon!</div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredPosts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Blog;

