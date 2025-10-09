import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

type Project = {
  title: string;
  desc: string;
  demo: string;
  repo: string;
  tags: string[];
  details: string;
};

type Toast = { id: number; message: string };

const projectData: Project[] = [
  {
    title: "MSME Credit Matcher",
    desc: "A full-stack app built using Spring Boot + React to intelligently match MSMEs with suitable loan offers based on business metrics.",
    demo: "#",
    repo: "#",
    tags: ["Spring Boot", "React", "MySQL", "AI Matching"],
    details:
      "This project leverages machine learning and financial heuristics to assess MSME creditworthiness. It includes secure authentication, role-based dashboards, and dynamic loan recommendation logic.",
  },
  {
    title: "Digital Learning Platform",
    desc: "A learning management system connecting students and teachers with classes, tests, and analytics.",
    demo: "#",
    repo: "#",
    tags: ["React", "Spring Boot", "JWT", "MySQL"],
    details:
      "A collaborative platform built with Spring Boot REST APIs and a React frontend. Includes test management, role-based access, and performance tracking features with real-time analytics.",
  },
  {
    title: "Portfolio Hacker Lab",
    desc: "An interactive hacker-style portfolio featuring puzzles, themes, and a terminal interface.",
    demo: "#",
    repo: "#",
    tags: ["Framer Motion", "Tailwind", "TypeScript", "Gamified UI"],
    details:
      "A cyberpunk-themed interactive portfolio built entirely with React and TailwindCSS. Includes a working terminal simulation, puzzle engine, and dynamic color tokens powered by CSS variables.",
  },
];

export default function ProjectsGrid() {
  const [selected, setSelected] = useState<Project | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // ✅ ESC key closes modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // ✅ Add toast (stacked + auto-remove)
  const addToast = (message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2500);
  };

  return (
    <>
      <section
        id="projects-grid"
        className="relative py-12 md:py-16 scroll-mt-24 overflow-visible z-[1]"
      >
        {/* Section Title */}
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl font-bold mb-10 text-center text-accent tracking-tight"
        >
          🚀 Highlighted Projects
        </motion.h3>

        {/* Projects Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 max-w-6xl mx-auto items-stretch"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.15 } },
          }}
        >
          {projectData.map((proj, i) => (
            <motion.div
              key={i}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
              }}
              whileHover={{
                scale: 1.03,
                boxShadow: "0 0 25px var(--color-accent)",
                transition: { duration: 0.2 },
              }}
              className="transition-all relative z-[10] h-full flex"
            >
              {/* Card Wrapper ensures equal height */}
              <div className="flex flex-col justify-between w-full bg-surface-alt/50 border border-surface rounded-xl p-5 hover:bg-surface-alt/80 transition-all duration-300">
                {/* Title */}
                <h4 className="text-lg sm:text-xl font-semibold text-text mb-1">
                  {proj.title}
                </h4>

                {/* Description (clamped to keep uniform height) */}
                <p className="text-text-dim text-sm sm:text-base leading-relaxed line-clamp-3 mb-3">
                  {proj.desc}
                </p>

                {/* Tags */}
                <div className="mt-auto mb-3 flex flex-wrap gap-2">
                  {proj.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[11px] sm:text-xs px-2 py-1 rounded-md border border-surface
                                 bg-surface text-text-dim hover:text-accent transition-all"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                {/* More Info Button */}
                <button
                  onClick={() => setSelected(proj)}
                  className="cursor-pointer mt-auto px-4 py-2 rounded-md border border-surface text-sm
                             text-text hover:bg-accent/10 hover:text-accent transition-all self-start"
                >
                  ℹ️ More Info
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* MODAL */}
        <AnimatePresence>
          {selected && (
            <>
              {/* Background Blur */}
              <motion.div
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[998]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                onClick={() => setSelected(null)}
              />

              {/* Modal */}
              <motion.div
                className="fixed inset-0 flex items-center justify-center z-[999]"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{
                  scale: 1,
                  opacity: 1,
                  transition: { duration: 0.3, ease: 'easeOut' },
                }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={() => setSelected(null)}
              >
                <motion.div
                  onClick={(e) => e.stopPropagation()}
                  className="relative w-[90%] md:w-[600px] max-h-[85vh] overflow-y-auto 
                             bg-surface border border-surface-alt rounded-2xl p-6 text-text 
                             shadow-[0_0_30px_var(--color-accent)] backdrop-blur-md"
                >
                  {/* Header */}
                  <div className="flex justify-between items-start gap-3 mb-4">
                    <h4 className="text-2xl font-bold text-accent">
                      {selected.title}
                    </h4>
                    <button
                      onClick={() => setSelected(null)}
                      className="cursor-pointer text-text-dim hover:text-accent text-xl leading-none px-2 transition-all"
                    >
                      ✖
                    </button>
                  </div>

                  {/* Details */}
                  <p className="text-text-dim mt-2 text-sm md:text-base leading-relaxed">
                    {selected.details}
                  </p>

                  {/* Tags */}
                  {selected.tags?.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {selected.tags.map((t) => (
                        <span
                          key={t}
                          className="text-xs px-2 py-1 rounded bg-surface-alt border border-surface text-text-dim"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Buttons inside modal */}
                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      onClick={() =>
                        addToast("🚧 Demo work in progress — coming soon!")
                      }
                      className="cursor-pointer px-4 py-2 rounded-md border border-surface text-sm hover:bg-accent/10 hover:text-accent transition-all"
                    >
                      🚀 Visit Demo
                    </button>
                    <button
                      onClick={() =>
                        addToast("💻 Repository work in progress — coming soon!")
                      }
                      className="cursor-pointer px-4 py-2 rounded-md border border-surface text-sm hover:bg-accent/10 hover:text-accent transition-all"
                    >
                      💻 View Code
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </section>

      {/* ✅ STACKED TOASTS — Portal + Animated Stack */}
      {createPortal(
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] flex flex-col-reverse items-center gap-3 pointer-events-none">
          <AnimatePresence>
            {toasts.map((t) => (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 30, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 250, damping: 25 }}
                className="bg-surface border border-accent text-accent px-5 py-2 rounded-lg 
                           shadow-[0_0_20px_var(--color-accent)] text-sm sm:text-base w-max backdrop-blur-md
                           pointer-events-auto"
              >
                {t.message}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>,
        document.body
      )}
    </>
  );
}
