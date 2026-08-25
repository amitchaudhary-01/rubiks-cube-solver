import { NextRequest, NextResponse } from "next/server";

/*
 * Force this route to run dynamically.
 *
 * The solver request should never be cached.
 */
export const dynamic = "force-dynamic";

const KOCIEMBA_FACES = /^[URFDLB]{54}$/;

/* --------------------------------
   TYPES
-------------------------------- */

interface SolveRequest {
  facelets?: unknown;
}

interface ExternalSolverResponse {
  solution?: unknown;
  moves?: unknown;
  message?: unknown;
  error?: unknown;
}

/* --------------------------------
   POST /api/solve
-------------------------------- */

export async function POST(
  request: NextRequest
) {
  const startTime = Date.now();

  try {
    /*
     * --------------------------------
     * 1. READ REQUEST BODY
     * --------------------------------
     */

    let body: SolveRequest;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid JSON request body.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * --------------------------------
     * 2. VALIDATE FACELETS
     * --------------------------------
     */

    const facelets = body.facelets;

    if (typeof facelets !== "string") {
      return NextResponse.json(
        {
          success: false,
          error:
            "The 'facelets' field must be a string.",
        },
        {
          status: 400,
        }
      );
    }

    const normalizedFacelets =
      facelets.trim().toUpperCase();

    /*
     * Kociemba expects exactly:
     *
     * 54 characters
     *
     * containing only:
     *
     * U R F D L B
     */
    if (
      !KOCIEMBA_FACES.test(
        normalizedFacelets
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid Kociemba facelet string. Expected exactly 54 characters containing only U, R, F, D, L and B.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * --------------------------------
     * 3. GET EXTERNAL SOLVER URL
     * --------------------------------
     *
     * Example:
     *
     * KOCIEMBA_SOLVER_URL=http://127.0.0.1:5000
     *
     * or:
     *
     * KOCIEMBA_SOLVER_URL=https://your-solver.example.com
     */

    const solverUrl =
      process.env.KOCIEMBA_SOLVER_URL;

    if (!solverUrl) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Kociemba solver is not configured. Add KOCIEMBA_SOLVER_URL to your environment variables.",
        },
        {
          status: 500,
        }
      );
    }

    /*
     * Remove trailing slash.
     */
    const baseUrl =
      solverUrl.replace(/\/+$/, "");

    /*
     * --------------------------------
     * 4. CALL EXTERNAL SOLVER
     * --------------------------------
     *
     * We support the common:
     *
     * POST /solve
     *
     * JSON:
     *
     * {
     *   facelets: "..."
     * }
     */

    const externalResponse =
      await fetch(
        `${baseUrl}/solve`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
            Accept:
              "application/json",
          },

          body: JSON.stringify({
            facelets:
              normalizedFacelets,
          }),

          /*
           * Don't cache solver results.
           */
          cache: "no-store",

          /*
           * Prevent hanging forever.
           */
          signal: AbortSignal.timeout(
            15000
          ),
        }
      );

    /*
     * --------------------------------
     * 5. READ SOLVER RESPONSE
     * --------------------------------
     */

    const contentType =
      externalResponse.headers.get(
        "content-type"
      ) || "";

    let solverData:
      | ExternalSolverResponse
      | string;

    if (
      contentType.includes(
        "application/json"
      )
    ) {
      solverData =
        await externalResponse.json();
    } else {
      solverData =
        await externalResponse.text();
    }

    /*
     * --------------------------------
     * 6. EXTERNAL SOLVER ERROR
     * --------------------------------
     */

    if (!externalResponse.ok) {
      let message =
        "The Kociemba solver could not solve this cube.";

      if (
        typeof solverData === "string" &&
        solverData.trim()
      ) {
        message = solverData;
      }

      if (
        typeof solverData === "object" &&
        solverData !== null
      ) {
        if (
          typeof solverData.error ===
          "string"
        ) {
          message =
            solverData.error;
        } else if (
          typeof solverData.message ===
          "string"
        ) {
          message =
            solverData.message;
        }
      }

      return NextResponse.json(
        {
          success: false,
          error: message,
        },
        {
          status: 422,
        }
      );
    }

    /*
     * --------------------------------
     * 7. EXTRACT SOLUTION
     * --------------------------------
     */

    let solution = "";

    let externalMessage:
      | string
      | undefined;

    if (
      typeof solverData === "object" &&
      solverData !== null
    ) {
      /*
       * Preferred:
       *
       * {
       *   solution: "R U R'"
       * }
       */
      if (
        typeof solverData.solution ===
        "string"
      ) {
        solution =
          solverData.solution.trim();
      }

      /*
       * Some APIs return:
       *
       * {
       *   moves: ["R", "U", "R'"]
       * }
       */
      if (
        !solution &&
        Array.isArray(
          solverData.moves
        )
      ) {
        const validMoves =
          solverData.moves.filter(
            (
              move
            ): move is string =>
              typeof move ===
              "string"
          );

        solution =
          validMoves.join(" ");
      }

      if (
        typeof solverData.message ===
        "string"
      ) {
        externalMessage =
          solverData.message;
      }
    }

    /*
     * Some simple Kociemba APIs return
     * plain text such as:
     *
     * R U R' U2 F
     */
    if (
      !solution &&
      typeof solverData ===
        "string"
    ) {
      solution =
        solverData.trim();
    }

    /*
     * --------------------------------
     * 8. MAKE SURE SOLUTION EXISTS
     * --------------------------------
     */

    if (!solution) {
      return NextResponse.json(
        {
          success: false,
          error:
            "The Kociemba solver returned no solution.",
        },
        {
          status: 422,
        }
      );
    }

    /*
     * --------------------------------
     * 9. NORMALIZE MOVES
     * --------------------------------
     */

    const moves = solution
      .split(/\s+/)
      .filter(Boolean);

    /*
     * --------------------------------
     * 10. RETURN RESULT
     * --------------------------------
     */

    return NextResponse.json(
      {
        success: true,

        solution,

        moves,

        facelets:
          normalizedFacelets,

        timeTakenMs:
          Date.now() - startTime,

        message:
          externalMessage ||
          "Cube solved successfully.",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Kociemba solver error:",
      error
    );

    /*
     * Timeout.
     */
    if (
      error instanceof Error &&
      error.name ===
        "TimeoutError"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "The solver took too long to respond. Please try again.",
        },
        {
          status: 504,
        }
      );
    }

    /*
     * Network error or unexpected error.
     */
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unexpected solver error.",
      },
      {
        status: 500,
      }
    );
  }
}