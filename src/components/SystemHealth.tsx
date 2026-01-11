'use client';

import { useState, useEffect } from 'react';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  XCircleIcon,
  ServerIcon,
  CircleStackIcon,
  CloudIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

interface HealthMetric {
  name: string;
  status: 'healthy' | 'warning' | 'error';
  value: string;
  description: string;
  icon: React.ComponentType<any>;
}

export default function SystemHealth() {
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSystemMetrics();
  }, []);

  const loadSystemMetrics = () => {
    // Demo system health metrics
    const demoMetrics: HealthMetric[] = [
      {
        name: 'Server Status',
        status: 'healthy',
        value: 'Online',
        description: 'Application server is running normally',
        icon: ServerIcon
      },
      {
        name: 'Database',
        status: 'healthy',
        value: '99.9%',
        description: 'Database connection is stable',
        icon: CircleStackIcon
      },
      {
        name: 'Storage',
        status: 'warning',
        value: '85%',
        description: 'Storage usage is approaching limit',
        icon: CloudIcon
      },
      {
        name: 'Security',
        status: 'healthy',
        value: 'Secure',
        description: 'All security checks passed',
        icon: ShieldCheckIcon
      }
    ];

    setMetrics(demoMetrics);
    setLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <CheckCircleIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const overallStatus = () => {
    if (metrics.some(m => m.status === 'error')) return 'error';
    if (metrics.some(m => m.status === 'warning')) return 'warning';
    return 'healthy';
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg leading-6 font-medium text-gray-900">System Health</h3>
          <div className="flex items-center space-x-2">
            {getStatusIcon(overallStatus())}
            <span className={`text-sm font-medium ${
              overallStatus() === 'healthy' ? 'text-green-600' :
              overallStatus() === 'warning' ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {overallStatus() === 'healthy' ? 'All Systems Operational' :
               overallStatus() === 'warning' ? 'Some Issues Detected' : 'Critical Issues'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${getStatusColor(metric.status)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <metric.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">{metric.name}</h4>
                    <p className="text-xs opacity-75 mt-1">{metric.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(metric.status)}
                  <span className="text-sm font-semibold">{metric.value}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* System Statistics */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3">System Statistics</h4>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">99.9%</div>
              <div className="text-xs text-gray-500">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">1,247</div>
              <div className="text-xs text-gray-500">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">45ms</div>
              <div className="text-xs text-gray-500">Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">2.1GB</div>
              <div className="text-xs text-gray-500">Data Usage</div>
            </div>
          </div>
        </div>

        {/* Last Updated */}
        <div className="mt-4 text-xs text-gray-500 text-center">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>
    </div>
  );
}