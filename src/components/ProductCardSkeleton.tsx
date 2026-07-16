import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/** Placeholder that mirrors ProductCard's layout while products load. */
const ProductCardSkeleton: React.FC = () => (
  <Card className="overflow-hidden w-full max-w-xs mx-auto">
    <CardContent className="p-3 sm:p-4">
      <Skeleton className="aspect-square w-full mb-3 sm:mb-4 rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-6 w-1/3" />
        <div className="flex gap-2 mt-2">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default ProductCardSkeleton;
