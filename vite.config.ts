import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/.netlify/functions/scores': {
          target: 'https://api.football-data.org',
          changeOrigin: true,
          rewrite: () => '/v4/competitions/WC/matches?season=2026',
          headers: {
            'X-Auth-Token': env.FOOTBALL_DATA_API_KEY ?? '',
          },
        },
      },
    },
  };
});
