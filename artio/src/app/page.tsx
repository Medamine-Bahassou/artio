"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from 'next/image';
import { Loader2, Download, AlertCircle, Image as ImageIcon } from "lucide-react";

// Assuming logo is in public/assets
import logo from '@/assets/logo.png'; 

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import ImageCard from "@/components/ui/image-card";

type AspectRatio = '1:1' | '16:9' | '9:16' | 'custom';

const ImageGeneratorPage = () => {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageLoadStatus, setImageLoadStatus] = useState<Record<string, 'loading' | 'loaded' | 'error'>>({});
  const [error, setError] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [customSize, setCustomSize] = useState({ width: "1024", height: "1024" });
  const [numOutputs, setNumOutputs] = useState(1);
  const [displayedNumOutputs, setDisplayedNumOutputs] = useState(1); // New state for controlling grid
  const [scrolled, setScrolled] = useState(false); // New state to track scroll
  const [hasScrolledToResults, setHasScrolledToResults] = useState(false); // New state to control initial scroll

  const resultsRef = useRef<HTMLDivElement>(null); // Ref for the results section

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50; // Adjust this value as needed
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    document.addEventListener('scroll', handleScroll);

    // Scroll to results only once after images are generated
    if (generatedImages.length > 0 && resultsRef.current && !hasScrolledToResults) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setHasScrolledToResults(true); // Set to true after scrolling
    }

    return () => {
      document.removeEventListener('scroll', handleScroll);
    };
  }, [generatedImages, scrolled, hasScrolledToResults]); // Add hasScrolledToResults to dependencies

  const handleGenerateImage = async () => {
    if (!prompt) {
      setError("Please describe what you want to see.");
      return;
    }
    setLoading(true);
    setError(null);
    setGeneratedImages([]);
    setImageLoadStatus({});
    setDisplayedNumOutputs(numOutputs); // Update displayed number of outputs when generating
    setHasScrolledToResults(false); // Reset scroll state when generating new images

    let width = 1024;
    let height = 1024;

    if (aspectRatio === '16:9') {
      width = 1920;
      height = 1080;
    } else if (aspectRatio === '9:16') {
      width = 1080;
      height = 1920;
    } else if (aspectRatio === 'custom') {
      width = parseInt(customSize.width, 10) || 1024; // Default to 1024 if invalid
      height = parseInt(customSize.height, 10) || 1024; // Default to 1024 if invalid
      if (width <= 0 || height <= 0) {
        setError("Custom dimensions must be positive numbers.");
        setLoading(false);
        return;
      }
    }
    const apiUrl = process.env.API_URL;

    try {
      // Replace with your actual API endpoint
      const response = await fetch(`${apiUrl}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, width, height, num_outputs: numOutputs }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate image.");
      }

      const data = await response.json();
      setGeneratedImages(data.image_urls);
      const newImageLoadStatus: Record<string, 'loading'> = {};
      for (const url of data.image_urls) {
        newImageLoadStatus[url] = 'loading';
      }
      setImageLoadStatus(newImageLoadStatus);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleCustomSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const parsedValue = parseInt(value, 10);
    if (!isNaN(parsedValue) && parsedValue > 0) {
      setCustomSize({ ...customSize, [name]: value });
      setAspectRatio('custom');
    } else if (value === "") {
      setCustomSize({ ...customSize, [name]: "" });
      setAspectRatio('custom');
    }
  };

  const handleDownload = (imageUrl: string) => {
    if (!imageUrl) return;
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `generated-image-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex min-h-screen flex-col items-center">
      {/* Fixed Header for Prompt Input */}
      <div className={`fixed top-0 z-50 w-full  bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300 ease-in-out ${scrolled ? 'py-2 border-b' : 'py-4 sm:py-8'}`}>
        <div className={`container mx-auto flex items-center gap-4 px-4 ${scrolled ? 'flex-row justify-between' : 'flex-col justify-center'}`}>
          <div className={`flex items-center gap-4 ${scrolled ? 'flex-row' : 'flex-col'}`}>
            <Image src={logo} alt="Logo" width={scrolled ? 60 : 100} height={scrolled ? 40 : 100} className="transition-all duration-300 ease-in-out" key="app-logo" />
            <h1 className={`font-bold tracking-tight transition-all duration-300 ease-in-out ${scrolled ? 'hidden text-lg sm:text-xl' : 'text-2xl sm:text-3xl'}`}>
              What will you create?
            </h1>
          </div>
          <Card className={scrolled ? `w-full max-w-2xl transition-all duration-300 ease-in-out p-2` : `w-full max-w-2xl transition-all duration-300 ease-in-out  `}>
            <CardHeader className={scrolled ? 'hidden' : ''}>
              <CardTitle>Image Prompt</CardTitle>
              <CardDescription>Enter a detailed description of the image you want to generate.</CardDescription>
            </CardHeader>
            <CardContent className={scrolled ? 'flex items-center gap-4' : ''}>
              {
                scrolled ? 
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="A vibrant synthwave cityscape with a chrome sports car..."
                    rows={scrolled ? 1 : 4}
                    maxLength={500}
                    aria-label="Image prompt input"
                    className={scrolled ? 'resize-none flex-1 border-0 outline-none' : ''}
                  />

                : 
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="A vibrant synthwave cityscape with a chrome sports car..."
                    rows={scrolled ? 1 : 4}
                    maxLength={500}
                    aria-label="Image prompt input"
                    className={scrolled ? 'resize-none flex-1 border-0 outline-none' : ''}
                  />

              }
              
              {prompt && (
                <Button 
                  variant="ghost" 
                  onClick={() => setPrompt("")} 
                  className={`mt-2 ${scrolled ? 'hidden' : ''}`}
                >
                  Clear Prompt
                </Button>
              )}
              {scrolled && (
                <Button onClick={handleGenerateImage} disabled={loading || !prompt}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {loading ? "Generating..." : "Generate"}
                </Button>
              )}
            </CardContent>
            <CardFooter className={`flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between ${scrolled ? 'hidden' : ''}`}>
              <div className="flex flex-wrap items-center gap-2">
                <ToggleGroup
                  type="single"
                  value={aspectRatio !== 'custom' ? aspectRatio : ''}
                  onValueChange={(value: AspectRatio) => {
                    if (value) setAspectRatio(value);
                  }}
                  aria-label="Aspect Ratio"
                >
                  <ToggleGroupItem value="1:1" aria-label="Aspect ratio 1:1">1:1</ToggleGroupItem>
                  <ToggleGroupItem value="16:9" aria-label="Aspect ratio 16:9">16:9</ToggleGroupItem>
                  <ToggleGroupItem value="9:16" aria-label="Aspect ratio 9:16">9:16</ToggleGroupItem>
                </ToggleGroup>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant={aspectRatio === 'custom' ? 'secondary' : 'outline'}>Custom</Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-4">
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <h4 className="font-medium leading-none">Custom Dimensions</h4>
                        <p className="text-sm text-muted-foreground">Set a custom width and height.</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input id="width" name="width" type="number" value={customSize.width} onChange={handleCustomSizeChange} className="w-24" aria-label="Custom width" />
                        <span className="text-muted-foreground">x</span>
                        <Input id="height" name="height" type="number" value={customSize.height} onChange={handleCustomSizeChange} className="w-24" aria-label="Custom height" />
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex w-full items-center gap-4 sm:w-auto">
                <Select 
                  value={String(numOutputs)}
                  onValueChange={(value) => setNumOutputs(parseInt(value, 10))}
                >
                  <SelectTrigger className="w-28" aria-label="Number of images">
                    <SelectValue placeholder="Images" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4].map(n => (
                      <SelectItem key={n} value={String(n)}>{n} Image{n > 1 ? 's' : ''}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleGenerateImage} disabled={loading || !prompt} className="flex-1 sm:flex-none">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {loading ? "Generating..." : "Generate"}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Main Content Area - Adjusted padding-top to account for fixed header */}
      <div className={`mt-50 container mx-auto flex flex-col items-center gap-8 p-4 sm:p-8 ${scrolled ? 'pt-[100px] sm:pt-[120px]' : 'pt-[350px] sm:pt-[380px]'}`}>
        <div ref={resultsRef} className="w-full max-w-4xl">
          {error && (
            <Alert variant="destructive" className="mb-4 mx-auto max-w-2xl">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Generation Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading && (
            <div className={`grid gap-4 max-w-2xl mx-auto ${displayedNumOutputs === 1 ? 'grid-cols-1' : displayedNumOutputs === 2 ? 'grid-cols-1 sm:grid-cols-2' : displayedNumOutputs === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2'}`}>
              {Array.from({ length: displayedNumOutputs }).map((_, index) => (
                <Skeleton key={index} className="aspect-square w-full rounded-lg" />
              ))}
            </div>
          )}
          
          {!loading && generatedImages.length > 0 && (
            <div className={`grid gap-4 max-w-2xl mx-auto ${displayedNumOutputs === 1 ? 'grid-cols-1' : displayedNumOutputs === 2 ? 'grid-cols-1 sm:grid-cols-2' : displayedNumOutputs === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2'}`}>
              {generatedImages.map((image, index) => (
                <ImageCard key={index} url={image} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageGeneratorPage;
