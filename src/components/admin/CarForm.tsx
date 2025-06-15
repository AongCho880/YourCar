
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
import { PlusCircle, Trash2, Sparkles, Loader2, FileImage } from "lucide-react"; // Removed Upload, XCircle
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
// Removed Firebase Storage imports (storage, storageRef, uploadBytesResumable, getDownloadURL, deleteObject)
// Removed Image and Progress components as they were mainly for file uploads

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
  images: z.array(z.string().url("Must be a valid URL string.").min(1, "URL cannot be empty.")).min(1, "At least one image URL is required.").max(MAX_IMAGE_UPLOADS, `Maximum ${MAX_IMAGE_UPLOADS} image URLs allowed.`),
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
  
  // Removed state related to file uploads: filesToUpload, uploadProgresses, isUploadingFiles, imagePreviews

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
          images: [""], // Start with one empty URL field
          description: "",
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

  const watchedMake = form.watch("make");

  useEffect(() => {
    if (watchedMake !== ADD_NEW_MAKE_VALUE && form.getValues("customMakeName")) {
      form.setValue("customMakeName", "", { shouldValidate: true });
    }
  }, [watchedMake, form]);

  // Removed handleFileSelection and removeSelectedFile functions

  const onSubmit = async (data: CarFormValues) => {
    setIsSubmitting(true);

    // Filter out empty strings from image URLs
    const validImageUrls = data.images.filter(url => url && url.trim() !== "");

    if (validImageUrls.length === 0) {
        toast({ variant: "destructive", title: "No Image URLs", description: "Please provide at least one image URL." });
        setIsSubmitting(false);
        return;
    }
    if (validImageUrls.length > MAX_IMAGE_UPLOADS) {
        toast({ variant: "destructive", title: "Too Many Image URLs", description: `Please ensure total image URLs do not exceed ${MAX_IMAGE_UPLOADS}.` });
        setIsSubmitting(false);
        return;
    }
    
    data.images = validImageUrls; // Update form data with validated URLs

    const actualMake = data.make === ADD_NEW_MAKE_VALUE ? data.customMakeName! : data.make;
    const carDataToSave = {
      ...data,
      make: actualMake,
      features: data.features?.map(f => f.value).filter(Boolean) || [],
    };
    // @ts-expect-error customMakeName is not part of CarType
    delete carDataToSave.customMakeName;

    if (isEditMode && initialData) {
      await updateCar({ ...initialData, ...carDataToSave });
      toast({ title: "Success", description: "Car listing updated successfully." });
    } else {
      await addCar(carDataToSave as Omit<CarType, 'id' | 'createdAt' | 'updatedAt'>);
      toast({ title: "Success", description: "Car listing added successfully." });
    }
    
    router.push("/admin/dashboard");
    router.refresh();
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
  
  // Removed useEffect for cleaning up Object URLs

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
            
            {/* Image URL Section - Reverted to URL inputs only */}
            <div className="space-y-4">
              <FormLabel className="flex items-center text-lg font-semibold">
                <FileImage className="mr-2 h-5 w-5" /> Car Image URLs (up to {MAX_IMAGE_UPLOADS} total)
              </FormLabel>
              <FormDescription>Enter direct URLs for your car images.</FormDescription>
              
              {imageUrlFields.map((field, index) => (
                <FormField
                  key={field.id}
                  control={form.control}
                  name={`images.${index}`}
                  render={({ field: itemField }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Input
                          placeholder="https://example.com/image.png"
                          {...itemField}
                          value={itemField.value || ""} 
                        />
                      </FormControl>
                      {imageUrlFields.length > 1 && (
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeImageUrl(index)} title="Remove URL">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                       <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
              {imageUrlFields.length < MAX_IMAGE_UPLOADS && (
                <Button type="button" variant="outline" size="sm" onClick={() => appendImageUrl("")} className="mt-2">
                  <PlusCircle className="mr-2 h-4 w-4" />Add Image URL
                </Button>
              )}
              <FormMessage>{form.formState.errors.images?.root?.message || form.formState.errors.images?.message}</FormMessage>
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

            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditMode ? "Save Changes" : "Add Car Listing"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
