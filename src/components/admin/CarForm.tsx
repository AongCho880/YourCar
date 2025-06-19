
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
  images: z.array(z.string().url("Must be a valid URL.").min(1, "URL cannot be empty."))
             .min(1, "At least one image URL is required.")
             .max(MAX_IMAGE_UPLOADS, `Maximum ${MAX_IMAGE_UPLOADS} image URLs allowed.`),
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
  
  const form = useForm<CarFormValues>({
    resolver: zodResolver(carFormSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          make: CAR_MAKES.includes(initialData.make) ? initialData.make : ADD_NEW_MAKE_VALUE,
          customMakeName: CAR_MAKES.includes(initialData.make) ? "" : initialData.make,
          features: initialData.features?.map(f => ({ value: f })) || [{ value: "" }],
          images: initialData.images || [], 
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
    toast({
      variant: "default",
      title: "File Upload Not Available",
      description: "Direct file upload is temporarily disabled. Please use the 'Add Image URL' fields to provide links to externally hosted images.",
    });
    if (event.target) {
      event.target.value = "";
    }
  };

  const onSubmit = async (data: CarFormValues) => {
    setIsSubmittingForm(true);

    const finalImageUrls: string[] = data.images.filter(url => url && url.trim() !== "");

    if (finalImageUrls.length === 0) {
      form.setError("images", { type: "manual", message: "At least one image URL is required." });
      toast({ variant: "destructive", title: "No Image URLs", description: "Please provide at least one image URL." });
      setIsSubmittingForm(false);
      return;
    }
    if (finalImageUrls.length > MAX_IMAGE_UPLOADS) {
      form.setError("images", { type: "manual", message: `Maximum ${MAX_IMAGE_UPLOADS} image URLs allowed.` });
      toast({ variant: "destructive", title: "Too Many Image URLs", description: `Maximum ${MAX_IMAGE_UPLOADS} image URLs allowed.` });
      setIsSubmittingForm(false);
      return;
    }

    const actualMake = data.make === ADD_NEW_MAKE_VALUE ? data.customMakeName! : data.make;
    
    const carDataPayload = {
      make: actualMake,
      model: data.model,
      year: data.year,
      price: data.price,
      mileage: data.mileage,
      condition: data.condition,
      features: data.features?.map(f => f.value).filter(Boolean) || [],
      images: finalImageUrls, 
      description: data.description,
      isSold: data.isSold ?? false,
    };
    
    let success = false;
    let resultCar: CarType | null = null;

    if (isEditMode && initialData) {
      resultCar = await updateCar({ ...carDataPayload, id: initialData.id });
    } else {
      resultCar = await addCar(carDataPayload);
    }
    
    if (resultCar) { 
      success = true;
      form.reset(isEditMode && resultCar ? {
         ...resultCar, 
          make: CAR_MAKES.includes(resultCar.make) ? resultCar.make : ADD_NEW_MAKE_VALUE,
          customMakeName: CAR_MAKES.includes(resultCar.make) ? "" : resultCar.make,
          features: resultCar.features?.map(f => ({ value: f })) || [{ value: "" }],
          images: resultCar.images || [],
          isSold: resultCar.isSold ?? false,
        } : { 
          make: "", customMakeName: "", model: "", year: new Date().getFullYear(), 
          price: 0, mileage: 0, condition: undefined, features: [{ value: "" }],
          images: [], description: "", isSold: false,
        }); 
      if (!isEditMode) {
          router.push("/admin/dashboard");
      }
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
                      disabled={isSubmittingForm}
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
                                <Input placeholder="Type the new brand name" {...customMakeField} disabled={isSubmittingForm} />
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
                <FormItem><FormLabel>Model</FormLabel><FormControl><Input placeholder="e.g., Camry, F-150" {...field} disabled={isSubmittingForm} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="year" render={({ field }) => (
                <FormItem><FormLabel>Year</FormLabel><FormControl><Input type="number" placeholder="e.g., 2023" {...field} disabled={isSubmittingForm} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="price" render={({ field }) => (
                <FormItem><FormLabel>Price ($)</FormLabel><FormControl><Input type="number" placeholder="e.g., 25000" {...field} disabled={isSubmittingForm} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="mileage" render={({ field }) => (
                <FormItem><FormLabel>Mileage</FormLabel><FormControl><Input type="number" placeholder="e.g., 15000" {...field} disabled={isSubmittingForm} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="condition" render={({ field }) => (
                <FormItem>
                  <FormLabel>Condition</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isSubmittingForm}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select condition" /></SelectTrigger></FormControl>
                    <SelectContent>{CAR_CONDITIONS.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            
             <FormField
                control={form.control}
                name="isSold"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm bg-muted/30">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base flex items-center">
                        {field.value ? <PackageX className="mr-2 h-5 w-5 text-destructive" /> : <PackageCheck className="mr-2 h-5 w-5 text-green-600" />}
                        Availability Status
                      </FormLabel>
                      <FormDescription>
                        {field.value ? "This car is marked as SOLD." : "This car is currently AVAILABLE."}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isSubmittingForm}
                        aria-label="Mark as sold"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            
            <div className="space-y-4">
              <FormLabel className="text-lg font-semibold flex items-center">
                <FileImage className="mr-2 h-5 w-5" /> Car Images
              </FormLabel>
              
              <div className="space-y-2">
                <FormLabel htmlFor="file-upload-input" className="text-sm font-medium">Upload Images (Currently Disabled)</FormLabel>
                <div className="flex items-center gap-2 p-4 border border-dashed rounded-md">
                    <UploadCloud className="w-8 h-8 text-muted-foreground" />
                    <div>
                        <Input
                        id="file-upload-input"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileSelection}
                        className="hidden"
                        ref={fileInputRef}
                        disabled={isSubmittingForm}
                        />
                        <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isSubmittingForm}>
                            Select Files
                        </Button>
                        <p className="text-xs text-muted-foreground mt-1">
                        Direct upload is disabled. Please use URL fields below.
                        </p>
                    </div>
                </div>
              </div>

              <div className="space-y-3">
                <FormLabel className="text-sm font-medium">Image URLs (up to {MAX_IMAGE_UPLOADS} total)</FormLabel>
                <FormDescription>
                  Provide publicly accessible URLs for your car images. Ensure these URLs are correct and the images are hosted.
                </FormDescription>
                
                <FormField
                  control={form.control}
                  name="images"
                  render={() => (
                    <FormItem>
                       <FormMessage>{form.formState.errors.images?.root?.message || form.formState.errors.images?.message}</FormMessage>
                    </FormItem>
                  )}
                />
                
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
                            disabled={isSubmittingForm}
                          />
                        </FormControl>
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeImageUrl(index)} title="Remove URL" disabled={isSubmittingForm}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
                {imageUrlFields.length < MAX_IMAGE_UPLOADS && (
                   <Button type="button" variant="outline" size="sm" onClick={() => appendImageUrl("")} className="mt-2" disabled={isSubmittingForm}>
                    <PlusCircle className="mr-2 h-4 w-4" />Add Image URL
                  </Button>
                )}
                 {!imageUrlFields.length && form.formState.isSubmitted && form.formState.errors.images && (
                  <p className="text-sm font-medium text-destructive">{form.formState.errors.images.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <FormLabel>Features</FormLabel>
              {featureFields.map((field, index) => (
                <FormField key={field.id} control={form.control} name={`features.${index}.value`} render={({ field: itemField }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl><Input placeholder="e.g., Sunroof, Leather Seats" {...itemField} disabled={isSubmittingForm} /></FormControl>
                    {featureFields.length > 1 && <Button type="button" variant="ghost" size="icon" onClick={() => removeFeature(index)} disabled={isSubmittingForm}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
                     <FormMessage/>
                  </FormItem>
                )} />
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => appendFeature({ value: "" })} disabled={isSubmittingForm}><PlusCircle className="mr-2 h-4 w-4" />Add Feature</Button>
            </div>

            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <div className="flex justify-between items-center">
                  <FormLabel>Description / Ad Copy</FormLabel>
                  <Button type="button" variant="outline" size="sm" onClick={handleGenerateAdCopy} disabled={isGeneratingCopy || isSubmittingForm}>
                    {isGeneratingCopy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    Generate with AI
                  </Button>
                </div>
                <FormControl><Textarea placeholder="Detailed description of the car..." {...field} rows={6} disabled={isSubmittingForm} /></FormControl>
                <FormDescription>This will be shown on the car's detail page. You can use AI to help generate it.</FormDescription>
                <FormMessage />
              </FormItem>
            )} />

            <Button type="submit" disabled={isSubmittingForm || isGeneratingCopy} className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
              {isSubmittingForm && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditMode ? "Save Changes" : "Add Car Listing"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

