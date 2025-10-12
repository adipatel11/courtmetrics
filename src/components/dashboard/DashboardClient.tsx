"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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

type DashboardClientProps = {
  userEmail: string;
};

type StoredMatch = {
  matchId: string;
  match: MatchRow;
  createdAt: string;
};

type MatchFormState = {
  date: string;
  opponent: string;
  location: string;
  surface: string;
  match_format: string;
  outcome: string;
  first_serves_made: string;
  first_serves_attempted: string;
  first_serve_points_won: string;
  first_serve_points_total: string;
  second_serve_points_won: string;
  second_serve_points_total: string;
  aces: string;
  double_faults: string;
  break_points_won: string;
  break_points_total: string;
  return_points_won: string;
  return_points_total: string;
  winners: string;
  unforced_errors: string;
  notes: string;
};

const initialForm: MatchFormState = {
  date: "",
  opponent: "",
  location: "",
  surface: "Hard",
  match_format: "Best of 3",
  outcome: "Win",
  first_serves_made: "",
  first_serves_attempted: "",
  first_serve_points_won: "",
  first_serve_points_total: "",
  second_serve_points_won: "",
  second_serve_points_total: "",
  aces: "",
  double_faults: "",
  break_points_won: "",
  break_points_total: "",
  return_points_won: "",
  return_points_total: "",
  winners: "",
  unforced_errors: "",
  notes: "",
};

const toNonNegativeNumber = (value: string) => {
  if (!value.trim()) return null;
  const num = Number(value);
  if (!Number.isFinite(num) || num < 0) return null;
  return num;
};

const validateForm = (form: MatchFormState): string | null => {
  if (!form.date.trim()) {
    return "Please enter the match date.";
  }

  if (!form.first_serves_attempted.trim()) {
    return "Enter the number of first serves attempted.";
  }

  if (!form.first_serves_made.trim()) {
    return "Enter the number of first serves made.";
  }

  const attempts = toNonNegativeNumber(form.first_serves_attempted);
  const made = toNonNegativeNumber(form.first_serves_made);
  if (attempts === null || made === null) {
    return "Serve counts must be non-negative numbers.";
  }
  if (made > attempts) {
    return "First serves made cannot exceed attempts.";
  }

  const checkWonVsTotal = (
    wonValue: string,
    totalValue: string,
    label: string
  ) => {
    if (!wonValue.trim() || !totalValue.trim()) return null;
    const won = toNonNegativeNumber(wonValue);
    const total = toNonNegativeNumber(totalValue);
    if (won === null || total === null) {
      return `${label} must be non-negative numbers.`;
    }
    if (won > total) {
      return `${label} won cannot exceed total.`;
    }
    return null;
  };

  return (
    checkWonVsTotal(
      form.first_serve_points_won,
      form.first_serve_points_total,
      "1st serve points"
    ) ||
    checkWonVsTotal(
      form.second_serve_points_won,
      form.second_serve_points_total,
      "2nd serve points"
    ) ||
    checkWonVsTotal(
      form.break_points_won,
      form.break_points_total,
      "Break points"
    ) ||
    checkWonVsTotal(
      form.return_points_won,
      form.return_points_total,
      "Return points"
    )
  );
};

const numberFromInput = (value: string) => {
  if (!value.trim()) return 0;
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const optionalNumberFromInput = (value: string) => {
  if (!value.trim()) return undefined;
  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
};

export default function DashboardClient({ userEmail }: DashboardClientProps) {
  const router = useRouter();
  const [matches, setMatches] = useState<StoredMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState<MatchFormState>(initialForm);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const loadMatches = useCallback(async () => {
    try {
      const res = await fetch("/api/matches", {
        credentials: "include",
        cache: "no-store",
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload?.error || "Unable to load matches");
      }
      const payload = (await res.json()) as {
        matches: Array<{ matchId: string; match: MatchRow; createdAt: string }>;
      };
      setMatches(
        payload.matches.slice().sort((a, b) => {
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        })
      );
    } catch (err) {
      console.error("Failed to load matches", err);
      setError(err instanceof Error ? err.message : "Failed to load matches");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  const handleFieldChange = (field: keyof MatchFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    const validationError = validateForm(form);
    if (validationError) {
      setError(validationError);
      setSaving(false);
      return;
    }

    const body = {
      date: form.date,
      opponent: form.opponent,
      location: form.location,
      surface: form.surface,
      match_format: form.match_format,
      outcome: form.outcome,
      first_serves_made: numberFromInput(form.first_serves_made),
      first_serves_attempted: numberFromInput(form.first_serves_attempted),
      first_serve_points_won: numberFromInput(form.first_serve_points_won),
      first_serve_points_total: numberFromInput(form.first_serve_points_total),
      second_serve_points_won: numberFromInput(form.second_serve_points_won),
      second_serve_points_total: numberFromInput(form.second_serve_points_total),
      aces: optionalNumberFromInput(form.aces),
      double_faults: optionalNumberFromInput(form.double_faults),
      break_points_won: optionalNumberFromInput(form.break_points_won),
      break_points_total: optionalNumberFromInput(form.break_points_total),
      return_points_won: optionalNumberFromInput(form.return_points_won),
      return_points_total: optionalNumberFromInput(form.return_points_total),
      winners: optionalNumberFromInput(form.winners),
      unforced_errors: optionalNumberFromInput(form.unforced_errors),
      notes: form.notes,
    };

    try {
      const res = await fetch("/api/matches", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload?.error || "Unable to save match");
      }

      const payload = (await res.json()) as StoredMatch;
      const sanitizedMatch = sanitize([payload.match])[0] ?? payload.match;
      setMatches((prev) =>
        [...prev, { ...payload, match: sanitizedMatch }].sort((a, b) => {
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        })
      );
      setForm((prev) => ({
        ...initialForm,
        surface: prev.surface || initialForm.surface,
        match_format: prev.match_format || initialForm.match_format,
        outcome: prev.outcome || initialForm.outcome,
      }));
      setSuccess("Match saved and analytics updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save match");
    } finally {
      setSaving(false);
    }
  };

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

  const matchRows = useMemo(
    () => matches.map((m) => m.match),
    [matches]
  );
  const clean = useMemo(() => sanitize(matchRows), [matchRows]);
  const metrics = useMemo(() => (clean.length ? kpis(clean) : null), [clean]);

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-neutral-400">Signed in as {userEmail}</p>
          <h1 className="text-3xl font-semibold">CourtMetrics</h1>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="rounded-lg bg-neutral-800 px-4 py-2 text-sm font-medium transition-colors hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loggingOut ? "Signing out…" : "Log out"}
        </button>
      </header>

      <section className="rounded-2xl bg-neutral-900 p-6 shadow-lg">
        <h2 className="text-lg font-semibold">Add match</h2>
        <p className="mb-4 text-sm text-neutral-400">
          Enter the key stats from your latest match. Stats are saved securely to
          your account and update the charts below immediately.
        </p>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-neutral-300">Match date</span>
              <input
                type="date"
                value={form.date}
                onChange={(event) => handleFieldChange("date", event.target.value)}
                className="rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-neutral-300">Opponent</span>
              <input
                type="text"
                value={form.opponent}
                onChange={(event) =>
                  handleFieldChange("opponent", event.target.value)
                }
                className="rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
                placeholder="Name or team"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-neutral-300">Location</span>
              <input
                type="text"
                value={form.location}
                onChange={(event) =>
                  handleFieldChange("location", event.target.value)
                }
                className="rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
                placeholder="Tournament / club"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-neutral-300">Surface</span>
              <select
                value={form.surface}
                onChange={(event) => handleFieldChange("surface", event.target.value)}
                className="rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
              >
                <option value="Hard">Hard</option>
                <option value="Clay">Clay</option>
                <option value="Grass">Grass</option>
                <option value="Carpet">Carpet</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-neutral-300">Format</span>
              <input
                type="text"
                value={form.match_format}
                onChange={(event) =>
                  handleFieldChange("match_format", event.target.value)
                }
                className="rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
                placeholder="Best of 3 / USTA / etc."
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-neutral-300">Outcome</span>
              <select
                value={form.outcome}
                onChange={(event) =>
                  handleFieldChange("outcome", event.target.value)
                }
                className="rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
              >
                <option value="Win">Win</option>
                <option value="Loss">Loss</option>
              </select>
            </label>
          </div>

          <div className="rounded-xl border border-neutral-800 p-4">
            <h3 className="text-sm font-semibold text-neutral-200">Serve stats</h3>
            <div className="mt-3 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatInput
                label="First serves made"
                value={form.first_serves_made}
                onChange={(value) => handleFieldChange("first_serves_made", value)}
              />
              <StatInput
                label="First serves attempted"
                value={form.first_serves_attempted}
                onChange={(value) =>
                  handleFieldChange("first_serves_attempted", value)
                }
              />
              <StatInput
                label="1st serve points won"
                value={form.first_serve_points_won}
                onChange={(value) =>
                  handleFieldChange("first_serve_points_won", value)
                }
              />
              <StatInput
                label="1st serve points total"
                value={form.first_serve_points_total}
                onChange={(value) =>
                  handleFieldChange("first_serve_points_total", value)
                }
              />
              <StatInput
                label="2nd serve points won"
                value={form.second_serve_points_won}
                onChange={(value) =>
                  handleFieldChange("second_serve_points_won", value)
                }
              />
              <StatInput
                label="2nd serve points total"
                value={form.second_serve_points_total}
                onChange={(value) =>
                  handleFieldChange("second_serve_points_total", value)
                }
              />
              <StatInput
                label="Aces"
                value={form.aces}
                onChange={(value) => handleFieldChange("aces", value)}
              />
              <StatInput
                label="Double faults"
                value={form.double_faults}
                onChange={(value) => handleFieldChange("double_faults", value)}
              />
            </div>
          </div>

          <div className="rounded-xl border border-neutral-800 p-4">
            <h3 className="text-sm font-semibold text-neutral-200">
              Pressure & return points
            </h3>
            <div className="mt-3 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatInput
                label="Break points won"
                value={form.break_points_won}
                onChange={(value) => handleFieldChange("break_points_won", value)}
              />
              <StatInput
                label="Break points total"
                value={form.break_points_total}
                onChange={(value) => handleFieldChange("break_points_total", value)}
              />
              <StatInput
                label="Return points won"
                value={form.return_points_won}
                onChange={(value) => handleFieldChange("return_points_won", value)}
              />
              <StatInput
                label="Return points total"
                value={form.return_points_total}
                onChange={(value) =>
                  handleFieldChange("return_points_total", value)
                }
              />
            </div>
          </div>

          <div className="rounded-xl border border-neutral-800 p-4">
            <h3 className="text-sm font-semibold text-neutral-200">Aggression</h3>
            <div className="mt-3 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatInput
                label="Winners"
                value={form.winners}
                onChange={(value) => handleFieldChange("winners", value)}
              />
              <StatInput
                label="Unforced errors"
                value={form.unforced_errors}
                onChange={(value) =>
                  handleFieldChange("unforced_errors", value)
                }
              />
            </div>
          </div>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-neutral-300">Notes</span>
            <textarea
              value={form.notes}
              onChange={(event) => handleFieldChange("notes", event.target.value)}
              className="min-h-[80px] rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
              placeholder="Key takeaways, tactics, reminders"
            />
          </label>

          {error && <p className="text-sm text-red-400">{error}</p>}
          {success && <p className="text-sm text-teal-400">{success}</p>}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-teal-500 px-4 py-2 text-sm font-semibold text-neutral-950 transition-colors hover:bg-teal-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save match"}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl bg-neutral-900 p-6 shadow-lg">
        <h2 className="text-lg font-semibold">Match history</h2>
        {loading ? (
          <p className="mt-3 text-sm text-neutral-400">Loading recent matches…</p>
        ) : !matches.length ? (
          <p className="mt-3 text-sm text-neutral-400">
            No matches yet. Add your first match to unlock the analytics.
          </p>
        ) : (
          <ul className="mt-4 space-y-3 text-sm">
            {matches
              .slice()
              .reverse()
              .map((item) => (
                <li
                  key={item.matchId}
                  className="flex flex-wrap items-baseline justify-between gap-2 rounded-xl border border-neutral-800 px-4 py-3"
                >
                  <div className="space-y-1">
                    <p className="text-neutral-200">
                      {item.match.date}{" "}
                      {item.match.opponent ? `vs ${item.match.opponent}` : ""}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {item.match.outcome || "Result unavailable"}
                    </p>
                  </div>
                  <p className="text-xs text-neutral-500">
                    Saved {new Date(item.createdAt).toLocaleString()}
                  </p>
                </li>
              ))}
          </ul>
        )}
      </section>

      {clean.length ? (
        <>
          {metrics && <KpiHeader k={metrics} />}

          <FirstServePct data={seriesFirstServePct(clean)} />
          <ServePointsWon data={seriesServePointsWon(clean)} />
          <AcesVsDF data={seriesAcesDf(clean)} />
          <WinnersVsUEs data={seriesWinnersUEs(clean)} />
          <BPConversion data={seriesBpConv(clean)} />
          <ReturnPtsWon data={seriesReturnPtsWon(clean)} />
        </>
      ) : (
        <p className="rounded-2xl border border-dashed border-neutral-800 p-6 text-sm text-neutral-400">
          Add match stats to power your personalized charts.
        </p>
      )}
    </div>
  );
}

type StatInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
};

function StatInput({ label, value, onChange, required }: StatInputProps) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-neutral-300">{label}</span>
      <input
        type="number"
        inputMode="numeric"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
        min={0}
        step="1"
        required={required}
      />
    </label>
  );
}
