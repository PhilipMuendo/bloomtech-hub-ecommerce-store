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

  // Auto-open edit dialog if ?edit=productId is present
  useEffect(() => {
    if (products.length > 0) {
      const editId = searchParams.get('edit');
      if (editId) {
        const prod = products.find(p => p.id === editId);
        if (prod) setEditingProduct(prod);
      }
    }
    // eslint-disable-next-line
  }, [products]);

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
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser?.token}`
        },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          stock: Number(formData.stock),
          featured: !!formData.featured,
        })
      });
      if (!res.ok) throw new Error('Failed to add product');
      const newProductData = await res.json();
              toast({ 
          title: 'Product Added', 
          description: `${formData.name} has been added to the catalog. Product ID: ${newProductData.id}`,
          duration: 8000
        });
      setIsAddDialogOpen(false);
      fetchProducts(1);
    } catch (err: any) {
      setError(err.message);
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
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
      const data = await res.json();
      if (!res.ok) throw new Error('Failed to update product');
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
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
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
        const formData = new FormData();
        formData.append('image', file);
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
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
    const [availableSubcategories, setAvailableSubcategories] = React.useState<Subcategory[]>([]);

    // Fetch subcategories from API when category changes
    React.useEffect(() => {
      const fetchSubcategories = async () => {
        try {
          const response = await fetch(`/api/subcategories/category/${selectedCategory}`);
          
          if (response.ok) {
            const data = await response.json();
            setAvailableSubcategories(data.data || []);
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
        // Only reset subcategory when category changes if it's not an edit operation
        // or if the current subcategory doesn't belong to the new category
        if (!isEdit || !product?.subcategory) {
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-4 md:p-8 min-w-[350px] w-full max-w-2xl mx-auto max-h-[75vh] overflow-y-auto" aria-label="Add Product Form">
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
                        <img
                          src={getImageUrl(product.imageUrl)}
                          alt={product.name}
                          className="w-10 h-10 rounded object-cover"
                        />
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {product.description.substring(0, 50)}...
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
        <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
              <DialogDescription>
                Update product information
              </DialogDescription>
            </DialogHeader>
            <ProductForm
              product={editingProduct}
              onSave={handleUpdateProduct}
              onCancel={() => setEditingProduct(null)}
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