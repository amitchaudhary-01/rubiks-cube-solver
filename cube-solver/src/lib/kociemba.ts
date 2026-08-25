import type { CubeColor } from "./colorDetection";
import type { CubeState } from "./cube";

/*
 * Kociemba face order:
 *
 * U R F D L B
 */

export type KociembaFace =
  | "U"
  | "R"
  | "F"
  | "D"
  | "L"
  | "B";

export type KociembaString = string;

/* --------------------------------
   FACE LIST
-------------------------------- */

const KOCIEMBA_FACES: KociembaFace[] = [
  "U",
  "R",
  "F",
  "D",
  "L",
  "B",
];

/* --------------------------------
   VALID CUBE COLORS
-------------------------------- */

const CUBE_COLORS: CubeColor[] = [
  "W",
  "Y",
  "R",
  "O",
  "B",
  "G",
];

/* --------------------------------
   GET CENTER COLORS
-------------------------------- */

/*
 * A face is stored as:
 *
 * 0 1 2
 * 3 4 5
 * 6 7 8
 *
 * Index 4 = center sticker.
 */

function getCenterColors(
  cube: CubeState
): Record<KociembaFace, CubeColor> {
  return {
    U: cube.U[4],
    R: cube.R[4],
    F: cube.F[4],
    D: cube.D[4],
    L: cube.L[4],
    B: cube.B[4],
  };
}

/* --------------------------------
   VALIDATE FACE LENGTHS
-------------------------------- */

function validateFaceLengths(
  cube: CubeState
): void {
  for (const face of KOCIEMBA_FACES) {
    const stickers = cube[face];

    if (!stickers) {
      throw new Error(
        `${face} face has not been scanned.`
      );
    }

    if (stickers.length !== 9) {
      throw new Error(
        `${face} face must contain exactly 9 stickers.`
      );
    }
  }
}

/* --------------------------------
   VALIDATE COLOR COUNTS
-------------------------------- */

function validateColorCounts(
  cube: CubeState
): void {
  const allColors: CubeColor[] = [
    ...cube.U,
    ...cube.R,
    ...cube.F,
    ...cube.D,
    ...cube.L,
    ...cube.B,
  ];

  if (allColors.length !== 54) {
    throw new Error(
      `Cube must contain exactly 54 stickers. Found ${allColors.length}.`
    );
  }

  const counts: Record<CubeColor, number> = {
    W: 0,
    Y: 0,
    R: 0,
    O: 0,
    B: 0,
    G: 0,
  };

  for (const color of allColors) {
    counts[color]++;
  }

  for (const color of CUBE_COLORS) {
    if (counts[color] !== 9) {
      throw new Error(
        `Invalid cube color count: ${color} appears ${counts[color]} times. Each color must appear exactly 9 times.`
      );
    }
  }
}

/* --------------------------------
   CREATE COLOR → FACE MAP
-------------------------------- */

/*
 * The important part:
 *
 * We do NOT assume:
 *
 * W = U
 * R = R
 * G = F
 *
 * Instead, the center stickers determine
 * which physical color belongs to which
 * Kociemba face.
 *
 * Example:
 *
 * If U center = W
 * then W → U
 *
 * If R center = R
 * then R → R
 *
 * etc.
 */

function createColorToFaceMap(
  cube: CubeState
): Record<CubeColor, KociembaFace> {
  const centers = getCenterColors(cube);

  /*
   * Temporary mapping.
   *
   * Partial is used because TypeScript
   * cannot know that computed color keys
   * will eventually contain all six colors.
   */
  const map: Partial<
    Record<CubeColor, KociembaFace>
  > = {};

  /*
   * Add each center color to the map.
   */
  for (const face of KOCIEMBA_FACES) {
    const color = centers[face];

    /*
     * Prevent duplicate center colors.
     */
    if (map[color]) {
      throw new Error(
        `Invalid cube centers: color ${color} is used by more than one face.`
      );
    }

    map[color] = face;
  }

  /*
   * Make sure all six colors exist.
   */
  for (const color of CUBE_COLORS) {
    if (!map[color]) {
      throw new Error(
        `Invalid cube centers: color ${color} is missing from the six center stickers.`
      );
    }
  }

  /*
   * At this point TypeScript still sees
   * the object as Partial, so explicitly
   * construct the complete Record.
   */
  return {
    W: map.W!,
    Y: map.Y!,
    R: map.R!,
    O: map.O!,
    B: map.B!,
    G: map.G!,
  };
}

/* --------------------------------
   CONVERT ONE FACE
-------------------------------- */

function convertFace(
  face: CubeColor[],
  colorToFace: Record<
    CubeColor,
    KociembaFace
  >
): string {
  if (face.length !== 9) {
    throw new Error(
      `A cube face must contain exactly 9 stickers.`
    );
  }

  return face
    .map((color) => {
      const faceName =
        colorToFace[color];

      if (!faceName) {
        throw new Error(
          `Unable to convert cube color "${color}" to a Kociemba face.`
        );
      }

      return faceName;
    })
    .join("");
}

/* --------------------------------
   CONVERT CUBE STATE
   → KOCIEMBA STRING
-------------------------------- */

/*
 * Kociemba expects:
 *
 * UUUUUUUUU
 * RRRRRRRRR
 * FFFFFFFFF
 * DDDDDDDDD
 * LLLLLLLLL
 * BBBBBBBBB
 *
 * Total = 54 characters.
 */

export function cubeStateToKociemba(
  cube: CubeState
): KociembaString {
  /*
   * 1. Validate that all six faces
   *    exist and contain 9 stickers.
   */
  validateFaceLengths(cube);

  /*
   * 2. Validate that every color
   *    appears exactly 9 times.
   */
  validateColorCounts(cube);

  /*
   * 3. Determine which color belongs
   *    to each Kociemba face based
   *    on the center stickers.
   */
  const colorToFace =
    createColorToFaceMap(cube);

  /*
   * 4. Convert all six faces.
   */
  const result =
    convertFace(cube.U, colorToFace) +
    convertFace(cube.R, colorToFace) +
    convertFace(cube.F, colorToFace) +
    convertFace(cube.D, colorToFace) +
    convertFace(cube.L, colorToFace) +
    convertFace(cube.B, colorToFace);

  /*
   * 5. Final safety check.
   */
  if (result.length !== 54) {
    throw new Error(
      `Invalid Kociemba string length: ${result.length}. Expected 54.`
    );
  }

  /*
   * 6. Make sure only Kociemba
   *    face characters exist.
   */
  const validCharacters =
    /^[URFDLB]{54}$/;

  if (!validCharacters.test(result)) {
    throw new Error(
      "Generated Kociemba string contains invalid characters."
    );
  }

  return result;
}