interface ScannerGridProps {
  visible?: boolean;
}

export default function ScannerGrid({
  visible = true,
}: ScannerGridProps) {
  if (!visible) return null;

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div className="relative aspect-square w-[55%] max-w-[420px]">
        <div className="grid h-full w-full grid-cols-3 grid-rows-3 border-2 border-white">
          {Array.from({ length: 9 }).map((_, index) => (
            <div
              key={index}
              className="border border-white/70"
            />
          ))}
        </div>

        <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-lg" />
      </div>
    </div>
  );
}