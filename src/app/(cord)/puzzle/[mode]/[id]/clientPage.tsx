"use client";

import { Puzzle } from "@/app/(cord)/puzzle/Puzzle";
import { LiveCursors, Thread, user } from "@cord-sdk/react";
import { Location } from "@cord-sdk/types";
import "./puzzle-page.css";
import styles from "./puzzle.module.css";

export default function ClientPuzzlePage({
  roomId,
  givens,
  location,
  orgId,
  threadId,
}: {
  roomId: string;
  givens: string[];
  location: Location;
  orgId: string;
  threadId: string;
}) {
  const viewerData = user.useViewerData();
  if (!viewerData) {
    return <></>;
  }
  return (
    <div className={styles.container}>
      <div className={styles.hello}>Hello {viewerData.name}</div>
      <Puzzle
        roomId={roomId}
        givens={givens}
        cordUserId={viewerData.id}
      ></Puzzle>
      <Thread
        className={styles.thread}
        location={location}
        threadId={threadId}
        organizationId={orgId}
      />
      <LiveCursors location={location} organizationID={orgId} />
    </div>
  );
}
