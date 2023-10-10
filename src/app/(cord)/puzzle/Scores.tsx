import { user } from "@cord-sdk/react";

function Score({
  cordId,
  playerId,
  score,
}: {
  cordId: string;
  playerId: string;
  score: number;
}) {
  const userData = user.useUserData(cordId);
  const self = user.useViewerData();
  if (!userData || !self) {
    return null;
  }
  return (
    <li>
      <span
        className="name"
        data-coop-text-playerid={playerId}
        style={self.id === userData.id ? { fontWeight: "bold" } : {}}
      >
        {userData.name}
      </span>{" "}
      : {score}
    </li>
  );
}

export function Scores({
  scores,
}: {
  scores: {
    cordId: string;
    playerId: string;
    score: number;
  }[];
}) {
  return (
    <ul>
      {scores
        .sort((a, b) => b.score - a.score)
        .map((value) => {
          return (
            <Score
              key={value.cordId}
              cordId={value.cordId}
              playerId={value.playerId}
              score={value.score}
            ></Score>
          );
        })}
    </ul>
  );
}
