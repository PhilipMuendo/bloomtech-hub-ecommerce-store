import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import MpesaPaymentModal from '@/components/MpesaPaymentModal';

const CustomCheckout = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { user } = useAuth();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMpesa, setShowMpesa] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch order');
        const data = await res.json();
        setOrder(data);
      } catch (err: any) {
        setError(err.message || 'Error loading order');
      } finally {
        setLoading(false);
      }
    };
    if (user && orderId) fetchOrder();
  }, [user, orderId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!order) return <div>Order not found.</div>;

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-4">Complete Your Custom Order</h1>
      <div className="border p-4 rounded">
        <h2>Order #{order._id ? order._id.slice(-6) : (order.id ? order.id.toString().slice(-6) : 'N/A')}</h2>
        <ul>
          {order.items.map((item: any) => (
            <li key={item.productId}>
              {item.productName || item.productId} x {item.quantity}
            </li>
          ))}
        </ul>
        <div className="font-bold mt-4">Total: KES {order.total.toLocaleString()}</div>
        <Button onClick={() => setShowMpesa(true)} className="mt-4">
          Proceed to Pay
        </Button>
      </div>
      <MpesaPaymentModal
        isOpen={showMpesa}
        onClose={() => setShowMpesa(false)}
        orderId={order._id || order.id}
        amount={order.total}
        onSuccess={() => alert('Payment successful!')}
      />
    </div>
  );
};

export default CustomCheckout; 