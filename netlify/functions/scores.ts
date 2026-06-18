import type { Context } from '@netlify/functions';

const API_KEY = process.env.FOOTBALL_DATA_API_KEY ?? '';
const FD_BASE = 'https://api.football-data.org/v4';

export default async function handler(_req: Request, _ctx: Context) {
  if (!API_KEY) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const res = await fetch(`${FD_BASE}/competitions/WC/matches?season=2026`, {
    headers: { 'X-Auth-Token': API_KEY },
  });

  if (!res.ok) {
    return new Response(JSON.stringify({ error: `Upstream error: ${res.status}` }), {
      status: res.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const data = await res.json();
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=25',
    },
  });
}
