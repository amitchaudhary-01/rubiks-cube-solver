"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
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

        {/* Navigation */}
        <nav className="hidden items-center gap-7 md:flex">
          <Link
            href="/#features"
            className="text-sm font-medium text-gray-600 transition hover:text-gray-900"
          >
            Features
          </Link>

          <Link
            href="/#how-it-works"
            className="text-sm font-medium text-gray-600 transition hover:text-gray-900"
          >
            How It Works
          </Link>

          <Link
            href="/#scanner"
            className="text-sm font-medium text-gray-600 transition hover:text-gray-900"
          >
            Scanner
          </Link>
        </nav>

        {/* CTA */}
        <Link
          href="/#scanner"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          Start Solving
        </Link>
      </div>
    </header>
  );
}