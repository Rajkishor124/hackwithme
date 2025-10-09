import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface AnimatedHeroProps {
  onViewProjects: () => void;
  onEnterHackerLab: () => void;
}

export default function AnimatedHero({
  onViewProjects,
  onEnterHackerLab,
}: AnimatedHeroProps) {
  const [screenWidth, setScreenWidth] = useState(0);

  // Prevent SSR crash from window access
  useEffect(() => {
    setScreenWidth(window.innerWidth);
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <section className="relative overflow-hidden flex flex-col items-center justify-center text-center py-20 sm:py-28 md:py-36 px-4 sm:px-6">
      {/* Background layers */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(0,255,156,0.05),transparent_75%)]" />
      <div className="absolute inset-0 z-0 opacity-10 animate-matrixRain bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-[clamp(2rem,6vw,3.75rem)] font-extrabold tracking-tight text-accent drop-shadow-[0_0_12px_rgba(0,255,156,0.5)]"
        >
          Rajkishor Murmu
        </motion.h1>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="mt-3 text-[clamp(1.1rem,3vw,1.75rem)] text-text-dim font-medium"
        >
          Java Full-Stack Developer
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="mt-6 max-w-2xl text-text-dim leading-relaxed px-2 sm:px-0 text-[clamp(0.9rem,2.5vw,1.05rem)]"
        >
          Building backend systems with{" "}
          <span className="text-cyan-400 font-medium">Spring Boot</span> and
          crafting sleek frontends with{" "}
          <span className="text-green-400 font-medium">React</span>. This
          portfolio is my digital playground — explore, decode, and unlock
          secrets.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-10 flex flex-col sm:flex-row gap-3 sm:gap-5 w-full sm:w-auto items-center justify-center"
        >
          <button
            onClick={onViewProjects}
            className="cursor-pointer w-full sm:w-auto px-6 py-2.5 rounded-md bg-surface-alt border border-surface text-text hover:bg-surface transition-all duration-300 focus-visible:ring-2 focus-visible:ring-accent shadow-[0_0_10px_rgba(0,255,156,0.2)]"
          >
            View Projects
          </button>

          <button
            onClick={onEnterHackerLab}
            className="cursor-pointer w-full sm:w-auto px-6 py-2.5 rounded-md border border-surface text-accent hover:bg-surface-alt transition-all duration-300 focus-visible:ring-2 focus-visible:ring-accent shadow-[0_0_10px_rgba(0,255,156,0.15)]"
          >
            Enter Hacker Lab
          </button>
        </motion.div>
      </div>

      {/* Floating matrix code */}
      <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 14 }).map((_, i) => (
          <motion.span
            key={i}
            className="absolute text-[10px] sm:text-[11px] text-accent font-mono select-none opacity-30"
            initial={{
              y: -100,
              x: Math.random() * (screenWidth || 1200),
              opacity: 0,
            }}
            animate={{
              y: ["-10%", "110%"],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: 5 + Math.random() * 6,
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
  return Array.from({ length: 18 })
    .map(() => chars[Math.floor(Math.random() * chars.length)])
    .join("");
}
