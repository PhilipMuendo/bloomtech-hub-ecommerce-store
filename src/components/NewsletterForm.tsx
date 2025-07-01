
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

const NewsletterForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addDoc(collection(db, 'subscribers'), {
        email,
        subscribedAt: new Date()
      });
      
      setEmail('');
      toast({ title: "Successfully subscribed to newsletter!" });
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Failed to subscribe. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex space-x-2">
      <Input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="flex-1"
      />
      <Button type="submit" disabled={loading} className="bg-accent hover:bg-accent/90">
        {loading ? 'Subscribing...' : 'Subscribe'}
      </Button>
    </form>
  );
};

export default NewsletterForm;
