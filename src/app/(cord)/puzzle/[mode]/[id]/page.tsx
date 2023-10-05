"use client";

import { Puzzle } from "@/app/(cord)/puzzle/Puzzle";
import { puzzles } from "@/app/(cord)/puzzle/Puzzles";
import { LiveCursors, PagePresence, Thread, user } from "@cord-sdk/react";
import "./puzzle-page.css";
import { useEffect, useState } from "react";

export default function PuzzlePage({
  params: { id, mode },
}: {
  params: { id: string; mode: string };
}) {
  const location = { id, mode };
  const orgId = `${id}-${mode}`;
  const viewerData = user.useViewerData();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!viewerData) {
      return;
    }
    (async () => {
      const response = await fetch("/api/addToOrg", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          org_id: orgId,
          user_id: viewerData.id,
        }),
      });
      setReady(true);
    })();
  }, [viewerData, orgId]);
  if (!viewerData || !ready) {
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
