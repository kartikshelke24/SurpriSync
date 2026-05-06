import { useEffect, useRef, useState } from "react";
import { Play, Pause } from "lucide-react";
import { Surprise } from "@/lib/surprises";
import { GestureDetector } from "@/lib/gestures";
import { soundManager } from "@/lib/soundManager";

interface Props {
  surprise: Surprise;
  onDone: () => void;
}

/**
 * Enhanced photo gallery with:
 * - Swipe gesture support
 * - Parallax zoom effect
 * - Bloom transitions
 * - Background color tracking
 * - Subtle parallax depth
 */
export const EnhancedStoryStage = ({ surprise, onDone }: Props) => {
  const photos = surprise.photos.length ? surprise.photos : [];
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [parallaxOffset, setParallaxOffset] = useState(0);
  const [bgColor, setBgColor] = useState("from-purple-900 to-pink-900");
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const DURATION = 4500;

  // Gesture detection
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const detector = new GestureDetector(container);

    detector.on("swipe-left", () => {
      soundManager?.playWhoosh();
      if (idx < photos.length - 1) {
        setIdx(idx + 1);
        setProgress(0);
      } else {
        onDone();
      }
    });

    detector.on("swipe-right", () => {
      soundManager?.playWhoosh();
      if (idx > 0) {
        setIdx(idx - 1);
        setProgress(0);
      }
    });

    detector.on("double-tap", () => {
      setPaused((p) => !p);
    });

    return () => detector.destroy();
  }, [idx, photos.length, onDone]);

  // Auto-advance timer
  useEffect(() => {
    if (!photos.length) {
      const t = setTimeout(onDone, 600);
      return () => clearTimeout(t);
    }
    if (paused) return;

    const start = Date.now();
    const tick = setInterval(() => {
      const p = Math.min(1, (Date.now() - start) / DURATION);
      setProgress(p);
      if (p >= 1) {
        clearInterval(tick);
        if (idx < photos.length - 1) {
          setIdx(idx + 1);
          setProgress(0);
        } else {
          onDone();
        }
      }
    }, 60);
    return () => clearInterval(tick);
  }, [idx, paused, photos.length, onDone]);

  // Parallax effect on mouse move
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      setMouseX(x * 20); // Max 20px offset
      setMouseY(y * 20);
      setParallaxOffset(Math.min(1, (e.clientX - rect.left) / rect.width) * 10 - 5);
    };

    containerRef.current?.addEventListener("mousemove", handleMouseMove);
    return () => containerRef.current?.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Extract dominant color from image for background gradient (simplified)
  const colorPalettes: Record<number, string> = {
    0: "from-blue-900 to-purple-900",
    1: "from-pink-900 to-red-900",
    2: "from-green-900 to-emerald-900",
    3: "from-orange-900 to-amber-900",
    4: "from-indigo-900 to-purple-900",
    5: "from-rose-900 to-pink-900",
  };

  useEffect(() => {
    setBgColor(colorPalettes[idx % Object.keys(colorPalettes).length]);
  }, [idx]);

  if (!photos.length) {
    return (
      <div className="grid place-items-center min-h-[60vh] text-center animate-fade-up">
        <div className="text-6xl mb-4">💌</div>
        <p className="font-display text-2xl">Skipping ahead to the words…</p>
      </div>
    );
  }

  const next = () => {
    soundManager?.playWhoosh();
    if (idx < photos.length - 1) {
      setIdx(idx + 1);
      setProgress(0);
    } else onDone();
  };

  const prev = () => {
    soundManager?.playWhoosh();
    if (idx > 0) {
      setIdx(idx - 1);
      setProgress(0);
    }
  };

  const captions = [
    "Remember this?",
    "And this one…",
    "This made me smile.",
    "I keep coming back to this.",
    "You, being you.",
    "Always you.",
  ];

  return (
    <div className="animate-fade-up">
      {/* Background gradient transitions */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${bgColor} opacity-20 transition-all duration-1000 rounded-[2rem]`}
      />

      <div
        ref={containerRef}
        className="relative rounded-[2rem] overflow-hidden aspect-[3/4] sm:aspect-[4/5] glass-dark cursor-grab active:cursor-grabbing"
      >
        {/* Progress bars */}
        <div className="absolute top-3 inset-x-3 z-20 flex gap-1.5">
          {photos.map((_, i) => (
            <div key={i} className="flex-1 h-1 rounded-full bg-white/30 overflow-hidden">
              <div
                className="h-full bg-white transition-[width] duration-100 ease-linear"
                style={{ width: `${i < idx ? 100 : i === idx ? progress * 100 : 0}%` }}
              />
            </div>
          ))}
        </div>

        {/* Photo display with parallax */}
        {photos.map((src, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-700 ${
              i === idx ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            {/* Bloom effect on transition */}
            {i === idx && (
              <div className="absolute inset-0 bg-white opacity-0 pointer-events-none animate-bloom" />
            )}

            {/* Parallax zoomed image */}
            <img
              ref={i === idx ? imageRef : null}
              src={src}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              style={
                i === idx && !paused
                  ? {
                      animation: "kenBurns 5s ease-out both",
                      transform: `translate(${mouseX}px, ${mouseY}px)`,
                      transition: "transform 0.1s ease-out",
                    }
                  : {}
              }
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/30" />

            {/* Caption */}
            {i === idx && (
              <div className="absolute bottom-10 inset-x-0 px-6 text-center animate-fade-up">
                <div className="text-xs uppercase tracking-[0.3em] text-white/80">
                  Memory {i + 1} of {photos.length}
                </div>
                <p className="mt-2 font-display italic text-2xl sm:text-3xl text-white drop-shadow-lg">
                  {captions[i % captions.length]}
                </p>
              </div>
            )}
          </div>
        ))}

        {/* Tap zones */}
        <button
          onClick={prev}
          aria-label="Previous"
          className="absolute left-0 top-0 bottom-0 w-1/3 z-10 hover:bg-white/5 transition-colors"
        />
        <button
          onClick={next}
          aria-label="Next"
          className="absolute right-0 top-0 bottom-0 w-1/3 z-10 hover:bg-white/5 transition-colors"
        />

        {/* Controls */}
        <div className="absolute bottom-3 inset-x-0 z-20 flex items-center justify-center gap-3">
          <button
            onClick={() => setPaused((p) => !p)}
            className="glass-dark rounded-full p-2 text-white hover:bg-white/20 transition-colors"
            title="Double-tap to toggle"
          >
            {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>
          <button
            onClick={onDone}
            className="glass-dark rounded-full px-4 py-2 text-white text-xs font-semibold hover:bg-white/20 transition-colors"
          >
            Skip to message →
          </button>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes kenBurns {
          from { transform: scale(1.05); }
          to { transform: scale(1.18); }
        }
        @keyframes bloom {
          0% { opacity: 0; }
          50% { opacity: 0.3; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};
