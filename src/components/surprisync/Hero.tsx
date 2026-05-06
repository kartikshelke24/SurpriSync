import { Button } from "@/components/ui/button";
import { Sparkles, Heart, ArrowRight, Play } from "lucide-react";
import { Link } from "react-router-dom";
import heroImg from "@/assets/hero-surprise.jpg";
import giftGlow from "@/assets/gift-glow.png";
import { Sparkles as SparkleField } from "@/components/surprisync/Sparkles";

const Hero = () => {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Animated blobs */}
      <div className="absolute -top-20 -left-20 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-blob" />
      <div className="absolute top-40 -right-20 w-96 h-96 bg-gold/30 rounded-full blur-3xl animate-blob" style={{ animationDelay: "3s" }} />
      <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-secondary/30 rounded-full blur-3xl animate-blob" style={{ animationDelay: "6s" }} />
      <SparkleField count={18} />

      <div className="container relative mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8 animate-fade-up">
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 text-sm">
            <Sparkles className="w-4 h-4 text-gold" />
            <span className="font-medium">Make every moment unforgettable</span>
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-semibold leading-[1.05] tracking-tight">
            Send a surprise <br />
            that feels like <span className="text-gradient italic">magic</span>.
          </h1>

          <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
            SurpriSync turns your love, gratitude and inside jokes into beautifully crafted digital surprises — birthdays, anniversaries, friendships, and the in-between moments that matter most.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Button asChild size="lg" className="rounded-full bg-magic shadow-magic text-white border-0 px-7 h-14 text-base hover:scale-[1.03] transition-transform">
              <Link to="/create">
                Create your first surprise
                <ArrowRight className="ml-1" />
              </Link>
            </Button>
            <Button size="lg" variant="ghost" className="rounded-full h-14 px-5 gap-2">
              <span className="grid place-items-center w-9 h-9 rounded-full glass">
                <Play className="w-4 h-4 fill-foreground" />
              </span>
              Watch the story
            </Button>
          </div>

          <div className="flex items-center gap-6 pt-4">
            <div className="flex -space-x-3">
              {[
                "from-pink-300 to-rose-400",
                "from-purple-300 to-fuchsia-400",
                "from-amber-200 to-orange-400",
                "from-blue-300 to-indigo-400",
              ].map((g, i) => (
                <div key={i} className={`w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br ${g}`} />
              ))}
            </div>
            <div className="text-sm">
              <div className="flex items-center gap-1 font-semibold">
                <Heart className="w-4 h-4 fill-primary text-primary" /> 120k+ surprises sent
              </div>
              <div className="text-muted-foreground">Loved across 40+ countries</div>
            </div>
          </div>
        </div>

        {/* Visual */}
        <div className="relative animate-fade-up" style={{ animationDelay: "0.2s" }}>
          <div className="relative aspect-square max-w-xl mx-auto">
            <div className="absolute inset-0 rounded-[3rem] bg-aurora blur-2xl opacity-70 animate-pulse-glow" />
            <div className="relative rounded-[3rem] overflow-hidden glass shadow-magic">
              <img
                src={heroImg}
                alt="Magical floating surprise gifts with hearts and sparkles"
                className="w-full h-full object-cover"
                width={1536}
                height={1280}
              />
            </div>

            {/* Floating cards */}
            <div className="absolute -left-6 top-10 glass rounded-2xl p-4 shadow-soft animate-float w-56">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-warm grid place-items-center">
                  <Heart className="w-5 h-5 text-white fill-white" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Just sent</div>
                  <div className="text-sm font-semibold">A birthday memory →</div>
                </div>
              </div>
            </div>

            <div className="absolute -right-4 bottom-16 glass rounded-2xl p-4 shadow-gold animate-float-slow w-52">
              <div className="text-xs text-muted-foreground">Mia just opened</div>
              <div className="text-sm font-semibold mt-1">"Our 5 years 💛"</div>
              <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full w-3/4 bg-warm" />
              </div>
            </div>

            <img
              src={giftGlow}
              alt=""
              aria-hidden
              className="absolute -bottom-10 -left-10 w-32 animate-float opacity-90 drop-shadow-2xl"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
