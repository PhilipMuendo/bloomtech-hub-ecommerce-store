
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';
import { useReviews } from '@/hooks/useReviews';

interface ReviewsListProps {
  productId: string;
}

const ReviewsList: React.FC<ReviewsListProps> = ({ productId }) => {
  const { reviews, loading, averageRating, starBreakdown } = useReviews(productId);

  if (loading) {
    return <div>Loading reviews...</div>;
  }

  // Total number of ratings
  const totalRatings = reviews.length;

  // Helper to format date
  const formatDate = (date: Date | undefined) => {
    if (!date || isNaN(date.getTime())) return 'Unknown date';
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-8">
      {/* Summary Section */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Verified Ratings Summary */}
        <div className="flex-1 min-w-[220px]">
          <div className="bg-white rounded-lg shadow p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-3xl font-bold">{averageRating.toFixed(1)}</span>
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${star <= Math.round(averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>
            </div>
            <div className="text-sm text-muted-foreground mb-2">
              {totalRatings} verified rating{totalRatings === 1 ? '' : 's'}
            </div>
            {/* Star breakdown bar */}
            <div className="space-y-1 mt-4">
              {[5, 4, 3, 2, 1].map((star, idx) => (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-xs font-medium w-4">{star}</span>
                  <Star className="w-4 h-4 text-yellow-400" />
                  <div className="flex-1 bg-gray-200 rounded h-2 overflow-hidden">
                    <div
                      className="bg-yellow-400 h-2 rounded"
                      style={{ width: totalRatings > 0 ? `${(starBreakdown[star - 1] / totalRatings) * 100}%` : '0%' }}
                    ></div>
                  </div>
                  <span className="text-xs w-6 text-right">{starBreakdown[star - 1]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Product Reviews List */}
        <div className="flex-1">
          <h3 className="font-semibold mb-3 text-lg">Product Reviews</h3>
          {reviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <svg width="48" height="48" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="12" fill="#f3f4f6"/><path d="M8 10h8M8 14h4" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round"/></svg>
              <span className="mt-2">This product has no reviews yet.</span>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <Card key={review.id} className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</span>
                    </div>
                    <p className="text-sm">{review.comment}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewsList;
