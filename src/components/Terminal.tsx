import { useEffect, useRef, useState } from "react";
import { checkSolution, markSolved, isSolved } from "../lib/puzzles";

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

  // Boot sequence
  useEffect(() => {
    if (!visible) return;
    playSound("boot");
    setBooting(true);
    document.body.classList.add("matrix-flicker");
    simulateBootSequence();
  }, [visible]);

  useEffect(() => {
    if (!booting)
      localStorage.setItem("terminal_history", JSON.stringify(lines));
  }, [lines, booting]);

  async function simulateBootSequence() {
    setLines([]);
    const sequence = [
      "Initializing Neural Terminal v6.0...",
      "Loading encrypted command registry...",
      "Decrypting user node...",
      "Mounting puzzle memory core...",
      "Running diagnostics...",
      "█████████████████████████████████████████",
      "System check: ✅ PASSED",
      "User: Rajkishor Murmu",
      "Status: ONLINE",
    ];

    for (const line of sequence) {
      await new Promise((r) => setTimeout(r, 220));
      setLines((prev) => [...prev, line]);
    }

    await new Promise((r) => setTimeout(r, 400));

    setLines((prev) => [
      ...prev,
      "💻 Boot complete.",
      "💾 Neural memory loaded.",
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

  // Handle command submit
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    playSound("enter");
    const command = input.trim();
    addLine(`> ${command}`);
    await handleCommand(command);
    setInput("");
  }

  // Main command handler
  async function handleCommand(command: string) {
    const args = command.split(" ");
    const cmd = args[0].toLowerCase();

    switch (cmd) {
      case "help":
        addLine(
          [
            "Available commands:",
            "  help               → Show available commands",
            "  scan               → Run a system scan",
            "  probe              → Probe deeper after scan",
            "  awakening          → Unlock the final secret",
            "  badge list         → View collected badges",
            "  clear              → Clear terminal logs",
          ].join("\n")
        );
        break;

      case "clear":
        setLines([]);
        break;

      case "badge":
        if (args[1] === "list") {
          const badges = JSON.parse(
            localStorage.getItem("portfolio_badges") || "[]"
          );
          addLine(badges.length ? badges.join(", ") : "No badges yet.");
        } else addLine("Usage: badge list");
        break;

      // 🧠 PUZZLE COMMANDS
      case "scan": {
        if (isSolved("scanPuzzle")) {
          addLine("🔁 System already scanned.");
          return;
        }
        addLine("Running system scan...");
        await new Promise((r) => setTimeout(r, 1000));
        addLine("Signal fragments detected: [A]CCESS_[G]RANTED");
        const scanResult = checkSolution("scanPuzzle", "ACCESS_GRANTED");
        if (scanResult.ok) {
          pulseEffect("granted");
          addLine("✅ Access granted. Fragment decrypted.");
          markSolved("scanPuzzle");
          onSolved?.("scanPuzzle");
          onPuzzleTrigger?.("scanPuzzle");
        } else {
          pulseEffect("denied");
          addLine("❌ Scan failed. Try again.");
        }
        break;
      }

      case "probe": {
        if (!isSolved("scanPuzzle")) {
          addLine("⚠️ Run 'scan' first.");
          return;
        }
        if (isSolved("probePuzzle")) {
          addLine("🧩 Data probe already complete.");
          return;
        }
        addLine("Initiating deep data probe...");
        await new Promise((r) => setTimeout(r, 1200));
        addLine("Found residual echo: ROOT_SIGNAL_FOUND");
        const probeResult = checkSolution("probePuzzle", "ROOT_SIGNAL_FOUND");
        if (probeResult.ok) {
          pulseEffect("granted");
          addLine("✅ Signal reconstruction successful.");
          markSolved("probePuzzle");
          onSolved?.("probePuzzle");
          onPuzzleTrigger?.("probePuzzle");
        } else {
          pulseEffect("denied");
          addLine("❌ Signal corrupted.");
        }
        break;
      }

      case "awakening": {
        if (!isSolved("probePuzzle") || !isSolved("localKeyPuzzle")) {
          addLine("⚠️ System not ready. Complete prior sequences.");
          return;
        }
        if (isSolved("neoEaster")) {
          addLine("🧠 You've already awakened, The One.");
          return;
        }
        addLine("⚡ Initiating awakening protocol...");
        await new Promise((r) => setTimeout(r, 1500));
        addLine("Transcending local space...");
        const awakenResult = checkSolution("neoEaster", "THERE_IS_NO_SPOON");
        if (awakenResult.ok) {
          pulseEffect("granted");
          addLine("🧠 You are The One. Reality bends to your will.");
          markSolved("neoEaster");
          onSolved?.("neoEaster");
          onPuzzleTrigger?.("neoEaster");
        } else {
          pulseEffect("denied");
          addLine("❌ Awakening failed. Try again.");
        }
        break;
      }

      default:
        addLine(`Unknown command: ${cmd}`);
        pulseEffect("denied");
    }

    // ✅ Emit terminal command for PuzzleEngine
    window.dispatchEvent(
      new CustomEvent("terminal-command", {
        detail: { command, timestamp: Date.now() },
      })
    );
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

  // Scroll management
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
      {/* Scrollable Log */}
      <div
        ref={logRef}
        className="flex-1 overflow-y-auto p-3 sm:p-4 text-[0.8rem] sm:text-sm leading-relaxed"
      >
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
