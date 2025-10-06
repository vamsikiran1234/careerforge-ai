import { useEffect, useState } from 'react';
import { Star, MessageSquare, Calendar, User } from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';

const VITE_API_URL = import.meta.env.VITE_API_URL;

interface Review {
  id: string;
  overallRating: number;
  communicationRating?: number;
  knowledgeRating?: number;
  helpfulnessRating?: number;
  comment?: string;
  mentorResponse?: string;
  respondedAt?: string;
  createdAt: string;
  mentor: {
    user: {
      name: string;
    };
  };
}

interface ReviewListProps {
  mentorId: string;
  averageRating?: number;
  totalReviews?: number;
}

export default function ReviewList({ mentorId, averageRating, totalReviews }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ratingDistribution, setRatingDistribution] = useState<Record<number, number>>({});

  useEffect(() => {
    fetchReviews();
  }, [mentorId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${VITE_API_URL}/reviews/mentor/${mentorId}`);

      if (response.data.success) {
        setReviews(response.data.data.reviews);
        setRatingDistribution(response.data.data.statistics.ratingDistribution);
      }
    } catch (err: any) {
      console.error('Fetch reviews error:', err);
      setError(err.response?.data?.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
    };

    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        ))}
      </div>
    );
  };

  const getRatingPercentage = (rating: number) => {
    const total = Object.values(ratingDistribution).reduce((sum, count) => sum + count, 0);
    if (total === 0) return 0;
    return ((ratingDistribution[rating] || 0) / total) * 100;
  };

  if (loading) {
    return (
      <div className="py-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading reviews...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-4 px-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <p className="text-red-800 dark:text-red-200">{error}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Rating Summary */}
      {(averageRating || reviews.length > 0) && (
        <div className="mb-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            {/* Overall Rating */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start space-x-2 mb-2">
                <span className="text-5xl font-bold text-gray-900 dark:text-white">
                  {averageRating?.toFixed(1) || '0.0'}
                </span>
                <Star className="w-8 h-8 fill-yellow-400 text-yellow-400" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Based on {totalReviews || reviews.length} reviews
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="flex-1 max-w-md">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center space-x-2 mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-8">
                    {rating} ⭐
                  </span>
                  <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 transition-all duration-300"
                      style={{ width: `${getRatingPercentage(rating)}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 w-12 text-right">
                    {ratingDistribution[rating] || 0}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
          <MessageSquare className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No reviews yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Be the first to review this mentor after completing a session!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
            >
              {/* Review Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Anonymous Student</p>
                    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>{format(new Date(review.createdAt), 'PPP')}</span>
                    </div>
                  </div>
                </div>
                {renderStars(review.overallRating, 'md')}
              </div>

              {/* Detailed Ratings */}
              {(review.communicationRating || review.knowledgeRating || review.helpfulnessRating) && (
                <div className="flex flex-wrap gap-4 mb-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                  {review.communicationRating && (
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        Communication:
                      </span>
                      {renderStars(review.communicationRating, 'sm')}
                    </div>
                  )}
                  {review.knowledgeRating && (
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        Knowledge:
                      </span>
                      {renderStars(review.knowledgeRating, 'sm')}
                    </div>
                  )}
                  {review.helpfulnessRating && (
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        Helpfulness:
                      </span>
                      {renderStars(review.helpfulnessRating, 'sm')}
                    </div>
                  )}
                </div>
              )}

              {/* Comment */}
              {review.comment && (
                <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                  "{review.comment}"
                </p>
              )}

              {/* Mentor Response */}
              {review.mentorResponse && (
                <div className="mt-4 ml-6 p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 dark:border-blue-400 rounded-r-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-semibold text-blue-900 dark:text-blue-300">
                      Mentor's Response
                    </span>
                    {review.respondedAt && (
                      <span className="text-xs text-blue-600 dark:text-blue-400">
                        • {format(new Date(review.respondedAt), 'PPP')}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
                    {review.mentorResponse}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
