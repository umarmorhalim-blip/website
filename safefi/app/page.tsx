import { FinalCta } from "@/components/FinalCta";
import { Footer } from "@/components/Footer";
import { Journey } from "@/components/Journey";
import { Nav } from "@/components/Nav";
import { StickyCta } from "@/components/StickyCta";

export default function Home() {
  return (
    <>
      <a
        href="#journey"
        className="sr-only z-50 rounded-lg bg-purple-deep px-4 py-2 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to the story
      </a>
      <Nav />
      <main id="top">
        <Journey />
        <FinalCta />
      </main>
      <Footer />
      <StickyCta />
    </>
  );
}
