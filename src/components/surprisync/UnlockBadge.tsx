import { useEffect, useState } from "react";
import { Sparkles, Confetti } from "@/components/surprisync/Sparkles";

interface UnlockBadgeProps {
  feature: string;
  show: boolean;
}

const BADGE_METADATA: Record<string, { emoji: string; title: string; description: string }> = {
  prediction_master: {
    emoji: "🏆",
    title: "Prediction Master",
    description: "Your prediction matched their reaction!",
  },
  share_champion: {
    emoji: "📢",
    title: "Share Champion",
    description: "You've shared via multiple channels!",
  },
  prolific_wrapper: {
    emoji: "🎁",
    title: "Prolific Wrapper",
    description: "You&apos;ve created 3+ surprises!",
  },
};

export const UnlockBadge = ({ feature, show }: UnlockBadgeProps) => {
  const [isVisible, setIsVisible] = useState(show);
  const metadata = BADGE_METADATA[feature] || { emoji: "✨", title: "Achievement", description: "You unlocked something special!" };

  useEffect(() => {
    setIsVisible(show);
    if (show) {
      const timer = setTimeout(() => setIsVisible(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      <Confetti active={true} />
      
      <div className="pointer-events-auto animate-fade-up">
        <div className="bg-gradient-to-br from-amber-300 via-amber-200 to-yellow-100 rounded-2xl p-8 shadow-2xl max-w-sm mx-auto transform transition-all">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-bounce">{metadata.emoji}</div>
            <h3 className="font-display text-2xl font-bold text-amber-950 mb-2">
              {metadata.title}
            </h3>
            <p className="text-amber-900/80 text-sm">
              {metadata.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
