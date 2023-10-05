"use client";

import { Puzzle } from "@/app/(cord)/puzzle/Puzzle";
import { puzzles } from "@/app/(cord)/puzzle/Puzzles";
import { LiveCursors, PagePresence, Thread, user } from "@cord-sdk/react";
import "./puzzle-page.css";

export default function PuzzlePage({
  params: { id, mode },
}: {
  params: { id: string; mode: string };
}) {
  const location = { id, mode };
  const orgId = `${id}-${mode}`;
  const viewerData = user.useViewerData();
  if (!viewerData) {
    return <></>;
  }
  return (
    <>
      <div>Hello {viewerData.name}</div>
      {/* <PagePresence location={location} /> */}
      <Puzzle
        id={`${mode}-${id}`}
        givens={puzzles["easy"].givens}
        cordUserId={viewerData.id}
      ></Puzzle>
      <Thread
        location={location}
        threadId={`${mode}-${id}`}
        organizationId={orgId}
      />
      <LiveCursors location={location} organizationID={orgId} />
    </>
  );
}
