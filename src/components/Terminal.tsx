import { useEffect, useRef, useState } from "react";

interface TerminalProps {
  visible: boolean;
  onSolved?: (id: string) => void;
  onPuzzleTrigger?: (puzzleId: string) => void;
}

export default function Terminal({
  visible,
  onSolved,
  onPuzzleTrigger,
}: TerminalProps) {
  const [lines, setLines] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [booting, setBooting] = useState(true);
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [autoScroll, setAutoScroll] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Boot sequence trigger
  useEffect(() => {
    if (!visible) return;
    playSound("boot");
    setBooting(true);
    document.body.classList.add("matrix-flicker");
    simulateBootSequence();
  }, [visible]);

  useEffect(() => {
    if (!booting) localStorage.setItem("terminal_history", JSON.stringify(lines));
  }, [lines, booting]);

  async function simulateBootSequence() {
    setLines([]);
    const sequence = [
      "Initializing Neural Terminal v6.0...",
      "Loading secure kernel modules...",
      "Decrypting user profile...",
      "Mounting virtual drives...",
      "Running diagnostics...",
      "█████████████████████████████████████████",
      "System check: ✅ PASSED",
      "User: Rajkishor Murmu",
      "Status: ONLINE",
    ];

    for (const line of sequence) {
      await new Promise((r) => setTimeout(r, 250));
      setLines((prev) => [...prev, line]);
    }

    await new Promise((r) => setTimeout(r, 500));

    const asciiLogo = [
      "      ___            _      _     _            ",
      "     / _ \\__ _ _ __ (_) ___| |__ (_)_ __ ___   ",
      "    / /_)/ _` | '_ \\| |/ __| '_ \\| | '_ ` _ \\  ",
      "   / ___/ (_| | | | | | (__| | | | | | | | | | ",
      "   \\/    \\__,_|_| |_|_|\\___|_| |_|_|_| |_| |_| ",
      "",
    ];

    for (const line of asciiLogo) {
      await new Promise((r) => setTimeout(r, 40));
      setLines((prev) => [...prev, line]);
    }

    setLines((prev) => [
      ...prev,
      "💻 Boot complete.",
      "💾 Persistent memory loaded.",
      "Type 'help' to begin exploration.",
    ]);

    setBooting(false);
    document.body.classList.remove("matrix-flicker");
    setTimeout(() => inputRef.current?.focus(), 600);
  }

  // 🎧 Sound FX
  function playSound(type: "type" | "enter" | "boot") {
    const file =
      type === "type"
        ? "/sounds/type.wav"
        : type === "enter"
        ? "/sounds/enter.wav"
        : "/sounds/boot.wav";
    const audio = new Audio(file);
    audio.volume = type === "boot" ? 0.6 : 0.3;
    audio.play().catch(() => {});
  }

  // Command input
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    playSound("enter");
    const command = input.trim();
    addLine(`> ${command}`);
    await handleCommand(command);
    setInput("");
  }

  // Commands
  async function handleCommand(command: string) {
    const args = command.split(" ");
    const cmd = args[0].toLowerCase();

    switch (cmd) {
      case "help":
        addLine(
          [
            "Available commands:",
            "  help, ls, cat <file>, unlock <id>",
            "  badge list, sudo, hack, matrix",
            "  clear               Clear terminal",
          ].join("\n")
        );
        onSolved?.("consolePuzzle");
        break;

      case "clear":
        setLines([]);
        break;

      case "ls":
        addLine("readme.txt   secret.txt   hint.md   system.log");
        break;

      case "cat":
        if (args.length < 2) {
          addLine("Usage: cat <filename>");
          return;
        }
        if (args[1] === "readme.txt")
          addLine("Welcome to the Hacker Lab. Explore. Decode. Unlock.");
        else if (args[1] === "secret.txt") {
          addLine(
            "QWdlbnQ6IFJhamtpc2hvciBNdXJtdQpDb2RlOiA0MgpIaW50OiBVc2UgJ3VubG9jayA0MicgdG8gYWN0aXZhdGUgdGhlIHB1enpsZQ=="
          );
          onSolved?.("localKeyPuzzle");
        } else if (args[1] === "hint.md")
          addLine("Puzzles can be triggered via 'unlock <id>'");
        else addLine("cat: file not found");
        break;

      case "unlock":
        if (!args[1]) {
          addLine("Usage: unlock <id>");
          return;
        }
        if (args[1] === "42") {
          addLine("[ACCESS GRANTED] Puzzle 42 activated.");
          onPuzzleTrigger?.("puzzle42");
          onSolved?.("terminalMaster");
          pulseEffect("granted");
        } else {
          addLine("[ACCESS DENIED]");
          pulseEffect("denied");
        }
        break;

      case "badge":
        if (args[1] === "list") {
          const badges = JSON.parse(localStorage.getItem("portfolio_badges") || "[]");
          addLine(badges.length ? badges.join(", ") : "No badges yet.");
        } else addLine("Usage: badge list");
        break;

      case "sudo":
        addLine("[root@raj] Permission denied.");
        pulseEffect("denied");
        break;

      case "hack":
      case "matrix":
        addLine("⚡ SYSTEM GLITCH ⚡");
        document.body.classList.add("matrix-flicker");
        onSolved?.("easterEgg");
        pulseEffect("granted");
        break;

      case "neo":
        addLine("Wake up, Neo... 🧠");
        pulseEffect("granted");
        break;

      default:
        addLine(`Unknown command: ${cmd}`);
        pulseEffect("denied");
    }
  }

  function addLine(text: string) {
    setLines((prev) => [...prev, text]);
  }

  function pulseEffect(type: "granted" | "denied") {
    const el = logRef.current;
    if (!el) return;
    el.classList.add(type === "granted" ? "pulse-green" : "pulse-red");
    setTimeout(() => el.classList.remove("pulse-green", "pulse-red"), 400);
  }

  // 🧩 Scroll management
  useEffect(() => {
    const el = logRef.current;
    if (!el) return;

    const handleScroll = () => {
      const atBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 20;
      setAutoScroll(atBottom);
      setShowScrollButton(!atBottom);
    };

    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const el = logRef.current;
    if (autoScroll && el) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [lines, autoScroll]);

  // Trap scroll inside
  useEffect(() => {
    const el = logRef.current;
    if (!el) return;
    const handleWheel = (e: WheelEvent) => {
      const atTop = el.scrollTop === 0;
      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight;
      if ((e.deltaY < 0 && !atTop) || (e.deltaY > 0 && !atBottom)) {
        e.stopPropagation();
        e.preventDefault();
        el.scrollTop += e.deltaY;
      }
    };
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="relative bg-surface text-text font-mono rounded-md border border-surface-alt shadow-inner crt flex flex-col h-[45vh] sm:h-[60vh]"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Scrollable log */}
      <div ref={logRef} className="flex-1 overflow-y-auto p-3 sm:p-4 text-[0.8rem] sm:text-sm leading-relaxed">
        {booting ? (
          <div className="text-accent text-center mt-16 animate-pulse">
            <div className="text-lg mb-2">[ SYSTEM BOOTING... ]</div>
            <div className="text-sm text-slate-400">Please wait...</div>
          </div>
        ) : (
          lines.map((line, i) => (
            <div key={i} className="whitespace-pre-wrap">
              {line}
            </div>
          ))
        )}
      </div>

      {/* Input Line */}
      {!booting && (
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 p-2 sm:p-3 border-t border-surface-alt bg-surface/50"
        >
          <span className="text-accent">$</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => {
              playSound("type");
              setInput(e.target.value);
            }}
            className="flex-1 bg-transparent border-none outline-none text-text caret-accent text-[0.85rem] sm:text-sm"
            placeholder="Type a command..."
            autoFocus
          />
        </form>
      )}

      {/* Scroll-to-bottom button */}
      {showScrollButton && (
        <button
          onClick={() => {
            const el = logRef.current;
            if (!el) return;
            el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
          }}
          className="scroll-to-bottom absolute right-3 bottom-14 sm:bottom-16 text-[0.75rem] opacity-80 hover:opacity-100"
        >
          ↓
        </button>
      )}
    </div>
  );
}
