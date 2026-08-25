import type { CubeColor } from "./colorDetection";

/*
 * --------------------------------
 * CUBE FACE NAMES
 * --------------------------------
 *
 * Kociemba uses:
 *
 * U = Up
 * R = Right
 * F = Front
 * D = Down
 * L = Left
 * B = Back
 */

export type CubeFaceName =
  | "U"
  | "R"
  | "F"
  | "D"
  | "L"
  | "B";

/*
 * --------------------------------
 * CUBE FACE
 * --------------------------------
 *
 * Every face contains exactly
 * 9 stickers:
 *
 *  0 1 2
 *  3 4 5
 *  6 7 8
 */

export type CubeFace = [
  CubeColor,
  CubeColor,
  CubeColor,
  CubeColor,
  CubeColor,
  CubeColor,
  CubeColor,
  CubeColor,
  CubeColor
];

/*
 * --------------------------------
 * COMPLETE CUBE STATE
 * --------------------------------
 *
 * A valid CubeState always contains
 * all six faces.
 */

export type CubeState = {
  U: CubeFace;
  R: CubeFace;
  F: CubeFace;
  D: CubeFace;
  L: CubeFace;
  B: CubeFace;
};

/*
 * --------------------------------
 * FACE ORDER
 * --------------------------------
 *
 * This order is extremely important.
 *
 * It is also the order used by
 * Kociemba:
 *
 * U R F D L B
 */

export const FACE_ORDER: CubeFaceName[] = [
  "U",
  "R",
  "F",
  "D",
  "L",
  "B",
];

/*
 * --------------------------------
 * HUMAN-READABLE FACE NAMES
 * --------------------------------
 */

export const FACE_NAMES: Record<
  CubeFaceName,
  string
> = {
  U: "Up",
  R: "Right",
  F: "Front",
  D: "Down",
  L: "Left",
  B: "Back",
};

/*
 * --------------------------------
 * EMPTY CUBE STATE
 * --------------------------------
 *
 * This is useful while scanning.
 *
 * Since CubeState itself represents
 * a completed cube, we use a separate
 * temporary type for the empty state.
 */

export type EmptyCubeState = {
  U: CubeFace | null;
  R: CubeFace | null;
  F: CubeFace | null;
  D: CubeFace | null;
  L: CubeFace | null;
  B: CubeFace | null;
};

export const createEmptyCubeState =
  (): EmptyCubeState => ({
    U: null,
    R: null,
    F: null,
    D: null,
    L: null,
    B: null,
  });