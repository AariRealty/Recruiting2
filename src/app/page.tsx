import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import WhySection from "@/components/WhySection";
import Technology from "@/components/Technology";
import Training from "@/components/Training";
import Commission from "@/components/Commission";
import Testimonials from "@/components/Testimonials";
import JoinCTA from "@/components/JoinCTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <WhySection />
        <Technology />
        <Training />
        <Commission />
        <Testimonials />
        <JoinCTA />
      </main>
      <Footer />
    </>
  );
}
