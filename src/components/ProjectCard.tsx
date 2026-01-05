import { motion } from "framer-motion";

export type Project = {
  title: string;
  desc: string;
  demo: string;
  repo: string;
  tags: string[];
  details: string;
};

type Props = {
  project: Project;
  onSelect: (project: Project) => void;
};

export default function ProjectCard({ project, onSelect }: Props) {
  return (
    <motion.div
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
      <div className="flex flex-col justify-between w-full bg-surface-alt/50 border border-surface rounded-xl p-5 hover:bg-surface-alt/80 transition-all duration-300">
        {/* Title */}
        <h4 className="text-lg sm:text-xl font-semibold text-text mb-1">
          {project.title}
        </h4>

        {/* Description */}
        <p className="text-text-dim text-sm sm:text-base leading-relaxed line-clamp-3 mb-3">
          {project.desc}
        </p>

        {/* Tags */}
        <div className="mt-auto mb-3 flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="text-[11px] sm:text-xs px-2 py-1 rounded-md border border-surface
                         bg-surface text-text-dim hover:text-accent transition-all"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Button */}
        <button
          onClick={() => onSelect(project)}
          className="cursor-pointer mt-auto px-4 py-2 rounded-md border border-surface text-sm
                     text-text hover:bg-accent/10 hover:text-accent transition-all self-start"
        >
          ℹ️ More Info
        </button>
      </div>
    </motion.div>
  );
}
