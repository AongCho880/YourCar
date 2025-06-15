
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
  // images field stores existing URLs (if editing) or manually added URLs.
  // Files selected for upload are handled separately and their URLs are merged on submit.
  images: z.array(z.string().url("Must be a valid URL.").min(1, "URL cannot be empty.")), 
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
  // This validation will be re-checked in onSubmit after files are uploaded and merged.
  if (data.images.length === 0) { 
    // This might trigger initially if no URLs are provided; main validation is post-upload.
    // To avoid premature error, we could check if filesToUpload is also empty.
    // For now, this will mainly catch if manual URLs are expected but not given.
  }
  if (data.images.length > MAX_IMAGE_UPLOADS) {
     ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Maximum ${MAX_IMAGE_UPLOADS} images allowed through manual URLs. Total images (uploads + URLs) also checked on submit.`,
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
  const [isSubmittingForm, setIsSubmittingForm] = useState(false); // Renamed from isSubmitting
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
          images: [], 
          description: "",
        },
  });

  const { fields: featureFields, append: appendFeature, remove: removeFeature } = useFieldArray({
    control: form.control,
    name: "features",
  });

  const { fields: imageUrlFields, append: appendImageUrl, remove: removeImageUrl, update: updateImageUrl } = useFieldArray({
    control: form.control,
    name: "images", // This RHF array tracks manually entered/existing URLs
  });

  const watchedMake = form.watch("make");

  useEffect(() => {
    if (watchedMake !== ADD_NEW_MAKE_VALUE && form.getValues("customMakeName")) {
      form.setValue("customMakeName", "", { shouldValidate: true });
    }
  }, [watchedMake, form]);

  const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    const currentManualUrlsCount = form.getValues("images").filter(url => url && url.trim() !== "").length;
    const currentFilesToUploadCount = filesToUpload.length;
    
    if (selectedFiles.length + currentManualUrlsCount + currentFilesToUploadCount > MAX_IMAGE_UPLOADS) {
      toast({
        variant: "destructive",
        title: "Too Many Images",
        description: `You can have a maximum of ${MAX_IMAGE_UPLOADS} images in total (uploaded + manual URLs).`,
      });
      event.target.value = ""; 
      return;
    }

    setFilesToUpload(prev => [...prev, ...selectedFiles]);

    selectedFiles.forEach(file => {
      const previewUrl = URL.createObjectURL(file);
      setImagePreviews(prev => new Map(prev).set(file.name, previewUrl));
    });
    event.target.value = ""; 
  };
  
  const removeSelectedFile = (fileName: string) => {
    setFilesToUpload(prev => prev.filter(f => f.name !== fileName));
    setImagePreviews(prev => {
      const newMap = new Map(prev);
      const urlToRevoke = newMap.get(fileName);
      if (urlToRevoke) URL.revokeObjectURL(urlToRevoke); 
      newMap.delete(fileName);
      return newMap;
    });
  };

  useEffect(() => {
    return () => {
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);


  const onSubmit = async (data: CarFormValues) => {
    setIsSubmittingForm(true);
    setIsUploadingFiles(filesToUpload.length > 0);

    const finalImageUrls: string[] = [...data.images.filter(url => url && url.trim() !== "")]; // Start with existing/manual URLs
    
    if (filesToUpload.length > 0) {
      const uploadPromises = filesToUpload.map(file => {
        const formData = new FormData();
        formData.append('file', file);
        
        setUploadProgresses(prev => new Map(prev).set(file.name, 0)); 

        return fetch('/api/upload', {
          method: 'POST',
          body: formData,
          // In a real app with progress from server:
          // onUploadProgress: (event) => { 
          //   const percent = Math.round((event.loaded * 100) / event.total);
          //   setUploadProgresses(prev => new Map(prev).set(file.name, percent));
          // }
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
          return result.imageUrl as string;
        })
        .catch(error => {
          console.error(`Error uploading ${file.name}:`, error);
          setUploadProgresses(prev => { // Keep showing failed file, maybe mark as failed
             const map = new Map(prev);
             map.set(file.name, -1); // -1 to indicate failure
             return map;
          });
          toast({ variant: "destructive", title: `Upload Failed: ${file.name}`, description: error.message });
          return null; 
        });
      });

      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter((url): url is string => url !== null);
      finalImageUrls.push(...successfulUploads);

      if (results.some(r => r === null)) { 
        setIsSubmittingForm(false);
        setIsUploadingFiles(false);
        // Do not clear filesToUpload, user might want to retry or remove them.
        // Failed files have progress -1.
        toast({ variant: "destructive", title: "Some Uploads Failed", description: "Please remove failed uploads or try again." });
        return; 
      }
    }
    setIsUploadingFiles(false);

    if (finalImageUrls.length === 0) {
      form.setError("images", { type: "manual", message: "At least one image (uploaded or URL) is required." });
      toast({ variant: "destructive", title: "No Images", description: "Please upload or provide at least one image URL." });
      setIsSubmittingForm(false);
      return;
    }
    if (finalImageUrls.length > MAX_IMAGE_UPLOADS) {
      form.setError("images", { type: "manual", message: `Maximum ${MAX_IMAGE_UPLOADS} images allowed in total.` });
      toast({ variant: "destructive", title: "Too Many Images", description: `Maximum ${MAX_IMAGE_UPLOADS} images allowed.` });
      setIsSubmittingForm(false);
      return;
    }

    const actualMake = data.make === ADD_NEW_MAKE_VALUE ? data.customMakeName! : data.make;
    
    const carDataToSave = {
      ...(isEditMode && initialData ? { id: initialData.id, createdAt: initialData.createdAt } : {}), // Keep id and createdAt if editing
      make: actualMake,
      model: data.model,
      year: data.year,
      price: data.price,
      mileage: data.mileage,
      condition: data.condition,
      features: data.features?.map(f => f.value).filter(Boolean) || [],
      images: finalImageUrls, 
      description: data.description,
      // `updatedAt` will be set by the backend API for both create and update.
      // `createdAt` is set by backend on create, preserved on update.
    };
    
    let success = false;
    let resultCar: CarType | null = null;

    if (isEditMode && initialData) {
      resultCar = await updateCar(carDataToSave as CarType); // Cast as CarType, backend handles timestamps
      if (resultCar) {
        success = true;
        toast({ title: "Success", description: "Car listing updated successfully." });
      }
    } else {
      // For addCar, Omit 'id', 'createdAt', 'updatedAt'
      const { id, createdAt, ...carDataForAdd } = carDataToSave as any; // Cast to remove id and createdAt
      resultCar = await addCar(carDataForAdd as Omit<CarType, 'id' | 'createdAt' | 'updatedAt'>);
      if (resultCar) {
        success = true;
        toast({ title: "Success", description: "Car listing added successfully." });
      }
    }
    
    if (success) {
      setFilesToUpload([]); 
      setImagePreviews(new Map());
      setUploadProgresses(new Map());
      form.reset(isEditMode && resultCar ? { // If editing and successful, reset with updated data
         ...resultCar,
          make: CAR_MAKES.includes(resultCar.make) ? resultCar.make : ADD_NEW_MAKE_VALUE,
          customMakeName: CAR_MAKES.includes(resultCar.make) ? "" : resultCar.make,
          features: resultCar.features?.map(f => ({ value: f })) || [{ value: "" }],
        } : undefined); // Otherwise, reset to default empty values
      if (!isEditMode) { // Only redirect on new car creation
          router.push("/admin/dashboard");
      }
      router.refresh(); 
    }
    setIsSubmittingForm(false);
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
                      disabled={isSubmittingForm || isUploadingFiles}
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
                                <Input placeholder="Type the new brand name" {...customMakeField} disabled={isSubmittingForm || isUploadingFiles} />
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
                <FormItem><FormLabel>Model</FormLabel><FormControl><Input placeholder="e.g., Camry, F-150" {...field} disabled={isSubmittingForm || isUploadingFiles} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="year" render={({ field }) => (
                <FormItem><FormLabel>Year</FormLabel><FormControl><Input type="number" placeholder="e.g., 2023" {...field} disabled={isSubmittingForm || isUploadingFiles} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="price" render={({ field }) => (
                <FormItem><FormLabel>Price ($)</FormLabel><FormControl><Input type="number" placeholder="e.g., 25000" {...field} disabled={isSubmittingForm || isUploadingFiles} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="mileage" render={({ field }) => (
                <FormItem><FormLabel>Mileage</FormLabel><FormControl><Input type="number" placeholder="e.g., 15000" {...field} disabled={isSubmittingForm || isUploadingFiles} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="condition" render={({ field }) => (
                <FormItem>
                  <FormLabel>Condition</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isSubmittingForm || isUploadingFiles}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select condition" /></SelectTrigger></FormControl>
                    <SelectContent>{CAR_CONDITIONS.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            
            <div className="space-y-4">
              <FormLabel className="flex items-center text-lg font-semibold">
                <FileImage className="mr-2 h-5 w-5" /> Car Images (up to {MAX_IMAGE_UPLOADS} total)
              </FormLabel>
              <FormDescription>Upload new images or manually enter direct image URLs. Existing images are shown as URLs.</FormDescription>
              
              <FormField
                control={form.control}
                name="images" 
                render={() => ( // No field directly needed here, errors are handled by form.setError
                  <FormItem>
                    <FormLabel htmlFor="file-upload" className="sr-only">Upload Images</FormLabel>
                    <Input 
                      id="file-upload"
                      type="file" 
                      multiple 
                      accept="image/*" 
                      onChange={handleFileSelection}
                      className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                      disabled={isSubmittingForm || isUploadingFiles || (form.getValues("images").length + filesToUpload.length >= MAX_IMAGE_UPLOADS)}
                    />
                     <FormMessage>{form.formState.errors.images?.root?.message || form.formState.errors.images?.message}</FormMessage>
                  </FormItem>
                )}
              />

              {filesToUpload.length > 0 && (
                <div className="space-y-3 mt-4">
                  <h3 className="text-md font-medium">New Files to Upload:</h3>
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
                        {uploadProgresses.get(file.name) === -1 && <p className="text-xs text-destructive">Upload failed</p>}
                        {typeof uploadProgresses.get(file.name) === 'number' && uploadProgresses.get(file.name)! >= 0 && (
                          <Progress value={uploadProgresses.get(file.name)} className="h-2 mt-1" />
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6 bg-background/70 hover:bg-destructive/20 rounded-full"
                          onClick={() => removeSelectedFile(file.name)}
                          disabled={isUploadingFiles || isSubmittingForm}
                          title="Remove file from selection"
                        >
                          <XCircle className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {imageUrlFields.length > 0 && (
                <div className="space-y-3 mt-4">
                  <h3 className="text-md font-medium">Current/Manual Image URLs:</h3>
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
                              onChange={(e) => updateImageUrl(index, e.target.value)} // Using RHF's update
                              disabled={isSubmittingForm || isUploadingFiles}
                            />
                          </FormControl>
                          <Button type="button" variant="ghost" size="icon" onClick={() => removeImageUrl(index)} title="Remove URL" disabled={isSubmittingForm || isUploadingFiles}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              )}
              {(form.getValues("images").length + filesToUpload.length) < MAX_IMAGE_UPLOADS && (
                 <Button type="button" variant="outline" size="sm" onClick={() => appendImageUrl("")} className="mt-2" disabled={isSubmittingForm || isUploadingFiles}>
                  <PlusCircle className="mr-2 h-4 w-4" />Add Image URL Manually
                </Button>
              )}
            </div>


            <div className="space-y-2">
              <FormLabel>Features</FormLabel>
              {featureFields.map((field, index) => (
                <FormField key={field.id} control={form.control} name={`features.${index}.value`} render={({ field: itemField }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl><Input placeholder="e.g., Sunroof, Leather Seats" {...itemField} disabled={isSubmittingForm || isUploadingFiles} /></FormControl>
                    {featureFields.length > 1 && <Button type="button" variant="ghost" size="icon" onClick={() => removeFeature(index)} disabled={isSubmittingForm || isUploadingFiles}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
                     <FormMessage/>
                  </FormItem>
                )} />
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => appendFeature({ value: "" })} disabled={isSubmittingForm || isUploadingFiles}><PlusCircle className="mr-2 h-4 w-4" />Add Feature</Button>
            </div>

            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <div className="flex justify-between items-center">
                  <FormLabel>Description / Ad Copy</FormLabel>
                  <Button type="button" variant="outline" size="sm" onClick={handleGenerateAdCopy} disabled={isGeneratingCopy || isSubmittingForm || isUploadingFiles}>
                    {isGeneratingCopy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    Generate with AI
                  </Button>
                </div>
                <FormControl><Textarea placeholder="Detailed description of the car..." {...field} rows={6} disabled={isSubmittingForm || isUploadingFiles} /></FormControl>
                <FormDescription>This will be shown on the car's detail page. You can use AI to help generate it.</FormDescription>
                <FormMessage />
              </FormItem>
            )} />

            <Button type="submit" disabled={isSubmittingForm || isUploadingFiles || isGeneratingCopy} className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
              {(isSubmittingForm || isUploadingFiles) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditMode ? "Save Changes" : "Add Car Listing"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
