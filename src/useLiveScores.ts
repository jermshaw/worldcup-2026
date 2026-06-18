import { useState, useEffect, useCallback, useRef } from 'react';
import type { Match, Team } from './data';
import { buildFromApi } from './data';
import type { ApiResponse } from './api';

export type LiveStatus = 'loading' | 'live' | 'error';

const CACHE_KEY = 'wc2026_scores_v2';

function readCache(): { matches: Match[]; teams: Map<string, Team> } | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { data } = JSON.parse(raw) as { data: ApiResponse; ts: number };
    return buildFromApi(data);
  } catch {
    return null;
  }
}

function writeCache(data: ApiResponse) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() }));
  } catch { /* quota exceeded, ignore */ }
}

const initialCache = readCache();

export function useLiveScores() {
  const [matches, setMatches] = useState<Match[]>(initialCache?.matches ?? []);
  const [teams, setTeams] = useState<Map<string, Team>>(initialCache?.teams ?? new Map());
  const [status, setStatus] = useState<LiveStatus>(initialCache ? 'live' : 'loading');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const matchesRef = useRef<Match[]>(initialCache?.matches ?? []);

  const fetchScores = useCallback(async () => {
    try {
      const res = await fetch('/.netlify/functions/scores');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: ApiResponse = await res.json();
      if (!data.matches) throw new Error('No matches in response');

      writeCache(data);
      const { matches: newMatches, teams: newTeams } = buildFromApi(data);

      // On subsequent fetches, preserve any scores not yet updated
      if (matchesRef.current.length > 0) {
        const prevById = new Map(matchesRef.current.map(m => [m.apiId, m]));
        for (const m of newMatches) {
          const prev = prevById.get(m.apiId);
          if (prev && m.homeScore === null && prev.homeScore !== null) {
            m.homeScore = prev.homeScore;
            m.awayScore = prev.awayScore;
          }
        }
      }

      matchesRef.current = newMatches;
      setMatches(newMatches);
      setTeams(newTeams);
      setStatus('live');
      setLastUpdated(new Date());
    } catch {
      setStatus(prev => prev === 'loading' ? 'error' : prev);
    }
  }, []);

  useEffect(() => {
    fetchScores();
    const interval = setInterval(fetchScores, 30_000);
    return () => clearInterval(interval);
  }, [fetchScores]);

  function updateScore(matchId: string, home: number | null, away: number | null) {
    setMatches(prev => {
      const updated = prev.map(m =>
        m.id === matchId ? { ...m, homeScore: home, awayScore: away } : m
      );
      matchesRef.current = updated;
      return updated;
    });
  }

  return { matches, teams, status, lastUpdated, refresh: fetchScores, updateScore };
}
