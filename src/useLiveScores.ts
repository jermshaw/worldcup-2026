import { useState, useEffect, useCallback } from 'react';
import type { Match } from './data';

// Maps football-data.org 3-letter codes → our team IDs
const TLA_TO_ID: Record<string, string> = {
  USA: 'usa', MEX: 'mex', URU: 'uri', PAN: 'pan',
  ARG: 'arg', CAN: 'can', CHI: 'chi', ALB: 'alb',
  BRA: 'bra', GER: 'ger', JPN: 'jap', SLE: 'sle',
  FRA: 'fra', MAR: 'mor', CRO: 'cro', BEL: 'bel',
  ESP: 'spa', NED: 'ned', SEN: 'sen', SRB: 'srb',
  ENG: 'eng', POR: 'por', COL: 'col', THA: 'tha',
  ITA: 'ita', NGA: 'nga', KOR: 'kor',
  POL: 'pol', ECU: 'ecu', EGY: 'egy',
  DEN: 'den', AUS: 'aus', PER: 'per', TUN: 'tun',
  UKR: 'ukr', IRN: 'irn', NZL: 'nzl',
  SUI: 'swi', TUR: 'tur', CMR: 'cmr', KSA: 'ksa',
  VEN: 'ven', GHA: 'gha',
};

interface ApiMatch {
  id: number;
  utcDate: string;
  status: string;
  stage: string;
  group: string | null;
  matchday: number | null;
  homeTeam: { tla: string };
  awayTeam: { tla: string };
  score: {
    fullTime: { home: number | null; away: number | null };
  };
}

function mapApiMatch(apiMatch: ApiMatch): Partial<Match> & { homeTeamTla: string; awayTeamTla: string } {
  const date = new Date(apiMatch.utcDate);
  const dateStr = date.toISOString().split('T')[0];
  const timeStr = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'America/New_York',
  });

  const finished = apiMatch.status === 'FINISHED';

  return {
    homeTeamTla: apiMatch.homeTeam.tla,
    awayTeamTla: apiMatch.awayTeam.tla,
    date: dateStr,
    time: timeStr,
    homeScore: finished ? (apiMatch.score.fullTime.home ?? null) : null,
    awayScore: finished ? (apiMatch.score.fullTime.away ?? null) : null,
  };
}

export type LiveStatus = 'idle' | 'loading' | 'live' | 'error';

export function useLiveScores(
  matches: Match[],
  onUpdate: (updated: Match[]) => void
) {
  const [status, setStatus] = useState<LiveStatus>('idle');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchScores = useCallback(async () => {
    setStatus('loading');
    try {
      const res = await fetch('/.netlify/functions/scores');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (!data.matches) throw new Error('Unexpected API response');

      const updated = matches.map(m => {
        const apiMatch = (data.matches as ApiMatch[]).find(a => {
          const homeId = TLA_TO_ID[a.homeTeam.tla];
          const awayId = TLA_TO_ID[a.awayTeam.tla];
          return homeId === m.homeTeamId && awayId === m.awayTeamId;
        });

        if (!apiMatch) return m;
        const mapped = mapApiMatch(apiMatch);
        return {
          ...m,
          homeScore: mapped.homeScore ?? m.homeScore,
          awayScore: mapped.awayScore ?? m.awayScore,
        };
      });

      onUpdate(updated);
      setStatus('live');
      setLastUpdated(new Date());
    } catch {
      setStatus('error');
    }
  }, [matches, onUpdate]);

  // Fetch on mount, then every 60s
  useEffect(() => {
    fetchScores();
    const interval = setInterval(fetchScores, 60_000);
    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { status, lastUpdated, refresh: fetchScores };
}
