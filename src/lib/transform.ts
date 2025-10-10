import { MatchRow, Kpis } from "./types";

const pct = (num: number, den: number) =>
  den > 0 ? Math.round((num / den) * 1000) / 10 : 0;

export function sanitize(rows: MatchRow[]): MatchRow[] {
  // ensure required numeric fields are numbers
  return rows
    .filter((r) => r.date && r.first_serves_attempted !== undefined)
    .map((r) => ({
      ...r,
      first_serves_made: Number(r.first_serves_made || 0),
      first_serves_attempted: Number(r.first_serves_attempted || 0),
      first_serve_points_won: Number(r.first_serve_points_won || 0),
      first_serve_points_total: Number(r.first_serve_points_total || 0),
      second_serve_points_won: Number(r.second_serve_points_won || 0),
      second_serve_points_total: Number(r.second_serve_points_total || 0),
      aces: Number(r.aces || 0),
      double_faults: Number(r.double_faults || 0),
      break_points_won: Number(r.break_points_won || 0),
      break_points_total: Number(r.break_points_total || 0),
      return_points_won: Number(r.return_points_won || 0),
      return_points_total: Number(r.return_points_total || 0),
      winners: Number(r.winners || 0),
      unforced_errors: Number(r.unforced_errors || 0),
    }));
}

export function kpis(rows: MatchRow[]): Kpis {
  const sum = (f: (r: MatchRow) => number) =>
    rows.reduce((a, r) => a + (f(r) || 0), 0);

  const fsPct = pct(
    sum((r) => r.first_serves_made),
    sum((r) => r.first_serves_attempted)
  );
  const fsWon = pct(
    sum((r) => r.first_serve_points_won),
    sum((r) => r.first_serve_points_total)
  );
  const ssWon = pct(
    sum((r) => r.second_serve_points_won),
    sum((r) => r.second_serve_points_total)
  );

  const bpDen = sum((r) => r.break_points_total || 0);
  const bpPct =
    bpDen > 0
      ? Math.round((sum((r) => r.break_points_won || 0) / bpDen) * 1000) / 10
      : null;

  const rpwDen = sum((r) => r.return_points_total || 0);
  const rpwPct =
    rpwDen > 0
      ? Math.round((sum((r) => r.return_points_won || 0) / rpwDen) * 1000) / 10
      : null;

  const w = sum((r) => (r.outcome?.toLowerCase() === "win" ? 1 : 0));
  const winRate = rows.length
    ? Math.round((w / rows.length) * 1000) / 10
    : null;

  const wueDen = sum((r) => r.unforced_errors || 0);
  const wueRat =
    wueDen > 0
      ? Math.round((sum((r) => r.winners || 0) / wueDen) * 100) / 100
      : null;

  return {
    firstServePct: fsPct,
    firstServePtsWonPct: fsWon,
    secondServePtsWonPct: ssWon,
    bpConversionPct: bpPct,
    returnPtsWonPct: rpwPct,
    wueRatio: wueRat,
    winRatePct: winRate,
  };
}

export function seriesFirstServePct(rows: MatchRow[]) {
  return rows
    .filter((r) => r.first_serves_attempted > 0)
    .map((r) => ({
      date: r.date,
      pct: pct(r.first_serves_made, r.first_serves_attempted),
    }));
}

export function seriesServePointsWon(rows: MatchRow[]) {
  return rows.map((r) => ({
    date: r.date,
    first: pct(r.first_serve_points_won, r.first_serve_points_total),
    second: pct(r.second_serve_points_won, r.second_serve_points_total),
  }));
}

export function seriesAcesDf(rows: MatchRow[]) {
  return rows.map((r) => ({
    date: r.date,
    aces: r.aces || 0,
    doubleFaults: r.double_faults || 0,
  }));
}

export function seriesWinnersUEs(rows: MatchRow[]) {
  return rows.map((r) => ({
    date: r.date,
    winners: r.winners || 0,
    ues: r.unforced_errors || 0,
  }));
}

export function seriesBpConv(rows: MatchRow[]) {
  return rows.map((r) => ({
    date: r.date,
    bpPct:
      r.break_points_total && r.break_points_total > 0
        ? Math.round(
            ((r.break_points_won || 0) / r.break_points_total) * 1000
          ) / 10
        : null,
  }));
}

export function seriesReturnPtsWon(rows: MatchRow[]) {
  return rows.map((r) => ({
    date: r.date,
    pct:
      r.return_points_total && r.return_points_total > 0
        ? Math.round(
            ((r.return_points_won || 0) / r.return_points_total) * 1000
          ) / 10
        : null,
  }));
}
