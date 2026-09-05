"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold tracking-tight"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
            R
          </div>
          <span>CubeSolver</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-7 md:flex">
          <Link
            href="/#features"
            className="text-sm font-medium text-gray-600 transition hover:text-blue-700"
          >
            Features
          </Link>

          <Link
            href="/#how-it-works"
            className="text-sm font-medium text-gray-600 transition hover:text-blue-700"
          >
            How It Works
          </Link>

          <Link
            href="/#scanner"
            className="text-sm font-medium text-gray-600 transition hover:text-blue-700"
          >
            Scanner
          </Link>

          <Link
          href="/solver"
              onClick={() => setIsOpen(false)}
              className="text-sm font-medium text-gray-600 transition hover:text-blue-700"
            >Solver</Link>
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:block">
          <Link
            href="/login"
            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Login
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMenu}
          aria-label="Toggle Menu"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 transition hover:bg-gray-100 md:hidden"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            {isOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="border-b border-gray-200 bg-white px-5 py-4 md:hidden">
          <nav className="flex flex-col gap-4">
            <Link
              href="/#features"
              onClick={() => setIsOpen(false)}
              className="text-sm font-medium text-gray-600 transition hover:text-blue-700"
            >
              Features
            </Link>

            <Link
              href="/#how-it-works"
              onClick={() => setIsOpen(false)}
              className="text-sm font-medium text-gray-600 transition hover:text-blue-700"
            >
              How It Works
            </Link>

            <Link
              href="/#scanner"
              onClick={() => setIsOpen(false)}
              className="text-sm font-medium text-gray-600 transition hover:text-blue-700"
            >
              Scanner
            </Link>

            <Link
            href="/solver"
              onClick={() => setIsOpen(false)}
              className="text-sm font-medium text-gray-600 transition hover:text-blue-700"
            >Solver</Link>

            <div className="pt-2">
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="block w-full rounded-lg bg-blue-600 py-2 text-center text-sm font-medium text-white transition hover:bg-blue-700"
              >
                Login
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}