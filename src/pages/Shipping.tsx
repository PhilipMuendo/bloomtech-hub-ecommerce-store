import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';

const pickupPoints = [
  'Baringo',
  'Bomet',
  'Bungoma',
  'Busia',
  'Elgeyo Marakwet',
  'Embu',
  'Garissa',
  'Homa Bay',
  'Isiolo',
  'Kajiado',
  'Kakamega',
  'Kericho',
  'Kiambu',
  'Kilifi',
  'Kirinyaga',
  'Kisii',
  'Kisumu',
  'Kitui',
  'Kwale',
  'Laikipia',
  'Lamu',
  'Machakos',
  'Makueni',
  'Mandera',
  'Marsabit',
  'Meru',
  'Migori',
  'Mombasa',
  'Murang\'a',
  'Nairobi',
  'Nakuru',
  'Nandi',
  'Narok',
  'Nyamira',
  'Nyandarua',
  'Nyeri',
  'Samburu',
  'Siaya',
  'Taita Taveta',
  'Tana River',
  'Tharaka Nithi',
  'Trans Nzoia',
  'Turkana',
  'Uasin Gishu',
  'Vihiga',
  'Wajir',
  'West Pokot'
];

const Shipping = () => {
  const [pickupPoint, setPickupPoint] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { cartItems } = useCart();

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickupPoint) {
      setError('Please select a pickup point.');
      return;
    }
    // Save to localStorage for now (can be context or state)
    localStorage.setItem('pickupPoint', pickupPoint);
    // Redirect to payment (Mpesa) page/modal
    navigate('/cart?shipping=done');
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 py-12 sm:py-16 max-w-md">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">Shipping Information</h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded shadow">
        <div>
          <label htmlFor="pickupPoint" className="block text-sm font-medium mb-2">Select Pickup Point</label>
          <select
            id="pickupPoint"
            value={pickupPoint}
            onChange={e => { setPickupPoint(e.target.value); setError(''); }}
            className="w-full border rounded px-3 py-2 text-base"
            required
          >
            <option value="">-- Choose a pickup point --</option>
            {pickupPoints.map(point => (
              <option key={point} value={point}>{point}</option>
            ))}
          </select>
          {error && <div className="text-red-600 text-xs mt-2">{error}</div>}
        </div>
        <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-3">Continue to Payment</Button>
      </form>
    </div>
  );
};

export default Shipping; 