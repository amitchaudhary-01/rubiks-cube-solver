import type { CubeState } from "@/src/lib/cube";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

export interface CubeSolveResponse {
  success: boolean;
  solution: string[];
  moveCount: number;
  message: string;
}

export interface CubeValidateResponse {
  success: boolean;
  valid: boolean;
  message: string;
  errors: string[];
}

export const cubeService = {
  async validate(
    cube: CubeState
  ): Promise<CubeValidateResponse> {
    const response = await fetch(
      `${API_URL}/cube/validate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cube,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Cube validation failed"
      );
    }

    return data;
  },

  async solve(
    cube: CubeState
  ): Promise<CubeSolveResponse> {
    const response = await fetch(
      `${API_URL}/cube/solve`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cube,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Cube solving failed"
      );
    }

    return data;
  },
};