import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

const AdminBlogManage: React.FC = () => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [status, setStatus] = useState<'draft'|'published'>('draft');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const submit = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user?.token}` },
        body: JSON.stringify({ title, content, excerpt, status }),
      });
      if (!res.ok) throw new Error('Failed to save post');
      const data = await res.json();
      setMessage(`Saved: ${data.title}`);
      setTitle(''); setContent(''); setExcerpt(''); setStatus('draft');
      await loadPosts();
    } catch (e: any) {
      setMessage(e.message || 'Failed to save post');
    } finally {
      setSaving(false);
    }
  };

  const loadPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/blog?limit=50');
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setPosts(data.items || []);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPosts(); }, []);

  const publish = async (id: string) => {
    await fetch(`/api/blog/${id}/publish`, { method: 'POST', headers: { Authorization: `Bearer ${user?.token}` } });
    await loadPosts();
  };

  const removePost = async (id: string) => {
    if (!confirm('Delete this post?')) return;
    await fetch(`/api/blog/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${user?.token}` } });
    await loadPosts();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-4">Create Blog Post</h1>
      {message && <div className="mb-4 text-sm">{message}</div>}
      <div className="space-y-3">
        <input className="w-full border rounded p-2" placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
        <textarea className="w-full border rounded p-2 h-48" placeholder="Content (HTML supported)" value={content} onChange={e=>setContent(e.target.value)} />
        <textarea className="w-full border rounded p-2" placeholder="Excerpt" value={excerpt} onChange={e=>setExcerpt(e.target.value)} />
        <div className="flex items-center gap-3">
          <label className="text-sm">Status</label>
          <select className="border rounded p-2" value={status} onChange={e=>setStatus(e.target.value as any)}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
        <Button onClick={submit} disabled={saving}>{saving ? 'Saving...' : 'Save Post'}</Button>
      </div>

      <h2 className="text-xl font-semibold mt-10 mb-3">Recent Posts</h2>
      {loading ? (
        <div>Loading...</div>
      ) : posts.length === 0 ? (
        <div>No posts yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-4">Title</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Created</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id} className="border-b">
                  <td className="py-2 pr-4 whitespace-nowrap">{p.title}</td>
                  <td className="py-2 pr-4">{p.featured ? 'featured · ' : ''}{p.status || 'published'}</td>
                  <td className="py-2 pr-4">{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td className="py-2 space-x-2">
                    {p.status !== 'published' && (
                      <Button variant="outline" size="sm" onClick={() => publish(p.id)}>Publish</Button>
                    )}
                    <Button variant="destructive" size="sm" onClick={() => removePost(p.id)}>Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminBlogManage;

