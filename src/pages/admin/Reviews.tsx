import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Eye, Star, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Review {
  id: string;
  productName: string;
  productId: string;
  customerName: string;
  customerEmail: string;
  rating: number;
  comment: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  helpful: number;
}

const Reviews = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const { toast } = useToast();

  // Mock reviews data
  const reviews: Review[] = [
    {
      id: 'REV-001',
      productName: 'HP EliteBook 840 G8 Laptop',
      productId: '1',
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      rating: 5,
      comment: 'Excellent laptop for business use. Fast performance and great build quality.',
      date: '2024-01-15',
      status: 'approved',
      helpful: 12
    },
    {
      id: 'REV-002',
      productName: 'TP-Link AC1200 Wi-Fi Router',
      productId: '2',
      customerName: 'Jane Smith',
      customerEmail: 'jane@example.com',
      rating: 4,
      comment: 'Good router with decent range. Setup was easy and works well.',
      date: '2024-01-14',
      status: 'pending',
      helpful: 3
    },
    {
      id: 'REV-003',
      productName: 'Lenovo ThinkPad E15',
      productId: '15',
      customerName: 'Mike Johnson',
      customerEmail: 'mike@example.com',
      rating: 2,
      comment: 'Product arrived damaged and customer service was poor.',
      date: '2024-01-13',
      status: 'pending',
      helpful: 1
    },
    {
      id: 'REV-004',
      productName: 'LED Floodlight 50W',
      productId: '18',
      customerName: 'Sarah Wilson',
      customerEmail: 'sarah@example.com',
      rating: 5,
      comment: 'Bright and energy efficient. Perfect for outdoor lighting.',
      date: '2024-01-12',
      status: 'approved',
      helpful: 8
    },
    {
      id: 'REV-005',
      productName: 'USB Type-C Multiport Hub',
      productId: '16',
      customerName: 'David Brown',
      customerEmail: 'david@example.com',
      rating: 1,
      comment: 'Completely inappropriate and offensive content that violates guidelines.',
      date: '2024-01-11',
      status: 'rejected',
      helpful: 0
    }
  ];

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.comment.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || review.status === statusFilter;
    const matchesRating = ratingFilter === 'all' || review.rating.toString() === ratingFilter;
    return matchesSearch && matchesStatus && matchesRating;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'default';
      case 'pending': return 'secondary';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  const updateReviewStatus = (reviewId: string, newStatus: 'approved' | 'rejected') => {
    // In real app, would call API
    toast({
      title: "Review Updated",
      description: `Review ${reviewId} has been ${newStatus}`,
    });
  };

  const deleteReview = (reviewId: string) => {
    // In real app, would call API
    toast({
      title: "Review Deleted",
      description: `Review ${reviewId} has been permanently deleted`,
      variant: "destructive"
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reviews</h1>
        <p className="text-muted-foreground">Manage customer reviews and feedback</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reviews.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reviews.filter(r => r.status === 'pending').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reviews.filter(r => r.status === 'approved').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Review Management</CardTitle>
          <CardDescription>
            {filteredReviews.length} of {reviews.length} reviews
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
                <SelectItem value="2">2 Stars</SelectItem>
                <SelectItem value="1">1 Star</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-full overflow-x-auto">
            <Table className="min-w-[600px]">
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Helpful</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReviews.map((review) => (
                <TableRow key={review.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{review.productName}</div>
                      <div className="text-sm text-muted-foreground">
                        {review.comment.substring(0, 50)}...
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{review.customerName}</div>
                      <div className="text-sm text-muted-foreground">{review.customerEmail}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {renderStars(review.rating)}
                      <span className="ml-1 text-sm">{review.rating}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(review.status)}>
                      {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(review.date).toLocaleDateString()}</TableCell>
                  <TableCell>{review.helpful}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedReview(review)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {review.status === 'pending' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateReviewStatus(review.id, 'approved')}
                          >
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateReviewStatus(review.id, 'rejected')}
                          >
                            <XCircle className="h-4 w-4 text-red-600" />
                          </Button>
                        </>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteReview(review.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>

      {selectedReview && (
        <Dialog open={!!selectedReview} onOpenChange={() => setSelectedReview(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Review Details</DialogTitle>
              <DialogDescription>
                Complete review information
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">Product Information</h4>
                  <p><strong>Product:</strong> {selectedReview.productName}</p>
                  <p><strong>Product ID:</strong> {selectedReview.productId}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Review Information</h4>
                  <p><strong>Date:</strong> {new Date(selectedReview.date).toLocaleDateString()}</p>
                  <p><strong>Status:</strong> <Badge variant={getStatusColor(selectedReview.status)}>
                    {selectedReview.status.charAt(0).toUpperCase() + selectedReview.status.slice(1)}
                  </Badge></p>
                  <p><strong>Helpful votes:</strong> {selectedReview.helpful}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold">Customer Information</h4>
                <p><strong>Name:</strong> {selectedReview.customerName}</p>
                <p><strong>Email:</strong> {selectedReview.customerEmail}</p>
              </div>
              
              <div>
                <h4 className="font-semibold">Rating</h4>
                <div className="flex items-center gap-2">
                  {renderStars(selectedReview.rating)}
                  <span className="text-lg font-medium">{selectedReview.rating}/5</span>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold">Review Comment</h4>
                <div className="bg-muted p-4 rounded-lg">
                  <p>{selectedReview.comment}</p>
                </div>
              </div>
              
              {selectedReview.status === 'pending' && (
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => {
                      updateReviewStatus(selectedReview.id, 'approved');
                      setSelectedReview(null);
                    }}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve Review
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      updateReviewStatus(selectedReview.id, 'rejected');
                      setSelectedReview(null);
                    }}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject Review
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Reviews;