// Screenshot Utility for Landing Page
// This utility captures screenshots of key platform features

import html2canvas from 'html2canvas';

interface ScreenshotOptions {
  quality?: number;
  scale?: number;
  backgroundColor?: string;
}

/**
 * Capture screenshot of a specific element or full page
 */
export const captureScreenshot = async (
  elementId?: string,
  options: ScreenshotOptions = {}
): Promise<string> => {
  const {
    quality = 0.95,
    scale = 2, // 2x for retina displays
    backgroundColor = '#ffffff'
  } = options;

  try {
    const element = elementId 
      ? document.getElementById(elementId) 
      : document.body;

    if (!element) {
      throw new Error(`Element with id "${elementId}" not found`);
    }

    const canvas = await html2canvas(element, {
      scale,
      backgroundColor,
      useCORS: true,
      allowTaint: true,
      logging: false,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    // Convert to data URL
    return canvas.toDataURL('image/png', quality);
  } catch (error) {
    console.error('Screenshot capture failed:', error);
    throw error;
  }
};

/**
 * Capture multiple screenshots at once
 */
export const captureMultipleScreenshots = async (
  elementIds: string[],
  options?: ScreenshotOptions
): Promise<Record<string, string>> => {
  const screenshots: Record<string, string> = {};

  for (const elementId of elementIds) {
    try {
      const dataUrl = await captureScreenshot(elementId, options);
      screenshots[elementId] = dataUrl;
    } catch (error) {
      console.error(`Failed to capture screenshot for ${elementId}:`, error);
    }
  }

  return screenshots;
};

/**
 * Download screenshot as PNG file
 */
export const downloadScreenshot = (dataUrl: string, filename: string = 'screenshot.png') => {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
};

/**
 * Pre-defined screenshots for landing page features
 */
export const FEATURE_SCREENSHOTS = {
  dashboard: 'dashboard-screenshot',
  chat: 'chat-screenshot',
  quiz: 'quiz-screenshot',
  mentors: 'mentors-screenshot',
  sessions: 'sessions-screenshot',
  career: 'career-screenshot',
};

/**
 * Capture all feature screenshots for landing page
 */
export const captureFeatureScreenshots = async () => {
  const screenshots = await captureMultipleScreenshots(
    Object.values(FEATURE_SCREENSHOTS)
  );
  
  // Store in localStorage for quick access
  Object.entries(screenshots).forEach(([key, dataUrl]) => {
    localStorage.setItem(`screenshot_${key}`, dataUrl);
  });

  return screenshots;
};

/**
 * Get cached screenshot from localStorage
 */
export const getCachedScreenshot = (key: string): string | null => {
  return localStorage.getItem(`screenshot_${key}`);
};

/**
 * Mock screenshots for development (before real screenshots are captured)
 */
export const MOCK_SCREENSHOTS = {
  dashboard: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=800&fit=crop',
  chat: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=1200&h=800&fit=crop',
  quiz: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&h=800&fit=crop',
  mentors: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=800&fit=crop',
  sessions: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&h=800&fit=crop',
  career: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=800&fit=crop',
};

export default {
  captureScreenshot,
  captureMultipleScreenshots,
  downloadScreenshot,
  captureFeatureScreenshots,
  getCachedScreenshot,
  FEATURE_SCREENSHOTS,
  MOCK_SCREENSHOTS,
};
