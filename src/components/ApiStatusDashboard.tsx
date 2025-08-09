import React, { useState, useEffect } from 'react';
import { getApiBaseUrl } from '../utils/api-config';

interface APIStatus {
  endpoint: string;
  status: 'online' | 'offline' | 'degraded' | 'checking';
  responseTime?: number;
  lastChecked: string;
  message?: string;
}

const ApiStatusDashboard: React.FC = () => {
  const [apiStatuses, setApiStatuses] = useState<APIStatus[]>([
    { 
      endpoint: 'geocode', 
      status: 'checking', 
      lastChecked: new Date().toISOString() 
    },
    { 
      endpoint: 'check-stock', 
      status: 'checking', 
      lastChecked: new Date().toISOString() 
    },
    { 
      endpoint: 'sync-stock', 
      status: 'checking', 
      lastChecked: new Date().toISOString() 
    },
    { 
      endpoint: 'yoco-checkout', 
      status: 'checking', 
      lastChecked: new Date().toISOString() 
    }
  ]);

  const checkApiEndpoint = async (endpoint: string) => {
    const startTime = performance.now();
    let status: 'online' | 'offline' | 'degraded' = 'offline';
    let message = '';

    try {
      let url = `${getApiBaseUrl()}/${endpoint}`;
      let params = '';
      
      // Add required parameters for specific endpoints
      if (endpoint === 'geocode') {
        params = '?text=test';
      } else if (endpoint === 'check-stock') {
        params = '?productId=test-product';
      }
      
      const method = endpoint === 'sync-stock' ? 'POST' : 'GET';
      
      const response = await fetch(`${url}${params}`, { 
        method,
        headers: { 'Content-Type': 'application/json' },
      });

      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);

      if (response.status === 200) {
        const data = await response.json();
        
        if (data.error) {
          status = 'degraded';
          message = data.error || 'API returned an error object';
        } else {
          status = responseTime > 1000 ? 'degraded' : 'online';
          message = responseTime > 1000 ? 'High latency' : 'Operational';
        }
      } else {
        status = 'offline';
        message = `HTTP ${response.status}: ${response.statusText}`;
      }

      return {
        status,
        responseTime,
        message
      };
    } catch (error) {
      return {
        status: 'offline',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  const checkAllEndpoints = async () => {
    const updatedStatuses = [...apiStatuses];
    
    for (let i = 0; i < updatedStatuses.length; i++) {
      const endpoint = updatedStatuses[i].endpoint;
      const result = await checkApiEndpoint(endpoint);
      
      updatedStatuses[i] = {
        ...updatedStatuses[i],
        status: result.status as 'online' | 'offline' | 'degraded' | 'checking',
        responseTime: result.responseTime,
        lastChecked: new Date().toISOString(),
        message: result.message
      };
      
      // Update immediately after each check
      setApiStatuses([...updatedStatuses]);
    }
  };

  useEffect(() => {
    checkAllEndpoints();
    
    // Check every 30 seconds
    const interval = setInterval(() => {
      checkAllEndpoints();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-100 text-green-800';
      case 'offline': return 'bg-red-100 text-red-800';
      case 'degraded': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleRefresh = () => {
    // Mark all as checking
    setApiStatuses(apiStatuses.map(s => ({ ...s, status: 'checking' })));
    // Then check all
    checkAllEndpoints();
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">API Status Dashboard</h2>
        <button 
          onClick={handleRefresh} 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Endpoint</th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Response Time</th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Checked</th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {apiStatuses.map((api) => (
              <tr key={api.endpoint}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">/api/{api.endpoint}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(api.status)}`}>
                    {api.status === 'checking' ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Checking
                      </>
                    ) : api.status.charAt(0).toUpperCase() + api.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {api.status === 'checking' ? '-' : api.responseTime ? `${api.responseTime}ms` : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatTime(api.lastChecked)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {api.message || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 border-t border-gray-200 pt-4">
        <h3 className="text-lg font-medium text-gray-900">Troubleshooting Steps</h3>
        <ul className="mt-2 space-y-2 text-sm text-gray-600">
          <li className="flex items-start">
            <svg className="h-5 w-5 text-gray-400 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>If endpoints are offline, check the <a href="/DEPLOYMENT_GUIDE.md" className="text-blue-600 hover:underline">Deployment Guide</a> for setup instructions.</span>
          </li>
          <li className="flex items-start">
            <svg className="h-5 w-5 text-gray-400 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>Verify Firebase credentials are properly configured in your deployment environment.</span>
          </li>
          <li className="flex items-start">
            <svg className="h-5 w-5 text-gray-400 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>For geocoding issues, check if your Geoapify API key is valid and properly configured.</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ApiStatusDashboard;
