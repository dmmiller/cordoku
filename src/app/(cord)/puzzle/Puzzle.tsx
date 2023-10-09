"use client";

import Script from "next/script";
import usePartySocket from "partysocket/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Location } from "@cord-sdk/types";
import "public/puzzlejs/puzzle.css";
import "./puzzle.css";

import {
  Change,
  ClientChangeMessage,
  ClientMessage,
  ClientRegisterMessage,
  PuzzleEntry,
  PuzzleEvent,
  ServerChangeMessage,
  ServerMessage,
  ServerRegisterMessage,
  ServerRevertMessage,
  ServerScoreMessage,
} from "@/app/(cord)/puzzle/PuzzleTypes";
import { Scores } from "@/app/(cord)/puzzle/Scores";
import { presence } from "@cord-sdk/react";

type PuzzleDivElement = { puzzleEntry: PuzzleEntry } & HTMLDivElement;
type GridLocation = { cell: string; playerId: string } & Location;

export function Puzzle({
  partyKitHost,
  roomId,
  givens,
  location,
  orgId,
  cordUserId,
}: {
  partyKitHost: string;
  roomId: string;
  givens: string[];
  location: Location;
  orgId: string;
  cordUserId: string;
}) {
  const puzzleRef = useRef<PuzzleDivElement>(null);
  const alternatesSet = useMemo(() => {
    return new Set<string>();
  }, []);
  const [scores, setScores] =
    useState<{ cordId: string; playerId: string; score: number }[]>();
  const [playerId, setPlayerId] = useState<string>();
  const [queuedChanges, setQueuedChanges] = useState<Change[]>([]);
  const [runPostScriptWorkload, setRunPostScriptWorkload] = useState(false);
  const gridLocation: Location = useMemo(() => {
    return { ...location, grid: roomId };
  }, [location, roomId]);
  const knownUsersMap = useMemo(() => {
    return new Map<string, string>();
  }, []);

  const socket = usePartySocket({
    host: partyKitHost,
    room: roomId,
    onOpen: (event) => {
      const registerMessage: ClientRegisterMessage = {
        type: "register",
        cordId: cordUserId,
      };
      sendMessage(registerMessage);
    },
    onClose: (_event) => {},
    onError: (_event) => {},
    onMessage: (event) => {
      console.log(event.data);
      const serverMessage: ServerMessage = JSON.parse(event.data);
      switch (serverMessage.type) {
        case "score":
          handleScoreMessage(serverMessage);
          break;
        case "change":
        case "revert":
          // Both change and revert are handled the same way
          handleChangeMessage(serverMessage);
          break;
        case "register":
          handleRegisterMessage(serverMessage);
          break;
      }
    },
  });

  const handleChangeMessage = useCallback(
    (message: ServerChangeMessage | ServerRevertMessage) => {
      if (!puzzleRef.current) {
        return;
      }
      // currently handling both revert and change messages the same
      const changes = message.changes;
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
      if (!puzzleRef.current.puzzleEntry) {
        // Queue the changes for later after any we may have queued
        setQueuedChanges([...queuedChanges, ...changes]);
        return;
      }
      puzzleRef.current.puzzleEntry.changeWithoutUndo(changes);
    },
    [puzzleRef, alternatesSet, queuedChanges]
  );

  const handleRegisterMessage = useCallback(
    (message: ServerRegisterMessage) => {
      setPlayerId(message.playerId);
    },
    [setPlayerId]
  );
  const handleScoreMessage = useCallback(
    (message: ServerScoreMessage) => {
      setScores(message.scores);
    },
    [setScores]
  );

  const sendMessage = useCallback(
    (message: ClientMessage) => {
      socket.send(JSON.stringify(message));
    },
    [socket]
  );

  // Because puzzle.js modifies the dom to turn a <div class="puzzle-entry"/>
  // into the actual html after loading the script, we need to do a few things
  // once the dom is set up.  This block of code does those necessary things.
  useEffect(() => {
    if (!runPostScriptWorkload) {
      return;
    }
    if (!puzzleRef.current) {
      return;
    }
    if (!puzzleRef.current.puzzleEntry) {
      return;
    }
    puzzleRef.current.puzzleEntry.prepareToReset();
    if (queuedChanges.length > 0) {
      puzzleRef.current.puzzleEntry.changeWithoutUndo(queuedChanges);
      setQueuedChanges([]);
    }
    setRunPostScriptWorkload(false);
  }, [queuedChanges, runPostScriptWorkload]);

  useEffect(() => {
    if (!puzzleRef.current || !playerId) {
      return;
    }
    puzzleRef.current.setAttribute("data-player-id", playerId);
  }, [playerId]);

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
        const clientMessage: ClientChangeMessage = {
          type: "change",
          change,
        };
        sendMessage(clientMessage);
      });
    },
    [alternatesSet, sendMessage]
  );

  useEffect(() => {
    document.addEventListener("puzzlechanged", onPuzzleChange);
    return () => document.removeEventListener("puzzlechanged", onPuzzleChange);
  }, [onPuzzleChange]);

  const present = presence.useLocationData(gridLocation, {
    exclude_durable: true,
    partial_match: true,
  });
  if (present) {
    // addMap is a map of userid -> [playerId, cell]
    const addMap = new Map<string, [string, string]>();
    const updateSet = new Set<string>();
    present.forEach((value) => {
      const userId = value.id;
      updateSet.add(userId);
      const locations = value.ephemeral.locations as GridLocation[];
      if (locations.length > 0) {
        addMap.set(userId, [
          locations[locations.length - 1].playerId,
          locations[locations.length - 1].cell,
        ]);
      }
    });
    updateSet.forEach((user) => {
      const cell = knownUsersMap.get(user);
      if (cell) {
        // clear the old cell
        const oldElement = document.getElementById(cell);
        oldElement?.removeAttribute("data-cordoku-cell-present");
        knownUsersMap.delete(user);
      }
    });
    addMap.forEach(([playerId, cell], user) => {
      const newElement = document.getElementById(cell);
      newElement?.setAttribute("data-cordoku-cell-present", playerId);
      knownUsersMap.set(user, cell);
    });
  }

  const onFocus = useCallback(
    (e: React.FocusEvent<HTMLDivElement>) => {
      if (!playerId) {
        return;
      }
      window.CordSDK?.presence.setPresent(
        {
          ...gridLocation,
          cell: e.target.id,
          playerId,
        },
        { organizationID: orgId, exclusive_within: gridLocation }
      );
    },
    [gridLocation, playerId, orgId]
  );

  const onBlur = useCallback(
    (e: React.FocusEvent<HTMLDivElement>) => {
      if (!playerId) {
        return;
      }
      window.CordSDK?.presence.setPresent(
        { ...gridLocation, cell: e.target.id, playerId },
        {
          organizationID: orgId,
          absent: true,
          exclusive_within: gridLocation,
        }
      );
    },
    [gridLocation, playerId, orgId]
  );

  return (
    <>
      <div
        ref={puzzleRef}
        className="puzzle-entry"
        data-edges="3x3"
        data-text={givens.join("|")}
        data-mode="sudoku"
        onFocus={(e) => onFocus(e)}
        onBlur={(e) => onBlur(e)}
      ></div>
      <Script
        src="/puzzlejs/puzzle.js"
        onLoad={() => setRunPostScriptWorkload(true)}
      />
      {scores && <Scores scores={scores} />}
    </>
  );
}
