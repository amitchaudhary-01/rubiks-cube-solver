import type {
  CubeFace,
  CubeState,
  FaceName,
} from "@/src/types/cube";

/*
 * --------------------------------
 * FACE ORDER
 * --------------------------------
 *
 * Kociemba uses:
 *
 * U R F D L B
 */

export const FACE_ORDER: FaceName[] = [
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

export const FACE_NAMES: Record<FaceName, string> = {
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