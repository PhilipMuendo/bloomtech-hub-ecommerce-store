import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, CheckCircle, AlertCircle } from 'lucide-react';
import { useReviews } from '@/hooks/useReviews';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

interface ReviewFormProps {
  productId: string;
}

const reviewSchema = yup.object().shape({
  rating: yup.number().min(1, 'Rating is required').max(5, 'Rating must be at most 5').required('Rating is required'),
  comment: yup.string().required('Comment is required').min(5, 'Comment must be at least 5 characters'),
});

const ReviewForm: React.FC<ReviewFormProps> = ({ productId }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [canReview, setCanReview] = useState<boolean | null>(null);
  const [reviewReason, setReviewReason] = useState<string>('');
  const [checkingReview, setCheckingReview] = useState(true);
  const { addReview } = useReviews(productId);
  const { toast } = useToast();
  const { user } = useAuth();

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm({
    resolver: yupResolver(reviewSchema),
    defaultValues: { rating: 0, comment: '' },
  });

  // Check if user can review this product
  useEffect(() => {
    const checkCanReview = async () => {
      if (!user) {
        setCanReview(false);
        setReviewReason('Please log in to write a review');
        setCheckingReview(false);
        return;
      }

      try {
        const response = await fetch(`/api/reviews/can-review/${productId}`, {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setCanReview(data.canReview);
          setReviewReason(data.reason || '');
        } else {
          setCanReview(false);
          setReviewReason('Unable to verify review eligibility');
        }
      } catch (error) {
        setCanReview(false);
        setReviewReason('Unable to verify review eligibility');
      } finally {
        setCheckingReview(false);
      }
    };

    checkCanReview();
  }, [user, productId]);

  const onSubmit = async (data: { rating: number; comment: string }) => {
    if (!user) return;
    try {
      await addReview(data.rating, data.comment);
      reset();
      toast({ title: "Review submitted successfully!" });
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to submit review", 
        variant: "destructive" 
      });
    }
  };

  if (checkingReview) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Write a Review</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Checking review eligibility...</p>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Write a Review</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">Please log in to write a review</p>
          <Button>Login to Review</Button>
        </CardContent>
      </Card>
    );
  }

  if (!canReview) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Write a Review</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground mb-2">{reviewReason}</p>
              <p className="text-xs text-muted-foreground">
                Reviews are only available for products you have purchased and received. 
                Once your order is delivered, you'll be able to leave a review.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Write a Review</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-3 mb-4">
          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
          <div>
            <p className="text-sm text-muted-foreground">
              You can review this product because you have purchased and received it.
            </p>
          </div>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Rating</Label>
            <div className="flex space-x-1 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-6 h-6 cursor-pointer ${star <= (watch('rating') || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                  onClick={() => setValue('rating', star)}
                  onMouseEnter={() => setValue('rating', star)}
                  onMouseLeave={() => setValue('rating', watch('rating'))}
                />
              ))}
            </div>
            {errors.rating && <p className="text-destructive text-xs mt-1">{errors.rating.message}</p>}
          </div>
          <div>
            <Label htmlFor="comment">Comment</Label>
            <Input
              id="comment"
              {...register('comment')}
              placeholder="Write your review here..."
            />
            {errors.comment && <p className="text-destructive text-xs mt-1">{errors.comment.message}</p>}
          </div>
          <Button type="submit" disabled={watch('rating') === 0}>
            Submit Review
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ReviewForm;
