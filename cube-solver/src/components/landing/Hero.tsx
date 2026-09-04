import Link from "next/link";
import RealisticCube from "./RealisticCube";
import { Check, MoveRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gray-50">
      <div className="pointer-events-none absolute -left-24 top-20 h-64 w-64 rounded-full bg-blue-100 blur-3xl" />

      <div className="pointer-events-none absolute -right-24 top-20 h-72 w-72 rounded-full bg-purple-100 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-20">

        <div>
          <div className="inline-flex rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm">
            Rubik&apos;s Cube Solver
          </div>

          <h1 className="mt-5 max-w-2xl text-4xl font-bold leading-tight tracking-tight text-gray-900 sm:text-5xl">
            Solve your Rubik&apos;s Cube

            <span className="block bg-gradient-to-r from-red-600 via-orange-500 via-yellow-500 via-green-500 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              in a few simple steps.
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-base leading-7 text-gray-600 sm:text-lg">
            Scan your cube, detect its colors automatically, and get a
            step-by-step solution.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/scanner"
              className="rounded-lg bg-blue-600 px-5 py-3 text-center text-sm font-medium text-white hover:bg-blue-700"
            >
              Scan My Cube <MoveRight/>
            </Link>

            <Link
              href="#how-it-works"
              className="rounded-lg border border-gray-300 bg-white px-5 py-3 text-center text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              How It Works
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap gap-4 text-sm text-gray-500">
            <span> Color Detection</span><Check className="text-green-400"/>
            <span> Cube Validation</span><Check className="text-green-400"/>
            <span> Solution</span><Check className="text-green-400"/>
          </div>
        </div>

        <div className="flex justify-center lg:justify-end">
          <RealisticCube />
        </div>

      </div>
    </section>
  );
}