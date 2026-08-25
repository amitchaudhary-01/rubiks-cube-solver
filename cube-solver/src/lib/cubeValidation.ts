import type { CubeColor } from "./colorDetection";
import type { CubeState } from "./cube";

export interface CubeValidationResult {
  valid: boolean;
  errors: string[];
  counts: Record<CubeColor, number>;
}

const REQUIRED_COLORS: CubeColor[] = [
  "W",
  "Y",
  "R",
  "O",
  "B",
  "G",
];

const REQUIRED_FACES: Array<keyof CubeState> = [
  "U",
  "R",
  "F",
  "D",
  "L",
  "B",
];

/**
 * Validate a complete Rubik's Cube state.
 *
 * Checks:
 * - All 6 faces exist
 * - Every face contains exactly 9 stickers
 * - Total sticker count is 54
 * - Every color appears exactly 9 times
 * - All six center stickers are different
 */
export function validateCubeState(
  cube: CubeState
): CubeValidationResult {
  const errors: string[] = [];

  /*
   * --------------------------------
   * INITIALIZE COLOR COUNTS
   * --------------------------------
   */

  const counts: Record<CubeColor, number> = {
    W: 0,
    Y: 0,
    R: 0,
    O: 0,
    B: 0,
    G: 0,
  };

  /*
   * --------------------------------
   * CHECK THAT ALL SIX FACES EXIST
   * --------------------------------
   */

  for (const face of REQUIRED_FACES) {
    if (!cube[face]) {
      errors.push(
        `${face} face has not been scanned.`
      );
    }
  }

  /*
   * If any face is missing, we cannot
   * safely validate the cube.
   */
  if (
    REQUIRED_FACES.some(
      (face) => cube[face] === null
    )
  ) {
    return {
      valid: false,
      errors,
      counts,
    };
  }

  /*
   * --------------------------------
   * GET ALL FACES
   * --------------------------------
   *
   * At this point TypeScript still knows
   * the original type allows null, so we
   * explicitly narrow the values.
   */

  const faces = {
    U: cube.U!,
    R: cube.R!,
    F: cube.F!,
    D: cube.D!,
    L: cube.L!,
    B: cube.B!,
  };

  /*
   * --------------------------------
   * CHECK FACE LENGTHS
   * --------------------------------
   */

  for (const face of REQUIRED_FACES) {
    const stickers = faces[face];

    if (stickers.length !== 9) {
      errors.push(
        `${face} face must contain exactly 9 stickers. Found ${stickers.length}.`
      );
    }
  }

  /*
   * --------------------------------
   * COLLECT ALL 54 STICKERS
   * --------------------------------
   */

  const allColors: CubeColor[] = [
    ...faces.U,
    ...faces.R,
    ...faces.F,
    ...faces.D,
    ...faces.L,
    ...faces.B,
  ];

  /*
   * --------------------------------
   * CHECK TOTAL STICKER COUNT
   * --------------------------------
   */

  if (allColors.length !== 54) {
    errors.push(
      `Cube must contain 54 stickers. Found ${allColors.length}.`
    );
  }

  /*
   * --------------------------------
   * COUNT COLORS
   * --------------------------------
   */

  for (const color of allColors) {
    counts[color]++;
  }

  /*
   * --------------------------------
   * CHECK COLOR COUNTS
   * --------------------------------
   *
   * A standard 3x3 Rubik's Cube must have
   * exactly 9 stickers of each color.
   */

  for (const color of REQUIRED_COLORS) {
    if (counts[color] !== 9) {
      errors.push(
        `Color ${color} appears ${counts[color]} times. Expected 9.`
      );
    }
  }

  /*
   * --------------------------------
   * CHECK CENTER COLORS
   * --------------------------------
   *
   * The six center stickers identify the
   * six faces of the cube.
   */

  const centers: CubeColor[] = [
    faces.U[4],
    faces.R[4],
    faces.F[4],
    faces.D[4],
    faces.L[4],
    faces.B[4],
  ];

  const uniqueCenters = new Set(centers);

  /*
   * There must be exactly six different
   * center colors.
   */

  if (uniqueCenters.size !== 6) {
    errors.push(
      "The six center stickers must have different colors."
    );
  }

  /*
   * --------------------------------
   * CHECK CENTER COLORS ARE VALID
   * --------------------------------
   */

  for (const center of centers) {
    if (!REQUIRED_COLORS.includes(center)) {
      errors.push(
        `Invalid center color detected: ${center}.`
      );
    }
  }

  /*
   * --------------------------------
   * FINAL RESULT
   * --------------------------------
   */

  return {
    valid: errors.length === 0,
    errors,
    counts,
  };
}