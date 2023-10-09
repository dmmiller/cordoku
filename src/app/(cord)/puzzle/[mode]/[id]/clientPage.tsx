"use client";

import { Puzzle } from "@/app/(cord)/puzzle/Puzzle";
import { LiveCursors, Thread, user } from "@cord-sdk/react";
import { Location } from "@cord-sdk/types";
import styles from "./puzzle.module.css";

export default function ClientPuzzlePage({
  partyKitHost,
  roomId,
  givens,
  location,
  orgId,
  threadId,
}: {
  partyKitHost: string;
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
        partyKitHost={partyKitHost}
        roomId={roomId}
        givens={givens}
        location={location}
        orgId={orgId}
        cordUserId={viewerData.id}
      ></Puzzle>
      <Thread
        className={styles.thread}
        location={location}
        threadId={threadId}
        organizationId={orgId}
        showPlaceholder={false}
      />
      <LiveCursors location={location} organizationID={orgId} />
    </div>
  );
}
