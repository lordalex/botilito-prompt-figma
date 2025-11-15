import React, { useState, useEffect } from 'react';
import { useAuth } from '../providers/AuthProvider';
import { ErrorManager } from './ErrorManager';
import { Label } from './ui/label';

interface ScreenshotImageProps {
  submittedUrl: string | null;
  width?: number;
  height?: number;
  onImageLoad: (base64: string | null) => void;
}

export function ScreenshotImage({ submittedUrl, width, height, onImageLoad }: ScreenshotImageProps) {
  const { supabase } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<{ message: string } | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!submittedUrl) {
      setIsLoading(false);
      setError(null);
      onImageLoad(null);
      return;
    }

    const fetchScreenshot = async () => {
      setIsLoading(true);
      setError(null);

      const dimension = (width && height) ? `${width}x${height}` : '1200x800';

      try {
        const { data: responseData, error: functionError } = await supabase.functions.invoke('screenshotURL', {
          body: { url: submittedUrl, dimension: dimension },
        });

        if (functionError) {
          throw new Error(`Function invocation failed: ${functionError.message}`);
        }

        // The 'invoke' function can return the JSON as a Blob.
        // We must handle this by checking the type and parsing if necessary.
        let parsedData;
        if (responseData instanceof Blob) {
          const text = await responseData.text();
          parsedData = JSON.parse(text);
        } else {
          parsedData = responseData;
        }
        
        if (parsedData && parsedData.success && parsedData.base64) {
          // Log the cache status from the function's response
          console.log(`[ScreenshotImage] Successfully received Base64. Cached: ${parsedData.cached}`);
          onImageLoad(parsedData.base64);
        } else {
          throw new Error(parsedData.error || 'The function did not return a valid Base64 string.');
        }

      } catch (err: any) {
        console.error("[ScreenshotImage] An error occurred while fetching the screenshot:", err);
        setError({ message: err.message });
      } finally {
        setIsLoading(false);
      }
    };

    fetchScreenshot();
  }, [submittedUrl, supabase, retryCount, onImageLoad, width, height]);

  const handleRetry = () => {
    setRetryCount(count => count + 1);
  };

  const handleResetError = () => {
    setError(null);
    onImageLoad(null);
  };

  if (error) {
    return (
      <div className="p-4 bg-secondary/30 border-2 border-secondary/60 rounded-lg space-y-3">
        <ErrorManager error={error} onRetry={handleRetry} onReset={handleResetError} />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div>
        <Label>Captura de la noticia:</Label>
        <div className="mt-2 rounded-lg overflow-hidden border-2 border-secondary/40 relative h-40 md:h-48">
          <div className="w-full h-full bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 animate-pulse flex items-center justify-center">
            <div className="text-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto"></div>
              <p className="text-xs text-gray-600">Generando y cacheando captura...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}