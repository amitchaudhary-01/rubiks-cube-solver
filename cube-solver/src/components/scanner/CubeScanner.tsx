"use client";

import { useCallback, useRef, useState } from "react";

import CubeCamera, {
  type CubeCameraHandle,
} from "./CubeCamera";

import ScannerGrid from "./ScannerGrid";
import FaceScanner from "./FaceScanner";

import { toast } from "react-toastify";
import { Camera } from "lucide-react";

import { detectFaceColors } from "@/src/lib/colorDetection";
import type { CubeColor } from "@/src/lib/colorDetection";

import { FACE_NAMES, FACE_ORDER } from "@/src/lib/cube";
import type {
  CubeState,
  CubeFaceName,
} from "@/src/lib/cube";

import { validateCubeState } from "@/src/lib/cubeValidation";
import type {
  CubeValidationResult,
} from "@/src/lib/cubeValidation";

import { cubeStateToKociemba } from "@/src/lib/kociemba";

export default function CubeScanner() {
  const cameraRef = useRef<CubeCameraHandle>(null);

  /* --------------------------------
     CAMERA STATE
  -------------------------------- */

  const [cameraActive, setCameraActive] =
    useState(false);

  /* --------------------------------
     CURRENT FACE NUMBER

     1 → U
     2 → R
     3 → F
     4 → D
     5 → L
     6 → B
  -------------------------------- */

  const [faceNumber, setFaceNumber] =
    useState(1);

  /* --------------------------------
     CAPTURED IMAGES

     Example:

     {
       1: "data:image/...",
       2: "data:image/...",
       ...
     }
  -------------------------------- */

  const [capturedFaces, setCapturedFaces] =
    useState<Record<number, string>>({});

  /* --------------------------------
     CURRENT FACE COLORS
  -------------------------------- */

  const [detectedColors, setDetectedColors] =
    useState<CubeColor[]>([]);

  /* --------------------------------
     ALL DETECTED FACES

     Example:

     {
       U: ["W", "W", ...],
       R: ["R", "R", ...],
       F: ["G", "G", ...]
     }
  -------------------------------- */

  const [detectedFaces, setDetectedFaces] =
    useState<
      Partial<Record<CubeFaceName, CubeColor[]>>
    >({});

  /* --------------------------------
     FINAL CUBE STATE
  -------------------------------- */

  const [cubeState, setCubeState] =
    useState<CubeState | null>(null);

  /* --------------------------------
     VALIDATION RESULT
  -------------------------------- */

  const [validationResult, setValidationResult] =
    useState<CubeValidationResult | null>(null);

  /* --------------------------------
     KOCIEMBA STRING
  -------------------------------- */

  const [kociembaString, setKociembaString] =
    useState<string | null>(null);

  /* --------------------------------
     ERROR
  -------------------------------- */

  const [error, setError] = useState("");

  /* --------------------------------
     START CAMERA
  -------------------------------- */

  const startCamera = () => {
    setError("");
    setCameraActive(true);
  };

  /* --------------------------------
     STOP CAMERA
  -------------------------------- */

  const stopCamera = () => {
    setCameraActive(false);
  };

  /* --------------------------------
     CAMERA ERROR
  -------------------------------- */

  const handleCameraError = useCallback(
    (message: string) => {
      setError(message);
      setCameraActive(false);
    },
    []
  );

  /* --------------------------------
     CAPTURE FACE
  -------------------------------- */

  const captureFace = () => {
    setError("");

    const image =
      cameraRef.current?.captureFrame();

    if (!image) {
      setError(
        "Unable to capture the cube face."
      );

      return;
    }

    /*
     * Current face.
     */
    const currentFaceName =
      FACE_ORDER[faceNumber - 1];

    /*
     * Save captured image.
     */
    setCapturedFaces((previous) => ({
      ...previous,
      [faceNumber]: image,
    }));

    /*
     * Convert captured image
     * into HTMLImageElement.
     */
    const img = new Image();

    img.onload = () => {
      try {
        /*
         * Detect the 9 stickers.
         */
        const colors =
          detectFaceColors(img);

        console.log(
          `${currentFaceName} detected colors:`,
          colors
        );

        /*
         * Make sure exactly
         * 9 stickers were detected.
         */
        if (colors.length !== 9) {
          throw new Error(
            `Expected 9 colors but received ${colors.length}.`
          );
        }

        /*
         * Update current face preview.
         */
        setDetectedColors(colors);

        /*
         * Save detected face.
         */
        setDetectedFaces((previous) => ({
          ...previous,
          [currentFaceName]: colors,
        }));

        /*
         * New scan invalidates
         * previously generated cube data.
         */
        setCubeState(null);
        setValidationResult(null);
        setKociembaString(null);

        toast.success(
          `${FACE_NAMES[currentFaceName]} face scanned successfully!`
        );
      } catch (err) {
        console.error(
          "Color detection error:",
          err
        );

        setDetectedColors([]);

        setError(
          "Face captured, but automatic color detection failed."
        );

        toast.error(
          "Color detection failed."
        );
      }
    };

    img.onerror = () => {
      setError(
        "The captured image could not be processed."
      );

      toast.error(
        "Unable to process captured image."
      );
    };

    /*
     * Start image processing.
     */
    img.src = image;
  };

  /* --------------------------------
     RESCAN CURRENT FACE
  -------------------------------- */

  const rescanFace = () => {
    const currentFaceName =
      FACE_ORDER[faceNumber - 1];

    /*
     * Remove captured image.
     */
    setCapturedFaces((previous) => {
      const updated = {
        ...previous,
      };

      delete updated[faceNumber];

      return updated;
    });

    /*
     * Remove detected colors
     * for current face.
     */
    setDetectedFaces((previous) => {
      const updated = {
        ...previous,
      };

      delete updated[currentFaceName];

      return updated;
    });

    /*
     * Clear current preview.
     */
    setDetectedColors([]);

    /*
     * Clear validation.
     */
    setValidationResult(null);

    /*
     * Clear cube state.
     */
    setCubeState(null);

    /*
     * Clear Kociemba string.
     */
    setKociembaString(null);

    setError("");
  };

  /* --------------------------------
     NEXT FACE
  -------------------------------- */

  const nextFace = () => {
    if (faceNumber >= 6) {
      return;
    }

    setDetectedColors([]);
    setError("");

    setFaceNumber(
      (previous) => previous + 1
    );
  };

  /* --------------------------------
     PREVIOUS FACE
  -------------------------------- */

  const previousFace = () => {
    if (faceNumber <= 1) {
      return;
    }

    setDetectedColors([]);
    setError("");

    setFaceNumber(
      (previous) => previous - 1
    );
  };

  /* --------------------------------
     BUILD CUBE STATE
  -------------------------------- */

  const buildCubeState =
    (): CubeState | null => {
      const requiredFaces: CubeFaceName[] = [
        "U",
        "R",
        "F",
        "D",
        "L",
        "B",
      ];

      /*
       * Make sure all six faces
       * exist and contain 9 colors.
       */
      for (const face of requiredFaces) {
        const colors =
          detectedFaces[face];

        if (
          !colors ||
          colors.length !== 9
        ) {
          return null;
        }
      }

      /*
       * Convert detected faces
       * into CubeState.
       */
      return {
        U: detectedFaces.U as CubeState["U"],
        R: detectedFaces.R as CubeState["R"],
        F: detectedFaces.F as CubeState["F"],
        D: detectedFaces.D as CubeState["D"],
        L: detectedFaces.L as CubeState["L"],
        B: detectedFaces.B as CubeState["B"],
      };
    };

  /* --------------------------------
     FINISH SCAN
  -------------------------------- */

  const finishScan = () => {
    setError("");

    /*
     * Count scanned faces.
     */
    const totalFaces =
      Object.keys(detectedFaces).length;

    /*
     * Need all six faces.
     */
    if (totalFaces !== 6) {
      setValidationResult(null);
      setCubeState(null);
      setKociembaString(null);

      const message =
        `Please scan all 6 faces. Currently scanned ${totalFaces} of 6.`;

      setError(message);

      toast.error(
        `Only ${totalFaces} of 6 faces have been scanned.`
      );

      return;
    }

    /*
     * Build structured cube state.
     */
    const state = buildCubeState();

    if (!state) {
      setValidationResult(null);
      setCubeState(null);
      setKociembaString(null);

      setError(
        "Unable to build the cube state. Please rescan the missing faces."
      );

      toast.error(
        "Invalid cube data."
      );

      return;
    }

    /*
     * Validate cube colors.
     */
    const validation =
      validateCubeState(state);

    setValidationResult(validation);

    console.log(
      "================================="
    );

    console.log(
      "CUBE VALIDATION"
    );

    console.log(
      "================================="
    );

    console.log(validation);

    /*
     * Stop if invalid.
     */
    if (!validation.valid) {
      setCubeState(null);
      setKociembaString(null);

      const validationMessage =
        validation.errors.join(" ");

      setError(validationMessage);

      toast.error(
        "Invalid cube state. Please rescan the incorrect faces."
      );

      return;
    }

    /*
     * Cube is valid.
     */
    setCubeState(state);

    /*
     * Convert cube state into
     * Kociemba format.
     */
    try {
      const kociemba =
        cubeStateToKociemba(state);

      /*
       * Make sure the result
       * contains exactly 54 stickers.
       */
      if (kociemba.length !== 54) {
        throw new Error(
          `Kociemba string must contain 54 characters. Received ${kociemba.length}.`
        );
      }

      setKociembaString(kociemba);

      console.log(
        "================================="
      );

      console.log(
        "VALID RUBIK'S CUBE"
      );

      console.log(
        "================================="
      );

      console.log(state);

      console.log(
        "Color counts:",
        validation.counts
      );

      console.log(
        "Kociemba string:",
        kociemba
      );

      console.log(
        "Kociemba length:",
        kociemba.length
      );

      toast.success(
        "Cube is valid and ready to solve!"
      );
    } catch (err) {
      console.error(
        "Kociemba conversion error:",
        err
      );

      setCubeState(null);
      setKociembaString(null);

      setError(
        "Cube is valid, but it could not be converted to Kociemba format."
      );

      toast.error(
        "Kociemba conversion failed."
      );
    }
  };

  /* --------------------------------
     CURRENT FACE IMAGE
  -------------------------------- */

  const currentImage =
    capturedFaces[faceNumber] ?? null;

  /* --------------------------------
     CURRENT FACE NAME
  -------------------------------- */

  const currentFaceName =
    FACE_ORDER[faceNumber - 1];

  const currentFaceDisplayName =
    FACE_NAMES[currentFaceName];

  /* --------------------------------
     RENDER
  -------------------------------- */

  return (
    <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-8 sm:px-6 lg:px-8">

      {/* --------------------------------
          HEADER
      -------------------------------- */}

      <div className="mb-8 text-center">

        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-600">
          Rubik&apos;s Cube Solver
        </p>

        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">
          Scan Your Cube
        </h1>

        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-zinc-600 sm:text-base">
          Scan each face of your Rubik&apos;s
          Cube. Keep the cube aligned inside
          the 3×3 guide.
        </p>

      </div>

      {/* --------------------------------
          CAMERA AREA
      -------------------------------- */}

      <div className="mx-auto w-full max-w-3xl">

        <div className="relative aspect-video overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-950 shadow-xl">

          {cameraActive ? (
            <>
              <CubeCamera
                ref={cameraRef}
                active={cameraActive}
                onError={handleCameraError}
              />

              {/* --------------------------------
                  SCANNER GRID
              -------------------------------- */}

              {!currentImage && (
                <>
                  <ScannerGrid />

                  <div className="absolute left-1/2 top-4 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/60 px-4 py-2 text-xs font-medium text-white shadow-sm backdrop-blur-md">

                    {currentFaceDisplayName}

                    {" "}Face ({faceNumber}/6):

                    {" "}Align cube inside
                    the grid

                  </div>
                </>
              )}

              {/* --------------------------------
                  CAPTURED IMAGE
              -------------------------------- */}

              {currentImage && (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm">

                  <img
                    src={currentImage}
                    alt={`Captured ${currentFaceDisplayName} cube face`}
                    className="h-full w-full object-contain"
                  />

                  <div className="absolute left-1/2 top-4 -translate-x-1/2 rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm">

                    {currentFaceDisplayName}

                    {" "}face captured

                  </div>

                </div>
              )}

            </>
          ) : (

            /* --------------------------------
                CAMERA INACTIVE
            -------------------------------- */

            <div className="flex h-full items-center justify-center bg-white px-6 text-center">

              <div>

                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600 shadow-sm">

                  <Camera />

                </div>

                <h2 className="text-lg font-bold text-zinc-900">
                  Camera is not active
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  Start your camera to begin
                  scanning.
                </p>

              </div>

            </div>
          )}

        </div>

        {/* --------------------------------
            ERROR
        -------------------------------- */}

        {error && (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm"
          >
            {error}
          </div>
        )}

        {/* --------------------------------
            CAMERA CONTROLS
        -------------------------------- */}

        <div className="mt-6 flex justify-center">

          {!cameraActive ? (

            <button
              type="button"
              onClick={startCamera}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >

              <Camera className="h-4 w-4" />

              Start Camera

            </button>

          ) : (

            <button
              type="button"
              onClick={stopCamera}
              className="rounded-xl border border-zinc-200 bg-white px-6 py-3 text-sm font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50"
            >
              Stop Camera
            </button>

          )}

        </div>

        {/* --------------------------------
            FACE CONTROLS
        -------------------------------- */}

        <FaceScanner
          faceNumber={faceNumber}
          capturedImage={currentImage}
          detectedColors={detectedColors}
          onCapture={captureFace}
          onRescan={rescanFace}
          onNext={nextFace}
          onFinish={finishScan}
          cameraActive={cameraActive}
        />

        {/* --------------------------------
            FACE NAVIGATION
        -------------------------------- */}

        {Object.keys(detectedFaces).length > 0 && (
          <div className="mt-4 flex justify-center gap-3">

            <button
              type="button"
              onClick={previousFace}
              disabled={faceNumber <= 1}
              className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              ← Previous
            </button>

            <div className="flex items-center rounded-lg bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-700">
              {faceNumber} / 6
            </div>

            <button
              type="button"
              onClick={nextFace}
              disabled={faceNumber >= 6}
              className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next →
            </button>

          </div>
        )}

        {/* --------------------------------
            DETECTED CUBE STATE
        -------------------------------- */}

        {Object.keys(detectedFaces).length > 0 && (
          <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">

            {/* Header */}

            <div className="mb-5">

              <h2 className="text-lg font-bold text-zinc-900">
                Detected Cube State
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                {Object.keys(detectedFaces).length}
                {" "}of 6 faces scanned.
              </p>

            </div>

            {/* --------------------------------
                FACE PREVIEWS
            -------------------------------- */}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

              {FACE_ORDER.map((face) => {

                const colors =
                  detectedFaces[face];

                return (
                  <div
                    key={face}
                    className="rounded-xl border border-zinc-200 p-3"
                  >

                    <p className="mb-3 text-sm font-bold text-zinc-800">
                      {face} — {FACE_NAMES[face]}
                    </p>

                    <div className="mx-auto grid max-w-[180px] grid-cols-3 overflow-hidden rounded-lg border border-zinc-300">

                      {Array.from({
                        length: 9,
                      }).map((_, index) => {

                        const color =
                          colors?.[index];

                        return (
                          <div
                            key={index}
                            className={`aspect-square border border-black/10 ${
                              color === "W"
                                ? "bg-white"
                                : color === "Y"
                                  ? "bg-yellow-400"
                                  : color === "R"
                                    ? "bg-red-500"
                                    : color === "O"
                                      ? "bg-orange-500"
                                      : color === "B"
                                        ? "bg-blue-500"
                                        : color === "G"
                                          ? "bg-green-500"
                                          : "bg-zinc-200"
                            }`}
                            title={
                              color
                                ? `Sticker ${
                                    index + 1
                                  }: ${color}`
                                : "Not detected"
                            }
                          />
                        );
                      })}

                    </div>

                  </div>
                );
              })}

            </div>

            {/* --------------------------------
                COLOR VALIDATION
            -------------------------------- */}

            {validationResult && (
              <div className="mt-6 rounded-xl border border-zinc-200 p-4">

                <h3 className="font-bold text-zinc-900">
                  Color Validation
                </h3>

                <p className="mt-1 text-sm text-zinc-500">
                  Each cube color must appear
                  exactly 9 times.
                </p>

                {/* Color counts */}

                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">

                  {Object.entries(
                    validationResult.counts
                  ).map(
                    ([color, count]) => (
                      <div
                        key={color}
                        className={`rounded-lg px-3 py-2 text-sm font-medium ${
                          count === 9
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >

                        <span className="font-bold">
                          {color}
                        </span>

                        <span className="ml-2">
                          {count} / 9
                        </span>

                      </div>
                    )
                  )}

                </div>

                {/* Validation status */}

                {validationResult.valid ? (

                  <div className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                    ✓ All colors are correctly
                    detected.
                  </div>

                ) : (

                  <div className="mt-4 rounded-lg bg-red-50 px-4 py-3">

                    <p className="text-sm font-semibold text-red-700">
                      Cube color counts are
                      invalid.
                    </p>

                    <ul className="mt-2 space-y-1 text-sm text-red-600">

                      {validationResult.errors.map(
                        (
                          validationError,
                          index
                        ) => (
                          <li key={index}>
                            • {validationError}
                          </li>
                        )
                      )}

                    </ul>

                  </div>

                )}

              </div>
            )}

            {/* --------------------------------
                CUBE STATE SUCCESS
            -------------------------------- */}

            {cubeState && (
              <div className="mt-5 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">

                ✓ Cube state created
                successfully and is ready
                for the solver.

              </div>
            )}

            {/* --------------------------------
                KOCIEMBA STRING
            -------------------------------- */}

            {kociembaString && (
              <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">

                <h3 className="font-bold text-blue-900">
                  Kociemba Cube State
                </h3>

                <p className="mt-1 text-sm text-blue-700">
                  54-character cube
                  representation generated
                  successfully.
                </p>

                <div className="mt-3 overflow-x-auto rounded-lg bg-zinc-900 p-4">

                  <code className="whitespace-nowrap font-mono text-sm text-white">
                    {kociembaString}
                  </code>

                </div>

                <div className="mt-3 text-xs text-blue-700">
                  Length:{" "}
                  <strong>
                    {kociembaString.length}
                  </strong>{" "}
                  / 54
                </div>

              </div>
            )}

          </div>
        )}

      </div>

    </section>
  );
}