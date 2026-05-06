import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import {
  Sparkles as SparklesIcon,
  Heart,
  Music,
  ArrowLeft,
  Share2,
  Copy,
  Check,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
} from "lucide-react";
import { Sparkles, Confetti } from "@/components/surprisync/Sparkles";
import { AnimatedLetter } from "@/components/surprisync/AnimatedLetter";
import { EnhancedStoryStage } from "@/components/surprisync/EnhancedStoryStage";
import { IntroScreen } from "@/components/surprisync/IntroScreen";
import { StepIndicator } from "@/components/surprisync/StepIndicator";
import { MusicPlayer } from "@/components/surprisync/MusicPlayer";
import { UnlockBadge } from "@/components/surprisync/UnlockBadge";
import { Button } from "@/components/ui/button";
import { getSurprise, occasionMeta, themes, Surprise, updateEngagement } from "@/lib/surprises";
import { soundManager } from "@/lib/soundManager";
import { toast } from "sonner";

function useCountdown(target: string) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, new Date(target).getTime() - now);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff / 3600000) % 24);
  const m = Math.floor((diff / 60000) % 60);
  const s = Math.floor((diff / 1000) % 60);
  return { diff, d, h, m, s };
}

type Stage =
  | "splash"     // Initial intro screen with animated message
  | "intro"      // "A surprise from X for Y" — tap to begin
  | "ribbon"     // ribbon untying animation
  | "opening"    // gift box opening burst
  | "story"      // photo storybook with captions
  | "letter"    // typewriter message + signature
  | "encore";    // audio + share + send back

const Reveal = () => {
  const { id } = useParams();
  const [params] = useSearchParams();
  const isPreview = params.get("preview") === "1";
  const surprise = useMemo(() => (id ? getSurprise(id) : undefined), [id]);

  if (!surprise) return <NotFoundCard />;
  return <RevealView surprise={surprise} preview={isPreview} />;
};

const NotFoundCard = () => (
  <main className="min-h-screen grid place-items-center p-6">
    <div className="glass rounded-3xl p-10 max-w-md text-center">
      <div className="text-5xl mb-4">🌫️</div>
      <h1 className="font-display text-2xl font-semibold">This surprise drifted away</h1>
      <p className="text-muted-foreground mt-2">It might have been opened on another device, or it's waiting somewhere else.</p>
      <Button asChild className="mt-6 rounded-full bg-magic text-white border-0">
        <Link to="/">Back home</Link>
      </Button>
    </div>
  </main>
);

const RevealView = ({ surprise, preview }: { surprise: Surprise; preview: boolean }) => {
  const theme = themes.find((t) => t.id === surprise.theme) || themes[0];
  const cd = useCountdown(surprise.revealAt);
  const locked = !preview && cd.diff > 0;

  const [stage, setStage] = useState<Stage>("splash");
  const [confetti, setConfetti] = useState(false);
  const [unlockedFeature, setUnlockedFeature] = useState<string | null>(null);

  // Track that the reveal page was opened
  useEffect(() => {
    if (!preview) {
      updateEngagement(surprise.id, {
        hasBeenOpened: true,
        lastClicked: new Date().toISOString(),
      });

      // Broadcast to Share page via BroadcastChannel
      try {
        const channel = new BroadcastChannel(`reveal_${surprise.id}`);
        channel.postMessage({
          type: "reveal_started",
          engagement: {
            hasBeenOpened: true,
            lastClicked: new Date().toISOString(),
          },
        });
        channel.close();
      } catch {
        // BroadcastChannel not supported
      }
    }
  }, [surprise.id, preview]);

  const begin = () => {
    setStage("ribbon");
    soundManager?.playPop(surprise.occasion);
    if (!preview) {
      updateEngagement(surprise.id, { recipientStartedRevealing: true });
      try {
        const channel = new BroadcastChannel(`reveal_${surprise.id}`);
        channel.postMessage({ type: "stage_changed", stage: "ribbon" });
        channel.close();
      } catch {}
    }
    setTimeout(() => {
      setStage("opening");
      soundManager?.playChime(surprise.occasion);
    }, 1600);
    setTimeout(() => {
      setStage("story");
      setConfetti(true);
    }, 2900);
    setTimeout(() => setConfetti(false), 8000);
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Themed gradient backdrop */}
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} opacity-95 transition-opacity duration-1000`} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,white_0%,transparent_55%)] opacity-30" />
      {/* Floating blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white/20 blur-3xl animate-blob" />
      <div className="absolute -bottom-32 -right-32 w-[28rem] h-[28rem] rounded-full bg-white/15 blur-3xl animate-blob" style={{ animationDelay: "4s" }} />
      <Sparkles count={30} />
      <Confetti active={confetti} occasion={surprise.occasion} />
      <UnlockBadge feature={unlockedFeature || ""} show={!!unlockedFeature} />

      {stage === "splash" ? (
        <IntroScreen surprise={surprise} onStart={() => setStage("intro")} />
      ) : (
        <>
          {preview && (
            <div className="relative z-20 container mx-auto px-4 pt-6 flex items-center justify-between text-white">
              <Link to={`/s/${surprise.id}/share`} className="flex items-center gap-2 text-sm font-medium opacity-90 hover:opacity-100">
                <ArrowLeft className="w-4 h-4" /> Back
              </Link>
              <span className="glass-dark text-white rounded-full px-3 py-1 text-xs font-semibold">Preview mode</span>
            </div>
          )}

          {/* Music player in top corner */}
          {!locked && (
            <div className="absolute top-6 right-6 z-20">
              <MusicPlayer surprise={surprise} />
            </div>
          )}

          {/* Progress indicator */}
          {!locked && stage !== "splash" && (
            <div className="absolute top-6 left-6 z-20">
              <StepIndicator
                currentStep={["intro", "ribbon", "opening", "story", "letter", "encore"].indexOf(stage)}
                totalSteps={6}
                stepLabels={["Prepare", "Unwrap", "Open", "Memories", "Message", "Celebrate"]}
              />
            </div>
          )}

          <div className="relative z-10 container mx-auto px-4 py-8 sm:py-14 max-w-2xl text-white">
            {locked ? (
              <LockedCard surprise={surprise} cd={cd} />
            ) : stage === "intro" ? (
              <IntroStage surprise={surprise} onBegin={begin} />
            ) : stage === "ribbon" ? (
              <RibbonStage surprise={surprise} />
            ) : stage === "opening" ? (
              <OpeningStage surprise={surprise} />
            ) : stage === "story" ? (
              <EnhancedStoryStage surprise={surprise} onDone={() => setStage("letter")} />
            ) : stage === "letter" ? (
              <AnimatedLetter surprise={surprise} onDone={() => setStage("encore")} />
            ) : (
              <EncoreStage surprise={surprise} />
            )}
          </div>
        </>
      )}
    </main>
  );
};

/* ---------------- LOCKED ---------------- */

const LockedCard = ({ surprise, cd }: { surprise: Surprise; cd: ReturnType<typeof useCountdown> }) => {
  const meta = occasionMeta[surprise.occasion];
  return (
    <div className="text-center animate-fade-up">
      <div className="inline-flex items-center gap-2 glass-dark rounded-full px-4 py-1.5 text-xs font-semibold tracking-widest uppercase">
        <SparklesIcon className="w-3.5 h-3.5" /> A surprise from {surprise.fromName}
      </div>
      <div className="relative mt-12 mx-auto w-56 h-56">
        <div className="absolute inset-0 rounded-full bg-white/30 blur-3xl animate-pulse-glow" />
        <div className="relative w-full h-full grid place-items-center animate-float">
          <div className="text-[8rem] leading-none drop-shadow-2xl">{meta.emoji}</div>
        </div>
      </div>
      <h1 className="mt-10 font-display text-4xl sm:text-5xl font-semibold leading-tight drop-shadow">
        {surprise.toName},<br />
        <span className="italic opacity-90">something is waiting for you.</span>
      </h1>
      <p className="mt-5 text-white/85 max-w-md mx-auto">Don't peek yet. The moment unwraps in…</p>
      <div className="mt-7 grid grid-cols-4 gap-3 max-w-md mx-auto">
        {[
          { l: "days", v: cd.d },
          { l: "hrs", v: cd.h },
          { l: "min", v: cd.m },
          { l: "sec", v: cd.s },
        ].map((u) => (
          <div key={u.l} className="glass-dark rounded-2xl py-4">
            <div className="font-display text-3xl font-semibold tabular-nums">{String(u.v).padStart(2, "0")}</div>
            <div className="text-[10px] uppercase tracking-widest opacity-80">{u.l}</div>
          </div>
        ))}
      </div>
      <p className="mt-8 text-xs text-white/70 italic">We'll keep this safe until the exact second.</p>
    </div>
  );
};

/* ---------------- INTRO ---------------- */

const IntroStage = ({ surprise, onBegin }: { surprise: Surprise; onBegin: () => void }) => {
  const meta = occasionMeta[surprise.occasion];
  return (
    <div className="text-center animate-fade-up">
      <div className="inline-flex items-center gap-2 glass-dark rounded-full px-4 py-1.5 text-xs font-semibold tracking-widest uppercase">
        <SparklesIcon className="w-3.5 h-3.5" /> A moment, just for you
      </div>

      {/* Wrapped gift */}
      <div className="relative mt-10 mx-auto w-64 h-64">
        <div className="absolute inset-0 rounded-full bg-white/25 blur-3xl animate-pulse-glow" />
        <div className="relative w-full h-full grid place-items-center animate-float">
          <GiftBox tied />
        </div>
      </div>

      <h1 className="mt-8 font-display text-4xl sm:text-5xl font-semibold leading-[1.05] drop-shadow">
        Hi {surprise.toName},
      </h1>
      <p className="mt-3 font-display italic text-2xl sm:text-3xl text-white/95">
        {surprise.fromName} left this for you.
      </p>
      <p className="mt-4 text-white/85 max-w-sm mx-auto">
        Find a quiet moment. Maybe turn the volume up. <br />
        When you're ready — open it slowly.
      </p>

      <button
        onClick={onBegin}
        className="group relative mt-9 inline-flex items-center gap-2 rounded-full bg-white text-foreground px-8 h-14 text-base font-semibold shadow-2xl hover:scale-105 active:scale-100 transition-transform"
      >
        <span className="absolute inset-0 rounded-full bg-white animate-pulse-glow opacity-60" />
        <Heart className="w-5 h-5 fill-primary text-primary relative" />
        <span className="relative">Tap to open</span>
      </button>
      <div className="mt-6 text-xs text-white/70 italic">{meta.vibe}</div>
    </div>
  );
};

/* ---------------- RIBBON ---------------- */

const RibbonStage = ({ surprise }: { surprise: Surprise }) => (
  <div className="grid place-items-center min-h-[60vh]">
    <div className="relative w-64 h-64">
      <div className="absolute inset-0 rounded-full bg-white/30 blur-3xl animate-pulse-glow" />
      <div className="relative w-full h-full grid place-items-center">
        <GiftBox untying />
      </div>
    </div>
    <p className="mt-6 text-white/90 font-display italic text-lg animate-fade-up">untying the ribbon…</p>
  </div>
);

/* ---------------- OPENING ---------------- */

const OpeningStage = ({ surprise }: { surprise: Surprise }) => {
  const meta = occasionMeta[surprise.occasion];
  return (
    <div className="grid place-items-center min-h-[60vh]">
      <div className="relative w-72 h-72">
        <div className="absolute inset-0 rounded-full bg-white/40 blur-3xl animate-pulse-glow" />
        <div className="relative w-full h-full grid place-items-center">
          <div
            className="text-[9rem] leading-none drop-shadow-2xl"
            style={{ animation: "popOut 1.1s cubic-bezier(0.22,1,0.36,1) both" }}
          >
            {meta.emoji}
          </div>
        </div>
      </div>
      <p className="mt-2 text-white font-display text-2xl animate-fade-up">For you, {surprise.toName} ✨</p>
      <style>{`@keyframes popOut { 0% { transform: scale(0) rotate(-30deg); opacity: 0; } 60% { transform: scale(1.2) rotate(8deg); opacity: 1; } 100% { transform: scale(1) rotate(0); } }`}</style>
    </div>
  );
};

/* ---------------- GIFT BOX SVG ---------------- */

const GiftBox = ({ tied = false, untying = false }: { tied?: boolean; untying?: boolean }) => (
  <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">
    <defs>
      <linearGradient id="boxg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#fff" stopOpacity="0.95" />
        <stop offset="100%" stopColor="#fde2ef" stopOpacity="0.95" />
      </linearGradient>
      <linearGradient id="ribg" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="hsl(330 90% 65%)" />
        <stop offset="100%" stopColor="hsl(38 92% 62%)" />
      </linearGradient>
    </defs>
    {/* Box body */}
    <rect x="40" y="80" width="120" height="90" rx="10" fill="url(#boxg)" />
    {/* Lid */}
    <rect
      x="32"
      y="68"
      width="136"
      height="24"
      rx="6"
      fill="url(#boxg)"
      style={untying ? { animation: "lidLift 1.2s cubic-bezier(0.22,1,0.36,1) forwards" } : {}}
    />
    {/* Vertical ribbon */}
    <rect x="92" y="68" width="16" height="102" fill="url(#ribg)" />
    {/* Horizontal ribbon */}
    <rect x="32" y="118" width="136" height="14" fill="url(#ribg)" />
    {/* Bow */}
    <g
      transform="translate(100 70)"
      style={untying ? { animation: "bowPop 1.1s cubic-bezier(0.22,1,0.36,1) forwards" } : tied ? { animation: "bowPulse 2.5s ease-in-out infinite" } : {}}
    >
      <ellipse cx="-14" cy="0" rx="14" ry="10" fill="url(#ribg)" />
      <ellipse cx="14" cy="0" rx="14" ry="10" fill="url(#ribg)" />
      <circle cx="0" cy="0" r="6" fill="hsl(38 92% 62%)" />
    </g>
    <style>{`
      @keyframes bowPulse { 0%,100% { transform: translate(100px,70px) scale(1); } 50% { transform: translate(100px,70px) scale(1.08); } }
      @keyframes bowPop { 0% { transform: translate(100px,70px) scale(1) rotate(0); opacity: 1; } 100% { transform: translate(100px,40px) scale(0.4) rotate(40deg); opacity: 0; } }
      @keyframes lidLift { 0% { transform: translate(0,0) rotate(0); } 100% { transform: translate(-10px,-50px) rotate(-15deg); } }
    `}</style>
  </svg>
);

/* Use the enhanced story stage */

// Letter stage is now handled by AnimatedLetter component imported above

/* ---------------- ENCORE (audio + share) ---------------- */

const EncoreStage = ({ surprise }: { surprise: Surprise }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.play().then(() => setPlaying(true)).catch(() => {});
    }
  }, []);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) { a.play(); setPlaying(true); } else { a.pause(); setPlaying(false); }
  };

  const share = async () => {
    const url = window.location.origin + `/s/${surprise.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: surprise.title, text: `A little something for ${surprise.toName} ✨`, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success("Link copied — pass the magic on ✨");
        setTimeout(() => setCopied(false), 2200);
      }
    } catch {}
  };

  return (
    <article className="space-y-6 animate-fade-up text-center">
      <div className="text-5xl">🤍</div>
      <h2 className="font-display text-3xl sm:text-4xl font-semibold leading-tight">
        That's it, {surprise.toName}.<br />
        <span className="italic opacity-90">Just wanted you to feel this.</span>
      </h2>
      <p className="text-white/85 max-w-md mx-auto">— {surprise.fromName}</p>

      {surprise.voiceNote && (
        <div className="glass-dark rounded-2xl p-5 flex items-center gap-4 text-left">
          <button onClick={toggle} className="grid place-items-center w-12 h-12 rounded-full bg-magic shadow-magic shrink-0">
            {playing ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white" />}
          </button>
          <div className="flex-1 min-w-0">
            <div className="text-xs uppercase tracking-wider opacity-80">A voice note from {surprise.fromName}</div>
            <div className="font-display italic text-base mt-0.5">Press play. Hear them.</div>
          </div>
          <audio ref={audioRef} src={surprise.voiceNote} onEnded={() => setPlaying(false)} className="hidden" />
        </div>
      )}

      {surprise.song && !surprise.voiceNote && (
        <div className="glass-dark rounded-2xl p-5 flex items-center gap-4 text-left">
          <div className="grid place-items-center w-12 h-12 rounded-full bg-magic shadow-magic shrink-0">
            <Music className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs uppercase tracking-wider opacity-80">Our song</div>
            <a href={surprise.song} target="_blank" rel="noreferrer" className="text-sm font-semibold underline underline-offset-4 break-all">
              {surprise.song}
            </a>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Button onClick={share} className="rounded-full bg-white text-foreground hover:bg-white/90 h-12 px-5 font-semibold">
          {copied ? <Check className="w-4 h-4 mr-2" /> : <Share2 className="w-4 h-4 mr-2" />}
          {copied ? "Copied" : "Share this moment"}
        </Button>
        <Button asChild variant="ghost" className="rounded-full text-white hover:bg-white/10 h-12 px-5 border border-white/40">
          <Link to="/create">
            Send one back <Heart className="w-4 h-4 ml-2 fill-white" />
          </Link>
        </Button>
      </div>

      <p className="text-xs text-white/70 italic pt-4">Made with SurpriSync — moments, beautifully wrapped.</p>
    </article>
  );
};

export default Reveal;
