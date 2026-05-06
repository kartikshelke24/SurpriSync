import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Sparkles as SparklesIcon, Copy, Check, Eye, Send, ArrowLeft, Heart, Share2, MessageCircle, Mail, Users, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sparkles, Confetti } from "@/components/surprisync/Sparkles";
import { getSurprise, occasionMeta, themes, createSession, getSession } from "@/lib/surprises";
import { PredictionCard } from "@/components/surprisync/PredictionCard";
import { EngagementDashboard } from "@/components/surprisync/EngagementDashboard";
import { UnlockBadge } from "@/components/surprisync/UnlockBadge";
import { toast } from "sonner";

const Share = () => {
  const { id } = useParams();
  const surprise = useMemo(() => (id ? getSurprise(id) : undefined), [id]);
  const [copied, setCopied] = useState(false);
  const [confetti, setConfetti] = useState(true);
  const [unlockedFeature, setUnlockedFeature] = useState<string | null>(null);
  const [showEngagement, setShowEngagement] = useState(false);

  useEffect(() => {
    setTimeout(() => setConfetti(false), 4500);
  }, []);

  useEffect(() => {
    if (id) {
      const session = getSession(id);
      if (!session) {
        createSession(id);
      }
      setShowEngagement(true);
    }
  }, [id]);

  if (!surprise) {
    return (
      <main className="min-h-screen grid place-items-center p-6">
        <div className="glass rounded-3xl p-10 max-w-md text-center">
          <div className="text-5xl mb-4">🌫️</div>
          <h1 className="font-display text-2xl font-semibold">We couldn't find this surprise</h1>
          <p className="text-muted-foreground mt-2">It may have been opened on another device.</p>
          <Button asChild className="mt-6 rounded-full bg-magic text-white border-0">
            <Link to="/create">Create a new one</Link>
          </Button>
        </div>
      </main>
    );
  }

  const meta = occasionMeta[surprise.occasion];
  const theme = themes.find((t) => t.id === surprise.theme) || themes[0];
  const url = `${window.location.origin}/s/${surprise.id}`;
  const shareText = `${surprise.fromName} sent you a surprise on SurpriSync ✨`;

  const copy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copied — share it when the moment is right ✨");
    setTimeout(() => setCopied(false), 2200);
  };

  const nativeShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: surprise.title, text: shareText, url });
      } else {
        copy();
      }
    } catch {}
  };

  const wa = `https://wa.me/?text=${encodeURIComponent(shareText + " " + url)}`;
  const mail = `mailto:?subject=${encodeURIComponent(surprise.title)}&body=${encodeURIComponent(shareText + "\n\n" + url)}`;
  const reveal = new Date(surprise.revealAt);
  const isFuture = reveal.getTime() > Date.now();

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} opacity-90`} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,white_0%,transparent_55%)] opacity-30" />
      <Sparkles count={28} />
      <Confetti active={confetti} />
      <UnlockBadge feature={unlockedFeature || ""} show={!!unlockedFeature} />

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-2xl text-white">
        <div className="flex items-center justify-between mb-6">
          <Link to="/create" className="flex items-center gap-2 text-sm font-medium opacity-90 hover:opacity-100">
            <ArrowLeft className="w-4 h-4" /> Edit
          </Link>
          <Link to="/" className="text-sm font-medium opacity-90 hover:opacity-100">Home</Link>
        </div>

        <div className="text-center animate-fade-up">
          <div className="inline-flex items-center gap-2 glass-dark rounded-full px-4 py-1.5 text-xs font-semibold tracking-widest uppercase">
            <SparklesIcon className="w-3.5 h-3.5" /> Wrapped & ready
          </div>
          <h1 className="mt-6 font-display text-4xl sm:text-5xl font-semibold leading-tight drop-shadow">
            Your surprise for <span className="italic">{surprise.toName}</span> is wrapped.
          </h1>
          <p className="mt-3 text-white/85 max-w-md mx-auto">
            {isFuture
              ? `It'll unlock on ${reveal.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}. Send the link now — they'll see a countdown until then.`
              : "It's ready to open the second they tap the link."}
          </p>
        </div>

        {/* Engagement Dashboard */}
        {showEngagement && (
          <div className="mt-8 animate-fade-up" style={{ animationDelay: "150ms" }}>
            <EngagementDashboard surpriseId={surprise.id} toName={surprise.toName} />
          </div>
        )}

        {/* Card preview */}
        <div className="mt-8 glass-dark rounded-[2rem] p-6 sm:p-8 animate-fade-up" style={{ animationDelay: "150ms" }}>
          <div className="flex items-center gap-4">
            <div className="text-5xl drop-shadow">{meta.emoji}</div>
            <div className="min-w-0">
              <div className="text-xs uppercase tracking-widest opacity-80">{meta.label}</div>
              <div className="font-display text-xl font-semibold truncate">{surprise.title}</div>
              <div className="text-xs opacity-80 mt-0.5">From {surprise.fromName} · For {surprise.toName}</div>
            </div>
          </div>

          <div className="mt-6">
            <div className="text-xs uppercase tracking-widest opacity-80 mb-2">Shareable link</div>
            <div className="flex items-stretch gap-2">
              <div className="flex-1 min-w-0 rounded-2xl bg-white/15 backdrop-blur px-4 py-3 text-sm font-mono truncate">
                {url}
              </div>
              <button
                onClick={copy}
                className="rounded-2xl bg-white text-foreground px-4 font-semibold hover:scale-[1.03] transition-transform inline-flex items-center gap-2"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2">
            <button onClick={nativeShare} className="rounded-2xl bg-white/15 hover:bg-white/25 transition py-3 text-sm font-semibold inline-flex items-center justify-center gap-2">
              <Share2 className="w-4 h-4" /> Share
            </button>
            <a href={wa} target="_blank" rel="noreferrer" className="rounded-2xl bg-white/15 hover:bg-white/25 transition py-3 text-sm font-semibold inline-flex items-center justify-center gap-2">
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </a>
            <a href={mail} className="rounded-2xl bg-white/15 hover:bg-white/25 transition py-3 text-sm font-semibold inline-flex items-center justify-center gap-2">
              <Mail className="w-4 h-4" /> Email
            </a>
          </div>
        </div>

        {/* Prediction Card */}
        {showEngagement && (
          <div className="mt-8 animate-fade-up" style={{ animationDelay: "250ms" }}>
            <PredictionCard 
              surpriseId={surprise.id} 
              onAnswer={() => {
                // Check if we should unlock a feature
                const session = getSession(surprise.id);
                if (session && session.unlockedFeatures.includes("prediction_master") && !unlockedFeature) {
                  setUnlockedFeature("prediction_master");
                }
              }}
            />
          </div>
        )}

        {/* Primary actions */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 animate-fade-up" style={{ animationDelay: "300ms" }}>
          <Button asChild className="rounded-full bg-white text-foreground hover:bg-white/90 h-12 px-5 font-semibold">
            <Link to={`/s/${surprise.id}?preview=1`}>
              <Eye className="w-4 h-4 mr-2" /> Preview as recipient
            </Link>
          </Button>
          <Button asChild variant="ghost" className="rounded-full text-white hover:bg-white/10 h-12 px-5 border border-white/30">
            <Link to={`/s/${surprise.id}`}>
              Open the live link <Send className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>

        {/* Secondary actions */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3 animate-fade-up" style={{ animationDelay: "350ms" }}>
          <Button asChild variant="ghost" className="rounded-full text-white hover:bg-white/10 h-10 px-5 text-sm border border-white/20">
            <Link to={`/contribution/${surprise.id}`}>
              <Users className="w-4 h-4 mr-2" /> Group Wishes
            </Link>
          </Button>
          <Button asChild variant="ghost" className="rounded-full text-white hover:bg-white/10 h-10 px-5 text-sm border border-white/20">
            <Link to={`/analytics/${surprise.id}`}>
              <BarChart3 className="w-4 h-4 mr-2" /> Analytics
            </Link>
          </Button>
        </div>

        <div className="mt-10 text-center text-xs text-white/75 italic">
          <Heart className="w-3 h-3 inline -mt-0.5 mr-1 fill-white" />
          Tip: keep the link a secret until the right moment.
        </div>

        <div className="mt-8 text-center">
          <Button asChild variant="ghost" className="rounded-full text-white/90 hover:bg-white/10 h-10 px-4 text-sm">
            <Link to="/create">+ Wrap another surprise</Link>
          </Button>
        </div>
      </div>
    </main>
  );
};

export default Share;
