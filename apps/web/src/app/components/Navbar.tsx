"use client"

import { useState } from "react";
import { HiMenu, HiX } from "react-icons/hi";
import { FaUser, FaChalkboardTeacher, FaVideo, FaGraduationCap } from "react-icons/fa";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: session } = authClient.useSession();
  const router = useRouter();

  const signout = async () => {
    await authClient.signOut();
    router.push('/auth')
  }

  return (
    <nav className="w-full bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-sm fixed top-0 left-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center gap-3 group">
              <div className="relative">
                <img 
                  src="/Icon.png" 
                  alt="Edumotion Logo" 
                  className="h-10 w-10 rounded-xl shadow-md transition-transform duration-200 group-hover:scale-105" 
                />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse-soft"></div>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xl text-gray-800 tracking-tight">Edumotion</span>
                <span className="text-xs text-blue-600 font-medium">Learn & Grow</span>
              </div>
            </div>
          </Link>

          {/* Desktop Menu */}
          {session?.user ? (
            <div className="hidden md:flex items-center gap-2">
              <Link href="/" className="nav-link group">
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200">
                  <FaUser className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Student</span>
                </div>
              </Link>
              <Link href="/teacher" className="nav-link group">
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-gray-700 hover:text-green-600 hover:bg-green-50 transition-all duration-200">
                  <FaChalkboardTeacher className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Teacher</span>
                </div>
              </Link>
              <Link href="/video-editor" className="nav-link group">
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-gray-700 hover:text-purple-600 hover:bg-purple-50 transition-all duration-200">
                  <FaVideo className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Video Editor</span>
                </div>
              </Link>
              
              {/* Divider */}
              <div className="w-px h-8 bg-gray-200 mx-2"></div>
              
              {/* User Profile */}
              <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
                <img 
                  src={session?.user.image || "/placeholderProfile.png"} 
                  alt="Profile" 
                  className="h-8 w-8 rounded-full border-2 border-white shadow-sm" 
                />
                <span className="font-medium text-gray-800 text-sm">{session?.user.name}</span>
              </div>
              
              <button 
                onClick={signout} 
                className="ml-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium text-sm shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2 text-gray-600">
                <FaGraduationCap className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium">Ready to learn?</span>
              </div>
              <button 
                onClick={() => router.push('/auth')} 
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-semibold text-sm shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
              >
                Get Started
              </button>
            </div>
          )}

          {/* Mobile Menu Button */}
          {session?.user ? (
            <button
              className="md:hidden flex items-center justify-center p-2 rounded-xl hover:bg-gray-100 transition-colors duration-200"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <HiX size={24} className="text-gray-600" />
              ) : (
                <HiMenu size={24} className="text-gray-600" />
              )}
            </button>
          ) : (
            <button 
              onClick={() => router.push('/auth')} 
              className="md:hidden px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-semibold text-sm shadow-md"
            >
              Sign In
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-lg border-t border-gray-200/50 shadow-lg animate-slide-in-up">
          <div className="px-4 py-4 space-y-3">
            <Link href="/" className="mobile-nav-link">
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200">
                <FaUser className="w-5 h-5" />
                <span className="font-medium">Student Dashboard</span>
              </div>
            </Link>
            <Link href="/teacher" className="mobile-nav-link">
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:text-green-600 hover:bg-green-50 transition-all duration-200">
                <FaChalkboardTeacher className="w-5 h-5" />
                <span className="font-medium">Teacher Portal</span>
              </div>
            </Link>
            <Link href="/video-editor" className="mobile-nav-link">
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:text-purple-600 hover:bg-purple-50 transition-all duration-200">
                <FaVideo className="w-5 h-5" />
                <span className="font-medium">Video Editor</span>
              </div>
            </Link>
            
            {/* User Profile Mobile */}
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 mt-4">
              <img 
                src={session?.user.image || "/placeholderProfile.png"} 
                alt="Profile" 
                className="h-10 w-10 rounded-full border-2 border-white shadow-sm" 
              />
              <div className="flex-1">
                <p className="font-medium text-gray-800">{session?.user.name}</p>
                <p className="text-sm text-gray-600">Student</p>
              </div>
            </div>
            
            <button 
              onClick={signout} 
              className="w-full px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium shadow-md"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
