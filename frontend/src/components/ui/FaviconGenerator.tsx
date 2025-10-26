import React from 'react';

// Generate favicon-ready SVG for CareerForge AI
export const generateFaviconSVG = (size: number = 32) => {
  const svgContent = `
    <svg width="${size}" height="${size}" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#3B82F6"/>
          <stop offset="100%" stop-color="#8B5CF6"/>
        </linearGradient>
        <linearGradient id="steps" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#FFFFFF"/>
          <stop offset="100%" stop-color="#E0E7FF"/>
        </linearGradient>
      </defs>
      
      <!-- Background -->
      <rect width="32" height="32" rx="6" fill="url(#bg)"/>
      
      <!-- Career Steps -->
      <rect x="4" y="24" width="3" height="4" rx="1" fill="url(#steps)" opacity="0.8"/>
      <rect x="9" y="20" width="3" height="8" rx="1" fill="url(#steps)" opacity="0.9"/>
      <rect x="14" y="16" width="3" height="12" rx="1" fill="url(#steps)"/>
      <rect x="19" y="12" width="3" height="16" rx="1" fill="url(#steps)"/>
      
      <!-- AI Connection -->
      <path d="M5.5 26 Q11 22 16.5 18 Q22 14 26.5 10" stroke="white" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.7"/>
      
      <!-- AI Node -->
      <circle cx="26" cy="8" r="2" fill="white"/>
      <circle cx="26" cy="8" r="1" fill="#3B82F6"/>
    </svg>
  `;
  
  return svgContent;
};

// Component to display favicon options
export const FaviconGenerator: React.FC = () => {
  const sizes = [16, 32, 48, 64, 128, 256];
  
  const downloadSVG = (size: number) => {
    const svgContent = generateFaviconSVG(size);
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `careerforge-favicon-${size}x${size}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8 bg-white dark:bg-gray-900">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Favicon Generator
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Download favicon files in various sizes for your website
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {sizes.map((size) => (
            <div key={size} className="text-center">
              <div 
                className="mx-auto mb-4 border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800"
                style={{ width: Math.min(size, 64) + 32, height: Math.min(size, 64) + 32 }}
              >
                <div
                  dangerouslySetInnerHTML={{ __html: generateFaviconSVG(Math.min(size, 64)) }}
                  className="w-full h-full flex items-center justify-center"
                />
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                {size}×{size}px
              </p>
              <button
                onClick={() => downloadSVG(size)}
                className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Download SVG
              </button>
            </div>
          ))}
        </div>
        
        <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
            Usage Instructions
          </h3>
          <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <p><strong>16×16:</strong> Browser tab favicon</p>
            <p><strong>32×32:</strong> Standard favicon, bookmark icon</p>
            <p><strong>48×48:</strong> Windows site icon</p>
            <p><strong>64×64:</strong> High-DPI favicon</p>
            <p><strong>128×128:</strong> Chrome Web Store icon</p>
            <p><strong>256×256:</strong> High-resolution displays</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaviconGenerator;