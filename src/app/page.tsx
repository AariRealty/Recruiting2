import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import WhySection from "@/components/WhySection";
import Benefits from "@/components/Benefits";
import Commission from "@/components/Commission";
import NewAgents from "@/components/NewAgents";
import Testimonials from "@/components/Testimonials";
import Calendar from "@/components/Calendar";
import JoinCTA from "@/components/JoinCTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <WhySection />
        <Benefits />
        <Commission />
        <NewAgents />
        <Testimonials />
        <Calendar />
        <JoinCTA />
      </main>
      <Footer />
    </>
  );
}
