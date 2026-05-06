import { Heart, MessageCircle, Sparkles } from "lucide-react";

const stories = [
  {
    name: "Léa & Marc",
    type: "Anniversary",
    quote: "He opened it at 7:14am — the time we first met. I've never seen him cry like that.",
    grad: "from-pink-400 via-rose-400 to-amber-300",
    likes: "3.2k",
  },
  {
    name: "Best friends since '09",
    type: "Friendship",
    quote: "16 years of voice notes, stitched into a 2-minute film. We sobbed.",
    grad: "from-purple-400 via-fuchsia-400 to-pink-400",
    likes: "5.8k",
  },
  {
    name: "Maya's 30th",
    type: "Birthday",
    quote: "47 friends across 12 countries left messages. It unlocked at midnight.",
    grad: "from-sky-400 via-indigo-400 to-purple-500",
    likes: "9.1k",
  },
];

const Stories = () => (
  <section id="stories" className="py-24 relative overflow-hidden">
    <div className="container mx-auto px-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs font-semibold tracking-wider uppercase text-gold mb-5">
            <Sparkles className="w-3.5 h-3.5" /> Real stories
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-semibold leading-tight">
            Tiny moments. <span className="text-gradient italic">Forever memories.</span>
          </h2>
        </div>
        <a href="#" className="text-sm font-semibold underline underline-offset-4 hover:text-primary transition">Browse community →</a>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {stories.map((s, i) => (
          <article
            key={s.name}
            className="group relative rounded-3xl overflow-hidden aspect-[4/5] shadow-soft hover:shadow-magic transition-all duration-700 hover:-translate-y-2 animate-fade-up"
            style={{ animationDelay: `${i * 120}ms` }}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${s.grad}`} />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,white_0%,transparent_50%)] opacity-30" />

            {/* sparkles */}
            <span className="absolute top-10 left-8 w-2 h-2 bg-white rounded-full animate-sparkle" />
            <span className="absolute top-20 right-12 w-1.5 h-1.5 bg-white rounded-full animate-sparkle" style={{ animationDelay: "0.6s" }} />
            <span className="absolute bottom-32 left-16 w-1 h-1 bg-white rounded-full animate-sparkle" style={{ animationDelay: "1.2s" }} />

            <div className="absolute inset-0 p-7 flex flex-col justify-between text-white">
              <div className="flex items-center justify-between">
                <span className="glass-dark text-white rounded-full px-3 py-1 text-xs font-semibold">{s.type}</span>
                <div className="flex items-center gap-1.5 text-xs glass-dark rounded-full px-3 py-1">
                  <Heart className="w-3.5 h-3.5 fill-white" /> {s.likes}
                </div>
              </div>

              <div>
                <p className="font-display text-2xl leading-snug font-medium drop-shadow-md">"{s.quote}"</p>
                <div className="mt-5 flex items-center justify-between">
                  <div className="font-semibold">{s.name}</div>
                  <button className="grid place-items-center w-10 h-10 rounded-full glass-dark hover:scale-110 transition">
                    <MessageCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  </section>
);

export default Stories;
