import { Mode, selectPuzzle } from "@/app/(cord)/puzzle/Puzzles";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: { mode: Mode; id: string } }
) {
  const puzzle = selectPuzzle(params.mode, params.id);
  return NextResponse.json(puzzle);
}
