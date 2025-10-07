interface ProjectCardProps {
  title: string;
  desc: string;
  demo?: string;
  repo?: string;
  tags?: string[];
}

export default function ProjectCard({ title, desc, demo = "#", repo = "#", tags = [] }: ProjectCardProps) {
  return (
    <article className="rounded-lg p-4 border border-slate-800/60 bg-[#071016]/40">
      <h4 className="font-semibold">{title}</h4>
      <p className="text-slate-400 text-sm mt-2">{desc}</p>

      {tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {tags.map((t) => (
            <span key={t} className="text-xs px-2 py-1 rounded bg-slate-800/40 border border-slate-700/40">
              {t}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <a href={demo} className="text-sm px-3 py-1 rounded border border-slate-800/50">
          Demo
        </a>
        <a href={repo} className="text-sm px-3 py-1 rounded border border-slate-800/50">
          Repo
        </a>
      </div>
    </article>
  );
}
