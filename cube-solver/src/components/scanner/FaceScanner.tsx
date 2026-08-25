"use client";

import { Camera } from "lucide-react";

import ColorPreview from "./ColorPreview";

import type { CubeColor } from "@/src/lib/colorDetection";

interface FaceScannerProps {
  faceNumber: number;
  capturedImage: string | null;
  detectedColors: CubeColor[];

  onCapture: () => void;
  onRescan: () => void;
  onNext: () => void;
  onFinish: () => void;

  cameraActive: boolean;
}

export default function FaceScanner({
  faceNumber,
  capturedImage,
  detectedColors,
  onCapture,
  onRescan,
  onNext,
  onFinish,
  cameraActive,
}: FaceScannerProps) {
  const isLastFace = faceNumber === 6;

  /*
   * A face is considered successfully
   * scanned only when we have both:
   *
   * - captured image
   * - 9 detected colors
   */
  const scanComplete =
    Boolean(capturedImage) &&
    detectedColors.length === 9;

  return (
    <section
      aria-labelledby="cube-scan-progress"
      className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
    >
      {/* --------------------------------
          HEADER
      -------------------------------- */}

      <div className="flex items-center justify-between gap-4">
        <div>
          <h2
            id="cube-scan-progress"
            className="font-bold text-zinc-900"
          >
            Cube Scan Progress
          </h2>

          <p className="mt-0.5 text-sm text-zinc-500">
            Face {faceNumber} of 6
          </p>
        </div>

        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold ${
            scanComplete
              ? "border-emerald-200/50 bg-emerald-50 text-emerald-700"
              : "border-blue-200/50 bg-blue-50 text-blue-700"
          }`}
        >
          {scanComplete ? "Captured" : "Waiting"}
        </span>
      </div>

      {/* --------------------------------
          PROGRESS
      -------------------------------- */}

      <div
        className="mt-5 flex gap-2"
        aria-label={`Scanning progress: face ${faceNumber} of 6`}
      >
        {Array.from({ length: 6 }).map((_, index) => {
          const number = index + 1;

          const completed =
            number < faceNumber ||
            (number === faceNumber && scanComplete);

          const current = number === faceNumber;

          return (
            <div
              key={number}
              className={`h-2 flex-1 rounded-full transition-colors ${
                completed
                  ? "bg-emerald-600"
                  : current
                    ? "bg-blue-600"
                    : "bg-zinc-200"
              }`}
              aria-hidden="true"
            />
          );
        })}
      </div>

      {/* --------------------------------
          CAPTURED PREVIEW
      -------------------------------- */}

      {capturedImage ? (
        <div className="mt-6">
          <p className="mb-3 text-sm font-semibold text-zinc-700">
            Captured Face {faceNumber}
          </p>

          <div className="mx-auto aspect-square max-w-[220px] overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 shadow-inner">
            <img
              src={capturedImage}
              alt={`Captured Rubik's Cube face ${faceNumber}`}
              className="h-full w-full object-cover"
            />
          </div>

          {/* --------------------------------
              COLOR DETECTION
          -------------------------------- */}

          <div className="mt-6">
            <p className="mb-3 text-center text-sm font-medium text-zinc-600">
              Detected Colors
            </p>

            {detectedColors.length === 9 ? (
              <ColorPreview colors={detectedColors} />
            ) : (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-700">
                Color detection is incomplete.
                Please rescan this face.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-xl bg-zinc-50 px-4 py-5 text-center text-sm text-zinc-500">
          Position the cube face inside the camera grid,
          then capture the face.
        </div>
      )}

      {/* --------------------------------
          CONTROLS
      -------------------------------- */}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        {/* CAPTURE */}

        {!capturedImage && (
          <button
            type="button"
            onClick={onCapture}
            disabled={!cameraActive}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-emerald-600"
          >
            <Camera
              className="h-4 w-4"
              aria-hidden="true"
            />

            {cameraActive
              ? "Capture Face"
              : "Start Camera First"}
          </button>
        )}

        {/* RESCAN + NEXT / FINISH */}

        {capturedImage && (
          <>
            {/* RESCAN */}

            <button
              type="button"
              onClick={onRescan}
              className="flex-1 rounded-xl border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2"
            >
              ↻ Rescan
            </button>

            {/* NEXT */}

            {!isLastFace ? (
              <button
                type="button"
                onClick={onNext}
                disabled={!scanComplete}
                className="flex-1 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-blue-600"
              >
                Next Face →
              </button>
            ) : (
              /* FINISH */

              <button
                type="button"
                onClick={onFinish}
                disabled={!scanComplete}
                className="flex-1 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-emerald-600"
              >
                ✓ Finish Scan
              </button>
            )}
          </>
        )}
      </div>
    </section>
  );
}