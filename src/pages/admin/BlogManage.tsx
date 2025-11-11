import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { BlogPost } from '@/types';

interface BlogFormState {
  title: string;
  content: string;
  excerpt: string;
  coverImage: string;
  authorName: string;
  category: string;
  tags: string;
  status: 'draft' | 'scheduled' | 'published' | 'archived';
  featured: boolean;
  priority: string;
  readingTime: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  scheduledAt: string;
}

const emptyForm: BlogFormState = {
  title: '',
  content: '',
  excerpt: '',
  coverImage: '',
  authorName: '',
  category: '',
  tags: '',
  status: 'draft',
  featured: false,
  priority: '',
  readingTime: '',
  metaTitle: '',
  metaDescription: '',
  metaKeywords: '',
  scheduledAt: '',
};

const AdminBlogManage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState<BlogFormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'scheduled' | 'published' | 'archived'>('all');

  const canManage = isAdmin();

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const loadPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!user?.token) {
        throw new Error('You must be logged in to manage blog posts');
      }

      const res = await fetch('/api/blog/admin?limit=100', {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to load posts');
      const data = await res.json();
      setPosts(data.items || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load posts');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const filteredPosts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return posts.filter((post) => {
      if (statusFilter !== 'all' && post.status !== statusFilter) return false;
      if (!term) return true;
      const haystack = [post.title, post.excerpt, post.authorName, post.category]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [posts, searchTerm, statusFilter]);

  const handleFormChange = (field: keyof BlogFormState, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    setUploadingImage(true);
    setError(null);

    try {
      if (!user?.token) {
        throw new Error('You must be logged in to upload images');
      }

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Image upload failed');
      }

      const data = await res.json();
      handleFormChange('coverImage', data.url);
      toast({
        title: 'Image uploaded',
        description: 'Cover image uploaded successfully',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to upload image');
      toast({
        title: 'Upload failed',
        description: err.message || 'Failed to upload image',
        variant: 'destructive',
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const clearCoverImage = () => {
    handleFormChange('coverImage', '');
  };

  const mapFormToPayload = () => {
    const payload: Record<string, any> = {
      title: form.title.trim(),
      content: form.content,
      excerpt: form.excerpt.trim(),
      coverImage: form.coverImage.trim() || null,
      authorName: form.authorName.trim() || null,
      category: form.category.trim() || null,
      status: form.status,
      featured: form.featured,
      metaTitle: form.metaTitle.trim() || null,
      metaDescription: form.metaDescription.trim() || null,
      metaKeywords: form.metaKeywords.trim() || null,
    };

    const parsedTags = form.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
    payload.tags = parsedTags;

    if (form.priority) {
      const priorityValue = Number(form.priority);
      if (!Number.isNaN(priorityValue)) payload.priority = priorityValue;
    }

    if (form.readingTime) {
      const readingValue = Number(form.readingTime);
      if (!Number.isNaN(readingValue)) payload.readingTime = readingValue;
    }

    if (form.scheduledAt) {
      const date = new Date(form.scheduledAt);
      if (!Number.isNaN(date.getTime())) {
        payload.scheduledAt = date.toISOString();
      }
    }

    return payload;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user?.token) {
      setError('You must be logged in as an admin to manage blog posts.');
      return;
    }
    if (!form.title.trim() || !form.content.trim()) {
      setError('Title and content are required.');
      return;
    }

    setSaving(true);
    setFeedback(null);
    setError(null);

    try {
      const payload = mapFormToPayload();
      const endpoint = editingId ? `/api/blog/${editingId}` : '/api/blog';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.message || 'Failed to save blog post');
      }

      setFeedback(editingId ? `Updated “${data.title}”` : `Created “${data.title}”`);
      resetForm();
      await loadPosts();
    } catch (err: any) {
      setError(err.message || 'Failed to save post');
    } finally {
      setSaving(false);
    }
  };

  const publish = async (id: string) => {
    if (!user?.token || !canManage) return;
    try {
      const res = await fetch(`/api/blog/${id}/publish`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Publish failed');
      setFeedback(`Published “${data.title}”`);
      await loadPosts();
    } catch (err: any) {
      setError(err.message || 'Failed to publish post');
    }
  };

  const removePost = async (id: string, title: string) => {
    if (!user?.token || !canManage) return;
    if (!confirm(`Delete “${title}”? This action cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/blog/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to delete post');
      setFeedback(`Deleted “${title}”`);
      if (editingId === id) resetForm();
      await loadPosts();
    } catch (err: any) {
      setError(err.message || 'Failed to delete post');
    }
  };

  const beginEdit = async (post: BlogPost) => {
    try {
      setLoadingEdit(true);
      setFeedback(null);
      setError(null);

      if (!user?.token) {
        throw new Error('You must be logged in to edit blog posts');
      }

      const res = await fetch(`/api/blog/admin/${post.slug}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load post content');
      }

      setEditingId(data.id);
      setForm({
        title: data.title,
        content: data.content || '',
        excerpt: data.excerpt || '',
        coverImage: data.coverImage || '',
        authorName: data.authorName || '',
        category: data.category || '',
        tags: (data.tags || []).join(', '),
        status: data.status || 'draft',
        featured: !!data.featured,
        priority: data.priority?.toString() || '',
        readingTime: data.readingTime?.toString() || '',
        metaTitle: data.metaTitle || '',
        metaDescription: data.metaDescription || '',
        metaKeywords: data.metaKeywords || '',
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt).toISOString().slice(0, 16) : '',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load post for editing');
    } finally {
      setLoadingEdit(false);
    }
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Blog Studio</h1>
        <p className="text-muted-foreground">
          Craft, edit, and publish BloomTech Hub stories. Capture release notes, deep dives, and operational updates in one place.
        </p>
      </div>

      {!canManage && (
        <div className="mb-6 rounded-md border border-orange-200 bg-orange-50 p-4 text-sm text-orange-800">
          You need admin privileges to create or manage blog posts.
        </div>
      )}

      {feedback && (
        <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          {feedback}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border bg-white p-6 shadow-sm">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="blog-title">Title</Label>
            <Input
              id="blog-title"
              value={form.title}
              onChange={(e) => handleFormChange('title', e.target.value)}
              placeholder="E.g. Deploying BloomTech Hub with Docker and PM2"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="blog-author">Author</Label>
            <Input
              id="blog-author"
              value={form.authorName}
              onChange={(e) => handleFormChange('authorName', e.target.value)}
              placeholder="Displayed author name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="blog-category">Category</Label>
            <Input
              id="blog-category"
              value={form.category}
              onChange={(e) => handleFormChange('category', e.target.value)}
              placeholder="E.g. Engineering, Operations"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="blog-tags">Tags</Label>
            <Input
              id="blog-tags"
              value={form.tags}
              onChange={(e) => handleFormChange('tags', e.target.value)}
              placeholder="Comma-separated tags (payments, devops, ui)"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Cover Image</Label>
            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload">Upload File</TabsTrigger>
                <TabsTrigger value="url">Image URL</TabsTrigger>
              </TabsList>
              <TabsContent value="upload" className="space-y-3">
                <div
                  className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-6 text-center transition hover:border-muted-foreground/50"
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const file = e.dataTransfer.files?.[0];
                    if (file && file.type.startsWith('image/')) {
                      handleImageUpload(file);
                    }
                  }}
                >
                  <ImageIcon className="mb-3 h-10 w-10 text-muted-foreground" />
                  <p className="mb-2 text-sm font-medium">
                    {uploadingImage ? 'Uploading...' : 'Drop an image here, or click to browse'}
                  </p>
                  <Input
                    id="blog-cover-file"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    disabled={uploadingImage}
                    className="max-w-xs cursor-pointer"
                  />
                  <p className="mt-2 text-xs text-muted-foreground">
                    Supports JPG, PNG, WebP. Max 5MB recommended.
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="url" className="space-y-3">
                <Input
                  id="blog-cover-url"
                  value={form.coverImage}
                  onChange={(e) => handleFormChange('coverImage', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </TabsContent>
            </Tabs>
            {form.coverImage && (
              <div className="mt-4 rounded-lg border bg-muted/20 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">Cover Image Preview</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clearCoverImage}
                    className="h-7 text-xs"
                  >
                    <X className="mr-1 h-3 w-3" />
                    Remove
                  </Button>
                </div>
                <img
                  src={form.coverImage}
                  alt="Cover preview"
                  className="h-48 w-full rounded-md object-cover"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.src = '';
                    img.alt = 'Failed to load image';
                    img.className = 'h-48 w-full rounded-md bg-muted flex items-center justify-center text-muted-foreground';
                  }}
                />
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="blog-status">Status</Label>
            <Select value={form.status} onValueChange={(value) => handleFormChange('status', value)}>
              <SelectTrigger id="blog-status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="blog-priority">Priority</Label>
            <Input
              id="blog-priority"
              type="number"
              value={form.priority}
              onChange={(e) => handleFormChange('priority', e.target.value)}
              placeholder="0"
              min={0}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="blog-reading-time">Reading time (minutes)</Label>
            <Input
              id="blog-reading-time"
              type="number"
              value={form.readingTime}
              onChange={(e) => handleFormChange('readingTime', e.target.value)}
              placeholder="Auto-calculated if left blank"
              min={0}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="blog-scheduled">Schedule publication</Label>
            <Input
              id="blog-scheduled"
              type="datetime-local"
              value={form.scheduledAt}
              onChange={(e) => handleFormChange('scheduledAt', e.target.value)}
              disabled={form.status !== 'scheduled'}
            />
            <p className="text-xs text-muted-foreground">
              Choose a future time when status is set to “Scheduled”.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="blog-meta-title">Meta title</Label>
            <Input
              id="blog-meta-title"
              value={form.metaTitle}
              onChange={(e) => handleFormChange('metaTitle', e.target.value)}
              placeholder="SEO title (optional)"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="blog-meta-description">Meta description</Label>
            <Textarea
              id="blog-meta-description"
              value={form.metaDescription}
              onChange={(e) => handleFormChange('metaDescription', e.target.value)}
              placeholder="Up to 160 characters for search previews"
              className="min-h-[80px]"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="blog-meta-keywords">Meta keywords</Label>
            <Input
              id="blog-meta-keywords"
              value={form.metaKeywords}
              onChange={(e) => handleFormChange('metaKeywords', e.target.value)}
              placeholder="Comma-separated keywords"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="blog-excerpt">Excerpt</Label>
          <Textarea
            id="blog-excerpt"
            value={form.excerpt}
            onChange={(e) => handleFormChange('excerpt', e.target.value)}
            placeholder="Short summary displayed in cards and feeds"
            className="min-h-[80px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="blog-content">Content</Label>
          <Textarea
            id="blog-content"
            value={form.content}
            onChange={(e) => handleFormChange('content', e.target.value)}
            placeholder="Write your article in HTML or Markdown converted to HTML"
            className="min-h-[260px]"
            required
          />
        </div>

        <div className="flex items-center gap-3">
          <Switch
            id="blog-featured"
            checked={form.featured}
            onCheckedChange={(checked) => handleFormChange('featured', checked)}
          />
          <Label htmlFor="blog-featured">Feature this post on the storefront blog landing page</Label>
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={saving || !canManage}>
            {saving ? (editingId ? 'Updating…' : 'Saving…') : editingId ? 'Update Post' : 'Save Post'}
          </Button>
          {editingId && (
            <Button type="button" variant="outline" onClick={resetForm} disabled={saving}>
              Cancel edit
            </Button>
          )}
        </div>
      </form>

      <section className="mt-12 space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Recent posts</h2>
            <p className="text-sm text-muted-foreground">
              Manage drafts, scheduled articles, and published stories from one view.
            </p>
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <Input
              placeholder="Search posts"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="md:w-64"
            />
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
            Loading posts…
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
            No posts found. Adjust your filters or create a new article above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border text-sm">
              <thead className="bg-muted/30">
                <tr className="text-left">
                  <th className="px-4 py-2 font-medium">Title</th>
                  <th className="px-4 py-2 font-medium">Category</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                  <th className="px-4 py-2 font-medium">Updated</th>
                  <th className="px-4 py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-white">
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-muted/40">
                    <td className="px-4 py-3">
                      <div className="font-medium">{post.title}</div>
                      {post.excerpt && (
                        <div className="text-xs text-muted-foreground line-clamp-2">{post.excerpt}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{post.category || '—'}</td>
                    <td className="px-4 py-3">
                      <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>{post.status || 'draft'}</Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {post.updatedAt ? new Date(post.updatedAt).toLocaleString() : '—'}
                    </td>
                    <td className="px-4 py-3 space-x-2 whitespace-nowrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => beginEdit(post)}
                        disabled={loadingEdit}
                      >
                        Edit
                      </Button>
                      {post.status !== 'published' && (
                        <Button variant="secondary" size="sm" onClick={() => publish(post.id)}>
                          Publish
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removePost(post.id, post.title)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminBlogManage;

