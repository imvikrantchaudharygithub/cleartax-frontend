import type { KeyboardEvent } from 'react';
import { Check } from 'lucide-react';
import { clsx } from 'clsx';
import { FV_COLOR_HEX, FV_COLOR_KEYS, type FvColor } from '@/app/lib/fv/colors';

const STEP: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };

export default function ColorSwatches({
  value,
  onChange,
  labelledBy,
}: {
  value: FvColor;
  onChange: (color: FvColor) => void;
  labelledBy: string;
}) {
  // ARIA radio-group keyboard pattern: one tab stop (the checked swatch), arrows move + select.
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = STEP[event.key];
    if (!step) return;
    event.preventDefault();
    const at = Math.max(0, FV_COLOR_KEYS.indexOf(value));
    const next = FV_COLOR_KEYS[(at + step + FV_COLOR_KEYS.length) % FV_COLOR_KEYS.length];
    onChange(next);
    event.currentTarget.querySelector<HTMLButtonElement>(`[data-color="${next}"]`)?.focus();
  };

  return (
    <div role="radiogroup" aria-labelledby={labelledBy} onKeyDown={onKeyDown} className="flex flex-wrap gap-2">
      {FV_COLOR_KEYS.map((key) => {
        const on = key === value;
        return (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={on}
            aria-label={key}
            title={key}
            data-color={key}
            tabIndex={on ? 0 : -1}
            onClick={() => onChange(key)}
            style={{ background: FV_COLOR_HEX[key].fg }}
            className={clsx(
              'grid h-9 w-9 place-items-center rounded-lg text-white ring-offset-2 ring-offset-gray-800 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400',
              on ? 'ring-2 ring-white' : 'hover:ring-2 hover:ring-gray-500',
            )}
          >
            {on && <Check className="h-4 w-4" />}
          </button>
        );
      })}
    </div>
  );
}
