// src/lib/puzzles.ts
// 🔒 Central puzzle registry for the Hacker Lab

export type PuzzleId = string;

export type HintTier = {
  text: string;
  cost?: number; // optional score penalty
};

export type Difficulty = "easy" | "medium" | "hard" | "secret";

export type Puzzle = {
  id: PuzzleId;
  title: string;
  short: string;
  type: "code" | "localstorage" | "route" | "console";
  difficulty: Difficulty;
  solutions: string[];
  lower?: boolean;
  hints: HintTier[];
  description?: string;
  badge?: string;
  dependsOn?: PuzzleId[]; // optional dependencies
  hidden?: boolean; // optional secret puzzle
};

// 🔐 LocalStorage keys
const LS_KEYS = {
  badges: "portfolio_badges",
  solved: (id: PuzzleId) => `puzzle_solved_${id}`,
  hintUsage: "puzzle_hint_usage",
};

// 🧩 Puzzle registry
const puzzles: Puzzle[] = [
  {
    id: "consolePuzzle",
    title: "Console Explorer",
    short: "A base64 clue is printed to the browser console.",
    type: "console",
    difficulty: "easy",
    solutions: ["SECRET_257"],
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
    difficulty: "medium",
    solutions: ["OPEN_SESAME=true"],
    hints: [
      { text: "Check for puzzles that use localStorage as state." },
      { text: "Try opening the console and set localStorage key 'OPEN_SESAME' to 'true'." },
      { text: "In console: localStorage.setItem('OPEN_SESAME','true') then refresh or run 'puzzles'." },
    ],
    description:
      "This puzzle tests your ability to interact with browser storage — set the exact key/value pair.",
    badge: "Local Key Ninja",
  },
  {
    id: "routePuzzle",
    title: "Hidden Route",
    short: "A secret route exists on the site. Find it.",
    type: "route",
    difficulty: "hard",
    lower: true,
    solutions: ["/ghost-door", "/admin-echo"],
    hints: [
      { text: "Check headings, image alt text, or repo README for unusual slugs." },
      { text: "Look for 'ghost' or 'admin' clues in the page copy or console." },
      { text: "Try visiting /ghost-door or /admin-echo manually in address bar." },
    ],
    description:
      "A hidden route on the site leads to an Easter page — guess or find the slug to unlock.",
    badge: "Route Finder",
  },
  {
    id: "neoEaster",
    title: "Wake Up, Neo",
    short: "Triggered only if you discover the Matrix command in the terminal.",
    type: "code",
    difficulty: "secret",
    solutions: ["thereisnospoon"],
    hidden: true,
    hints: [
      { text: "Try running hidden commands like 'neo' or 'matrix' in the terminal." },
      { text: "A phrase about the Matrix might appear..." },
      { text: "Use the iconic quote — lowercase, no spaces." },
    ],
    description:
      "An Easter egg puzzle unlocked by typing 'neo' in the Hacker Lab terminal.",
    badge: "The One",
    dependsOn: ["consolePuzzle"],
  },
];

//
// ──────────────────────────────────────────────
// 🧠 Core API
// ──────────────────────────────────────────────
//

export function getPuzzles(includeHidden = false): Puzzle[] {
  return includeHidden ? puzzles : puzzles.filter((p) => !p.hidden);
}

export function findPuzzle(id: PuzzleId): Puzzle | undefined {
  return puzzles.find((p) => p.id === id);
}

export function isSolved(id: PuzzleId): boolean {
  try {
    return localStorage.getItem(LS_KEYS.solved(id)) === "1";
  } catch {
    return false;
  }
}

export function markSolved(id: PuzzleId): void {
  try {
    localStorage.setItem(LS_KEYS.solved(id), "1");

    const raw = localStorage.getItem(LS_KEYS.badges);
    const arr = raw ? JSON.parse(raw) : [];
    if (!arr.includes(id)) {
      arr.push(id);
      localStorage.setItem(LS_KEYS.badges, JSON.stringify(arr));
    }
  } catch {
    // ignore storage errors (incognito mode etc.)
  }
}

export function checkSolution(id: PuzzleId, attempt: string) {
  const p = findPuzzle(id);
  if (!p) return { ok: false, message: "Puzzle not found." };

  const attemptNormalized = p.lower ? attempt.toLowerCase() : attempt;
  const match = p.solutions.some((s) =>
    p.lower ? attemptNormalized === s.toLowerCase() : attemptNormalized === s
  );

  if (match) {
    markSolved(id);
    return { ok: true, message: "Correct!" };
  }

  // Special case for localStorage key=value puzzles
  if (p.type === "localstorage" && attempt.includes("=")) {
    const [key, val] = attempt.split("=").map((s) => s.trim());
    const pair = `${key}=${val}`;
    if (p.solutions.includes(pair)) {
      try {
        localStorage.setItem(key, val);
        markSolved(id);
        return { ok: true, message: "Correct (and stored)!" };
      } catch {
        return { ok: false, message: "Couldn't access localStorage." };
      }
    }
  }

  return { ok: false, message: "Incorrect — try again or use a hint." };
}

export function getHints(id: PuzzleId): HintTier[] {
  const p = findPuzzle(id);
  return p?.hints ?? [];
}

//
// ──────────────────────────────────────────────
// 🎯 Utility Helpers (for UI enhancements)
// ──────────────────────────────────────────────
//

export function getDifficultyColor(diff: Difficulty): string {
  switch (diff) {
    case "easy":
      return "text-green-400";
    case "medium":
      return "text-yellow-400";
    case "hard":
      return "text-red-400";
    case "secret":
      return "text-purple-400";
  }
}

export function getDifficultyLabel(diff: Difficulty): string {
  return diff.charAt(0).toUpperCase() + diff.slice(1);
}
