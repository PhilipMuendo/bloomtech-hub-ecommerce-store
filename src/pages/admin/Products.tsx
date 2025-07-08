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

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: 'security' | 'ict' | 'electrical' | 'power';
  description: string;
  specifications: string[];
  inStock: boolean;
  featured?: boolean;
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { token } = useAuth();

  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    category: 'ict' as 'ict' | 'electrical',
    description: '',
    image: '',
    specifications: '',
    inStock: true
  });

  // Fetch products from backend
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      setProducts(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Extract unique categories from products
  const uniqueCategories = Array.from(new Set(products.map(p => p.category)));

  const handleAddProduct = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newProduct,
          price: Number(newProduct.price),
          specifications: newProduct.specifications.split('\n')
        })
      });
      if (!res.ok) throw new Error('Failed to add product');
      toast({ title: 'Product Added', description: `${newProduct.name} has been added to the catalog.` });
      setIsAddDialogOpen(false);
      setNewProduct({ name: '', price: '', category: 'ict', description: '', image: '', specifications: '', inStock: true });
      fetchProducts();
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

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...editingProduct,
          price: Number(editingProduct.price),
          specifications: typeof editingProduct.specifications === 'string' ? editingProduct.specifications.split('\n') : editingProduct.specifications
        })
      });
      if (!res.ok) throw new Error('Failed to update product');
      toast({ title: 'Product Updated', description: `${editingProduct.name} has been updated.` });
      setEditingProduct(null);
      fetchProducts();
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
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete product');
      toast({ title: 'Product Deleted', description: 'Product has been removed from the catalog.', variant: 'destructive' });
      fetchProducts();
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
    onSave: () => void;
    onCancel: () => void;
  }) => {
    const [localImage, setLocalImage] = useState(product ? product.image : newProduct.image);
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              value={product ? product.name : newProduct.name}
              onChange={(e) => product ? setEditingProduct({ ...product, name: e.target.value }) : setNewProduct({...newProduct, name: e.target.value})}
              placeholder="Enter product name"
            />
          </div>
          <div>
            <Label htmlFor="price">Price (KES)</Label>
            <Input
              id="price"
              type="number"
              value={product ? product.price : newProduct.price}
              onChange={(e) => product ? setEditingProduct({ ...product, price: e.target.value }) : setNewProduct({...newProduct, price: e.target.value})}
              placeholder="0"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Select value={product ? product.category : newProduct.category} onValueChange={(value) => product ? setEditingProduct({ ...product, category: value as Product["category"] }) : setNewProduct({ ...newProduct, category: value as 'ict' | 'electrical' })}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ict">ICT Equipment</SelectItem>
              <SelectItem value="electrical">Electrical Materials</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="image">Image URL</Label>
          <Input
            id="image"
            value={localImage}
            onChange={(e) => {
              setLocalImage(e.target.value);
              if (product) {
                setEditingProduct({ ...product, image: e.target.value });
              } else {
                setNewProduct({ ...newProduct, image: e.target.value });
              }
            }}
            placeholder="https://example.com/image.jpg"
          />
          <input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              if (e.target.files && e.target.files[0]) {
                await handleImageUpload(e.target.files[0], (url) => {
                  setLocalImage(url);
                  if (product) {
                    setEditingProduct({ ...product, image: url });
                  } else {
                    setNewProduct({ ...newProduct, image: url });
                  }
                });
              }
            }}
            style={{ marginTop: 8 }}
          />
          {localImage && (
            <img src={localImage} alt="Preview" style={{ width: 80, height: 80, objectFit: 'cover', marginTop: 8, borderRadius: 8 }} />
          )}
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={product ? product.description : newProduct.description}
            onChange={(e) => product ? setEditingProduct({ ...product, description: e.target.value }) : setNewProduct({...newProduct, description: e.target.value})}
            placeholder="Enter product description"
          />
        </div>
        <div>
          <Label htmlFor="specifications">Specifications (one per line)</Label>
          <Textarea
            id="specifications"
            value={product ? (product.specifications?.join('\n') || '') : newProduct.specifications}
            onChange={(e) => product ? setEditingProduct({ ...product, specifications: e.target.value.split('\n') }) : setNewProduct({...newProduct, specifications: e.target.value})}
            placeholder="Enter specifications, one per line"
          />
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={onSave}>Save Product</Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>
                Create a new product for the catalog
              </DialogDescription>
            </DialogHeader>
            <ProductForm onSave={handleAddProduct} onCancel={() => setIsAddDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Catalog</CardTitle>
          <CardDescription>
            {filteredProducts.length} of {products.length} products
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
                {uniqueCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={product.image}
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
                    <Badge variant={product.category === 'ict' ? 'default' : 'secondary'}>
                      {product.category === 'ict' ? 'ICT Equipment' : 'Electrical Materials'}
                    </Badge>
                  </TableCell>
                  <TableCell>KES {product.price.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={product.inStock ? 'default' : 'destructive'}>
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
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
    </div>
  );
};

export default Products;