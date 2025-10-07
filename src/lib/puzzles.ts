// src/lib/puzzles.ts
export type PuzzleId = string;

export type HintTier = {
  text: string;
  cost?: number; // hint cost (for scoring) - optional
};

export type Puzzle = {
  id: PuzzleId;
  title: string;
  short: string;
  type: "code" | "localstorage" | "route" | "console"; // useful hinting
  // canonical solution(s) - all comparisons done case-sensitive by default unless lower=true
  solutions: string[];
  lower?: boolean; // if true, solution check uses lowercase
  hints: HintTier[]; // 1..3 tiers
  // optional: extra UI text shown to player
  description?: string;
  // optional badge label
  badge?: string;
};

// LocalStorage keys used:
// portfolio_badges  -> array of badge ids
// puzzle_solved_<id> -> "1"
// puzzle_hint_count -> { [puzzleId]: number }
// puzzle_attempts_<id> -> number (optional counting)

const puzzles: Puzzle[] = [
  {
    id: "consolePuzzle",
    title: "Console Explorer",
    short: "A base64 clue is printed to the browser console.",
    type: "console",
    solutions: ["SECRET_257"],
    lower: false,
    hints: [
      { text: "Open devtools → Console. Look for an ASCII header." },
      { text: "There is a base64 string printed. Decode it (online or in JS)." },
      { text: "Base64 'U0VDUkVUXzI1Nw==' decodes to the answer." },
    ],
    description: "A friendly clue is printed to the browser console on page load.",
    badge: "Console Explorer",
  },
  {
    id: "localKeyPuzzle",
    title: "Local Key Setter",
    short: "Set a specific localStorage key/value to unlock this.",
    type: "localstorage",
    solutions: ["OPEN_SESAME=true"],
    lower: false,
    hints: [
      { text: "Check for puzzles that use localStorage as state." },
      { text: "Try opening the console and set localStorage key 'OPEN_SESAME' to 'true'." },
      { text: "In console: localStorage.setItem('OPEN_SESAME','true') then refresh or run 'puzzles'." },
    ],
    description:
      "This puzzle tests your ability to interact with the browser storage: set the exact key/value pair.",
    badge: "Local Key Ninja",
  },
  {
    id: "routePuzzle",
    title: "Hidden Route",
    short: "A secret route exists on the site. Find it.",
    type: "route",
    solutions: ["/ghost-door", "/admin-echo"],
    lower: true,
    hints: [
      { text: "Check headings, image alt text, and repo README for unusual slugs." },
      { text: "Look for 'ghost' or 'admin' clues in the page copy or console." },
      { text: "Try visiting /ghost-door or /admin-echo manually in address bar." },
    ],
    description:
      "A hidden route on the site leads to a small Easter page — guess or find the slug to unlock.",
    badge: "Route Finder",
  },
];

export function getPuzzles() {
  return puzzles;
}

export function findPuzzle(id: PuzzleId) {
  return puzzles.find((p) => p.id === id);
}

export function isSolved(id: PuzzleId) {
  try {
    const v = localStorage.getItem(`puzzle_solved_${id}`);
    return v === "1";
  } catch {
    return false;
  }
}

export function markSolved(id: PuzzleId) {
  try {
    localStorage.setItem(`puzzle_solved_${id}`, "1");
    // store badge
    const raw = localStorage.getItem("portfolio_badges");
    const arr = raw ? JSON.parse(raw) : [];
    if (!arr.includes(id)) {
      arr.push(id);
      localStorage.setItem("portfolio_badges", JSON.stringify(arr));
    }
  } catch {
    // ignore
  }
}

export function checkSolution(id: PuzzleId, attempt: string) {
  const p = findPuzzle(id);
  if (!p) return { ok: false, message: "Puzzle not found." };
  const attemptNormalized = p.lower ? attempt.toLowerCase() : attempt;
  for (const sol of p.solutions) {
    const solNormalized = p.lower ? sol.toLowerCase() : sol;
    if (attemptNormalized === solNormalized) {
      markSolved(id);
      return { ok: true, message: "Correct!" };
    }
  }
  // special handling for localstorage puzzle: allow comma separated key=value
  if (p.type === "localstorage") {
    // attempt format could be KEY=VALUE
    const maybe = attempt.split("=").map((s) => s.trim());
    if (maybe.length === 2) {
      const pair = `${maybe[0]}=${maybe[1]}`;
      for (const sol of p.solutions) {
        if (pair === sol) {
          try {
            const k = maybe[0];
            const v = maybe[1];
            localStorage.setItem(k, v);
            markSolved(id);
            return { ok: true, message: "Correct (and stored)!" };
          } catch {
            return { ok: false, message: "Couldn't set localStorage (blocked?)." };
          }
        }
      }
    }
  }
  // else incorrect
  return { ok: false, message: "Incorrect — try again or use a hint." };
}

export function getHints(id: PuzzleId) {
  const p = findPuzzle(id);
  return p?.hints ?? [];
}
