'use client';

import { FormEvent, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Phone, X } from 'lucide-react';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';

type RequestCallbackModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function RequestCallbackModal({ open, onClose }: RequestCallbackModalProps) {
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
      window.scrollTo(0, scrollY);
    };
  }, [open]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const interest = data.get('interest') as string;
    
    try {
      const { inquiryService } = await import('@/app/lib/api');
      await inquiryService.create({
        name: data.get('name') as string,
        phone: data.get('phone') as string,
        email: data.get('email') as string,
        interest: interest || 'General Inquiry', // Default for callback modal
        notes: data.get('notes') as string || `Interested in ${interest}`,
        sourcePage: window.location.pathname,
        type: 'callback',
      });
      // Toast notification is handled by apiPost in axios.ts
      onClose();
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      // Toast notification is handled by apiPost in axios.ts
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none overflow-y-auto overscroll-contain">
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className={clsx(
                'relative w-full max-w-[520px] bg-white rounded-2xl shadow-2xl border border-gray-100 pointer-events-auto',
                'overflow-hidden max-h-[90vh] my-auto'
              )}
            >
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-white to-primary/5 pointer-events-none" />
            <div className="relative p-5 sm:p-8 overflow-y-auto max-h-[90vh]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-primary text-white flex items-center justify-center shadow-md">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                      Talk to us
                    </p>
                    <h2 className="font-heading font-bold text-xl text-gray-900">
                      Request a Callback
                    </h2>
                  </div>
                </div>
                <button
                  aria-label="Close"
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">Full name</label>
                    <input
                      name="name"
                      required
                      placeholder="Jane Doe"
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-base shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none transition"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">Phone</label>
                    <input
                      name="phone"
                      required
                      placeholder="+91 98765 43210"
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-base shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="name@company.com"
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-base shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none transition"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">Interested in</label>
                    <select
                      name="interest"
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-base shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none transition"
                      defaultValue="GST Services"
                    >
                      <option>GST Services</option>
                      <option>Income Tax</option>
                      <option>Business Registration</option>
                      <option>Trademark & IP</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">Notes</label>
                  <textarea
                    name="notes"
                    rows={3}
                    placeholder="Share anything specific you need help with"
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-base shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none transition resize-none"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
                  <p className="text-xs text-gray-500">
                    We respond within one business day. No spam, ever.
                  </p>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-accent to-primary text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    <Phone className="w-4 h-4" />
                    Request callback
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
        </>
      )}
    </AnimatePresence>
  );
}

