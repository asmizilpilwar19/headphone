import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { Story } from "@/components/Story";
import { Exploded } from "@/components/Exploded";
import { Features } from "@/components/Features";
import { Collection } from "@/components/Collection";
import { Campaign } from "@/components/Campaign";
import { Specs } from "@/components/Specs";
import { Finale } from "@/components/Finale";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Nav />
      <Hero />
      <Story />
      <Exploded />
      <Features />
      <Collection />
      <Campaign />
      <Specs />
      <Finale />
      <Footer />
    </main>
  );
}
