import { useEffect, useState, useCallback, type JSX } from "react";
import {
  getPuzzles,
  isSolved,
  checkSolution,
  getHints,
  getDifficultyColor,
  getDifficultyLabel,
  type Puzzle,
  type Difficulty,
} from "../lib/puzzles";

type HintUsage = Record<string, number>;

interface PuzzleEngineProps {
  onHintUsageChange?: (usage: Record<string, number>) => void;
}

function readHintUsage(): HintUsage {
  try {
    const raw = localStorage.getItem("puzzle_hint_usage");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeHintUsage(obj: HintUsage): void {
  try {
    localStorage.setItem("puzzle_hint_usage", JSON.stringify(obj));
  } catch {
    /* ignore */
  }
}

export default function PuzzleEngine({
  onHintUsageChange,
}: PuzzleEngineProps): JSX.Element {
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [selected, setSelected] = useState<Puzzle | null>(null);
  const [attempt, setAttempt] = useState<string>("");
  const [hintUsage, setHintUsage] = useState<HintUsage>(() => readHintUsage());
  const [message, setMessage] = useState<string | null>(null);
  const [solvedState, setSolvedState] = useState<Record<string, boolean>>({});
  const [showHidden, setShowHidden] = useState<boolean>(false);

  // 🔓 Dynamic Unlock Modal State
  const [unlockModal, setUnlockModal] = useState<{
    show: boolean;
    tier: number | null;
    mode: "confirm" | "challenge" | "ad" | "terminal";
    countdown?: number;
    challengeCompleted?: boolean;
    commandRequired?: string;
    completed?: boolean;
  }>({
    show: false,
    tier: null,
    mode: "confirm",
  });

  // 🧠 Initial Load
  useEffect(() => {
    const all = getPuzzles(true);
    const solvedMap: Record<string, boolean> = {};
    all.forEach((p) => {
      solvedMap[p.id] = isSolved(p.id);
    });
    setSolvedState(solvedMap);
    setPuzzles(all);
  }, []);

  // 💾 Persist hint usage
  useEffect(() => {
    writeHintUsage(hintUsage);
    onHintUsageChange?.(hintUsage);
  }, [hintUsage, onHintUsageChange]);

  // 🔍 Unlock hidden puzzles when all are solved
  useEffect(() => {
    const allSolved = Object.values(solvedState).every(Boolean);
    if (allSolved) setShowHidden(true);
  }, [solvedState]);

  // 🔓 Confirm Unlock (stable)
  const confirmUnlockHint = useCallback((): void => {
    if (!selected || unlockModal.tier === null) return;

    const tier = unlockModal.tier;
    setHintUsage((prev) => ({
      ...prev,
      [selected.id]: Math.max(prev[selected.id] ?? 0, tier),
    }));
    setUnlockModal({ show: false, tier: null, mode: "confirm" });
  }, [selected, unlockModal.tier]);

  // 🧩 Listen for terminal commands (for terminal unlock mode)
  useEffect(() => {
    const handleTerminalCommand = (e: Event): void => {
      const customEvent = e as CustomEvent<{ command: string }>;
      const command = customEvent.detail?.command?.toLowerCase();

      if (!unlockModal.show || unlockModal.mode !== "terminal") return;

      if (command === unlockModal.commandRequired?.toLowerCase()) {
        setUnlockModal((prev) => ({ ...prev, completed: true }));
        setTimeout(() => confirmUnlockHint(), 600);
      }
    };

    window.addEventListener("terminal-command", handleTerminalCommand);
    return () =>
      window.removeEventListener("terminal-command", handleTerminalCommand);
  }, [unlockModal, confirmUnlockHint]);

  // 🎯 Select Puzzle
  function openPuzzle(p: Puzzle): void {
    setSelected(p);
    setAttempt("");
    setMessage(null);
  }

  // ✅ Try to Solve Puzzle
  function trySolve(): void {
    if (!selected) return;
    const res = checkSolution(selected.id, attempt.trim());
    setMessage(res.message);
    if (res.ok) {
      setSolvedState((s) => ({ ...s, [selected.id]: true }));
      setTimeout(() => setShowHidden(true), 800);
    }
  }

  // ⚙️ Choose Unlock Mode
  function triggerUnlock(tier: number): void {
    if (!selected) return;

    const difficulty = selected.difficulty ?? "easy";
    let mode: "confirm" | "challenge" | "ad" | "terminal" = "confirm";

    if (difficulty === "hard" || difficulty === "secret") {
      mode = "terminal";
    } else {
      const modes: ("confirm" | "ad" | "challenge")[] = [
        "confirm",
        "ad",
        "challenge",
      ];
      mode = modes[Math.floor(Math.random() * modes.length)];
    }

    if (mode === "ad") {
      setUnlockModal({ show: true, tier, mode, countdown: 5 });
      let time = 5;
      const timer = setInterval(() => {
        time--;
        setUnlockModal((prev) => {
          if (!prev.show) {
            clearInterval(timer);
            return prev;
          }

          if (time <= 0) {
            clearInterval(timer);
            confirmUnlockHint();
            return { ...prev, show: false };
          }

          return { ...prev, countdown: time };
        });
      }, 1000);
    } else if (mode === "challenge") {
      setUnlockModal({ show: true, tier, mode, challengeCompleted: false });
    } else if (mode === "terminal") {
      const command = `unlock hint${tier}`;
      setUnlockModal({ show: true, tier, mode, commandRequired: command });
    } else {
      setUnlockModal({ show: true, tier, mode });
    }
  }

  // 🧩 Hint Rendering
  function renderHints(p: Puzzle): JSX.Element {
    const used = hintUsage[p.id] ?? 0;
    const hints = getHints(p.id);

    const lockedMessages = [
      "🔒 Hint encrypted — attempt unlock sequence?",
      "⚡ System lock active — proceed with unlock?",
      "🧠 Hint locked — click Unlock to begin challenge.",
      "👀 Hidden intel — click Unlock to reveal.",
    ];

    return (
      <div className="space-y-2 mt-4">
        <div className="text-xs text-text-dim uppercase">Hints</div>
        {hints.map((h, i) => {
          const tier = i + 1;
          const visible = used >= tier;
          const randomLockMessage =
            lockedMessages[Math.floor(Math.random() * lockedMessages.length)];
          return (
            <div
              key={i}
              className={`flex flex-col sm:flex-row items-start sm:items-center gap-2 p-2 rounded-md border transition-all duration-300 ${
                visible
                  ? "border-accent/40 bg-surface-alt/50 animate-fadeIn"
                  : "border-surface bg-surface/40"
              }`}
            >
              <div
                className={`px-2 py-1 rounded text-xs ${
                  visible
                    ? "bg-accent/20 text-accent"
                    : "bg-surface-alt text-text-dim"
                }`}
              >
                Tier {tier}
              </div>
              <div className="text-sm flex-1">
                {visible ? (
                  h.text
                ) : (
                  <em className="text-text-dim italic">{randomLockMessage}</em>
                )}
              </div>
              {!visible && (
                <button
                  onClick={() => triggerUnlock(tier)}
                  className="cursor-pointer ml-auto text-xs px-2 py-1 rounded border border-surface hover:bg-surface-alt transition-all hover:scale-[1.03] active:scale-95 focus:outline-none focus:ring-2 focus:ring-accent/30"
                >
                  Unlock
                </button>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // 🎨 Visible Puzzles
  const visiblePuzzles = puzzles.filter((p) => {
    if (!p.hidden) return true;
    if (showHidden) return true;
    const deps = p.dependsOn ?? [];
    return deps.every((d) => solvedState[d]);
  });

  return (
    <div className="relative flex flex-col md:flex-row gap-4">
      {/* 🧩 Puzzle List */}
      <aside
        className={`rounded-lg p-4 border border-surface bg-surface-alt/40 transition-all ${
          selected ? "hidden md:block md:w-1/3" : "w-full md:w-1/3"
        }`}
      >
        <h4 className="font-semibold mb-3 text-lg flex items-center gap-2">
          Puzzles <span className="text-xs text-accent/80">(Hack & Solve)</span>
        </h4>

        <ul className="space-y-2">
          {visiblePuzzles.map((p) => {
            const solved = solvedState[p.id];
            const diff: Difficulty = p.difficulty ?? "easy";
            const diffColor = getDifficultyColor(diff);
            const diffLabel = getDifficultyLabel(diff);
            return (
              <li
                key={p.id}
                onClick={() => openPuzzle(p)}
                className={`p-3 rounded cursor-pointer border transition-all ${
                  selected?.id === p.id
                    ? "border-accent/50 bg-surface-alt/70 scale-[1.01]"
                    : "border-surface hover:bg-surface/60 hover:scale-[1.01]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm flex items-center gap-2">
                      {p.title}
                      <span className={`text-xs ${diffColor}`}>{diffLabel}</span>
                    </div>
                    <div className="text-xs text-text-dim">{p.short}</div>
                  </div>
                  <div className="text-xs">{solved ? "✓" : "○"}</div>
                </div>
              </li>
            );
          })}
        </ul>
      </aside>

      {/* 🎯 Puzzle Details */}
      <section className="rounded-lg p-4 border border-surface bg-surface-alt/40 flex-1">
        {!selected ? (
          <div className="text-center md:text-left">
            <h4 className="font-semibold text-lg mb-2">Choose a puzzle</h4>
            <p className="text-text-dim text-sm">
              Each puzzle has hints and difficulty levels. Unlock hidden ones by
              solving others.
            </p>
          </div>
        ) : (
          <>
            <h4 className="font-semibold text-lg">{selected.title}</h4>
            <p className="text-sm text-text-dim mt-2">{selected.description}</p>
            {renderHints(selected)}
            <div className="mt-5">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  trySolve();
                }}
                className="flex flex-col sm:flex-row gap-2"
              >
                <input
                  value={attempt}
                  onChange={(e) => setAttempt(e.target.value)}
                  placeholder="Type solution here..."
                  className="flex-1 bg-transparent border border-surface px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                />
                <button
                  type="submit"
                  className="cursor-pointer px-4 py-2 rounded bg-surface border border-surface hover:bg-surface-alt transition-all focus:outline-none focus:ring-2 focus:ring-accent/30"
                >
                  Try
                </button>
              </form>
              {message && (
                <div
                  className={`mt-2 text-sm ${
                    message.includes("Correct")
                      ? "text-green-400"
                      : "text-accent"
                  } animate-pulse`}
                >
                  {message}
                </div>
              )}
            </div>
          </>
        )}
      </section>

      {/* 🔓 Unlock Modal */}
      {unlockModal.show && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[999] backdrop-blur-sm">
          <div className="relative bg-surface border border-accent/30 rounded-xl shadow-[0_0_25px_var(--color-accent)] p-6 max-w-sm w-[90%] text-center animate-fadeIn">
            {/* ❌ Close Button */}
            <button
              onClick={() =>
                setUnlockModal({ show: false, tier: null, mode: "confirm" })
              }
              className="absolute top-2 right-3 text-text-dim hover:text-accent transition-colors text-xl"
            >
              ×
            </button>

            <h4 className="text-lg font-semibold text-accent mb-3">
              Unlock Hint {unlockModal.tier}
            </h4>

            {unlockModal.mode === "confirm" && (
              <p className="text-sm text-text-dim mb-4">
                Confirm unlock to reveal this hint.
              </p>
            )}

            {unlockModal.mode === "ad" && (
              <p className="text-sm text-text-dim mb-4">
                Watching ad... ⏳ {unlockModal.countdown}s remaining
              </p>
            )}

            {unlockModal.mode === "challenge" && (
              <div className="text-sm text-text-dim mb-4">
                <p className="mb-2">Solve this task: click 🔐 three times!</p>
                <button
                  onClick={() => {
                    if (!unlockModal.challengeCompleted) {
                      setUnlockModal((prev) => ({
                        ...prev,
                        challengeCompleted: true,
                      }));
                      confirmUnlockHint();
                    }
                  }}
                  className="text-lg"
                >
                  🔐
                </button>
              </div>
            )}

            {unlockModal.mode === "terminal" && (
              <p className="text-sm text-text-dim mb-4">
                Type{" "}
                <code className="text-accent font-mono">
                  {unlockModal.commandRequired}
                </code>{" "}
                in the Hacker Lab Terminal to unlock this hint.
                {unlockModal.completed && (
                  <div className="text-green-400 mt-2 animate-pulse">
                    ✅ Command Verified!
                  </div>
                )}
              </p>
            )}

            {unlockModal.mode === "confirm" && (
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => confirmUnlockHint()}
                  className="px-4 py-2 rounded bg-accent/10 border border-accent text-accent text-sm hover:bg-accent/20 transition-all"
                >
                  ✅ Unlock
                </button>
                <button
                  onClick={() =>
                    setUnlockModal({ show: false, tier: null, mode: "confirm" })
                  }
                  className="px-4 py-2 rounded border border-surface text-sm hover:bg-surface-alt transition-all"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
