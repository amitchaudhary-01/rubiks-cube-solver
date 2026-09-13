"use client";

import { useState } from "react";

import CubeFaceEditor from "@/src/components/cube/CubeFaceEditor";
import CubeScanner from "@/src/components/scanner/CubeScanner";

import type { CubeState } from "@/src/types/cube";

import { validateCubeState } from "@/src/lib/cubeValidation";
import { cubeStateToKociemba } from "@/src/lib/kociemba";

export default function ScannerPage() {
  const [cubeState, setCubeState] =
    useState<CubeState | null>(null);

  const [validationMessage, setValidationMessage] =
    useState("");

  const [kociembaString, setKociembaString] =
    useState<string | null>(null);

  const [solution, setSolution] =
    useState<string[]>([]);

  const [isSolving, setIsSolving] =
    useState(false);

  /*
   * --------------------------------
   * VALIDATE EDITED CUBE
   * --------------------------------
   */

  const handleValidate = () => {
    if (!cubeState) return;

    const validation =
      validateCubeState(cubeState);

    if (!validation.valid) {
      setValidationMessage(
        validation.errors.join(" "),
      );

      setKociembaString(null);
      setSolution([]);

      console.error(
        "Cube validation failed:",
        validation,
      );

      return;
    }

    setValidationMessage(
      "Cube is valid.",
    );

    try {
      const kociemba =
        cubeStateToKociemba(cubeState);

      if (kociemba.length !== 54) {
        throw new Error(
          `Expected 54 characters, received ${kociemba.length}.`,
        );
      }

      setKociembaString(kociemba);

      console.log(
        "Kociemba:",
        kociemba,
      );
    } catch (error) {
      console.error(
        "Kociemba conversion failed:",
        error,
      );

      setValidationMessage(
        "Cube is valid, but Kociemba conversion failed.",
      );

      setKociembaString(null);
    }
  };

  /*
   * --------------------------------
   * SOLVE CUBE
   * --------------------------------
   */

  const handleSolve = async () => {
    if (!cubeState) return;

    const validation =
      validateCubeState(cubeState);

    if (!validation.valid) {
      setValidationMessage(
        validation.errors.join(" "),
      );

      return;
    }

    try {
      setIsSolving(true);

      const kociemba =
        cubeStateToKociemba(cubeState);

      setKociembaString(kociemba);

      /*
       * Backend call comes here.
       *
       * Example:
       *
       * const response =
       *   await solverService.solveCube(
       *     kociemba,
       *   );
       *
       * setSolution(response.data.moves);
       */

      console.log(
        "Cube ready for solver:",
        kociemba,
      );
    } catch (error) {
      console.error(
        "Solve error:",
        error,
      );
    } finally {
      setIsSolving(false);
    }
  };

  /*
   * --------------------------------
   * SCANNER
   * --------------------------------
   */

  if (!cubeState) {
    return (
      <main className="min-h-screen bg-[#FBFBFA] text-zinc-900">
        <CubeScanner
          onScanComplete={(scannedCube) => {
            setCubeState(scannedCube);
            setValidationMessage("");
            setKociembaString(null);
            setSolution([]);
          }}
        />
      </main>
    );
  }

  /*
   * --------------------------------
   * EDITOR
   * --------------------------------
   */

  return (
    <main className="min-h-screen bg-[#FBFBFA] text-zinc-900">
      <CubeFaceEditor
        cubeState={cubeState}
        onChange={(updatedCube) => {
          setCubeState(updatedCube);

          /*
           * Any sticker modification invalidates
           * previous validation/solution data.
           */

          setValidationMessage("");
          setKociembaString(null);
          setSolution([]);
        }}
        onValidate={handleValidate}
        onSolve={handleSolve}
      />

      {validationMessage && (
        <div className="mx-auto max-w-3xl px-4 pb-8">
          <div className="rounded-xl bg-gray-900 p-4 text-sm text-white">
            {validationMessage}
          </div>
        </div>
      )}

      {kociembaString && (
        <div className="mx-auto max-w-3xl px-4 pb-8">
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm font-semibold text-blue-900">
              Kociemba State
            </p>

            <code className="mt-2 block break-all text-sm text-blue-800">
              {kociembaString}
            </code>
          </div>
        </div>
      )}

      {solution.length > 0 && (
        <div className="mx-auto max-w-3xl px-4 pb-8">
          <div className="rounded-xl bg-white p-5 shadow">
            <h2 className="text-lg font-bold">
              Solution
            </h2>

            <p className="mt-2 font-mono text-sm">
              {solution.join(" ")}
            </p>
          </div>
        </div>
      )}

      {isSolving && (
        <div className="pb-8 text-center text-sm text-gray-500">
          Solving cube...
        </div>
      )}
    </main>
  );
}