export type CubeColor =
  | "W"
  | "R"
  | "G"
  | "Y"
  | "O"
  | "B";

export type FaceName =
  | "U"
  | "R"
  | "F"
  | "D"
  | "L"
  | "B";

/*
 * Every cube face contains exactly 9 stickers.
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

export type CubeState = {
  U: CubeFace;
  R: CubeFace;
  F: CubeFace;
  D: CubeFace;
  L: CubeFace;
  B: CubeFace;
};

export interface SolveResponse {
  success: boolean;
  solution: string[];
  moveCount: number;
  message: string;
};

export const COLOR_TO_FACE: Record<CubeColor, FaceName> = {
  W: "U",
  R: "R",
  G: "F",
  Y: "D",
  O: "L",
  B: "B",
};