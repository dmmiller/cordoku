import { createHash } from "crypto";

function getNumberModulus(hex: string, mod: number) {
  return parseInt(hex, 16) % mod;
}

export type Mode = "easy" | "medium" | "hard";

type PuzzleRepresentation = {
  solution: string[];
  givens: string[];
};

const swapPatterns = [
  [0, 1, 2],
  [0, 2, 1],
  [1, 0, 2],
  [1, 2, 0],
  [2, 0, 1],
  [2, 1, 0],
];

function swapRowBlocks(
  puzzle: PuzzleRepresentation,
  rowBlockIndex: number,
  pattern: number[]
) {
  const rowBase = rowBlockIndex * 3;
  const originalGivenRows = [];
  const orginialSolutionRows = [];
  for (let i = 0; i < 3; i++) {
    originalGivenRows.push(puzzle.givens[rowBase + i]);
    orginialSolutionRows.push(puzzle.solution[rowBase + i]);
  }
  for (let i = 0; i < 3; i++) {
    puzzle.givens[rowBase + i] = originalGivenRows[pattern[i]];
    puzzle.solution[rowBase + i] = orginialSolutionRows[pattern[i]];
  }
}

function swapColumnBlocks(
  puzzle: PuzzleRepresentation,
  columnBlockIndex: number,
  pattern: number[]
) {
  const columnBase = columnBlockIndex * 3;
  for (let i = 0; i < 9; i++) {
    const originalGivenRow = puzzle.givens[i];
    const originalSolutionRow = puzzle.solution[i];
    const originalGivens = [];
    const originalSolutions = [];
    for (let j = 0; j < 3; j++) {
      originalGivens.push(originalGivenRow[columnBase + j]);
      originalSolutions.push(originalSolutionRow[columnBase + j]);
    }
    const tempGivens = [];
    const tempSolutions = [];
    for (let j = 0; j < 3; j++) {
      tempGivens[pattern[j]] = originalGivens[j];
      tempSolutions[pattern[j]] = originalSolutions[j];
    }
    puzzle.givens[i] =
      originalGivenRow.substring(0, columnBase) +
      tempGivens.join("") +
      originalGivenRow.substring(columnBase + 3);
    puzzle.solution[i] =
      originalSolutionRow.substring(0, columnBase) +
      tempSolutions.join("") +
      originalSolutionRow.substring(columnBase + 3);
  }
}

// We are going to select a puzzle based on parameters
// We use the parameters to create a hash which we will use on the existing
// base puzzles to select one and then apply a series of transforms to it
// This allows us to have a small set of puzzles but still generate unique
// sudoku boards for people
// Hex characters of hash -> Transformation
// 0, 1 -> Select board
// 2, 3, 4 -> Swap columns within columns [147], [258], [369]
// 5, 6, 7 -> Swap rows within rows [123], [456], [789]
// ?? 8 -> Rotate board
// ?? 9, 10 -> Cipher
// ?? Something else
export function selectPuzzle(mode: Mode, id: string) {
  console.log("called with ", mode, id);
  const hash = createHash("sha256");
  hash.update(`${mode}-${id}`);
  const key = hash.digest("hex");
  const puzzleList = puzzles[mode];
  const puzzleIndex = getNumberModulus(key.substring(0, 2), puzzleList.length);

  // Build a copy of our base puzzle that we will mutate
  const basePuzzle = JSON.parse(
    JSON.stringify(puzzles[mode][puzzleIndex])
  ) as PuzzleRepresentation;
  // Swap Columns
  for (let i = 0; i < 3; i++) {
    const swapIndex = getNumberModulus(
      key.substring(2 + i, 3 + i),
      swapPatterns.length
    );
    swapColumnBlocks(basePuzzle, i, swapPatterns[swapIndex]);
  }
  // Swap Rows
  for (let i = 0; i < 3; i++) {
    const swapIndex = getNumberModulus(
      key.substring(5 + i, 6 + i),
      swapPatterns.length
    );
    swapRowBlocks(basePuzzle, i, swapPatterns[swapIndex]);
  }

  // Todo : Should we do more mutations?

  return basePuzzle;
}

const puzzles: {
  easy: PuzzleRepresentation[];
  medium: PuzzleRepresentation[];
  hard: PuzzleRepresentation[];
} = {
  easy: [
    {
      solution: [
        "398216574",
        "241579638",
        "657348192",
        "814952367",
        "562137849",
        "739864251",
        "186795423",
        "473621985",
        "925483716",
      ],
      givens: [
        "3.82....4",
        ".4.57....",
        "6.7.4..92",
        ".....2.67",
        "..21.78..",
        "73.8.....",
        "18..9.4.3",
        "....21.8.",
        "9....37.6",
      ],
    },
  ],
  medium: [
    {
      solution: [
        "679143528",
        "813725946",
        "425689173",
        "297568314",
        "386491752",
        "541237689",
        "732954861",
        "168372495",
        "954816237",
      ],
      givens: [
        "..9....2.",
        "8..72.9.6",
        "....8917.",
        "2.7......",
        "..64917..",
        "......6.9",
        ".3295....",
        "1.8.72..5",
        ".5....2..",
      ],
    },
  ],
  hard: [
    {
      solution: [
        "641729538",
        "932584761",
        "875613429",
        "567932814",
        "389471652",
        "214865397",
        "126347985",
        "493258176",
        "758196243",
      ],
      givens: [
        "..1..9.3.",
        ".3.5.4..1",
        "......4.9",
        ".679.....",
        ".8.....5.",
        ".....539.",
        "1.6......",
        "4..2.8.7.",
        ".5.1..2..",
      ],
    },
  ],
};
