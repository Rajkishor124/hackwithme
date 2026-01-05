import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import ProjectCard, { type Project } from "../components/ProjectCard";

/* ===================== DATA ===================== */

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
    repo: "https://github.com/Rajkishor124/VS1",
    tags: ["React", "Spring Boot", "JWT", "MySQL"],
    details:
      "A collaborative platform built with Spring Boot REST APIs and a React frontend. Includes test management, role-based access, and performance tracking features with real-time analytics.",
  },
  {
    title: "Portfolio Hacker Lab",
    desc: "An interactive hacker-style portfolio featuring puzzles, themes, and a terminal interface.",
    demo: "https://rajkishor.vercel.app/",
    repo: "https://github.com/Rajkishor124/hackwithme",
    tags: ["Framer Motion", "Tailwind", "TypeScript", "Gamified UI"],
    details:
      "A cyberpunk-themed interactive portfolio built entirely with React and TailwindCSS. Includes a working terminal simulation, puzzle engine, and dynamic color tokens powered by CSS variables.",
  },
];

type Toast = { id: number; message: string };

export default function ProjectsGrid() {
  const [selected, setSelected] = useState<Project | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  /* ESC closes modal */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  /* Toast helper */
  const addToast = (message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2500);
  };

  return (
    <>
      <section className="relative py-12 md:py-16 scroll-mt-24 z-[1]">
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl font-bold mb-10 text-center text-accent"
        >
          🔮 Highlighted Projects
        </motion.h3>

        {/* GRID */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 max-w-6xl mx-auto"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.15 } },
          }}
        >
          {projectData.map((project) => (
            <ProjectCard
              key={project.title}
              project={project}
              onSelect={setSelected}
            />
          ))}
        </motion.div>

        {/* MODAL */}
        <AnimatePresence>
          {selected && (
            <>
              <motion.div
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[998]"
                onClick={() => setSelected(null)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />

              <motion.div
                className="fixed inset-0 flex items-center justify-center z-[999]"
                onClick={() => setSelected(null)}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                <motion.div
                  onClick={(e) => e.stopPropagation()}
                  className="w-[90%] md:w-[600px] max-h-[85vh] overflow-y-auto
                             bg-surface border border-surface-alt rounded-2xl p-6
                             shadow-[0_0_30px_var(--color-accent)]"
                >
                  <div className="flex justify-between mb-4">
                    <h4 className="text-2xl font-bold text-accent">
                      {selected.title}
                    </h4>
                    <button onClick={() => setSelected(null)}>✖</button>
                  </div>

                  <p className="text-text-dim">{selected.details}</p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {selected.tags.map((t) => (
                      <span
                        key={t}
                        className="text-xs px-2 py-1 rounded bg-surface-alt border border-surface"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="mt-6 flex gap-3 flex-wrap">
                    {selected.demo !== "#" ? (
                      <a
                        href={selected.demo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 border border-surface rounded-md hover:text-accent"
                      >
                        🚀 Visit Demo
                      </a>
                    ) : (
                      <button
                        onClick={() =>
                          addToast("🚧 Demo work in progress — coming soon!")
                        }
                        className="px-4 py-2 border border-surface rounded-md hover:text-accent"
                      >
                        🚀 Visit Demo
                      </button>
                    )}

                    {selected.repo !== "#" ? (
                      <a
                        href={selected.repo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 border border-surface rounded-md hover:text-accent"
                      >
                        💻 View Code
                      </a>
                    ) : (
                      <button
                        onClick={() =>
                          addToast(
                            "💻 Repository work in progress — coming soon!"
                          )
                        }
                        className="px-4 py-2 border border-surface rounded-md hover:text-accent"
                      >
                        💻 View Code
                      </button>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </section>

      {/* TOASTS */}
      {createPortal(
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex flex-col-reverse gap-3 z-[9999]">
          <AnimatePresence>
            {toasts.map((t) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                className="bg-surface border border-accent text-accent px-5 py-2 rounded-lg shadow"
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
