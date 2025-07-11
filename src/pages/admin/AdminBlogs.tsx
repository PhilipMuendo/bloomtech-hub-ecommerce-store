import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import * as yup from 'yup';

interface Blog {
  _id: string;
  title: string;
  content: string;
  image?: string;
  author: string;
  slug: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

const blogSchema = yup.object().shape({
  title: yup.string().required('Title is required').min(3, 'Title must be at least 3 characters'),
  content: yup.string().required('Content is required').min(10, 'Content must be at least 10 characters'),
  author: yup.string().required('Author is required').matches(/[a-zA-Z]/, 'Author must contain letters').notOneOf([/^[0-9]+$/], 'Author cannot be only digits'),
  slug: yup.string().required('Slug is required').matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be URL-safe (lowercase, hyphens, no spaces)'),
  image: yup.string(),
  published: yup.boolean(),
});

const AdminBlogs = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [form, setForm] = useState({
    title: '',
    content: '',
    image: '',
    author: '',
    slug: '',
    published: false,
  });
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchBlogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/blogs');
      if (!res.ok) throw new Error('Failed to fetch blogs');
      const data = await res.json();
      setBlogs(data);
    } catch (err: any) {
      setError(err.message);
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBlogs(); }, []);

  const handleOpenDialog = (blog?: Blog) => {
    if (blog) {
      setEditingBlog(blog);
      setForm({
        title: blog.title,
        content: blog.content,
        image: blog.image || '',
        author: blog.author,
        slug: blog.slug,
        published: blog.published,
      });
    } else {
      setEditingBlog(null);
      setForm({ title: '', content: '', image: '', author: '', slug: '', published: false });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingBlog(null);
    setForm({ title: '', content: '', image: '', author: '', slug: '', published: false });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const method = editingBlog ? 'PUT' : 'POST';
      const url = editingBlog ? `/api/blogs/${editingBlog._id}` : '/api/blogs';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify(form),
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
            <Table className="min-w-[600px]">
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Published</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {blogs.map((blog) => (
                <TableRow key={blog._id}>
                  <TableCell>{blog.title}</TableCell>
                  <TableCell>{blog.author}</TableCell>
                  <TableCell>{blog.slug}</TableCell>
                  <TableCell>{blog.published ? 'Yes' : 'No'}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" onClick={() => handleOpenDialog(blog)}>Edit</Button>
                    <Button size="sm" variant="destructive" className="ml-2" onClick={() => handleDelete(blog._id)}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingBlog ? 'Edit Blog' : 'Create Blog'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input name="title" value={form.title} onChange={handleChange} placeholder="Title" required />
            <Input name="author" value={form.author} onChange={handleChange} placeholder="Author" required />
            <Input name="slug" value={form.slug} onChange={handleChange} placeholder="Slug (unique)" required />
            <Input name="image" value={form.image} onChange={handleChange} placeholder="Image URL" />
            <textarea name="content" value={form.content} onChange={handleChange} placeholder="Content" rows={6} className="w-full border rounded p-2" required />
            <label className="flex items-center gap-2">
              <input type="checkbox" name="published" checked={form.published} onChange={handleChange} /> Published
            </label>
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