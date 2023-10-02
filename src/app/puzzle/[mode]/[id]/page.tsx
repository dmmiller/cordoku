"use client";

import { Puzzle } from "@/app/puzzle/Puzzle";
import { puzzles } from "@/app/puzzle/Puzzles";

export default function PuzzlePage({
  params: { id, mode },
}: {
  params: { id: string; mode: string };
}) {
  return (
    <>
      <div>hello {mode}</div>
      <Puzzle id={id} givens={puzzles["easy"].givens}></Puzzle>
    </>
  );
}
