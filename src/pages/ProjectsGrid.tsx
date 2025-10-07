import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProjectCard from "./Projects";

type Project = {
  title: string;
  desc: string;
  demo: string;
  repo: string;
  tags: string[];
  details: string;
};

const projectData = [
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

  return (
    <section id="projects" className="py-12 md:py-16 scroll-mt-24 relative">
      <motion.h3
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-2xl md:text-3xl font-bold mb-6 text-center md:text-left"
      >
        🚀 Highlighted Projects
      </motion.h3>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto"
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
              scale: 1.02,
              boxShadow: "0 0 20px var(--color-accent)",
              transition: { duration: 0.2 },
            }}
            onClick={() => setSelected(proj)}
            className="cursor-pointer transform transition-all"
          >
            <ProjectCard {...proj} />
          </motion.div>
        ))}
      </motion.div>

      {/* MODAL OVERLAY */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[999]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3 }}
              className="relative w-[90%] md:w-[600px] max-h-[85vh] overflow-y-auto 
                         bg-surface border border-surface-alt rounded-xl p-6 text-text 
                         shadow-[0_0_20px_var(--color-accent)]"
            >
              {/* HEADER */}
              <div className="flex justify-between items-start gap-3">
                <h4 className="text-xl md:text-2xl font-bold text-accent">
                  {selected.title}
                </h4>
                <button
                  onClick={() => setSelected(null)}
                  className="text-text-dim hover:text-accent text-xl leading-none px-2 transition-all"
                >
                  ✖
                </button>
              </div>

              <p className="text-text-dim mt-2 text-sm md:text-base leading-relaxed">
                {selected.details}
              </p>

              {/* TAGS */}
              {selected.tags?.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {selected.tags.map((t: string) => (
                    <span
                      key={t}
                      className="text-xs px-2 py-1 rounded bg-surface-alt border border-surface text-text-dim"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}

              {/* LINKS */}
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href={selected.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-md border border-surface text-sm hover:bg-accent/10 hover:text-accent transition-all"
                >
                  🚀 Visit Demo
                </a>
                <a
                  href={selected.repo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-md border border-surface text-sm hover:bg-accent/10 hover:text-accent transition-all"
                >
                  💻 View Code
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
