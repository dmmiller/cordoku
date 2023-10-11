"use client";

import { Puzzle } from "@/app/(cord)/puzzle/Puzzle";
import { LiveCursors, Thread, user } from "@cord-sdk/react";
import { Location } from "@cord-sdk/types";
import styles from "./puzzle.module.css";
import { useState } from "react";
import Link from "next/link";

function WinnerDisplay(name: string) {
  return (
    <div className="final-result">
      <h1>
        WINNER IS
        <br />
        <span>{name}</span>
      </h1>
      <Link href="/">New Game</Link>
    </div>
  );
}

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
  const [gameOver, setGameOver] = useState(false);
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
        onGameEnd={(id) => {
          setGameOver(true);
        }}
      ></Puzzle>
      <Thread
        className={styles.thread}
        location={location}
        threadId={threadId}
        organizationId={orgId}
        showPlaceholder={false}
      />
      <LiveCursors location={location} organizationID={orgId} />
      {gameOver && WinnerDisplay("dave")}
    </div>
  );
}
