import type * as Party from "partykit/server";
import {
  Change,
  ClientChangeMessage,
  ClientMessage,
  ClientRegisterMessage,
  ScoreEntry,
  ServerChangeMessage,
  ServerGameOverMessage,
  ServerRegisterMessage,
  ServerRevertMessage,
  ServerScoreMessage,
} from "@/app/(cord)/puzzle/PuzzleTypes";
import { selectPuzzle } from "@/app/(cord)/puzzle/Puzzles";
import { getModeIdFromRoomId } from "@/app/(cord)/puzzle/utils";

export default class Server implements Party.Server {
  changes: Map<string, Change>;
  scores: Map<string, number[]>;
  nextPlayerId: number;
  cordIdToPlayerIdMap: Map<string, string>;
  playerIdToCordIdMap: Map<string, string>;
  keys: Record<string, string>;
  solution: string[];
  emptySquareCount: number;

  constructor(readonly party: Party.Party) {
    this.changes = new Map();
    this.scores = new Map();
    this.nextPlayerId = 0;
    this.cordIdToPlayerIdMap = new Map();
    this.playerIdToCordIdMap = new Map();
    this.keys = {};
    this.solution = [];
    this.emptySquareCount = 0;
  }

  buildScores() {
    const scores: ScoreEntry[] = [];
    this.scores.forEach((value, key) => {
      scores.push({
        cordId: this.playerIdToCordIdMap.get(key)!,
        playerId: key,
        score: value[0],
        correct: value[1],
        incorrect: value[2],
      });
    });
    return scores;
  }

  adjustScore(playerId: string, delta: number) {
    if (!this.scores.has(playerId)) {
      this.scores.set(playerId, [0, 0, 0]);
    }
    const currentScores = this.scores.get(playerId)!;
    if (delta === 1) {
      currentScores[1] += 1;
    } else if (delta === -1) {
      currentScores[2] += 1;
    }
    currentScores[0] += delta;
    this.scores.set(playerId, currentScores);
    // Send an update
    const scoreMessage: ServerScoreMessage = {
      type: "score",
      scores: this.buildScores(),
    };
    this.party.broadcast(JSON.stringify(scoreMessage));
  }

  handleRegisterMessage(
    message: ClientRegisterMessage,
    sender: Party.Connection
  ) {
    if (!this.cordIdToPlayerIdMap.has(message.cordId)) {
      const newPlayerId = `player-${this.nextPlayerId}`;
      this.cordIdToPlayerIdMap.set(message.cordId, newPlayerId);
      this.nextPlayerId++;
      this.playerIdToCordIdMap.set(newPlayerId, message.cordId);
    }

    const playerId = this.cordIdToPlayerIdMap.get(message.cordId)!;
    const registerReply: ServerRegisterMessage = {
      type: "register",
      playerId,
    };
    sender.send(JSON.stringify(registerReply));

    // Send the current scores
    // We use adjustScore with a delta of 0 to let everyone know the user joined
    this.adjustScore(playerId, 0);

    // Optionally send any moves that may have occurred thus far
    if (this.changes.size > 0) {
      const changeMessage: ServerChangeMessage = {
        type: "change",
        changes: [...this.changes.values()],
      };
      sender.send(JSON.stringify(changeMessage));
    }
  }

  handleChangeMessage(message: ClientChangeMessage, sender: Party.Connection) {
    let { change } = message;

    const value = change.value;
    const location = change.locationKey;

    if (this.changes.has(location)) {
      // This value has already been entered correctly
      // Just send back the proper Change
      const changeMessage: ServerChangeMessage = {
        type: "change",
        changes: [this.changes.get(location)!],
      };
      sender.send(JSON.stringify(changeMessage));
      return;
    }

    if (!value) {
      // We sometimes get deletes passed through and those need to be ignored for score
      return;
    }

    if (this.keys[location] !== value) {
      change.value = null;
      const revertMessage: ServerRevertMessage = {
        type: "revert",
        changes: [change],
      };
      sender.send(JSON.stringify(revertMessage));
      // penalize the wrong guess
      this.adjustScore(change.playerId, -1);
      return;
    }

    this.changes.set(location, change);
    // New entry so lets update score
    this.adjustScore(change.playerId, 1);

    const changeMessage: ServerChangeMessage = {
      type: "change",
      changes: [change],
    };

    // as well as broadcast it to all the other connections in the room...
    this.party.broadcast(JSON.stringify(changeMessage), [sender.id]);

    // If all changes equals the total number of empty squares we stared with
    // the game is over
    if (this.changes.size === this.emptySquareCount) {
      const gameoverMessage: ServerGameOverMessage = {
        type: "gameover",
        scores: this.buildScores(),
      };
      this.party.broadcast(JSON.stringify(gameoverMessage));
    }
  }

  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    // In onConnect, let's set up the puzzle with solutions
    // Only do this once so if we have the solution don't compute again
    if (this.solution.length > 0) {
      return;
    }

    const data = getModeIdFromRoomId(this.party.id);
    if (data === null) {
      console.error("This is an invalid room");
      conn.close();
      return;
    }

    console.log("Generating puzzle for ", this.party.id);
    const puzzle = selectPuzzle(data.mode, data.id);
    this.solution = puzzle.solution;
    this.solution.forEach((row, index) => {
      for (let c = 0; c < row.length; c++) {
        this.keys[`cell-${index}-${c}`] = row[c];
      }
    });
    let emptySquareCount = 0;
    puzzle.givens.forEach((row) => {
      for (let i = 0; i < 9; i++) {
        if (row[i] === ".") {
          emptySquareCount++;
        }
      }
    });
    this.emptySquareCount = emptySquareCount;
  }

  onMessage(message: string, sender: Party.Connection) {
    const clientMessage: ClientMessage = JSON.parse(message);
    switch (clientMessage.type) {
      case "register":
        this.handleRegisterMessage(clientMessage, sender);
        break;
      case "change":
        this.handleChangeMessage(clientMessage, sender);
        break;
    }
  }
}

Server satisfies Party.Worker;
