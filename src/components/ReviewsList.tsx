
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';
import { useReviews } from '@/hooks/useReviews';

interface ReviewsListProps {
  productId: string;
}

const ReviewsList: React.FC<ReviewsListProps> = ({ productId }) => {
  const { reviews, loading, averageRating } = useReviews(productId);

  if (loading) {
    return <div>Loading reviews...</div>;
  }

  return (
    <div className="space-y-4">
      {averageRating > 0 && (
        <div className="flex items-center space-x-2 mb-4">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-5 h-5 ${
                  star <= Math.round(averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="font-medium">{averageRating.toFixed(1)} out of 5</span>
          <span className="text-muted-foreground">({reviews.length} reviews)</span>
        </div>
      )}

      {reviews.length === 0 ? (
        <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {review.createdAt && typeof review.createdAt.toLocaleDateString === 'function'
                      ? review.createdAt.toLocaleDateString()
                      : 'Unknown date'}
                  </span>
                </div>
                <p>{review.comment}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewsList;
