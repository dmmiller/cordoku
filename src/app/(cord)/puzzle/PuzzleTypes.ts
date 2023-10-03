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
  scores: { cordId: string; playerId: string; score: number }[];
};

export type ServerRegisterMessage = {
  type: "register";
  playerId: string;
};

export type ServerMessage =
  | ServerChangeMessage
  | ServerRegisterMessage
  | ServerRevertMessage
  | ServerScoreMessage;

export type ClientChangeMessage = {
  type: "change";
  change: Change;
};

export type ClientRegisterMessage = {
  type: "register";
  cordId: string;
};

export type ClientMessage = ClientChangeMessage | ClientRegisterMessage;
