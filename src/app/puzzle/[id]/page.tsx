"use client";

import { Puzzle } from "@/app/puzzle/Puzzle";
import { puzzles } from "@/app/puzzle/Puzzles";

export default function PuzzlePage({
  params: { id },
}: {
  params: { id: string };
}) {
  return (
    <>
      <div>hello {id}</div>
      <Puzzle id={id} givens={puzzles["easy"].givens}></Puzzle>
    </>
  );
}
