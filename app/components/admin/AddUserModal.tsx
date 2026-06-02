'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Eye, EyeOff, AlertCircle, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { userService, AdminUserRecord } from '@/app/lib/api/services/user.service';

const schema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['admin', 'user']),
});

type FormData = z.infer<typeof schema>;

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (user: AdminUserRecord) => void;
}

export default function AddUserModal({ isOpen, onClose, onCreated }: AddUserModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'admin' },
  });

  if (!isOpen) return null;

  const close = () => {
    reset();
    setServerError(null);
    onClose();
  };

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    try {
      const user = await userService.create(data);
      toast.success(`${user.role === 'admin' ? 'Admin' : 'User'} "${user.fullName}" created`);
      onCreated(user);
      reset();
      onClose();
    } catch (err: any) {
      setServerError(err?.message || 'Failed to create user');
    }
  };

  const inputClass = (hasError: boolean) =>
    `w-full px-4 py-2.5 bg-gray-900 border rounded-lg text-gray-100 placeholder-gray-600 text-sm
     focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors
     ${hasError ? 'border-red-500' : 'border-gray-600'}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-gray-800 rounded-2xl w-full max-w-md border border-gray-700 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-2.5">
            <div className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-primary/20 border border-primary/30">
              <UserPlus className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-white">Add User</h2>
          </div>
          <button
            onClick={close}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Full name</label>
            <input
              type="text"
              autoComplete="off"
              placeholder="Jane Doe"
              {...register('fullName')}
              className={inputClass(!!errors.fullName)}
            />
            {errors.fullName && (
              <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                {errors.fullName.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Email address</label>
            <input
              type="email"
              autoComplete="off"
              placeholder="user@example.com"
              {...register('email')}
              className={inputClass(!!errors.email)}
            />
            {errors.email && (
              <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Phone</label>
            <input
              type="tel"
              autoComplete="off"
              placeholder="9876543210"
              {...register('phone')}
              className={inputClass(!!errors.phone)}
            />
            {errors.phone && (
              <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                {errors.phone.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="••••••••"
                {...register('password')}
                className={inputClass(!!errors.password)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Role</label>
            <select {...register('role')} className={inputClass(!!errors.role)}>
              <option value="admin">Admin — full access to this portal</option>
              <option value="user">User — standard account</option>
            </select>
          </div>

          {serverError && (
            <div className="flex items-start gap-2.5 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-300">{serverError}</p>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={close}
              className="px-5 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400
                text-white font-semibold rounded-lg text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center gap-2"
            >
              {isSubmitting ? 'Creating…' : 'Create user'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
