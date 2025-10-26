/**
 * Automated Screenshot Capture System
 * Professional implementation for capturing platform screenshots
 * Following industry best practices for screenshot automation
 */

import html2canvas from 'html2canvas';

export interface ScreenshotOptions {
  quality?: number;
  scale?: number;
  backgroundColor?: string;
  width?: number;
  height?: number;
  ignoreElements?: string[];
}

export interface ScreenshotResult {
  success: boolean;
  dataUrl?: string;
  error?: string;
  timestamp: Date;
  pageName: string;
}

/**
 * Routes to capture for platform screenshots
 */
export const SCREENSHOT_ROUTES = [
  { path: '/app/dashboard', name: 'dashboard', label: 'Dashboard Overview' },
  { path: '/app/chat', name: 'chat', label: 'AI Career Chat' },
  { path: '/app/quiz', name: 'quiz', label: 'Skill Assessment' },
  { path: '/app/mentors', name: 'mentors', label: 'Find Mentors' },
  { path: '/app/sessions', name: 'sessions', label: 'My Sessions' },
  { path: '/app/career', name: 'career', label: 'Career Trajectory' },
  { path: '/app/connections', name: 'connections', label: 'My Connections' },
] as const;

/**
 * Capture screenshot of current page
 */
export const capturePageScreenshot = async (
  options: ScreenshotOptions = {}
): Promise<ScreenshotResult> => {
  const {
    quality = 0.95,
    scale = 2, // Retina quality
    backgroundColor = '#ffffff',
    ignoreElements = ['.no-screenshot', '[data-screenshot-ignore]'],
  } = options;

  try {
    // Get main content area (excluding sidebar/nav for cleaner shots)
    const element = document.querySelector('main') || document.body;
    
    if (!element) {
      throw new Error('No content element found');
    }

    // Temporarily hide elements that shouldn't appear in screenshots
    const hiddenElements: HTMLElement[] = [];
    ignoreElements.forEach(selector => {
      const elements = document.querySelectorAll<HTMLElement>(selector);
      elements.forEach(el => {
        if (el.style.display !== 'none') {
          hiddenElements.push(el);
          el.style.display = 'none';
        }
      });
    });

    // Capture screenshot
    const canvas = await html2canvas(element, {
      scale,
      backgroundColor,
      useCORS: true,
      allowTaint: false,
      logging: false,
      imageTimeout: 15000,
      removeContainer: true,
      windowWidth: options.width || window.innerWidth,
      windowHeight: options.height || window.innerHeight,
      onclone: (clonedDoc) => {
        // Additional cleanup in cloned document if needed
        const clonedBody = clonedDoc.body;
        clonedBody.style.overflow = 'visible';
      },
    });

    // Restore hidden elements
    hiddenElements.forEach(el => {
      el.style.display = '';
    });

    // Convert to data URL
    const dataUrl = canvas.toDataURL('image/png', quality);

    return {
      success: true,
      dataUrl,
      timestamp: new Date(),
      pageName: getCurrentPageName(),
    };
  } catch (error) {
    console.error('Screenshot capture failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date(),
      pageName: getCurrentPageName(),
    };
  }
};

/**
 * Capture multiple screenshots by navigating through routes
 */
export const captureAllPageScreenshots = async (
  onProgress?: (current: number, total: number, pageName: string) => void,
  delay: number = 2000 // Delay between captures for page load
): Promise<Record<string, ScreenshotResult>> => {
  const results: Record<string, ScreenshotResult> = {};
  const total = SCREENSHOT_ROUTES.length;

  for (let i = 0; i < SCREENSHOT_ROUTES.length; i++) {
    const route = SCREENSHOT_ROUTES[i];
    
    // Report progress
    if (onProgress) {
      onProgress(i + 1, total, route.label);
    }

    // Navigate to route
    window.location.hash = route.path;
    
    // Wait for page to load and render
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Capture screenshot
    const result = await capturePageScreenshot();
    results[route.name] = result;

    // Store in localStorage for quick access
    if (result.success && result.dataUrl) {
      localStorage.setItem(`screenshot_${route.name}`, result.dataUrl);
      localStorage.setItem(`screenshot_${route.name}_timestamp`, result.timestamp.toISOString());
    }
  }

  return results;
};

/**
 * Download screenshot as PNG file
 */
export const downloadScreenshot = (dataUrl: string, filename: string): void => {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = `${filename}_${Date.now()}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Get cached screenshot from localStorage
 */
export const getCachedScreenshot = (pageName: string): string | null => {
  return localStorage.getItem(`screenshot_${pageName}`);
};

/**
 * Clear all cached screenshots
 */
export const clearScreenshotCache = (): void => {
  SCREENSHOT_ROUTES.forEach(route => {
    localStorage.removeItem(`screenshot_${route.name}`);
    localStorage.removeItem(`screenshot_${route.name}_timestamp`);
  });
};

/**
 * Get current page name from route
 */
const getCurrentPageName = (): string => {
  const path = window.location.hash.replace('#', '');
  const route = SCREENSHOT_ROUTES.find(r => path.includes(r.path));
  return route?.name || 'unknown';
};

/**
 * Check if screenshots need updating (older than 7 days)
 */
export const shouldUpdateScreenshots = (): boolean => {
  const timestamps = SCREENSHOT_ROUTES.map(route => {
    const timestamp = localStorage.getItem(`screenshot_${route.name}_timestamp`);
    return timestamp ? new Date(timestamp) : null;
  }).filter(Boolean);

  if (timestamps.length === 0) return true;

  const oldestTimestamp = new Date(Math.min(...timestamps.map(t => t!.getTime())));
  const daysSinceUpdate = (Date.now() - oldestTimestamp.getTime()) / (1000 * 60 * 60 * 24);

  return daysSinceUpdate > 7;
};

/**
 * Upload screenshot to server (placeholder - implement based on your API)
 */
export const uploadScreenshot = async (
  dataUrl: string,
  pageName: string
): Promise<{ success: boolean; url?: string; error?: string }> => {
  try {
    // Convert data URL to blob
    const response = await fetch(dataUrl);
    const blob = await response.blob();

    // Create form data
    const formData = new FormData();
    formData.append('screenshot', blob, `${pageName}.png`);
    formData.append('pageName', pageName);

    // Upload to your server
    const uploadResponse = await fetch('/api/admin/screenshots', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!uploadResponse.ok) {
      throw new Error('Upload failed');
    }

    const data = await uploadResponse.json();
    return { success: true, url: data.url };
  } catch (error) {
    console.error('Screenshot upload failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
};
