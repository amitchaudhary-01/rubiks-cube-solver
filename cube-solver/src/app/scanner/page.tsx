import CubeEditor from "@/src/components/cube/CubeEditor";
import CubeScanner from "@/src/components/scanner/CubeScanner";

export default function ScannerPage() {
  return (
    <main className="min-h-screen bg-[#FBFBFA] text-zinc-900">
      <CubeScanner />
      <CubeEditor/>
    </main>
  );
}