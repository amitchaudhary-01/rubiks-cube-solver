
"use client";

import { useState } from "react";

const cubeColors = [
  "#D9232E", // Red
  "#F28C28", // Orange
  "#1557D6", // Blue
  "#159447", // Green
  "#FFD500", // Yellow
  "#F5F5F0", // White
];

const MAX_VISIBLE_COLORS = 10;

function CubeStatePreview() {
  const [hoverColors, setHoverColors] = useState<Record<number, string>>({});
  const [activeIndexes, setActiveIndexes] = useState<number[]>([]);

  const handleHover = (index: number) => {
    const randomColor =
      cubeColors[Math.floor(Math.random() * cubeColors.length)];

    setHoverColors((previous) => {
      const updated = { ...previous };
      updated[index] = randomColor;
      return updated;
    });

    setActiveIndexes((previous) => {
      // Already visible, don't add it again
      if (previous.includes(index)) {
        return previous;
      }

      const updated = [...previous, index];

      // Keep only the latest 10
      if (updated.length > MAX_VISIBLE_COLORS) {
        const oldestIndex = updated.shift();

        setHoverColors((colors) => {
          const updatedColors = { ...colors };

          if (oldestIndex !== undefined) {
            delete updatedColors[oldestIndex];
          }

          return updatedColors;
        });
      }

      return updated;
    });
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 sm:p-8">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            Cube State
          </span>

          <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
            Valid
          </span>
        </div>

        {/* 54 Stickers */}
        <div className="mt-6 grid grid-cols-6 gap-2">
          {Array.from({ length: 54 }).map((_, index) => (
            <div
              key={index}
              onMouseEnter={() => handleHover(index)}
              className="aspect-square rounded-sm border border-gray-200 bg-gray-100 transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor:
                  hoverColors[index] ?? "#F3F4F6",
              }}
            />
          ))}
        </div>

        {/* Solution */}
        <div className="mt-6 border-t border-gray-200 pt-5">
          <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Solution
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {["R", "U", "R'", "U'", "F", "R", "U"].map(
              (move, index) => (
                <span
                  key={`${move}-${index}`}
                  className="rounded-md bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-800"
                >
                  {move}
                </span>
              ),
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default CubeStatePreview;

