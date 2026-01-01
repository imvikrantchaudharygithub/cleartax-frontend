'use client';

import { useState, useEffect } from 'react';
import { FileCheck, Clock, FileText, Calendar, Loader2 } from 'lucide-react';
import ScrollReveal from '@/app/components/animations/ScrollReveal';
import StatCard from '@/app/components/dashboard/StatCard';
import Timeline from '@/app/components/dashboard/Timeline';
import DocumentTable from '@/app/components/dashboard/DocumentTable';
import { complianceService } from '@/app/lib/api';
import { ComplianceDeadline, ComplianceDocument, ComplianceStats } from '@/app/lib/api/types';

export default function CompliancePage() {
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<ComplianceDeadline[]>([]);
  const [recentDocuments, setRecentDocuments] = useState<ComplianceDocument[]>([]);
  const [stats, setStats] = useState<ComplianceStats>({
    filingsDue: 0,
    completed: 0,
    documents: 0,
    lastUpdated: new Date().toISOString(),
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompliance = async () => {
      try {
        setLoading(true);
        const [deadlinesResponse, documentsResponse, statsResponse] = await Promise.all([
          complianceService.getUpcomingDeadlines(5),
          complianceService.getDocuments({ page: 1, limit: 6 }),
          complianceService.getStats()
        ]);
        setUpcomingDeadlines(deadlinesResponse);
        setRecentDocuments(documentsResponse.data || []);
        setStats(statsResponse);
      } catch (error) {
        console.error('Error fetching compliance data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompliance();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-light-blue to-white py-12 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-light-blue to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="font-heading font-bold text-4xl md:text-5xl text-primary mb-4">
            Your Compliance Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Stay on top of your tax and compliance requirements
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <StatCard
              icon={Clock}
              value={stats.filingsDue}
              label="Filings Due"
              variant="error"
            />
            <StatCard
              icon={FileCheck}
              value={stats.completed}
              label="Completed This Year"
              variant="success"
            />
            <StatCard
              icon={FileText}
              value={stats.documents}
              label="Documents Uploaded"
              variant="info"
            />
            <StatCard
              icon={Calendar}
              value={new Date().getDate()}
              label="Days Until Quarter End"
              variant="warning"
            />
          </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upcoming Deadlines */}
          <ScrollReveal direction="left">
            <div className="bg-white rounded-xl shadow-card p-6">
              <h2 className="font-heading font-semibold text-2xl text-primary mb-6">
                Upcoming Deadlines
              </h2>
              {upcomingDeadlines.length > 0 ? (
                <Timeline deadlines={upcomingDeadlines} />
              ) : (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No upcoming deadlines</p>
                </div>
              )}
            </div>
          </ScrollReveal>

          {/* Quick Actions */}
          <ScrollReveal direction="right">
            <div className="space-y-6">
              {/* Important Notice */}
              <div className="bg-warning/10 border-2 border-warning/20 rounded-xl p-6">
                <h3 className="font-heading font-semibold text-lg text-primary mb-2 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-warning" />
                  Action Required
                </h3>
                <p className="text-gray-700 mb-4">
                  You have {stats.filingsDue} pending filings that require immediate attention.
                </p>
                <button className="px-6 py-2 bg-warning text-white rounded-lg hover:bg-warning/90 transition-colors font-medium">
                  View All Deadlines
                </button>
              </div>

              {/* Quick Links */}
              <div className="bg-white rounded-xl shadow-card p-6">
                <h3 className="font-heading font-semibold text-lg text-primary mb-4">
                  Quick Links
                </h3>
                <div className="space-y-3">
                  {[
                    { label: 'File GST Return', href: '/calculators/gst' },
                    { label: 'Calculate TDS', href: '/calculators/tds' },
                    { label: 'Income Tax Filing', href: '/calculators/income-tax' },
                    { label: 'Upload Documents', href: '#' },
                  ].map((link, index) => (
                    <a
                      key={index}
                      href={link.href}
                      className="block p-3 bg-gray-50 rounded-lg hover:bg-accent/10 hover:border-accent/20 border border-transparent transition-all"
                    >
                      <span className="text-primary font-medium">{link.label}</span>
                    </a>
                  ))}
                </div>
              </div>

              {/* Tips */}
              <div className="bg-accent/10 border-2 border-accent/20 rounded-xl p-6">
                <h3 className="font-heading font-semibold text-lg text-primary mb-2">
                  💡 Pro Tip
                </h3>
                <p className="text-gray-700 text-sm">
                  Set up automatic reminders 7 days before each deadline to ensure you never miss a filing date.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Recent Documents */}
        <ScrollReveal direction="up">
          <div className="mt-12 bg-white rounded-xl shadow-card p-6">
            <h2 className="font-heading font-semibold text-2xl text-primary mb-6">
              Recent Documents
            </h2>
            <DocumentTable documents={recentDocuments} />
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}

