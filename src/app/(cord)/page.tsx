"use client";

import { useState } from "react";
import ClientThread from "./ClientThread";
import Link from "next/link";
import { user } from "@cord-sdk/react";

export default function HomeWithThread() {
  const [game, setGame] = useState("");
  const modes = ["easy", "medium", "hard"];
  return (
    <div>
      <h1>Welcome to Cordoku</h1>
      <div>
        <label>
          Enter game number:{" "}
          <input value={game} onChange={(e) => setGame(e.target.value)}></input>
        </label>
      </div>
      <ul>
        {modes.map((mode) => (
          <li key={mode} hidden={!game.length}>
            <Link href={`/puzzle/${mode}/${game}`}>{mode.toUpperCase()}</Link>
          </li>
        ))}
      </ul>{" "}
    </div>
  );
  // return <ClientThread />;
}
