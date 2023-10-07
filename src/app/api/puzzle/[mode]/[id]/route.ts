import { Mode, selectPuzzle } from "@/app/(cord)/puzzle/Puzzles";

export async function GET(
  _request: Request,
  { params }: { params: { mode: Mode; id: string } }
) {
  const puzzle = selectPuzzle(params.mode, params.id);
  return Response.json(puzzle);
}
