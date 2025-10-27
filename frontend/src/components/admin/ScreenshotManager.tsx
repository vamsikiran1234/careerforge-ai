import React from 'react';

// Lightweight placeholder ScreenshotManager component.
// The original project referenced this component from AdminDashboard.
// This implementation provides a simple UI so imports resolve and the
// admin dashboard can render without build errors. Replace with the
// real implementation when available.

export const ScreenshotManager: React.FC = () => {
  return (
    <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Screenshot Manager</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">Manage and download diagnostic screenshots for troubleshooting platform issues.</p>
      <div className="mt-4 flex items-center gap-3">
        <button className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Capture Screenshot</button>
        <button className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-200">View Gallery</button>
      </div>
    </div>
  );
};

export default ScreenshotManager;
