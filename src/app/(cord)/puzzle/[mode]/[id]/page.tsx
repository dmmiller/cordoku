"use client";

import { Puzzle } from "@/app/(cord)/puzzle/Puzzle";
import { Mode, selectPuzzle } from "@/app/(cord)/puzzle/Puzzles";
import { LiveCursors, PagePresence, Thread, user } from "@cord-sdk/react";
import "./puzzle-page.css";
import styles from "./puzzle.module.css";
import {
  buildOrgId,
  buildRoomId,
  buildThreadId,
} from "@/app/(cord)/puzzle/utils";

export default function PuzzlePage({
  params: { id, mode },
}: {
  params: { id: string; mode: Mode };
}) {
  const location = { id, mode };
  const orgId = buildOrgId(mode, id);
  const viewerData = user.useViewerData();
  if (!viewerData) {
    return <></>;
  }
  return (
    <div className={styles.container}>
      <div className={styles.hello}>Hello {viewerData.name}</div>
      {/* <PagePresence location={location} /> */}
      <Puzzle
        roomId={buildRoomId(mode, id)}
        givens={selectPuzzle(mode, id).givens}
        cordUserId={viewerData.id}
      ></Puzzle>
      <Thread
        className={styles.thread}
        location={location}
        threadId={buildThreadId(mode, id)}
        organizationId={orgId}
      />
      <LiveCursors location={location} organizationID={orgId} />
    </div>
  );
}
