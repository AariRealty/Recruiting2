"use client";

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import TaglineBar from "@/components/TaglineBar";
import Commission from "@/components/Commission";
import MidCTA from "@/components/MidCTA";
import WhySection from "@/components/WhySection";
import BrokerSection from "@/components/BrokerSection";
import CultureSection from "@/components/CultureSection";
import ApplySection from "@/components/ApplySection";
import Footer from "@/components/Footer";
import RevealObserver from "@/components/RevealObserver";

export default function Home() {
  return (
    <>
      <RevealObserver />
      <Navbar />
      <Hero />
      <TaglineBar />
      <Commission />
      <MidCTA />
      <WhySection />
      <BrokerSection />
      <CultureSection />
      <ApplySection />
      <Footer />
    </>
  );
}
