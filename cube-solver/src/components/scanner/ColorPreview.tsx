"use client";

import type { CubeColor } from "@/src/lib/colorDetection";

interface ColorPreviewProps {
  colors?: CubeColor[];
}

/*
 * Visual color classes for each Rubik's Cube color.
 */
const colorClasses: Record<CubeColor, string> = {
  W: "bg-white",
  Y: "bg-yellow-400",
  R: "bg-red-500",
  O: "bg-orange-500",
  B: "bg-blue-500",
  G: "bg-green-500",
};

/*
 * Human-readable names for accessibility.
 */
const colorNames: Record<CubeColor, string> = {
  W: "White",
  Y: "Yellow",
  R: "Red",
  O: "Orange",
  B: "Blue",
  G: "Green",
};

/*
 * Preview the 9 detected stickers of a cube face.
 */
export default function ColorPreview({
  colors = [],
}: ColorPreviewProps) {
  return (
    <div>
      {/* --------------------------------
          3 × 3 COLOR GRID
      -------------------------------- */}

      <div
        className="mx-auto grid aspect-square w-full max-w-[220px] grid-cols-3 overflow-hidden rounded-lg border border-zinc-700"
        aria-label="Detected Rubik's Cube colors"
      >
        {Array.from({ length: 9 }).map(
          (_, index) => {
            const color = colors[index];

            return (
              <div
                key={index}
                className={`flex items-center justify-center border border-zinc-700 ${
                  color
                    ? colorClasses[color]
                    : "bg-zinc-800"
                }`}
                aria-label={
                  color
                    ? `Sticker ${index + 1}: ${colorNames[color]}`
                    : `Sticker ${index + 1}: not detected`
                }
              >
                {color && (
                  <span className="sr-only">
                    Sticker {index + 1}:{" "}
                    {colorNames[color]}
                  </span>
                )}
              </div>
            );
          }
        )}
      </div>

      {/* --------------------------------
          COLOR DETAILS
      -------------------------------- */}

      {colors.length === 9 && (
        <div
          className="mt-4 flex flex-wrap justify-center gap-2"
          aria-label="Detected sticker colors"
        >
          {colors.map((color, index) => (
            <span
              key={`${color}-${index}`}
              className="rounded-md bg-zinc-800 px-2 py-1 text-xs text-zinc-300"
            >
              {index + 1}:{" "}
              {colorNames[color]}
            </span>
          ))}
        </div>
      )}

      {/* --------------------------------
          INCOMPLETE DETECTION
      -------------------------------- */}

      {colors.length > 0 &&
        colors.length !== 9 && (
          <p className="mt-3 text-center text-xs text-amber-600">
            {colors.length} of 9 stickers
            detected.
          </p>
        )}
    </div>
  );
}