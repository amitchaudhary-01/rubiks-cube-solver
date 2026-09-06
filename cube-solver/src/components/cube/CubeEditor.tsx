"use client";

import { useMemo, useState } from "react";

export type CubeColor = "U" | "R" | "F" | "D" | "L" | "B";

type CubeState = Record<CubeColor, CubeColor[]>;

type SelectedSticker = {
  face: CubeColor;
  index: number;
} | null;

const COLORS: Record<CubeColor, string> = {
  U: "#ffffff", // White
  R: "#c41e3a", // Red
  F: "#00a651", // Green
  D: "#ffd500", // Yellow
  L: "#ff5800", // Orange
  B: "#0051ba", // Blue
};

const COLOR_NAMES: Record<CubeColor, string> = {
  U: "White",
  R: "Red",
  F: "Green",
  D: "Yellow",
  L: "Orange",
  B: "Blue",
};

const FACE_NAMES: Record<CubeColor, string> = {
  U: "Up",
  R: "Right",
  F: "Front",
  D: "Down",
  L: "Left",
  B: "Back",
};

const FACE_ORDER: CubeColor[] = ["U", "R", "F", "D", "L", "B"];

function createSolvedCube(): CubeState {
  return {
    U: Array(9).fill("U"),
    R: Array(9).fill("R"),
    F: Array(9).fill("F"),
    D: Array(9).fill("D"),
    L: Array(9).fill("L"),
    B: Array(9).fill("B"),
  };
}

export default function CubeEditor() {
  const [cube, setCube] = useState<CubeState>(createSolvedCube);
  const [selected, setSelected] = useState<SelectedSticker>(null);
  const [message, setMessage] = useState("");

  const cubeString = useMemo(() => {
    return FACE_ORDER.map((face) => cube[face].join("")).join("");
  }, [cube]);

  const updateSticker = (face: CubeColor, index: number) => {
    setSelected({ face, index });
    setMessage("");
  };

  const applyColor = (color: CubeColor) => {
    if (!selected) return;

    setCube((prev) => ({
      ...prev,
      [selected.face]: prev[selected.face].map((value, index) =>
        index === selected.index ? color : value
      ),
    }));

    setMessage("");
  };

  const resetCube = () => {
    setCube(createSolvedCube());
    setSelected(null);
    setMessage("");
  };

  const validateCube = () => {
    const counts: Record<CubeColor, number> = {
      U: 0,
      R: 0,
      F: 0,
      D: 0,
      L: 0,
      B: 0,
    };

    FACE_ORDER.forEach((face) => {
      cube[face].forEach((color) => {
        counts[color]++;
      });
    });

    const invalidColors = FACE_ORDER.filter(
      (color) => counts[color] !== 9
    );

    if (invalidColors.length > 0) {
      setMessage(
        `Invalid cube: ${invalidColors
          .map(
            (color) =>
              `${COLOR_NAMES[color]} has ${counts[color]} stickers`
          )
          .join(", ")}.`
      );

      return false;
    }

    setMessage("Cube colors are valid. Ready to solve! ✓");
    return true;
  };

  const handleSolve = () => {
    if (!validateCube()) return;

    console.log("Kociemba cube string:", cubeString);

    // Later:
    // send cubeString to your backend solver
  };

  return (
    <section className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Edit Your Cube
          </h1>

          <p className="mt-2 text-gray-600">
            Click any sticker and choose the correct color.
          </p>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-xl">
          {/* Cube Net */}
          <div className="flex justify-center overflow-x-auto pb-6">
            <div className="grid min-w-[360px] grid-cols-4 gap-2">
              {/* Empty */}
              <div />

              {/* U */}
              <Face
                face="U"
                cube={cube}
                selected={selected}
                onStickerClick={updateSticker}
              />

              <div />
              <div />

              {/* L F R B */}
              <Face
                face="L"
                cube={cube}
                selected={selected}
                onStickerClick={updateSticker}
              />

              <Face
                face="F"
                cube={cube}
                selected={selected}
                onStickerClick={updateSticker}
              />

              <Face
                face="R"
                cube={cube}
                selected={selected}
                onStickerClick={updateSticker}
              />

              <Face
                face="B"
                cube={cube}
                selected={selected}
                onStickerClick={updateSticker}
              />

              {/* Empty */}
              <div />

              {/* D */}
              <Face
                face="D"
                cube={cube}
                selected={selected}
                onStickerClick={updateSticker}
              />

              <div />
              <div />
            </div>
          </div>

          {/* Selected Sticker */}
          <div className="mb-6 rounded-2xl bg-gray-50 p-4 text-center">
            {selected ? (
              <>
                <p className="text-sm text-gray-500">
                  Selected sticker
                </p>

                <p className="font-semibold text-gray-900">
                  {FACE_NAMES[selected.face]} — Sticker{" "}
                  {selected.index + 1}
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-500">
                Select a sticker to edit it
              </p>
            )}
          </div>

          {/* Color Picker */}
          <div>
            <p className="mb-3 text-center text-sm font-medium text-gray-700">
              Choose Color
            </p>

            <div className="flex flex-wrap justify-center gap-3">
              {FACE_ORDER.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => applyColor(color)}
                  className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
                    selected
                      ? "hover:-translate-y-0.5 hover:shadow-md"
                      : "cursor-not-allowed opacity-50"
                  }`}
                  disabled={!selected}
                >
                  <span
                    className="h-5 w-5 rounded-full border border-gray-400"
                    style={{
                      backgroundColor: COLORS[color],
                    }}
                  />

                  {COLOR_NAMES[color]}
                </button>
              ))}
            </div>
          </div>

          {/* Validation Message */}
          {message && (
            <div
              className={`mt-6 rounded-xl px-4 py-3 text-center text-sm font-medium ${
                message.includes("Invalid")
                  ? "bg-red-50 text-red-600"
                  : "bg-green-50 text-green-600"
              }`}
            >
              {message}
            </div>
          )}

          {/* Actions */}
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={resetCube}
              className="rounded-xl border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-100"
            >
              Reset Cube
            </button>

            <button
              type="button"
              onClick={validateCube}
              className="rounded-xl border border-blue-600 px-6 py-3 font-semibold text-blue-600 transition hover:bg-blue-50"
            >
              Validate Cube
            </button>

            <button
              type="button"
              onClick={handleSolve}
              className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-md transition hover:bg-blue-700"
            >
              Solve Cube →
            </button>
          </div>

          {/* Debug */}
          <div className="mt-8">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Kociemba State
            </p>

            <div className="overflow-x-auto rounded-xl bg-gray-900 p-4">
              <code className="whitespace-nowrap text-xs text-gray-200">
                {cubeString}
              </code>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- */
/* Face Component                   */
/* -------------------------------- */

type FaceProps = {
  face: CubeColor;
  cube: CubeState;
  selected: SelectedSticker;
  onStickerClick: (face: CubeColor, index: number) => void;
};

function Face({
  face,
  cube,
  selected,
  onStickerClick,
}: FaceProps) {
  return (
    <div>
      <p className="mb-1 text-center text-xs font-bold text-gray-500">
        {face}
      </p>

      <div className="grid grid-cols-3 gap-0.5 rounded-md bg-gray-800 p-1">
        {cube[face].map((color, index) => {
          const isSelected =
            selected?.face === face &&
            selected?.index === index;

          return (
            <button
              key={`${face}-${index}`}
              type="button"
              onClick={() => onStickerClick(face, index)}
              aria-label={`${FACE_NAMES[face]} sticker ${
                index + 1
              }`}
              className={`aspect-square w-10 rounded-sm border transition sm:w-12 ${
                isSelected
                  ? "z-10 scale-110 border-4 border-blue-600"
                  : "border-gray-500 hover:scale-105"
              }`}
              style={{
                backgroundColor: COLORS[color],
              }}
            />
          );
        })}
      </div>
    </div>
  );
}