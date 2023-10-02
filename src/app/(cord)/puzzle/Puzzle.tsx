"use client";

import Script from "next/script";
import usePartySocket from "partysocket/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "public/puzzlejs/puzzle.css";
import "./puzzle.css";

import {
  Change,
  ClientMessage,
  PuzzleEntry,
  PuzzleEvent,
  ServerMessage,
} from "@/app/(cord)/puzzle/PuzzleTypes";
import { Scores } from "@/app/(cord)/puzzle/Scores";

// declare const PARTYKIT_HOST: string;

const PARTYKIT_HOST = "127.0.0.1:1999";

type PuzzleDivElement = { puzzleEntry: PuzzleEntry } & HTMLDivElement;

export function Puzzle({
  id,
  givens,
  player,
}: {
  id: string;
  givens: string[];
  player: string;
}) {
  const puzzleRef = useRef<PuzzleDivElement>(null);
  const alternatesSet = useMemo(() => {
    return new Set<string>();
  }, []);
  const [scores, setScores] = useState<{ playerId: string; score: number }[]>();

  const socket = usePartySocket({
    host: PARTYKIT_HOST,
    room: `cordoku-${id}`,
    onOpen: (event) => {
      console.log("socketOpen");
      console.log(event);
    },
    onClose: (event) => {
      console.log("socketClose");
      console.log(event);
    },
    onError: (event) => {
      console.log("socketError");
      console.log(event);
    },
    onMessage: (event) => {
      if (!puzzleRef.current) {
        console.log("The client is not yet initialized??");
        return;
      }
      const serverMessage: ServerMessage = JSON.parse(event.data);

      if (serverMessage.type === "score") {
        setScores(serverMessage.scores);
        return;
      }

      // currently handling both revert and change messages the same
      const changes = serverMessage.changes;
      if (alternatesSet.has(changes[0].locationKey)) {
        changes.unshift({
          puzzleId: changes[0].puzzleId,
          locationKey: changes[0].locationKey,
          propertyKey: "class-small-text",
          value: null,
          playerId: changes[0].playerId,
          teamId: changes[0].teamId,
        });
      }
      puzzleRef.current.puzzleEntry!.changeWithoutUndo(changes);
    },
  });

  // Because puzzle.js modifies the dom to turn a <div class="puzzle-entry"/>
  // into the actual html after loading the script, we need to do a few things
  // once the dom is set up.  This block of code does those necessary things.
  useEffect(() => {
    if (!puzzleRef.current) {
      return;
    }
    const observer = new MutationObserver(() => {
      if (!puzzleRef.current) {
        return;
      }
      puzzleRef.current.setAttribute("data-player-id", player);
      if (puzzleRef.current.puzzleEntry) {
        puzzleRef.current.puzzleEntry.prepareToReset();
      }
    });
    observer.observe(puzzleRef.current, { childList: true });
    return () => observer.disconnect();
  }, [player]);

  const onPuzzleChange = useCallback(
    (e: Event) => {
      const changes: Change[] = (e as PuzzleEvent).detail;
      changes.forEach((change) => {
        if (change.propertyKey === "class-small-text") {
          if (change.value === "small-text") {
            alternatesSet.add(change.locationKey);
          } else {
            alternatesSet.delete(change.locationKey);
          }
          return;
        }
        if (alternatesSet.has(change.locationKey)) {
          return;
        }
        const clientMessage: ClientMessage = {
          change,
        };
        socket.send(JSON.stringify(clientMessage));
      });
    },
    [socket, alternatesSet]
  );

  useEffect(() => {
    document.addEventListener("puzzlechanged", onPuzzleChange);
    return () => document.removeEventListener("puzzlechanged", onPuzzleChange);
  }, [onPuzzleChange]);

  return (
    <>
      <div
        ref={puzzleRef}
        className="puzzle-entry"
        data-edges="3x3"
        data-text={givens.join("|")}
        data-mode="sudoku"
      ></div>
      <Script src="/puzzlejs/puzzle.js"></Script>
      {scores && <Scores scores={scores} />}
    </>
  );
}
