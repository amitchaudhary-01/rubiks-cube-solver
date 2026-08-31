import axios from "axios";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3000/api/v1";

export interface SolveCubeResponse {
  success: boolean;
  message: string;
  data: {
    solution: string;
    moves: string[];
    moveCount: number;
    solved: boolean;
  };
}

export const solverService = {
  solveCube: async (
    kociembaString: string
  ): Promise<SolveCubeResponse> => {
    const response = await axios.post(
      `${API_URL}/solver/solve`,
      {
        kociembaString,
      }
    );

    return response.data;
  },
};