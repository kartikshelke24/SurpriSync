import { useEffect, useState, useRef } from "react";
import { Heart } from "lucide-react";
import { Surprise, occasionMeta, updateEngagement } from "@/lib/surprises";
import { soundManager } from "@/lib/soundManager";
import { Button } from "@/components/ui/button";

interface Props {
  surprise: Surprise;
  onDone: () => void;
}

/**
 * Enhanced letter component with:
 * - Word-by-word float-in animation
 * - Emotion-based color highlighting
 * - Animated signature drawing
 * - Interactive ink effects
 */
export const AnimatedLetter = ({ surprise, onDone }: Props) => {
  const meta = occasionMeta[surprise.occasion];
  const [visibleWords, setVisibleWords] = useState(0);
  const [done, setDone] = useState(false);
  const signatureRef = useRef<SVGPathElement>(null);

  // Split message into words
  const words = surprise.message.split(/(\s+)/);

  // Animation speed: one word every 80ms
  const WORD_DELAY = 80;

  useEffect(() => {
    if (visibleWords >= words.length) {
      setDone(true);
      soundManager?.playSuccess();
      // Track that the surprise was fully revealed
      updateEngagement(surprise.id, {
        revealedAt: new Date().toISOString(),
      });
      try {
        const channel = new BroadcastChannel(`reveal_${surprise.id}`);
        channel.postMessage({
          type: "reveal_completed",
          revealedAt: new Date().toISOString(),
        });
        channel.close();
      } catch {}
      return;
    }

    const timer = setTimeout(() => {
      setVisibleWords((v) => v + 1);
      // Play subtle pop sound every few words
      if (visibleWords % 8 === 0) {
        soundManager?.playPop(surprise.occasion);
      }
    }, WORD_DELAY);

    return () => clearTimeout(timer);
  }, [visibleWords, words.length, surprise.occasion]);

  // Animate signature drawing when letter is done
  useEffect(() => {
    if (!done || !signatureRef.current) return;

    const path = signatureRef.current;
    const length = path.getTotalLength();

    // Start with full stroke
    path.style.strokeDasharray = String(length);
    path.style.strokeDashoffset = String(length);

    // Animate the dash offset
    const start = Date.now();
    const duration = 1500; // 1.5 seconds for signature

    const animate = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(1, elapsed / duration);
      path.style.strokeDashoffset = String(length * (1 - progress));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    const frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [done]);

  // Color mapping for emotion-based highlighting
  const emotionalKeywords: Record<string, string> = {
    love: "text-rose-300",
    miss: "text-rose-300",
    heart: "text-rose-300",
    happy: "text-yellow-300",
    smile: "text-yellow-300",
    laugh: "text-yellow-300",
    joy: "text-yellow-300",
    grateful: "text-amber-300",
    thank: "text-amber-300",
    appreciate: "text-amber-300",
    beautiful: "text-pink-300",
    wonderful: "text-pink-300",
    amazing: "text-cyan-300",
    special: "text-cyan-300",
  };

  const getWordColor = (word: string): string => {
    const lower = word.toLowerCase().replace(/[.,!?;:]/g, "");
    for (const [keyword, color] of Object.entries(emotionalKeywords)) {
      if (lower.includes(keyword)) return color;
    }
    return "text-white";
  };

  return (
    <article className="space-y-7 animate-fade-up">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 glass-dark rounded-full px-4 py-1.5 text-xs font-semibold tracking-widest uppercase">
          {meta.emoji} {meta.label}
        </div>
        <h1 className="mt-5 font-display text-4xl sm:text-5xl font-semibold leading-[1.05] drop-shadow">
          {surprise.title}
        </h1>
      </div>

      {/* Letter content with animated words */}
      <div className="glass-dark rounded-[2rem] p-7 sm:p-10 relative overflow-hidden">
        {/* Decorative quote mark */}
        <div className="absolute -top-3 left-8 text-6xl text-white/30 font-display select-none">"</div>

        {/* Message with word-by-word animation */}
        <p className="font-display text-xl sm:text-2xl leading-relaxed min-h-[6rem]">
          {words.map((word, idx) => (
            <span
              key={idx}
              className={`inline transition-all duration-300 ${
                idx <= visibleWords
                  ? `opacity-100 translate-y-0 ${getWordColor(word)}`
                  : "opacity-0 translate-y-4"
              }`}
              style={{
                transitionDelay: `${Math.max(0, idx - visibleWords + 5) * 30}ms`,
              }}
            >
              {word}
            </span>
          ))}
          {!done && (
            <span className="inline-block w-[2px] h-6 ml-1 bg-white align-middle animate-pulse" />
          )}
        </p>

        {/* Signature */}
        <div className="mt-8 flex items-center gap-3">
          {done && (
            <svg
              className="w-12 h-12"
              viewBox="0 0 48 48"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                ref={signatureRef}
                d="M8 24 Q12 20, 16 24 T24 24 Q28 28, 32 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white/70"
              />
            </svg>
          )}
          <div>
            <div className="font-display italic text-lg">— {surprise.fromName}</div>
            <div className="text-xs opacity-80">
              {new Date(surprise.createdAt).toLocaleDateString(undefined, {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <Button
          onClick={onDone}
          disabled={!done}
          className="rounded-full bg-white text-foreground hover:bg-white/90 disabled:opacity-50 h-12 px-7 font-semibold"
        >
          {done ? (
            <>
              Continue <Heart className="w-4 h-4 ml-2 fill-primary text-primary" />
            </>
          ) : (
            `${Math.round((visibleWords / words.length) * 100)}%`
          )}
        </Button>
      </div>
    </article>
  );
};
