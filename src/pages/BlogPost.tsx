import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BlogPost } from '@/types';
import { Badge } from '@/components/ui/badge';

const sanitizeHtml = (html: string) => {
  if (typeof window === 'undefined') return html;
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  doc.querySelectorAll('script, style').forEach((el) => el.remove());
  doc.querySelectorAll('*').forEach((el) => {
    Array.from(el.attributes).forEach((attr) => {
      if (/^on/i.test(attr.name)) {
        el.removeAttribute(attr.name);
      }
    });
  });
  return doc.body.innerHTML;
};

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

const BlogPostPage: React.FC = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/blog/${slug}`, { signal: controller.signal });
        if (!res.ok) throw new Error('Failed to load post');
        const data = await res.json();
        setPost(data);
      } catch (e: any) {
        if (e.name === 'AbortError') return;
        setError(e.message || 'Failed to load post');
      } finally {
        setLoading(false);
      }
    };
    if (slug) load();
    return () => controller.abort();
  }, [slug]);

  const sanitizedContent = useMemo(() => sanitizeHtml(post?.content || ''), [post?.content]);
  const publishLabel = post?.publishedAt ? formatDateTime(post.publishedAt) : post?.createdAt ? formatDateTime(post.createdAt) : null;

  if (loading) return <div className="container mx-auto px-4 py-8">Loading...</div>;
  if (error) return <div className="container mx-auto px-4 py-8 text-red-600">{error}</div>;
  if (!post) return <div className="container mx-auto px-4 py-8">Not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      {post.coverImage && (
        <img src={post.coverImage} alt={post.title} className="w-full max-h-96 rounded-lg object-cover" />
      )}
      <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        {publishLabel && <span>{publishLabel}</span>}
        {post.authorName && <span>· {post.authorName}</span>}
        {post.readingTime ? <span>· {post.readingTime} min read</span> : null}
        {post.views ? <span>· {post.views.toLocaleString()} views</span> : null}
      </div>
      <h1 className="mt-4 text-4xl font-bold leading-tight">{post.title}</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        {post.category && <Badge variant="secondary">{post.category}</Badge>}
        {post.tags?.map((tag) => (
          <Badge key={tag} variant="outline">
            #{tag}
          </Badge>
        ))}
      </div>
      <article
        className="prose prose-lg mt-8 max-w-none prose-headings:scroll-mt-24 prose-img:rounded-lg"
        dangerouslySetInnerHTML={{ __html: sanitizedContent || '<p>This article is still being prepared.</p>' }}
      />
    </div>
  );
};

export default BlogPostPage;

