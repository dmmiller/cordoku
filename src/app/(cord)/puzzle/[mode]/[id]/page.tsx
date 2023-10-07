import { Mode, selectPuzzle } from "@/app/(cord)/puzzle/Puzzles";
import {
  buildOrgId,
  buildRoomId,
  buildThreadId,
} from "@/app/(cord)/puzzle/utils";
import ClientPuzzlePage from "@/app/(cord)/puzzle/[mode]/[id]/clientPage";

export default function PuzzlePage({
  params: { id, mode },
}: {
  params: { id: string; mode: Mode };
}) {
  const { PARTYKIT_HOST } = process.env;
  if (!PARTYKIT_HOST) {
    throw new Error("Forgot to set PARTYKIT_HOST");
  }
  const roomId = buildRoomId(mode, id);
  const givens = selectPuzzle(mode, id).givens;
  const location = { id, mode };
  const orgId = buildOrgId(mode, id);
  const threadId = buildThreadId(mode, id);
  return (
    <ClientPuzzlePage
      partyKitHost={PARTYKIT_HOST}
      roomId={roomId}
      givens={givens}
      location={location}
      orgId={orgId}
      threadId={threadId}
    />
  );
}
