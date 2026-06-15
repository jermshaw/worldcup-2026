import type { Context } from '@netlify/functions';

const API_KEY = process.env.FOOTBALL_DATA_API_KEY ?? '';
const BASE = 'https://api.football-data.org/v4';

export default async function handler(req: Request, _ctx: Context) {
  const url = new URL(req.url);
  const id = url.searchParams.get('id');

  if (!id) {
    return new Response(JSON.stringify({ error: 'Missing id parameter' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!API_KEY) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const res = await fetch(`${BASE}/matches/${id}`, {
      headers: { 'X-Auth-Token': API_KEY },
    });

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: res.ok ? 200 : res.status,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=55',
      },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Failed to fetch match' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
