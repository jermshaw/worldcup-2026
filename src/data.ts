import type { ApiResponse } from './api';
import { FLAG_MAP, CONF_MAP } from './api';

export type Group = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L';

export interface Team {
  id: string; // TLA e.g. "USA"
  name: string;
  flag: string;
  crest?: string; // fallback image URL when flag emoji is unsupported
  group: Group;
  confederation: string;
}

export interface Match {
  id: string;
  apiId: number;
  stage: string;
  group?: Group;
  matchday?: number;
  matchNumber?: number;
  date: string;
  time: string;
  utcDate: string;
  homeTeamId: string;
  awayTeamId: string;
  venue: string;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
  timeElapsed?: string;
}

export function isLive(m: Match): boolean {
  if (m.status !== 'IN_PLAY' && m.status !== 'PAUSED') return false;
  // Guard against stuck API status — no match runs longer than 3 hours
  const minsSinceKickoff = (Date.now() - new Date(m.utcDate).getTime()) / 60_000;
  return minsSinceKickoff < 180;
}

export interface StandingRow {
  teamId: string;
  mp: number;
  w: number;
  d: number;
  l: number;
  gf: number;
  ga: number;
  gd: number;
  pts: number;
}

export const GROUPS: Group[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

function parseGroup(raw: string | null): Group | undefined {
  if (!raw) return undefined;
  // API returns "GROUP_A", "GROUP_B", etc.
  const letter = raw.replace('GROUP_', '');
  if (GROUPS.includes(letter as Group)) return letter as Group;
  return undefined;
}

function parseStage(raw: string): string {
  const map: Record<string, string> = {
    GROUP_STAGE: 'Group Stage',
    ROUND_OF_32: 'Round of 32',
    LAST_32: 'Round of 32',
    LAST_16: 'Round of 16',
    QUARTER_FINALS: 'Quarter-final',
    SEMI_FINALS: 'Semi-final',
    THIRD_PLACE: 'Third Place',
    FINAL: 'Final',
  };
  return map[raw] ?? raw;
}

function computeTimeElapsed(status: string, minute: number | null, injuryTime: number | null): string | undefined {
  if (status === 'PAUSED') return 'HT';
  if (status === 'FINISHED') return 'FT';
  if (status === 'IN_PLAY' && minute !== null) {
    return injuryTime ? `${minute}+${injuryTime}` : String(minute);
  }
  return undefined;
}

export function buildFromApi(data: ApiResponse): { matches: Match[]; teams: Map<string, Team> } {
  const teamMap = new Map<string, Team>();
  const matches: Match[] = [];

  for (const m of data.matches) {
    if (!m.utcDate) continue;

    const homeTla = m.homeTeam?.tla ?? null;
    const awayTla = m.awayTeam?.tla ?? null;
    const group = parseGroup(m.group);

    // Register teams only when TLA is known
    for (const apiTeam of [m.homeTeam, m.awayTeam]) {
      if (apiTeam?.tla && !teamMap.has(apiTeam.tla) && group) {
        const hasEmoji = !!FLAG_MAP[apiTeam.tla];
        teamMap.set(apiTeam.tla, {
          id: apiTeam.tla,
          name: apiTeam.shortName || apiTeam.name,
          flag: FLAG_MAP[apiTeam.tla] ?? '🏳️',
          crest: hasEmoji ? undefined : apiTeam.crest,
          group,
          confederation: CONF_MAP[apiTeam.tla] ?? '',
        });
      }
    }

    const date = new Date(m.utcDate);
    const dateStr = date.toLocaleDateString('en-CA');
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      ...(date.getMinutes() !== 0 ? { minute: '2-digit' } : {}),
      hour12: true,
    });

    const hasScore = m.status === 'FINISHED' || m.status === 'IN_PLAY' || m.status === 'PAUSED';

    matches.push({
      id: `api-${m.id}`,
      apiId: m.id,
      stage: parseStage(m.stage),
      group,
      matchday: m.matchday ?? undefined,
      date: dateStr,
      time: timeStr,
      utcDate: m.utcDate,
      homeTeamId: homeTla ?? `TBD-${m.id}-H`,
      awayTeamId: awayTla ?? `TBD-${m.id}-A`,
      venue: m.venue ?? '',
      homeScore: hasScore ? (m.score.fullTime.home ?? null) : null,
      awayScore: hasScore ? (m.score.fullTime.away ?? null) : null,
      status: m.status,
      timeElapsed: computeTimeElapsed(m.status, m.minute ?? null, m.injuryTime ?? null),
    });
  }

  // Assign sequential match numbers in chronological order
  const sorted = [...matches].sort((a, b) => a.utcDate.localeCompare(b.utcDate));
  sorted.forEach((m, i) => { m.matchNumber = i + 1; });

  return { matches, teams: teamMap };
}

export function computeStandings(
  matches: Match[],
  teams: Map<string, Team>
): Map<Group, StandingRow[]> {
  const standings = new Map<Group, Map<string, StandingRow>>();

  // Init rows for all known teams
  for (const [id, team] of teams) {
    if (!standings.has(team.group)) standings.set(team.group, new Map());
    standings.get(team.group)!.set(id, { teamId: id, mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 });
  }

  for (const m of matches) {
    if (m.stage !== 'Group Stage' || !m.group) continue;
    if (m.status !== 'FINISHED') continue;
    if (m.homeScore === null || m.awayScore === null) continue;

    const groupRows = standings.get(m.group);
    if (!groupRows) continue;

    const home = groupRows.get(m.homeTeamId);
    const away = groupRows.get(m.awayTeamId);
    if (!home || !away) continue;

    home.mp++; away.mp++;
    home.gf += m.homeScore; home.ga += m.awayScore;
    away.gf += m.awayScore; away.ga += m.homeScore;

    if (m.homeScore > m.awayScore) {
      home.w++; home.pts += 3; away.l++;
    } else if (m.homeScore < m.awayScore) {
      away.w++; away.pts += 3; home.l++;
    } else {
      home.d++; home.pts++;
      away.d++; away.pts++;
    }

    home.gd = home.gf - home.ga;
    away.gd = away.gf - away.ga;
  }

  const result = new Map<Group, StandingRow[]>();
  for (const [g, rows] of standings) {
    const sorted = [...rows.values()].sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b.gd !== a.gd) return b.gd - a.gd;
      return b.gf - a.gf;
    });
    result.set(g, sorted);
  }
  return result;
}

export function formatMatchDate(dateStr: string): string {
  const dt = new Date(`${dateStr}T12:00:00`);
  return dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}
