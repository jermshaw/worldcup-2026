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

export interface WcScore {
  home: number;
  away: number;
  timeElapsed: string;
}

interface WcMaps {
  venues: Record<string, string>;
  scores: Record<string, WcScore>;
}

interface WcGame {
  home_team_id: string;
  away_team_id: string;
  stadium_id: string;
  home_score: string;
  away_score: string;
  time_elapsed: string;
}

let resolvedVenues: Record<string, string> | null = null;
let resolvedScores: Record<string, WcScore> | null = null;
let cache: Promise<WcMaps> | null = null;

function fetchWcData(): Promise<WcMaps> {
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
      const venues: Record<string, string> = {};
      const scores: Record<string, WcScore> = {};
      for (const g of gamesData.games as WcGame[]) {
        const home = idToFifa.get(g.home_team_id);
        const away = idToFifa.get(g.away_team_id);
        if (!home || !away) continue;
        const city = STADIUM_CITY[g.stadium_id];
        if (city) venues[`${home}:${away}`] = city;
        if (g.time_elapsed && g.time_elapsed !== 'notstarted') {
          scores[`${home}:${away}`] = {
            home: parseInt(g.home_score) || 0,
            away: parseInt(g.away_score) || 0,
            timeElapsed: g.time_elapsed,
          };
        }
      }
      resolvedVenues = venues;
      resolvedScores = scores;
      return { venues, scores };
    })().catch(() => { cache = null; return { venues: {}, scores: {} }; });
  }
  return cache;
}

export function getVenueMap(): Promise<Record<string, string>> {
  return fetchWcData().then(d => d.venues);
}

export function getVenueMapSync(): Record<string, string> {
  return resolvedVenues ?? {};
}

export function getWcScoreMap(): Promise<Record<string, WcScore>> {
  // Always bust cache for scores so each poll gets fresh data
  cache = null;
  resolvedScores = null;
  resolvedVenues = null;
  return fetchWcData().then(d => d.scores);
}

export function getWcScoreMapSync(): Record<string, WcScore> {
  return resolvedScores ?? {};
}
