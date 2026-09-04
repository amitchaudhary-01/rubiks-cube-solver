import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-gray-700 text-gray-400">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          
          {/* Brand Info */}
          <div className="md:col-span-2">
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
              A smart tool for scanning, solving, and tracking your 3×3 Rubik&apos;s Cube progress with high-speed algorithms.
            </p>
          </div>

          {/* App Navigation */}
          <div>
            <h3 className="text-sm font-semibold text-blue-500 uppercase tracking-wider">App</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <Link href="/#scanner" className="transition hover:text-white">
                  Scanner
                </Link>
              </li>
              <li>
                <Link href="/solver" className="transition hover:text-white">
                  Solver
                </Link>
              </li>
              <li>
                <Link href="/statistics" className="transition hover:text-white">
                  Statistics
                </Link>
              </li>
              <li>
                <Link href="/history" className="transition hover:text-white">
                  Solve History
                </Link>
              </li>
            </ul>
          </div>

          {/* Account & Auth */}
          <div>
            <h3 className="text-sm font-semibold text-blue-500 uppercase tracking-wider">Account</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <Link href="/login" className="transition hover:text-white">
                  Login
                </Link>
              </li>
              <li>
                <Link href="/register" className="transition hover:text-white">
                  Register
                </Link>
              </li>
              <li>
                <Link href="/forgot-password" className="transition hover:text-white">
                  Forgot Password
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-10 border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500">
          <p>© {new Date().getFullYear()} CubeSolver. All rights reserved.</p>
          <div className="mt-4 sm:mt-0 flex space-x-6">
            <span className="hover:text-gray-400 transition cursor-pointer">Privacy Policy</span>
            <span className="hover:text-gray-400 transition cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}