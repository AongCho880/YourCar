
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
import { PlusCircle, Trash2, Sparkles, Loader2, Upload, FileImage, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { storage } from "@/lib/firebaseConfig"; // Firebase Storage instance
import { ref as storageRef, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import Image from "next/image";
import { Progress } from "@/components/ui/progress";

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
  images: z.array(z.string().url("Must be a valid URL string")).min(1, "At least one image is required").max(MAX_IMAGE_UPLOADS, `Maximum ${MAX_IMAGE_UPLOADS} images allowed in total (uploaded + URLs).`),
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
          images: initialData.images || [], // Expecting string[]
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

  // useFieldArray for manually entered URLs
  const { fields: imageUrlFields, append: appendImageUrl, remove: removeImageUrl, replace: replaceImageUrls } = useFieldArray({
    control: form.control,
    name: "images",
  });

  const watchedMake = form.watch("make");
  const watchedImageUrls = form.watch("images"); // For displaying current URLs

  useEffect(() => {
    if (watchedMake !== ADD_NEW_MAKE_VALUE && form.getValues("customMakeName")) {
      form.setValue("customMakeName", "", { shouldValidate: true });
    }
  }, [watchedMake, form]);

  const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      const currentTotalImages = watchedImageUrls.length + filesToUpload.length;
      if (currentTotalImages + newFiles.length > MAX_IMAGE_UPLOADS) {
        toast({
          variant: "destructive",
          title: "Image Limit Exceeded",
          description: `You can upload a maximum of ${MAX_IMAGE_UPLOADS} images in total.`,
        });
        return;
      }
      setFilesToUpload(prevFiles => [...prevFiles, ...newFiles]);
      
      const newPreviews = new Map(imagePreviews);
      newFiles.forEach(file => {
        if (!newPreviews.has(file.name)) { // Avoid re-creating if already exists
            newPreviews.set(file.name, URL.createObjectURL(file));
        }
      });
      setImagePreviews(newPreviews);
    }
  };

  const removeSelectedFile = (fileName: string) => {
    setFilesToUpload(prevFiles => prevFiles.filter(file => file.name !== fileName));
    const newPreviews = new Map(imagePreviews);
    if (newPreviews.has(fileName)) {
        URL.revokeObjectURL(newPreviews.get(fileName)!);
        newPreviews.delete(fileName);
    }
    setImagePreviews(newPreviews);
    setUploadProgresses(prevProgresses => {
      const newProgresses = new Map(prevProgresses);
      newProgresses.delete(fileName);
      return newProgresses;
    });
  };
  
  // Function to handle removing a URL from the form's images array
  const handleRemoveImageUrlField = (index: number) => {
    removeImageUrl(index);
  };


  const onSubmit = async (data: CarFormValues) => {
    setIsSubmitting(true);
    setIsUploadingFiles(true);

    const uploadedFileUrls: string[] = [];
    const uploadPromises: Promise<void>[] = [];

    // Filter out empty strings from manually entered URLs before combining
    const manualUrls = data.images.filter(url => url && url.trim() !== "");

    if (filesToUpload.length + manualUrls.length === 0) {
        toast({ variant: "destructive", title: "No Images", description: "Please upload at least one image or provide an image URL." });
        setIsSubmitting(false);
        setIsUploadingFiles(false);
        return;
    }
    
    if (filesToUpload.length + manualUrls.length > MAX_IMAGE_UPLOADS) {
        toast({ variant: "destructive", title: "Too Many Images", description: `Please ensure total images (uploaded + URLs) do not exceed ${MAX_IMAGE_UPLOADS}.` });
        setIsSubmitting(false);
        setIsUploadingFiles(false);
        return;
    }


    filesToUpload.forEach(file => {
      const uniqueFileName = `car_images/${Date.now()}-${file.name}`;
      const fileRef = storageRef(storage, uniqueFileName);
      const uploadTask = uploadBytesResumable(fileRef, file);

      const promise = new Promise<void>((resolve, reject) => {
        uploadTask.on('state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgresses(prev => new Map(prev).set(file.name, progress));
          },
          (error) => {
            console.error("Upload failed for file:", file.name, error);
            toast({ variant: "destructive", title: `Upload Failed for ${file.name}`, description: error.message });
            reject(error);
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              uploadedFileUrls.push(downloadURL);
              resolve();
            } catch (error) {
              console.error("Failed to get download URL for file:", file.name, error);
              toast({ variant: "destructive", title: `Error getting URL for ${file.name}`});
              reject(error);
            }
          }
        );
      });
      uploadPromises.push(promise);
    });

    try {
      await Promise.all(uploadPromises);
      setIsUploadingFiles(false);

      const finalImageUrls = [...manualUrls, ...uploadedFileUrls];
      
      // Validate again after uploads, though initial check helps
      if (finalImageUrls.length === 0) {
        toast({ variant: "destructive", title: "No Images Provided", description: "At least one image is required." });
        setIsSubmitting(false);
        return;
      }
      if (finalImageUrls.length > MAX_IMAGE_UPLOADS) {
         toast({ variant: "destructive", title: "Image Limit Exceeded", description: `Maximum ${MAX_IMAGE_UPLOADS} images allowed. You have ${finalImageUrls.length}.` });
         setIsSubmitting(false);
         return;
      }
      
      data.images = finalImageUrls; // Update form data with final URLs

      const actualMake = data.make === ADD_NEW_MAKE_VALUE ? data.customMakeName! : data.make;
      const carDataToSave = {
        ...data,
        make: actualMake,
        features: data.features?.map(f => f.value).filter(Boolean) || [],
      };
      // @ts-expect-error customMakeName is not part of CarType
      delete carDataToSave.customMakeName;

      if (isEditMode && initialData) {
        updateCar({ ...initialData, ...carDataToSave });
        toast({ title: "Success", description: "Car listing updated successfully." });
      } else {
        addCar(carDataToSave as Omit<CarType, 'id' | 'createdAt' | 'updatedAt'>);
        toast({ title: "Success", description: "Car listing added successfully." });
      }
      
      // Clean up previews and reset state
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
      setImagePreviews(new Map());
      setFilesToUpload([]);
      setUploadProgresses(new Map());

      router.push("/admin/dashboard");
      router.refresh();

    } catch (error) {
      console.error("Failed to save car after uploads:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to save car listing after image uploads." });
    } finally {
      setIsSubmitting(false);
      setIsUploadingFiles(false);
    }
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
  
  useEffect(() => {
    // Clean up Object URLs when component unmounts or filesToUpload changes
    return () => {
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // imagePreviews dependency removed to avoid loop with revoke


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

              {/* File Upload Input */}
              <div className="p-4 border border-dashed border-border rounded-md hover:border-primary transition-colors">
                <FormLabel htmlFor="file-upload" className="flex flex-col items-center justify-center cursor-pointer">
                  <Upload className="mr-2 h-8 w-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Click to browse or drag & drop files</span>
                  <Input id="file-upload" type="file" multiple accept="image/*" onChange={handleFileSelection} className="hidden" />
                </FormLabel>
                 <FormDescription className="text-center mt-1">Max {MAX_IMAGE_UPLOADS} images. Upload new or add URLs below.</FormDescription>
              </div>

              {/* Display Selected Files for Upload */}
              {filesToUpload.length > 0 && (
                <div className="space-y-3 mt-4">
                  <h3 className="text-md font-medium">Selected Files for Upload:</h3>
                  {filesToUpload.map(file => (
                    <div key={file.name} className="flex items-center gap-3 p-2 border rounded-md bg-muted/50">
                       {imagePreviews.get(file.name) && (
                        <Image src={imagePreviews.get(file.name)!} alt={file.name} width={60} height={45} className="rounded object-cover" />
                       )}
                      <div className="flex-grow">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                        {uploadProgresses.has(file.name) && uploadProgresses.get(file.name)! < 100 && (
                          <Progress value={uploadProgresses.get(file.name)} className="h-2 mt-1" />
                        )}
                        {uploadProgresses.has(file.name) && uploadProgresses.get(file.name)! === 100 && (
                           <p className="text-xs text-green-600">Uploaded!</p>
                        )}
                      </div>
                      {!isUploadingFiles && (
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeSelectedFile(file.name)} title="Remove file">
                          <XCircle className="h-5 w-5 text-destructive" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {/* Display and Manage Image URLs from Form */}
              <div className="space-y-2 mt-4">
                 <h3 className="text-md font-medium">Manually Added Image URLs:</h3>
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
                                value={itemField.value || ""} // Ensure value is controlled
                            />
                            </FormControl>
                            <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveImageUrlField(index)} title="Remove URL">
                            <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
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
                <FormMessage>{form.formState.errors.images?.message}</FormMessage>
              </div>
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

