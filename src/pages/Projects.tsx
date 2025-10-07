interface ProjectCardProps {
  title: string;
  desc: string;
  demo?: string;
  repo?: string;
  tags?: string[];
}

export default function ProjectCard({
  title,
  desc,
  demo = "#",
  repo = "#",
  tags = [],
}: ProjectCardProps) {
  return (
    <article
      className="
        group relative rounded-xl border border-surface bg-surface-alt/40 
        hover:bg-surface-alt/70 transition-all duration-300
        hover:shadow-[0_0_15px_var(--color-accent)]
        p-4 sm:p-5 md:p-6
        cursor-default
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

      {/* Links */}
      <div
        className="
          mt-4 flex flex-wrap gap-2 sm:gap-3
        "
      >
        <a
          href={demo}
          target="_blank"
          rel="noopener noreferrer"
          className="
            text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-md border border-surface text-text
            hover:bg-accent/10 hover:text-accent transition-all duration-300
            flex items-center justify-center gap-1
          "
        >
          🚀 Demo
        </a>
        <a
          href={repo}
          target="_blank"
          rel="noopener noreferrer"
          className="
            text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-md border border-surface text-text
            hover:bg-accent/10 hover:text-accent transition-all duration-300
            flex items-center justify-center gap-1
          "
        >
          💻 Repo
        </a>
      </div>
    </article>
  );
}
