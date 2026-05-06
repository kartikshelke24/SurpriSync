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
import { Button } from "@/components/ui/button";
import { getSurprise, occasionMeta, themes, Surprise } from "@/lib/surprises";
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

  const [stage, setStage] = useState<Stage>("intro");
  const [confetti, setConfetti] = useState(false);

  const begin = () => {
    setStage("ribbon");
    setTimeout(() => setStage("opening"), 1600);
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
      <Confetti active={confetti} />

      {preview && (
        <div className="relative z-20 container mx-auto px-4 pt-6 flex items-center justify-between text-white">
          <Link to={`/s/${surprise.id}/share`} className="flex items-center gap-2 text-sm font-medium opacity-90 hover:opacity-100">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <span className="glass-dark text-white rounded-full px-3 py-1 text-xs font-semibold">Preview mode</span>
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
          <StoryStage surprise={surprise} onDone={() => setStage("letter")} />
        ) : stage === "letter" ? (
          <LetterStage surprise={surprise} onDone={() => setStage("encore")} />
        ) : (
          <EncoreStage surprise={surprise} />
        )}
      </div>
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

/* ---------------- STORY (photos) ---------------- */

const StoryStage = ({ surprise, onDone }: { surprise: Surprise; onDone: () => void }) => {
  const photos = surprise.photos.length ? surprise.photos : [];
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const DURATION = 4500;

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
  }, [idx, paused, photos.length]);

  if (!photos.length) {
    return (
      <div className="grid place-items-center min-h-[60vh] text-center animate-fade-up">
        <div className="text-6xl mb-4">💌</div>
        <p className="font-display text-2xl">Skipping ahead to the words…</p>
      </div>
    );
  }

  const next = () => {
    if (idx < photos.length - 1) {
      setIdx(idx + 1);
      setProgress(0);
    } else onDone();
  };
  const prev = () => {
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
      <div className="relative rounded-[2rem] overflow-hidden aspect-[3/4] sm:aspect-[4/5] glass-dark">
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

        {photos.map((src, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-700 ${i === idx ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          >
            <img
              src={src}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              style={i === idx && !paused ? { animation: "kenBurns 5s ease-out both" } : {}}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/30" />
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
        <button onClick={prev} aria-label="Previous" className="absolute left-0 top-0 bottom-0 w-1/3 z-10" />
        <button onClick={next} aria-label="Next" className="absolute right-0 top-0 bottom-0 w-1/3 z-10" />

        {/* Controls */}
        <div className="absolute bottom-3 inset-x-0 z-20 flex items-center justify-center gap-3">
          <button onClick={() => setPaused((p) => !p)} className="glass-dark rounded-full p-2 text-white">
            {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>
          <button onClick={onDone} className="glass-dark rounded-full px-4 py-2 text-white text-xs font-semibold">
            Skip to message →
          </button>
        </div>
      </div>

      <style>{`@keyframes kenBurns { from { transform: scale(1.05); } to { transform: scale(1.18); } }`}</style>
    </div>
  );
};

/* ---------------- LETTER (typewriter message) ---------------- */

const LetterStage = ({ surprise, onDone }: { surprise: Surprise; onDone: () => void }) => {
  const meta = occasionMeta[surprise.occasion];
  const [typed, setTyped] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    const text = surprise.message;
    const id = setInterval(() => {
      i++;
      setTyped(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(id);
        setDone(true);
      }
    }, 28);
    return () => clearInterval(id);
  }, [surprise.message]);

  return (
    <article className="space-y-7 animate-fade-up">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 glass-dark rounded-full px-4 py-1.5 text-xs font-semibold tracking-widest uppercase">
          {meta.emoji} {meta.label}
        </div>
        <h1 className="mt-5 font-display text-4xl sm:text-5xl font-semibold leading-[1.05] drop-shadow">
          {surprise.title}
        </h1>
      </div>

      <div className="glass-dark rounded-[2rem] p-7 sm:p-10 relative">
        <div className="absolute -top-3 left-8 text-6xl text-white/30 font-display select-none">"</div>
        <p className="font-display text-xl sm:text-2xl leading-relaxed whitespace-pre-wrap min-h-[6rem]">
          {typed}
          {!done && <span className="inline-block w-[2px] h-6 ml-1 bg-white align-middle animate-pulse" />}
        </p>
        <div className="mt-8 flex items-center gap-3 text-sm">
          <div className="w-11 h-11 rounded-full bg-warm grid place-items-center font-semibold shadow-lg">
            {surprise.fromName.slice(0, 1).toUpperCase()}
          </div>
          <div>
            <div className="font-display italic text-lg">— {surprise.fromName}</div>
            <div className="text-xs opacity-80">
              {new Date(surprise.createdAt).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
            </div>
          </div>
        </div>
      </div>

      <div className="text-center">
        <Button
          onClick={onDone}
          disabled={!done}
          className="rounded-full bg-white text-foreground hover:bg-white/90 disabled:opacity-50 h-12 px-7 font-semibold"
        >
          {done ? <>Continue <Heart className="w-4 h-4 ml-2 fill-primary text-primary" /></> : "Reading…"}
        </Button>
      </div>
    </article>
  );
};

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
