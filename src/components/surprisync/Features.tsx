import { Heart, Music, Image as ImageIcon, Clock, Wand2, Share2 } from "lucide-react";
import { Reveal } from "@/components/surprisync/Reveal";

const features = [
  {
    icon: Wand2,
    title: "Templates that already feel like you",
    desc: "Hand-crafted, story-driven layouts. Pick one, breathe into it, send it.",
    grad: "from-pink-400 to-rose-500",
  },
  {
    icon: Music,
    title: "Soundtrack the moment",
    desc: "Drop in your song or whisper a voice note. It plays the second they unwrap.",
    grad: "from-purple-400 to-fuchsia-500",
  },
  {
    icon: ImageIcon,
    title: "Memories that move",
    desc: "Slide in photos and watch them animate into a tiny living storybook.",
    grad: "from-amber-300 to-orange-500",
  },
  {
    icon: Clock,
    title: "Time-locked reveals",
    desc: "Schedule it for midnight, sunrise, or 7:14am — your moment, on cue.",
    grad: "from-sky-400 to-indigo-500",
  },
  {
    icon: Heart,
    title: "Reactions that hug back",
    desc: "Get a private replay of their first smile. Goosebumps, every time.",
    grad: "from-rose-400 to-pink-500",
  },
  {
    icon: Share2,
    title: "One link. Infinite feels.",
    desc: "A single beautiful URL. Works everywhere. Feels like nowhere else.",
    grad: "from-fuchsia-400 to-purple-500",
  },
];

const Features = () => (
  <section id="features" className="py-24 relative">
    <div className="container mx-auto px-4">
      <Reveal>
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-block glass rounded-full px-4 py-1.5 text-xs font-semibold tracking-wider uppercase text-primary mb-5">
            Crafted with feeling
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-semibold leading-tight">
            Everything you need to make someone <span className="text-gradient italic">cry the good way</span>.
          </h2>
          <p className="text-muted-foreground mt-5">Tiny details that turn a message into a memory.</p>
        </div>
      </Reveal>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <Reveal key={f.title} delay={i * 80}>
            <div className="group glass rounded-3xl p-7 hover:-translate-y-2 hover:shadow-magic transition-all duration-700 h-full">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.grad} grid place-items-center shadow-soft group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
                <f.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-display text-xl font-semibold mt-5">{f.title}</h3>
              <p className="text-muted-foreground mt-2 leading-relaxed">{f.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

export default Features;
