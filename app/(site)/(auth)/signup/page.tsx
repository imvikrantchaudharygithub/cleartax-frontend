'use client';

import { useState } from 'react';
import type { CSSProperties } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, useReducedMotion } from 'framer-motion';
import { clsx } from 'clsx';
import { signupSchema, SignupFormData } from '@/app/lib/schemas/calculatorSchemas';
import Input from '@/app/components/fv/Input';
import Checkbox from '@/app/components/ui/Checkbox';
import Button from '@/app/components/fv/Button';
import FormError from '@/app/components/forms/FormError';
import IconTile from '@/app/components/fv/IconTile';
import { LIGHT_HERO_BG } from '@/app/components/fv/LightHero';
import { fvColorVars } from '@/app/lib/fv/colors';
import { Eye, EyeOff, Lock, Mail, User, Phone, Check, X } from 'lucide-react';

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      terms: false,
    },
  });

  const password = watch('password');
  // The meter animates width/height, which MotionConfig's reducedMotion="user" leaves running.
  const reduceMotion = useReducedMotion();

  const passwordRequirements = [
    { label: 'At least 8 characters', test: (pwd: string) => pwd.length >= 8 },
    { label: 'One uppercase letter', test: (pwd: string) => /[A-Z]/.test(pwd) },
    { label: 'One lowercase letter', test: (pwd: string) => /[a-z]/.test(pwd) },
    { label: 'One number', test: (pwd: string) => /[0-9]/.test(pwd) },
    { label: 'One special character', test: (pwd: string) => /[^A-Za-z0-9]/.test(pwd) },
  ];

  const passwordStrength = passwordRequirements.filter((req) => req.test(password || '')).length;

  const onSubmit = async (data: SignupFormData) => {
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
        <div className="relative z-10 flex w-full flex-col items-center justify-center p-12">
          <IconTile icon={User} color="blue" size="xl" solid className="mb-8" />
          <h2 className="mb-4 text-center text-4xl font-extrabold tracking-tight text-fv-navy">
            Join FinVidhi Today
          </h2>
          <p className="mb-8 max-w-md text-center text-lg leading-relaxed text-fv-slate">
            Get access to powerful calculators and compliance tools
          </p>
          <div className="space-y-4">
            {['Free Forever', 'Unlimited Calculations', '24/7 Support', 'Expert Guidance'].map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + i * 0.1 }}
                className="flex items-center gap-3"
              >
                <IconTile icon={Check} color="green" size="sm" />
                <span className="text-lg font-semibold text-fv-navy">{benefit}</span>
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
                Create Account
              </h1>
              <p className="text-fv-slate">Start your journey with us</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Full Name"
                type="text"
                placeholder="John Doe"
                prefixIcon={<User className="w-5 h-5" aria-hidden="true" />}
                error={errors.fullName?.message}
                {...register('fullName')}
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="your@email.com"
                prefixIcon={<Mail className="w-5 h-5" aria-hidden="true" />}
                error={errors.email?.message}
                {...register('email')}
              />

              <Input
                label="Phone Number"
                type="tel"
                placeholder="9876543210"
                prefixIcon={<Phone className="w-5 h-5" aria-hidden="true" />}
                error={errors.phone?.message}
                {...register('phone')}
              />

              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password"
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

              {/* Password Strength Meter */}
              {password && (
                <motion.div
                  initial={reduceMotion ? false : { opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-2"
                >
                  <div
                    className="flex gap-1"
                    style={fvColorVars(passwordStrength <= 2 ? 'red' : passwordStrength <= 4 ? 'yellow' : 'green') as CSSProperties}
                  >
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={reduceMotion ? false : { width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ delay: i * 0.1 }}
                        className={`h-1.5 rounded-full ${
                          i < passwordStrength ? 'bg-[var(--c)]' : 'bg-fv-line'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="space-y-1">
                    {passwordRequirements.map((req, i) => {
                      const isMet = req.test(password);
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex items-center text-xs"
                        >
                          {isMet ? (
                            <Check className="w-4 h-4 text-fv-green-d mr-2" aria-hidden="true" />
                          ) : (
                            <X className="w-4 h-4 text-fv-muted mr-2" aria-hidden="true" />
                          )}
                          <span className={isMet ? 'text-fv-green-d' : 'text-fv-slate'}>
                            {req.label}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              <Input
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                prefixIcon={<Lock className="w-5 h-5" aria-hidden="true" />}
                suffixIcon={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    className="grid place-items-center rounded-md p-1 text-fv-slate transition-colors hover:text-fv-navy"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" aria-hidden="true" />
                    ) : (
                      <Eye className="w-5 h-5" aria-hidden="true" />
                    )}
                  </button>
                }
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />

              <Checkbox
                label={
                  <span className="text-sm">
                    I agree to the{' '}
                    <Link href="/terms" className="font-semibold text-fv-blue-d hover:underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="font-semibold text-fv-blue-d hover:underline">
                      Privacy Policy
                    </Link>
                  </span>
                }
                checked={watch('terms')}
                onChange={(e) => setValue('terms', e.target.checked)}
                error={errors.terms?.message}
              />

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
                Create Account
              </Button>
            </form>

            <p className="mt-8 text-center text-sm text-fv-slate">
              Already have an account?{' '}
              <Link href="/auth/login" className="font-semibold text-fv-blue-d hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

