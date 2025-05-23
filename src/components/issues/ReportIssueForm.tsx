
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
import { submitIssue } from '@/app/report-issue/actions'; 
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
  const [mapUrl, setMapUrl] = useState<string | null>(null);
  // Removed hasCameraPermission and videoRef as they were unused.

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<ReportIssueFormValues>({
    resolver: zodResolver(reportIssueSchema),
  });

  useEffect(() => {
    const initialMockLat = 34.0522;
    const initialMockLon = -118.2437;
    const defaultZoomLevel = 18; 
    
    // Set initial mock location and timestamp
    setGpsLocation({ latitude: initialMockLat, longitude: initialMockLon, address: "123 Main St, Anytown, CA" });
    setTimestamp(new Date().toLocaleString());
    // Set initial map URL based on mock data, will be overwritten by real GPS if available
    setMapUrl(`https://www.openstreetmap.org/export/embed.html?layer=mapnik&marker=${initialMockLat},${initialMockLon}#map=${defaultZoomLevel}/${initialMockLat}/${initialMockLon}`);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          setGpsLocation({ latitude: lat, longitude: lon, address: `Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}` });
          // Update map URL with real coordinates
          setMapUrl(`https://www.openstreetmap.org/export/embed.html?layer=mapnik&marker=${lat},${lon}#map=${defaultZoomLevel}/${lat}/${lon}`);
        },
        (error) => {
          console.warn("Geolocation permission denied or unavailable. Using mock data.", error);
          toast({
            title: "Location Error",
            description: "Could not access your location. Displaying default map.",
            variant: "destructive"
          });
          // Stick with the initial mock map/location if permission denied.
          setMapUrl(`https://www.openstreetmap.org/export/embed.html?layer=mapnik&marker=${initialMockLat},${initialMockLon}#map=${defaultZoomLevel}/${initialMockLat}/${initialMockLon}`);
        }
      );
    } else {
      console.warn("Geolocation not supported by this browser. Using mock data.");
      toast({
        title: "Location Not Supported",
        description: "Geolocation is not supported by your browser. Displaying default map.",
        variant: "destructive"
      });
      // Stick with the initial mock map/location if geolocation not supported.
      setMapUrl(`https://www.openstreetmap.org/export/embed.html?layer=mapnik&marker=${initialMockLat},${initialMockLon}#map=${defaultZoomLevel}/${initialMockLat}/${initialMockLon}`);
    }
  }, [toast]);

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
    
    try {
      const formData = new FormData();
      formData.append('description', data.description);
      if (data.image && data.image[0]) {
        formData.append('image', data.image[0]);
      }
      formData.append('latitude', gpsLocation.latitude?.toString() || '');
      formData.append('longitude', gpsLocation.longitude?.toString() || '');
      formData.append('address', gpsLocation.address || '');
      formData.append('timestamp', new Date().toISOString());

      // Re-enable the actual submitIssue call
      const result = await submitIssue(formData);

      if (result.success) {
        toast({
          title: "Issue Reported Successfully!",
          description: `Issue ID: ${result.issueId}. Thank you for your report. ${result.aiAnalysis ? `AI Type: ${result.aiAnalysis.issueType}, Severity: ${result.aiAnalysis.severity}` : '(AI analysis pending/failed)'}`,
        });
        reset();
        setImagePreview(null);
        // Reset GPS, timestamp and map to initial mock state after successful submission
        const initialMockLat = 34.0522;
        const initialMockLon = -118.2437;
        const defaultZoomLevel = 18; 
        setGpsLocation({ latitude: initialMockLat, longitude: initialMockLon, address: "123 Main St, Anytown, CA" });
        setTimestamp(new Date().toLocaleString());
        setMapUrl(`https://www.openstreetmap.org/export/embed.html?layer=mapnik&marker=${initialMockLat},${initialMockLon}#map=${defaultZoomLevel}/${initialMockLat}/${initialMockLon}`);

      } else {
        throw new Error(result.error || "Failed to report issue.");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({
        title: "Error Reporting Issue",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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
                {...register("image")} 
                onChange={handleImageChange} 
                className="file:text-primary file:font-semibold file:mr-2"
              />
            </div>
            {imagePreview && (
                <div className="mt-2 border rounded-md p-2">
                    <img src={imagePreview} alt="Preview" className="max-h-40 rounded-md mx-auto" data-ai-hint="issue image preview" />
                </div>
            )}
          </div>
          
          <div className="space-y-4">
            <Label className="font-semibold">Location Details</Label>
            <p className="text-xs text-muted-foreground -mt-1 mb-2">Location is based on your browser/device. Accuracy may vary.</p>
            <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-primary flex-shrink-0" />
                <span className="truncate">{gpsLocation.latitude ? `${gpsLocation.address || `Lat: ${gpsLocation.latitude.toFixed(4)}, Lon: ${gpsLocation.longitude.toFixed(4)}`}` : 'Fetching location...'}</span>
                </div>
                <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-primary flex-shrink-0" />
                <span>{timestamp || 'Loading timestamp...'}</span>
                </div>
            </div>
            
            {mapUrl ? (
              <div className="border rounded-md overflow-hidden aspect-video shadow">
                <iframe
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  src={mapUrl}
                  title="Issue Location Map"
                  className="rounded-md"
                  loading="lazy"
                ></iframe>
              </div>
            ) : (
              <div className="p-4 border rounded-md text-muted-foreground text-center bg-muted/50">
                Map preview will appear here once location is determined.
              </div>
            )}
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

