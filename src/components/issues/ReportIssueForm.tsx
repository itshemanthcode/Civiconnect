
"use client";

import { useState, useEffect, useRef } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { MapPin, Clock, Camera, AlertTriangle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { submitIssue } from '@/app/report-issue/actions'; // Will create this action
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


const reportIssueSchema = z.object({
  description: z.string().min(10, "Description must be at least 10 characters long."),
  image: z.any().optional(), // Basic handling for file input
});

type ReportIssueFormValues = z.infer<typeof reportIssueSchema>;

export default function ReportIssueForm() {
  const { toast } = useToast();
  const [gpsLocation, setGpsLocation] = useState<{ latitude: number | null, longitude: number | null, address?: string }>({ latitude: null, longitude: null });
  const [timestamp, setTimestamp] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);


  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<ReportIssueFormValues>({
    resolver: zodResolver(reportIssueSchema),
  });

  useEffect(() => {
    // Mock GPS and timestamp
    setGpsLocation({ latitude: 34.0522, longitude: -118.2437, address: "123 Main St, Anytown, CA" });
    setTimestamp(new Date().toLocaleString());

    // Attempt to get real GPS if permission is granted
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGpsLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude });
          // In a real app, you'd use a reverse geocoding service here
          // For now, keep the mock address or set to coords.
          setGpsLocation(prev => ({...prev, address: `Lat: ${position.coords.latitude.toFixed(4)}, Lon: ${position.coords.longitude.toFixed(4)}`}))
        },
        () => {
          console.warn("Geolocation permission denied or unavailable. Using mock data.");
        }
      );
    }
  }, []);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setValue('image', event.target.files);
    } else {
      setImagePreview(null);
      setValue('image', null);
    }
  };

  const onSubmit: SubmitHandler<ReportIssueFormValues> = async (data) => {
    setIsSubmitting(true);
    console.log("Form submitted with data (submission temporarily disabled for diagnostics):", data);
    
    // Temporarily disable actual submission to diagnose chunk loading error
    await new Promise(resolve => setTimeout(resolve, 700)); // Simulate network delay
    
    toast({
      title: "Submission Temporarily Disabled",
      description: "This form submission is currently disabled for diagnostic purposes.",
      variant: "default",
    });

    // Reset form state after simulated submission
    // reset();
    // setImagePreview(null);
    // setGpsLocation({ latitude: 34.0522, longitude: -118.2437, address: "123 Main St, Anytown, CA" }); // Reset mock
    // setTimestamp(new Date().toLocaleString()); // Reset timestamp

    setIsSubmitting(false);
    
    // Original submission logic (commented out for diagnostics):
    // try {
    //   const formData = new FormData();
    //   formData.append('description', data.description);
    //   if (data.image && data.image[0]) {
    //     formData.append('image', data.image[0]);
    //   }
    //   formData.append('latitude', gpsLocation.latitude?.toString() || '');
    //   formData.append('longitude', gpsLocation.longitude?.toString() || '');
    //   formData.append('address', gpsLocation.address || '');
    //   formData.append('timestamp', new Date().toISOString());

    //   const result = await submitIssue(formData);

    //   if (result.success) {
    //     toast({
    //       title: "Issue Reported Successfully!",
    //       description: `Type: ${result.aiAnalysis?.issueType}, Severity: ${result.aiAnalysis?.severity}`,
    //     });
    //     reset();
    //     setImagePreview(null);
    //   } else {
    //     throw new Error(result.error || "Failed to report issue.");
    //   }
    // } catch (error) {
    //   const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    //   toast({
    //     title: "Error Reporting Issue",
    //     description: errorMessage,
    //     variant: "destructive",
    //   });
    // } finally {
    //   setIsSubmitting(false);
    // }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Issue Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label htmlFor="description" className="mb-1 block">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Describe the issue in detail..."
              className="min-h-[120px]"
              aria-invalid={errors.description ? "true" : "false"}
            />
            {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
          </div>

          <div>
            <Label htmlFor="image" className="mb-1 block">Upload Image (Optional)</Label>
            <div className="flex items-center space-x-2">
              <Camera className="h-5 w-5 text-muted-foreground" />
              <Input
                id="image"
                type="file"
                accept="image/*"
                {...register("image")} // register image field
                onChange={handleImageChange} // use onChange to handle preview and set value
                className="file:text-primary file:font-semibold file:mr-2"
              />
            </div>
            {imagePreview && (
                <div className="mt-2 border rounded-md p-2">
                    <img src={imagePreview} alt="Preview" className="max-h-40 rounded-md mx-auto" data-ai-hint="issue image preview" />
                </div>
            )}
          </div>
          
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-primary" />
              <span>{gpsLocation.latitude ? `${gpsLocation.address || `Lat: ${gpsLocation.latitude.toFixed(4)}, Lon: ${gpsLocation.longitude.toFixed(4)}`}` : 'Fetching location...'}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-primary" />
              <span>{timestamp || 'Loading timestamp...'}</span>
            </div>
          </div>
          
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Report Issue"
            )}
          </Button>
        </form>
      </CardContent>
       {Object.keys(errors).length > 0 && (
        <CardFooter>
            <div className="text-destructive text-sm flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Please correct the errors above.
            </div>
        </CardFooter>
      )}
    </Card>
  );
}

