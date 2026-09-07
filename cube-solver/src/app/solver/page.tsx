"use client";

import { useState } from "react";
import RubiksCube3D from "@/src/components/solver/cube3D/RubiksCube3D";
import { solverService } from "@/src/services/solver.service";

export default function SolverPage() {
  const [cubeString, setCubeString] = useState(
    "UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB"
  );

  const [solution, setSolution] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSolve = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await solverService.solveCube(cubeString);

      if (!result.success) {
        throw new Error(result.message);
      }

      setSolution(result.data.solution);
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to solve cube"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8">

        <button
          onClick={handleSolve}
          disabled={loading}
          className="mb-6 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white disabled:opacity-50"
        >
          {loading ? "Solving..." : "Solve Cube"}
        </button>

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 p-3 text-red-600">
            {error}
          </p>
        )}

        {solution && (
          <div className="mb-6 rounded-xl border bg-gray-50 p-4">
            <p className="text-sm text-gray-500">
              Solution
            </p>

            <p className="mt-1 font-mono font-semibold">
              {solution}
            </p>
          </div>
        )}

        <RubiksCube3D
          kociembaString={cubeString}
          solution={solution}
          autoPlay={false}
        />

      </div>
    </main>
  );
}