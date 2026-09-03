
import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-gray-900">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          {/* Brand */}
          <div>
            <Link
              href="/"
              className="flex items-center gap-2 text-lg font-semibold tracking-tight text-white"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
                R
              </div>

              <span>CubeSolver</span>
            </Link>

            <p className="mt-3 max-w-sm text-sm leading-6 text-gray-400">
              A simple and smart tool for scanning and solving 3×3 Rubik&apos;s
              Cubes.
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
            <Link
              href="/#features"
              className="text-gray-400 transition hover:text-white"
            >
              Features
            </Link>

            <Link
              href="/#how-it-works"
              className="text-gray-400 transition hover:text-white"
            >
              How It Works
            </Link>

            <Link
              href="/#scanner"
              className="text-gray-400 transition hover:text-white"
            >
              Scanner
            </Link>
          </nav>
        </div>

        {/* Bottom */}
        <div className="mt-8 border-t border-gray-800 pt-6">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} CubeSolver. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

