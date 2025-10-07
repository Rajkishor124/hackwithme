import { motion } from "framer-motion";

interface AnimatedHeroProps {
  onViewProjects: () => void;
  onEnterHackerLab: () => void;
}

export default function AnimatedHero({
  onViewProjects,
  onEnterHackerLab,
}: AnimatedHeroProps) {
  return (
    <section className="relative overflow-hidden flex flex-col items-center justify-center text-center py-24 md:py-36">
      {/* Background layers (low z-index) */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(0,255,156,0.05),transparent_70%)]" />
      <div className="absolute inset-0 z-0 opacity-10 animate-matrixRain bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />

      {/* Main hero content (above background) */}
      <div className="relative z-10 flex flex-col items-center">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-4xl md:text-6xl font-extrabold glow-green"
        >
          Rajkishor Murmu
        </motion.h1>

        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="mt-4 text-xl md:text-2xl text-slate-400"
        >
          Java Full-Stack Developer
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="mt-6 max-w-2xl text-slate-400 px-6"
        >
          Building backend systems with{" "}
          <span className="text-cyan-400">Spring Boot</span> and crafting sleek
          frontends with <span className="text-green-400">React</span>. This
          portfolio is my digital playground — explore, decode, and unlock
          secrets.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 flex gap-4"
        >
          <button
            onClick={onViewProjects}
            className="px-5 py-2 rounded-md bg-slate-800/60 border border-slate-700 text-slate-200 hover:bg-slate-700/60 transition"
          >
            View Projects
          </button>

          <button
            onClick={onEnterHackerLab}
            className="px-5 py-2 rounded-md border border-slate-700 text-slate-300 hover:bg-slate-800/60 transition"
          >
            Enter Hacker Lab
          </button>
        </motion.div>
      </div>

      {/* Floating matrix code (background, not blocking clicks) */}
      <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.span
            key={i}
            className="absolute text-[10px] text-green-500 font-mono select-none opacity-30"
            initial={{
              y: -100,
              x: Math.random() * window.innerWidth,
              opacity: 0,
            }}
            animate={{
              y: ["-10%", "110%"],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: 6 + Math.random() * 5,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "linear",
            }}
          >
            {randomMatrixString()}
          </motion.span>
        ))}
      </div>
    </section>
  );
}

function randomMatrixString() {
  const chars = "01";
  return Array.from({ length: 20 })
    .map(() => chars[Math.floor(Math.random() * chars.length)])
    .join("");
}
