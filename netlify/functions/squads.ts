import type { Context } from '@netlify/functions';

const API_KEY = process.env.FOOTBALL_DATA_API_KEY ?? '';
const BASE = 'https://api.football-data.org/v4';

export default async function handler(_req: Request, _ctx: Context) {
  if (!API_KEY) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const res = await fetch(`${BASE}/competitions/WC/teams?season=2026`, {
      headers: { 'X-Auth-Token': API_KEY },
    });

    if (!res.ok) {
      return new Response(JSON.stringify({ error: 'Upstream error' }), {
        status: res.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await res.json();
    // Re-key by TLA for easy lookup
    const byTla: Record<string, { coach: string | null; squad: { id: number; name: string; position: string | null; dateOfBirth: string | null }[] }> = {};
    for (const team of data.teams ?? []) {
      byTla[team.tla] = {
        coach: team.coach?.name ?? null,
        squad: (team.squad ?? []).map((p: { id: number; name: string; position: string | null; dateOfBirth: string | null }) => ({
          id: p.id,
          name: p.name,
          position: p.position,
          dateOfBirth: p.dateOfBirth,
        })),
      };
    }

    return new Response(JSON.stringify(byTla), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Failed to fetch squads' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
