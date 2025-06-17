
"use client";

import type { Review } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface TestimonialCardProps {
  review: Review;
}

const StarRatingDisplay = ({ rating, size = "h-5 w-5" }: { rating: number, size?: string }) => (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            size, "transition-colors",
            rating >= star ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/50"
          )}
        />
      ))}
    </div>
  );

export default function TestimonialCard({ review }: TestimonialCardProps) {
  const timeAgo = review.submittedAt ? formatDistanceToNow(new Date(review.submittedAt), { addSuffix: true }) : '';
  
  // Create a simple avatar placeholder based on the first letter of the name
  const avatarFallback = review.name ? review.name.charAt(0).toUpperCase() : <User className="h-5 w-5" />;

  return (
    <Card className="flex flex-col h-full shadow-lg hover:shadow-xl transition-shadow duration-300 bg-card">
      <CardContent className="p-6 flex-grow">
        <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground mb-4">
          "{review.comment}"
        </blockquote>
        <div className="flex items-center justify-between">
            <StarRatingDisplay rating={review.rating} />
            {timeAgo && <p className="text-xs text-muted-foreground">{timeAgo}</p>}
        </div>
      </CardContent>
      <CardFooter className="p-6 pt-0 border-t border-border/30 mt-auto">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10 border-2 border-primary/50">
            {/* Placeholder image, replace with actual user avatar if available */}
            <AvatarImage src={`https://placehold.co/40x40.png?text=${avatarFallback}`} alt={review.name} data-ai-hint="person portrait" />
            <AvatarFallback>{avatarFallback}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold text-foreground">{review.name}</p>
            {review.carMake && review.carModel && (
                <p className="text-xs text-muted-foreground">Reviewed: {review.carMake} {review.carModel}</p>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
