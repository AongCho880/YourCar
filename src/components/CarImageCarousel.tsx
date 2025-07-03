"use client";

import { useCallback, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

interface CarImageCarouselProps {
  images: string[];
  make: string;
  model: string;
}

export default function CarImageCarousel({ images, make, model }: CarImageCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 3500, stopOnInteraction: false })]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);

  const altText = `${make} ${model}`;
  const makeKeywords = make.split(' ');
  let aiHint = '';
  if (makeKeywords.length >= 2) {
    aiHint = make;
  } else {
    const modelType = model.split(' ')[0] || 'car';
    aiHint = `${make} ${modelType}`;
  }

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback((idx: number) => {
    if (emblaApi) emblaApi.scrollTo(idx);
  }, [emblaApi]);

  // Modal navigation handlers
  const handleImageClick = (idx: number) => {
    setModalIndex(idx);
    setModalOpen(true);
  };
  const handleModalPrev = () => {
    setModalIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };
  const handleModalNext = () => {
    setModalIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  if (!images || images.length === 0) {
    return (
      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
        No images available
      </div>
    );
  }

  return (
    <>
      <div className="relative w-full group">
        <div className="overflow-hidden aspect-video rounded-lg shadow-lg" ref={emblaRef}>
          <div className="flex">
            {images.map((img, idx) => (
              <div key={idx} className="flex-[0_0_100%] w-full h-full">
                <Image
                  src={img}
                  alt={`${altText} - Image ${idx + 1}`}
                  width={800}
                  height={600}
                  className="w-full h-full object-cover transition-opacity duration-500 ease-in-out cursor-pointer"
                  priority={idx === 0}
                  data-ai-hint={aiHint}
                  onClick={() => handleImageClick(idx)}
                />
              </div>
            ))}
          </div>
        </div>
        {images.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              onClick={scrollPrev}
              className="absolute top-1/2 left-2 transform -translate-y-1/2 rounded-full opacity-70 group-hover:opacity-100 transition-opacity z-10 bg-background/50 hover:bg-background/80"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={scrollNext}
              className="absolute top-1/2 right-2 transform -translate-y-1/2 rounded-full opacity-70 group-hover:opacity-100 transition-opacity z-10 bg-background/50 hover:bg-background/80"
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
              {images.map((_, slideIndex) => (
                <button
                  key={slideIndex}
                  onClick={() => scrollTo(slideIndex)}
                  className={cn(
                    "h-2 w-2 rounded-full transition-all",
                    emblaApi?.selectedScrollSnap() === slideIndex ? "bg-primary p-1" : "bg-muted-foreground/50 hover:bg-muted-foreground"
                  )}
                  aria-label={`Go to image ${slideIndex + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
      {/* Modal for full image view */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-3xl w-full flex flex-col items-center justify-center p-0 bg-black">
          <DialogTitle className="sr-only">{altText} - Image Gallery</DialogTitle>
          <div className="relative w-full flex items-center justify-center aspect-video bg-black">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleModalPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-background/40 hover:bg-background/80"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-8 w-8 text-white" />
            </Button>
            <Image
              src={images[modalIndex]}
              alt={`${altText} - Full Image ${modalIndex + 1}`}
              width={1200}
              height={900}
              className="object-contain w-full h-full max-h-[80vh] bg-black"
              priority
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleModalNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-background/40 hover:bg-background/80"
              aria-label="Next image"
            >
              <ChevronRight className="h-8 w-8 text-white" />
            </Button>
          </div>
          {images.length > 1 && (
            <div className="flex justify-center items-center space-x-2 py-4">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setModalIndex(idx)}
                  className={cn(
                    "h-3 w-3 rounded-full border-2 border-white transition-all",
                    idx === modalIndex ? "bg-primary border-primary" : "bg-white/30 border-white/30 hover:bg-white/60"
                  )}
                  aria-label={`Go to image ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
