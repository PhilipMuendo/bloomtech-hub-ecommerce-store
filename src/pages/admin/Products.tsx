import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { categories, categoryDisplayMap } from '@/data/categories';

import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { useSearchParams } from 'react-router-dom';
import { fetchLowStockProducts } from '@/components/AdminLayout';
import './category-badge.css';

export interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  category: 'security' | 'ict' | 'electrical' | 'power';
  subcategory?: string;
  description: string;
  stock: number;
  featured?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Subcategory {
  id: number;
  name: string;
  category: string;
  displayName: string;
  description: string;
  isActive: boolean;
}

const productSchema = yup.object().shape({
  name: yup.string()
    .required('Product name is required')
    .min(2, 'Product name must be at least 2 characters')
    .max(100, 'Product name must be at most 100 characters')
    .matches(/[a-zA-Z]/, 'Product name must contain letters')
    .test('not-only-digits', 'Product name cannot be only digits', value => !/^[0-9]+$/.test(value || '')),
  price: yup.number()
    .typeError('Price must be a number')
    .moreThan(1, 'Price must be greater than 1 KES')
    .required('Price is required'),
  category: yup.string()
    .min(2, 'Category must be at least 2 characters')
    .oneOf(categories.map(c => c.value), 'Select a valid category')
    .required('Category is required'),
  subcategory: yup.string()
    .min(2, 'Subcategory must be at least 2 characters')
    .required('Subcategory is required'),
  imageUrl: yup.string(),
  description: yup.string()
    .required('Description is required')
    .min(10, 'Description must be at least 10 characters'),
  stock: yup.number()
    .typeError('Stock must be a number')
    .integer('Stock must be an integer')
    .min(0, 'Stock cannot be negative')
    .required('Stock is required'),
  featured: yup.boolean(),
});

const BACKEND_HOST = import.meta.env.VITE_BACKEND_HOST || 'http://localhost:5000';

const getImageUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${BACKEND_HOST}${url}`;
};

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [pageSize] = useState(50); // Show 50 products per page
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  // Prevent modal re-opening loops when URL still has ?edit during async updates
  const lastHandledEditIdRef = React.useRef<string | null>(null);

  const [newProduct, setNewProduct] = useState({
    name: '',
    price: 0,
    category: 'ict' as 'ict' | 'electrical' | 'security' | 'power',
    description: '',
    imageUrl: '',
    stock: 1
  });

  // Fetch products from backend
  const fetchProducts = async (page = currentPage) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/products?page=${page}&limit=${pageSize}`);
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      console.log('🔍 API Response:', data);
      setProducts(data.products || []);
      setTotalProducts(data.total || 0);
      setTotalPages(data.totalPages || 1);
      setCurrentPage(data.page || 1);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(1);
    // eslint-disable-next-line
  }, []);

  // Listen for subcategory updates globally (for when forms are not open)
  useEffect(() => {
    const handleSubcategoriesUpdated = (event: CustomEvent) => {
      // Refresh products list to ensure any category/subcategory changes are reflected
      fetchProducts(1);
    };

    window.addEventListener('subcategoriesUpdated', handleSubcategoriesUpdated as EventListener);
    
    return () => {
      window.removeEventListener('subcategoriesUpdated', handleSubcategoriesUpdated as EventListener);
    };
  }, []);

  // Auto-open edit dialog if ?edit=productId is present (guarded to avoid re-open loops)
  useEffect(() => {
    const editId = searchParams.get('edit');
    if (!editId) return;
    // If we've already handled this editId and the dialog was closed, don't auto-open again
    if (lastHandledEditIdRef.current === editId && !editingProduct) return;
    if (products.length === 0) return;
    const prod = products.find(p => p.id === editId);
    if (prod) {
      lastHandledEditIdRef.current = editId;
      setEditingProduct(prod);
    }
    // eslint-disable-next-line
  }, [products, searchParams]);

  // Fallback: If the product to edit is not in the current page results, fetch it by ID and open the modal
  useEffect(() => {
    const maybeOpenEditById = async () => {
      const editId = searchParams.get('edit');
      if (!editId) return;
      // If we've already handled this id and dialog is closed, skip
      if (lastHandledEditIdRef.current === editId && !editingProduct) return;
      if (editingProduct && editingProduct.id === editId) return;
      // If present in current list, the previous effect will handle it
      const existsInList = products.some(p => p.id === editId);
      if (existsInList) return;
      try {
        const res = await fetch(`/api/products/${editId}`);
        if (!res.ok) {
          console.warn('Edit target not found by ID:', editId);
          return;
        }
        const product = await res.json();
        // Normalize expected fields if backend returns different casing/shape
        const normalized: Product = {
          id: product.id,
          name: product.name,
          price: Number(product.price),
          imageUrl: product.imageUrl || '',
          category: product.category,
          subcategory: product.subcategory,
          description: product.description || '',
          stock: Number(product.stock ?? 0),
          featured: !!product.featured,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
        };
        lastHandledEditIdRef.current = editId;
        setEditingProduct(normalized);
      } catch (e) {
        console.error('Failed to fetch product for edit by ID:', e);
      }
    };
    maybeOpenEditById();
    // eslint-disable-next-line
  }, [searchParams, products, editingProduct]);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Debug logging
  console.log('🔍 Products state:', products.length);
  console.log('🔍 Filtered products:', filteredProducts.length);
  console.log('🔍 Search term:', searchTerm);
  console.log('🔍 Selected category:', selectedCategory);

  // Extract unique categories from products
  const uniqueCategories = Array.from(new Set(products.map(p => p.category)));

  const handleAddProduct = async (formData?: any) => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔍 Adding product with data:', formData);
      
      const payload = {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock),
        featured: !!formData.featured,
      };
      
      console.log('📤 Sending payload:', payload);
      
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser?.token}`
        },
        body: JSON.stringify(payload)
      });
      
      console.log('📥 Response status:', res.status);
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('❌ Server error:', errorData);
        throw new Error(errorData.error || errorData.message || errorData.details || 'Failed to add product');
      }
      
      const newProductData = await res.json();
      console.log('✅ Product created:', newProductData);
      
      toast({ 
        title: 'Product Added', 
        description: `${formData.name} has been added to the catalog. Product ID: ${newProductData.id}`,
        duration: 8000
      });
      setIsAddDialogOpen(false);
      fetchProducts(1);
    } catch (err: any) {
      console.error('❌ Error adding product:', err);
      setError(err.message);
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
  };

  const clearEditParam = () => {
    setSearchParams(params => {
      const next = new URLSearchParams(params);
      next.delete('edit');
      return next;
    });
    // Mark current id as handled to prevent re-open until param changes
    const current = searchParams.get('edit');
    if (current) lastHandledEditIdRef.current = current;
  };

  const handleUpdateProduct = async (formData?: any) => {
    if (!editingProduct) return;
    setLoading(true);
    setError(null);
    try {
      // Only send allowed fields
      const updatePayload = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        category: formData.category,
        subcategory: formData.subcategory,
        stock: Number(formData.stock),
        imageUrl: formData.imageUrl,
        featured: !!formData.featured,
      };
      
      console.log('🔧 Updating product with payload:', updatePayload);
      const res = await fetch(`/api/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser?.token}`
        },
        body: JSON.stringify(updatePayload)
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('❌ Server error:', errorData);
        const errorMessage = errorData.details?.[0]?.msg || errorData.error || errorData.message || 'Failed to update product';
        throw new Error(errorMessage);
      }
      
      const data = await res.json();
      toast({ title: 'Product Updated', description: `${formData.name} has been updated.` });
      setEditingProduct(null);
      // Remove ?edit=... from URL to prevent dialog from reopening
      setSearchParams(params => {
        const newParams = new URLSearchParams(params);
        newParams.delete('edit');
        return newParams;
      });
      fetchProducts(1);
      // Refresh low stock notification
      const lowStock = await fetchLowStockProducts(currentUser?.token);
      window.dispatchEvent(new CustomEvent('lowStockUpdated', { detail: lowStock }));
    } catch (err: any) {
      setError(err.message);
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleExportProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/products/export', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${currentUser?.token}`
        }
      });
      
      if (!res.ok) {
        throw new Error('Failed to export products');
      }
      
      // Get the CSV data
      const csvData = await res.text();
      
      // Create a blob and download it
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'products.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({ 
        title: 'Export Successful', 
        description: 'Products have been exported to CSV file.' 
      });
    } catch (err: any) {
      setError(err.message);
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${currentUser?.token}`
        }
      });
      if (!res.ok) throw new Error('Failed to delete product');
      toast({ title: 'Product Deleted', description: 'Product has been removed from the catalog.', variant: 'destructive' });
      fetchProducts(1);
    } catch (err: any) {
      setError(err.message);
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File, setImage: (url: string) => void) => {
    const formData = new FormData();
    formData.append('image', file);
    setLoading(true);
    setError(null);
    try {
      if (!currentUser?.token) {
        throw new Error('You must be logged in to upload images');
      }

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
        },
      });
      if (!res.ok) throw new Error('Image upload failed');
      const data = await res.json();
      setImage(data.url);
      toast({ title: 'Image Uploaded', description: 'Image uploaded successfully.' });
    } catch (err: any) {
      setError(err.message);
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const ProductForm = ({ product, onSave, onCancel }: {
    product?: Product;
    onSave: (data?: any) => void;
    onCancel: () => void;
  }) => {
    const isEdit = !!product;
    const defaultValues = product ? {
      name: product.name,
      price: product.price,
      category: product.category,
      subcategory: product.subcategory || '',
      imageUrl: product.imageUrl,
      description: product.description,
      stock: product.stock,
      featured: !!product.featured,
    } : {
      name: '',
      price: 0,
      category: 'ict', // Set a default category
      subcategory: '',
      imageUrl: '',
      description: '',
      stock: 1,
      featured: false,
    };

    const { control, handleSubmit, setValue, watch, formState: { errors, isSubmitting }, reset } = useForm({
      defaultValues,
      resolver: yupResolver(productSchema),
      mode: 'onBlur',
      shouldUnregister: false,
    });

    // Reset form when product changes (for editing)
    React.useEffect(() => {
      if (product) {
        reset(defaultValues);
      }
    }, [product, reset]);
    const imageValue = watch('imageUrl');
    const dropzoneRef = useRef(null);

    // Drag-and-drop image upload
    const onDrop = useCallback(async (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        setValue('imageUrl', '');
        setValue('imageUrl', await uploadImage(acceptedFiles[0]));
      }
    }, [setValue]);
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': [] } });

    async function uploadImage(file: File): Promise<string> {
      setValue('imageUrl', '');
      setValue('imageUrl', 'uploading');
      try {
        if (!currentUser?.token) {
          throw new Error('You must be logged in to upload images');
        }

        const formData = new FormData();
        formData.append('image', file);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        });
        if (!res.ok) throw new Error('Image upload failed');
        const data = await res.json();
        return data.url;
      } catch (err) {
        return '';
      }
    }

    const onSubmit = async (data: any) => {
      await onSave(data);
    };

    // Watch for category changes to update subcategories
    const selectedCategory = watch('category');
    // Utility to normalize labels to Title Case (treat '-' and '_' as spaces) for stable rendering
    const normalizeLabel = (value: string) => {
      if (!value) return value;
      const spaced = value.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();
      return spaced
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    };

    const [availableSubcategories, setAvailableSubcategories] = React.useState<Subcategory[]>(() => {
      if (product?.subcategory && product?.category) {
        return [{
          id: -1,
          name: product.subcategory,
          category: product.category,
          displayName: normalizeLabel(product.subcategory),
          description: product.subcategory,
          isActive: true,
        }];
      }
      return [];
    });

    // Fetch subcategories from API when category changes
    React.useEffect(() => {
      const fetchSubcategories = async () => {
        try {
          const response = await fetch(`/api/subcategories/category/${selectedCategory}`);
          
          if (response.ok) {
            const data = await response.json();
            let list: Subcategory[] = Array.isArray(data.data) ? data.data : [];
            // Normalize labels to Title Case for visual stability
            list = list.map(s => ({
              ...s,
              displayName: normalizeLabel(s.displayName || s.name)
            }));
            // Ensure current subcategory remains selectable during edit even if not in fetched list
            if (isEdit && product?.subcategory) {
              const exists = list.some(s => s.name === product.subcategory);
              if (!exists) {
                list = [
                  {
                    id: -1,
                    name: product.subcategory,
                    category: selectedCategory,
                    displayName: normalizeLabel(product.subcategory),
                    description: product.subcategory,
                    isActive: true,
                  },
                  ...list
                ];
              }
            }
            // Deduplicate by name to avoid flicker
            const seen = new Set<string>();
            const deduped = list.filter(item => {
              if (seen.has(item.name)) return false;
              seen.add(item.name);
              return true;
            });
            setAvailableSubcategories(deduped);
          } else {
            console.error('Failed to fetch subcategories:', response.status, response.statusText);
            setAvailableSubcategories([]);
          }
        } catch (error) {
          console.error('Error fetching subcategories:', error);
          setAvailableSubcategories([]);
        }
      };

      if (selectedCategory) {
        fetchSubcategories();
        // Only reset subcategory when creating a new product.
        if (!isEdit) {
          setValue('subcategory', '');
        }
      }
    }, [selectedCategory, setValue]);

    // Listen for subcategory updates from other components
    React.useEffect(() => {
      const handleSubcategoriesUpdated = async (event: CustomEvent) => {
        const { action, subcategory, category, subcategoryId } = event.detail;
        
        // If the updated subcategory belongs to the current category, refresh the list
        if (selectedCategory && (
          (action === 'created' && subcategory.category === selectedCategory) ||
          (action === 'updated' && subcategory.category === selectedCategory) ||
          (action === 'deleted' && selectedCategory) // Refresh if any subcategory was deleted
        )) {
          try {
            const response = await fetch(`/api/subcategories/category/${selectedCategory}`);
            if (response.ok) {
              const data = await response.json();
              setAvailableSubcategories(data.data || []);
            }
          } catch (error) {
            console.error('Error refreshing subcategories:', error);
          }
        }
      };

      window.addEventListener('subcategoriesUpdated', handleSubcategoriesUpdated as EventListener);
      
      return () => {
        window.removeEventListener('subcategoriesUpdated', handleSubcategoriesUpdated as EventListener);
      };
    }, [selectedCategory]);

    // Live preview data
    const previewData = watch();

    return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-4 md:p-8 min-w-[350px] w-full max-w-2xl mx-auto" aria-label="Add Product Form">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="name">Product Name</Label>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Input id="name" {...field} placeholder="Enter product name" aria-invalid={!!errors.name} />
              )}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <Label htmlFor="price">Price (KES)</Label>
            <Controller
              name="price"
              control={control}
              render={({ field }) => (
                <Input id="price" type="number" {...field} placeholder="0" aria-invalid={!!errors.price} />
              )}
            />
            {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          <div>
            <Label htmlFor="subcategory">Subcategory *</Label>
            <Controller
              name="subcategory"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="subcategory">
                    <SelectValue placeholder="Select subcategory (required)" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSubcategories.map(subcat => (
                      <SelectItem key={subcat.name} value={subcat.name}>{subcat.displayName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.subcategory && <p className="text-red-500 text-xs mt-1">{errors.subcategory.message}</p>}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="stock">Stock</Label>
            <Controller
              name="stock"
              control={control}
              render={({ field }) => (
                <Input id="stock" type="number" min={0} {...field} placeholder="Stock quantity" aria-invalid={!!errors.stock} />
              )}
            />
            {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock.message}</p>}
          </div>
        </div>
        <div>
          <Label htmlFor="featured" className="flex items-center gap-2">
            <Controller
              name="featured"
              control={control}
              render={({ field }) => {
                return (
                  <>
                    <input id="featured" type="checkbox" checked={!!field.value} onChange={e => field.onChange(e.target.checked)} />
                    <span>Featured Product</span>
                  </>
                );
              }}
            />
          </Label>
        </div>
        <div>
          <Label>Product Image</Label>
          <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
            aria-label="Image Upload Dropzone">
            <input {...getInputProps()} />
            {isDragActive ? (
              <p>Drop the image here ...</p>
            ) : (
              <p>Drag 'n' drop an image here, or click to select</p>
            )}
          </div>
          {imageValue === 'uploading' && <p className="text-blue-500 text-xs mt-1">Uploading image...</p>}
          {imageValue && imageValue !== 'uploading' && (
            <div className="mt-2 flex flex-col items-center">
              <img src={getImageUrl(imageValue)} alt="Preview" className="w-32 h-32 object-cover rounded-lg mb-2" />
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => setValue('imageUrl', '')}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Remove Image
              </Button>
            </div>
          )}
          {errors.imageUrl && <p className="text-red-500 text-xs mt-1">{errors.imageUrl.message}</p>}
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <Textarea id="description" {...field} placeholder="Enter product description" aria-invalid={!!errors.description} />
            )}
          />
          {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" type="button" onClick={onCancel}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting}>{isEdit ? 'Update Product' : 'Save Product'}</Button>
        </div>
        {/* Live Preview */}
        <div className="mt-8">
          <h4 className="font-semibold mb-2">Live Preview</h4>
          <div className="max-w-xs mx-auto">
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col items-center">
                  {previewData.imageUrl && previewData.imageUrl !== 'uploading' && (
                    <img src={getImageUrl(previewData.imageUrl)} alt="Preview" className="w-32 h-32 object-cover rounded-lg mb-2" />
                  )}
                  <div className="font-bold text-lg mb-1">{previewData.name || 'Product Name'}</div>
                  <div className="text-muted-foreground mb-1">
                    {categoryDisplayMap[previewData.category] || 'Category'}
                    {previewData.subcategory && (
                      <span className="text-xs text-muted-foreground block">
                        {availableSubcategories.find(sub => sub.name === previewData.subcategory)?.displayName || previewData.subcategory}
                      </span>
                    )}
                  </div>
                  <div className="text-primary font-semibold mb-1">KES {previewData.price || 0}</div>
                  <div className="text-xs text-muted-foreground mb-1">{previewData.description || 'Description...'}</div>
                  <ul className="text-xs text-muted-foreground list-disc pl-4">
                    {/* Specifications are no longer displayed in the form, so this block is removed */}
                  </ul>
                  <div className="mt-2">
                    <Badge variant={previewData.featured ? 'default' : 'secondary'}>
                      {previewData.featured ? 'Featured' : 'Standard'}
                    </Badge>
                    <Badge variant={previewData.stock > 0 ? 'default' : 'destructive'} className="ml-2">
                      {previewData.stock > 0 ? 'In Stock' : 'Out of Stock'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    );
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 py-6 sm:py-8">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4 sm:mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground text-base sm:text-lg">Manage your product catalog</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            variant="default"
            className="text-base sm:text-lg px-4 py-2"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
                     <Button
             onClick={handleExportProducts}
             variant="outline"
             className="text-base sm:text-lg px-4 py-2"
           >
             Export Products (CSV)
           </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Catalog</CardTitle>
          <CardDescription>
            {filteredProducts.length} of {totalProducts} products
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
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

          {/* Table wrapper for horizontal scroll on mobile */}
          <div className="overflow-x-auto max-w-full">
            {loading ? (
              <div className="py-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading products...</p>
              </div>
            ) : error ? (
              <div className="py-8 text-center">
                <p className="text-red-500 mb-4">{error}</p>
                <Button onClick={() => fetchProducts(1)} variant="outline">
                  Retry
                </Button>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-muted-foreground mb-4">
                  {searchTerm || selectedCategory !== 'all' 
                    ? 'No products match your search criteria.' 
                    : 'No products found.'}
                </p>
                {(searchTerm || selectedCategory !== 'all') && (
                  <Button 
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('all');
                    }} 
                    variant="outline"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            ) : (
              <Table className="min-w-[700px] w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Featured</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {product.imageUrl ? (
                          <img
                            src={getImageUrl(product.imageUrl)}
                            alt={product.name}
                            className="w-10 h-10 rounded object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const sibling = e.currentTarget.nextElementSibling as HTMLElement | null;
                              if (sibling) sibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        {!product.imageUrl && (
                          <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-400 text-xs">No img</span>
                          </div>
                        )}
                        <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center" style={{ display: 'none' }}>
                          <span className="text-gray-400 text-xs">Broken</span>
                        </div>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {product.description.substring(0, 50).replace(/&amp;amp;/g, '&').replace(/&amp;/g, '&')}...
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge variant="default" className="category-badge">
                          {categoryDisplayMap[product.category] || product.category}
                        </Badge>
                        {product.subcategory && (
                          <div className="text-xs text-muted-foreground">
                            {product.subcategory}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>KES {product.price.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={product.stock > 0 ? 'default' : 'destructive'}>
                        {product.stock}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.featured ? 'default' : 'secondary'}>
                        {product.featured ? 'Yes' : 'No'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditProduct(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalProducts)} of {totalProducts} products
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchProducts(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <div className="text-sm">
                  Page {currentPage} of {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchProducts(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {editingProduct && (
        <Dialog
          open={!!editingProduct}
          onOpenChange={(open) => {
            if (!open) {
              setEditingProduct(null);
              clearEditParam();
            }
          }}
        >
          <DialogContent className="max-w-2xl h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
              <DialogDescription>
                Update product information
              </DialogDescription>
            </DialogHeader>
            <ProductForm
              product={editingProduct}
              onSave={handleUpdateProduct}
              onCancel={() => { setEditingProduct(null); clearEditParam(); }}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Add Product Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Product</DialogTitle>
            <DialogDescription>
              Enter product details to add a new product
            </DialogDescription>
          </DialogHeader>
          <ProductForm
            onSave={handleAddProduct}
            onCancel={() => setIsAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Products;