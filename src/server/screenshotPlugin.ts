import type { Plugin, ViteDevServer } from 'vite';
import { fetchScreenshotUrl } from '../services/screenshotService';
import { loadEnv } from 'vite';

/**
 * Vite plugin to add screenshot API endpoint to dev server
 * Adds route: GET /api/screenshot?url=<encoded-url>
 */
export function screenshotPlugin(): Plugin {
  return {
    name: 'screenshot-api',
    configureServer(server: ViteDevServer) {
      // Load environment variables from .env file
      const env = loadEnv(server.config.mode, process.cwd(), '');
      // Make VITE_ prefixed vars available to server-side code
      Object.assign(process.env, env);
      server.middlewares.use(async (req, res, next) => {
        // Only handle /api/screenshot endpoint
        if (!req.url?.startsWith('/api/screenshot')) {
          return next();
        }

        // Parse URL and query parameters
        const url = new URL(req.url, `http://${req.headers.host}`);
        const targetUrl = url.searchParams.get('url');

        // Validate request
        if (!targetUrl) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            error: 'Missing required parameter: url',
            usage: '/api/screenshot?url=<encoded-url>'
          }));
          return;
        }

        try {
          console.log(`[Screenshot API] Request for: ${targetUrl}`);

          // Fetch screenshot from ScreenshotMachine
          const screenshotUrl = await fetchScreenshotUrl(targetUrl);

          if (!screenshotUrl) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              error: 'Failed to generate screenshot',
              url: targetUrl
            }));
            return;
          }

          // Return success response with screenshot URL
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            success: true,
            url: targetUrl,
            screenshotUrl,
            timestamp: new Date().toISOString()
          }));

        } catch (error) {
          console.error('[Screenshot API] Error:', error);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error'
          }));
        }
      });
    }
  };
}
