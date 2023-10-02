import type * as Party from "partykit/server";
import {
  Change,
  ClientMessage,
  ServerChangeMessage,
  ServerRevertMessage,
  ServerScoreMessage,
} from "@/app/(cord)/puzzle/PuzzleTypes";
import { puzzles } from "@/app/(cord)/puzzle/Puzzles";

const puzzle = puzzles["easy"].solution;
const keys: Record<string, string> = {};
puzzle.forEach((row, index) => {
  for (let c = 0; c < row.length; c++) {
    keys[`cell-${index}-${c}`] = row[c];
  }
});

export default class Server implements Party.Server {
  changes: Map<string, Change>;
  scores: Map<string, number>;

  constructor(readonly party: Party.Party) {
    this.changes = new Map();
    this.scores = new Map();
  }

  adjustScore(player: string, delta: number) {
    if (!this.scores.has(player)) {
      this.scores.set(player, 0);
    }
    this.scores.set(player, (this.scores.get(player) as number) + delta);
    // Send an update
    const scoreMessage: ServerScoreMessage = {
      type: "score",
      scores: [],
    };
    this.scores.forEach((value, key) => {
      scoreMessage.scores.push({ playerId: key, score: value });
    });
    this.party.broadcast(JSON.stringify(scoreMessage));
  }

  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    // A websocket just connected!
    console.log(
      `Connected:
  id: ${conn.id}
  room: ${this.party.id}
  url: ${new URL(ctx.request.url).pathname}`
    );

    // let's send a message to the connection
    if (this.changes.size > 0) {
      const changeMessage: ServerChangeMessage = {
        type: "change",
        changes: [...this.changes.values()],
      };
      conn.send(JSON.stringify(changeMessage));
    }
  }

  onMessage(message: string, sender: Party.Connection) {
    // let's log the message
    console.log(`connection ${sender.id} sent message: ${message}`);

    let { change }: ClientMessage = JSON.parse(message);

    const value = change.value;
    const location = change.locationKey;
    if (keys[location] !== value) {
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

    if (this.changes.has(location)) {
      // Already entered so let's set it back to the proper value
      change = this.changes.get(location) as Change;
    } else {
      this.changes.set(location, change);
      // New entry so lets update score
      this.adjustScore(change.playerId, 1);
    }

    const changeMessage: ServerChangeMessage = {
      type: "change",
      changes: [change],
    };

    // as well as broadcast it to all the other connections in the room...
    this.party.broadcast(
      JSON.stringify(changeMessage),
      // `${sender.id}: ${message}`,
      // ...except for the connection it came from
      [sender.id]
    );
  }
}

Server satisfies Party.Worker;
