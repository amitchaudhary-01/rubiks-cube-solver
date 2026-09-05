
import Link from "next/link";
import RealisticCube from "./RealisticCube";
import { Check, MoveRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gray-50">
      {/* Background Decorative Blurs */}
      <div
        className="
          pointer-events-none
          absolute
          -left-32
          top-10
          h-56
          w-56
          rounded-full
          bg-blue-100
          blur-3xl
          sm:-left-24
          sm:top-20
          sm:h-64
          sm:w-64
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -right-32
          top-24
          h-60
          w-60
          rounded-full
          bg-purple-100
          blur-3xl
          sm:-right-24
          sm:top-20
          sm:h-72
          sm:w-72
        "
      />

      {/* Main Hero Container */}
      <div
        className="
          relative
          mx-auto
          grid
          w-full
          max-w-7xl
          grid-cols-1
          items-center
          gap-8
          px-5
          py-10
          sm:gap-10
          sm:px-6
          sm:py-14
          md:gap-12
          md:py-16
          lg:grid-cols-2
          lg:gap-16
          lg:px-8
          lg:py-20
          xl:gap-20
        "
      >
        {/* ========================================
            LEFT CONTENT
        ======================================== */}
        <div
          className="
            flex
            flex-col
            items-center
            text-center
            lg:items-start
            lg:text-left
          "
        >
          {/* Badge */}
          <div
            className="
              inline-flex
              items-center
              rounded-full
              border
              border-gray-200
              bg-white
              px-3
              py-1.5
              text-xs
              font-medium
              text-gray-600
              shadow-sm
              sm:px-4
              sm:py-2
            "
          >
            Rubik&apos;s Cube Solver
          </div>

          {/* Heading */}
          <h1
            className="
              mt-5
              max-w-2xl
              text-[2rem]
              font-bold
              leading-[1.12]
              tracking-tight
              text-gray-900
              sm:mt-6
              sm:text-4xl
              md:text-5xl
              lg:text-[3.25rem]
              xl:text-6xl
            "
          >
            Solve your Rubik&apos;s Cube

            <span
              className="
                mt-1
                block
                bg-gradient-to-r
                from-red-600
                via-orange-500
                via-yellow-500
                via-green-500
                via-blue-600
                to-purple-600
                bg-clip-text
                text-transparent
              "
            >
              in a few simple steps.
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className="
              mt-4
              max-w-xl
              text-sm
              leading-6
              text-gray-600
              sm:mt-5
              sm:text-base
              sm:leading-7
              md:text-lg
            "
          >
            Scan your cube, detect its colors automatically, and get a
            step-by-step solution.
          </p>

          {/* Action Buttons */}
          <div
            className="
              mt-7
              flex
              w-full
              flex-col
              gap-3
              sm:mt-8
              sm:w-auto
              sm:flex-row
              sm:gap-4
            "
          >
            <Link
              href="/scanner"
              className="
                inline-flex
                w-full
                items-center
                justify-center
                gap-3
                rounded-lg
                bg-blue-600
                px-6
                py-3
                text-sm
                font-medium
                text-white
                shadow-sm
                transition
                duration-200
                hover:bg-blue-700
                focus:outline-none
                focus:ring-2
                focus:ring-blue-500
                focus:ring-offset-2
                sm:w-auto
              "
            >
              <span>Scan My Cube</span>

              <MoveRight className="h-4 w-4 text-green-400" />
            </Link>

            <Link
              href="#how-it-works"
              className="
                inline-flex
                w-full
                items-center
                justify-center
                rounded-lg
                border
                border-gray-300
                bg-white
                px-6
                py-3
                text-sm
                font-medium
                text-gray-700
                shadow-sm
                transition
                duration-200
                hover:bg-gray-100
                focus:outline-none
                focus:ring-2
                focus:ring-gray-300
                focus:ring-offset-2
                sm:w-auto
              "
            >
              How It Works
            </Link>
          </div>

          {/* Feature Checklist */}
          <div
            className="
              mt-7
              flex
              w-full
              flex-wrap
              items-center
              justify-center
              gap-x-5
              gap-y-3
              text-xs
              text-gray-500
              sm:mt-8
              sm:gap-x-6
              sm:text-sm
              lg:justify-start
            "
          >
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span>Color Detection</span>
              <Check className="h-4 w-4 shrink-0 text-green-500" />
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <span>Cube Validation</span>
              <Check className="h-4 w-4 shrink-0 text-green-500" />
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <span>Solution</span>
              <Check className="h-4 w-4 shrink-0 text-green-500" />
            </div>
          </div>
        </div>

        {/* ========================================
            RIGHT 3D CUBE
        ======================================== */}
        <div
          className="
            flex
            w-full
            items-center
            justify-center
            lg:justify-end
          "
        >
          <div
            className="
              relative
              flex
              h-[280px]
              w-full
              max-w-[320px]
              items-center
              justify-center
              sm:h-[340px]
              sm:max-w-[380px]
              md:h-[400px]
              md:max-w-[440px]
              lg:h-[460px]
              lg:max-w-[500px]
              xl:h-[520px]
              xl:max-w-[540px]
            "
          >
            <RealisticCube />
          </div>
        </div>
      </div>
    </section>
  );
}

