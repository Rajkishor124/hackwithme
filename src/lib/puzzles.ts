// src/lib/puzzles.ts
// 🧠 Central puzzle registry for the Hacker Lab (terminal-first edition)

export type PuzzleId = string;

export type HintTier = {
  text: string;
  cost?: number; // optional future unlock cost
  locked?: boolean; // locked until user performs action
};

export type Difficulty = "easy" | "medium" | "hard" | "secret";

export type Puzzle = {
  id: PuzzleId;
  title: string;
  short: string;
  type: "terminal" | "localstorage" | "route";
  difficulty: Difficulty;
  solutions: string[];
  lower?: boolean;
  hints: HintTier[];
  description?: string;
  badge?: string;
  dependsOn?: PuzzleId[];
  hidden?: boolean;
};

// 🔐 LocalStorage keys
const LS_KEYS = {
  badges: "portfolio_badges",
  solved: (id: PuzzleId) => `puzzle_solved_${id}`,
  hintUsage: "puzzle_hint_usage",
};

// 🧩 Puzzle registry (terminal-driven)
const puzzles: Puzzle[] = [
  {
    id: "scanPuzzle",
    title: "System Scan",
    short: "The 'scan' command reveals encrypted fragments.",
    type: "terminal",
    difficulty: "easy",
    solutions: ["ACCESS_GRANTED"],
    hints: [
      { text: "Hint locked 🔒 — perform a task to unlock.", locked: true },
      { text: "Hint locked 🔒 — perform a task to unlock.", locked: true },
    ],
    description:
      "Type 'scan' in the terminal to begin a system integrity scan. Hidden fragments will appear — assemble them carefully.",
    badge: "System Scanner",
  },
  {
    id: "probePuzzle",
    title: "Data Probe",
    short: "After completing the scan, try probing deeper into the system.",
    type: "terminal",
    difficulty: "medium",
    solutions: ["ROOT_SIGNAL_FOUND"],
    dependsOn: ["scanPuzzle"],
    hints: [
      { text: "Hint locked 🔒 — perform a task to unlock.", locked: true },
      { text: "Hint locked 🔒 — perform a task to unlock.", locked: true },
    ],
    description:
      "Once the scan is complete, typing 'probe' reveals corrupted signal data. You must reconstruct the original code word.",
    badge: "Data Analyst",
  },
  {
    id: "localKeyPuzzle",
    title: "Local Key Cipher",
    short: "There’s a key hidden within your device memory.",
    type: "localstorage",
    difficulty: "hard",
    solutions: ["DECRYPTED_KEY=TRUE"],
    hints: [
      { text: "Hint locked 🔒 — perform a task to unlock.", locked: true },
      { text: "Hint locked 🔒 — perform a task to unlock.", locked: true },
    ],
    description:
      "You must create a key in localStorage named 'DECRYPTED_KEY' with value 'TRUE' to pass. Only those who decoded the previous signals will know how.",
    badge: "Memory Hacker",
  },
  {
    id: "neoEaster",
    title: "The Awakening",
    short: "Something special happens when you connect the final dots.",
    type: "terminal",
    difficulty: "secret",
    solutions: ["THERE_IS_NO_SPOON"],
    dependsOn: ["probePuzzle", "localKeyPuzzle"],
    hidden: true,
    hints: [
      { text: "Hint locked 🔒 — perform a task to unlock.", locked: true },
      { text: "Hint locked 🔒 — perform a task to unlock.", locked: true },
    ],
    description:
      "When all systems align, type 'awakening' or something equally prophetic. You’ll know when you’re ready.",
    badge: "The One",
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
    return { ok: true, message: "✅ Access Granted" };
  }

  // Special case for localStorage key=value puzzles
  if (p.type === "localstorage" && attempt.includes("=")) {
    const [key, val] = attempt.split("=").map((s) => s.trim());
    const pair = `${key}=${val}`;
    if (p.solutions.includes(pair)) {
      try {
        localStorage.setItem(key, val);
        markSolved(id);
        return { ok: true, message: "🗝️ Correct — key stored in memory!" };
      } catch {
        return { ok: false, message: "⚠️ Couldn't access localStorage." };
      }
    }
  }

  return { ok: false, message: "❌ Access Denied — try another command." };
}

export function getHints(id: PuzzleId): HintTier[] {
  const p = findPuzzle(id);
  return p?.hints ?? [];
}

//
// ──────────────────────────────────────────────
// 🎯 UI Helpers
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
