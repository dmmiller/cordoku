"use client";

import { Puzzle } from "@/app/(cord)/puzzle/Puzzle";
import { LiveCursors, Thread, user } from "@cord-sdk/react";
import { Location } from "@cord-sdk/types";
import styles from "./puzzle.module.css";
import { useState } from "react";
import Link from "next/link";

function WinnerDisplay({ id }: { id: string }) {
  const winner = user.useUserData(id);
  if (!winner) {
    return <></>;
  }

  return (
    <div className="final-result">
      <h1>
        WINNER IS
        <br />
        <span>{winner.name?.toUpperCase()}</span>
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
  const [winnerId, setWinnerId] = useState("");
  const viewerData = user.useViewerData();
  if (!viewerData) {
    return <></>;
  }
  return (
    <div className={styles.container}>
      <Puzzle
        partyKitHost={partyKitHost}
        roomId={roomId}
        givens={givens}
        location={location}
        orgId={orgId}
        cordUserId={viewerData.id}
        onGameEnd={(id) => {
          setGameOver(true);
          setWinnerId(id);
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
      {gameOver && <WinnerDisplay id={winnerId} />}
    </div>
  );
}
