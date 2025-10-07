import { useEffect, useState } from "react";
import { getPuzzles, isSolved } from "../lib/puzzles";

interface HackerHUDProps {
  hintUsageCount: number;
}

export default function HackerHUD({ hintUsageCount }: HackerHUDProps) {
  const [solved, setSolved] = useState(0);
  const [total, setTotal] = useState(0);
  const [hiddenUnlocked, setHiddenUnlocked] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const puzzles = getPuzzles(true);
    setTotal(puzzles.length);
    const solvedCount = puzzles.filter((p) => isSolved(p.id)).length;
    setSolved(solvedCount);

    const hasHiddenUnlocked = puzzles.some(
      (p) => p.hidden && isSolved(p.id)
    );
    setHiddenUnlocked(hasHiddenUnlocked);
  }, [hintUsageCount]);

  // Update on localStorage changes (cross-tab sync)
  useEffect(() => {
    const handler = () => {
      const puzzles = getPuzzles(true);
      const solvedCount = puzzles.filter((p) => isSolved(p.id)).length;
      setSolved(solvedCount);
      setHiddenUnlocked(puzzles.some((p) => p.hidden && isSolved(p.id)));
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const progressPercent = total ? Math.round((solved / total) * 100) : 0;

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 transition-all duration-500 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      {/* COLLAPSIBLE BUTTON */}
      <button
        onClick={() => setVisible(!visible)}
        className="absolute -top-2 -left-2 bg-surface-alt border border-surface px-2 py-0.5 rounded text-xs text-text-dim hover:text-accent transition-all"
      >
        {visible ? "–" : "+"}
      </button>

      {visible && (
        <div className="backdrop-blur-md bg-surface/60 border border-surface-alt rounded-lg shadow-[0_0_12px_var(--color-accent)] p-4 text-xs md:text-sm font-mono w-56 md:w-64 animate-fadeIn">
          <div className="flex justify-between items-center mb-1">
            <span className="text-accent font-semibold tracking-wide">
              Hacker HUD
            </span>
            <span className="text-text-dim">{progressPercent}%</span>
          </div>

          {/* PROGRESS BAR */}
          <div className="w-full h-2 bg-surface-alt rounded overflow-hidden mb-2">
            <div
              className="h-full bg-accent transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="space-y-1 text-text-dim">
            <div className="flex justify-between">
              <span>🧩 Puzzles Solved</span>
              <span>
                {solved} / {total}
              </span>
            </div>
            <div className="flex justify-between">
              <span>💡 Hints Used</span>
              <span>{hintUsageCount}</span>
            </div>
            <div className="flex justify-between">
              <span>🔒 Hidden</span>
              <span className={hiddenUnlocked ? "text-green-400" : ""}>
                {hiddenUnlocked ? "Unlocked" : "Locked"}
              </span>
            </div>
          </div>

          <div className="mt-2 text-[10px] text-text-dim italic text-right opacity-70">
            Data saved locally 🧠
          </div>
        </div>
      )}
    </div>
  );
}
