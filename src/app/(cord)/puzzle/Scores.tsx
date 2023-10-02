import { user } from "@cord-sdk/react";

function Score({ playerId, score }: { playerId: string; score: number }) {
  const userData = user.useUserData(playerId);
  if (!userData) {
    return null;
  }
  return (
    <li>
      <span className="name" data-coop-text-playerid={playerId}>
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
    playerId: string;
    score: number;
  }[];
}) {
  return (
    <ul>
      {scores
        .sort((a, b) =>
          a.playerId < b.playerId ? -1 : a.playerId > b.playerId ? 1 : 0
        )
        .map((value) => {
          return (
            <Score
              key={value.playerId}
              playerId={value.playerId}
              score={value.score}
            ></Score>
          );
        })}
    </ul>
  );
}
