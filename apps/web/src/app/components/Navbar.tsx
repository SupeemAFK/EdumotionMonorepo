"use client"

import { useState } from "react";
import { HiMenu, HiX } from "react-icons/hi";
import { FaUser, FaChalkboardTeacher } from "react-icons/fa";
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
    <nav className="w-full bg-black text-white shadow-sm fixed top-0 left-0 z-50">
      <div className="px-4 flex items-center justify-between h-16">
        {/* Logo or App Name */}
        <div className="flex items-center gap-2">
          <img src="/Icon.png" alt="Logo" className="h-8 w-8" />
          <span className="font-bold text-lg">Edumotion</span>
        </div>
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-800 transition">
            <FaUser className="w-4 h-4" />
            <span>Student</span>
          </Link>
          <Link href="/teacher" className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-800 transition">
            <FaChalkboardTeacher className="w-4 h-4" />
            <span>Teacher</span>
          </Link>
          <div className="flex items-center gap-3">
            <img src={session?.user.image ? session.user.image : "/placeholderProfile.png"} alt="Profile" className="h-8 w-8 rounded-full" />
            <span className="font-medium">{session?.user.name}</span>
          </div>
          <button onClick={signout} className="cursor-pointer px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition">Logout</button>
        </div>
        {/* Hamburger Icon */}
        <button
          className="md:hidden flex items-center justify-center p-2 rounded hover:bg-gray-800"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <HiX size={24} /> : <HiMenu size={24} />}
        </button>
      </div>
      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-black border-t border-gray-800 shadow-sm px-4 py-4 flex flex-col gap-4">
          <Link href="/" className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-800 transition">
            <FaUser className="w-4 h-4" />
            <span>Student</span>
          </Link>
          <Link href="/teacher" className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-800 transition">
            <FaChalkboardTeacher className="w-4 h-4" />
            <span>Teacher</span>
          </Link>
          <div className="flex items-center gap-3">
            <img src={session?.user.image ? session.user.image : "/placeholderProfile.png"} alt="Profile" className="h-8 w-8 rounded-full border" />
            <span className="font-medium">{session?.user.name}</span>
          </div>
          <button onClick={signout} className="cursor-pointer px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition">Logout</button>
        </div>
      )}
    </nav>
  );
}
