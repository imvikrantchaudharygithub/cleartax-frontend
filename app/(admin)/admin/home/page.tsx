'use client';

import { useState, useEffect } from 'react';
import { Briefcase, Users, Calculator, MessageSquare } from 'lucide-react';
import { serviceService, inquiryService } from '@/app/lib/api';

export default function AdminDashboard() {
  const [totalServices, setTotalServices] = useState<number | string>('...');
  const [totalQueries, setTotalQueries] = useState<number | string>('...');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      setMounted(true);
      try {
        // Fetch services count
        const servicesResponse = await serviceService.getAll({ page: 1, limit: 1 });
        const totalServicesCount = (servicesResponse as any).total || (servicesResponse as any).data?.length || 0;
        setTotalServices(totalServicesCount);

        // Fetch inquiries count
        const inquiriesResponse = await inquiryService.getAll({ page: 1, limit: 1 });
        const totalQueriesCount = (inquiriesResponse as any).total || (inquiriesResponse as any).data?.length || 0;
        setTotalQueries(totalQueriesCount);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setTotalServices('...');
        setTotalQueries('...');
      }
    };

    fetchStats();
  }, []);

  const stats = [
    {
      label: 'Total Services',
      value: typeof totalServices === 'number' ? totalServices.toLocaleString() : totalServices,
      icon: Briefcase,
      color: 'bg-blue-500',
      change: '+12%',
    },
    {
      label: 'Total Users',
      value: '1,234',
      icon: Users,
      color: 'bg-green-500',
      change: '+8%',
    },
    {
      label: 'Active Calculators',
      value: '5',
      icon: Calculator,
      color: 'bg-purple-500',
      change: '+2',
    },
    {
      label: 'Total Queries',
      value: typeof totalQueries === 'number' ? totalQueries.toLocaleString() : totalQueries,
      icon: MessageSquare,
      color: 'bg-orange-500',
      change: '+5',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Welcome to the ClearTax Admin Portal</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm text-green-400 font-medium">{stat.change}</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
              <p className="text-gray-400 text-sm">{stat.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

