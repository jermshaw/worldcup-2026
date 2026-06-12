import type { ApiResponse } from './api';
import { FLAG_MAP, CONF_MAP } from './api';

export type Group = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L';

export interface Team {
  id: string; // TLA e.g. "USA"
  name: string;
  flag: string;
  group: Group;
  confederation: string;
}

export interface Match {
  id: string;
  apiId: number;
  stage: string;
  group?: Group;
  matchday?: number;
  date: string;
  time: string;
  homeTeamId: string;
  awayTeamId: string;
  venue: string;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
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
    LAST_16: 'Round of 16',
    QUARTER_FINALS: 'Quarter-final',
    SEMI_FINALS: 'Semi-final',
    THIRD_PLACE: 'Third Place',
    FINAL: 'Final',
  };
  return map[raw] ?? raw;
}

export function buildFromApi(data: ApiResponse): { matches: Match[]; teams: Map<string, Team> } {
  const teamMap = new Map<string, Team>();
  const matches: Match[] = [];

  for (const m of data.matches) {
    if (!m.homeTeam?.tla || !m.awayTeam?.tla) continue;

    const group = parseGroup(m.group);

    // Register teams (use group from first group stage match we see them in)
    for (const apiTeam of [m.homeTeam, m.awayTeam]) {
      if (!teamMap.has(apiTeam.tla) && group) {
        teamMap.set(apiTeam.tla, {
          id: apiTeam.tla,
          name: apiTeam.shortName || apiTeam.name,
          flag: FLAG_MAP[apiTeam.tla] ?? '🏳️',
          group,
          confederation: CONF_MAP[apiTeam.tla] ?? '',
        });
      }
    }

    const date = new Date(m.utcDate);
    // Use the viewer's local timezone so kick-off times are always "when to watch"
    const dateStr = date.toLocaleDateString('en-CA'); // YYYY-MM-DD in local time
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const finished = m.status === 'FINISHED';

    matches.push({
      id: `api-${m.id}`,
      apiId: m.id,
      stage: parseStage(m.stage),
      group,
      matchday: m.matchday ?? undefined,
      date: dateStr,
      time: timeStr,
      homeTeamId: m.homeTeam.tla,
      awayTeamId: m.awayTeam.tla,
      venue: m.venue ?? '',
      homeScore: finished ? (m.score.fullTime.home ?? null) : null,
      awayScore: finished ? (m.score.fullTime.away ?? null) : null,
      status: m.status,
    });
  }

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
