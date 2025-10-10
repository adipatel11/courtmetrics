import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { MatchRow } from "@/lib/types";
import {
  createMatchForUser,
  listMatchesForUser,
} from "@/lib/matchRepository";
import { readSessionToken, SESSION_COOKIE } from "@/lib/auth";

async function requireSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE)?.value;
  const session = sessionCookie ? readSessionToken(sessionCookie) : null;
  if (!session) {
    return null;
  }
  return session;
}

function toNumber(value: unknown) {
  const num = Number(value ?? 0);
  return Number.isFinite(num) ? num : 0;
}

function toOptionalNumber(value: unknown) {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
}

function parseMatchPayload(body: unknown): MatchRow | null {
  if (typeof body !== "object" || body === null) {
    return null;
  }

  const payload = body as Record<string, unknown>;
  const date = typeof payload.date === "string" ? payload.date : "";
  if (!date.trim()) return null;

  const match: MatchRow = {
    date,
    opponent: typeof payload.opponent === "string" ? payload.opponent : undefined,
    location: typeof payload.location === "string" ? payload.location : undefined,
    surface: typeof payload.surface === "string" ? payload.surface : undefined,
    match_format:
      typeof payload.match_format === "string" ? payload.match_format : undefined,
    outcome: typeof payload.outcome === "string" ? payload.outcome : undefined,
    sets_played: toOptionalNumber(payload.sets_played),
    sets_won: toOptionalNumber(payload.sets_won),
    games_won: toOptionalNumber(payload.games_won),
    games_lost: toOptionalNumber(payload.games_lost),
    first_serves_made: toNumber(payload.first_serves_made),
    first_serves_attempted: toNumber(payload.first_serves_attempted),
    aces: toOptionalNumber(payload.aces),
    double_faults: toOptionalNumber(payload.double_faults),
    first_serve_points_won: toNumber(payload.first_serve_points_won),
    first_serve_points_total: toNumber(payload.first_serve_points_total),
    second_serve_points_won: toNumber(payload.second_serve_points_won),
    second_serve_points_total: toNumber(payload.second_serve_points_total),
    break_points_won: toOptionalNumber(payload.break_points_won),
    break_points_total: toOptionalNumber(payload.break_points_total),
    return_points_won: toOptionalNumber(payload.return_points_won),
    return_points_total: toOptionalNumber(payload.return_points_total),
    winners: toOptionalNumber(payload.winners),
    unforced_errors: toOptionalNumber(payload.unforced_errors),
    net_points_won: toOptionalNumber(payload.net_points_won),
    net_points_total: toOptionalNumber(payload.net_points_total),
    avg_rally_length: toOptionalNumber(payload.avg_rally_length),
    notes: typeof payload.notes === "string" ? payload.notes : undefined,
  };

  return match;
}

export async function GET() {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const records = await listMatchesForUser(session.email);
    return NextResponse.json({
      matches: records.map((record) => ({
        matchId: record.matchId,
        match: record.match,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
      })),
    });
  } catch (err) {
    console.error("GET /api/matches failed", err);
    return NextResponse.json(
      { error: "Unable to load matches" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const match = parseMatchPayload(body);

  if (!match) {
    return NextResponse.json(
      { error: "Invalid match payload" },
      { status: 400 }
    );
  }

  try {
    const record = await createMatchForUser(session.email, match);
    return NextResponse.json(
      {
        matchId: record.matchId,
        match: record.match,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/matches failed", err);
    return NextResponse.json(
      { error: "Unable to save match" },
      { status: 500 }
    );
  }
}
