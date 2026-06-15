import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import type { Plugin, Connect } from 'vite';
import type { ServerResponse } from 'http';

function scoresDevProxy(apiKey: string): Plugin {
  return {
    name: 'scores-dev-proxy',
    configureServer(server) {
      server.middlewares.use(
        '/.netlify/functions/scores',
        async (_req: Connect.IncomingMessage, res: ServerResponse) => {
          try {
            const fdRes = await fetch(
              `https://api.football-data.org/v4/competitions/WC/matches?season=2026`,
              { headers: { 'X-Auth-Token': apiKey } }
            );
            if (!fdRes.ok) {
              res.statusCode = fdRes.status;
              res.end(JSON.stringify({ error: 'Upstream error' }));
              return;
            }
            const data = await fdRes.json();
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Cache-Control', 'public, max-age=55');
            res.end(JSON.stringify(data));
          } catch {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Failed to fetch scores' }));
          }
        }
      );
    },
  };
}

function squadsDevProxy(apiKey: string): Plugin {
  return {
    name: 'squads-dev-proxy',
    configureServer(server) {
      server.middlewares.use(
        '/.netlify/functions/squads',
        async (_req: Connect.IncomingMessage, res: ServerResponse) => {
          try {
            const fdRes = await fetch(
              `https://api.football-data.org/v4/competitions/WC/teams?season=2026`,
              { headers: { 'X-Auth-Token': apiKey } }
            );
            if (!fdRes.ok) { res.statusCode = 502; res.end(JSON.stringify({ error: 'Upstream error' })); return; }
            const data = await fdRes.json();
            const byTla: Record<string, unknown> = {};
            for (const team of data.teams ?? []) {
              byTla[team.tla] = {
                coach: team.coach?.name ?? null,
                squad: (team.squad ?? []).map((p: { id: number; name: string; position: string | null; dateOfBirth: string | null }) => ({
                  id: p.id, name: p.name, position: p.position, dateOfBirth: p.dateOfBirth,
                })),
              };
            }
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Cache-Control', 'public, max-age=3600');
            res.end(JSON.stringify(byTla));
          } catch {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Failed to fetch squads' }));
          }
        }
      );
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiKey = env.FOOTBALL_DATA_API_KEY ?? '';
  return {
    plugins: [react(), scoresDevProxy(apiKey), squadsDevProxy(apiKey)],
  };
});
