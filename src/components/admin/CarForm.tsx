"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type { Car as CarType } from "@/types";
import { CarCondition } from "@/types";
import { CAR_MAKES, CAR_CONDITIONS, MAX_IMAGE_UPLOADS } from "@/lib/constants";
import { useCars } from "@/contexts/CarContext";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { generateAdCopy } from "@/ai/flows/generate-ad-copy";
import type { GenerateAdCopyInput } from "@/ai/flows/generate-ad-copy";
import { useState, useEffect, useRef } from "react";
import { PlusCircle, Trash2, Sparkles, Loader2, FileImage, UploadCloud, PackageCheck, PackageX } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';

import { v4 as uuidv4 } from 'uuid';

const ADD_NEW_MAKE_VALUE = "__ADD_NEW_MAKE__";

const carFormSchema = z.object({
  make: z.string().min(1, "Make selection is required"),
  customMakeName: z.string().optional(),
  model: z.string().min(1, "Model is required"),
  year: z.coerce.number().min(1900, "Invalid year").max(new Date().getFullYear() + 1, "Invalid year"),
  price: z.coerce.number().min(0, "Price must be positive"),
  mileage: z.coerce.number().min(0, "Mileage must be positive"),
  condition: z.nativeEnum(CarCondition, { errorMap: () => ({ message: "Condition is required" }) }),
  features: z.array(z.object({ value: z.string().min(1, "Feature cannot be empty") })).optional(),
  images: z.array(z.object({ value: z.string().url("Must be a valid URL.").min(1, "URL cannot be empty.") }))
    .min(1, "At least one image is required.")
    .max(MAX_IMAGE_UPLOADS, `Maximum ${MAX_IMAGE_UPLOADS} images allowed.`),
  description: z.string().min(10, "Description must be at least 10 characters").max(2000, "Description too long"),
  isSold: z.boolean().optional(),
}).superRefine((data, ctx) => {
  if (data.make === ADD_NEW_MAKE_VALUE) {
    if (!data.customMakeName || data.customMakeName.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "New brand name is required when 'Add New Brand' is selected.",
        path: ["customMakeName"],
      });
    }
  }
});

type CarFormValues = z.infer<typeof carFormSchema>;

interface CarFormProps {
  initialData?: CarType;
  isEditMode?: boolean;
}

export default function CarForm({ initialData, isEditMode = false }: CarFormProps) {
  const router = useRouter();
  const { addCar, updateCar } = useCars();
  const { toast } = useToast();
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [isGeneratingCopy, setIsGeneratingCopy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const { user } = useAuth();
  const [deletingImageIndex, setDeletingImageIndex] = useState<number | null>(null);
  const [brands, setBrands] = useState<{ id: number; name: string }[]>([]);
  const [isAddingBrand, setIsAddingBrand] = useState(false);

  const form = useForm<CarFormValues>({
    resolver: zodResolver(carFormSchema),
    defaultValues: initialData
      ? {
        ...initialData,
        make: CAR_MAKES.includes(initialData.make) ? initialData.make : ADD_NEW_MAKE_VALUE,
        customMakeName: CAR_MAKES.includes(initialData.make) ? "" : initialData.make,
        features: initialData.features || [{ value: "" }],
        images: initialData.images ? initialData.images.map(url => ({ value: url })) : [],
        isSold: initialData.isSold ?? false,
      }
      : {
        make: "",
        customMakeName: "",
        model: "",
        year: new Date().getFullYear(),
        price: 0,
        mileage: 0,
        condition: undefined,
        features: [{ value: "" }],
        images: [],
        description: "",
        isSold: false,
      },
  });

  const { fields: featureFields, append: appendFeature, remove: removeFeature } = useFieldArray({
    control: form.control,
    name: "features",
  });

  const { fields: imageUrlFields, append: appendImageUrl, remove: removeImageUrl } = useFieldArray({
    control: form.control,
    name: "images",
  });

  const handleDeleteImage = async (index: number) => {
    // Check if user is authenticated before attempting to delete
    if (!user) {
      toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to delete an image." });
      return;
    }

    setDeletingImageIndex(index);
    try {
      // Get the image URL that needs to be deleted from the form
      const imageUrlToDelete = form.getValues(`images.${index}.value`);

      // Check if the URL is a valid Supabase storage URL
      if (!imageUrlToDelete || !imageUrlToDelete.includes('supabase.co')) {
        // This is a new, unsaved URL or a placeholder, just remove it from the form
        // No need to call the API since it's not stored in Supabase yet
        removeImageUrl(index);
        toast({ title: "Image Removed", description: "The image URL has been removed from the list." });
        return;
      }

      // Get the current session to obtain the access token for API calls
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("You must be logged in to delete an image.");
      }

      // Call the upload API's DELETE endpoint to remove the image from Supabase storage
      const response = await fetch('/api/upload', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ urlToDelete: imageUrlToDelete }),
      });

      // Handle API response errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.details || "Failed to delete image from storage.");
      }

      // Remove the image from the form array on successful deletion
      removeImageUrl(index);
      toast({ title: "Image Deleted", description: "The image has been successfully deleted from storage." });

    } catch (error: any) {
      console.error("Error deleting image:", error);
      toast({ variant: "destructive", title: "Deletion Failed", description: error.message });
    } finally {
      // Reset the deleting state regardless of success or failure
      setDeletingImageIndex(null);
    }
  };

  const watchedMake = form.watch("make");

  useEffect(() => {
    if (watchedMake !== ADD_NEW_MAKE_VALUE && form.getValues("customMakeName")) {
      form.setValue("customMakeName", "", { shouldValidate: true });
    }
  }, [watchedMake, form]);

  useEffect(() => {
    fetch('/api/brands')
      .then(res => res.json())
      .then(data => setBrands(data || []));
  }, []);

  /**
   * Handles file selection and uploads images directly to Supabase storage
   * This function processes multiple files and uploads them one by one
   */
  const handleFileSelection = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }

    // Set loading state to show upload progress
    setIsUploadingImage(true);
    let uploadedCount = 0;
    let errorOccurred = false;

    // Process each selected file individually
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // Extract file extension for proper file naming
      const fileExtension = file.name.split('.').pop();
      // Create unique file path using UUID to prevent naming conflicts
      const filePath = `car-images/${uuidv4()}.${fileExtension}`;

      try {
        // Upload file directly to Supabase storage bucket
        const { data, error } = await supabase.storage
          .from('car-images')
          .upload(filePath, file, {
            cacheControl: '3600', // Set cache control for 1 hour
            upsert: false // Don't overwrite existing files
          });

        if (error) {
          throw error;
        }

        // Generate public URL for the uploaded image
        const { data: publicUrlData } = supabase.storage
          .from('car-images')
          .getPublicUrl(filePath);

        if (publicUrlData?.publicUrl) {
          // Add the public URL to the form's image array
          appendImageUrl({ value: publicUrlData.publicUrl });
          uploadedCount++;
        } else {
          throw new Error('Could not get public URL.');
        }
      } catch (error: any) {
        console.error('Error uploading image:', error.message);
        toast({
          variant: "destructive",
          title: "Image Upload Failed",
          description: `Failed to upload ${file.name}: ${error.message}`,
        });
        errorOccurred = true;
      }
    }

    // Reset loading state
    setIsUploadingImage(false);
    // Clear the file input to allow re-selection of the same files
    if (event.target) {
      event.target.value = ''; // Clear the input
    }

    // Show success or error messages based on upload results
    if (uploadedCount > 0) {
      toast({
        variant: "default",
        title: "Upload Complete",
        description: `${uploadedCount} image(s) uploaded successfully.`,
      });
    } else if (!errorOccurred) {
      toast({
        variant: "default",
        title: "No Files Selected",
        description: "Please select files to upload.",
      });
    }
  };

  const onSubmit = async (data: CarFormValues) => {
    setIsSubmittingForm(true);

    let actualMake = data.make;
    // If adding a new brand, insert it into the database and use it
    if (data.make === ADD_NEW_MAKE_VALUE && data.customMakeName) {
      setIsAddingBrand(true);
      try {
        const response = await fetch('/api/brands', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: data.customMakeName.trim() })
        });
        if (!response.ok) throw new Error('Failed to add new brand');
        const newBrand = await response.json();
        setBrands(prev => [...prev, newBrand]);
        actualMake = newBrand.name;
        form.setValue('make', newBrand.name);
      } catch (e) {
        toast({ variant: 'destructive', title: 'Brand Add Failed', description: 'Could not add new brand.' });
        setIsSubmittingForm(false);
        setIsAddingBrand(false);
        return;
      }
      setIsAddingBrand(false);
    } else if (data.make === ADD_NEW_MAKE_VALUE) {
      setIsSubmittingForm(false);
      return;
    }

    const finalImageUrls: string[] = data.images.map(img => img.value).filter(url => url && url.trim() !== "");
    if (finalImageUrls.length === 0) {
      form.setError("images", { type: "manual", message: "At least one image is required." });
      toast({ variant: "destructive", title: "No Images", description: "Please provide at least one image." });
      setIsSubmittingForm(false);
      return;
    }
    if (finalImageUrls.length > MAX_IMAGE_UPLOADS) {
      form.setError("images", { type: "manual", message: `Maximum ${MAX_IMAGE_UPLOADS} images allowed.` });
      toast({ variant: "destructive", title: "Too Many Images", description: `Maximum ${MAX_IMAGE_UPLOADS} images allowed.` });
      setIsSubmittingForm(false);
      return;
    }

    // Exclude customMakeName from payload
    const { customMakeName, ...rest } = data;
    const carDataPayload = {
      ...rest,
      make: actualMake,
      features: data.features || [],
      images: finalImageUrls,
      isSold: data.isSold ?? false,
    };

    try {
      if (isEditMode && initialData) {
        await updateCar({ ...carDataPayload, id: initialData.id });
        toast({
          title: "Car Updated",
          description: "Car details have been successfully updated.",
        });
      } else {
        await addCar(carDataPayload);
        toast({
          title: "Car Added",
          description: "New car has been successfully added.",
        });
      }
      router.push("/admin/dashboard");
    } catch (error) {
      console.error("Error submitting car form:", error);
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: "There was an error submitting the car details. Please try again.",
      });
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const handleGenerateAdCopy = async () => {
    setIsGeneratingCopy(true);
    const currentValues = form.getValues();
    const adCopyInput: GenerateAdCopyInput = {
      make: currentValues.make === ADD_NEW_MAKE_VALUE ? currentValues.customMakeName! : currentValues.make,
      model: currentValues.model,
      year: Number(currentValues.year),
      price: Number(currentValues.price),
      mileage: Number(currentValues.mileage),
      condition: currentValues.condition as CarCondition,
      features: currentValues.features?.map(f => f.value) || [],
    };

    try {
      const result = await generateAdCopy(adCopyInput);
      if (result.adCopy) {
        form.setValue("description", result.adCopy, { shouldValidate: true });
        toast({
          title: "Ad Copy Generated",
          description: "AI-generated ad copy has been added to the description.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Ad Copy Generation Failed",
          description: "Could not generate ad copy. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error generating ad copy:", error);
      toast({
        variant: "destructive",
        title: "Ad Copy Generation Failed",
        description: "An unexpected error occurred during ad copy generation.",
      });
    } finally {
      setIsGeneratingCopy(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{isEditMode ? "Edit Car" : "Add New Car"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="make"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Make</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a make" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {brands.map((brand) => (
                          <SelectItem key={brand.id} value={brand.name}>{brand.name}</SelectItem>
                        ))}
                        <SelectItem value={ADD_NEW_MAKE_VALUE} className="font-semibold text-primary">
                          + Add New Brand
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select the car's manufacturer. If your brand is not listed, choose <span className="font-semibold text-primary">+ Add New Brand</span>.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {watchedMake === ADD_NEW_MAKE_VALUE && (
                <FormField
                  control={form.control}
                  name="customMakeName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Brand Name <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Enter new brand name" {...field} disabled={isAddingBrand} />
                      </FormControl>
                      <FormDescription>
                        Enter the name of the new car brand. This brand will be added to the global list.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model</FormLabel>
                    <FormControl>
                      <Input placeholder="Model" {...field} />
                    </FormControl>
                    <FormDescription>
                      The specific model of the car (e.g., "Civic", "F-150").
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Year" {...field} />
                    </FormControl>
                    <FormDescription>
                      The manufacturing year of the car.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Price" {...field} />
                    </FormControl>
                    <FormDescription>
                      The selling price of the car.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mileage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mileage</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Mileage" {...field} />
                    </FormControl>
                    <FormDescription>
                      The total distance the car has traveled in miles.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="condition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Condition</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CAR_CONDITIONS.map((condition) => (
                          <SelectItem key={condition.value} value={condition.value}>
                            {condition.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The current condition of the car.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Features</CardTitle>
              </CardHeader>
              <CardContent>
                {featureFields.map((field, index) => (
                  <FormField
                    control={form.control}
                    key={index}
                    name={`features.${index}.value`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={index === 0 ? "sr-only" : ""}>
                          Feature
                        </FormLabel>
                        <FormDescription className={index === 0 ? "sr-only" : ""}>
                          Add a key feature of the car.
                        </FormDescription>
                        <div className="flex items-center space-x-2">
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => removeFeature(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendFeature({ value: "" })}
                  className="mt-2"
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Feature
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Images</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  <Button type="button" onClick={() => fileInputRef.current?.click()} variant="outline" className="w-full" disabled={isUploadingImage}>
                    {isUploadingImage ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <UploadCloud className="mr-2 h-4 w-4" />
                    )}
                    {isUploadingImage ? "Uploading..." : "Upload Images"}
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelection}
                    className="hidden"
                    multiple
                    accept="image/*"
                  />
                  <Button type="button" onClick={() => appendImageUrl({ value: "" })} variant="outline" className="w-full" disabled={isUploadingImage}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Image URL
                  </Button>
                </div>
                {imageUrlFields.map((field, index) => (
                  <FormField
                    control={form.control}
                    key={field.id}
                    name={`images.${index}.value`}
                    render={({ field }) => (
                      <FormItem className="mt-2">
                        <FormLabel className={index === 0 ? "sr-only" : ""}>
                          Image URL
                        </FormLabel>
                        <FormDescription className={index === 0 ? "sr-only" : ""}>
                          Provide a direct URL to the car image.
                        </FormDescription>
                        <div className="flex items-center space-x-2">
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => handleDeleteImage(index)}
                            disabled={deletingImageIndex === index}
                          >
                            {deletingImageIndex === index ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </CardContent>
            </Card>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the car in detail..."
                      className="resize-y min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    A detailed description of the car, including its history, condition, and any unique selling points.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center space-x-2">
              <Button
                type="button"
                onClick={handleGenerateAdCopy}
                disabled={isGeneratingCopy}
                variant="outline"
              >
                {isGeneratingCopy ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Generate Ad Copy
              </Button>
              {!isEditMode && (
                <FormField
                  control={form.control}
                  name="isSold"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Mark as Sold</FormLabel>
                        <FormDescription>
                          Toggle if the car has been sold.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}
            </div>

            <Button type="submit" disabled={isSubmittingForm}>
              {isSubmittingForm ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : isEditMode ? (
                "Save Changes"
              ) : (
                "Add Car"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

