import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ProjectCardProps {
  title: string;
  desc: string;
  demo?: string;
  repo?: string;
  tags?: string[];
  onSelect?: () => void; // ✅ For modal trigger
}

export default function ProjectCard({
  title,
  desc,
  tags = [],
  onSelect,
}: ProjectCardProps) {
  const [message, setMessage] = useState<string | null>(null);

  const showMessage = (type: string) => {
    setMessage(`${type} work is in progress 🚧`);
    setTimeout(() => setMessage(null), 2000);
  };

  return (
    <article
      onClick={onSelect}
      className="
        group relative rounded-xl border border-surface bg-surface-alt/40 
        hover:bg-surface-alt/70 transition-all duration-300
        hover:shadow-[0_0_15px_var(--color-accent)]
        p-4 sm:p-5 md:p-6 cursor-pointer select-none
      "
    >
      {/* Card Glow Overlay */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-[var(--color-accent)] blur-2xl transition-all duration-300 rounded-xl pointer-events-none"></div>

      {/* Title */}
      <h4 className="text-lg sm:text-xl font-semibold text-text tracking-tight mb-1">
        {title}
      </h4>

      {/* Description */}
      <p className="text-text-dim text-sm sm:text-base mt-2 leading-relaxed">
        {desc}
      </p>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {tags.map((t) => (
            <span
              key={t}
              className="
                text-[11px] sm:text-xs px-2 py-1 rounded-md border border-surface
                bg-surface/60 text-text-dim transition-all duration-300
                hover:bg-surface-alt hover:text-accent
              "
            >
              {t}
            </span>
          ))}
        </div>
      )}

      {/* Buttons */}
      <div className="mt-4 flex flex-wrap gap-2 sm:gap-3">
        <button
          onClick={(e) => {
            e.stopPropagation(); // prevent triggering modal
            showMessage("Demo");
          }}
          className="
            text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-md border border-surface text-text
            hover:bg-accent/10 hover:text-accent transition-all duration-300
            flex items-center justify-center gap-1
          "
        >
          🚀 Demo
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            showMessage("Repository");
          }}
          className="
            text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-md border border-surface text-text
            hover:bg-accent/10 hover:text-accent transition-all duration-300
            flex items-center justify-center gap-1
          "
        >
          💻 Repo
        </button>
      </div>

      {/* Toast Message */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.3 }}
            className="
              fixed bottom-6 left-1/2 -translate-x-1/2 
              bg-surface border border-accent text-accent 
              px-5 py-2 rounded-lg shadow-[0_0_15px_var(--color-accent)] 
              text-sm sm:text-base z-[2000]
            "
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
}
