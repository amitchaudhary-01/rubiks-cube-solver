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

export type CubeState = {
  U: CubeColor[];
  R: CubeColor[];
  F: CubeColor[];
  D: CubeColor[];
  L: CubeColor[];
  B: CubeColor[];
};

export interface SolveResponse {
  success: boolean;
  solution: string[];
  moveCount: number;
  message: string;
}