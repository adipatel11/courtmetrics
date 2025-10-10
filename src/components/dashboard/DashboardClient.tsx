"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { MatchRow } from "@/lib/types";

const STORAGE_KEY = "tsv-upload-rows";

type DashboardClientProps = {
  userEmail: string;
};

const isMatchRowArray = (value: unknown): value is MatchRow[] =>
  Array.isArray(value) &&
  value.every(
    (item) =>
      item !== null &&
      typeof item === "object" &&
      "first_serves_attempted" in item &&
      "first_serves_made" in item
  );

export default function DashboardClient({ userEmail }: DashboardClientProps) {
  const router = useRouter();
  const [rows, setRows] = useState<MatchRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (isMatchRowArray(parsed)) {
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

  const clean = useMemo(() => sanitize(rows), [rows]);
  const metrics = useMemo(() => (clean.length ? kpis(clean) : null), [clean]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Failed to log out", err);
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-neutral-400">Signed in as {userEmail}</p>
          <h1 className="text-3xl font-semibold">Tennis Stats Visualizer</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="rounded-lg bg-neutral-800 px-4 py-2 text-sm font-medium hover:bg-neutral-700 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loggingOut ? "Signing out…" : "Log out"}
          </button>
          <Link
            href="/pros"
            className="text-sm underline underline-offset-4 hover:text-neutral-200"
          >
            Pros ↗
          </Link>
        </div>
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
            } catch (err) {
              if (err instanceof Error) {
                setError(err.message);
              } else {
                setError("Failed to parse CSV");
              }
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
