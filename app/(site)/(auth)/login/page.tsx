'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { loginSchema, LoginFormData } from '@/app/lib/schemas/calculatorSchemas';
import Input from '@/app/components/fv/Input';
import Checkbox from '@/app/components/ui/Checkbox';
import Button from '@/app/components/fv/Button';
import FormError from '@/app/components/forms/FormError';
import IconTile from '@/app/components/fv/IconTile';
import { LIGHT_HERO_BG } from '@/app/components/fv/LightHero';
import { Eye, EyeOff, Lock, Mail, LogIn } from 'lucide-react';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
  };

  return (
    // Reduced motion: the site-wide MotionProvider ((site)/layout.tsx) drops the slide-ins.
    <div className="min-h-screen flex bg-fv-wash">
      {/* Left Column - Visual (light, theme rule 1) */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className={clsx('hidden lg:flex lg:w-1/2 relative overflow-hidden border-r border-fv-line', LIGHT_HERO_BG)}
      >
        <div className="relative z-10 flex w-full flex-col items-center justify-center p-12 text-center">
          <IconTile icon={LogIn} color="blue" size="xl" solid className="mb-8" />
          <h2 className="mb-4 text-4xl font-extrabold tracking-tight text-fv-navy">
            Welcome Back!
          </h2>
          <p className="mb-8 max-w-md text-lg leading-relaxed text-fv-slate">
            Access your personalized tax and compliance dashboard
          </p>
          <div className="grid grid-cols-2 gap-4 text-center">
            {[
              { value: '50K+', label: 'Active Users' },
              { value: '1M+', label: 'Calculations' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + i * 0.1 }}
                className="fv-card px-6 py-4"
              >
                <p className="text-3xl font-extrabold tracking-tight text-fv-navy">{stat.value}</p>
                <p className="text-sm text-fv-slate">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Right Column - Form */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex-1 flex items-center justify-center px-4 py-12 sm:p-8"
      >
        <div className="w-full max-w-md">
          <div className="fv-card p-6 shadow-fv-raised sm:p-8">
            <div className="text-center mb-8">
              <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-fv-navy">
                Sign In
              </h1>
              <p className="text-fv-slate">Access your account</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="your@email.com"
                prefixIcon={<Mail className="w-5 h-5" aria-hidden="true" />}
                error={errors.email?.message}
                {...register('email')}
              />

              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                prefixIcon={<Lock className="w-5 h-5" aria-hidden="true" />}
                suffixIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="grid place-items-center rounded-md p-1 text-fv-slate transition-colors hover:text-fv-navy"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" aria-hidden="true" />
                    ) : (
                      <Eye className="w-5 h-5" aria-hidden="true" />
                    )}
                  </button>
                }
                error={errors.password?.message}
                {...register('password')}
              />

              <div className="flex items-center justify-between gap-4">
                <Checkbox
                  label="Remember me"
                  checked={watch('rememberMe')}
                  onChange={(e) => setValue('rememberMe', e.target.checked)}
                />
                <Link
                  href="/auth/forgot-password"
                  className="whitespace-nowrap text-sm font-semibold text-fv-blue-d hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>

              {Object.keys(errors).length > 0 && (
                <FormError message="Please fix the errors above" />
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={isSubmitting}
              >
                Sign In
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-fv-line"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-3 text-fv-slate">Or continue with</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <Button variant="tertiary" size="md" className="w-full">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google
                </Button>
                <Button variant="tertiary" size="md" className="w-full">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" />
                  </svg>
                  Facebook
                </Button>
              </div>
            </div>

            <p className="mt-8 text-center text-sm text-fv-slate">
              Don&apos;t have an account?{' '}
              <Link href="/auth/signup" className="font-semibold text-fv-blue-d hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

