import { useEffect, useState, useRef, type JSX } from "react";
import Terminal from "./components/Terminal";
import ProjectCard from "./pages/Projects";
import PuzzleEngine from "./components/PuzzleEngine";
import AnimatedHero from "./components/AnimatedHero";

const themes = ["dark", "green", "blue", "red"] as const;

export default function App(): JSX.Element {
  const [showTerminal, setShowTerminal] = useState(false);
  const [badges, setBadges] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem("portfolio_badges");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [currentTheme, setCurrentTheme] = useState<
    "dark" | "green" | "blue" | "red"
  >("dark");

  // Refs for smooth scroll
  const projectsRef = useRef<HTMLDivElement | null>(null);
  const hackerLabRef = useRef<HTMLDivElement | null>(null);

  // 🌈 Theme switch logic
  function switchTheme() {
    const nextIndex = (themes.indexOf(currentTheme) + 1) % themes.length;
    const nextTheme = themes[nextIndex];
    setCurrentTheme(nextTheme);

    document.documentElement.classList.remove(...themes);
    if (nextTheme !== "dark") document.documentElement.classList.add(nextTheme);

    const root = document.documentElement;
    root.classList.add("matrix-flicker");
    setTimeout(() => root.classList.remove("matrix-flicker"), 350);

    console.log(
      `%cTheme switched → ${nextTheme}`,
      "color: var(--color-accent);"
    );
    localStorage.setItem("theme", nextTheme);
  }

  useEffect(() => {
    const saved = localStorage.getItem("theme") as
      | "dark"
      | "green"
      | "blue"
      | "red"
      | null;
    if (saved && themes.includes(saved)) {
      setCurrentTheme(saved);
      document.documentElement.classList.add(saved);
    }
  }, []);

  useEffect(() => {
    console.log("%c💡 Try switching themes via the UI!", "color: lime;");
    console.log("Tip: Open the Hacker Lab and type 'help' for clues!");
  }, []);

  // 🧠 Add badge persistence
  function addBadge(id: string) {
    setBadges((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      localStorage.setItem("portfolio_badges", JSON.stringify(next));
      return next;
    });
  }

  // 🎯 Smooth scroll helpers
  function scrollToProjects() {
    projectsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function openHackerLab() {
    setShowTerminal(false); // reset first to trigger re-mount
    setTimeout(() => {
      setShowTerminal(true);
      hackerLabRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  }

  return (
    <div className="min-h-screen bg-bg text-text font-sans transition-all duration-500 ease-slow">
      {/* HEADER */}
      <header className="max-w-6xl mx-auto p-6 flex items-center justify-between sticky top-0 z-50 bg-bg/80 backdrop-blur-md border-b border-surface">
        <h1 className="text-2xl font-semibold tracking-tight">
          Rajkishor Murmu
        </h1>
        <nav className="flex items-center gap-4">
          {/* THEME BUTTON */}
          <button
            onClick={switchTheme}
            className="relative group px-3 py-1 rounded-md border border-surface text-sm hover:bg-surface-alt flex items-center gap-2 transition-all duration-300"
          >
            <span
              className={`inline-block w-3 h-3 rounded-full transition-all duration-500 ${
                ["green", "blue", "red"].includes(currentTheme)
                  ? "bg-accent shadow-glow-accent"
                  : "bg-slate-600"
              }`}
            ></span>
            {currentTheme.charAt(0).toUpperCase() + currentTheme.slice(1)} Mode
          </button>

          {/* HACKER LAB BUTTON */}
          <button
            onClick={openHackerLab}
            className="px-3 py-1 rounded-md border border-surface text-sm hover:bg-surface-alt transition-all duration-300"
          >
            Hacker Lab
          </button>

          {/* PROJECTS BUTTON */}
          <button
            onClick={scrollToProjects}
            className="px-3 py-1 rounded-md border border-surface text-sm hover:bg-surface-alt transition-all duration-300"
          >
            Projects
          </button>
        </nav>
      </header>

      {/* MAIN BODY */}
      <main className="max-w-6xl mx-auto px-6">
        <AnimatedHero
          onViewProjects={() =>
            projectsRef.current?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            })
          }
          onEnterHackerLab={() => {
            setShowTerminal(false);
            setTimeout(() => {
              setShowTerminal(true);
              hackerLabRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            }, 100);
          }}
        />

        <div className="p-4 mt-8 rounded-md bg-surface text-accent shadow-glow-accent transition-all duration-500">
          Tailwind Token Integration ✅ — Current Theme: {currentTheme}
        </div>

        {/* PROJECTS SECTION */}
        <section id="projects" ref={projectsRef} className="py-12 scroll-mt-24">
          <h3 className="text-xl font-bold mb-4">Highlighted Projects</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ProjectCard
              title="MSME Credit Matcher"
              desc="Spring Boot + React app for matching loans to MSMEs."
            />
            <ProjectCard
              title="Digital Learning Platform"
              desc="Students & Teachers platform with exams & reports."
            />
          </div>
        </section>

        {/* HACKER LAB */}
        <section
          id="hacker-lab"
          ref={hackerLabRef}
          className="py-12 scroll-mt-24"
        >
          <h3 className="text-xl font-bold mb-4">Hacker Lab (Playground)</h3>
          <p className="text-text-dim mb-4">
            The Hacker Lab is a lightweight terminal that accepts a few
            commands. Try it! Or explore puzzles below.
          </p>

          <div className="rounded-lg border border-surface p-4 bg-surface-alt space-y-4">
            <Terminal
              key={showTerminal ? "visible" : "hidden"} // 🔥 forces remount
              visible={showTerminal}
              onSolved={(id) => addBadge(id)}
              onPuzzleTrigger={(pid) => {
                console.log("Triggered puzzle:", pid);
                localStorage.setItem("activePuzzle", pid);
              }}
            />
            <PuzzleEngine />
          </div>
        </section>

        {/* BADGES SECTION */}
        <section className="py-12">
          <h3 className="text-sm text-text-dim uppercase tracking-wide mb-3">
            Badges
          </h3>
          <div className="flex flex-wrap gap-2">
            {badges.length === 0 ? (
              <span className="text-text-dim text-sm">
                No badges yet — solve a puzzle to earn one.
              </span>
            ) : (
              badges.map((b) => (
                <span
                  key={b}
                  className="px-2 py-1 rounded bg-surface-alt border border-surface text-accent text-sm"
                >
                  {badgeLabel(b)}
                </span>
              ))
            )}
          </div>
        </section>

        {/* FOOTER */}
        <footer className="py-12 text-center text-sm text-text-dim">
          <div>Made with ❤️ • Built using React + Tailwind</div>
          <div className="mt-2">
            Tip: open the browser console for secret clues.
          </div>
        </footer>
      </main>
    </div>
  );
}

function badgeLabel(id: string) {
  const map: Record<string, string> = {
    consolePuzzle: "Console Explorer",
    terminalMaster: "Terminal Master",
    localKeyPuzzle: "Local Key Ninja",
    routePuzzle: "Route Finder",
  };
  return map[id] ?? id;
}
