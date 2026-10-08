'use client';

import { useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ComplianceDeadline } from '@/app/lib/api/types';
import Badge from '../ui/Badge';
import { Calendar, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { clsx } from 'clsx';
import { fvColorVars, type FvColor } from '@/app/lib/fv/colors';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface TimelineProps {
  deadlines: ComplianceDeadline[];
}

export default function Timeline({ deadlines }: TimelineProps) {
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timeline = timelineRef.current;
    if (!timeline) return;
    // Reduced motion: dots stay at their final state.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const dots = timeline.querySelectorAll('.timeline-dot');

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
          trigger: timeline,
          start: 'top 80%',
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.vars.trigger === timeline) {
          trigger.kill();
        }
      });
    };
  }, [deadlines]);

  // Status → category colour of the dot (fv-muted for unknown statuses).
  const getStatusColor = (status: string): FvColor | null => {
    switch (status) {
      case 'urgent':
        return 'red';
      case 'upcoming':
        return 'yellow';
      case 'completed':
        return 'green';
      default:
        return null;
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
      <div aria-hidden="true" className="absolute bottom-0 left-[15px] top-0 w-0.5 bg-fv-line" />

      {/* Timeline Items */}
      <div className="space-y-5">
        {deadlines.map((deadline, index) => {
          const color = getStatusColor(deadline.status);
          return (
            <div key={deadline._id || deadline.dueDate + index} className="relative pl-12">
              {/* Dot */}
              <div
                aria-hidden="true"
                style={color ? (fvColorVars(color) as CSSProperties) : undefined}
                className={clsx(
                  'timeline-dot absolute left-0 top-4 flex h-8 w-8 items-center justify-center rounded-full border-4 border-white shadow-fv-card',
                  color ? 'bg-[var(--c)]' : 'bg-fv-muted'
                )}
              >
                {deadline.status === 'urgent' && <AlertCircle className="h-4 w-4 text-white" />}
              </div>

              {/* Content */}
              <div className="fv-card min-w-0 p-4">
                {/* Wraps the badge under the title when the card is narrow (mobile). */}
                <div className="mb-2 flex flex-wrap items-start justify-between gap-x-3 gap-y-1.5">
                  <h3 className="min-w-0 flex-[1_1_12rem] text-base font-bold text-fv-navy">{deadline.title}</h3>
                  <Badge variant={getStatusVariant(deadline.status)} className="flex-none">
                    {deadline.status}
                  </Badge>
                </div>
                <p className="mb-3 text-sm leading-relaxed text-fv-slate">{deadline.description}</p>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center text-sm font-medium text-fv-slate">
                    <Calendar className="mr-1.5 h-4 w-4 text-fv-blue-d" aria-hidden="true" />
                    Due: {format(new Date(deadline.dueDate), 'MMM dd, yyyy')}
                  </div>
                  <Badge variant="info">{deadline.category}</Badge>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
