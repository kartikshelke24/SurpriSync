import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Sparkles as SparklesIcon, Check, Heart, Image as ImageIcon, Music, Mic, Calendar, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles } from "@/components/surprisync/Sparkles";
import { Occasion, occasionMeta, themes, saveSurprise, newId } from "@/lib/surprises";
import { toast } from "sonner";

const steps = ["Occasion", "Vibe", "From & to", "Memory", "Soundtrack", "Reveal"];

const Create = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [occasion, setOccasion] = useState<Occasion>("birthday");
  const [theme, setTheme] = useState(themes[0].id);
  const [fromName, setFromName] = useState("");
  const [toName, setToName] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [song, setSong] = useState("");
  const [voiceNote, setVoiceNote] = useState("");
  const [recording, setRecording] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const today = new Date();
  const defaultReveal = new Date(today.getTime() + 60_000).toISOString().slice(0, 16);
  const [revealAt, setRevealAt] = useState(defaultReveal);

  const meta = occasionMeta[occasion];
  const themeMeta = useMemo(() => themes.find((t) => t.id === theme)!, [theme]);

  const titlePlaceholder = useMemo(() => {
    const map: Record<Occasion, string> = {
      birthday: "Happy birthday, sunshine ☀️",
      anniversary: "5 years of us 💍",
      friendship: "To my person 🫶",
      love: "Things I've never said out loud",
      thanks: "Thank you, truly",
      justbecause: "Just thinking of you",
    };
    return map[occasion];
  }, [occasion]);

  const messagePlaceholder = useMemo(() => {
    const map: Record<Occasion, string> = {
      birthday: "Another year of being the best human I know. Here's to candles, chaos and everything we'll laugh about next year...",
      anniversary: "Five years ago today, you walked in and the room got brighter. I want to remember every detail with you.",
      friendship: "If I had to pick a person for the rest of life — quiet days, hard days, dancing-in-the-kitchen days — it would always be you.",
      love: "I've been carrying these words around. I think it's finally time you read them.",
      thanks: "I don't say it enough, so let me say it properly. Thank you. For all of it.",
      justbecause: "No occasion. No reason. Just you, on my mind, and a small surprise to make you smile.",
    };
    return map[occasion];
  }, [occasion]);

  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const back = () => (step === 0 ? navigate("/") : setStep((s) => s - 1));

  const onPhotos = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).slice(0, 6).forEach((f) => {
      const reader = new FileReader();
      reader.onload = () => setPhotos((p) => [...p, reader.result as string].slice(0, 6));
      reader.readAsDataURL(f);
    });
  };

  const startRec = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => chunksRef.current.push(e.data);
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onload = () => setVoiceNote(reader.result as string);
        reader.readAsDataURL(blob);
        stream.getTracks().forEach((t) => t.stop());
      };
      rec.start();
      recorderRef.current = rec;
      setRecording(true);
    } catch {
      toast.error("Microphone unavailable. You can still send the surprise without a voice note.");
    }
  };

  const stopRec = () => {
    recorderRef.current?.stop();
    setRecording(false);
  };

  const canNext = () => {
    if (step === 2) return fromName.trim() && toName.trim();
    if (step === 3) return title.trim() && message.trim();
    return true;
  };

  const finish = () => {
    try {
      const id = newId();
      const parsed = revealAt ? new Date(revealAt) : new Date(Date.now() + 60_000);
      const revealISO = isNaN(parsed.getTime()) ? new Date(Date.now() + 60_000).toISOString() : parsed.toISOString();
      saveSurprise({
        id, occasion, theme, fromName, toName,
        title: title || titlePlaceholder,
        message: message || messagePlaceholder,
        photos, song, voiceNote,
        revealAt: revealISO, createdAt: new Date().toISOString(),
      });
      toast.success("Wrapped! Share it when you're ready ✨");
      navigate(`/s/${id}/share`);
    } catch (err) {
      console.error("finish failed", err);
      toast.error("Something went wrong wrapping your surprise. Please try again.");
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
      <Sparkles count={20} />
      <div className="absolute -top-20 -left-20 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-blob" />
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-gold/30 rounded-full blur-3xl animate-blob" style={{ animationDelay: "4s" }} />

      <div className="relative container mx-auto px-4 py-8 max-w-3xl">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={back} className="flex items-center gap-2 text-sm font-medium hover:text-primary transition">
            <ArrowLeft className="w-4 h-4" /> {step === 0 ? "Home" : "Back"}
          </button>
          <div className="text-xs text-muted-foreground tabular-nums">
            Step <span className="font-semibold text-foreground">{step + 1}</span> of {steps.length}
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex items-center gap-2 mb-10">
          {steps.map((label, i) => (
            <div key={label} className="flex-1">
              <div className={`h-1.5 rounded-full transition-all duration-700 ${i <= step ? "bg-magic shadow-[0_0_12px_hsl(var(--primary)/0.6)]" : "bg-muted"}`} />
              <div className={`mt-2 text-[10px] uppercase tracking-wider font-semibold transition-colors ${i === step ? "text-foreground" : "text-muted-foreground/60"}`}>
                {label}
              </div>
            </div>
          ))}
        </div>

        <div className="glass rounded-[2rem] p-6 sm:p-10 shadow-soft animate-fade-up" key={step}>
          {step === 0 && (
            <div>
              <h1 className="font-display text-3xl sm:text-4xl font-semibold leading-tight">
                What's the <span className="text-gradient italic">moment</span>?
              </h1>
              <p className="text-muted-foreground mt-2">Pick the feeling — we'll wrap the rest.</p>
              <div className="mt-7 grid sm:grid-cols-2 gap-3">
                {(Object.keys(occasionMeta) as Occasion[]).map((o) => {
                  const m = occasionMeta[o];
                  const active = occasion === o;
                  return (
                    <button
                      key={o}
                      onClick={() => setOccasion(o)}
                      className={`relative text-left rounded-2xl p-5 transition-all duration-500 hover:-translate-y-0.5 ${active ? "ring-2 ring-primary shadow-magic bg-white" : "bg-white/60 hover:bg-white"}`}
                    >
                      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${m.gradient} opacity-0 ${active ? "opacity-10" : ""} transition-opacity`} />
                      <div className="relative flex items-center gap-3">
                        <div className={`text-3xl transition-transform duration-500 ${active ? "scale-110" : ""}`}>{m.emoji}</div>
                        <div>
                          <div className="font-display font-semibold">{m.label}</div>
                          <div className="text-xs text-muted-foreground">{m.vibe}</div>
                        </div>
                        {active && <Check className="ml-auto w-5 h-5 text-primary" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <h1 className="font-display text-3xl sm:text-4xl font-semibold leading-tight">
                Pick a <span className="text-gradient italic">vibe</span>.
              </h1>
              <p className="text-muted-foreground mt-2">This sets the music of the whole moment.</p>
              <div className="mt-7 grid sm:grid-cols-2 gap-4">
                {themes.map((t) => {
                  const active = theme === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className={`group relative rounded-2xl overflow-hidden aspect-[4/3] text-left transition-all duration-500 ${active ? "ring-2 ring-primary shadow-magic scale-[1.01]" : "hover:-translate-y-1"}`}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${t.gradient}`} />
                      <Sparkles count={8} />
                      <div className="absolute inset-0 p-5 flex flex-col justify-end text-white">
                        <div className="font-display text-xl font-semibold drop-shadow">{t.name}</div>
                        <div className="text-xs opacity-90">{t.desc}</div>
                      </div>
                      {active && (
                        <div className="absolute top-3 right-3 grid place-items-center w-8 h-8 rounded-full bg-white text-primary">
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h1 className="font-display text-3xl sm:text-4xl font-semibold leading-tight">
                Two <span className="text-gradient italic">names</span>, one moment.
              </h1>
              <p className="text-muted-foreground mt-2">Whose smile are we chasing today?</p>
              <div className="mt-7 grid sm:grid-cols-2 gap-4">
                <label className="block">
                  <div className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-2">From</div>
                  <Input value={fromName} onChange={(e) => setFromName(e.target.value)} placeholder="Your name" className="h-14 rounded-2xl bg-white text-base" />
                </label>
                <label className="block">
                  <div className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-2">To</div>
                  <Input value={toName} onChange={(e) => setToName(e.target.value)} placeholder="Their name" className="h-14 rounded-2xl bg-white text-base" />
                </label>
              </div>
              {fromName && toName && (
                <div className="mt-6 glass rounded-2xl p-5 animate-fade-up">
                  <div className="text-xs text-muted-foreground">Preview</div>
                  <div className="font-display text-lg mt-1">
                    A surprise from <span className="font-semibold">{fromName}</span> for <span className="font-semibold text-gradient">{toName}</span> ✨
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div>
              <h1 className="font-display text-3xl sm:text-4xl font-semibold leading-tight">
                Say what's <span className="text-gradient italic">in your heart</span>.
              </h1>
              <p className="text-muted-foreground mt-2">A title, a few honest words, a few photos. That's all.</p>

              <div className="mt-7 space-y-5">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={titlePlaceholder}
                  className="h-14 rounded-2xl bg-white text-base font-display"
                />
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={messagePlaceholder}
                  className="rounded-2xl bg-white text-base min-h-[160px] leading-relaxed"
                />

                <div>
                  <div className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                    <ImageIcon className="w-3.5 h-3.5" /> Photos (up to 6)
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {photos.map((src, i) => (
                      <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                        <img src={src} alt="" className="w-full h-full object-cover" />
                        <button onClick={() => setPhotos((p) => p.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 grid place-items-center w-6 h-6 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {photos.length < 6 && (
                      <button onClick={() => fileRef.current?.click()} className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition grid place-items-center text-muted-foreground hover:text-primary">
                        <ImageIcon className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => onPhotos(e.target.files)} />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h1 className="font-display text-3xl sm:text-4xl font-semibold leading-tight">
                Give it a <span className="text-gradient italic">soundtrack</span>.
              </h1>
              <p className="text-muted-foreground mt-2">A song link or a voice note in your own voice. Optional, but unforgettable.</p>

              <div className="mt-7 space-y-6">
                <label className="block">
                  <div className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                    <Music className="w-3.5 h-3.5" /> Song link (Spotify, YouTube, anything)
                  </div>
                  <Input value={song} onChange={(e) => setSong(e.target.value)} placeholder="Paste a link to 'our song'" className="h-14 rounded-2xl bg-white text-base" />
                </label>

                <div>
                  <div className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                    <Mic className="w-3.5 h-3.5" /> Voice note
                  </div>
                  <div className="glass rounded-2xl p-5 flex items-center gap-4">
                    <button
                      onClick={recording ? stopRec : startRec}
                      className={`relative grid place-items-center w-16 h-16 rounded-full text-white transition-all ${recording ? "bg-destructive animate-pulse" : "bg-magic shadow-magic hover:scale-105"}`}
                    >
                      <Mic className="w-6 h-6" />
                      {recording && <span className="absolute inset-0 rounded-full ring-4 ring-destructive/40 animate-ping" />}
                    </button>
                    <div className="flex-1">
                      <div className="font-semibold">{recording ? "Listening… speak from the heart" : voiceNote ? "Voice note saved ✨" : "Tap to record"}</div>
                      <div className="text-xs text-muted-foreground">{voiceNote && !recording ? "It'll play right after the reveal." : "Up to a minute is plenty."}</div>
                      {voiceNote && !recording && (
                        <audio controls src={voiceNote} className="mt-3 w-full h-9" />
                      )}
                    </div>
                    {voiceNote && !recording && (
                      <button onClick={() => setVoiceNote("")} className="text-xs text-muted-foreground hover:text-destructive">Remove</button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div>
              <h1 className="font-display text-3xl sm:text-4xl font-semibold leading-tight">
                When should the <span className="text-gradient italic">magic begin</span>?
              </h1>
              <p className="text-muted-foreground mt-2">Pick a date and time. We'll keep it locked until that exact second.</p>

              <div className="mt-7 space-y-5">
                <label className="block">
                  <div className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" /> Reveal at
                  </div>
                  <Input
                    type="datetime-local"
                    value={revealAt}
                    onChange={(e) => setRevealAt(e.target.value)}
                    className="h-14 rounded-2xl bg-white text-base"
                  />
                </label>

                <div className="relative rounded-3xl overflow-hidden p-7 text-white shadow-magic">
                  <div className={`absolute inset-0 bg-gradient-to-br ${themeMeta.gradient}`} />
                  <Sparkles count={12} />
                  <div className="relative">
                    <div className="text-xs uppercase tracking-widest opacity-80">Final preview</div>
                    <div className="font-display text-2xl sm:text-3xl mt-2 leading-tight">
                      {meta.emoji} {title || titlePlaceholder}
                    </div>
                    <div className="opacity-90 text-sm mt-2">
                      For <span className="font-semibold">{toName || "them"}</span>, from <span className="font-semibold">{fromName || "you"}</span>
                    </div>
                    <div className="mt-4 inline-flex items-center gap-2 bg-white/20 backdrop-blur rounded-full px-3 py-1 text-xs">
                      <SparklesIcon className="w-3.5 h-3.5" /> Unlocks {new Date(revealAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="mt-6 flex items-center justify-between gap-3">
          <Button variant="ghost" onClick={back} className="rounded-full">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          {step < steps.length - 1 ? (
            <Button
              onClick={next}
              disabled={!canNext()}
              className="rounded-full bg-magic text-white border-0 shadow-magic hover:scale-[1.03] transition-transform px-6 h-12"
            >
              Continue <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={finish} className="rounded-full bg-magic text-white border-0 shadow-magic hover:scale-[1.03] transition-transform px-6 h-12">
              <Heart className="w-4 h-4 mr-2 fill-white" /> Wrap & preview
              <Send className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </main>
  );
};

export default Create;
