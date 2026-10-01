"use client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StatPanels from "@/components/StatPanels";
import PuzzlePanel from "@/components/PuzzlePanel";
import { HowItWorks, PastRounds, TokenInfo } from "@/components/InfoSections";
import { useGameState } from "@/lib/useGameState";

export default function Home() {
  const game = useGameState();
  return (
    <main className="shell">
      <Header />
      <StatPanels game={game} />
      <PuzzlePanel game={game} />
      <div className="grid-2 info">
        <HowItWorks />
        <TokenInfo />
      </div>
      <PastRounds game={game} />
      <Footer />
    </main>
  );
}
