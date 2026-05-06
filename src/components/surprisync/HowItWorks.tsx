import { Sparkles } from "lucide-react";

const steps = [
  { n: "01", title: "Pick a moment", desc: "Birthday, friendship anniversary, just-because — choose a vibe." },
  { n: "02", title: "Layer the magic", desc: "Photos, voice, music, AI-written notes. Drag, drop, feel." },
  { n: "03", title: "Schedule the reveal", desc: "Set a date and time. We'll unwrap it perfectly on cue." },
  { n: "04", title: "Watch them light up", desc: "Get a private replay of their reaction in real time." },
];

const HowItWorks = () => (
  <section id="how" className="py-24 relative">
    <div className="container mx-auto px-4">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <div className="animate-fade-up">
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs font-semibold tracking-wider uppercase text-secondary mb-5">
            <Sparkles className="w-3.5 h-3.5" /> How it works
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-semibold leading-tight mb-5">
            From idea to <span className="text-gradient italic">"oh my god"</span> in four little steps.
          </h2>
          <p className="text-muted-foreground text-lg max-w-md">
            No design skills, no overthinking. Just open your heart and let SurpriSync handle the choreography.
          </p>
        </div>

        <div className="space-y-4">
          {steps.map((s, i) => (
            <div
              key={s.n}
              className="group glass rounded-3xl p-6 flex gap-5 items-start hover:shadow-magic hover:-translate-x-1 transition-all duration-500 animate-fade-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="font-display text-3xl font-bold text-gradient w-14 shrink-0">{s.n}</div>
              <div>
                <h3 className="font-display text-xl font-semibold">{s.title}</h3>
                <p className="text-muted-foreground mt-1">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default HowItWorks;
