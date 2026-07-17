import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSettings, SiteSettings } from '@/context/SettingsContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Upload, Settings2, Palette, Share2 } from 'lucide-react';

const AdminSettings: React.FC = () => {
  const { user } = useAuth();
  const { settings, reload } = useSettings();
  const { toast } = useToast();
  const [data, setData] = useState<Partial<SiteSettings>>({});
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  useEffect(() => {
    if (settings) {
      setData(settings);
    }
  }, [settings]);

  const handleFileUpload = async (file: File, field: string) => {
    if (!user?.token) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to upload images',
        variant: 'destructive',
      });
      return;
    }

    setUploadingField(field);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const responseData = await res.json();
      setData((prev) => ({ ...prev, [field]: responseData.url }));
      toast({
        title: 'Image uploaded',
        description: 'Image uploaded successfully',
      });
    } catch (err: any) {
      toast({
        title: 'Upload failed',
        description: err.message || 'Failed to upload image',
        variant: 'destructive',
      });
    } finally {
      setUploadingField(null);
    }
  };

  const handleSave = async () => {
    if (!user?.token) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to save settings',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(data),
      });

      const responseData = await res.json();
      if (!res.ok) {
        throw new Error(responseData.error || 'Failed to save settings');
      }

      toast({
        title: 'Settings saved',
        description: 'Your changes have been saved successfully',
      });
      await reload();
      
      // Reload page after 1 second to show updated branding
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      toast({
        title: 'Save failed',
        description: err.message || 'Failed to save settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Site Settings</h1>
          <p className="text-muted-foreground mt-1">
            Configure your site branding, logos, and social media links
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <Tabs defaultValue="branding" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="branding" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="logo" className="flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            Logo
          </TabsTrigger>
          <TabsTrigger value="social" className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Social Media
          </TabsTrigger>
        </TabsList>

        <TabsContent value="branding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>
                Update your company name and branding details
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="company-name">Company Name</Label>
                <Input
                  id="company-name"
                  value={data.companyName || ''}
                  onChange={(e) => setData({ ...data, companyName: e.target.value })}
                  placeholder="e.g., BLOOMTECH"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-tagline">Tagline</Label>
                <Input
                  id="company-tagline"
                  value={data.companyTagline || ''}
                  onChange={(e) => setData({ ...data, companyTagline: e.target.value })}
                  placeholder="e.g., Hub"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="company-full">Full Company Name</Label>
                <Input
                  id="company-full"
                  value={data.companyFullName || ''}
                  onChange={(e) => setData({ ...data, companyFullName: e.target.value })}
                  placeholder="e.g., BLOOMTECH Hub"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Logo Configuration</CardTitle>
              <CardDescription>
                Choose between a text-based logo or upload your own image
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="logo-type">Header Layout</Label>
                <Select
                  value={data.logoType || 'text'}
                  onValueChange={(value: 'text' | 'image') => setData({ ...data, logoType: value })}
                >
                  <SelectTrigger id="logo-type">
                    <SelectValue placeholder="Select header layout" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Icon + Company Name</SelectItem>
                    <SelectItem value="image">Full Logo Image Only</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  "Icon + Company Name" shows the Logo Icon below next to your company name and
                  tagline. "Full Logo Image Only" shows just the Main Logo Image, with no separate
                  text — use this only if that image already contains your full logo lockup.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Logo Icon (used by "Icon + Company Name")</Label>
                  <div className="flex gap-2">
                    <Input
                      value={data.logoIconSrc || ''}
                      onChange={(e) => setData({ ...data, logoIconSrc: e.target.value })}
                      placeholder="https://..."
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      disabled={uploadingField === 'logoIconSrc'}
                      onClick={() => document.getElementById('logo-icon-upload')?.click()}
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                    <Input
                      id="logo-icon-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, 'logoIconSrc');
                      }}
                    />
                  </div>
                  {data.logoIconSrc && (
                    <img
                      src={data.logoIconSrc}
                      alt="Icon preview"
                      className="mt-2 h-12 w-12 rounded border"
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Main Logo Image (used by "Full Logo Image Only")</Label>
                  <div className="flex gap-2">
                    <Input
                      value={data.logoImageSrc || ''}
                      onChange={(e) => setData({ ...data, logoImageSrc: e.target.value })}
                      placeholder="https://..."
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      disabled={uploadingField === 'logoImageSrc'}
                      onClick={() => document.getElementById('logo-image-upload')?.click()}
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                    <Input
                      id="logo-image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, 'logoImageSrc');
                      }}
                    />
                  </div>
                  {data.logoImageSrc && (
                    <img
                      src={data.logoImageSrc}
                      alt="Logo preview"
                      className="mt-2 h-12 w-auto rounded border"
                    />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Social Media Links</CardTitle>
              <CardDescription>
                Update your social media profile URLs (these appear in the footer)
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="facebook-url">Facebook URL</Label>
                <Input
                  id="facebook-url"
                  value={data.facebookUrl || ''}
                  onChange={(e) => setData({ ...data, facebookUrl: e.target.value })}
                  placeholder="https://facebook.com/yourpage"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitter-url">Twitter/X URL</Label>
                <Input
                  id="twitter-url"
                  value={data.twitterUrl || ''}
                  onChange={(e) => setData({ ...data, twitterUrl: e.target.value })}
                  placeholder="https://x.com/yourhandle"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instagram-url">Instagram URL</Label>
                <Input
                  id="instagram-url"
                  value={data.instagramUrl || ''}
                  onChange={(e) => setData({ ...data, instagramUrl: e.target.value })}
                  placeholder="https://instagram.com/yourhandle"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedin-url">LinkedIn URL</Label>
                <Input
                  id="linkedin-url"
                  value={data.linkedinUrl || ''}
                  onChange={(e) => setData({ ...data, linkedinUrl: e.target.value })}
                  placeholder="https://linkedin.com/company/yourcompany"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex items-center justify-between rounded-lg border bg-muted/20 p-4">
        <div>
          <p className="font-medium">Ready to save your changes?</p>
          <p className="text-sm text-muted-foreground">
            The site will reload automatically to apply the new branding
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? 'Saving...' : 'Save All Changes'}
        </Button>
      </div>
    </div>
  );
};

export default AdminSettings;

