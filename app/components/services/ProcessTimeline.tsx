import { Clock } from 'lucide-react';
import { ProcessStep } from '@/app/types/services';

interface ProcessTimelineProps {
  steps: ProcessStep[];
}

export default function ProcessTimeline({ steps }: ProcessTimelineProps) {
  if (!steps?.length) return null;
  return (
    <ol className="relative space-y-5 before:absolute before:bottom-6 before:left-[19px] before:top-6 before:w-px before:bg-fv-line">
      {steps.map((step, index) => (
        <li key={`${step.step}-${index}`} className="relative flex gap-5">
          <span className="relative z-10 grid h-10 w-10 flex-none place-items-center rounded-full border-2 border-fv-blue-d bg-white text-[15px] font-extrabold text-fv-blue-d">
            {step.step}
          </span>
          <div className="fv-card min-w-0 flex-1 p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h4 className="text-base font-bold text-fv-navy">{step.title}</h4>
              {step.duration && (
                <span className="flex items-center gap-1 whitespace-nowrap text-[13px] text-fv-slate">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  {step.duration}
                </span>
              )}
            </div>
            <p className="mt-1.5 text-[15px] leading-relaxed text-fv-slate">{step.description}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
