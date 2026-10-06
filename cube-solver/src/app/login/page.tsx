"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, RotateCw, Box } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Invalid email or password");
      }

      localStorage.setItem("token", data.token);

      router.push("/");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/api/auth/google";
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#A5A0F8] via-[#B8A2FB] to-[#7B73EE] p-4 sm:p-6 lg:p-8">
      {/* Background Decorative Blur */}
      <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-white/20 blur-3xl pointer-events-none" />
      <div className="absolute -top-20 -left-20 h-96 w-96 rounded-full bg-purple-900/10 blur-3xl pointer-events-none" />

      {/* Main Container Card */}
      <div className="relative flex w-full max-w-4xl flex-col overflow-hidden rounded-[2.5rem] bg-white/30 p-3 shadow-2xl backdrop-blur-xl sm:flex-row">
        
        {/* Left Side: Brand Panel */}
        <div className="relative flex min-h-[280px] w-full flex-col justify-between overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#8072E6] to-[#6C5CE7] p-8 text-white sm:w-5/12 sm:min-h-[520px]">
          {/* Logo / Icon */}
          <div className="z-10 flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-md">
                <Box className="h-5 w-5 text-white" />
              </div>
              <span className="font-semibold tracking-wide text-white/90">Cube Solver</span>
            </Link>
          </div>

          {/* Heading Text */}
          <div className="z-10 my-auto py-6">
            <h2 className="text-2xl font-semibold leading-tight text-white/95 sm:text-3xl">
              Join Our 3D World to Solve & Share
            </h2>
          </div>

           <div className="pointer-events-none absolute -bottom-10 -right-20 z-20 h-72 w-72 sm:h-80 sm:w-80">
            <svg
              viewBox="0 0 300 300"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-full w-full drop-shadow-[0_20px_35px_rgba(0,0,0,0.15)]"
            >
              <defs>
                {/* Purple Glass Gradient */}
                <linearGradient id="purpleGlass" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#CBB2FE" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#8A60F2" stopOpacity="0.75" />
                </linearGradient>

                {/* Pink Cube Gradient */}
                <linearGradient id="pinkCube" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFD1E8" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#F5A3C7" stopOpacity="0.8" />
                </linearGradient>

                {/* Pearl White Sphere */}
                <radialGradient id="pearlSphere" cx="35%" cy="35%" r="65%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="60%" stopColor="#E6E3FA" />
                  <stop offset="100%" stopColor="#B8AFED" />
                </radialGradient>

                {/* Soft Gloss Gradient */}
                <linearGradient id="whiteGloss" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.1" />
                </linearGradient>
              </defs>

              {/* Main Cluster Container */}
              <g transform="rotate(-12 150 150)">
                {/* Back Cubes & Spheres */}
                <rect x="70" y="50" width="75" height="75" rx="16" fill="url(#purpleGlass)" stroke="white" strokeWidth="1.5" strokeOpacity="0.4" />
                <circle cx="170" cy="70" r="38" fill="url(#pearlSphere)" />
                <rect x="150" y="80" width="85" height="85" rx="18" fill="url(#pinkCube)" stroke="white" strokeWidth="1.5" strokeOpacity="0.5" />

                {/* Middle Translucent Layer */}
                <rect x="90" y="110" width="80" height="80" rx="18" fill="url(#whiteGloss)" stroke="white" strokeWidth="2" strokeOpacity="0.6" />
                <rect x="120" y="140" width="70" height="70" rx="16" fill="url(#purpleGlass)" stroke="white" strokeWidth="1.5" strokeOpacity="0.4" />

                {/* Front Floating Cubes & Spheres */}
                <rect x="50" y="145" width="65" height="65" rx="14" fill="url(#pinkCube)" stroke="white" strokeWidth="1.5" strokeOpacity="0.5" />
                <circle cx="65" cy="115" r="28" fill="url(#pearlSphere)" />
                <rect x="175" y="165" width="60" height="60" rx="14" fill="url(#whiteGloss)" stroke="white" strokeWidth="2" strokeOpacity="0.7" />
                <circle cx="140" cy="225" r="30" fill="url(#pearlSphere)" />
              </g>
            </svg>
          </div>

          {/* Abstract 3D Cube Graphic Placeholder */}
          <div className="absolute -bottom-10 -right-10 flex h-52 w-52 items-center justify-center rounded-3xl bg-gradient-to-tr from-purple-400/30 to-pink-300/30 blur-sm">
            <div className="h-36 w-36 rotate-12 rounded-2xl bg-white/20 shadow-inner backdrop-blur-md" />
          </div>

          <div className="z-10 text-xs text-white/60">
            © {new Date().getFullYear()} Cube Solver.
          </div>
        </div>

        {/* Right Side: Form Panel */}
        <div className="flex w-full flex-col justify-center rounded-[2rem] bg-white p-6 sm:w-7/12 sm:p-10">
          
          <div className="mx-auto w-full max-w-sm">
            <h1 className="text-center text-2xl font-bold tracking-tight text-slate-800">
              Welcome Back
            </h1>

            {/* Social Logins */}
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:shadow-sm"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#4285F4"
                    d="M21.35 12.27c0-.72-.06-1.42-.18-2.09H12v3.95h5.23a4.47 4.47 0 0 1-1.94 2.93v2.44h3.14c1.84-1.7 2.92-4.2 2.92-7.23Z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 21.5c2.63 0 4.84-.87 6.45-2.36l-3.14-2.44c-.87.58-1.98.93-3.31.93-2.54 0-4.7-1.72-5.47-4.03H3.29v2.52A9.74 9.74 0 0 0 12 21.5Z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M6.53 13.6A5.85 5.85 0 0 1 6.22 12c0-.56.11-1.1.31-1.6V7.88H3.29A9.74 9.74 0 0 0 2.25 12c0 1.57.38 3.05 1.04 4.12l3.24-2.52Z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 6.38c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.47 14.63 2.5 12 2.5a9.74 9.74 0 0 0-8.71 5.38l3.24 2.52C7.3 8.1 9.46 6.38 12 6.38Z"
                  />
                </svg>
                Sign in with Google
              </button>
            </div>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-100" />
              <span className="text-[11px] font-medium text-slate-400">- OR -</span>
              <div className="h-px flex-1 bg-slate-100" />
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-center text-xs text-red-600">
                  {error}
                </div>
              )}

              {/* Email Input */}
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full border-b border-slate-200 bg-transparent py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#7B73EE]"
                />
              </div>

              {/* Password Input */}
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full border-b border-slate-200 bg-transparent py-3 pr-8 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#7B73EE]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Forgot Password */}
              <div className="text-right">
                <Link
                  href="/forgot-password"
                  className="text-xs text-slate-400 hover:text-[#7B73EE]"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#7B73EE] py-3 text-sm font-medium text-white shadow-md transition hover:bg-[#6C5CE7] hover:shadow-lg disabled:opacity-60"
              >
                {loading && <RotateCw size={16} className="animate-spin" />}
                {loading ? "Signing in..." : "Log In"}
              </button>
            </form>

            {/* Footer Navigation */}
            <p className="mt-6 text-center text-xs text-slate-500">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="font-semibold text-[#7B73EE] hover:underline"
              >
                Sign Up
              </Link>
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}