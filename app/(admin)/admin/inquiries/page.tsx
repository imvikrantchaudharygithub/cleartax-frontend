'use client';

import { useState, useEffect, useMemo } from 'react';
import { Download, Search, Trash2, Eye, Phone, Mail, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { inquiryService } from '@/app/lib/api';
import { Inquiry } from '@/app/lib/api/types';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    callbacks: 0,
    queries: 0,
    today: 0,
    pending: 0,
    contacted: 0,
    resolved: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedPage, setSelectedPage] = useState<string>('all');
  const [viewingInquiry, setViewingInquiry] = useState<Inquiry | null>(null);

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        setLoading(true);
        setError(null);
        const inquiriesResponse = await inquiryService.getAll({ page: 1, limit: 100 });
        const inquiriesData = inquiriesResponse.data || [];
        setInquiries(inquiriesData);
        
        // Calculate stats from inquiries data
        const callbacksCount = inquiriesData.filter(i => i.type === 'callback').length;
        const queriesCount = inquiriesData.filter(i => i.type === 'query').length;
        const today = new Date().toDateString();
        const todayCount = inquiriesData.filter(i => {
          const inquiryDate = new Date(i.createdAt).toDateString();
          return inquiryDate === today;
        }).length;
        const pendingCount = inquiriesData.filter(i => i.status === 'pending').length;
        const contactedCount = inquiriesData.filter(i => i.status === 'contacted').length;
        const resolvedCount = inquiriesData.filter(i => i.status === 'resolved').length;
        
        setStats({
          total: inquiriesData.length,
          callbacks: callbacksCount,
          queries: queriesCount,
          today: todayCount,
          pending: pendingCount,
          contacted: contactedCount,
          resolved: resolvedCount,
        });
      } catch (err) {
        console.error('Error fetching inquiries:', err);
        setError('Failed to load inquiries. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchInquiries();
  }, []);

  // Get unique pages
  const uniquePages = useMemo(() => {
    return Array.from(new Set(inquiries.map(i => i.sourcePage))).sort();
  }, [inquiries]);

  // Filter inquiries
  const filteredInquiries = useMemo(() => {
    return inquiries.filter((inquiry) => {
      const matchesSearch = 
        inquiry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inquiry.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inquiry.phone.includes(searchQuery) ||
        inquiry.interest.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (inquiry.notes && inquiry.notes.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesType = selectedType === 'all' || inquiry.type === selectedType;
      const matchesPage = selectedPage === 'all' || inquiry.sourcePage === selectedPage;
      
      return matchesSearch && matchesType && matchesPage;
    });
  }, [inquiries, searchQuery, selectedType, selectedPage]);

  const handleDelete = async (inquiryId: string) => {
    if (confirm('Are you sure you want to delete this inquiry?')) {
      try {
        await inquiryService.delete(inquiryId);
        // Refresh inquiries
        const response = await inquiryService.getAll({ page: 1, limit: 100 });
        const inquiriesData = response.data || [];
        setInquiries(inquiriesData);
        
        // Recalculate stats
        const callbacksCount = inquiriesData.filter(i => i.type === 'callback').length;
        const queriesCount = inquiriesData.filter(i => i.type === 'query').length;
        const today = new Date().toDateString();
        const todayCount = inquiriesData.filter(i => {
          const inquiryDate = new Date(i.createdAt).toDateString();
          return inquiryDate === today;
        }).length;
        const pendingCount = inquiriesData.filter(i => i.status === 'pending').length;
        const contactedCount = inquiriesData.filter(i => i.status === 'contacted').length;
        const resolvedCount = inquiriesData.filter(i => i.status === 'resolved').length;
        
        setStats({
          total: inquiriesData.length,
          callbacks: callbacksCount,
          queries: queriesCount,
          today: todayCount,
          pending: pendingCount,
          contacted: contactedCount,
          resolved: resolvedCount,
        });
        toast.success('Inquiry deleted successfully!');
      } catch (err) {
        console.error('Error deleting inquiry:', err);
        toast.error('Failed to delete inquiry. Please try again.');
      }
    }
  };

  const handleExport = async () => {
    try {
      const blob = await inquiryService.export({
        type: selectedType !== 'all' ? selectedType as 'callback' | 'query' : undefined,
        sourcePage: selectedPage !== 'all' ? selectedPage : undefined,
        search: searchQuery || undefined,
      });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inquiries-${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Inquiries exported successfully!');
    } catch (err) {
      console.error('Error exporting inquiries:', err);
      toast.error('Failed to export inquiries. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 text-red-400">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Inquiries & Callbacks</h1>
          <p className="text-gray-400">Manage all callback requests and customer queries</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
        >
          <Download className="w-5 h-5" />
          Export to Excel
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-sm text-gray-400 mb-1">Total Inquiries</p>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-sm text-gray-400 mb-1">Callback Requests</p>
          <p className="text-2xl font-bold text-white">{stats.callbacks}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-sm text-gray-400 mb-1">Queries</p>
          <p className="text-2xl font-bold text-white">{stats.queries}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-sm text-gray-400 mb-1">Pending</p>
          <p className="text-2xl font-bold text-white">{stats.pending}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, phone, or interest..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="all">All Types</option>
          <option value="callback">Callbacks</option>
          <option value="query">Queries</option>
        </select>
        <select
          value={selectedPage}
          onChange={(e) => setSelectedPage(e.target.value)}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="all">All Pages</option>
          {uniquePages.map((page) => (
            <option key={page} value={page}>
              {page}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900 border-b border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Interest
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Source Page
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredInquiries.length > 0 ? (
                filteredInquiries.map((inquiry) => (
                  <tr key={inquiry._id} className="hover:bg-gray-750 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {format(new Date(inquiry.createdAt), 'MMM dd, yyyy')}
                      <br />
                      <span className="text-xs text-gray-500">
                        {format(new Date(inquiry.createdAt), 'HH:mm')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{inquiry.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-300 space-y-1">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span>{inquiry.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-xs">{inquiry.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-primary/20 text-primary text-xs font-medium rounded">
                        {inquiry.interest}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-300">
                        <span className="font-mono text-xs bg-gray-900 px-2 py-1 rounded">
                          {inquiry.sourcePage}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        inquiry.type === 'callback'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-purple-500/20 text-purple-400'
                      }`}>
                        {inquiry.type === 'callback' ? 'Callback' : 'Query'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setViewingInquiry(inquiry)}
                          className="p-2 text-blue-400 hover:text-blue-300 hover:bg-gray-700 rounded transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(inquiry._id)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-gray-700 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                    No inquiries found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Inquiry Modal */}
      {viewingInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-700">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-2xl font-bold text-white">Inquiry Details</h2>
              <button
                onClick={() => setViewingInquiry(null)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Name</p>
                  <p className="text-white font-medium">{viewingInquiry.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Type</p>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    viewingInquiry.type === 'callback'
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-purple-500/20 text-purple-400'
                  }`}>
                    {viewingInquiry.type === 'callback' ? 'Callback Request' : 'Query'}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Phone</p>
                  <p className="text-white">{viewingInquiry.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Email</p>
                  <p className="text-white">{viewingInquiry.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Interest</p>
                  <p className="text-white">{viewingInquiry.interest}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Source Page</p>
                  <p className="text-white font-mono text-sm">{viewingInquiry.sourcePage}</p>
                </div>
                {viewingInquiry.message && (
                  <div className="col-span-2">
                  <p className="text-sm text-gray-400 mb-1">Message</p>
                  <p className="text-white bg-gray-900 p-3 rounded-lg">{viewingInquiry.message}</p>
                </div>
                )}
                <div className="col-span-2">
                  <p className="text-sm text-gray-400 mb-1">Date & Time</p>
                  <p className="text-white">
                    {format(new Date(viewingInquiry.createdAt), 'MMMM dd, yyyy HH:mm:ss')}
                  </p>
                </div>
                {viewingInquiry.notes && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-400 mb-1">Notes</p>
                    <p className="text-white bg-gray-900 p-3 rounded-lg">{viewingInquiry.notes}</p>
                  </div>
                )}
                {viewingInquiry.status && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-400 mb-1">Status</p>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      viewingInquiry.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      viewingInquiry.status === 'contacted' ? 'bg-blue-500/20 text-blue-400' :
                      viewingInquiry.status === 'resolved' ? 'bg-green-500/20 text-green-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {viewingInquiry.status}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center justify-end gap-4 p-6 border-t border-gray-700 bg-gray-900">
              <button
                onClick={() => setViewingInquiry(null)}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

