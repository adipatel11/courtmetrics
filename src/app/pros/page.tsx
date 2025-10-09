"use client";
import { useEffect, useMemo, useState } from "react";
import { parseCsvText } from "@/lib/csv";
import { Kpis } from "@/lib/types";
import KpiHeader from "@/components/KpiHeader";
import FirstServePct from "@/components/charts/FirstServePct";
import ServePointsWon from "@/components/charts/ServePointsWon";
import AcesVsDF from "@/components/charts/AcesVsDF";
import WinnersVsUEs from "@/components/charts/WinnersVsUEs";
import BPConversion from "@/components/charts/BPConversion";
import ReturnPtsWon from "@/components/charts/ReturnPtsWon";

/**
 * The pro CSV is aggregated by player/surface, so we adapt it into a per-row structure.
 * Columns expected:
 * player,surface,matches,first_serve_pct,first_serve_points_won_pct,second_serve_points_won_pct,
 * aces_per_match,double_faults_per_match,break_points_converted_pct,return_points_won_pct,
 * winners_per_match,unforced_errors_per_match,win_rate_pct
 */
type ProRow = {
  player: string;
  surface: string;
  matches: number;
  first_serve_pct: number;
  first_serve_points_won_pct: number;
  second_serve_points_won_pct: number;
  aces_per_match: number;
  double_faults_per_match: number;
  break_points_converted_pct: number;
  return_points_won_pct: number;
  winners_per_match: number;
  unforced_errors_per_match: number;
  win_rate_pct: number;
};

export default function ProsPage() {
  const [rows, setRows] = useState<ProRow[]>([]);
  const [player, setPlayer] = useState<string>("");

  useEffect(() => {
    (async () => {
      const res = await fetch("/sample/pro_players_sample.csv");
      const text = await res.text();
      const parsed = await parseCsvText(text);
      setRows(parsed as unknown as ProRow[]);
      if (parsed.length) setPlayer((parsed[0] as any).player);
    })();
  }, []);

  const options = Array.from(new Set(rows.map((r) => r.player)));

  const filtered = rows.filter((r) => r.player === player);

  // Adapt to chart series shapes (we'll fake "date" with surface labels)
  const firstServeSeries = filtered.map((r) => ({
    date: r.surface,
    pct: r.first_serve_pct,
  }));
  const servePtsSeries = filtered.map((r) => ({
    date: r.surface,
    first: r.first_serve_points_won_pct,
    second: r.second_serve_points_won_pct,
  }));
  const acesDfSeries = filtered.map((r) => ({
    date: r.surface,
    aces: r.aces_per_match,
    doubleFaults: r.double_faults_per_match,
  }));
  const wueSeries = filtered.map((r) => ({
    date: r.surface,
    winners: r.winners_per_match,
    ues: r.unforced_errors_per_match,
  }));
  const bpSeries = filtered.map((r) => ({
    date: r.surface,
    bpPct: r.break_points_converted_pct,
  }));
  const rpwSeries = filtered.map((r) => ({
    date: r.surface,
    pct: r.return_points_won_pct,
  }));

  const k: Kpis | null = useMemo(() => {
    if (!filtered.length) return null;
    // Average across surfaces
    const avg = (f: (r: ProRow) => number | null) => {
      const vals = filtered
        .map(f)
        .filter((x): x is number => x !== null && !Number.isNaN(x));
      return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
    };
    const ratio = (f1: (r: ProRow) => number, f2: (r: ProRow) => number) => {
      const a = avg(f1);
      const b = avg(f2);
      return a !== null && b !== null && b > 0
        ? Math.round((a / b) * 100) / 100
        : null;
    };
    return {
      firstServePct: avg((r) => r.first_serve_pct) ?? 0,
      firstServePtsWonPct: avg((r) => r.first_serve_points_won_pct) ?? 0,
      secondServePtsWonPct: avg((r) => r.second_serve_points_won_pct) ?? 0,
      bpConversionPct: avg((r) => r.break_points_converted_pct),
      returnPtsWonPct: avg((r) => r.return_points_won_pct),
      wueRatio: ratio(
        (r) => r.winners_per_match,
        (r) => r.unforced_errors_per_match
      ),
      winRatePct: avg((r) => r.win_rate_pct),
    };
  }, [filtered]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Pros</h1>

      <div className="rounded-2xl bg-neutral-900 p-4">
        <label className="text-sm text-neutral-300 mr-2">Player:</label>
        <select
          value={player}
          onChange={(e) => setPlayer(e.target.value)}
          className="bg-neutral-800 px-3 py-2 rounded-md"
        >
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </div>

      {k && <KpiHeader k={k} />}

      <FirstServePct data={firstServeSeries} />
      <ServePointsWon data={servePtsSeries} />
      <AcesVsDF data={acesDfSeries} />
      <WinnersVsUEs data={wueSeries} />
      <BPConversion data={bpSeries} />
      <ReturnPtsWon data={rpwSeries} />
    </div>
  );
}
