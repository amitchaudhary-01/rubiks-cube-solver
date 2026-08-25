import type { CubeState } from "./cube";
import { cubeStateToKociemba } from "./kociemba";

/* --------------------------------
   TYPES
-------------------------------- */

export interface SolveCubeResult {
  success: boolean;
  solution: string;
  moves: string[];
  facelets: string;
  timeTakenMs?: number;
  message?: string;
}

interface SolveApiResponse {
  success?: boolean;
  solution?: string;
  moves?: string[];
  timeTakenMs?: number;
  message?: string;
  error?: string;
}

/* --------------------------------
   SOLVER FUNCTION
-------------------------------- */

/**
 * Convert the scanned CubeState into
 * Kociemba notation and send it to our
 * Next.js API route.
 */
export async function solveCube(
  cubeState: CubeState
): Promise<SolveCubeResult> {
  /*
   * Convert:
   *
   * CubeState
   *      ↓
   * 54-character Kociemba string
   */
  const facelets =
    cubeStateToKociemba(cubeState);

  /*
   * Send the cube to our internal
   * Next.js API route.
   */
  const response = await fetch(
    "/api/solve",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        facelets,
      }),
    }
  );

  /*
   * Try to read JSON response.
   */
  let data: SolveApiResponse;

  try {
    data = await response.json();
  } catch {
    throw new Error(
      `Solver API returned an invalid response. HTTP ${response.status}.`
    );
  }

  /*
   * API-level error.
   */
  if (!response.ok) {
    throw new Error(
      data.error ||
        data.message ||
        `Solver API request failed with status ${response.status}.`
    );
  }

  /*
   * Make sure a solution was returned.
   */
  if (
    !data.solution ||
    typeof data.solution !== "string"
  ) {
    throw new Error(
      "Solver API did not return a valid solution."
    );
  }

  /*
   * Convert:
   *
   * "R U R' U'"
   *
   * into:
   *
   * ["R", "U", "R'", "U'"]
   */
  const moves = data.solution
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  return {
    success: true,
    solution: data.solution,
    moves,
    facelets,
    timeTakenMs: data.timeTakenMs,
    message:
      data.message ||
      "Cube solved successfully.",
  };
}