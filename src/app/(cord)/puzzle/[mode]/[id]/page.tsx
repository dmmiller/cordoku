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
  const location = { id, mode };
  const orgId = buildOrgId(mode, id);
  const givens = selectPuzzle(mode, id).givens;
  const roomId = buildRoomId(mode, id);
  const threadId = buildThreadId(mode, id);
  return (
    <ClientPuzzlePage
      location={location}
      orgId={orgId}
      givens={givens}
      roomId={roomId}
      threadId={threadId}
    />
  );
}
