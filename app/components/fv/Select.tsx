'use client';

import { forwardRef, useId } from 'react';
import { clsx } from 'clsx';
import { ChevronDown } from 'lucide-react';
import { FV_CONTROL, FV_CONTROL_ERROR, FV_DANGER_VARS, FV_ERROR, FV_LABEL } from './field';

/**
 * Public-site twin of the admin-shared ui Select (admin keeps it). Same props (incl. the motion-era
 * Omit list), forwardRef and default export, so imports swap unchanged; themed per spec
 * rule 5. Like the ui Select, `options` render the <option>s and JSX children are ignored.
 */
interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart' | 'onAnimationEnd'> {
  label?: string;
  error?: string;
  options: { value: string | number; label: string }[];
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, ...props }, ref) => {
    const generatedId = useId();
    const selectId = props.id ?? generatedId;
    const errorId = error ? `${selectId}-error` : undefined;

    return (
      <div className="w-full" style={error ? FV_DANGER_VARS : undefined}>
        {label && (
          <label htmlFor={selectId} className={FV_LABEL}>
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            aria-invalid={error ? true : undefined}
            aria-describedby={errorId}
            className={clsx(FV_CONTROL, 'cursor-pointer appearance-none pr-10', error && FV_CONTROL_ERROR, className)}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2">
            <ChevronDown className="h-5 w-5 text-fv-slate" aria-hidden="true" />
          </div>
        </div>
        {error && (
          <p id={errorId} role="alert" className={FV_ERROR}>
            {error}
          </p>
        )}
      </div>
    );
  },
);

Select.displayName = 'Select';

export default Select;
