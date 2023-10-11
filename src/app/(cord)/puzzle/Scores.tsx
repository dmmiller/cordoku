import { ScoreEntry } from "@/app/(cord)/puzzle/PuzzleTypes";
import { user } from "@cord-sdk/react";

function Score({
  cordId,
  playerId,
  score,
  accuracy,
}: {
  cordId: string;
  playerId: string;
  score: number;
  accuracy: number;
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
      : {score} ({accuracy.toFixed(0)}% correct)
    </li>
  );
}

export function Scores({ scores }: { scores: ScoreEntry[] }) {
  return (
    <ul>
      {scores
        .sort((a, b) =>
          b.score === a.score
            ? b.correct + b.incorrect > 0 && a.correct + a.correct > 0
              ? (b.correct / (b.correct + b.incorrect)) * 100 -
                (a.correct / (a.correct + a.incorrect)) * 100
              : 0
            : b.score - a.score
        )
        .map((value) => {
          return (
            <Score
              key={value.cordId}
              cordId={value.cordId}
              playerId={value.playerId}
              score={value.score}
              accuracy={
                value.correct + value.incorrect > 0
                  ? (value.correct / (value.correct + value.incorrect)) * 100
                  : 100
              }
            />
          );
        })}
    </ul>
  );
}
