```
#!/bin/bash

# =============================================================
#
#  Vite SSR Screenshot Component Project Builder
#
#  This script scaffolds a complete, framework-less SSR
#  project using Vite, TypeScript, and Express from scratch.
#
# =============================================================

# --- Configuration ---
PROJECT_NAME="vite-ssr-screenshot-app"

# --- Color Definitions ---
C_BLUE='\033[0;34m'
C_GREEN='\033[0;32m'
C_YELLOW='\033[0;33m'
C_RED='\033[0;31m'
C_CYAN='\033[0;36m'
C_RESET='\033[0m'

# =============================================================
# HELPER FUNCTIONS
# =============================================================

# Function to print a section header
print_header() {
    echo -e "\n${C_BLUE}# ============================================================${C_RESET}"
    echo -e "${C_BLUE}# $1${C_RESET}"
    echo -e "${C_BLUE}# ============================================================${C_RESET}"
}

# Function to scaffold the basic project structure
scaffold_project() {
    print_header "Step 1: Scaffolding Project Structure"

    if [ -d "$PROJECT_NAME" ]; then
        echo -e "${C_RED}❌ Error: Directory '$PROJECT_NAME' already exists.${C_RESET}"
        echo -e "${C_YELLOW}Please remove it or run the script in a different location.${C_RESET}"
        exit 1
    fi

    echo -e "${C_CYAN}Creating project directory: $PROJECT_NAME${C_RESET}"
    mkdir -p "$PROJECT_NAME/src/components"
    mkdir -p "$PROJECT_NAME/src/services"
    cd "$PROJECT_NAME" || exit
    echo -e "${C_GREEN}✅ Directory structure created.${C_RESET}"
}

# Function to create all configuration files
create_config_files() {
    print_header "Step 2: Creating Configuration Files"

    echo -e "${C_CYAN}📄 Creating package.json...${C_RESET}"
    cat <<'EOF' > package.json
{
  "name": "vite-ssr-screenshot-app",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch server.ts",
    "build": "npm run build:client && npm run build:server",
    "build:client": "vite build --outDir dist/client",
    "build:server": "vite build --ssr src/entry-server.ts --outDir dist/server",
    "serve": "cross-env NODE_ENV=production tsx server.ts"
  },
  "dependencies": {
    "dotenv": "^16.3.1",
    "express": "^4.18.2"
  },
  "devDependencies": {
    "@types/express": "^4.17.17",
    "@types/node": "^20.5.9",
    "cross-env": "^7.0.3",
    "tsx": "^3.12.7",
    "typescript": "^5.2.2",
    "vite": "^4.4.9"
  }
}
EOF

    echo -e "${C_CYAN}📄 Creating tsconfig.json...${C_RESET}"
    cat <<'EOF' > tsconfig.json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "strict": true,
    "types": ["vite/client"]
  },
  "include": ["src", "server.ts"]
}
EOF

    echo -e "${C_CYAN}📄 Creating vite.config.ts...${C_RESET}"
    cat <<'EOF' > vite.config.ts
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  // We are using a custom Express server, not Vite's built-in one.
  appType: 'custom'
});
EOF

    echo -e "${C_CYAN}🔑 Creating .env placeholder...${C_RESET}"
    cat <<'EOF' > .env
# Get your API key from https://www.screenshotmachine.com after signing up.
VITE_SCREENSHOT_API_KEY="PUT_YOUR_API_KEY_HERE"
EOF

    echo -e "${C_CYAN}🙈 Creating .gitignore...${C_RESET}"
    cat <<'EOF' > .gitignore
# Dependency directories
node_modules/

# Vite build output
dist/

# Environment files
.env
.env.local
.env.*.local

# Logs and runtime data
logs
*.log
npm-debug.log*
.DS_Store
EOF

    echo -e "${C_GREEN}✅ All config files created.${C_RESET}"
}

# Function to write all application source code
create_source_code() {
    print_header "Step 3: Writing Application Source Code"

    # --- HTML Template ---
    echo -e "${C_CYAN}📄 Creating src/index.html template...${C_RESET}"
    cat <<'EOF' > index.html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite App</title>
  </head>
  <body>
    <!-- The server-rendered HTML will be injected here. -->
    <!--ssr-outlet-->
    <!-- The client script is loaded to handle hydration. -->
    <script type="module" src="/src/entry-client.ts"></script>
  </body>
</html>
EOF

    # --- API Service ---
    echo -e "${C_CYAN}📄 Creating src/services/screenshotService.ts...${C_RESET}"
    cat <<'EOF' > src/services/screenshotService.ts
import crypto from 'crypto';

/**
 * Fetches a screenshot URL from the Screenshot Machine API. This function runs ONLY on the server.
 */
export async function fetchScreenshotUrl(urlToCapture: string): Promise<string | null> {
  const apiKey = import.meta.env.VITE_SCREENSHOT_API_KEY;

  if (!apiKey || apiKey === 'PUT_YOUR_API_KEY_HERE') {
    console.error("[SERVER ERROR] VITE_SCREENSHOT_API_KEY is not set in the .env file.");
    return null;
  }

  const secretPhrase = ""; // Only for paid plans
  const hash = crypto.createHash('md5').update(urlToCapture + secretPhrase).digest('hex');

  const params = new URLSearchParams({
    key: apiKey, hash, url: urlToCapture, dimension: '1024x768',
    device: 'desktop', format: 'jpg', cacheLimit: '0', delay: '200'
  });

  const apiUrl = `https://api.screenshotmachine.com/?${params.toString()}`;

  try {
    console.log(`[API] Fetching screenshot for: ${urlToCapture}`);
    const response = await fetch(apiUrl);
    if (!response.ok) {
        const errorText = await response.text();
        console.error(`[API ERROR] Status: ${response.status} for ${urlToCapture}. Details: ${errorText}`);
        return null;
    }
    const data = await response.json();
    return data.link || null;
  } catch (error) {
    console.error(`[API EXCEPTION] An error occurred while fetching ${urlToCapture}:`, error);
    return null;
  }
}
EOF

    # --- Component ---
    echo -e "${C_CYAN}📄 Creating src/components/ScreenshotImage.ts...${C_RESET}"
    cat <<'EOF' > src/components/ScreenshotImage.ts
export interface ScreenshotImageProps {
  imageUrl: string | null;
  siteUrl: string;
  width?: string;
  height?: string;
}

/**
 * A framework-less component function that renders a screenshot container.
 */
export function renderScreenshotImage(props: ScreenshotImageProps): string {
  const { imageUrl, siteUrl, width = '100%', height = 'auto' } = props;
  const containerStyle = `width: ${width}; height: ${height};`;

  const content = imageUrl
    ? `<img src="${imageUrl}" alt="Screenshot of ${siteUrl}" class="ssr-screenshot-img" loading="lazy" />`
    : `<div class="ssr-screenshot-error"><p>Preview unavailable for<br/><strong>${siteUrl}</strong></p></div>`;

  return `<div class="ssr-screenshot-wrapper" style="${containerStyle}">${content}</div>`;
}
EOF

    # --- Page Renderer ---
    echo -e "${C_CYAN}📄 Creating src/renderPage.ts...${C_RESET}"
    cat <<'EOF' > src/renderPage.ts
import { renderScreenshotImage, ScreenshotImageProps } from './components/ScreenshotImage';

/**
 * Renders the entire HTML document using the provided component data.
 */
export function renderPage(componentData: ScreenshotImageProps[]): string {
  const componentsHtml = componentData.map(props => renderScreenshotImage(props)).join('');
  const initialState = JSON.stringify(componentData, null, 2);

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <title>SSR Screenshot Component</title>
  </head>
  <body>
    <div id="app">
      <header class="app-header">
        <h1>Website Previews</h1>
        <p>This entire page was Server-Side Rendered using Vite and TypeScript.</p>
      </header>
      <main class="gallery-grid">${componentsHtml}</main>
    </div>
    <script>window.__INITIAL_STATE__ = ${initialState};</script>
    <script type="module" src="/src/entry-client.ts"></script>
  </body>
</html>`;
}
EOF

    # --- CSS ---
    echo -e "${C_CYAN}📄 Creating src/style.css...${C_RESET}"
    cat <<'EOF' > src/style.css
:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  color-scheme: light dark;
  color: rgba(255, 255, 255, 0.87);
  background-color: #242424;
}
body { margin: 0; padding: 2rem; }
.app-header { text-align: center; margin-bottom: 3rem; color: #f9f9f9; }
.app-header h1 { font-size: 2.5rem; }
.app-header p { font-size: 1.1rem; color: #a0a0a0; max-width: 600px; margin: 0.5rem auto 0; }
.gallery-grid { display: flex; flex-wrap: wrap; gap: 2rem; justify-content: center; max-width: 1400px; margin: 0 auto; }
.ssr-screenshot-wrapper {
  border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  background: #3a3a3a; position: relative; transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.ssr-screenshot-wrapper:hover { transform: translateY(-8px) scale(1.02); box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3); }
.ssr-screenshot-img { width: 100%; height: 100%; object-fit: cover; display: block; }
.ssr-screenshot-error {
  width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center;
  justify-content: center; color: #999; text-align: center; font-size: 0.9rem;
  padding: 1rem; box-sizing: border-box;
}
.ssr-screenshot-error strong { color: #ccc; word-break: break-all; }
EOF

    # --- Client & Server Entries ---
    echo -e "${C_CYAN}📄 Creating src/entry-client.ts & src/entry-server.ts...${C_RESET}"
    cat <<'EOF' > src/entry-client.ts
import './style.css';
console.log('[CLIENT] Hydration script loaded.');
const initialState = (window as any).__INITIAL_STATE__;
if (initialState) {
  console.log('[CLIENT] Successfully hydrated with state from server:', initialState);
} else {
  console.warn('[CLIENT] No initial state found.');
}
EOF

    cat <<'EOF' > src/entry-server.ts
import { fetchScreenshotUrl } from './services/screenshotService';
import { renderPage } from './renderPage';
import { ScreenshotImageProps } from './components/ScreenshotImage';

/**
 * Main SSR function, called by the server for each request.
 */
export async function render(url: string) {
  const componentTargets = [
    { siteUrl: 'https://vitejs.dev', width: '600px', height: '400px' },
    { siteUrl: 'https://www.typescriptlang.org/', width: '400px', height: '250px' },
    { siteUrl: 'https://nodejs.org/en', width: '400px', height: '250px' },
    { siteUrl: 'https://this-is-not-a-real-website.invalid', width: '100%', height: '150px' }
  ];

  console.log('[SSR] Starting API calls for all components...');
  const imageResults = await Promise.all(
    componentTargets.map(target => fetchScreenshotUrl(target.siteUrl))
  );

  const finalComponentProps: ScreenshotImageProps[] = componentTargets.map((target, index) => ({
    ...target,
    imageUrl: imageResults[index]
  }));

  const html = renderPage(finalComponentProps);
  return { html };
}
EOF

    # --- Express Server ---
    echo -e "${C_CYAN}📄 Creating server.ts...${C_RESET}"
    cat <<'EOF' > server.ts
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

async function createServer() {
  const app = express();
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const isProd = process.env.NODE_ENV === 'production';
  let vite: any;

  if (!isProd) {
    vite = await createViteServer({ server: { middlewareMode: true }, appType: 'custom' });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist/client'), { index: false }));
  }

  app.use('*', async (req, res, next) => {
    try {
      const url = req.originalUrl;
      let template, render;

      if (!isProd) {
        template = await fs.readFile(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        render = (await vite.ssrLoadModule('/src/entry-server.ts')).render;
      } else {
        template = await fs.readFile(path.resolve(__dirname, 'dist/client/index.html'), 'utf-8');
        render = (await import('./dist/server/entry-server.js')).render;
      }

      const { html } = await render(url);
      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } catch (e: any) {
      if (vite) vite.ssrFixStacktrace(e);
      next(e);
    }
  });

  const port = process.env.PORT || 5173;
  app.listen(port, () => console.log(`✅ Server listening at http://localhost:${port}`));
}

createServer();
EOF

    echo -e "${C_GREEN}✅ All source code files created.${C_RESET}"
}

# Function to create documentation files
create_docs() {
    print_header "Step 4: Creating Documentation"

    echo -e "${C_CYAN}📖 Creating README.md...${C_RESET}"
    cat <<'EOF' > README.md
# Vite SSR Screenshot Component Project

This project is a demonstration of a **Server-Side Rendered (SSR)** application built with Vite, TypeScript, and Node.js. It features a reusable, framework-less component for generating and displaying website screenshots by securely integrating with the [ScreenshotMachine.com](https://www.screenshotmachine.com) API.

## 🚀 Quick Start Guide

### 1. Install Dependencies

```bash
npm install

```
## 2. Configure API Key  
Before running, you must add your API key:  
1. Open the .env file.  
2. Replace "PUT_YOUR_API_KEY_HERE" with your actual key from ScreenshotMachine.  
## 3. Run the Development Server  
```
npm run dev

```
The application will be available at http://localhost:5173.  
## 📚 Component Usage  
For a deep dive into using and customizing the component, please see the detailed guide in GUIDE.md.  
## 📦 Available Scripts  
* npm run dev: Starts the development server with HMR.  
* npm run build: Builds the application for production.  
* npm run serve: Runs the built production server (run npm run build first). EOF echo -e "${C_CYAN}📖 Creating GUIDE.md...${C_RESET}" cat <<'EOF' > GUIDE.md  
## Component Guide: The SSR ScreenshotImage  
This guide provides a detailed walkthrough of how to use, customize, and extend the framework-less ScreenshotImage component.  
  
## 1. Core Concept: A Function as a Component  
In our framework-less approach, a component is a pure TypeScript function that accepts a props object and returns an HTML string. This is predictable, easy to test, and perfect for SSR.  
The component is located at:  
```
src/components/ScreenshotImage.ts

```
  
## 2. The Props Interface  
To use the component, you must provide data matching the ScreenshotImageProps interface:  

| Prop | Type | Required | Description |
| -------- | -------------- | -------- | -------------------------------------------------------------- |
| siteUrl | string | Yes | The website URL to screenshot (e.g., https://google.com). |
| imageUrl | string \| null | Yes | The image link from the API. If null, an error state is shown. |
| width | string | No | CSS width for the container (e.g., 500px). Defaults to 100%. |
| height | string | No | CSS height for the container (e.g., 300px). Defaults to auto. |
  
## 3. How to Add More Screenshots  
All rendering is orchestrated from:  
```
src/entry-server.ts

```
To add, remove, or change the screenshots, modify the componentTargets array in that file.  
## Example: Adding a New Screenshot  
```
// src/entry-server.ts
const componentTargets = [
  { siteUrl: 'https://vitejs.dev', width: '600px', height: '400px' },
  // ... other items
  // ADD YOUR NEW COMPONENT HERE:
  { siteUrl: 'https://github.com', width: '500px', height: '300px' }
];

```
The development server will automatically fetch and render the new screenshot.  
  
## 4. Customizing Appearance (CSS)  
Styles are defined in:  
```
src/style.css

```
Key selectors:  
* .ssr-screenshot-wrapper: The main container. Change border-radius, box-shadow, etc.  
* .ssr-screenshot-img: The <img> tag. It uses object-fit: cover. Change to contain to see the full image.  
* .ssr-screenshot-error: The placeholder <div> that appears on API failure.  
  
## 5. Understanding the SSR Data Flow  
1. **Request**: Your browser requests a page.  
2. **Server Execution**: server.ts runs src/entry-server.ts.  
3. **Data Fetching**: The server securely calls the ScreenshotMachine API. The API key never leaves the server.  
4. **HTML Generation**: renderPage and renderScreenshotImage generate a single, complete HTML string.  
5. **Response**: The server sends this HTML to your browser.  
6. **Display & Hydration**: The browser displays the HTML instantly. entry-client.ts then runs to add any client-side interactivity.  
EOF  
```
echo -e "${C_GREEN}✅ Documentation created successfully.${C_RESET}"

```
}  
## =============================================================  
## MAIN EXECUTION  
## =============================================================  
main() { scaffold_project create_config_files create_source_code create_docs  
```
print_header "Step 5: Finalizing Setup"
echo -e "${C_CYAN}📦 Installing dependencies via npm...${C_RESET}"
npm install &> /dev/null
echo -e "${C_GREEN}✅ Dependencies installed.${C_RESET}"

echo -e "\n${C_GREEN}🎉 Success! Your SSR Screenshot project is ready.${C_RESET}"
echo -e "-----------------------------------------------------"
echo -e "${C_YELLOW}Next Steps:${C_RESET}"
echo -e "1. cd ${PROJECT_NAME}"
echo -e "2. Open the ${C_CYAN}.env${C_RESET} file and add your ScreenshotMachine API key."
echo -e "3. Run ${C_CYAN}npm run dev${C_RESET} to start the development server."
echo ""
echo -e "Your app will be available at ${C_GREEN}http://localhost:5173${C_RESET}"
echo -e "-----------------------------------------------------"

```
}  
## Run the main function  
main  
```


```
