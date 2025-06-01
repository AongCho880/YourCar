"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CarImageCarouselProps {
  images: string[];
  altText: string;
}

export default function CarImageCarousel({ images, altText }: CarImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
        No images available
      </div>
    );
  }

  const goToPrevious = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? images.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    const isLastSlide = currentIndex === images.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  const goToSlide = (slideIndex: number) => {
    setCurrentIndex(slideIndex);
  };

  return (
    <div className="relative w-full group">
      <div className="aspect-video overflow-hidden rounded-lg shadow-lg">
        <Image
          src={images[currentIndex]}
          alt={`${altText} - Image ${currentIndex + 1}`}
          width={800}
          height={600}
          className="w-full h-full object-cover transition-opacity duration-500 ease-in-out"
          priority={currentIndex === 0} // Prioritize first image
          data-ai-hint="car side"
        />
      </div>
      
      {images.length > 1 && (
        <>
          <Button
            variant="outline"
            size="icon"
            onClick={goToPrevious}
            className="absolute top-1/2 left-2 transform -translate-y-1/2 rounded-full opacity-70 group-hover:opacity-100 transition-opacity z-10 bg-background/50 hover:bg-background/80"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={goToNext}
            className="absolute top-1/2 right-2 transform -translate-y-1/2 rounded-full opacity-70 group-hover:opacity-100 transition-opacity z-10 bg-background/50 hover:bg-background/80"
            aria-label="Next image"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </>
      )}

      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
          {images.map((_, slideIndex) => (
            <button
              key={slideIndex}
              onClick={() => goToSlide(slideIndex)}
              className={cn(
                "h-2 w-2 rounded-full transition-all",
                currentIndex === slideIndex ? "bg-primary p-1" : "bg-muted-foreground/50 hover:bg-muted-foreground"
              )}
              aria-label={`Go to image ${slideIndex + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
