"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from 'next/image';
import logo from '../assets/logo.png';
import "./index.css";

type AspectRatio = '1:1' | '16:9' | '9:16' | 'custom';

const SkeletonCard = () => <div className="skeleton-card"></div>;

const App = () => {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageLoadStatus, setImageLoadStatus] = useState<Record<string, 'loading' | 'loaded' | 'error'>>({});
  const [error, setError] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [isCustomPopoverOpen, setCustomPopoverOpen] = useState(false);
  const [customSize, setCustomSize] = useState({ width: "1024", height: "1024" });
  const [numOutputs, setNumOutputs] = useState(1);

  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setCustomPopoverOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [popoverRef]);

  const handleGenerateImage = async () => {
    if (!prompt) {
      setError("Please describe what you want to see.");
      return;
    }
    setLoading(true);
    setError(null);
    setGeneratedImages([]);
    setImageLoadStatus({});

    let width = 1024;
    let height = 1024;

    if (aspectRatio === '16:9') {
      width = 1920;
      height = 1080;
    } else if (aspectRatio === '9:16') {
      width = 1080;
      height = 1920;
    } else if (aspectRatio === 'custom') {
      width = parseInt(customSize.width, 10);
      height = parseInt(customSize.height, 10);
    }

    try {
      const response = await fetch("http://localhost:5000/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          width,
          height,
          num_outputs: numOutputs,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate image.");
      }

      const data = await response.json();
      setGeneratedImages(data.image_urls);
      const newImageLoadStatus: Record<string, 'loading' | 'loaded' | 'error'> = {};
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
      setCustomSize({ ...customSize, [e.target.name]: e.target.value });
      setAspectRatio('custom');
  };

  const handleDownload = (imageUrl: string) => {
    if (!imageUrl) return;
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = 'generated-image.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="app-container">
      <div className="logo-container">
        <Image src={logo} alt="Logo" width={100} height={100} />
      </div>
      <h1>What will you create?</h1>

      <div className="prompt-container">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe what you want to see"
          aria-label="Image prompt input"
        />
        <div className="prompt-controls">
          <div className="controls-left">
            {(['1:1', '16:9', '9:16'] as Exclude<AspectRatio, 'custom'>[]).map(ratio => (
              <button 
                key={ratio}
                className={`control-btn ${aspectRatio === ratio ? 'active' : ''}`}
                onClick={() => {
                  setAspectRatio(ratio);
                  setCustomPopoverOpen(false);
                }}
              >
                {ratio}
              </button>
            ))}
            <div className="custom-size-container" ref={popoverRef}>
              <button
                className={`control-btn ${aspectRatio === 'custom' ? 'active' : ''}`}
                onClick={() => setCustomPopoverOpen(prev => !prev)}
              >
                Custom
              </button>
              {isCustomPopoverOpen && (
                <div className="custom-size-popover">
                   <div className="popover-inputs">
                     <input 
                       type="number"
                       name="width"
                       value={customSize.width}
                       onChange={handleCustomSizeChange}
                       aria-label="Custom width"
                     />
                     <span>x</span>
                     <input 
                       type="number"
                       name="height"
                       value={customSize.height}
                       onChange={handleCustomSizeChange}
                       aria-label="Custom height"
                     />
                   </div>
                   <p className="popover-label">Width x Height</p>
                </div>
              )}
            </div>
          </div>
          <div className="controls-right">
            <div className="num-outputs-container">
              <label htmlFor="num-outputs">Number of images:</label>
              <select 
                id="num-outputs"
                value={numOutputs}
                onChange={(e) => setNumOutputs(parseInt(e.target.value, 10))}
                className="num-outputs-select"
              >
                {[1, 2, 3, 4].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <button className="generate-btn" onClick={handleGenerateImage} disabled={loading}>
              {loading ? "..." : "Generate"}
            </button>
          </div>
        </div>
      </div>

      <div className="output-container">
        {loading && (
            <div className={`images-grid ${numOutputs === 4 ? 'four-images' : ''}`}>
                {Array.from({ length: numOutputs }).map((_, index) => (
                    <SkeletonCard key={index} />
                ))}
            </div>
        )}
        {error && <div className="error-message" role="alert">{error}</div>}
        {!loading && !error && generatedImages.length === 0 && (
          <div className="placeholder">
            <p>Your generated images will appear here.</p>
          </div>
        )}
        {!loading && generatedImages.length > 0 && (
          <div className={`images-grid ${generatedImages.length === 4 ? 'four-images' : ''}`}>
            {generatedImages.map((image, index) => (
              <div key={index} className="image-wrapper">
                {imageLoadStatus[image] === 'loading' && <SkeletonCard />}
                <img
                  src={image}
                  alt={`${prompt} - ${index + 1}`}
                  style={{ display: imageLoadStatus[image] === 'loaded' ? 'block' : 'none' }}
                  onLoad={() => {
                    setImageLoadStatus(prev => ({...prev, [image]: 'loaded'}));
                  }}
                  onError={() => {
                    setImageLoadStatus(prev => ({...prev, [image]: 'error'}));
                  }}
                />
                {imageLoadStatus[image] === 'loaded' && (
                    <button onClick={() => handleDownload(image)} className="download-button">Download Image</button>
                )}
                 {imageLoadStatus[image] === 'error' && (
                    <div className="error-message">Failed to load</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
