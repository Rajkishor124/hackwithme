// src/components/PuzzleEngine.tsx
import { useEffect, useState, type JSX } from "react";
import {
  getPuzzles,
  isSolved,
  checkSolution,
  getHints,
  getDifficultyColor,
  getDifficultyLabel,
  type Puzzle,
  type Difficulty, // ✅ make sure this is exported from lib/puzzles.ts
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

  useEffect((): void => {
    const all = getPuzzles(true);
    const solvedMap: Record<string, boolean> = {};
    all.forEach((p) => {
      solvedMap[p.id] = isSolved(p.id);
    });
    setSolvedState(solvedMap);
    setPuzzles(all);
  }, []);

  useEffect((): void => {
    writeHintUsage(hintUsage);
    onHintUsageChange?.(hintUsage);
  }, [hintUsage, onHintUsageChange]);

  useEffect((): void => {
    const allSolved = Object.values(solvedState).every(Boolean);
    if (allSolved) setShowHidden(true);
  }, [solvedState]);

  function openPuzzle(p: Puzzle): void {
    setSelected(p);
    setAttempt("");
    setMessage(null);

    setTimeout(() => {
      document
        .querySelector<HTMLInputElement>('input[placeholder^="Type solution"]')
        ?.focus();
    }, 120);
  }

  function trySolve(): void {
    if (!selected) return;
    const res = checkSolution(selected.id, attempt.trim());
    setMessage(res.message);
    if (res.ok) {
      setSolvedState((s) => ({ ...s, [selected.id]: true }));
      setTimeout(() => setShowHidden(true), 800);
    }
  }

  function revealHint(level: number): void {
    if (!selected) return;
    const hints = getHints(selected.id);
    if (level < 1 || level > hints.length) return;
    setHintUsage((prev) => ({
      ...prev,
      [selected.id]: Math.max(prev[selected.id] ?? 0, level),
    }));
  }

  function renderHints(p: Puzzle): JSX.Element {
    const used = hintUsage[p.id] ?? 0;
    const hints = getHints(p.id);
    return (
      <div className="space-y-2 mt-4">
        <div className="text-xs text-text-dim uppercase">Hints</div>
        {hints.map((h, i) => {
          const tier = i + 1;
          const visible = used >= tier;
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
                {visible ? h.text : <em>Locked — reveal</em>}
              </div>
              {!visible && (
                <button
                  onClick={() => revealHint(tier)}
                  className="ml-auto text-xs px-2 py-1 rounded border border-surface hover:bg-surface-alt transition-all hover:scale-[1.03] active:scale-95 focus:outline-none focus:ring-2 focus:ring-accent/30"
                >
                  Reveal
                </button>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  const visiblePuzzles = puzzles.filter((p) => {
    if (!p.hidden) return true;
    if (showHidden) return true;
    const deps = p.dependsOn ?? [];
    return deps.every((d) => solvedState[d]);
  });

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <aside
        className={`rounded-lg p-4 border border-surface bg-surface-alt/40 flex-shrink-0 transition-all ${
          selected ? "hidden md:block md:w-1/3" : "w-full md:w-1/3"
        }`}
      >
        <h4 className="font-semibold mb-3 text-lg flex items-center gap-2">
          Puzzles
          <span className="text-xs text-accent/80">(Hack & Solve)</span>
        </h4>

        <ul className="space-y-2">
          {visiblePuzzles.map((p) => {
            const solved = solvedState[p.id];
            const isActive = selected?.id === p.id;
            // ✅ safely handle missing difficulty field
            const diff: Difficulty =
              (p.difficulty as Difficulty) ?? "easy";
            const diffColor = getDifficultyColor(diff);
            const diffLabel = getDifficultyLabel(diff);

            return (
              <li
                id={`puzzle-list-item-${p.id}`}
                key={p.id}
                onClick={() => openPuzzle(p)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") openPuzzle(p);
                }}
                className={`p-3 rounded cursor-pointer border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-accent/30 ${
                  isActive
                    ? "border-accent/50 bg-surface-alt/70 shadow-[0_0_10px_rgba(0,255,156,0.12)] scale-[1.01]"
                    : "border-surface hover:bg-surface/60 hover:scale-[1.01]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm sm:text-base flex items-center gap-2">
                      {p.title}
                      <span className={`text-xs ${diffColor}`}>{diffLabel}</span>
                    </div>
                    <div className="text-xs text-text-dim">{p.short}</div>
                  </div>
                  <div className="text-xs">
                    {solved ? (
                      <span className="text-green-400">✓</span>
                    ) : (
                      <span className="text-text-dim">○</span>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="mt-6 text-sm">
          <div>
            Solved:{" "}
            <strong className="text-accent">
              {Object.values(solvedState).filter(Boolean).length}
            </strong>{" "}
            / {visiblePuzzles.length}
          </div>
          <div className="text-xs text-text-dim mt-1">
            Progress and hints saved locally.
          </div>
        </div>

        {showHidden && (
          <div className="mt-4 text-xs text-purple-400 animate-pulse">
            ✨ Secret puzzle unlocked!
          </div>
        )}
      </aside>

      {/* MAIN SECTION */}
      <section
        className={`rounded-lg p-4 border border-surface bg-surface-alt/40 flex-1 transition-all duration-300 ${
          !selected ? "min-h-[250px]" : ""
        }`}
      >
        {!selected ? (
          <div className="text-center md:text-left">
            <h4 className="font-semibold text-lg mb-2">
              Choose a puzzle to begin
            </h4>
            <p className="text-text-dim text-sm">
              Each puzzle has hints and difficulty levels. Unlock hidden ones by
              solving others.
            </p>
          </div>
        ) : (
          <div>
            <div className="block md:hidden mb-3">
              <button
                onClick={() => setSelected(null)}
                className="text-xs px-3 py-1 rounded border border-surface hover:bg-surface-alt transition-all focus:outline-none focus:ring-2 focus:ring-accent/30"
              >
                ← Back to list
              </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h4 className="font-semibold text-lg">{selected.title}</h4>
                  <div
                    className={`px-2 py-0.5 text-xs rounded border border-surface ${getDifficultyColor(
                      (selected.difficulty as Difficulty) ?? "easy"
                    )}`}
                  >
                    {getDifficultyLabel(
                      (selected.difficulty as Difficulty) ?? "easy"
                    )}
                  </div>
                  {solvedState[selected.id] && (
                    <div className="ml-auto text-sm text-green-400">Solved ✓</div>
                  )}
                </div>

                <p className="text-sm text-text-dim mt-2 leading-relaxed">
                  {selected.description}
                </p>

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
                      placeholder="Is your brain working..."
                      className="flex-1 bg-transparent border border-surface px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded bg-surface border border-surface hover:bg-surface-alt transition-all focus:outline-none focus:ring-2 focus:ring-accent/30"
                    >
                      Try
                    </button>
                  </form>

                  {message && (
                    <div
                      className={`mt-2 text-sm ${
                        message.includes("Correct") ? "text-green-400" : "text-accent"
                      } animate-pulse`}
                    >
                      {message}
                    </div>
                  )}
                </div>
              </div>

              <aside className="w-full lg:w-52 text-xs text-text-dim border-t lg:border-t-0 lg:border-l border-surface pt-3 lg:pt-0 lg:pl-3">
                <div className="font-semibold mb-2">Meta</div>
                <div>
                  Badge:{" "}
                  <strong className="text-accent">
                    {selected.badge ?? selected.id}
                  </strong>
                </div>
                <div className="mt-3 leading-relaxed">
                  <div className="font-medium mb-1 text-text">Tips:</div>
                  <ul className="list-disc ml-5 space-y-1">
                    <li>Hints unlock sequentially (Tier 1 → 3).</li>
                    <li>Solutions are case-sensitive unless noted.</li>
                    <li>Progress stays in localStorage.</li>
                    {selected.hidden && (
                      <li className="text-purple-400">
                        🔒 Secret puzzle — you found it!
                      </li>
                    )}
                  </ul>
                </div>
              </aside>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
