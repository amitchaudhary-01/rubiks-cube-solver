export type CubeColor =
  | "W"
  | "Y"
  | "R"
  | "O"
  | "B"
  | "G";

type RGB = {
  r: number;
  g: number;
  b: number;
};

type HSV = {
  h: number;
  s: number;
  v: number;
};

/**
 * Convert RGB to HSV.
 *
 * Hue:
 * 0   → red
 * 60  → yellow
 * 120 → green
 * 180 → cyan
 * 240 → blue
 * 300 → magenta
 */
function rgbToHsv({
  r,
  g,
  b,
}: RGB): HSV {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;

  const max = Math.max(
    red,
    green,
    blue
  );

  const min = Math.min(
    red,
    green,
    blue
  );

  const difference = max - min;

  let h = 0;

  if (difference !== 0) {
    if (max === red) {
      h =
        60 *
        (((green - blue) / difference) % 6);
    } else if (max === green) {
      h =
        60 *
        ((blue - red) / difference + 2);
    } else {
      h =
        60 *
        ((red - green) / difference + 4);
    }
  }

  if (h < 0) {
    h += 360;
  }

  const s =
    max === 0
      ? 0
      : difference / max;

  const v = max;

  return {
    h,
    s,
    v,
  };
}

/**
 * Calculate average RGB from an image region.
 *
 * We intentionally sample the CENTER
 * portion of the sticker instead of
 * its borders.
 */
function getAverageRgb(
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number
): RGB {
  const canvas =
    document.createElement("canvas");

  /*
   * Small sampling canvas.
   */
  const sampleSize = 20;

  canvas.width = sampleSize;
  canvas.height = sampleSize;

  const context =
    canvas.getContext("2d", {
      willReadFrequently: true,
    });

  if (!context) {
    throw new Error(
      "Unable to create canvas context."
    );
  }

  /*
   * Ignore the outer 25% of each
   * sticker region.
   *
   * This helps avoid:
   *
   * - cube borders
   * - black gaps
   * - neighboring stickers
   */
  const paddingX =
    width * 0.25;

  const paddingY =
    height * 0.25;

  const innerWidth =
    width - paddingX * 2;

  const innerHeight =
    height - paddingY * 2;

  context.drawImage(
    image,

    x + paddingX,
    y + paddingY,

    innerWidth,
    innerHeight,

    0,
    0,

    sampleSize,
    sampleSize
  );

  const pixels =
    context.getImageData(
      0,
      0,
      sampleSize,
      sampleSize
    ).data;

  let totalR = 0;
  let totalG = 0;
  let totalB = 0;

  let count = 0;

  for (
    let i = 0;
    i < pixels.length;
    i += 4
  ) {
    const alpha =
      pixels[i + 3];

    if (alpha === 0) {
      continue;
    }

    totalR += pixels[i];
    totalG += pixels[i + 1];
    totalB += pixels[i + 2];

    count++;
  }

  if (count === 0) {
    throw new Error(
      "Unable to sample image pixels."
    );
  }

  return {
    r: totalR / count,
    g: totalG / count,
    b: totalB / count,
  };
}

/**
 * Classify an RGB value into a
 * Rubik's Cube color.
 *
 * This is our first version.
 *
 * Later we can improve this using:
 *
 * - calibration
 * - LAB color space
 * - center-piece references
 * - lighting normalization
 * - nearest-color matching
 */
function classifyColor(
  rgb: RGB
): CubeColor {
  const hsv =
    rgbToHsv(rgb);

  const {
    h,
    s,
    v,
  } = hsv;

  /*
   * WHITE
   *
   * White normally has:
   *
   * - high brightness
   * - low saturation
   */
  if (
    v > 0.72 &&
    s < 0.25
  ) {
    return "W";
  }

  /*
   * YELLOW
   */
  if (
    h >= 40 &&
    h <= 75 &&
    s > 0.35 &&
    v > 0.45
  ) {
    return "Y";
  }

  /*
   * GREEN
   */
  if (
    h >= 75 &&
    h <= 165 &&
    s > 0.3 &&
    v > 0.25
  ) {
    return "G";
  }

  /*
   * BLUE
   */
  if (
    h >= 165 &&
    h <= 260 &&
    s > 0.3 &&
    v > 0.25
  ) {
    return "B";
  }

  /*
   * RED
   *
   * Red wraps around HSV:
   *
   * 0 degrees
   * and
   * 360 degrees
   */
  if (
    (h >= 0 && h <= 15) ||
    h >= 340
  ) {
    return "R";
  }

  /*
   * ORANGE
   */
  if (
    h > 15 &&
    h < 40 &&
    s > 0.35 &&
    v > 0.35
  ) {
    return "O";
  }

  /*
   * Fallback.
   */
  return getFallbackColor(rgb);
}

/**
 * Fallback based on RGB dominance.
 */
function getFallbackColor(
  rgb: RGB
): CubeColor {
  const {
    r,
    g,
    b,
  } = rgb;

  const max = Math.max(
    r,
    g,
    b
  );

  /*
   * Bright + relatively equal
   * values → white
   */
  if (
    max > 180 &&
    Math.abs(r - g) < 35 &&
    Math.abs(g - b) < 35
  ) {
    return "W";
  }

  /*
   * RED
   */
  if (
    r > g * 1.35 &&
    r > b * 1.5
  ) {
    return "R";
  }

  /*
   * ORANGE
   */
  if (
    r > b * 1.4 &&
    g > b * 1.2
  ) {
    return "O";
  }

  /*
   * GREEN
   */
  if (
    g > r * 1.2 &&
    g > b * 1.15
  ) {
    return "G";
  }

  /*
   * BLUE
   */
  if (
    b > r * 1.2 &&
    b > g * 1.05
  ) {
    return "B";
  }

  /*
   * YELLOW
   */
  if (
    r > b * 1.2 &&
    g > b * 1.1
  ) {
    return "Y";
  }

  /*
   * Last fallback.
   */
  return "W";
}

/**
 * Detect all 9 sticker colors
 * from one captured cube face.
 *
 * The ScannerGrid uses:
 *
 * w-[55%]
 *
 * so we analyze approximately
 * the centered 55% square of the
 * captured image.
 */
export function detectFaceColors(
  image: HTMLImageElement
): CubeColor[] {
  /*
   * Make sure the image is ready.
   */
  if (
    !image.complete ||
    image.naturalWidth === 0 ||
    image.naturalHeight === 0
  ) {
    throw new Error(
      "Captured image is not ready."
    );
  }

  const imageWidth =
    image.naturalWidth;

  const imageHeight =
    image.naturalHeight;

  /*
   * Scanner area.
   *
   * ScannerGrid:
   *
   * w-[55%]
   *
   * We use the shortest image
   * dimension because the scanner
   * itself is square.
   */
  const scanSize =
    Math.min(
      imageWidth,
      imageHeight
    ) * 0.55;

  /*
   * Center scanner region.
   */
  const scanX =
    (imageWidth - scanSize) / 2;

  const scanY =
    (imageHeight - scanSize) / 2;

  /*
   * Divide scanner region into
   * 3 × 3.
   */
  const cellSize =
    scanSize / 3;

  const colors: CubeColor[] = [];

  /*
   * Read:
   *
   * 0 1 2
   * 3 4 5
   * 6 7 8
   */
  for (
    let row = 0;
    row < 3;
    row++
  ) {
    for (
      let column = 0;
      column < 3;
      column++
    ) {
      const x =
        scanX +
        column * cellSize;

      const y =
        scanY +
        row * cellSize;

      const rgb =
        getAverageRgb(
          image,
          x,
          y,
          cellSize,
          cellSize
        );

      const color =
        classifyColor(rgb);

      colors.push(color);
    }
  }

  /*
   * Safety check.
   */
  if (colors.length !== 9) {
    throw new Error(
      `Expected 9 detected colors, received ${colors.length}.`
    );
  }

  return colors;
}