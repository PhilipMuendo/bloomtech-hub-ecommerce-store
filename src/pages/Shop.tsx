
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ProductCard from '@/components/ProductCard';
import { Search } from 'lucide-react';
import { categories, categoryDisplayMap } from '@/data/categories';
import { useToast } from '@/hooks/use-toast';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || 'all');
  const [priceRange, setPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [products, setProducts] = useState<any[]>([]); // Changed from Product[] to any[] to avoid conflict
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]); // Changed from Product[] to any[]
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        // Build query params for pagination, filtering, sorting
        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('limit', '12');
        if (categoryFilter && categoryFilter !== 'all') params.set('category', categoryFilter);
        if (sortBy) {
          if (sortBy === 'price-low') params.set('sort', 'price');
          else if (sortBy === 'price-high') params.set('sort', '-price');
          else params.set('sort', 'name');
        }
        const res = await fetch(`/api/products?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch products');
        const data = await res.json();
        // Normalize product data for frontend compatibility
        const normalized = data.products.map((p: any) => ({
          ...p,
          id: p.id || p._id, // Ensure id is always set
          image: p.image || p.imageUrl || '/placeholder.svg',
          inStock: typeof p.inStock === 'boolean' ? p.inStock : (typeof p.stock === 'number' ? p.stock > 0 : true),
        }));
        setProducts(normalized);
        setTotalPages(data.totalPages || 1);
      } catch (err: any) {
        let errorMsg = 'An unknown error occurred';
        if (err && err.response && err.response.error) {
          errorMsg = err.response.error;
        } else if (err && err.message) {
          errorMsg = err.message;
        }
        setError(errorMsg);
        toast({
          title: 'Error',
          description: errorMsg,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
    // eslint-disable-next-line
  }, [page, categoryFilter, sortBy]);

  useEffect(() => {
    let result = [...products];
    // Apply search filter
    if (searchQuery) {
      result = result.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    // Apply category filter
    if (categoryFilter && categoryFilter !== 'all') {
      result = result.filter(product => product.category === categoryFilter);
    }
    // Apply price range filter
    if (priceRange !== 'all') {
      switch (priceRange) {
        case 'under-5000':
          result = result.filter(product => product.price < 5000);
          break;
        case '5000-20000':
          result = result.filter(product => product.price >= 5000 && product.price <= 20000);
          break;
        case '20000-50000':
          result = result.filter(product => product.price > 20000 && product.price <= 50000);
          break;
        case 'over-50000':
          result = result.filter(product => product.price > 50000);
          break;
      }
    }
    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });
    setFilteredProducts(result);
  }, [products, searchQuery, categoryFilter, priceRange, sortBy]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchQuery) {
      params.set('search', searchQuery);
    } else {
      params.delete('search');
    }
    setSearchParams(params);
  };

  const handleCategoryChange = (category: string) => {
    setCategoryFilter(category);
    const params = new URLSearchParams(searchParams);
    if (category && category !== 'all') {
      params.set('category', category);
    } else {
      params.delete('category');
    }
    setSearchParams(params);
  };

  // Pagination controls
  const handlePrevPage = () => setPage((p) => Math.max(1, p - 1));
  const handleNextPage = () => setPage((p) => Math.min(totalPages, p + 1));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Shop Our Products</h1>
        <p className="text-muted-foreground text-lg">
          Discover our complete range of security systems, ICT equipment, electrical materials, and power solutions
        </p>
      </div>
      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </form>
          {/* Category Filter */}
          <Select value={categoryFilter} onValueChange={handleCategoryChange}>
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat.value} value={cat.value}>{cat.display}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* Price Range */}
          <Select value={priceRange} onValueChange={setPriceRange}>
            <SelectTrigger>
              <SelectValue placeholder="All Prices" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Prices</SelectItem>
              <SelectItem value="under-5000">Under KES 5,000</SelectItem>
              <SelectItem value="5000-20000">KES 5,000 - 20,000</SelectItem>
              <SelectItem value="20000-50000">KES 20,000 - 50,000</SelectItem>
              <SelectItem value="over-50000">Over KES 50,000</SelectItem>
            </SelectContent>
          </Select>
          {/* Sort By */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name A-Z</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {/* Results Count */}
      <div className="mb-6">
        <p className="text-muted-foreground">
          Showing {filteredProducts.length} of {products.length} products
        </p>
      </div>
      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-16">Loading products...</div>
      ) : error ? (
        <div className="text-center py-16 text-red-500">{error}</div>
      ) : products.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {/* Pagination Controls */}
          <div className="flex justify-center items-center gap-4 mt-8">
            <Button onClick={handlePrevPage} disabled={page === 1} variant="outline">Previous</Button>
            <span>Page {page} of {totalPages}</span>
            <Button onClick={handleNextPage} disabled={page === totalPages} variant="outline">Next</Button>
          </div>
        </>
      ) : (
        <div className="text-center py-16">
          <h3 className="text-xl font-semibold mb-2">No products found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search criteria or browse all products
          </p>
          <Button
            onClick={() => {
              setSearchQuery('');
              setCategoryFilter('all');
              setPage(1);
              setPriceRange('all');
              setSortBy('name');
              setSearchParams({});
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default Shop;
