'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import { ComplianceDocument } from '@/app/lib/api/types';
import Badge from '../ui/Badge';
import { FileText, Download } from 'lucide-react';
import { format } from 'date-fns';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface DocumentTableProps {
  documents: ComplianceDocument[];
}

export default function DocumentTable({ documents }: DocumentTableProps) {
  const tableRef = useRef<HTMLTableElement>(null);

  useEffect(() => {
    if (!tableRef.current) return;

    const rows = tableRef.current.querySelectorAll('tbody tr');

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
          trigger: tableRef.current,
          start: 'top 85%',
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.vars.trigger === tableRef.current) {
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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No documents uploaded yet</p>
      </motion.div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table ref={tableRef} className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-4 px-4 font-semibold text-primary text-sm">Document Name</th>
            <th className="text-left py-4 px-4 font-semibold text-primary text-sm">Type</th>
            <th className="text-left py-4 px-4 font-semibold text-primary text-sm">Upload Date</th>
            <th className="text-left py-4 px-4 font-semibold text-primary text-sm">Size</th>
            <th className="text-left py-4 px-4 font-semibold text-primary text-sm">Status</th>
            <th className="text-right py-4 px-4 font-semibold text-primary text-sm">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {documents.map((doc) => (
            <motion.tr
              key={doc._id || doc.name + doc.uploadDate}
              whileHover={{ backgroundColor: '#f9fafb' }}
              className="transition-colors"
            >
              <td className="py-4 px-4">
                <div className="flex items-center">
                  <FileText className="w-5 h-5 text-accent mr-2" />
                  <span className="font-medium text-gray-900">{doc.name}</span>
                </div>
              </td>
              <td className="py-4 px-4 text-gray-600 text-sm">{doc.type}</td>
              <td className="py-4 px-4 text-gray-600 text-sm">
                {format(new Date(doc.uploadDate), 'MMM dd, yyyy')}
              </td>
              <td className="py-4 px-4 text-gray-600 text-sm">{doc.size}</td>
              <td className="py-4 px-4">
                <Badge variant={getStatusVariant(doc.status)}>
                  {doc.status}
                </Badge>
              </td>
              <td className="py-4 px-4 text-right">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center text-accent hover:text-accent/80 text-sm font-medium"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </motion.button>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

