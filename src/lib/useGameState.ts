"use client";
import { useCallback, useEffect, useState } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { CONFIG } from "@/config";
import {
  fetchConfig, fetchRound, getProgram, isProgramDeployed, pda, spendableSol,
  type ConfigView, type RoundView,
} from "@/lib/program";

export type Mode = "loading" | "onchain" | "fallback";

export interface GameState {
  mode: Mode;
  programDeployed: boolean | null;
  config: ConfigView | null;
  /** Latest round (open, solved or cancelled), if any. */
  round: RoundView | null;
  vaultSol: number | null;
  holderPoolSol: number | null;
  /** Countdown target in ms. */
  targetMs: number;
  error: string | null;
  lastUpdated: number | null;
  refresh: () => void;
}

export function useGameState(): GameState {
  const { connection } = useConnection();
  const [s, setS] = useState<Omit<GameState, "refresh">>({
    mode: "loading", programDeployed: null, config: null, round: null, vaultSol: null,
    holderPoolSol: null, targetMs: CONFIG.fallbackCountdownTargetMs, error: null, lastUpdated: null,
  });
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let errMsg: string | null = null;
      try {
        const deployed = await isProgramDeployed(connection).catch(() => false);
        if (deployed) {
          const program = getProgram(connection);
          const config = await fetchConfig(program);
          if (config) {
            const round = config.roundCount > 0 ? await fetchRound(program, config.roundCount - 1) : null;
            const [vaultSol, holderPoolSol] = await Promise.all([
              spendableSol(connection, pda.vault()),
              spendableSol(connection, pda.holderPool()),
            ]);
            const live = round && (round.status === "open" || round.status === "revealing");
            const target = live ? round!.unlockTs * 1000 : CONFIG.fallbackCountdownTargetMs;
            if (!cancelled)
              setS({ mode: "onchain", programDeployed: true, config, round, vaultSol, holderPoolSol,
                targetMs: target, error: null, lastUpdated: Date.now() });
            return;
          }
        }
        // Fallback: program not deployed / not initialized -> there is no vault yet, show no balance.
        if (!cancelled)
          setS({ mode: "fallback", programDeployed: deployed, config: null, round: null,
            vaultSol: null, holderPoolSol: null,
            targetMs: CONFIG.fallbackCountdownTargetMs, error: null, lastUpdated: Date.now() });
        return;
      } catch (e) {
        errMsg = e instanceof Error ? e.message : String(e);
      }
      if (!cancelled)
        setS((p) => ({ ...p, mode: p.mode === "loading" ? "fallback" : p.mode, error: errMsg }));
    })();
    const id = setTimeout(() => setTick((t) => t + 1), CONFIG.pollMs);
    return () => { cancelled = true; clearTimeout(id); };
  }, [connection, tick]);

  return { ...s, refresh };
}

export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

/** Current confirmed slot, polled while `enabled`. */
export function useSlot(enabled: boolean, intervalMs = 2000) {
  const { connection } = useConnection();
  const [slot, setSlot] = useState<number | null>(null);
  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    const poll = () => connection.getSlot("confirmed").then((s) => alive && setSlot(s)).catch(() => {});
    poll();
    const id = setInterval(poll, intervalMs);
    return () => { alive = false; clearInterval(id); };
  }, [enabled, connection, intervalMs]);
  return slot;
}
