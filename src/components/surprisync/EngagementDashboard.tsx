import { useEffect, useState } from "react";
import { Eye, RotateCw } from "lucide-react";
import { getSession, EngagementMetrics } from "@/lib/surprises";
import { Confetti } from "@/components/surprisync/Sparkles";

interface EngagementDashboardProps {
  surpriseId: string;
  toName: string;
}

export const EngagementDashboard = ({ surpriseId, toName }: EngagementDashboardProps) => {
  const [engagement, setEngagement] = useState<EngagementMetrics | null>(null);
  const [sharedTime, setSharedTime] = useState<string>("");
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    const session = getSession(surpriseId);
    if (session) {
      setEngagement(session.engagement);
      const sharedAt = new Date(session.sharedAt);
      const now = new Date();
      const diff = now.getTime() - sharedAt.getTime();
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      
      if (mins === 0) {
        setSharedTime(`${secs}s ago`);
      } else if (mins < 60) {
        setSharedTime(`${mins}m ago`);
      } else {
        const hours = Math.floor(mins / 60);
        setSharedTime(`${hours}h ago`);
      }
    }

    // Listen for engagement updates from Reveal.tsx
    const handleRevealStarted = () => {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
      const updated = getSession(surpriseId);
      if (updated) {
        setEngagement(updated.engagement);
      }
    };

    const channel = new BroadcastChannel(`reveal_${surpriseId}`);
    channel.addEventListener("message", (event) => {
      if (event.data.type === "reveal_started") {
        handleRevealStarted();
      } else if (event.data.type === "engagement_update") {
        setEngagement(event.data.engagement);
      }
    });

    return () => channel.close();
  }, [surpriseId]);

  if (!engagement) {
    return null;
  }

  const getStatusText = () => {
    if (engagement.revealedAt) {
      const revealDate = new Date(engagement.revealedAt);
      return `They opened it! ${revealDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    }
    if (engagement.hasBeenOpened) {
      return "They just opened the link! 🔥";
    }
    if (engagement.recipientStartedRevealing) {
      return "They're unwrapping... 🎁";
    }
    return `Shared ${sharedTime}`;
  };

  const getStatusColor = () => {
    if (engagement.revealedAt) return "from-emerald-400 to-green-500";
    if (engagement.hasBeenOpened) return "from-amber-400 to-orange-500";
    if (engagement.recipientStartedRevealing) return "from-pink-400 to-rose-500";
    return "from-blue-400 to-indigo-500";
  };

  return (
    <div className="relative">
      <Confetti active={showCelebration} />
      
      <div className={`bg-gradient-to-r ${getStatusColor()} rounded-2xl p-6 sm:p-8 shadow-xl transform transition-all duration-300 ${showCelebration ? "scale-105" : "scale-100"}`}>
        <div className="flex items-center gap-4 text-white">
          <div className="flex-shrink-0">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-white/20">
              {engagement.revealedAt ? (
                <span className="text-2xl">🎉</span>
              ) : engagement.hasBeenOpened ? (
                <span className="text-2xl">👀</span>
              ) : engagement.recipientStartedRevealing ? (
                <span className="text-2xl">🎁</span>
              ) : (
                <Eye className="h-8 w-8" />
              )}
            </div>
          </div>
          
          <div className="flex-1">
            <h3 className="font-display font-semibold text-lg">{getStatusText()}</h3>
            <p className="text-white/80 text-sm mt-1">
              {toName}&apos;s reaction is on its way...
            </p>
          </div>

          {engagement.recipientStartedRevealing && (
            <div className="flex-shrink-0 animate-spin">
              <RotateCw className="h-6 w-6 text-white" />
            </div>
          )}
        </div>

        {/* Engagement stats */}
        {engagement.linkClicks > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-3 pt-4 border-t border-white/20">
            <div className="text-center">
              <div className="text-2xl font-bold">{engagement.linkClicks}</div>
              <div className="text-xs opacity-80">Visit{engagement.linkClicks !== 1 ? "s" : ""}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{Object.keys(engagement.questionsAnswered).length}</div>
              <div className="text-xs opacity-80">Prediction{Object.keys(engagement.questionsAnswered).length !== 1 ? "s" : ""}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">–</div>
              <div className="text-xs opacity-80">Reaction</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
