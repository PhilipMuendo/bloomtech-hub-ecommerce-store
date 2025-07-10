import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { blogPosts } from './Blog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
        <p className="mb-6">Sorry, the blog post you are looking for does not exist.</p>
        <Button asChild>
          <Link to="/blog">Back to Blog</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-3xl mx-auto">
        <div className="relative overflow-hidden rounded-t-lg">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-64 object-cover"
          />
        </div>
        <CardHeader>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
            <span>{post.date}</span>
            <span>•</span>
            <span>{post.readTime}</span>
          </div>
          <CardTitle className="text-3xl mb-2">{post.title}</CardTitle>
        </CardHeader>
        <CardContent>
          {/* For now, just show the excerpt as the main content. Replace with full content if available. */}
          <p className="text-lg text-muted-foreground mb-8">{post.excerpt}</p>
          <Button asChild variant="outline">
            <Link to="/blog">Back to Blog</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default BlogPost; 