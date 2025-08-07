import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

const AuthDebugPage: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addLog = (message: string, isError = false) => {
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp}: ${isError ? '❌' : '✅'} ${message}`;
    setLogs(prev => [...prev, logEntry]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const testBackendConnection = async () => {
    setIsLoading(true);
    addLog('Testing backend connection...');
    
    try {
      const response = await fetch('http://localhost:3000/health');
      const data = await response.json();
      
      if (response.ok) {
        addLog(`Backend connection successful: ${data.message}`);
      } else {
        addLog(`Backend returned error: ${response.status}`, true);
      }
    } catch (error: any) {
      addLog(`Backend connection failed: ${error.message}`, true);
    }
    
    setIsLoading(false);
  };

  const testRegistration = async () => {
    setIsLoading(true);
    addLog('Testing user registration...');
    
    try {
      const userData = {
        name: 'Debug Test User',
        email: 'debug@test.com',
        password: 'DebugPassword123!'
      };

      const response = await fetch('http://localhost:3000/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();
      
      if (response.ok) {
        addLog(`Registration successful: ${data.message}`);
        addLog(`User created with ID: ${data.data?.user?.id}`);
      } else {
        addLog(`Registration failed: ${data.message || 'Unknown error'}`, true);
        if (data.errors) {
          addLog(`Validation errors: ${JSON.stringify(data.errors)}`, true);
        }
      }
    } catch (error: any) {
      addLog(`Registration request failed: ${error.message}`, true);
    }
    
    setIsLoading(false);
  };

  const testLogin = async () => {
    setIsLoading(true);
    addLog('Testing user login...');
    
    try {
      const credentials = {
        email: 'debug@test.com',
        password: 'DebugPassword123!'
      };

      const response = await fetch('http://localhost:3000/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();
      
      if (response.ok) {
        addLog(`Login successful: ${data.message}`);
        addLog(`Token received: ${data.data?.token?.substring(0, 20)}...`);
        addLog(`User: ${data.data?.user?.name} (${data.data?.user?.email})`);
      } else {
        addLog(`Login failed: ${data.message || 'Unknown error'}`, true);
        if (data.errors) {
          addLog(`Login errors: ${JSON.stringify(data.errors)}`, true);
        }
      }
    } catch (error: any) {
      addLog(`Login request failed: ${error.message}`, true);
    }
    
    setIsLoading(false);
  };

  const testViteApiClient = async () => {
    setIsLoading(true);
    addLog('Testing via Vite API client...');
    
    try {
      // Import the API client dynamically
      const { apiClient } = await import('../../lib/api-client');
      
      addLog('API client imported successfully');
      
      // Test registration via API client
      addLog('Testing registration via API client...');
      const regResponse = await apiClient.post('/auth/register', {
        name: 'Vite Test User',
        email: 'vite@test.com',
        password: 'VitePassword123!'
      });
      
      if (regResponse.status === 'success') {
        addLog(`Vite registration successful: ${regResponse.message}`);
        
        // Test login via API client
        addLog('Testing login via API client...');
        const loginResponse = await apiClient.post('/auth/login', {
          email: 'vite@test.com',
          password: 'VitePassword123!'
        });
        
        if (loginResponse.status === 'success') {
          addLog(`Vite login successful: ${loginResponse.message}`);
        } else {
          addLog(`Vite login failed: ${loginResponse.message}`, true);
        }
      } else {
        addLog(`Vite registration failed: ${regResponse.message}`, true);
      }
    } catch (error: any) {
      addLog(`Vite API client test failed: ${error.message}`, true);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            CareerForge AI - Authentication Debug
          </h1>
          <p className="text-gray-600 mb-6">
            This page helps debug authentication issues by testing various connection methods.
          </p>
          
          <div className="flex flex-wrap gap-4 mb-6">
            <Button 
              onClick={testBackendConnection} 
              disabled={isLoading}
              variant="outline"
            >
              Test Backend Connection
            </Button>
            <Button 
              onClick={testRegistration} 
              disabled={isLoading}
              variant="outline"
            >
              Test Registration
            </Button>
            <Button 
              onClick={testLogin} 
              disabled={isLoading}
              variant="outline"
            >
              Test Login
            </Button>
            <Button 
              onClick={testViteApiClient} 
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              Test Vite API Client
            </Button>
            <Button 
              onClick={clearLogs} 
              variant="outline"
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              Clear Logs
            </Button>
          </div>
          
          {isLoading && (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Testing...</span>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Test Logs</h2>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-gray-500">No logs yet. Click a test button above to start.</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AuthDebugPage;
