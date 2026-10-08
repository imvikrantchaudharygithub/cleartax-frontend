'use client';

import { forwardRef, useId } from 'react';
import { clsx } from 'clsx';
import { FV_CONTROL, FV_CONTROL_ERROR, FV_DANGER_VARS, FV_ERROR, FV_LABEL } from './field';

/**
 * Public-site twin of the admin-shared ui TextArea (admin keeps it). Same props, forwardRef and
 * default export, so imports swap unchanged; themed per spec rule 5.
 */
interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, className, ...props }, ref) => {
    const generatedId = useId();
    const textAreaId = props.id ?? generatedId;
    const errorId = error ? `${textAreaId}-error` : undefined;

    return (
      <div className="w-full" style={error ? FV_DANGER_VARS : undefined}>
        {label && (
          <label htmlFor={textAreaId} className={FV_LABEL}>
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textAreaId}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          className={clsx(FV_CONTROL, 'resize-none', error && FV_CONTROL_ERROR, className)}
          {...props}
        />
        {error && (
          <p id={errorId} role="alert" className={FV_ERROR}>
            {error}
          </p>
        )}
      </div>
    );
  },
);

TextArea.displayName = 'TextArea';

export default TextArea;
