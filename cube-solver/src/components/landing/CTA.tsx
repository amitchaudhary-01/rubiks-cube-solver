import { MoveRight } from "lucide-react";
import Link from "next/link";

export default function CTA() {
  return (
    <section className="bg-gray-900 py-16">
      <div className="mx-auto max-w-3xl px-5 text-center sm:px-6">

        <h2 className="text-3xl font-bold text-white">
          Ready to solve your cube?
        </h2>

        <p className="mx-auto mt-4 max-w-xl text-gray-300">
          Scan your scrambled cube and let the solver find
          the moves for you.
        </p>

        <Link
          href="/scanner"
          className="mt-7 inline-flex rounded-lg bg-white px-5 py-3 text-sm font-semibold text-gray-900 hover:bg-blue-500 hover:text-white  gap-3"
        >
          <span>Start Scanning</span>  <MoveRight className="hover:text-green-400"/>
        </Link>

      </div>
    </section>
  );
}