import React from 'react';
import { BlogPost } from '@/types';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

interface Props {
  post: BlogPost;
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

const BlogCard: React.FC<Props> = ({ post }) => {
  const publishLabel = post.publishedAt ? formatDate(post.publishedAt) : formatDate(post.createdAt);
  const readingTime = post.readingTime ? `${post.readingTime} min read` : null;

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      {post.coverImage && (
        <Link to={`/blog/${post.slug}`} className="block overflow-hidden">
          <img
            src={post.coverImage}
            alt={post.title}
            className="h-48 w-full object-cover transition duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </Link>
      )}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
          <span>{publishLabel}</span>
          {post.authorName && <span>· {post.authorName}</span>}
          {readingTime && <span>· {readingTime}</span>}
        </div>

        {post.category && (
          <Badge variant="secondary" className="w-fit">
            {post.category}
          </Badge>
        )}

        <Link to={`/blog/${post.slug}`} className="text-xl font-semibold leading-snug hover:text-primary">
          {post.title}
        </Link>

        {post.excerpt && (
          <p className="line-clamp-3 text-sm text-muted-foreground">{post.excerpt}</p>
        )}

        <div className="mt-auto pt-4">
          <Link to={`/blog/${post.slug}`} className="text-sm font-medium text-primary hover:underline">
            Read more
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BlogCard;

