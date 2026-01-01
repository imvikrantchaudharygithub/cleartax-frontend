'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { signupSchema, SignupFormData } from '@/app/lib/schemas/calculatorSchemas';
import Input from '@/app/components/ui/Input';
import Checkbox from '@/app/components/ui/Checkbox';
import Button from '@/app/components/ui/Button';
import FormError from '@/app/components/forms/FormError';
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
    console.log('Signup data:', data);
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex bg-light-blue">
      {/* Left Column - Visual */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-accent via-primary to-accent relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-pattern opacity-10"></div>
        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-white">
          <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center mb-8">
            <User className="w-16 h-16" />
          </div>
          <h2 className="text-4xl font-heading font-bold mb-4 text-center">
            Join ClearTax Today
          </h2>
          <p className="text-xl text-center max-w-md mb-8">
            Get access to powerful calculators and compliance tools
          </p>
          <div className="space-y-4">
            {['Free Forever', 'Unlimited Calculations', '24/7 Support', 'Expert Guidance'].map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + i * 0.1 }}
                className="flex items-center space-x-3"
              >
                <Check className="w-6 h-6" />
                <span className="text-lg">{benefit}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Right Column - Form */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="flex-1 flex items-center justify-center p-8"
      >
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-heading font-bold text-primary mb-2">
                Create Account
              </h1>
              <p className="text-gray-600">Start your journey with us</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Full Name"
                type="text"
                placeholder="John Doe"
                prefixIcon={<User className="w-5 h-5" />}
                error={errors.fullName?.message}
                {...register('fullName')}
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="your@email.com"
                prefixIcon={<Mail className="w-5 h-5" />}
                error={errors.email?.message}
                {...register('email')}
              />

              <Input
                label="Phone Number"
                type="tel"
                placeholder="9876543210"
                prefixIcon={<Phone className="w-5 h-5" />}
                error={errors.phone?.message}
                {...register('phone')}
              />

              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password"
                prefixIcon={<Lock className="w-5 h-5" />}
                suffixIcon={
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowPassword(!showPassword)}
                    className="focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5 text-gray-400" />
                    ) : (
                      <Eye className="w-5 h-5 text-gray-400" />
                    )}
                  </motion.button>
                }
                error={errors.password?.message}
                {...register('password')}
              />

              {/* Password Strength Meter */}
              {password && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-2"
                >
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ delay: i * 0.1 }}
                        className={`h-1.5 rounded-full ${
                          i < passwordStrength
                            ? passwordStrength <= 2
                              ? 'bg-error'
                              : passwordStrength <= 4
                              ? 'bg-warning'
                              : 'bg-success'
                            : 'bg-gray-200'
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
                            <Check className="w-4 h-4 text-success mr-2" />
                          ) : (
                            <X className="w-4 h-4 text-gray-400 mr-2" />
                          )}
                          <span className={isMet ? 'text-success' : 'text-gray-500'}>
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
                prefixIcon={<Lock className="w-5 h-5" />}
                suffixIcon={
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="focus:outline-none"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5 text-gray-400" />
                    ) : (
                      <Eye className="w-5 h-5 text-gray-400" />
                    )}
                  </motion.button>
                }
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />

              <Checkbox
                label={
                  <span className="text-sm">
                    I agree to the{' '}
                    <Link href="/terms" className="text-accent hover:underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-accent hover:underline">
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

            <p className="mt-8 text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-accent font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

