import { useEffect, useState } from "react";

interface Props {
  count?: number;
  className?: string;
}

// Decorative drifting sparkles
export const Sparkles = ({ count = 14, className = "" }: Props) => {
  const [items] = useState(() =>
    Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: 2 + Math.random() * 5,
      delay: Math.random() * 4,
      duration: 3 + Math.random() * 4,
    }))
  );

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      {items.map((s) => (
        <span
          key={s.id}
          className="absolute rounded-full bg-white animate-sparkle"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
            boxShadow: "0 0 8px hsl(var(--primary-glow))",
          }}
        />
      ))}
    </div>
  );
};

// Burst of confetti hearts/stars after the reveal
export const Confetti = ({ active, occasion = "justbecause" }: { active: boolean; occasion?: string }) => {
  const [pieces] = useState(() =>
    Array.from({ length: 60 }).map((_, i) => {
      // Occasion-specific colors and shapes
      let hues: number[] = [330, 290, 38, 220]; // Default: mixed
      let shapeCount = 3;

      if (occasion === "birthday") {
        hues = [38, 220, 270, 0]; // Gold, blue, purple, red
        shapeCount = 4;
      } else if (occasion === "love") {
        hues = [330, 0, 290]; // Pink, red, purple
        shapeCount = 2; // Mostly hearts
      } else if (occasion === "anniversary") {
        hues = [38, 0, 220]; // Gold, red, blue
        shapeCount = 4;
      }

      return {
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.6,
        duration: 2 + Math.random() * 2.5,
        rotate: Math.random() * 360,
        hue: hues[i % hues.length],
        shape: i % shapeCount,
      };
    })
  );

  if (!active) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden" aria-hidden>
      {pieces.map((p) => (
        <span
          key={p.id}
          className="absolute -top-6 block"
          style={{
            left: `${p.left}%`,
            animation: `confettiFall ${p.duration}s ${p.delay}s ease-in forwards`,
            transform: `rotate(${p.rotate}deg)`,
          }}
        >
          {p.shape === 0 ? (
            <span
              className="block w-2 h-3 rounded-sm"
              style={{ background: `hsl(${p.hue} 90% 65%)` }}
            />
          ) : p.shape === 1 ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill={`hsl(${p.hue} 90% 65%)`}>
              <path d="M12 21s-7-4.35-7-10a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 5.65-7 10-7 10z" />
            </svg>
          ) : p.shape === 2 ? (
            <span
              className="block w-2.5 h-2.5 rounded-full"
              style={{ background: `hsl(${p.hue} 90% 65%)`, boxShadow: `0 0 12px hsl(${p.hue} 90% 65%)` }}
            />
          ) : (
            // Star shape for birthday
            <svg width="14" height="14" viewBox="0 0 24 24" fill={`hsl(${p.hue} 90% 65%)`}>
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          )}
        </span>
      ))}
      <style>{`@keyframes confettiFall { to { transform: translateY(110vh) rotate(720deg); opacity: 0.7; } }`}</style>
    </div>
  );
};
