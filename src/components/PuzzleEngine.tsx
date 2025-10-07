// src/components/PuzzleEngine.tsx
import { useEffect, useState } from "react";
import { getPuzzles, isSolved, checkSolution, getHints } from "../lib/puzzles";
import type { Puzzle } from "../lib/puzzles";

type HintUsage = {
  [puzzleId: string]: number; // number of hints used (0..3)
};

function readHintUsage(): HintUsage {
  try {
    const raw = localStorage.getItem("puzzle_hint_usage");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
function writeHintUsage(obj: HintUsage) {
  try {
    localStorage.setItem("puzzle_hint_usage", JSON.stringify(obj));
  } catch { /* empty */ }
}

export default function PuzzleEngine({}: {}) {
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [selected, setSelected] = useState<Puzzle | null>(null);
  const [attempt, setAttempt] = useState("");
  const [hintUsage, setHintUsage] = useState<HintUsage>(() => readHintUsage());
  const [message, setMessage] = useState<string | null>(null);
  const [solvedState, setSolvedState] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setPuzzles(getPuzzles());
    const solvedMap: Record<string, boolean> = {};
    getPuzzles().forEach((p) => {
      solvedMap[p.id] = isSolved(p.id);
    });
    setSolvedState(solvedMap);
  }, []);

  useEffect(() => {
    writeHintUsage(hintUsage);
  }, [hintUsage]);

  function openPuzzle(p: Puzzle) {
    setSelected(p);
    setAttempt("");
    setMessage(null);
  }

  function trySolve() {
    if (!selected) return;
    const res = checkSolution(selected.id, attempt.trim());
    setMessage(res.message);
    if (res.ok) {
      setSolvedState((s) => ({ ...s, [selected.id]: true }));
    }
  }

  function revealHint(level: number) {
    if (!selected) return;
    const hints = getHints(selected.id);
    if (level < 1 || level > hints.length) return;
    setHintUsage((prev) => {
      const next = { ...prev, [selected.id]: Math.max(prev[selected.id] ?? 0, level) };
      return next;
    });
  }

  function renderHints(p: Puzzle) {
    const used = hintUsage[p.id] ?? 0;
    const hints = getHints(p.id);
    return (
      <div className="space-y-2">
        <div className="text-xs text-slate-400">Hints (tiered)</div>
        {hints.map((h, i) => {
          const tier = i + 1;
          const visible = used >= tier;
          return (
            <div key={i} className="flex items-center gap-2">
              <div
                className={`px-2 py-1 rounded text-xs ${
                  visible ? "bg-slate-800/40 text-slate-200" : "bg-slate-900/30 text-slate-500"
                }`}
              >
                Tier {tier}
              </div>
              <div className="text-sm">{visible ? h.text : <em>Locked — reveal</em>}</div>
              {!visible && (
                <button
                  onClick={() => revealHint(tier)}
                  className="ml-auto text-xs px-2 py-1 rounded border border-slate-700/40"
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <aside className="col-span-1 rounded-lg p-3 border border-slate-800/50 bg-[#071014]/40">
        <h4 className="font-semibold mb-2">Puzzles</h4>
        <ul className="space-y-2">
          {puzzles.map((p) => {
            const solved = solvedState[p.id];
            return (
              <li
                key={p.id}
                onClick={() => openPuzzle(p)}
                className={`p-2 rounded cursor-pointer hover:bg-slate-800/40 ${
                  selected?.id === p.id ? "ring-1 ring-cyan-500/30" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{p.title}</div>
                    <div className="text-xs text-slate-400">{p.short}</div>
                  </div>
                  <div className="text-xs">
                    {solved ? <span className="text-green-300">✓</span> : <span className="text-slate-500">○</span>}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="mt-4">
          <h5 className="text-xs text-slate-400">Scoreboard</h5>
          <div className="mt-2 text-sm">
            Solved: <strong>{Object.values(solvedState).filter(Boolean).length}</strong> / {puzzles.length}
          </div>
          <div className="mt-2 text-xs text-slate-500">Hint usage is saved in your browser only.</div>
        </div>
      </aside>

      <section className="col-span-2 rounded-lg p-4 border border-slate-800/60 bg-[#071016]/30">
        {!selected ? (
          <div>
            <h4 className="font-semibold">Pick a puzzle to begin</h4>
            <p className="text-slate-400 mt-2">Each puzzle has up to 3 hints. Use sparingly for bragging rights.</p>
          </div>
        ) : (
          <div>
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h4 className="font-semibold">{selected.title}</h4>
                  <div className="px-2 py-0.5 text-xs rounded bg-slate-800/40 text-slate-300">{selected.type}</div>
                  {solvedState[selected.id] && (
                    <div className="ml-auto text-sm text-green-300">Solved ✓</div>
                  )}
                </div>
                <div className="text-sm text-slate-400 mt-2">{selected.description}</div>

                <div className="mt-4">{renderHints(selected)}</div>

                <div className="mt-4">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      trySolve();
                    }}
                    className="flex gap-2"
                  >
                    <input
                      value={attempt}
                      onChange={(e) => setAttempt(e.target.value)}
                      placeholder="Type solution (e.g., SECRET_257 or KEY=VALUE)"
                      className="flex-1 bg-transparent border border-slate-800/50 px-3 py-2 rounded"
                    />
                    <button className="px-3 py-2 rounded bg-slate-800/60 border">Try</button>
                  </form>

                  {message && <div className="mt-2 text-sm text-slate-300">{message}</div>}
                </div>
              </div>

              <aside className="w-44 text-xs text-slate-400">
                <div className="mb-2">Meta</div>
                <div>Badge: <strong className="text-slate-200">{selected.badge ?? selected.id}</strong></div>
                <div className="mt-3">
                  Tips:
                  <ul className="list-disc ml-5 mt-1">
                    <li>Hints reveal more detail each tier.</li>
                    <li>Solutions are case-sensitive unless marked otherwise.</li>
                    <li>All progress stays in your browser (localStorage).</li>
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
