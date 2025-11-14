import crypto from 'crypto';

/**
 * Server-side screenshot service using ScreenshotMachine API
 * This keeps the API key secure on the server side
 */

interface ScreenshotOptions {
  dimension?: string;
  device?: 'desktop' | 'mobile' | 'tablet';
  format?: 'jpg' | 'png' | 'gif';
  cacheLimit?: string;
  delay?: string;
}

/**
 * Fetches a screenshot URL from the Screenshot Machine API
 * This function should ONLY run on the server side
 *
 * @param urlToCapture - The URL to take a screenshot of
 * @param options - Optional screenshot configuration
 * @returns Screenshot URL or null if failed
 */
export async function fetchScreenshotUrl(
  urlToCapture: string,
  options: ScreenshotOptions = {}
): Promise<string | null> {
  // Get API key from environment (server-side only)
  // Environment variables are loaded by the screenshot plugin
  const apiKey = process.env.VITE_SCREENSHOT_API_KEY;

  if (!apiKey || apiKey === 'PUT_YOUR_API_KEY_HERE') {
    console.error('[Screenshot Service] VITE_SCREENSHOT_API_KEY is not set in .env file');
    return null;
  }

  // Validate URL
  try {
    new URL(urlToCapture);
  } catch (error) {
    console.error('[Screenshot Service] Invalid URL:', urlToCapture);
    return null;
  }

  // Default options
  const {
    dimension = '1200x800',
    device = 'desktop',
    format = 'jpg',
    cacheLimit = '0',
    delay = '200'
  } = options;

  // Generate hash (required for paid plans, empty for free tier)
  const secretPhrase = ''; // Only needed for paid plans
  const hash = crypto.createHash('md5').update(urlToCapture + secretPhrase).digest('hex');

  // Build API request parameters
  const params = new URLSearchParams({
    key: apiKey,
    hash,
    url: urlToCapture,
    dimension,
    device,
    format,
    cacheLimit,
    delay
  });

  const apiUrl = `https://api.screenshotmachine.com/?${params.toString()}`;

  try {
    console.log(`[Screenshot Service] Fetching screenshot for: ${urlToCapture}`);

    const response = await fetch(apiUrl);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[Screenshot Service] API error - Status: ${response.status} for ${urlToCapture}`,
        errorText
      );
      return null;
    }

    // ScreenshotMachine returns the image directly, not JSON
    // The URL to the image is the API URL itself
    console.log(`[Screenshot Service] Screenshot generated successfully for: ${urlToCapture}`);
    return apiUrl;

  } catch (error) {
    console.error(`[Screenshot Service] Exception while fetching ${urlToCapture}:`, error);
    return null;
  }
}
