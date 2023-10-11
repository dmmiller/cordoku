export type Change = {
  puzzleId: string;
  locationKey: string;
  propertyKey: string;
  value: string | null;
  teamId: string;
  playerId: string;
};

export type PuzzleEntry = {
  changeWithoutUndo: (changes: Change[]) => void;
  prepareToReset: () => void;
};

export interface PuzzleEvent extends Event {
  detail: Change[];
}

export type ScoreEntry = {
  cordId: string;
  playerId: string;
  score: number;
};

export type ServerChangeMessage = {
  type: "change";
  changes: Change[];
};

export type ServerRevertMessage = {
  type: "revert";
  changes: Change[];
};

export type ServerScoreMessage = {
  type: "score";
  scores: ScoreEntry[];
};

export type ServerRegisterMessage = {
  type: "register";
  playerId: string;
};

export type ServerGameOverMessage = {
  type: "gameover";
  scores: ScoreEntry[];
};

export type ServerMessage =
  | ServerChangeMessage
  | ServerRegisterMessage
  | ServerRevertMessage
  | ServerScoreMessage
  | ServerGameOverMessage;

export type ClientChangeMessage = {
  type: "change";
  change: Change;
};

export type ClientRegisterMessage = {
  type: "register";
  cordId: string;
};

export type ClientMessage = ClientChangeMessage | ClientRegisterMessage;
