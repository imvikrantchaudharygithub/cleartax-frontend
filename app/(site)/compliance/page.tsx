'use client';

import { useState, useEffect } from 'react';
import type { CSSProperties } from 'react';
import { FileCheck, Clock, FileText, Calendar, Loader2, ArrowRight } from 'lucide-react';
import PageHero from '@/app/components/common/PageHero';
import Section from '@/app/components/fv/Section';
import IconTile from '@/app/components/fv/IconTile';
import Button from '@/app/components/fv/Button';
import { fvColorVars } from '@/app/lib/fv/colors';
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
      <div role="status" className="min-h-screen bg-white py-12 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-fv-blue-d" aria-hidden="true" />
        <span className="sr-only">Loading</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <PageHero
        icon={FileCheck}
        title="Your Compliance Dashboard"
        subtitle="Stay on top of your tax and compliance requirements"
      />
      {/* Plain markup (no ScrollReveal): its GSAP offsets ignored prefers-reduced-motion. */}
      <Section soft>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
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

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Upcoming Deadlines */}
          <div className="fv-card min-w-0 p-5 sm:p-8 lg:self-start">
            <h2 className="mb-6 text-2xl font-extrabold tracking-tight text-fv-navy">
              Upcoming Deadlines
            </h2>
            {upcomingDeadlines.length > 0 ? (
              <Timeline deadlines={upcomingDeadlines} />
            ) : (
              <div className="flex flex-col items-center py-12 text-center">
                <IconTile icon={Calendar} color="blue" size="lg" className="mb-4" />
                <p className="text-fv-slate">No upcoming deadlines</p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="min-w-0 space-y-6">
            {/* Important Notice */}
            <div
              style={fvColorVars('yellow') as CSSProperties}
              className="rounded-[14px] border border-[color-mix(in_srgb,var(--c)_35%,transparent)] bg-[var(--cp)] p-6"
            >
              <h3 className="mb-2 flex items-center gap-2.5 text-lg font-bold tracking-tight text-fv-navy">
                <IconTile icon={Clock} color="yellow" size="sm" />
                Action Required
              </h3>
              <p className="mb-4 text-fv-slate">
                You have {stats.filingsDue} pending filings that require immediate attention.
              </p>
              <Button type="button" size="sm">
                View All Deadlines
              </Button>
            </div>

            {/* Quick Links */}
            <div className="fv-card p-6">
              <h3 className="mb-4 text-lg font-bold tracking-tight text-fv-navy">
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
                    className="group flex items-center justify-between gap-3 rounded-lg border border-fv-line bg-white px-4 py-3 text-[15px] font-semibold text-fv-navy transition-colors hover:border-[#CFE2F2] hover:bg-fv-wash"
                  >
                    <span>{link.label}</span>
                    <ArrowRight
                      className="h-4 w-4 flex-none text-fv-blue-d transition-transform motion-safe:group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </a>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="rounded-[14px] border border-[#CFE2F2] bg-fv-blue-50 p-6">
              <h3 className="mb-2 text-lg font-bold tracking-tight text-fv-navy">
                💡 Pro Tip
              </h3>
              <p className="text-sm leading-relaxed text-fv-slate">
                Set up automatic reminders 7 days before each deadline to ensure you never miss a filing date.
              </p>
            </div>
          </div>
        </div>

        {/* Recent Documents */}
        <div className="mt-8 fv-card min-w-0 p-6 sm:p-8">
          <h2 className="mb-6 text-2xl font-extrabold tracking-tight text-fv-navy">
            Recent Documents
          </h2>
          <DocumentTable documents={recentDocuments} />
        </div>
      </Section>
    </div>
  );
}
