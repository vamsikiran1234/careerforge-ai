import React from 'react';

const EnvDebugPage: React.FC = () => {
  const envVars = {
    'VITE_API_URL': import.meta.env.VITE_API_URL,
    'VITE_APP_NAME': import.meta.env.VITE_APP_NAME,
    'VITE_NODE_ENV': import.meta.env.VITE_NODE_ENV,
    'NODE_ENV': import.meta.env.NODE_ENV,
    'MODE': import.meta.env.MODE,
    'DEV': import.meta.env.DEV,
    'PROD': import.meta.env.PROD,
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Environment Variables Debug
          </h1>
          
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Current Environment Variables:
              </h2>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                {Object.entries(envVars).map(([key, value]) => (
                  <div key={key} className="mb-1">
                    <span className="text-yellow-400">{key}:</span>{' '}
                    <span className="text-white">
                      {value !== undefined ? JSON.stringify(value) : 'undefined'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Current Window Location:
              </h2>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                <div>origin: {window.location.origin}</div>
                <div>hostname: {window.location.hostname}</div>
                <div>port: {window.location.port}</div>
                <div>protocol: {window.location.protocol}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnvDebugPage;
