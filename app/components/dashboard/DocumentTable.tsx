'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ComplianceDocument } from '@/app/lib/api/types';
import Badge from '../ui/Badge';
import IconTile from '../fv/IconTile';
import { FileText, Download } from 'lucide-react';
import { format } from 'date-fns';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface DocumentTableProps {
  documents: ComplianceDocument[];
}

const TH = 'whitespace-nowrap px-4 py-3 text-left text-[13px] font-semibold text-fv-navy';
const TD = 'px-4 py-4 text-sm text-fv-slate';

export default function DocumentTable({ documents }: DocumentTableProps) {
  const tableRef = useRef<HTMLTableElement>(null);

  useEffect(() => {
    const table = tableRef.current;
    if (!table) return;
    // Reduced motion: rows render in place.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const rows = table.querySelectorAll('tbody tr');

    gsap.fromTo(
      rows,
      { opacity: 0, x: -20 },
      {
        opacity: 1,
        x: 0,
        duration: 0.4,
        stagger: 0.08,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: table,
          start: 'top 85%',
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.vars.trigger === table) {
          trigger.kill();
        }
      });
    };
  }, [documents]);

  const getStatusVariant = (status: string): 'success' | 'warning' | 'error' | 'default' => {
    switch (status) {
      case 'verified':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <IconTile icon={FileText} color="blue" size="lg" className="mb-4" />
        <p className="text-fv-slate">No documents uploaded yet</p>
      </div>
    );
  }

  return (
    // Below sm the name column is capped so the next column peeks in — a cue that the table scrolls sideways.
    <div className="overflow-x-auto">
      <table ref={tableRef} className="w-full min-w-[720px]">
        <thead>
          <tr className="bg-fv-wash">
            <th scope="col" className={`${TH} rounded-l-lg`}>Document Name</th>
            <th scope="col" className={TH}>Type</th>
            <th scope="col" className={TH}>Upload Date</th>
            <th scope="col" className={TH}>Size</th>
            <th scope="col" className={TH}>Status</th>
            <th scope="col" className={`${TH} rounded-r-lg text-right`}>Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-fv-line">
          {documents.map((doc) => (
            <tr
              key={doc._id || doc.name + doc.uploadDate}
              className="transition-colors hover:bg-fv-wash"
            >
              <td className="px-4 py-4">
                <div className="flex items-center gap-3">
                  <IconTile icon={FileText} color="blue" size="sm" />
                  <span className="max-w-[200px] break-words font-semibold text-fv-navy sm:max-w-none">{doc.name}</span>
                </div>
              </td>
              <td className={`${TD} whitespace-nowrap`}>{doc.type}</td>
              <td className={`${TD} whitespace-nowrap tabular-nums`}>
                {format(new Date(doc.uploadDate), 'MMM dd, yyyy')}
              </td>
              <td className={`${TD} whitespace-nowrap tabular-nums`}>{doc.size}</td>
              <td className="px-4 py-4">
                <Badge variant={getStatusVariant(doc.status)}>
                  {doc.status}
                </Badge>
              </td>
              <td className="px-4 py-4 text-right">
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-md text-sm font-semibold text-fv-blue-d transition-colors hover:text-fv-blue-dd"
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  Download
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
