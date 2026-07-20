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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Upload, Settings2, Share2, Phone, Landmark, SlidersHorizontal } from 'lucide-react';

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
            Configure your logo, contact info, payment details, and store operations
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <Tabs defaultValue="logo" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 h-auto">
          <TabsTrigger value="logo" className="flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            Logo
          </TabsTrigger>
          <TabsTrigger value="contact" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Contact
          </TabsTrigger>
          <TabsTrigger value="payment" className="flex items-center gap-2">
            <Landmark className="h-4 w-4" />
            Payment
          </TabsTrigger>
          <TabsTrigger value="social" className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Social Media
          </TabsTrigger>
          <TabsTrigger value="operations" className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Operations
          </TabsTrigger>
        </TabsList>

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

        <TabsContent value="contact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                Shown in the site footer and on the Contact page — editing here updates both at once
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contact-phone">Phone</Label>
                <Input
                  id="contact-phone"
                  value={data.contactPhone || ''}
                  onChange={(e) => setData({ ...data, contactPhone: e.target.value })}
                  placeholder="e.g., 0769 928 629"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-whatsapp">WhatsApp Number</Label>
                <Input
                  id="contact-whatsapp"
                  value={data.contactWhatsapp || ''}
                  onChange={(e) => setData({ ...data, contactWhatsapp: e.target.value })}
                  placeholder="e.g., 0727 717 787"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-email">Email</Label>
                <Input
                  id="contact-email"
                  type="email"
                  value={data.contactEmail || ''}
                  onChange={(e) => setData({ ...data, contactEmail: e.target.value })}
                  placeholder="e.g., info@bloomtechub.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="business-hours">Business Hours</Label>
                <Input
                  id="business-hours"
                  value={data.businessHours || ''}
                  onChange={(e) => setData({ ...data, businessHours: e.target.value })}
                  placeholder="e.g., Mon–Fri: 8:00 AM – 5:00 PM"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="contact-address">Address</Label>
                <Textarea
                  id="contact-address"
                  value={data.contactAddress || ''}
                  onChange={(e) => setData({ ...data, contactAddress: e.target.value })}
                  placeholder="P.O. BOX 14294–00800, Kanha Building, Lower Kabete Road..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bank Transfer Details</CardTitle>
              <CardDescription>
                Shown to customers paying by bank transfer. Leave any field blank and bank transfer
                will be reported as unavailable at checkout rather than showing an incomplete account.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="bank-account-name">Account Name</Label>
                <Input
                  id="bank-account-name"
                  value={data.bankAccountName || ''}
                  onChange={(e) => setData({ ...data, bankAccountName: e.target.value })}
                  placeholder="e.g., BLOOMTECH HUB LIMITED"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank-account-number">Account Number</Label>
                <Input
                  id="bank-account-number"
                  value={data.bankAccountNumber || ''}
                  onChange={(e) => setData({ ...data, bankAccountNumber: e.target.value })}
                  placeholder="e.g., 1234567890"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank-name">Bank Name</Label>
                <Input
                  id="bank-name"
                  value={data.bankName || ''}
                  onChange={(e) => setData({ ...data, bankName: e.target.value })}
                  placeholder="e.g., Equity Bank Kenya"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank-branch">Branch</Label>
                <Input
                  id="bank-branch"
                  value={data.bankBranch || ''}
                  onChange={(e) => setData({ ...data, bankBranch: e.target.value })}
                  placeholder="e.g., Nairobi West"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank-swift">SWIFT Code</Label>
                <Input
                  id="bank-swift"
                  value={data.bankSwiftCode || ''}
                  onChange={(e) => setData({ ...data, bankSwiftCode: e.target.value })}
                  placeholder="e.g., EQBLKEXX"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank-code">Bank Code</Label>
                <Input
                  id="bank-code"
                  value={data.bankCode || ''}
                  onChange={(e) => setData({ ...data, bankCode: e.target.value })}
                  placeholder="e.g., 068"
                />
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

        <TabsContent value="operations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Inventory</CardTitle>
              <CardDescription>
                Controls the default "low stock" cutoff used by the admin low-stock list and notification badge
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="low-stock-threshold">Low Stock Threshold</Label>
                <Input
                  id="low-stock-threshold"
                  type="number"
                  min={1}
                  value={data.lowStockThreshold ?? 10}
                  onChange={(e) => setData({ ...data, lowStockThreshold: parseInt(e.target.value, 10) || 1 })}
                  placeholder="10"
                />
                <p className="text-xs text-muted-foreground">
                  Products at or below this stock count are flagged as low stock.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Site Announcement</CardTitle>
              <CardDescription>
                An optional banner shown at the top of every storefront page — useful for promotions or notices
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">Show Announcement Banner</p>
                  <p className="text-xs text-muted-foreground">Displays the message below to all visitors</p>
                </div>
                <Switch
                  checked={!!data.announcementEnabled}
                  onCheckedChange={(checked) => setData({ ...data, announcementEnabled: checked })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="announcement-text">Banner Text</Label>
                <Input
                  id="announcement-text"
                  value={data.announcementText || ''}
                  onChange={(e) => setData({ ...data, announcementText: e.target.value })}
                  placeholder="e.g., Free delivery on orders over KES 10,000 this week!"
                  maxLength={200}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Maintenance Mode</CardTitle>
              <CardDescription>
                Takes the storefront offline with a "back shortly" page while you make changes. Admin pages stay accessible.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">Enable Maintenance Mode</p>
                  <p className="text-xs text-muted-foreground">
                    Customers won't be able to browse or check out until this is turned off
                  </p>
                </div>
                <Switch
                  checked={!!data.maintenanceMode}
                  onCheckedChange={(checked) => setData({ ...data, maintenanceMode: checked })}
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

