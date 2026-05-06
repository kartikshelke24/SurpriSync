import React, { useEffect, useState } from "react";
import { Surprise, occasionMeta } from "@/lib/surprises";
import { soundManager } from "@/lib/soundManager";

interface IntroScreenProps {
  surprise: Surprise;
  onStart: () => void;
}

export const IntroScreen: React.FC<IntroScreenProps> = ({ surprise, onStart }) => {
  const meta = occasionMeta[surprise.occasion];
  const [showText, setShowText] = useState(false);
  const [showTapHint, setShowTapHint] = useState(false);

  useEffect(() => {
    // Animate in the introductory message
    const timer1 = setTimeout(() => setShowText(true), 300);
    const timer2 = setTimeout(() => setShowTapHint(true), 2500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const handleStart = () => {
    soundManager?.playPop(surprise.occasion);
    onStart();
  };

  return (
    <div
      onClick={handleStart}
      className="min-h-screen flex flex-col items-center justify-center p-6 cursor-pointer group"
    >
      {/* Large emoji */}
      <div className="text-8xl mb-8 animate-bounce" style={{ animationDelay: "0s" }}>
        {meta.emoji}
      </div>

      {/* Intro text with fade-in */}
      <div
        className={`text-center transition-all duration-1000 ${
          showText ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        <div className="text-lg text-white/80 mb-2">Hey...</div>
        <h1 className="font-display text-5xl sm:text-6xl font-semibold leading-tight mb-4">
          Someone has something
          <br />
          special for you
        </h1>
        <p className="text-xl text-white/70 mt-6">
          A {meta.label.toLowerCase()} surprise from <span className="font-semibold">{surprise.fromName}</span>
        </p>
      </div>

      {/* Tap hint with fade-in */}
      {showTapHint && (
        <div className="absolute bottom-12 animate-bounce">
          <div className="text-sm text-white/60 mb-2">Tap anywhere</div>
          <div className="text-2xl animate-pulse">👆</div>
        </div>
      )}

      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/5"
            style={{
              width: `${100 + i * 50}px`,
              height: `${100 + i * 50}px`,
              top: `${20 + i * 15}%`,
              left: `${10 + i * 25}%`,
              animation: `float ${5 + i}s ease-in-out infinite`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(20px); }
        }
      `}</style>
    </div>
  );
};
