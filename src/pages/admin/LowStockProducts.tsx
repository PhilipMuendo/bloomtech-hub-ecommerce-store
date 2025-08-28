import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

type LowStockItem = {
  id: string;
  name: string;
  stock: number;
  category: string;
};

const LowStockProducts: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = React.useState<LowStockItem[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchLowStock = React.useCallback(async (signal?: AbortSignal) => {
    if (!user?.token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/products/low-stock', {
        headers: { Authorization: `Bearer ${user.token}` },
        signal,
      });
      if (!res.ok) throw new Error('Failed to fetch low stock products');
      const data = await res.json();
      // Normalize shape defensively
      const normalized: LowStockItem[] = (Array.isArray(data) ? data : []).map((p: any) => ({
        id: String(p.id),
        name: String(p.name ?? ''),
        stock: Number(p.stock ?? 0),
        category: String(p.category ?? ''),
      }));
      setItems(normalized);
    } catch (e: any) {
      if (e?.name === 'AbortError') return;
      setError(e?.message || 'Failed to load low stock');
    } finally {
      setLoading(false);
    }
  }, [user?.token]);

  // Initial load with AbortController to avoid race conditions
  React.useEffect(() => {
    const controller = new AbortController();
    fetchLowStock(controller.signal);
    return () => controller.abort();
  }, [fetchLowStock]);

  // Stable navigation helper
  const goToEdit = React.useCallback((id: string) => {
    // Use encodeURIComponent to be safe
    navigate(`/admin/products?edit=${encodeURIComponent(id)}`);
  }, [navigate]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Low Stock Products</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center">Loading...</div>
          ) : error ? (
            <div className="py-8 text-center text-red-500">{error}</div>
          ) : items.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No low stock products.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <button
                        type="button"
                        className="cursor-pointer hover:text-blue-600 hover:underline transition-colors text-left"
                        onClick={() => goToEdit(p.id)}
                      >
                        {p.name}
                      </button>
                    </TableCell>
                    <TableCell className="text-red-600 font-bold">{p.stock}</TableCell>
                    <TableCell>{p.category}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="default" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => goToEdit(p.id)}>
                        Restock
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LowStockProducts;