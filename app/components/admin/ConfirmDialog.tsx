'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { AlertTriangle, EyeOff, Trash2, Info, Globe } from 'lucide-react';

type ConfirmVariant = 'danger' | 'warning' | 'success' | 'info';

export interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

/**
 * Promise-based confirmation. Replaces window.confirm():
 *   const confirm = useConfirm();
 *   if (await confirm({ title: 'Delete?', variant: 'danger' })) { ... }
 */
export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error('useConfirm must be used within a <ConfirmProvider>');
  }
  return ctx;
}

const VARIANTS: Record<
  ConfirmVariant,
  { icon: typeof AlertTriangle; iconWrap: string; confirmBtn: string }
> = {
  danger: {
    icon: Trash2,
    iconWrap: 'bg-red-500/15 text-red-400',
    confirmBtn: 'bg-red-600 hover:bg-red-500 focus-visible:ring-red-500',
  },
  warning: {
    icon: EyeOff,
    iconWrap: 'bg-amber-500/15 text-amber-400',
    confirmBtn: 'bg-amber-600 hover:bg-amber-500 focus-visible:ring-amber-500',
  },
  success: {
    icon: Globe,
    iconWrap: 'bg-emerald-500/15 text-emerald-400',
    confirmBtn: 'bg-emerald-600 hover:bg-emerald-500 focus-visible:ring-emerald-500',
  },
  info: {
    icon: Info,
    iconWrap: 'bg-primary/15 text-primary',
    confirmBtn: 'bg-primary hover:bg-primary/90 focus-visible:ring-primary',
  },
};

interface InternalState extends ConfirmOptions {
  open: boolean;
  resolve: ((value: boolean) => void) | null;
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<InternalState>({
    open: false,
    title: '',
    resolve: null,
  });
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  const confirm = useCallback<ConfirmFn>((options) => {
    return new Promise<boolean>((resolve) => {
      setState({ ...options, open: true, resolve });
    });
  }, []);

  const close = useCallback(
    (result: boolean) => {
      setState((prev) => {
        prev.resolve?.(result);
        return { ...prev, open: false, resolve: null };
      });
    },
    []
  );

  // Escape to cancel; focus the confirm button when opened.
  useEffect(() => {
    if (!state.open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close(false);
    };
    document.addEventListener('keydown', onKeyDown);
    const t = window.setTimeout(() => confirmButtonRef.current?.focus(), 0);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      window.clearTimeout(t);
    };
  }, [state.open, close]);

  const variant = VARIANTS[state.variant ?? 'info'];
  const Icon = variant.icon;

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state.open && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm motion-safe:animate-overlay-in"
          onClick={() => close(false)}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby={state.message ? 'confirm-message' : undefined}
            className="w-full max-w-md rounded-xl border border-gray-700 bg-gray-800 p-6 shadow-2xl motion-safe:animate-dialog-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <div className={`flex-shrink-0 rounded-full p-3 ${variant.iconWrap}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div className="flex-1 pt-1">
                <h2 id="confirm-title" className="text-lg font-semibold text-white">
                  {state.title}
                </h2>
                {state.message && (
                  <p id="confirm-message" className="mt-1.5 text-sm leading-relaxed text-gray-400">
                    {state.message}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => close(false)}
                className="cursor-pointer rounded-lg border border-gray-600 px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500"
              >
                {state.cancelLabel ?? 'Cancel'}
              </button>
              <button
                ref={confirmButtonRef}
                type="button"
                onClick={() => close(true)}
                className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800 ${variant.confirmBtn}`}
              >
                {state.confirmLabel ?? 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
