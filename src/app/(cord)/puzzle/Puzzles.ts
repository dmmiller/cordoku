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
    {
      solution: [
        "863549271",
        "295371864",
        "714268935",
        "479825316",
        "386417592",
        "152936748",
        "538694127",
        "941782653",
        "627153489",
      ],
      givens: [
        "86...9.71",
        "2.5.71864",
        "..4.6....",
        ".7..2....",
        "..64.75..",
        "....3..4.",
        "....9.1..",
        "94178.6.3",
        "62.1...89",
      ],
    },
    {
      solution: [
        "397562841",
        "258147936",
        "416938572",
        "564379218",
        "972816453",
        "831254769",
        "149625387",
        "783491625",
        "625783194",
      ],
      givens: [
        "397.62..1",
        "2.8.4..3.",
        "..693.57.",
        "...3.....",
        "..2.1.4..",
        ".....4...",
        ".49.253..",
        ".8..9.6.5",
        "6..78.194",
      ],
    },
    {
      solution: [
        "176832594",
        "845691273",
        "392457681",
        "514273968",
        "268914357",
        "739586412",
        "427169835",
        "951328746",
        "683745129",
      ],
      givens: [
        ".768....4",
        ".4...1...",
        "..24...8.",
        ".1..7.9..",
        "26.9.4.57",
        "..9.8..1.",
        ".2...98..",
        "...3...4.",
        "6....512.",
      ],
    },
    {
      solution: [
        "865732491",
        "723149586",
        "914856732",
        "176598243",
        "458263917",
        "392471658",
        "641325879",
        "589617324",
        "237984165",
      ],
      givens: [
        "..5....9.",
        "...14.5.6",
        "..4..6...",
        "176.9..43",
        "4..2.3..7",
        "39..7.658",
        "...3..8..",
        "5.9.17...",
        ".3....1..",
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
    {
      solution: [
        "286794315",
        "145283796",
        "973561824",
        "521876943",
        "368149257",
        "794325681",
        "657912438",
        "839457162",
        "412638579",
      ],
      givens: [
        "..6.9..1.",
        "1....379.",
        "9..561.2.",
        ".....69.3",
        "...1.9...",
        "7.43.....",
        ".5.912..8",
        ".394....2",
        ".1..3.5..",
      ],
    },
    {
      solution: [
        "476523198",
        "135986742",
        "829714653",
        "241679835",
        "568132974",
        "397845261",
        "952468317",
        "613257489",
        "784391526",
      ],
      givens: [
        "4....3...",
        ".3..86.4.",
        "82.71..5.",
        ".4.......",
        ".6813297.",
        ".......6.",
        ".5..68.17",
        ".1.25..8.",
        "...3....6",
      ],
    },
    {
      solution: [
        "645728931",
        "981365724",
        "723194568",
        "378619245",
        "419253687",
        "562487193",
        "297841356",
        "154936872",
        "836572419",
      ],
      givens: [
        "....2.93.",
        "..1.6.7.4",
        "...1....8",
        "378..9...",
        "...253...",
        "...4..193",
        "2....1...",
        "1.4.3.8..",
        ".36.7....",
      ],
    },
    {
      solution: [
        "359246817",
        "461987523",
        "827315946",
        "748529631",
        "196834275",
        "235671498",
        "674152389",
        "513498762",
        "982763154",
      ],
      givens: [
        ".5.2.6...",
        "........3",
        "82.3...4.",
        "7..5...3.",
        "..68342..",
        ".3...1..8",
        ".7...2.89",
        "5........",
        "...7.3.5.",
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
    {
      solution: [
        "318426975",
        "247539186",
        "659871234",
        "735612849",
        "962384517",
        "481957362",
        "526148793",
        "174293658",
        "893765421",
      ],
      givens: [
        "..8....7.",
        ".4..39..6",
        "6..8.....",
        ".3.61....",
        "9.2.8.5.7",
        "....57.6.",
        ".....8..3",
        "1..29..5.",
        ".9....4..",
      ],
    },
    {
      solution: [
        "871243596",
        "326159748",
        "549768321",
        "168327954",
        "257496183",
        "493581267",
        "915874632",
        "634912875",
        "782635419",
      ],
      givens: [
        "8...4...6",
        ".2.1...4.",
        "..97....1",
        "1.....9.4",
        ".5..9..8.",
        "4.3.....7",
        "9....46..",
        ".3...2.7.",
        "7...3...9",
      ],
    },
    {
      solution: [
        "852973416",
        "746215893",
        "193864752",
        "261489537",
        "537126984",
        "489357261",
        "925731648",
        "618542379",
        "374698125",
      ],
      givens: [
        "8....34.6",
        "7..2...9.",
        "1.....7..",
        "...4.9...",
        "53.....84",
        "...3.7...",
        "..5.....8",
        ".1...2..9",
        "3.46....5",
      ],
    },
    {
      solution: [
        "716985324",
        "928734561",
        "543621798",
        "694172835",
        "857346912",
        "231598647",
        "389417256",
        "462859173",
        "175263489",
      ],
      givens: [
        "7.6.8....",
        ".....4.6.",
        "..3..1.9.",
        "....7...5",
        "85.....12",
        "2...9....",
        ".8.4..2..",
        ".6.8.....",
        "....6.4.9",
      ],
    },
  ],
};
