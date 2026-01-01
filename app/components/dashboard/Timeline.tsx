'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import { ComplianceDeadline } from '@/app/lib/api/types';
import Badge from '../ui/Badge';
import { Calendar, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { clsx } from 'clsx';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface TimelineProps {
  deadlines: ComplianceDeadline[];
}

export default function Timeline({ deadlines }: TimelineProps) {
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!timelineRef.current) return;

    const dots = timelineRef.current.querySelectorAll('.timeline-dot');

    gsap.fromTo(
      dots,
      { scale: 0, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        duration: 0.4,
        stagger: 0.15,
        ease: 'back.out(1.7)',
        scrollTrigger: {
          trigger: timelineRef.current,
          start: 'top 80%',
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.vars.trigger === timelineRef.current) {
          trigger.kill();
        }
      });
    };
  }, [deadlines]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'urgent':
        return 'bg-error';
      case 'upcoming':
        return 'bg-warning';
      case 'completed':
        return 'bg-success';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusVariant = (status: string): 'error' | 'warning' | 'success' | 'default' => {
    switch (status) {
      case 'urgent':
        return 'error';
      case 'upcoming':
        return 'warning';
      case 'completed':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <div ref={timelineRef} className="relative">
      {/* Vertical Line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

      {/* Timeline Items */}
      <div className="space-y-6">
        {deadlines.map((deadline, index) => (
          <motion.div
            key={deadline._id || deadline.dueDate + index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ x: 5 }}
            className="relative pl-12 cursor-pointer"
          >
            {/* Dot */}
            <div
              className={clsx(
                'timeline-dot absolute left-0 w-8 h-8 rounded-full border-4 border-white shadow-lg flex items-center justify-center',
                getStatusColor(deadline.status)
              )}
            >
              {deadline.status === 'urgent' && (
                <AlertCircle className="w-4 h-4 text-white" />
              )}
            </div>

            {/* Content */}
            <div className="bg-white rounded-lg shadow-card p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-primary">{deadline.title}</h4>
                <Badge variant={getStatusVariant(deadline.status)}>
                  {deadline.status}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-3">{deadline.description}</p>
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="w-4 h-4 mr-1" />
                Due: {format(new Date(deadline.dueDate), 'MMM dd, yyyy')}
              </div>
              <Badge variant="info" className="mt-2">
                {deadline.category}
              </Badge>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

