'use client';

import { FormEvent, useEffect, useId, useRef, type RefObject } from 'react';
import { Phone, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Input from '@/app/components/fv/Input';
import Select from '@/app/components/fv/Select';
import TextArea from '@/app/components/fv/TextArea';
import Button from '@/app/components/fv/Button';
import IconTile from '@/app/components/fv/IconTile';

// Static icons only in this file: Navigation renders it on every page, so DB icon names
// (IconTileByName / getIconFromName) must never be imported here (amendment A1).
type RequestCallbackModalProps = {
  open: boolean;
  onClose: () => void;
  /** Prefills "Notes" (e.g. the solution plan summary; ≤1000 chars). */
  prefillNotes?: string;
  /** Adds and preselects an "Interested in" option (e.g. "Start a Business"). */
  interestLabel?: string;
  /** Where focus lands on close when the opener is gone or was never focused (e.g. Safari clicks). */
  returnFocusRef?: RefObject<HTMLElement | null>;
};

const BUSINESS_TYPES = [
  { value: 'individual', label: 'Individual' },
  { value: 'proprietorship', label: 'Sole Proprietorship' },
  { value: 'partnership', label: 'Partnership Firm' },
  { value: 'llp', label: 'Limited Liability Partnership (LLP)' },
  { value: 'private-limited', label: 'Private Limited Company' },
  { value: 'public-limited', label: 'Public Limited Company' },
  { value: 'other', label: 'Other' },
];

const DEFAULT_INTERESTS = ['GST Services', 'Income Tax', 'Business Registration', 'Trademark & IP', 'Other'];

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function RequestCallbackModal({
  open,
  onClose,
  prefillNotes,
  interestLabel,
  returnFocusRef,
}: RequestCallbackModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  // Callers pass an inline arrow; keep the latest one without re-running the focus effect.
  const onCloseRef = useRef(onClose);
  const returnFocusLatest = useRef(returnFocusRef);
  useEffect(() => {
    onCloseRef.current = onClose;
    returnFocusLatest.current = returnFocusRef;
  });

  // Value = label, exactly like the previous valueless <option>s (the submit handler reads it).
  const interestOptions = [
    ...(interestLabel && !DEFAULT_INTERESTS.includes(interestLabel) ? [interestLabel] : []),
    ...DEFAULT_INTERESTS,
  ].map((v) => ({ value: v, label: v }));

  useEffect(() => {
    if (!open) return;

    const scrollY = window.scrollY;
    const originalOverflow = document.body.style.overflow;
    const originalPosition = document.body.style.position;
    const originalTop = document.body.style.top;
    const originalWidth = document.body.style.width;
    
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.position = originalPosition;
      document.body.style.top = originalTop;
      document.body.style.width = originalWidth;
      // 'instant' overrides html { scroll-behavior: smooth } — otherwise the page visibly jumps
      // to the top (body was position:fixed) and smooth-scrolls back down.
      window.scrollTo({ top: scrollY, left: 0, behavior: 'instant' });
    };
  }, [open]);

  // Dialog keyboard contract: focus moves in on open, Tab / Shift+Tab stay inside, Escape closes,
  // focus returns to the opener on close. Declared after the scroll lock so its cleanup runs second.
  useEffect(() => {
    if (!open) return;
    const active = document.activeElement;
    const opener = active instanceof HTMLElement && active !== document.body ? active : null;
    dialogRef.current?.focus({ preventScroll: true });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      const dialog = dialogRef.current;
      if (event.key !== 'Tab' || !dialog) return;
      const items = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.getClientRects().length > 0);
      if (items.length === 0) {
        event.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const current = document.activeElement;
      const inside = current instanceof Node && dialog.contains(current);
      if (event.shiftKey && (!inside || current === first || current === dialog)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (!inside || current === last)) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      // The caller's returnFocusRef comes next (e.g. the plan's Request Callback button when the
      // click never focused it). The mobile drawer closes (unmounting its button) as the dialog
      // opens; the menu toggle is then the logical place to land.
      const fallback = returnFocusLatest.current?.current;
      const target =
        opener && opener.isConnected
          ? opener
          : fallback && fallback.isConnected
            ? fallback
            : document.querySelector<HTMLElement>('[aria-controls="mobile-menu"]');
      target?.focus({ preventScroll: true });
    };
  }, [open]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const interest = data.get('interest') as string;
    const businessType = data.get('businessType') as string || 'other';
    const notes = data.get('notes') as string || `Interested in ${interest}`;
    
    try {
      const { inquiryService } = await import('@/app/lib/api');
      await inquiryService.create(
        {
          name: data.get('name') as string,
          phone: data.get('phone') as string,
          email: data.get('email') as string,
          businessType: businessType,
          message: notes,
          sourcePage: window.location.pathname,
          type: 'callback',
        },
        { silent: true }
      );
      // Explicit success confirmation (same pattern as the contact form).
      toast.success("✓ Your callback request has been sent successfully! We'll call you back soon.", {
        id: 'callback-success',
      });
      onClose();
    } catch (error: any) {
      console.error('Error submitting inquiry:', error);
      toast.error(error?.message || 'Failed to submit your request. Please try again.', {
        id: 'callback-error',
      });
    }
  };

  if (!open) return null;

  return (
    <>
      <div
        aria-hidden="true"
        className="fixed inset-0 z-50 bg-fv-navy/50 backdrop-blur-sm motion-safe:animate-overlay-in"
        onClick={onClose}
      />
      <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overscroll-contain p-4">
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          className="fv-card pointer-events-auto relative my-auto max-h-[calc(100dvh-2rem)] w-full max-w-[520px] overflow-y-auto overscroll-contain p-5 shadow-fv-raised !outline-none sm:p-8 motion-safe:animate-dialog-in"
        >
          <div className="mb-5 flex items-start justify-between gap-4 sm:mb-6">
            <div className="flex min-w-0 items-center gap-3">
              <IconTile icon={Phone} color="blue" />
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider text-fv-blue-d">Talk to us</p>
                <h2 id={titleId} className="text-xl font-extrabold tracking-tight text-fv-navy sm:text-2xl">
                  Request a Callback
                </h2>
              </div>
            </div>
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="grid h-10 w-10 flex-none place-items-center rounded-lg text-fv-slate transition-colors hover:bg-fv-wash hover:text-fv-navy"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <form className="space-y-3 sm:space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              <Input label="Full name" name="name" required placeholder="Jane Doe" autoComplete="name" />
              <Input label="Phone" name="phone" type="tel" required placeholder="+91 98765 43210" autoComplete="tel" />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              <Input label="Email" type="email" name="email" placeholder="name@company.com" autoComplete="email" />
              <Select
                label="Business Type"
                name="businessType"
                required
                defaultValue="other"
                options={BUSINESS_TYPES}
              />
            </div>

            <Select
              label="Interested in"
              name="interest"
              defaultValue={interestLabel ?? 'GST Services'}
              options={interestOptions}
            />

            {/* Fields mount only while open, so defaultValue picks up the current plan on every open. */}
            <TextArea
              label="Notes"
              name="notes"
              rows={prefillNotes ? 5 : 3}
              defaultValue={prefillNotes}
              maxLength={1000}
              placeholder="Share anything specific you need help with"
            />

            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[13px] text-fv-slate">We respond within one business day. No spam, ever.</p>
              <Button type="submit" className="flex-none">
                <Phone className="h-4 w-4" aria-hidden="true" />
                Request callback
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
