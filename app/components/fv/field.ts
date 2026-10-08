import type { CSSProperties } from 'react';
import { fvColorVars } from '@/app/lib/fv/colors';

/**
 * Shared class strings for public form controls (fv/Input, fv/Select, fv/TextArea and the
 * public-only ui/RangeSlider, ui/RadioGroup, ui/Checkbox). Theme rule 5: 1px fv-line,
 * 8px radius, fv-blue-d focus ring, 16px text (no iOS zoom), always labelled.
 */
export const FV_LABEL = 'mb-1.5 block text-sm font-semibold text-fv-navy';

export const FV_CONTROL =
  'w-full rounded-[8px] border border-fv-line bg-white px-4 py-3 text-base text-fv-navy outline-none ' +
  'transition-colors duration-150 placeholder:text-fv-muted ' +
  // One indicator: the global .fv-site focus-visible outline (fv-blue-d) hugging a fv-blue-d border.
  'focus:border-fv-blue-d focus:outline-offset-0 ' +
  'disabled:cursor-not-allowed disabled:bg-fv-wash disabled:text-fv-muted';

/**
 * Error state: set FV_DANGER_VARS on an ancestor; the border uses the red category colour.
 * The aria-invalid focus rule (0,3,0) outranks FV_CONTROL's focus:border-fv-blue-d (0,2,0), so
 * the red border stays while the field is focused (the controls set aria-invalid with `error`).
 */
export const FV_CONTROL_ERROR = 'border-[var(--c)] aria-[invalid=true]:focus:border-[var(--c)]';

/** Red category colour darkened to ≥4.5:1 on white so small error text stays readable. */
export const FV_DANGER_TEXT = 'text-[color-mix(in_srgb,var(--c)_70%,#000)]';

export const FV_ERROR = `mt-1.5 text-sm font-medium ${FV_DANGER_TEXT}`;

/** CSS variables (--c/--cb/--cp) of the red category colour, for error / danger states. */
export const FV_DANGER_VARS = fvColorVars('red') as CSSProperties;
