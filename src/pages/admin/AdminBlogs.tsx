import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import * as yup from 'yup';
import { useAutoRefreshList, REAL_TIME_EVENTS } from '@/utils/realTimeUpdates';

const CATEGORIES = [
  'Technology', 'Business', 'Tutorial', 'News', 'Product', 'Industry', 'Tips'
];

interface Blog {
  id: string;
  title: string;
  content: string;
  image?: string;
  author: string;
  slug: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  scheduledAt?: string;
  publishedAt?: string;
  category?: string;
  tags?: string[];
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  featured?: boolean;
  priority?: number;
  excerpt?: string;
  socialImage?: string;
  readingTime?: number;
  status?: string;
  views?: number;
  likes?: number;
}

const blogSchema = yup.object().shape({
  title: yup.string().required('Title is required').min(3, 'Title must be at least 3 characters'),
  content: yup.string().required('Content is required').min(10, 'Content must be at least 10 characters'),
  author: yup.string().required('Author is required').matches(/[a-zA-Z]/, 'Author must contain letters').test('not-only-digits', 'Author cannot be only digits', value => !/^[0-9]+$/.test(value || '')),
  slug: yup.string().required('Slug is required').matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be URL-safe (lowercase, hyphens, no spaces)'),
  image: yup.string(),
  published: yup.boolean(),
  scheduledAt: yup.string().nullable(),
  category: yup.string().nullable(),
  tags: yup.array().of(yup.string()),
  metaTitle: yup.string(),
  metaDescription: yup.string(),
  metaKeywords: yup.string(),
  featured: yup.boolean(),
  priority: yup.number().min(0).max(10),
  excerpt: yup.string(),
  socialImage: yup.string(),
});

const AdminBlogs = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [form, setForm] = useState<any>({
    title: '', content: '', image: '', author: '', slug: '', published: false,
    scheduledAt: '', category: '', tags: [], metaTitle: '', metaDescription: '', metaKeywords: '', featured: false, priority: 0, excerpt: '', socialImage: ''
  });
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchBlogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/blogs/admin/all', {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch blogs');
      const data = await res.json();
      setBlogs(data.blogs || data); // support both paginated and array
    } catch (err: any) {
      setError(err.message);
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh blogs list when blogs are updated
  useAutoRefreshList(
    fetchBlogs,
    [REAL_TIME_EVENTS.BLOGS_UPDATED],
    []
  );

  const handleOpenDialog = (blog?: Blog) => {
    if (blog) {
      setEditingBlog(blog);
      setForm({
        ...blog,
        tags: blog.tags || [],
        scheduledAt: blog.scheduledAt ? blog.scheduledAt.slice(0, 16) : '',
        priority: blog.priority ?? 0,
        featured: blog.featured ?? false,
      });
    } else {
      setEditingBlog(null);
      setForm({ title: '', content: '', image: '', author: '', slug: '', published: false, scheduledAt: '', category: '', tags: [], metaTitle: '', metaDescription: '', metaKeywords: '', featured: false, priority: 0, excerpt: '', socialImage: '' });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingBlog(null);
    setForm({ title: '', content: '', image: '', author: '', slug: '', published: false, scheduledAt: '', category: '', tags: [], metaTitle: '', metaDescription: '', metaKeywords: '', featured: false, priority: 0, excerpt: '', socialImage: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm((prev: any) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
    setForm((prev: any) => ({ ...prev, tags }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const method = editingBlog ? 'PUT' : 'POST';
      const url = editingBlog ? `/api/blogs/${editingBlog.id}` : '/api/blogs';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({
          ...form,
          tags: form.tags,
          scheduledAt: form.scheduledAt ? new Date(form.scheduledAt).toISOString() : null,
          priority: Number(form.priority) || 0,
        }),
      });
      if (!res.ok) throw new Error('Failed to save blog');
      handleCloseDialog();
      fetchBlogs();
    } catch (err: any) {
      setError(err.message);
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this blog post?')) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/blogs/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      if (!res.ok) throw new Error('Failed to delete blog');
      fetchBlogs();
    } catch (err: any) {
      setError(err.message);
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
        <h1 className="text-2xl sm:text-3xl font-bold">Blogs</h1>
        <Button onClick={() => handleOpenDialog()}>Create Blog</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Blog Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-x-auto">
            <Table className="min-w-[1200px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Scheduled</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Likes</TableHead>
                  <TableHead>Reading Time</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {blogs.map((blog) => (
                  <TableRow key={blog.id}>
                    <TableCell>{blog.title}</TableCell>
                    <TableCell>{blog.status || (blog.published ? 'published' : 'draft')}</TableCell>
                    <TableCell>{blog.scheduledAt ? new Date(blog.scheduledAt).toLocaleString() : '-'}</TableCell>
                    <TableCell>{blog.category || '-'}</TableCell>
                    <TableCell>{blog.tags?.join(', ') || '-'}</TableCell>
                    <TableCell>{blog.featured ? 'Yes' : 'No'}</TableCell>
                    <TableCell>{blog.priority ?? 0}</TableCell>
                    <TableCell>{blog.views ?? 0}</TableCell>
                    <TableCell>{blog.likes ?? 0}</TableCell>
                    <TableCell>{blog.readingTime ? `${blog.readingTime} min` : '-'}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => handleOpenDialog(blog)}>Edit</Button>
                      <Button size="sm" variant="destructive" className="ml-2" onClick={() => handleDelete(blog.id)}>Delete</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingBlog ? 'Edit Blog' : 'Create Blog'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input name="title" value={form.title} onChange={handleChange} placeholder="Title" required />
              <Input name="author" value={form.author} onChange={handleChange} placeholder="Author" required />
              <Input name="slug" value={form.slug} onChange={handleChange} placeholder="Slug (unique)" required />
              <Input name="image" value={form.image} onChange={handleChange} placeholder="Image URL" />
              <Input name="socialImage" value={form.socialImage} onChange={handleChange} placeholder="Social Image URL" />
              <Input name="metaTitle" value={form.metaTitle} onChange={handleChange} placeholder="Meta Title (SEO)" />
              <Input name="metaDescription" value={form.metaDescription} onChange={handleChange} placeholder="Meta Description (SEO)" />
              <Input name="metaKeywords" value={form.metaKeywords} onChange={handleChange} placeholder="Meta Keywords (comma separated)" />
              <Input name="excerpt" value={form.excerpt} onChange={handleChange} placeholder="Excerpt (short preview)" />
              <Input name="priority" type="number" min={0} max={10} value={form.priority} onChange={handleChange} placeholder="Priority (0-10)" />
              <select name="category" value={form.category} onChange={handleChange} className="border rounded p-2">
                <option value="">Select Category</option>
                {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <Input name="tags" value={form.tags?.join(', ') || ''} onChange={handleTagsChange} placeholder="Tags (comma separated)" />
              <Input name="scheduledAt" type="datetime-local" value={form.scheduledAt} onChange={handleChange} placeholder="Schedule Publish" />
              <label className="flex items-center gap-2">
                <input type="checkbox" name="published" checked={form.published} onChange={handleChange} /> Published
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} /> Featured
              </label>
            </div>
            <textarea name="content" value={form.content} onChange={handleChange} placeholder="Content" rows={8} className="w-full border rounded p-2" required />
            <div className="text-muted-foreground text-xs">Reading time: {form.readingTime ? `${form.readingTime} min` : 'auto-calculated'}</div>
            <DialogFooter>
              <Button type="submit" disabled={loading}>{editingBlog ? 'Update' : 'Create'}</Button>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>Cancel</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBlogs; 