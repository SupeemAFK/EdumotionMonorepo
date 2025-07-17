'use client';

import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Sparkles, Shield, GraduationCap } from 'lucide-react';
import { z } from 'zod';
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { authClient } from '@/lib/auth-client';

const SignUpSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(50, "Password must be less than 50 characters"),
    confirmPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(50, "Password must be less than 50 characters")
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});
type SignUpSchemaType = z.infer<typeof SignUpSchema>;

const SignInSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(3, "Password is required")
      .max(50, "Password must be less than 50 characters"),
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

    const onSubmitSignup: SubmitHandler<SignUpSchemaType> = async (formData) => {
        setIsSubmitting(true);
        try {
            const { data, error } = await authClient.signUp.email({
                email: formData.email,
                password: formData.password,
                name: formData.name,
                image: "",
            });
            console.log(data, error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const onSubmitSignin: SubmitHandler<SignInSchemaType> = async (formData) => {
        setIsSubmitting(true);
        try {
            const { data, error } = await authClient.signIn.email({
                email: formData.email,
                password: formData.password,
            });
            console.log(data, error);
        } finally {
            setIsSubmitting(false);
        }
    }

    const signinWithGoogle = async () => {
        const data = await authClient.signIn.social({
            provider: "google"
        })
        console.log(data)
    }

    return (
        <div className="w-full max-w-md mx-auto">
            {/* Educational card with light theme */}
            <div className="edu-card p-8 relative overflow-hidden animate-slide-in-up">
                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-purple-50/30 rounded-2xl"></div>
                
                {/* Content */}
                <div className="relative z-10">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl mb-4 shadow-lg">
                            {isSignUp ? (
                                <Sparkles className="w-8 h-8 text-white" />
                            ) : (
                                <GraduationCap className="w-8 h-8 text-white" />
                            )}
                        </div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2 font-poppins">
                            {isSignUp ? 'Join Edumotion' : 'Welcome Back'}
                        </h1>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            {isSignUp 
                                ? 'Create your account and start your learning journey' 
                                : 'Sign in to continue your educational adventure'
                            }
                        </p>
                    </div>

                    {!isSignUp ? (
                        // Sign In Form
                        <form onSubmit={handleSubmitSignIn(onSubmitSignin)} className="space-y-6">
                            <div className="space-y-2">
                                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <div className="relative group">
                                    <input
                                        {...registerSignIn("email")}
                                        type="email"
                                        id="email"
                                        className="edu-input w-full px-4 py-4"
                                        placeholder="Enter your email"
                                    />
                                </div>
                                {signinFormState.errors.email && (
                                    <p className='text-red-500 text-sm mt-1 flex items-center gap-1'>
                                        <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                                        {signinFormState.errors.email.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Password
                                </label>
                                <div className="relative group">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        {...registerSignIn("password")}
                                        className="edu-input w-full pl-4 pr-16 py-4"
                                        placeholder="Enter your password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                                {signinFormState.errors.password && (
                                    <p className='text-red-500 text-sm mt-1 flex items-center gap-1'>
                                        <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                                        {signinFormState.errors.password.message}
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="edu-button-primary w-full py-4 px-6 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transform hover:scale-[1.02] active:scale-[0.98] transition-transform"
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Signing In...
                                    </div>
                                ) : (
                                    <>
                                        Sign In
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </>
                                )}
                            </button>
                        </form>
                    ) : (
                        // Sign Up Form
                        <form onSubmit={handleSubmitSignUp(onSubmitSignup)} className="space-y-6">
                            <div className="space-y-2">
                                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Full Name
                                </label>
                                <div className="relative group">
                                    <input
                                        type="text"
                                        id="name"
                                        {...registerSignUp("name")}
                                        className="edu-input w-full px-4 py-4"
                                        placeholder="Enter your full name"
                                    />
                                </div>
                                {signupFormState.errors.name && (
                                    <p className='text-red-500 text-sm mt-1 flex items-center gap-1'>
                                        <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                                        {signupFormState.errors.name.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="signup-email" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <div className="relative group">
                                    <input
                                        type="email"
                                        id="signup-email"
                                        {...registerSignUp("email")}
                                        className="edu-input w-full px-4 py-4"
                                        placeholder="Enter your email"
                                    />
                                </div>
                                {signupFormState.errors.email && (
                                    <p className='text-red-500 text-sm mt-1 flex items-center gap-1'>
                                        <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                                        {signupFormState.errors.email.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="signup-password" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Password
                                </label>
                                <div className="relative group">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="signup-password"
                                        {...registerSignUp("password")}
                                        className="edu-input w-full pl-4 pr-16 py-4"
                                        placeholder="Create a strong password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                                {signupFormState.errors.password && (
                                    <p className='text-red-500 text-sm mt-1 flex items-center gap-1'>
                                        <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                                        {signupFormState.errors.password.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="confirm-password" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Confirm Password
                                </label>
                                <div className="relative group">
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        id="confirm-password"
                                        {...registerSignUp("confirmPassword")}
                                        className="edu-input w-full pl-4 pr-16 py-4"
                                        placeholder="Confirm your password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                                    >
                                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                                {signupFormState.errors.confirmPassword && (
                                    <p className='text-red-500 text-sm mt-1 flex items-center gap-1'>
                                        <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                                        {signupFormState.errors.confirmPassword.message}
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="edu-button-primary w-full py-4 px-6 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transform hover:scale-[1.02] active:scale-[0.98] transition-transform"
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Creating Account...
                                    </div>
                                ) : (
                                    <>
                                        Create Account
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                                            {/* Divider */}
                        <div className="my-8 flex items-center">
                            <div className="flex-1 h-px bg-gray-300"></div>
                            <span className="px-4 text-gray-500 text-sm font-medium">or</span>
                            <div className="flex-1 h-px bg-gray-300"></div>
                        </div>

                    {/* Social Login */}
                    <div className="space-y-4">
                        <button
                            onClick={() => signinWithGoogle()}
                            type="button"
                            className="edu-button-secondary w-full flex items-center justify-center gap-3 py-4 px-6 text-lg font-semibold transform hover:scale-[1.02] active:scale-[0.98] transition-transform"
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
                            <span>Continue with Google</span>
                        </button>
                    </div>

                    {/* Toggle Mode */}
                    <div className="mt-8 text-center">
                        <p className="text-gray-600 text-sm">
                            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                            <button
                                onClick={handleToggleMode}
                                className="ml-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors cursor-pointer underline decoration-blue-400 underline-offset-2"
                            >
                                {isSignUp ? 'Sign In' : 'Sign Up'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
} 