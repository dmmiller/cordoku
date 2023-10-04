"use client";

import { Puzzle } from "@/app/(cord)/puzzle/Puzzle";
import { puzzles } from "@/app/(cord)/puzzle/Puzzles";
import { LiveCursors, Thread, user } from "@cord-sdk/react";
import "./puzzle-page.css";

export default function PuzzlePage({
  params: { id, mode },
}: {
  params: { id: string; mode: string };
}) {
  const location = { id, mode };
  const viewerData = user.useViewerData();
  if (!viewerData) {
    return <></>;
  }
  return (
    <>
      <div>
        Hello{" "}
        <span className="name" data-coop-text-playerid={viewerData.id}>
          {viewerData.name}
        </span>
      </div>
      <Puzzle
        id={`${mode}-${id}`}
        givens={puzzles["easy"].givens}
        cordUserId={viewerData.id}
      ></Puzzle>
      <Thread location={location} threadId={`${mode}-${id}`}></Thread>
      <LiveCursors location={location}></LiveCursors>
    </>
  );
}
