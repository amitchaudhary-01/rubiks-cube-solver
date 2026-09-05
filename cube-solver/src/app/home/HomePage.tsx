import Hero from "../../components/landing/Hero";
import Features from "../../components/landing/Features";
import HowItWorks from "../../components/landing/HowItWorks";
import CTA from "../../components/landing/CTA";
import FloatingCubes from "@/src/components/landing/FloatingCubes";

export default function HomePage() {
  return (
<main className="relative overflow-hidden">
  <FloatingCubes/>
    <div className="relative z-10">

      <Hero />
      <Features />
      <HowItWorks />
      <CTA />
      </div>
    </main>
  );
}