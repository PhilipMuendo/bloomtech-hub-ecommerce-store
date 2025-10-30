import React from 'react';
import { BlogPost } from '@/types';
import { Link } from 'react-router-dom';

interface Props { post: BlogPost }

const BlogCard: React.FC<Props> = ({ post }) => {
  return (
    <div className="border rounded-lg overflow-hidden hover:shadow-md transition">
      {post.coverImage && (
        <Link to={`/blog/${post.slug}`}>
          <img src={post.coverImage} alt={post.title} className="w-full h-48 object-cover" />
        </Link>
      )}
      <div className="p-4">
        <Link to={`/blog/${post.slug}`} className="text-xl font-semibold hover:underline">
          {post.title}
        </Link>
        <p className="text-sm text-muted-foreground mt-1">
          {new Date(post.createdAt).toLocaleDateString()} {post.authorName ? `· ${post.authorName}` : ''}
        </p>
        {post.excerpt && (
          <p className="mt-2 text-sm text-gray-700 line-clamp-3">{post.excerpt}</p>
        )}
        <div className="mt-3">
          <Link to={`/blog/${post.slug}`} className="text-primary text-sm font-medium hover:underline">Read more</Link>
        </div>
      </div>
    </div>
  );
};

export default BlogCard;

