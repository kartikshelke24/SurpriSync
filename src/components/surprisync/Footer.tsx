import { Sparkles, Instagram, Twitter, Github } from "lucide-react";

const Footer = () => (
  <footer className="py-12 border-t border-border/50">
    <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="flex items-center gap-2 font-display font-bold text-lg">
        <span className="grid place-items-center w-8 h-8 rounded-xl bg-magic shadow-magic">
          <Sparkles className="w-4 h-4 text-white" />
        </span>
        Surpri<span className="text-gradient">Sync</span>
      </div>
      <p className="text-sm text-muted-foreground">© 2026 SurpriSync — made with love, served with sparkles.</p>
      <div className="flex items-center gap-3">
        {[Instagram, Twitter, Github].map((Icon, i) => (
          <a key={i} href="#" className="grid place-items-center w-10 h-10 rounded-full glass hover:shadow-magic hover:-translate-y-0.5 transition">
            <Icon className="w-4 h-4" />
          </a>
        ))}
      </div>
    </div>
  </footer>
);

export default Footer;
