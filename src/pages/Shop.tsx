
import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ProductCard from '@/components/ProductCard';
import ProductCardSkeleton from '@/components/ProductCardSkeleton';
import { Search } from 'lucide-react';
import { categories, categoryDisplayMap, fetchSubcategories, Subcategory } from '@/data/categories';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/useDebounce';

interface ProductsResponse {
  products: any[];
  totalPages: number;
}

async function fetchProducts(params: {
  page: number;
  category: string;
  subcategory: string;
  sortBy: string;
  search: string;
}, signal?: AbortSignal): Promise<ProductsResponse> {
  const qs = new URLSearchParams();
  qs.set('page', String(params.page));
  qs.set('limit', '12');
  if (params.category && params.category !== 'all') qs.set('category', params.category);
  if (params.subcategory && params.subcategory !== 'all') qs.set('subcategory', params.subcategory);
  if (params.search) qs.set('search', params.search);
  if (params.sortBy === 'price-low') qs.set('sort', 'price');
  else if (params.sortBy === 'price-high') qs.set('sort', '-price');
  else qs.set('sort', 'name');

  const res = await fetch(`/api/products?${qs.toString()}`, { signal });
  if (!res.ok) throw new Error('Failed to fetch products');
  const data = await res.json();
  const products = (data.products || []).map((p: any) => ({
    ...p,
    id: p.id || p.productId,
    imageUrl: p.imageUrl || '/placeholder.svg',
    inStock: typeof p.inStock === 'boolean' ? p.inStock : (typeof p.stock === 'number' ? p.stock > 0 : true),
  }));
  return { products, totalPages: data.totalPages || 1 };
}

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || 'all');
  const [subcategoryFilter, setSubcategoryFilter] = useState(searchParams.get('subcategory') || 'all');
  const [priceRange, setPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [page, setPage] = useState(1);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);
  const { toast } = useToast();

  // Debounce the search term so we hit the API once the user pauses,
  // not on every keystroke.
  const debouncedSearch = useDebounce(searchQuery, 350);

  // Fetch subcategories when category changes
  useEffect(() => {
    const loadSubcategories = async () => {
      if (categoryFilter && categoryFilter !== 'all') {
        setLoadingSubcategories(true);
        try {
          const response = await fetch(`/api/subcategories?category=${categoryFilter}`);
          if (response.ok) {
            const data = await response.json();
            const categorySubcategories = data.data || [];
            setSubcategories(categorySubcategories);
          } else {
            setSubcategories([]);
          }
        } catch (error) {
          console.error('Error fetching subcategories:', error);
          setSubcategories([]);
        } finally {
          setLoadingSubcategories(false);
        }
      } else {
        setSubcategories([]);
        setSubcategoryFilter('all');
      }
    };

    loadSubcategories();
  }, [categoryFilter]);

  const {
    data,
    isLoading: loading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ['products', { page, categoryFilter, subcategoryFilter, sortBy, search: debouncedSearch }],
    queryFn: ({ signal }) =>
      fetchProducts({ page, category: categoryFilter, subcategory: subcategoryFilter, sortBy, search: debouncedSearch }, signal),
    placeholderData: keepPreviousData, // keep old page visible while the next loads
  });

  const products = data?.products ?? [];
  const totalPages = data?.totalPages ?? 1;
  const error = queryError ? (queryError as Error).message : null;

  useEffect(() => {
    if (queryError) {
      toast({
        title: 'Error',
        description: (queryError as Error).message,
        variant: 'destructive',
      });
    }
  }, [queryError, toast]);

  // Client-side price-range filter + sort derived from the fetched page.
  const filteredProducts = useMemo(() => {
    let result = [...products];
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
    return result;
  }, [products, priceRange, sortBy]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1); // Reset to first page when searching
    const params = new URLSearchParams(searchParams);
    if (query) {
      params.set('search', query);
    } else {
      params.delete('search');
    }
    setSearchParams(params);
  };

  const handleCategoryChange = (category: string) => {
    setCategoryFilter(category);
    setSubcategoryFilter('all'); // Reset subcategory when category changes
    setPage(1); // Reset to first page when the category changes
    const params = new URLSearchParams(searchParams);
    if (category && category !== 'all') {
      params.set('category', category);
    } else {
      params.delete('category');
    }
    params.delete('subcategory'); // Remove subcategory from URL when category changes
    setSearchParams(params);
  };

  const handleSubcategoryChange = (subcategory: string) => {
    setSubcategoryFilter(subcategory);
    setPage(1); // Reset to first page when the subcategory changes
    const params = new URLSearchParams(searchParams);
    if (subcategory && subcategory !== 'all') {
      params.set('subcategory', subcategory);
    } else {
      params.delete('subcategory');
    }
    setSearchParams(params);
  };

  // Pagination controls
  const handlePrevPage = () => setPage((p) => Math.max(1, p - 1));
  const handleNextPage = () => setPage((p) => Math.min(totalPages, p + 1));

  return (
    <div className="container mx-auto px-2 sm:px-4 py-6 sm:py-8 max-w-full overflow-x-hidden">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4">Shop Our Products</h1>
        <p className="text-muted-foreground text-base sm:text-lg">
          Discover our complete range of security systems, ICT equipment, electrical materials, and power solutions
        </p>
      </div>
      {/* Filters */}
      <div className="bg-white p-3 sm:p-6 rounded-lg shadow-sm border mb-6 sm:mb-8 max-w-full">
        <div className="grid grid-cols-1 gap-2 sm:gap-4 md:grid-cols-2 lg:grid-cols-5 max-w-full">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 text-base sm:text-lg"
            />
          </div>
          {/* Category Filter */}
          <Select value={categoryFilter} onValueChange={handleCategoryChange}>
            <SelectTrigger className="text-base sm:text-lg">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat.value} value={cat.value}>{cat.display}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* Subcategory Filter */}
          <Select value={subcategoryFilter} onValueChange={handleSubcategoryChange} disabled={loadingSubcategories || categoryFilter === 'all'}>
            <SelectTrigger className="text-base sm:text-lg">
              <SelectValue placeholder={loadingSubcategories ? "Loading..." : "All Subcategories"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subcategories</SelectItem>
              {subcategories.map(subcat => (
                <SelectItem key={subcat.id} value={subcat.name}>{subcat.displayName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* Price Range */}
          <Select value={priceRange} onValueChange={setPriceRange}>
            <SelectTrigger className="text-base sm:text-lg">
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
            <SelectTrigger className="text-base sm:text-lg">
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
      <div className="mb-4 sm:mb-6">
        <p className="text-muted-foreground text-sm sm:text-base">
          Showing {filteredProducts.length} of {products.length} products
        </p>
      </div>
      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 max-w-full">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12 sm:py-16">
          <h3 className="text-lg sm:text-xl font-semibold mb-2">We couldn't load products</h3>
          <p className="text-muted-foreground mb-4 text-sm sm:text-base">
            Something went wrong on our end. Please check your connection and try again.
          </p>
          <Button variant="outline" onClick={() => refetch()} className="px-5 py-2">Retry</Button>
        </div>
      ) : products.length > 0 ? (
        <>
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 max-w-full">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 mt-6 sm:mt-8">
            <Button onClick={handlePrevPage} disabled={page === 1} variant="outline" className="text-base px-5 py-2">Previous</Button>
            <span className="text-sm sm:text-base">Page {page} of {totalPages}</span>
            <Button onClick={handleNextPage} disabled={page === totalPages} variant="outline" className="text-base px-5 py-2">Next</Button>
          </div>
        </>
      ) : (
        <div className="text-center py-12 sm:py-16">
          <h3 className="text-lg sm:text-xl font-semibold mb-2">No products found</h3>
          <p className="text-muted-foreground mb-4 text-sm sm:text-base">
            Try adjusting your search criteria or browse all products
          </p>
          <Button
            onClick={() => {
              setSearchQuery('');
              setCategoryFilter('all');
              setSubcategoryFilter('all');
              setPage(1);
              setPriceRange('all');
              setSortBy('name');
              setSearchParams({});
            }}
            className="text-base px-5 py-2"
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default Shop;
