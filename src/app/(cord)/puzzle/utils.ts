import { Mode } from "@/app/(cord)/puzzle/Puzzles";

export function buildOrgId(mode: Mode, id: string) {
  return `cordoku-${id}-${mode}`;
}

export function buildThreadId(mode: Mode, id: string) {
  return `cordoku-${id}-${mode}`;
}

export function buildRoomId(mode: Mode, id: string) {
  return `cordoku-${mode}-${id}`;
}

export function getModeIdFromRoomId(id: string) {
  const parts = id.split("-");
  if (parts.length < 3) {
    return null;
  }
  return { mode: parts[1] as Mode, id: parts.slice(2).join("-") };
}
