const STADIUM_CITY: Record<string, string> = {
  '1': 'Mexico City',
  '2': 'Guadalajara',
  '3': 'Monterrey',
  '4': 'Dallas',
  '5': 'Houston',
  '6': 'Kansas City',
  '7': 'Atlanta',
  '8': 'Miami',
  '9': 'Boston',
  '10': 'Philadelphia',
  '11': 'New York',
  '12': 'Toronto',
  '13': 'Vancouver',
  '14': 'Seattle',
  '15': 'Santa Clara',
  '16': 'Los Angeles',
};

let resolvedMap: Record<string, string> | null = null;
let cache: Promise<Record<string, string>> | null = null;

export function getVenueMap(): Promise<Record<string, string>> {
  if (!cache) {
    cache = (async () => {
      const [gamesRes, teamsRes] = await Promise.all([
        fetch('https://worldcup26.ir/get/games'),
        fetch('https://worldcup26.ir/get/teams'),
      ]);
      if (!gamesRes.ok || !teamsRes.ok) throw new Error('fetch failed');
      const [gamesData, teamsData] = await Promise.all([gamesRes.json(), teamsRes.json()]);
      const idToFifa = new Map<string, string>(
        (teamsData.teams as { id: string; fifa_code: string }[]).map(t => [t.id, t.fifa_code])
      );
      const map: Record<string, string> = {};
      for (const g of gamesData.games as { home_team_id: string; away_team_id: string; stadium_id: string }[]) {
        const home = idToFifa.get(g.home_team_id);
        const away = idToFifa.get(g.away_team_id);
        const city = STADIUM_CITY[g.stadium_id];
        if (home && away && city) map[`${home}:${away}`] = city;
      }
      resolvedMap = map;
      return map;
    })().catch(() => { cache = null; return {}; });
  }
  return cache;
}

export function getVenueMapSync(): Record<string, string> {
  return resolvedMap ?? {};
}
