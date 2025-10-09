"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { parseCsv } from "@/lib/csv";
import {
  sanitize,
  kpis,
  seriesFirstServePct,
  seriesServePointsWon,
  seriesAcesDf,
  seriesWinnersUEs,
  seriesBpConv,
  seriesReturnPtsWon,
} from "@/lib/transform";
import KpiHeader from "@/components/KpiHeader";
import FirstServePct from "@/components/charts/FirstServePct";
import ServePointsWon from "@/components/charts/ServePointsWon";
import AcesVsDF from "@/components/charts/AcesVsDF";
import WinnersVsUEs from "@/components/charts/WinnersVsUEs";
import BPConversion from "@/components/charts/BPConversion";
import ReturnPtsWon from "@/components/charts/ReturnPtsWon";

const STORAGE_KEY = "tsv-upload-rows";

export default function Home() {
  const [rows, setRows] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setRows(parsed);
        }
      }
    } catch (err) {
      console.error("Failed to restore rows from storage", err);
    }
  }, []);

  useEffect(() => {
    if (!rows.length) {
      sessionStorage.removeItem(STORAGE_KEY);
      return;
    }
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
    } catch (err) {
      console.error("Failed to persist rows to storage", err);
    }
  }, [rows]);

  const clean = useMemo(() => sanitize(rows as any[]), [rows]);
  const metrics = useMemo(() => (clean.length ? kpis(clean) : null), [clean]);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Tennis Stats Visualizer</h1>
        <Link href="/pros" className="underline underline-offset-4">
          Pros ↗
        </Link>
      </header>

      <div className="rounded-2xl bg-neutral-900 p-4">
        <p className="mb-3 text-sm text-neutral-300">
          Upload your CSV (use the template you downloaded). You can try the
          bundled sample:
          <code className="ml-2 text-neutral-100">
            /sample/tennis_stats_sample.csv
          </code>
        </p>
        <input
          type="file"
          accept=".csv"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            try {
              setError(null);
              const parsed = await parseCsv(file);
              setRows(parsed);
            } catch (err: any) {
              setError(err?.message || "Failed to parse CSV");
            }
          }}
          className="block w-full text-sm text-neutral-100 file:mr-4 file:rounded-md file:border-0 file:bg-neutral-800 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-neutral-100 file:transition-colors file:cursor-pointer hover:file:bg-neutral-700"
        />
        {error && <div className="mt-2 text-red-400 text-sm">{error}</div>}
      </div>

      {!clean.length ? (
        <div className="text-neutral-400 text-sm">
          No data yet — upload a CSV to see charts.
        </div>
      ) : (
        <>
          {metrics && <KpiHeader k={metrics} />}

          <FirstServePct data={seriesFirstServePct(clean)} />
          <ServePointsWon data={seriesServePointsWon(clean)} />
          <AcesVsDF data={seriesAcesDf(clean)} />
          <WinnersVsUEs data={seriesWinnersUEs(clean)} />
          <BPConversion data={seriesBpConv(clean)} />
          <ReturnPtsWon data={seriesReturnPtsWon(clean)} />
        </>
      )}
    </div>
  );
}
