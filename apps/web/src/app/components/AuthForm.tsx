'use client';

import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { z } from 'zod';
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { authClient } from '@/lib/auth-client';

const SignUpSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z
      .string()
      .min(3)
      .max(20),
    confirmPassword: z
      .string()
      .min(3)
      .max(20)
});
type SignUpSchemaType = z.infer<typeof SignUpSchema>;

const SignInSchema = z.object({
    email: z.string().email(),
    password: z
      .string()
      .min(3)
      .max(20),
});
type SignInSchemaType = z.infer<typeof SignInSchema>;

export default function AuthForm() {
    const { 
        register: registerSignIn, 
        handleSubmit: handleSubmitSignIn, 
        reset: resetSignin,
        formState: signinFormState
    } = useForm<SignInSchemaType>({ resolver: zodResolver(SignInSchema) });
    const { 
        register: registerSignUp, 
        handleSubmit: handleSubmitSignUp, 
        reset: resetSignup,
        formState: signupFormState
    } = useForm<SignUpSchemaType>({ resolver: zodResolver(SignUpSchema) });
  
    const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleToggleMode = () => {
    setIsSignUp(!isSignUp);
    resetSignin();
    resetSignup()
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const onSubmitSignup: SubmitHandler<SignUpSchemaType> = (data) => {
    console.log(data);
  };

  const onSubmitSignin: SubmitHandler<SignInSchemaType> = (data) => {
    console.log(data);
  }

  const signinWithGoogle = async () => {
    const data = await authClient.signIn.social({
      provider: "google"
    })
    console.log(data)
  }

  return (
    <div className="min-h-screen bg-[#141414] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-gray-600">
            {isSignUp 
              ? 'Sign up to get started with your account' 
              : 'Sign in to your account to continue'
            }
          </p>
        </div>

        {!isSignUp ? (
          // Sign In Form
          <form onSubmit={handleSubmitSignIn(onSubmitSignin)} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                    {...registerSignIn("email")}
                    type="email"
                    id="email"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter your email"
                />
              </div>
              {signinFormState.errors.email && <p className='text-red-500'>{signinFormState.errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  {...registerSignIn("password")}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="cursor-pointer absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {signinFormState.errors.password && <p className='text-red-500'>{signinFormState.errors.password.message}</p>}
            </div>

            <button
              type="submit"
              className="w-full cursor-pointer bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <>
                  Sign In
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
            </button>
          </form>
        ) : (
          // Sign Up Form
          <form onSubmit={handleSubmitSignUp(onSubmitSignup)} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  id="name"
                  {...registerSignUp("name")}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Enter your full name"
                />
              </div>
              {signupFormState.errors && <p className='text-red-500'>{signupFormState.errors.name?.message}</p>}
            </div>

            <div>
              <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="email"
                  id="signup-email"
                  {...registerSignUp("email")}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Enter your email"
                />
              </div>
              {signupFormState.errors && <p className='text-red-500'>{signupFormState.errors.email?.message}</p>}
            </div>

            <div>
              <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="signup-password"
                  {...registerSignUp("password")}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="cursor-pointer absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {signupFormState.errors && <p className='text-red-500'>{signupFormState.errors.password?.message}</p>}
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirm-password"
                    {...registerSignUp("confirmPassword")}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Confirm your password"
                  />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="cursor-pointer absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {signupFormState.errors && <p className='text-red-500'>{signupFormState.errors.confirmPassword?.message}</p>}
            </div>

            <button
              type="submit"
              className="cursor-pointer w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <>
                  Create Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
            </button>
          </form>
        )}

        <div className="mt-8 text-center">
          <div className="mb-4">
            <button
              onClick={() => signinWithGoogle()}
              type="button"
              className="w-full cursor-pointer flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-lg py-3 px-4 font-medium shadow-sm hover:bg-gray-50 transition-colors"
            >
              <svg className="h-5 w-5" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_17_40)">
                  <path d="M47.532 24.552c0-1.636-.146-3.2-.418-4.704H24.48v9.02h12.98c-.56 3.02-2.24 5.58-4.78 7.3v6.06h7.74c4.54-4.18 7.11-10.34 7.11-17.676z" fill="#4285F4"/>
                  <path d="M24.48 48c6.48 0 11.92-2.14 15.89-5.82l-7.74-6.06c-2.14 1.44-4.88 2.3-8.15 2.3-6.26 0-11.56-4.22-13.46-9.9H2.5v6.22C6.46 43.98 14.7 48 24.48 48z" fill="#34A853"/>
                  <path d="M11.02 28.52c-.48-1.44-.76-2.98-.76-4.52s.28-3.08.76-4.52v-6.22H2.5A23.98 23.98 0 000 24c0 3.98.96 7.76 2.5 11.22l8.52-6.7z" fill="#FBBC05"/>
                  <path d="M24.48 9.54c3.54 0 6.68 1.22 9.16 3.62l6.86-6.86C36.4 2.14 30.96 0 24.48 0 14.7 0 6.46 4.02 2.5 10.78l8.52 6.22c1.9-5.68 7.2-9.9 13.46-9.9z" fill="#EA4335"/>
                </g>
                <defs>
                  <clipPath id="clip0_17_40">
                    <rect width="48" height="48" fill="white"/>
                  </clipPath>
                </defs>
              </svg>
              <span>Sign in with Google</span>
            </button>
          </div>
          <p className="text-gray-600">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            <button
              onClick={handleToggleMode}
              className="ml-1 text-blue-600 hover:text-blue-700 font-medium transition-colors cursor-pointer"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
} 