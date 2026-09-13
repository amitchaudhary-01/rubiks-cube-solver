"use client";

import { useState } from "react";

import {
  FACE_NAMES,
} from "@/src/lib/cube";

import type {
  CubeColor,
  CubeState,
  FaceName,
} from "@/src/types/cube";

type CubeFaceEditorProps = {
  cubeState: CubeState;
  onChange: (cube: CubeState) => void;
  onValidate?: () => void;
  onSolve?: () => void;
};

const COLORS: Record<CubeColor, string> = {
  W: "#ffffff",
  R: "#c41e3a",
  G: "#00a651",
  Y: "#ffd500",
  O: "#ff5800",
  B: "#0051ba",
};

const COLOR_NAMES: Record<CubeColor, string> = {
  W: "White",
  R: "Red",
  G: "Green",
  Y: "Yellow",
  O: "Orange",
  B: "Blue",
};

const FACES: FaceName[] = [
  "U",
  "R",
  "F",
  "D",
  "L",
  "B",
];

const COLORS_LIST: CubeColor[] = [
  "W",
  "R",
  "G",
  "Y",
  "O",
  "B",
];

export default function CubeFaceEditor({
  cubeState,
  onChange,
  onValidate,
  onSolve,
}: CubeFaceEditorProps) {
  const [activeFace, setActiveFace] =
    useState<FaceName>("U");

  const [selectedSticker, setSelectedSticker] =
    useState<number | null>(null);

  const selectedColor =
    selectedSticker !== null
      ? cubeState[activeFace][selectedSticker]
      : null;

  /**
   * Change selected sticker color
   */
  const changeStickerColor = (
    color: CubeColor,
  ) => {
    if (selectedSticker === null) return;

    // Center stickers must never change.
    if (selectedSticker === 4) return;

    const updatedFace = [
      ...cubeState[activeFace],
    ] as CubeState[typeof activeFace];

    updatedFace[selectedSticker] = color;

    onChange({
      ...cubeState,
      [activeFace]: updatedFace,
    });
  };

  /**
   * Reset current face to its correct center color.
   */
  const resetFace = () => {
    const resetFaceState = Array(9).fill(
      getFaceCenterColor(activeFace),
    ) as CubeState[typeof activeFace];

    onChange({
      ...cubeState,
      [activeFace]: resetFaceState,
    });

    setSelectedSticker(null);
  };

  /**
   * Get the expected color of a face.
   */
  const getFaceCenterColor = (
    face: FaceName,
  ): CubeColor => {
    const faceColors: Record<
      FaceName,
      CubeColor
    > = {
      U: "W",
      R: "R",
      F: "G",
      D: "Y",
      L: "O",
      B: "B",
    };

    return faceColors[face];
  };

  return (
    <section className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-3xl">

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Edit Your Cube
          </h1>

          <p className="mx-auto mt-2 max-w-xl text-gray-600">
            Select a face and correct any incorrectly
            detected stickers before validating or
            solving your cube.
          </p>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-xl sm:p-6">

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
                  aria-label={`Edit ${FACE_NAMES[face]} face`}
                  aria-pressed={
                    activeFace === face
                  }
                  className={`
                    h-11
                    w-11
                    rounded-xl
                    border
                    text-sm
                    font-bold
                    transition-all
                    ${
                      activeFace === face
                        ? "border-blue-600 bg-blue-600 text-white shadow-md"
                        : "border-gray-300 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50"
                    }
                  `}
                >
                  {face}
                </button>
              ))}
            </div>
          </div>

          {/* Face Information */}
          <div className="mb-5 text-center">
            <h2 className="text-xl font-bold text-gray-900">
              {FACE_NAMES[activeFace]} Face
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Center color:{" "}
              <span className="font-semibold text-gray-700">
                {
                  COLOR_NAMES[
                    getFaceCenterColor(
                      activeFace,
                    )
                  ]
                }
              </span>
            </p>
          </div>

          {/* 3 × 3 Cube Face */}
          <div className="flex justify-center">
            <div
              className="
                grid
                grid-cols-3
                gap-1.5
                rounded-2xl
                bg-gray-800
                p-2.5
                shadow-inner
                sm:gap-2
                sm:p-3
              "
            >
              {cubeState[activeFace].map(
                (color, index) => {
                  const selected =
                    selectedSticker === index;

                  const isCenter = index === 4;

                  return (
                    <button
                      key={`${activeFace}-${index}`}
                      type="button"
                      disabled={isCenter}
                      onClick={() => {
                        if (!isCenter) {
                          setSelectedSticker(
                            index,
                          );
                        }
                      }}
                      aria-label={
                        isCenter
                          ? `${FACE_NAMES[activeFace]} center sticker`
                          : `${FACE_NAMES[activeFace]} sticker ${
                              index + 1
                            }, ${
                              COLOR_NAMES[color]
                            }`
                      }
                      aria-pressed={selected}
                      className={`
                        relative
                        h-20
                        w-20
                        rounded-lg
                        border-2
                        transition-all
                        sm:h-24
                        sm:w-24
                        ${
                          isCenter
                            ? "cursor-default border-gray-500"
                            : selected
                              ? "scale-105 border-blue-500 ring-4 ring-blue-200"
                              : "border-gray-600 hover:scale-[1.03]"
                        }
                      `}
                      style={{
                        backgroundColor:
                          COLORS[color],
                      }}
                    >
                      {/* Center */}
                      {isCenter && (
                        <span
                          className="absolute inset-0 flex items-center justify-center text-[10px] font-bold"
                          style={{
                            color:
                              color === "W" ||
                              color === "Y"
                                ? "#333"
                                : "#fff",
                          }}
                        >
                          CENTER
                        </span>
                      )}

                      {/* Selected indicator */}
                      {selected && (
                        <span className="absolute inset-1 rounded-md border-2 border-blue-500" />
                      )}
                    </button>
                  );
                },
              )}
            </div>
          </div>

          {/* Selected Sticker */}
          <div className="mt-6 min-h-6 text-center">
            {selectedSticker !== null ? (
              <div className="flex items-center justify-center gap-2 text-sm">
                <span className="text-gray-600">
                  Sticker{" "}
                  <strong className="text-gray-900">
                    {selectedSticker + 1}
                  </strong>
                </span>

                <span className="text-gray-400">
                  •
                </span>

                {selectedColor && (
                  <span className="font-semibold text-gray-700">
                    {
                      COLOR_NAMES[
                        selectedColor
                      ]
                    }
                  </span>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                Click a sticker to edit its color.
              </p>
            )}
          </div>

          {/* Color Picker */}
          <div className="mt-7">
            <p className="mb-3 text-center text-sm font-semibold text-gray-700">
              Choose Color
            </p>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {COLORS_LIST.map((color) => {
                const isSelected =
                  selectedColor === color;

                const disabled =
                  selectedSticker === null ||
                  selectedSticker === 4;

                return (
                  <button
                    key={color}
                    type="button"
                    disabled={disabled}
                    onClick={() =>
                      changeStickerColor(
                        color,
                      )
                    }
                    className={`
                      flex
                      items-center
                      gap-3
                      rounded-xl
                      border
                      p-3
                      text-left
                      transition-all
                      ${
                        disabled
                          ? "cursor-not-allowed border-gray-200 opacity-40"
                          : isSelected
                            ? "border-blue-500 bg-blue-50 shadow-sm"
                            : "border-gray-200 hover:-translate-y-0.5 hover:shadow-md"
                      }
                    `}
                  >
                    <span
                      className="h-8 w-8 shrink-0 rounded-full border border-gray-400 shadow-sm"
                      style={{
                        backgroundColor:
                          COLORS[color],
                      }}
                    />

                    <span>
                      <span className="block text-sm font-semibold text-gray-800">
                        {COLOR_NAMES[color]}
                      </span>

                      <span className="block text-xs text-gray-500">
                        {color}
                      </span>
                    </span>

                    {isSelected && (
                      <span className="ml-auto font-bold text-blue-600">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <button
              type="button"
              onClick={resetFace}
              className="
                rounded-xl
                border
                border-gray-300
                px-5
                py-3
                font-semibold
                text-gray-700
                transition
                hover:bg-gray-100
              "
            >
              Reset Face
            </button>

            <button
              type="button"
              onClick={onValidate}
              className="
                rounded-xl
                border
                border-blue-600
                px-5
                py-3
                font-semibold
                text-blue-600
                transition
                hover:bg-blue-50
              "
            >
              Validate Cube
            </button>

            <button
              type="button"
              onClick={onSolve}
              className="
                rounded-xl
                bg-blue-600
                px-5
                py-3
                font-semibold
                text-white
                shadow-md
                transition
                hover:bg-blue-700
                hover:shadow-lg
              "
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