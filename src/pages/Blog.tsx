
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const Blog = () => {
  const blogPosts = [
    {
      id: 1,
      title: "Top 5 Tools Every Technician Should Own",
      excerpt: "Discover the essential tools that every ICT and electrical technician needs in their toolkit for efficient and professional work.",
      date: "January 15, 2024",
      readTime: "5 min read",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=250&fit=crop",
      slug: "top-5-tools-every-technician-should-own"
    },
    {
      id: 2,
      title: "Choosing the Right Router for Your Office Setup",
      excerpt: "Learn how to select the perfect router for your business needs, from small offices to enterprise-level installations.",
      date: "January 10, 2024",
      readTime: "7 min read",
      image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=250&fit=crop",
      slug: "choosing-the-right-router-for-your-office-setup"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Tech Tips & News</h1>
        <p className="text-muted-foreground text-lg">
          Stay updated with the latest trends, tips, and insights in ICT equipment and electrical materials.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {blogPosts.map((post) => (
          <Card key={post.id} className="group card-hover">
            <div className="relative overflow-hidden rounded-t-lg">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <CardHeader>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                <span>{post.date}</span>
                <span>•</span>
                <span>{post.readTime}</span>
              </div>
              <CardTitle className="group-hover:text-primary transition-colors">
                {post.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 line-clamp-3">
                {post.excerpt}
              </p>
              <Button variant="outline" asChild>
                <Link to={`/blog/${post.slug}`}>
                  Read More
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 text-center">
        <div className="bg-muted rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Subscribe to Our Newsletter</h2>
          <p className="text-muted-foreground mb-6">
            Get the latest tech tips, product updates, and industry insights delivered to your inbox.
          </p>
          <div className="max-w-md mx-auto flex space-x-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <Button className="bg-accent hover:bg-accent/90">
              Subscribe
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog;
