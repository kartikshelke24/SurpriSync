import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import giftGlow from "@/assets/gift-glow.png";

const CTA = () => (
  <section id="pricing" className="py-24">
    <div className="container mx-auto px-4">
      <div className="relative rounded-[3rem] overflow-hidden bg-magic shadow-magic">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,white_0%,transparent_40%)] opacity-30" />
        <div className="absolute -top-10 -right-10 w-72 h-72 bg-gold/40 rounded-full blur-3xl animate-blob" />
        <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-white/30 rounded-full blur-3xl animate-blob" style={{ animationDelay: "4s" }} />

        <img src={giftGlow} alt="" aria-hidden loading="lazy" className="absolute right-8 bottom-0 w-64 md:w-80 animate-float opacity-90" />

        <div className="relative px-8 md:px-16 py-20 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur text-white rounded-full px-4 py-1.5 text-xs font-semibold tracking-wider uppercase mb-6">
            <Sparkles className="w-3.5 h-3.5" /> Free to start
          </div>
          <h2 className="font-display text-4xl md:text-6xl font-semibold leading-[1.05] text-white">
            Someone out there is waiting for your surprise.
          </h2>
          <p className="text-white/85 text-lg mt-5 max-w-lg">
            Create your first SurpriSync in under 2 minutes. No credit card. Just feelings.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-full bg-white text-primary hover:bg-white/90 h-14 px-7 text-base font-semibold shadow-gold">
              <Link to="/create">Start for free <ArrowRight className="ml-1" /></Link>
            </Button>
            <Button size="lg" variant="ghost" className="rounded-full text-white hover:bg-white/10 h-14 px-6 border border-white/30">
              See pricing
            </Button>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default CTA;
