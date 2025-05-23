
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
import { MapPin, Clock, Camera, AlertTriangle, Loader2, Video, UploadCloud, XCircle, FileImage } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { submitIssue } from '@/app/report-issue/actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const reportIssueSchema = z.object({
  description: z.string().min(10, "Description must be at least 10 characters long."),
  image: z.any().optional(), // Handles FileList or a single File
});

type ReportIssueFormValues = z.infer<typeof reportIssueSchema>;

export default function ReportIssueForm() {
  const { toast } = useToast();
  const [gpsLocation, setGpsLocation] = useState<{ latitude: number | null, longitude: number | null, address?: string }>({ latitude: null, longitude: null });
  const [timestamp, setTimestamp] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [mapUrl, setMapUrl] = useState<string | null>(null);

  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isCameraView, setIsCameraView] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<ReportIssueFormValues>({
    resolver: zodResolver(reportIssueSchema),
  });

  const currentImageValue = watch('image');

  useEffect(() => {
    const initialMockLat = 34.0522;
    const initialMockLon = -118.2437;
    const defaultZoomLevel = 18;

    setGpsLocation({ latitude: initialMockLat, longitude: initialMockLon, address: "123 Main St, Anytown, CA" });
    setTimestamp(new Date().toLocaleString());
    setMapUrl(`https://www.openstreetmap.org/export/embed.html?layer=mapnik&marker=${initialMockLat},${initialMockLon}#map=${defaultZoomLevel}/${initialMockLat}/${initialMockLon}`);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          setGpsLocation({ latitude: lat, longitude: lon, address: `Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}` });
          setMapUrl(`https://www.openstreetmap.org/export/embed.html?layer=mapnik&marker=${lat},${lon}#map=${defaultZoomLevel}/${lat}/${lon}`);
        },
        (error) => {
          console.warn("Geolocation permission denied or unavailable. Using mock data.", error);
          toast({
            title: "Location Error",
            description: "Could not access your location. Displaying default map.",
            variant: "destructive"
          });
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
      setMapUrl(`https://www.openstreetmap.org/export/embed.html?layer=mapnik&marker=${initialMockLat},${initialMockLon}#map=${defaultZoomLevel}/${initialMockLat}/${initialMockLon}`);
    }
  }, [toast]);

  useEffect(() => {
    if (isCameraView) {
      const getCameraPermission = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          setHasCameraPermission(true);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error('Error accessing camera:', error);
          setHasCameraPermission(false);
          toast({
            variant: 'destructive',
            title: 'Camera Access Denied',
            description: 'Please enable camera permissions in your browser settings.',
          });
          setIsCameraView(false); // Switch back to file upload if camera fails
        }
      };
      getCameraPermission();
    } else {
      // Stop camera stream when switching away
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    }
  }, [isCameraView, toast]);


  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setValue('image', event.target.files); // RHF expects FileList
      if (isCameraView) setIsCameraView(false); // Switch view if file is selected
    } else {
      // This part might not be reached if a file is simply cleared by the input
      // clearPhoto();
    }
  };

  const handleTakePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUri = canvas.toDataURL('image/jpeg');
        setImagePreview(dataUri);

        // Convert data URI to File object
        fetch(dataUri)
          .then(res => res.blob())
          .then(blob => {
            const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
            setValue('image', file); // RHF can handle single File
          });
      }
    }
  };
  
  const clearPhoto = () => {
    setImagePreview(null);
    setValue('image', null); // Clear the image in react-hook-form
    const fileInput = document.getElementById('image-input') as HTMLInputElement;
    if (fileInput) {
        fileInput.value = ''; // Reset the file input
    }
    if (isCameraView && videoRef.current && videoRef.current.srcObject) {
        // Keep camera running if in camera view
    }
  };

  const onSubmit: SubmitHandler<ReportIssueFormValues> = async (data) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('description', data.description);
      
      // data.image could be a FileList or a single File object
      const imageFile = data.image instanceof FileList ? data.image[0] : data.image;

      if (imageFile) {
        formData.append('image', imageFile);
      }
      formData.append('latitude', gpsLocation.latitude?.toString() || '');
      formData.append('longitude', gpsLocation.longitude?.toString() || '');
      formData.append('address', gpsLocation.address || '');
      formData.append('timestamp', new Date().toISOString());

      const result = await submitIssue(formData);

      if (result.success) {
        toast({
          title: "Issue Reported Successfully!",
          description: `Issue ID: ${result.issueId}. Thank you for your report. ${result.aiAnalysis ? `AI Type: ${result.aiAnalysis.issueType}, Severity: ${result.aiAnalysis.severity}` : ''}`,
        });
        reset();
        clearPhoto();
        if (isCameraView) setIsCameraView(false); // Optionally switch back to file view
        
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
            <Label className="mb-1 block">Issue Image</Label>
            <div className="flex space-x-2 mb-2">
                <Button type="button" variant={isCameraView ? "secondary" : "default"} onClick={() => setIsCameraView(false)} className="flex-1">
                    <UploadCloud className="mr-2 h-4 w-4" /> Upload File
                </Button>
                <Button type="button" variant={!isCameraView ? "secondary" : "default"} onClick={() => setIsCameraView(true)} className="flex-1">
                    <Camera className="mr-2 h-4 w-4" /> Use Camera
                </Button>
            </div>

            {!isCameraView && (
              <div>
                <Label htmlFor="image-input" className="sr-only">Upload Image from File</Label>
                <Input
                  id="image-input"
                  type="file"
                  accept="image/*"
                  {...register("image")} // Register here for file input
                  onChange={handleImageChange}
                  className="file:text-primary file:font-semibold file:mr-2"
                />
              </div>
            )}
            
            {isCameraView && (
              <div className="space-y-2">
                <video ref={videoRef} className="w-full aspect-video rounded-md bg-muted" autoPlay muted playsInline />
                <canvas ref={canvasRef} className="hidden" />
                {hasCameraPermission === false && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Camera Access Denied</AlertTitle>
                    <AlertDescription>
                      Please allow camera access in your browser settings to use this feature.
                    </AlertDescription>
                  </Alert>
                )}
                {hasCameraPermission && (
                  <Button type="button" onClick={handleTakePhoto} className="w-full" variant="outline">
                    <Camera className="mr-2 h-4 w-4" /> Take Photo
                  </Button>
                )}
              </div>
            )}

            {imagePreview && (
              <div className="mt-4 border rounded-md p-2 relative">
                <img src={imagePreview} alt="Preview" className="max-h-60 rounded-md mx-auto" data-ai-hint="issue image preview" />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={clearPhoto}
                  className="absolute top-1 right-1 bg-background/70 hover:bg-background rounded-full h-7 w-7"
                  aria-label="Clear photo"
                >
                  <XCircle className="h-5 w-5 text-destructive" />
                </Button>
              </div>
            )}
             {errors.image && <p className="text-sm text-destructive mt-1">{errors.image.message?.toString()}</p>}
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
