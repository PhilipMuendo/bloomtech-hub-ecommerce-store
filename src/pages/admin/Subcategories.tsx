import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { categories, categoryDisplayMap } from '@/data/categories';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { dispatchRealTimeEvent } from '@/utils/realTimeUpdates';

export interface Subcategory {
  id: number;
  name: string;
  category: string;
  createdAt?: string;
  updatedAt?: string;
}

const subcategorySchema = yup.object().shape({
  name: yup.string()
    .required('Subcategory name is required')
    .min(2, 'Subcategory name must be at least 2 characters')
    .max(100, 'Subcategory name must be at most 100 characters'),
  category: yup.string()
    .oneOf(categories.map(c => c.value), 'Select a valid category')
    .required('Category is required')
});

const Subcategories = () => {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  // Fetch subcategories from backend
  const fetchSubcategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/subcategories');
      if (!res.ok) throw new Error('Failed to fetch subcategories');
      const data = await res.json();
      setSubcategories(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch subcategories');
      toast({
        title: 'Error',
        description: 'Failed to fetch subcategories',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubcategories();
  }, []);

  const handleAddSubcategory = async (formData: any) => {
    try {
      // Get token from user object (this is where it's actually stored)
      const userObj = JSON.parse(localStorage.getItem('user') || '{}');
      const token = userObj.token;
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      // Add displayName field (same as name) to satisfy database requirements
      const dataToSend = {
        ...formData,
        displayName: formData.name,
        isActive: true
      };

      const res = await fetch('/api/subcategories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dataToSend)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || errorData.message || 'Failed to create subcategory');
      }

      const newSubcategory = await res.json();
      setSubcategories(prev => [newSubcategory.data, ...prev]);
      setIsAddDialogOpen(false);
      
      // Dispatch custom event to notify other components about subcategory changes
      window.dispatchEvent(new CustomEvent('subcategoriesUpdated', { 
        detail: { 
          action: 'created', 
          subcategory: newSubcategory.data,
          category: formData.category 
        } 
      }));
      
      toast({
        title: 'Success',
        description: 'Subcategory created successfully',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to create subcategory',
        variant: 'destructive',
      });
    }
  };

  const handleEditSubcategory = (subcategory: Subcategory) => {
    setEditingSubcategory(subcategory);
  };

  const handleUpdateSubcategory = async (formData: any) => {
    if (!editingSubcategory) return;

    try {
      const userObj = JSON.parse(localStorage.getItem('user') || '{}');
      const token = userObj.token;
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      // Add displayName field (same as name) to satisfy database requirements
      const dataToSend = {
        ...formData,
        displayName: formData.name
      };

      const res = await fetch(`/api/subcategories/${editingSubcategory.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dataToSend)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update subcategory');
      }

      const updatedSubcategory = await res.json();
      setSubcategories(prev => 
        prev.map(sub => sub.id === editingSubcategory.id ? updatedSubcategory.data : sub)
      );
      setEditingSubcategory(null);
      
      // Dispatch custom event to notify other components about subcategory changes
      window.dispatchEvent(new CustomEvent('subcategoriesUpdated', { 
        detail: { 
          action: 'updated', 
          subcategory: updatedSubcategory.data,
          category: formData.category 
        } 
      }));
      
      toast({
        title: 'Success',
        description: 'Subcategory updated successfully',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to update subcategory',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteSubcategory = async (subcategoryId: number) => {
    if (!confirm('Are you sure you want to delete this subcategory?')) return;

    try {
      const userObj = JSON.parse(localStorage.getItem('user') || '{}');
      const token = userObj.token;
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const res = await fetch(`/api/subcategories/${subcategoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete subcategory');
      }

      setSubcategories(prev => prev.filter(sub => sub.id !== subcategoryId));
      
      // Dispatch custom event to notify other components about subcategory changes
      window.dispatchEvent(new CustomEvent('subcategoriesUpdated', { 
        detail: { 
          action: 'deleted', 
          subcategoryId: subcategoryId 
        } 
      }));
      
      toast({
        title: 'Success',
        description: 'Subcategory deleted successfully',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to delete subcategory',
        variant: 'destructive',
      });
    }
  };

  const SubcategoryForm = ({ subcategory, onSave, onCancel }: {
    subcategory?: Subcategory;
    onSave: (data?: any) => void;
    onCancel: () => void;
  }) => {
    const isEdit = !!subcategory;
    const defaultValues = subcategory ? {
      name: subcategory.name,
      category: subcategory.category,
    } : {
      name: '',
      category: categories[0].value,
    };

    const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm({
      defaultValues,
      resolver: yupResolver(subcategorySchema),
      mode: 'onBlur',
    });

    const onSubmit = async (data: any) => {
      await onSave(data);
    };

    return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="name">Subcategory Name</Label>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Input id="name" {...field} placeholder="e.g., Dome Cameras" aria-invalid={!!errors.name} />
              )}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.display}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" type="button" onClick={onCancel}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting}>{isEdit ? 'Update Subcategory' : 'Save Subcategory'}</Button>
        </div>
      </form>
    );
  };

  // Filter subcategories
  const filteredSubcategories = subcategories.filter(subcategory => {
    const matchesSearch = subcategory.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || subcategory.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container mx-auto px-2 sm:px-4 py-6 sm:py-8">
      
      
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4 sm:mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Subcategories</h1>
          <p className="text-muted-foreground text-base sm:text-lg">Manage product subcategories</p>
        </div>
        <Button
          onClick={() => setIsAddDialogOpen(true)}
          variant="default"
          className="text-base sm:text-lg px-4 py-2"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Subcategory
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subcategory Management</CardTitle>
          <CardDescription>
            {filteredSubcategories.length} of {subcategories.length} subcategories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by subcategory name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.display}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto max-w-full">
            <Table className="min-w-[500px] w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Subcategory Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubcategories.map((subcategory) => (
                  <TableRow key={subcategory.id}>
                    <TableCell>
                      <div className="font-medium">{subcategory.name}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="default" className="category-badge">
                        {categoryDisplayMap[subcategory.category] || subcategory.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditSubcategory(subcategory)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteSubcategory(subcategory.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Subcategory Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Subcategory</DialogTitle>
            <DialogDescription>
              Create a new subcategory for products
            </DialogDescription>
          </DialogHeader>
          <SubcategoryForm
            onSave={handleAddSubcategory}
            onCancel={() => setIsAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Subcategory Dialog */}
      <Dialog open={!!editingSubcategory} onOpenChange={(open) => !open && setEditingSubcategory(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Subcategory</DialogTitle>
            <DialogDescription>
              Update subcategory information
            </DialogDescription>
          </DialogHeader>
          {editingSubcategory && (
            <SubcategoryForm
              subcategory={editingSubcategory}
              onSave={handleUpdateSubcategory}
              onCancel={() => setEditingSubcategory(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Subcategories; 
