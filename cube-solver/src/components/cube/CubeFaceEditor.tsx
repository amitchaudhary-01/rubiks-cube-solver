
"use client";

import { useState } from "react";

export type CubeColor = "U" | "R" | "F" | "D" | "L" | "B";

export type CubeState = {
  U: CubeColor[];
  R: CubeColor[];
  F: CubeColor[];
  D: CubeColor[];
  L: CubeColor[];
  B: CubeColor[];
};

type CubeFaceEditorProps = {
  cubeState: CubeState;
  onChange: (cube: CubeState) => void;
  onValidate?: () => void;
  onSolve?: () => void;
};

const COLORS: Record<CubeColor, string> = {
  U: "#ffffff",
  R: "#c41e3a",
  F: "#00a651",
  D: "#ffd500",
  L: "#ff5800",
  B: "#0051ba",
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

const FACES: CubeColor[] = ["U", "R", "F", "D", "L", "B"];

export default function CubeFaceEditor({
  cubeState,
  onChange,
  onValidate,
  onSolve,
}: CubeFaceEditorProps) {
  const [activeFace, setActiveFace] = useState<CubeColor>("U");
  const [selectedSticker, setSelectedSticker] = useState<number | null>(
    null
  );

  const changeStickerColor = (color: CubeColor) => {
    if (selectedSticker === null) return;

    const updatedFace = [...cubeState[activeFace]];

    updatedFace[selectedSticker] = color;

    onChange({
      ...cubeState,
      [activeFace]: updatedFace,
    });
  };

  const resetFace = () => {
    onChange({
      ...cubeState,
      [activeFace]: Array(9).fill(activeFace),
    });

    setSelectedSticker(null);
  };

  return (
    <section className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-3xl">

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Edit Your Cube
          </h1>

          <p className="mt-2 text-gray-600">
            Select a face and correct any incorrectly detected stickers.
          </p>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-xl">

          {/* Face Selector */}
          <div className="mb-8">
            <p className="mb-3 text-center text-sm font-semibold text-gray-700">
              Select Cube Face
            </p>

            <div className="flex flex-wrap justify-center gap-2">
              {FACES.map((face) => (
                <button
                  key={face}
                  type="button"
                  onClick={() => {
                    setActiveFace(face);
                    setSelectedSticker(null);
                  }}
                  className={`h-11 w-11 rounded-xl border text-sm font-bold transition ${
                    activeFace === face
                      ? "border-blue-600 bg-blue-600 text-white shadow-md"
                      : "border-gray-300 bg-white text-gray-700 hover:border-blue-400"
                  }`}
                >
                  {face}
                </button>
              ))}
            </div>
          </div>

          {/* Face Name */}
          <div className="mb-5 text-center">
            <h2 className="text-xl font-bold text-gray-900">
              {FACE_NAMES[activeFace]} Face
            </h2>

            <p className="text-sm text-gray-500">
              {activeFace} face
            </p>
          </div>

          {/* 3 × 3 Face */}
          <div className="flex justify-center">
            <div className="grid grid-cols-3 gap-2 rounded-2xl bg-gray-800 p-3">
              {cubeState[activeFace].map((color, index) => {
                const selected = selectedSticker === index;

                return (
                  <button
                    key={`${activeFace}-${index}`}
                    type="button"
                    onClick={() => setSelectedSticker(index)}
                    className={`h-20 w-20 rounded-lg border-2 transition sm:h-24 sm:w-24 ${
                      selected
                        ? "scale-105 border-blue-500 ring-4 ring-blue-200"
                        : "border-gray-600 hover:scale-[1.03]"
                    }`}
                    style={{
                      backgroundColor: COLORS[color],
                    }}
                    aria-label={`${FACE_NAMES[activeFace]} sticker ${
                      index + 1
                    }`}
                  >
                    {index === 4 && (
                      <span
                        className="text-xs font-bold"
                        style={{
                          color:
                            color === "U" || color === "D"
                              ? "#333"
                              : "#fff",
                        }}
                      >
                        CENTER
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Sticker */}
          <div className="mt-6 text-center">
            {selectedSticker !== null ? (
              <p className="text-sm text-gray-600">
                Selected sticker{" "}
                <span className="font-bold text-gray-900">
                  {selectedSticker + 1}
                </span>
              </p>
            ) : (
              <p className="text-sm text-gray-500">
                Click a sticker to edit its color.
              </p>
            )}
          </div>

          {/* Color Picker */}
          <div className="mt-6">
            <p className="mb-3 text-center text-sm font-semibold text-gray-700">
              Choose Color
            </p>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {FACES.map((color) => (
                <button
                  key={color}
                  type="button"
                  disabled={selectedSticker === null}
                  onClick={() => changeStickerColor(color)}
                  className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                    selectedSticker === null
                      ? "cursor-not-allowed opacity-40"
                      : "border-gray-200 hover:-translate-y-0.5 hover:shadow-md"
                  }`}
                >
                  <span
                    className="h-7 w-7 shrink-0 rounded-full border border-gray-400"
                    style={{
                      backgroundColor: COLORS[color],
                    }}
                  />

                  <span className="text-sm font-medium text-gray-700">
                    {COLOR_NAMES[color]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={resetFace}
              className="flex-1 rounded-xl border border-gray-300 px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-100"
            >
              Reset Face
            </button>

            <button
              type="button"
              onClick={onValidate}
              className="flex-1 rounded-xl border border-blue-600 px-5 py-3 font-semibold text-blue-600 transition hover:bg-blue-50"
            >
              Validate Cube
            </button>

            <button
              type="button"
              onClick={onSolve}
              className="flex-1 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-md transition hover:bg-blue-700"
            >
              Solve Cube →
            </button>
          </div>

          {/* Current Face State */}
          <div className="mt-8 rounded-xl bg-gray-900 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
              {activeFace} Face State
            </p>

            <code className="break-all text-sm text-gray-200">
              {cubeState[activeFace].join("")}
            </code>
          </div>

        </div>
      </div>
    </section>
  );
}

