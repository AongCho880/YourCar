
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Car as CarType } from "@/types";
import { CarCondition } from "@/types";
import { CAR_MAKES, CAR_CONDITIONS, MAX_IMAGE_UPLOADS } from "@/lib/constants";
import { useCars } from "@/contexts/CarContext";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { generateAdCopy } from "@/ai/flows/generate-ad-copy";
import type { GenerateAdCopyInput } from "@/ai/flows/generate-ad-copy";
import { useState, useEffect } from "react";
import { PlusCircle, Trash2, Sparkles, Loader2, FileImage, Upload, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import Image from 'next/image';
import { Progress } from '@/components/ui/progress';

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
  images: z.array(z.string().url("Must be a valid URL.").min(1, "URL cannot be empty.")), // Will store final URLs
  description: z.string().min(10, "Description must be at least 10 characters").max(2000, "Description too long"),
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
  if (data.images.length === 0) {
     ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "At least one image is required.",
      path: ["images"], // This path might need adjustment if directly validating after file uploads
    });
  }
  if (data.images.length > MAX_IMAGE_UPLOADS) {
     ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Maximum ${MAX_IMAGE_UPLOADS} images allowed.`,
      path: ["images"],
    });
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingCopy, setIsGeneratingCopy] = useState(false);
  
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [uploadProgresses, setUploadProgresses] = useState<Map<string, number>>(new Map());
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<Map<string, string>>(new Map());


  const form = useForm<CarFormValues>({
    resolver: zodResolver(carFormSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          make: CAR_MAKES.includes(initialData.make) ? initialData.make : ADD_NEW_MAKE_VALUE,
          customMakeName: CAR_MAKES.includes(initialData.make) ? "" : initialData.make,
          features: initialData.features?.map(f => ({ value: f })) || [{ value: "" }],
          images: initialData.images || [], 
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
          images: [], // Start with empty array, files/URLs will populate this
          description: "",
        },
  });

  const { fields: featureFields, append: appendFeature, remove: removeFeature } = useFieldArray({
    control: form.control,
    name: "features",
  });

  // For manual URL inputs
  const { fields: imageUrlFields, append: appendImageUrl, remove: removeImageUrl, update: updateImageUrl } = useFieldArray({
    control: form.control,
    name: "images",
  });

  const watchedMake = form.watch("make");

  useEffect(() => {
    if (watchedMake !== ADD_NEW_MAKE_VALUE && form.getValues("customMakeName")) {
      form.setValue("customMakeName", "", { shouldValidate: true });
    }
  }, [watchedMake, form]);

  const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    const currentTotalImages = form.getValues("images").length + filesToUpload.length;
    
    if (selectedFiles.length + currentTotalImages > MAX_IMAGE_UPLOADS) {
      toast({
        variant: "destructive",
        title: "Too Many Images",
        description: `You can upload a maximum of ${MAX_IMAGE_UPLOADS} images in total.`,
      });
      event.target.value = ""; // Clear file input
      return;
    }

    setFilesToUpload(prev => [...prev, ...selectedFiles]);

    selectedFiles.forEach(file => {
      const previewUrl = URL.createObjectURL(file);
      setImagePreviews(prev => new Map(prev).set(file.name, previewUrl));
    });
    event.target.value = ""; // Clear file input to allow re-selecting same file
  };
  
  const removeSelectedFile = (fileName: string) => {
    setFilesToUpload(prev => prev.filter(f => f.name !== fileName));
    setImagePreviews(prev => {
      const newMap = new Map(prev);
      URL.revokeObjectURL(newMap.get(fileName)!); // Clean up object URL
      newMap.delete(fileName);
      return newMap;
    });
  };

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);


  const onSubmit = async (data: CarFormValues) => {
    setIsSubmitting(true);
    setIsUploadingFiles(true);

    const uploadedImageUrls: string[] = [];
    
    // Process existing URLs (from manual inputs)
    const existingUrls = data.images.filter(url => url && url.trim() !== "").map(url => url.trim());
    uploadedImageUrls.push(...existingUrls);

    // Upload new files
    if (filesToUpload.length > 0) {
      const uploadPromises = filesToUpload.map(file => {
        const formData = new FormData();
        formData.append('file', file);
        
        setUploadProgresses(prev => new Map(prev).set(file.name, 0)); // Initialize progress

        // Simulate progress for API upload, actual progress needs server events or polling
        // For now, just set to 100 on success
        return fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })
        .then(async response => {
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: "Unknown upload error" }));
            throw new Error(errorData.error || `Failed to upload ${file.name}`);
          }
          return response.json();
        })
        .then(result => {
          setUploadProgresses(prev => new Map(prev).set(file.name, 100));
          return result.imageUrl;
        })
        .catch(error => {
          console.error(`Error uploading ${file.name}:`, error);
          setUploadProgresses(prev => new Map(prev).delete(file.name)); // Remove progress on error
          toast({ variant: "destructive", title: `Upload Failed: ${file.name}`, description: error.message });
          return null; // Indicate failure
        });
      });

      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter((url): url is string => url !== null);
      uploadedImageUrls.push(...successfulUploads);

      if (results.some(r => r === null)) { // If any upload failed
        setIsSubmitting(false);
        setIsUploadingFiles(false);
        // Keep files that failed so user can retry or remove them
        const failedFileNames = filesToUpload.filter((_, i) => results[i] === null).map(f => f.name);
        setFilesToUpload(filesToUpload.filter(f => failedFileNames.includes(f.name)));
        return; 
      }
    }
    setIsUploadingFiles(false);

    // Validate total images
    if (uploadedImageUrls.length === 0) {
      toast({ variant: "destructive", title: "No Images", description: "Please upload or provide at least one image URL." });
      form.setError("images", { type: "manual", message: "At least one image is required." });
      setIsSubmitting(false);
      return;
    }
    if (uploadedImageUrls.length > MAX_IMAGE_UPLOADS) {
      toast({ variant: "destructive", title: "Too Many Images", description: `Maximum ${MAX_IMAGE_UPLOADS} images allowed.` });
      form.setError("images", { type: "manual", message: `Maximum ${MAX_IMAGE_UPLOADS} images allowed.` });
      setIsSubmitting(false);
      return;
    }

    const actualMake = data.make === ADD_NEW_MAKE_VALUE ? data.customMakeName! : data.make;
    const carDataToSave = {
      ...data,
      make: actualMake,
      features: data.features?.map(f => f.value).filter(Boolean) || [],
      images: uploadedImageUrls, // Use the final list of URLs
    };
    // @ts-expect-error customMakeName is not part of CarType
    delete carDataToSave.customMakeName;

    let success = false;
    if (isEditMode && initialData) {
      const result = await updateCar({ ...initialData, ...carDataToSave });
      if (result) success = true;
      toast({ title: "Success", description: "Car listing updated successfully." });
    } else {
      const result = await addCar(carDataToSave as Omit<CarType, 'id' | 'createdAt' | 'updatedAt'>);
      if (result) success = true;
      toast({ title: "Success", description: "Car listing added successfully." });
    }
    
    if (success) {
      setFilesToUpload([]); // Clear successfully uploaded files
      setImagePreviews(new Map());
      setUploadProgresses(new Map());
      form.reset(); // Reset form to default or clear values
      router.push("/admin/dashboard");
      router.refresh(); // Consider if this is needed with context updates
    }
    setIsSubmitting(false);
  };

  const handleGenerateAdCopy = async () => {
    const values = form.getValues();
    const makeToUse = values.make === ADD_NEW_MAKE_VALUE ? values.customMakeName : values.make;

    if (!makeToUse || !values.model || !values.year || !values.price || !values.condition) {
      toast({ variant: "destructive", title: "Missing Information", description: "Please fill in Make/New Brand, Model, Year, Price, and Condition before generating ad copy." });
      return;
    }
    setIsGeneratingCopy(true);
    try {
      const input: GenerateAdCopyInput = {
        make: makeToUse,
        model: values.model,
        year: Number(values.year),
        mileage: Number(values.mileage),
        condition: values.condition,
        features: values.features?.map(f => f.value).filter(Boolean).join(', ') || "Standard",
        price: Number(values.price),
      };
      const result = await generateAdCopy(input);
      form.setValue("description", result.adCopy);
      toast({ title: "Ad Copy Generated", description: "AI has generated an ad copy for you." });
    } catch (error) {
      console.error("AI Ad Copy Generation Error:", error);
      toast({ variant: "destructive", title: "AI Error", description: "Failed to generate ad copy." });
    } finally {
      setIsGeneratingCopy(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">{isEditMode ? "Edit Car Listing" : "Add New Car Listing"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              <FormField 
                control={form.control} 
                name="make" 
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Make</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                      }} 
                      value={field.value}
                    >
                      <FormControl><SelectTrigger><SelectValue placeholder="Select make" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {CAR_MAKES.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                        <SelectItem value={ADD_NEW_MAKE_VALUE}>+ Add New Brand</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                    {watchedMake === ADD_NEW_MAKE_VALUE && (
                      <div className="mt-4">
                        <FormField
                          control={form.control}
                          name="customMakeName"
                          render={({ field: customMakeField }) => (
                            <FormItem>
                              <FormLabel>New Brand Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Type the new brand name" {...customMakeField} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </FormItem>
                )} 
              />
              <FormField control={form.control} name="model" render={({ field }) => (
                <FormItem><FormLabel>Model</FormLabel><FormControl><Input placeholder="e.g., Camry, F-150" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="year" render={({ field }) => (
                <FormItem><FormLabel>Year</FormLabel><FormControl><Input type="number" placeholder="e.g., 2023" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="price" render={({ field }) => (
                <FormItem><FormLabel>Price ($)</FormLabel><FormControl><Input type="number" placeholder="e.g., 25000" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="mileage" render={({ field }) => (
                <FormItem><FormLabel>Mileage</FormLabel><FormControl><Input type="number" placeholder="e.g., 15000" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="condition" render={({ field }) => (
                <FormItem>
                  <FormLabel>Condition</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select condition" /></SelectTrigger></FormControl>
                    <SelectContent>{CAR_CONDITIONS.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            
            {/* Image Upload and URL Section */}
            <div className="space-y-4">
              <FormLabel className="flex items-center text-lg font-semibold">
                <FileImage className="mr-2 h-5 w-5" /> Car Images (up to {MAX_IMAGE_UPLOADS} total)
              </FormLabel>
              <FormDescription>Upload new images or manually enter direct image URLs.</FormDescription>
              
              {/* File Upload Input */}
              <FormField
                control={form.control} // Not directly tied to RHF data, but for layout
                name="images" // Associate with images for error display
                render={() => (
                  <FormItem>
                    <FormLabel htmlFor="file-upload" className="sr-only">Upload Images</FormLabel>
                    <Input 
                      id="file-upload"
                      type="file" 
                      multiple 
                      accept="image/*" 
                      onChange={handleFileSelection}
                      className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                      disabled={isSubmitting || (form.getValues("images").length + filesToUpload.length >= MAX_IMAGE_UPLOADS)}
                    />
                     <FormMessage>{form.formState.errors.images?.root?.message || form.formState.errors.images?.message}</FormMessage>
                  </FormItem>
                )}
              />

              {/* Previews for selected files */}
              {filesToUpload.length > 0 && (
                <div className="space-y-3 mt-4">
                  <h3 className="text-md font-medium">Selected Files for Upload:</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {filesToUpload.map((file) => (
                      <div key={file.name} className="relative group border p-2 rounded-md shadow-sm">
                        <Image
                          src={imagePreviews.get(file.name) || "https://placehold.co/150x100.png"}
                          alt={`Preview ${file.name}`}
                          width={150}
                          height={100}
                          className="w-full h-24 object-cover rounded-md"
                        />
                        <p className="text-xs truncate mt-1">{file.name}</p>
                        {uploadProgresses.has(file.name) && (
                          <Progress value={uploadProgresses.get(file.name)} className="h-2 mt-1" />
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6 bg-background/70 hover:bg-destructive/20 rounded-full"
                          onClick={() => removeSelectedFile(file.name)}
                          disabled={isUploadingFiles || isSubmitting}
                          title="Remove file"
                        >
                          <XCircle className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Manual URL Inputs */}
              {imageUrlFields.map((field, index) => (
                <FormField
                  key={field.id}
                  control={form.control}
                  name={`images.${index}`}
                  render={({ field: itemField }) => (
                    <FormItem className="flex items-center gap-2">
                       <FormLabel htmlFor={`image-url-${index}`} className="sr-only">Image URL {index +1}</FormLabel>
                      <FormControl>
                        <Input
                          id={`image-url-${index}`}
                          placeholder="https://example.com/image.png"
                          {...itemField}
                          value={itemField.value || ""} 
                          onChange={(e) => updateImageUrl(index, e.target.value)}
                        />
                      </FormControl>
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeImageUrl(index)} title="Remove URL">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                       <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
              {(form.getValues("images").length + filesToUpload.length) < MAX_IMAGE_UPLOADS && (
                 <Button type="button" variant="outline" size="sm" onClick={() => appendImageUrl("")} className="mt-2">
                  <PlusCircle className="mr-2 h-4 w-4" />Add Image URL Manually
                </Button>
              )}
            </div>


            <div className="space-y-2">
              <FormLabel>Features</FormLabel>
              {featureFields.map((field, index) => (
                <FormField key={field.id} control={form.control} name={`features.${index}.value`} render={({ field: itemField }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl><Input placeholder="e.g., Sunroof, Leather Seats" {...itemField} /></FormControl>
                    {featureFields.length > 1 && <Button type="button" variant="ghost" size="icon" onClick={() => removeFeature(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
                     <FormMessage/>
                  </FormItem>
                )} />
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => appendFeature({ value: "" })}><PlusCircle className="mr-2 h-4 w-4" />Add Feature</Button>
            </div>

            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <div className="flex justify-between items-center">
                  <FormLabel>Description / Ad Copy</FormLabel>
                  <Button type="button" variant="outline" size="sm" onClick={handleGenerateAdCopy} disabled={isGeneratingCopy || isSubmitting}>
                    {isGeneratingCopy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    Generate with AI
                  </Button>
                </div>
                <FormControl><Textarea placeholder="Detailed description of the car..." {...field} rows={6} /></FormControl>
                <FormDescription>This will be shown on the car's detail page. You can use AI to help generate it.</FormDescription>
                <FormMessage />
              </FormItem>
            )} />

            <Button type="submit" disabled={isSubmitting || isUploadingFiles} className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
              {(isSubmitting || isUploadingFiles) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditMode ? "Save Changes" : "Add Car Listing"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
