import type * as Party from "partykit/server";
import {
  Change,
  ClientChangeMessage,
  ClientMessage,
  ClientRegisterMessage,
  ServerChangeMessage,
  ServerRegisterMessage,
  ServerRevertMessage,
  ServerScoreMessage,
} from "@/app/(cord)/puzzle/PuzzleTypes";
import { puzzles } from "@/app/(cord)/puzzle/Puzzles";
import { send } from "process";

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
  nextPlayerId: number;
  cordIdToPlayerIdMap: Map<string, string>;
  playerIdToCordIdMap: Map<string, string>;

  constructor(readonly party: Party.Party) {
    this.changes = new Map();
    this.scores = new Map();
    this.nextPlayerId = 0;
    this.cordIdToPlayerIdMap = new Map();
    this.playerIdToCordIdMap = new Map();
  }

  adjustScore(playerId: string, delta: number) {
    if (!this.scores.has(playerId)) {
      this.scores.set(playerId, 0);
    }
    this.scores.set(playerId, (this.scores.get(playerId) as number) + delta);
    // Send an update
    const scoreMessage: ServerScoreMessage = {
      type: "score",
      scores: [],
    };
    this.scores.forEach((value, key) => {
      scoreMessage.scores.push({
        cordId: this.playerIdToCordIdMap.get(key)!,
        playerId: key,
        score: value,
      });
    });
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

    this.changes.set(location, change);
    // New entry so lets update score
    this.adjustScore(change.playerId, 1);

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

  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    // A websocket just connected!
    //   console.log(
    //     `Connected:
    // id: ${conn.id}
    // room: ${this.party.id}
    // url: ${new URL(ctx.request.url).pathname}`
    //   );
  }

  onMessage(message: string, sender: Party.Connection) {
    // let's log the message
    // console.log(`connection ${sender.id} sent message: ${message}`);

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
