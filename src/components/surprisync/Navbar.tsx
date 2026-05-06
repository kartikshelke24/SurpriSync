import { Sparkles, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled ? "py-3" : "py-5"}`}>
      <div className={`container mx-auto px-4`}>
        <nav className={`flex items-center justify-between rounded-full px-5 py-3 transition-all duration-500 ${scrolled ? "glass shadow-soft" : ""}`}>
          <a href="#" className="flex items-center gap-2 font-display font-bold text-xl">
            <span className="relative grid place-items-center w-9 h-9 rounded-2xl bg-magic shadow-magic">
              <Sparkles className="w-4 h-4 text-white" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-gold animate-pulse-glow" />
            </span>
            <span>Surpri<span className="text-gradient">Sync</span></span>
          </a>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-foreground/80">
            <a href="#features" className="hover:text-foreground transition">Features</a>
            <a href="#stories" className="hover:text-foreground transition">Stories</a>
            <a href="#how" className="hover:text-foreground transition">How it works</a>
            <a href="#pricing" className="hover:text-foreground transition">Pricing</a>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" className="hidden sm:inline-flex rounded-full">Sign in</Button>
            <Button asChild className="rounded-full bg-magic hover:opacity-90 shadow-magic text-white border-0">
              <Link to="/create">Create surprise</Link>
            </Button>
            <button className="md:hidden p-2" aria-label="Menu"><Menu /></button>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
