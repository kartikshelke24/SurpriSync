import Navbar from "@/components/surprisync/Navbar";
import Hero from "@/components/surprisync/Hero";
import Features from "@/components/surprisync/Features";
import HowItWorks from "@/components/surprisync/HowItWorks";
import Stories from "@/components/surprisync/Stories";
import CTA from "@/components/surprisync/CTA";
import Footer from "@/components/surprisync/Footer";

const Index = () => {
  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Stories />
      <CTA />
      <Footer />
    </main>
  );
};

export default Index;
