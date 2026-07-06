'use client';

import { useState, useEffect } from 'react';
import { Briefcase, Users, MessageSquare } from 'lucide-react';
import { apiGet } from '@/app/lib/api';

export default function AdminDashboard() {
  const [totalServices, setTotalServices] = useState<number | string>('...');
  const [totalQueries, setTotalQueries] = useState<number | string>('...');
  const [totalUsers, setTotalUsers] = useState<number | string>('...');

  useEffect(() => {
    // One aggregate call instead of three paginated list queries.
    const fetchStats = async () => {
      try {
        const res = await apiGet('/stats/dashboard');
        setTotalServices(res.data?.totalServices ?? 0);
        setTotalQueries(res.data?.totalInquiries ?? 0);
        setTotalUsers(res.data?.totalUsers ?? 0);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        setTotalServices('—');
        setTotalQueries('—');
        setTotalUsers('—');
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
    },
    {
      label: 'Total Users',
      value: typeof totalUsers === 'number' ? totalUsers.toLocaleString() : totalUsers,
      icon: Users,
      color: 'bg-green-500',
    },
    {
      label: 'Total Queries',
      value: typeof totalQueries === 'number' ? totalQueries.toLocaleString() : totalQueries,
      icon: MessageSquare,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Welcome to the ClearTax Admin Portal</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
