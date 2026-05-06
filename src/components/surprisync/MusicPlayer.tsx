import React, { useEffect, useState } from "react";
import { Music, Volume2, VolumeX } from "lucide-react";
import { soundManager } from "@/lib/soundManager";
import { Surprise } from "@/lib/surprises";

interface MusicPlayerProps {
  surprise: Surprise;
  className?: string;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({ surprise, className = "" }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    // Initialize ambient music based on occasion
    if (isPlaying && !isMuted) {
      soundManager?.playAmbient(surprise.occasion);
    }
  }, [surprise.occasion, isPlaying, isMuted]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted) {
      soundManager?.stop();
    } else {
      soundManager?.playAmbient(surprise.occasion);
    }
  };

  return (
    <div className={`flex items-center gap-2 glass-dark rounded-full px-4 py-2 ${className}`}>
      <Music className="w-4 h-4 text-white/80" />
      <button
        onClick={toggleMute}
        className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
        aria-label={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? (
          <VolumeX className="w-4 h-4 text-white/60" />
        ) : (
          <Volume2 className="w-4 h-4 text-white" />
        )}
      </button>
      <span className="text-xs text-white/70">{isMuted ? "Muted" : "Playing"}</span>
    </div>
  );
};
