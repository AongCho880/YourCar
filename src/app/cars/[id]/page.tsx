"use client";

import { useParams, notFound } from 'next/navigation';
import Image from 'next/image';
import { useCars } from '@/contexts/CarContext';
import CarImageCarousel from '@/components/CarImageCarousel';
import ContactButtons from '@/components/ContactButtons';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle }
  from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CalendarDays, Gauge, Tag, CheckCircle, Settings, Info } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function CarDetailPage() {
  const params = useParams();
  const { id } = params;
  const { getCarById, loading } = useCars();
  const { user } = useAuth();
  const { toast } = useToast();
  const [showFbModal, setShowFbModal] = useState(false);
  const [fbPostText, setFbPostText] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const car = getCarById(Array.isArray(id) ? id[0] : String(id));

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <Skeleton className="w-full h-[400px] rounded-lg mb-8" />
        <Skeleton className="h-10 w-3/4 mb-4" />
        <Skeleton className="h-6 w-1/2 mb-6" />
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-32 w-full mb-6" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (!car) {
    notFound();
    return null;
  }

  // Placeholder for AI-generated text (replace with API call later)
  const generateDefaultPostText = () => {
    return `Check out this ${car.year} ${car.make} ${car.model}!\n\n${car.description}\n\nSee more details and cars at: [Your Website Link]`;
  };

  // Fetch AI-generated post text
  const fetchAIPostText = async () => {
    setIsGenerating(true);
    try {
      // Transform car object for AI
      const aiCar = {
        make: car.make,
        model: car.model,
        year: car.year,
        mileage: car.mileage,
        condition: car.condition,
        features: (car.features || []).map(f => typeof f === 'string' ? f : f.value).filter(Boolean),
        price: car.price,
      };
      const response = await fetch('/api/facebook-generate-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ car: aiCar }),
      });
      const data = await response.json();
      if (data.postText) {
        setFbPostText(data.postText);
      } else {
        setFbPostText(generateDefaultPostText());
        toast({ variant: 'destructive', title: 'AI Error', description: data.error || 'Failed to generate post text.' });
      }
    } catch (e) {
      setFbPostText(generateDefaultPostText());
      toast({ variant: 'destructive', title: 'AI Error', description: 'Failed to generate post text.' });
    } finally {
      setIsGenerating(false);
    }
  };

  // Open modal and set default text/images
  const handleOpenFbModal = () => {
    setSelectedImages(car.images);
    setShowFbModal(true);
    fetchAIPostText();
  };

  // Toggle image selection
  const handleImageToggle = (img: string) => {
    setSelectedImages(prev => prev.includes(img) ? prev.filter(i => i !== img) : [...prev, img]);
  };

  // Helper to download all selected images
  const handleDownloadAllImages = async () => {
    for (const imgUrl of selectedImages) {
      const fileName = imgUrl.split('/').pop()?.split('?')[0] || 'car-image.jpg';
      const response = await fetch(imgUrl);
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <Card className="overflow-hidden shadow-xl">
        <CardHeader className="p-0">
          <CarImageCarousel images={car.images} make={car.make} model={car.model} />
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between md:items-center mb-4">
            <div>
              <h1 className="text-2xl md:text-4xl font-bold font-headline text-primary mb-1">
                {car.make} {car.model}
              </h1>
              <div className="text-lg text-muted-foreground">
                <Badge variant="secondary" className="text-sm">{car.condition}</Badge> - {car.year}
              </div>
            </div>
            <div className="text-2xl md:text-3xl font-semibold text-foreground mt-2 md:mt-0">
              ${car.price.toLocaleString()}
            </div>
          </div>

          <Separator className="my-6" />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6 text-sm">
            <div className="flex items-center p-3 bg-muted rounded-md">
              <Tag className="w-5 h-5 mr-2 text-primary" />
              <strong>Make:</strong><span className="ml-1">{car.make}</span>
            </div>
            <div className="flex items-center p-3 bg-muted rounded-md">
              <Tag className="w-5 h-5 mr-2 text-primary" />
              <strong>Model:</strong><span className="ml-1">{car.model}</span>
            </div>
            <div className="flex items-center p-3 bg-muted rounded-md">
              <CalendarDays className="w-5 h-5 mr-2 text-primary" />
              <strong>Year:</strong><span className="ml-1">{car.year}</span>
            </div>
            <div className="flex items-center p-3 bg-muted rounded-md">
              <Gauge className="w-5 h-5 mr-2 text-primary" />
              <strong>Mileage:</strong><span className="ml-1">{car.mileage.toLocaleString()} miles</span>
            </div>
            <div className="flex items-center p-3 bg-muted rounded-md">
              <Info className="w-5 h-5 mr-2 text-primary" />
              <strong>Condition:</strong><span className="ml-1">{car.condition}</span>
            </div>
          </div>

          {car.features && car.features.length > 0 && (
            <>
              <h2 className="text-xl font-semibold mb-3 font-headline flex items-center">
                <Settings className="w-5 h-5 mr-2 text-primary" /> Features
              </h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mb-6 list-none p-0">
                {car.features?.filter(feature => feature && feature.value).map((feature, index) => (
                  <li key={index} className="flex items-center text-sm p-2 bg-muted/70 rounded-md">
                    <CheckCircle className="w-4 h-4 mr-2 text-foreground" />
                    {feature.value}
                  </li>
                ))}
              </ul>
            </>
          )}

          <h2 className="text-xl font-semibold mb-3 font-headline flex items-center">
            <Info className="w-5 h-5 mr-2 text-primary" /> Description
          </h2>
          <p className="text-foreground leading-relaxed whitespace-pre-line mb-6">
            {car.description || 'No description available.'}
          </p>

          <ContactButtons car={car} />
          {user && (
            <Button
              className="mt-6 border-2 border-primary rounded-lg"
              variant="outline"
              onClick={handleOpenFbModal}
            >
              Create Facebook Post
            </Button>
          )}
          <Dialog open={showFbModal} onOpenChange={setShowFbModal}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Facebook Post Generator</DialogTitle>
              </DialogHeader>
              <div className="mb-4">
                <label className="block font-semibold mb-1">Post Text</label>
                <Textarea
                  value={fbPostText}
                  onChange={e => setFbPostText(e.target.value)}
                  rows={5}
                  className="w-full"
                  disabled={isGenerating}
                />
                {isGenerating && <p className="text-xs text-muted-foreground mt-1">Generating post text...</p>}
                <Button
                  className="mt-2"
                  variant="secondary"
                  onClick={async () => {
                    // Compose the post to match the Preview
                    let post = '';
                    // Banner image URL (for admin reference)
                    if (selectedImages.length > 0) {
                      post += `Banner Image: ${selectedImages[0]}\n\n`;
                    }
                    // Additional images (for admin reference)
                    if (selectedImages.length > 1) {
                      post += 'Additional Images:';
                      selectedImages.slice(1).forEach((img) => {
                        post += `\n${img}`;
                      });
                      post += '\n\n';
                    }
                    // AI-generated text
                    post += fbPostText + '\n\n';
                    // Car details (with emojis and labels)
                    post += `🚗  ${car.year} ${car.make} ${car.model}\n`;
                    post += `💰  Price: $${car.price.toLocaleString()}\n`;
                    post += `🛣️  Mileage: ${car.mileage.toLocaleString()} miles\n`;
                    post += `🔧  Condition: ${car.condition}\n`;
                    // Features
                    if (Array.isArray(car.features) && car.features.length > 0) {
                      post += `✨  Features:`;
                      car.features.forEach((feature) => {
                        post += `\n  • ${typeof feature === 'string' ? feature : feature.value}`;
                      });
                      post += '\n';
                    }
                    // Description
                    post += `\n📝  Description:\n${car.description}\n`;
                    // More info
                    post += `\n🔗  More info: [Your Website Link]`;
                    await navigator.clipboard.writeText(post);
                    setIsCopied(true);
                    setTimeout(() => setIsCopied(false), 1500);
                  }}
                  disabled={isGenerating}
                >
                  {isCopied ? 'Copied!' : 'Copy Post'}
                </Button>
                <p className="text-xs text-muted-foreground mt-1">Copy the post text above and paste it on your Facebook page.</p>
              </div>
              <div className="mb-4">
                <label className="block font-semibold mb-1">Select Images</label>
                <div className="flex flex-wrap gap-2">
                  {car.images.map((img, idx) => (
                    <div key={idx} className="relative">
                      <img
                        src={img}
                        alt={`Car image ${idx + 1}`}
                        className={`w-24 h-16 object-cover rounded border-2 ${selectedImages.includes(img) ? 'border-blue-500' : 'border-gray-300'}`}
                        onClick={() => handleImageToggle(img)}
                        style={{ cursor: 'pointer' }}
                      />
                      <input
                        type="checkbox"
                        checked={selectedImages.includes(img)}
                        onChange={() => handleImageToggle(img)}
                        className="absolute top-1 left-1 z-10"
                      />
                    </div>
                  ))}
                </div>
                <Button
                  className="mt-2"
                  variant="outline"
                  onClick={handleDownloadAllImages}
                  disabled={selectedImages.length === 0}
                >
                  Download All Selected Images
                </Button>
                <p className="text-xs text-muted-foreground mt-1">Right-click and save the selected images to your computer, or use the button above. Then upload them when posting on Facebook.</p>
              </div>
              <div className="mb-4">
                <label className="block font-semibold mb-1">Preview</label>
                <div className="border rounded p-4 bg-muted">
                  {/* Banner Image */}
                  {selectedImages.length > 0 && (
                    <div className="w-full mb-4">
                      <img
                        src={selectedImages[0]}
                        alt="Banner Preview"
                        className="w-full h-52 object-cover rounded-lg shadow-md border mb-2"
                        style={{ maxHeight: 240 }}
                      />
                    </div>
                  )}
                  {/* Thumbnails for additional images */}
                  {selectedImages.length > 1 && (
                    <div className="flex gap-2 flex-wrap mb-2">
                      {selectedImages.slice(1).map((img, idx) => (
                        <img key={idx} src={img} alt="Preview" className="w-20 h-14 object-cover rounded border" />
                      ))}
                    </div>
                  )}
                  <div className="mb-2">
                    <span role="img" aria-label="car">🚗</span>
                    <span className="font-bold text-lg ml-2">{car.year} {car.make} {car.model}</span>
                  </div>
                  <div className="mb-2">
                    <span role="img" aria-label="money">💰</span> <span className="font-semibold">Price:</span> ${car.price.toLocaleString()}
                  </div>
                  <div className="mb-2">
                    <span role="img" aria-label="mileage">🛣️</span> <span className="font-semibold">Mileage:</span> {car.mileage.toLocaleString()} miles
                  </div>
                  <div className="mb-2">
                    <span role="img" aria-label="condition">🔧</span> <span className="font-semibold">Condition:</span> {car.condition}
                  </div>
                  {Array.isArray(car.features) && car.features.length > 0 && (
                    <div className="mb-2">
                      <span role="img" aria-label="star">✨</span> <span className="font-semibold">Features:</span>
                      <ul className="list-disc list-inside ml-6 mt-1">
                        {car.features.map((feature, idx) => (
                          <li key={idx}>{typeof feature === 'string' ? feature : feature.value}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="mb-2">
                    <span role="img" aria-label="info">📝</span> <span className="font-semibold">Description:</span>
                    <div className="whitespace-pre-line ml-6">{car.description}</div>
                  </div>
                  <div className="mb-2">
                    <span role="img" aria-label="link">🔗</span> <span className="font-semibold">More info:</span> [Your Website Link]
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => setShowFbModal(false)} variant="outline" disabled={isGenerating}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}

