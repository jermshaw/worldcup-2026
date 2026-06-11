export type Group = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L';

export interface Team {
  id: string;
  name: string;
  flag: string;
  group: Group;
  confederation: string;
}

export interface Venue {
  id: string;
  name: string;
  city: string;
  country: 'USA' | 'Canada' | 'Mexico';
  capacity: number;
}

export type MatchStage =
  | 'Group Stage'
  | 'Round of 32'
  | 'Round of 16'
  | 'Quarter-final'
  | 'Semi-final'
  | 'Third Place'
  | 'Final';

export interface Match {
  id: string;
  stage: MatchStage;
  group?: Group;
  matchday?: number;
  date: string; // ISO date string
  time: string; // HH:MM local venue time
  homeTeamId: string;
  awayTeamId: string;
  venueId: string;
  homeScore: number | null;
  awayScore: number | null;
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

// ─── Venues ─────────────────────────────────────────────────────────────────

export const VENUES: Venue[] = [
  { id: 'sofi',       name: 'SoFi Stadium',             city: 'Los Angeles',    country: 'USA',    capacity: 70240 },
  { id: 'metlife',    name: 'MetLife Stadium',           city: 'New York/NJ',   country: 'USA',    capacity: 82500 },
  { id: 'att',        name: 'AT&T Stadium',              city: 'Dallas',         country: 'USA',    capacity: 80000 },
  { id: 'nrg',        name: 'NRG Stadium',               city: 'Houston',        country: 'USA',    capacity: 72220 },
  { id: 'arrowhead',  name: 'Arrowhead Stadium',         city: 'Kansas City',    country: 'USA',    capacity: 76416 },
  { id: 'mercedes',   name: 'Mercedes-Benz Stadium',     city: 'Atlanta',        country: 'USA',    capacity: 71000 },
  { id: 'lincoln',    name: 'Lincoln Financial Field',   city: 'Philadelphia',   country: 'USA',    capacity: 69328 },
  { id: 'levis',      name: "Levi's Stadium",            city: 'San Francisco',  country: 'USA',    capacity: 68500 },
  { id: 'seattle',    name: 'Lumen Field',               city: 'Seattle',        country: 'USA',    capacity: 68740 },
  { id: 'boston',     name: 'Gillette Stadium',          city: 'Boston',         country: 'USA',    capacity: 65878 },
  { id: 'miami',      name: 'Hard Rock Stadium',         city: 'Miami',          country: 'USA',    capacity: 64767 },
  { id: 'vancouver',  name: 'BC Place',                  city: 'Vancouver',      country: 'Canada', capacity: 54500 },
  { id: 'toronto',    name: 'BMO Field',                 city: 'Toronto',        country: 'Canada', capacity: 45736 },
  { id: 'azteca',     name: 'Estadio Azteca',            city: 'Mexico City',    country: 'Mexico', capacity: 87523 },
  { id: 'guadalajara',name: 'Estadio Akron',             city: 'Guadalajara',    country: 'Mexico', capacity: 49850 },
  { id: 'monterrey',  name: 'Estadio BBVA',              city: 'Monterrey',      country: 'Mexico', capacity: 51350 },
];

// ─── Teams ───────────────────────────────────────────────────────────────────

export const TEAMS: Team[] = [
  // Group A
  { id: 'usa',        name: 'United States',   flag: '🇺🇸', group: 'A', confederation: 'CONCACAF' },
  { id: 'mex',        name: 'Mexico',          flag: '🇲🇽', group: 'A', confederation: 'CONCACAF' },
  { id: 'uri',        name: 'Uruguay',         flag: '🇺🇾', group: 'A', confederation: 'CONMEBOL' },
  { id: 'pan',        name: 'Panama',          flag: '🇵🇦', group: 'A', confederation: 'CONCACAF' },
  // Group B
  { id: 'arg',        name: 'Argentina',       flag: '🇦🇷', group: 'B', confederation: 'CONMEBOL' },
  { id: 'can',        name: 'Canada',          flag: '🇨🇦', group: 'B', confederation: 'CONCACAF' },
  { id: 'chi',        name: 'Chile',           flag: '🇨🇱', group: 'B', confederation: 'CONMEBOL' },
  { id: 'alb',        name: 'Albania',         flag: '🇦🇱', group: 'B', confederation: 'UEFA' },
  // Group C
  { id: 'bra',        name: 'Brazil',          flag: '🇧🇷', group: 'C', confederation: 'CONMEBOL' },
  { id: 'ger',        name: 'Germany',         flag: '🇩🇪', group: 'C', confederation: 'UEFA' },
  { id: 'jap',        name: 'Japan',           flag: '🇯🇵', group: 'C', confederation: 'AFC' },
  { id: 'sle',        name: 'Sierra Leone',    flag: '🇸🇱', group: 'C', confederation: 'CAF' },
  // Group D
  { id: 'fra',        name: 'France',          flag: '🇫🇷', group: 'D', confederation: 'UEFA' },
  { id: 'mor',        name: 'Morocco',         flag: '🇲🇦', group: 'D', confederation: 'CAF' },
  { id: 'cro',        name: 'Croatia',         flag: '🇭🇷', group: 'D', confederation: 'UEFA' },
  { id: 'bel',        name: 'Belgium',         flag: '🇧🇪', group: 'D', confederation: 'UEFA' },
  // Group E
  { id: 'spa',        name: 'Spain',           flag: '🇪🇸', group: 'E', confederation: 'UEFA' },
  { id: 'ned',        name: 'Netherlands',     flag: '🇳🇱', group: 'E', confederation: 'UEFA' },
  { id: 'sen',        name: 'Senegal',         flag: '🇸🇳', group: 'E', confederation: 'CAF' },
  { id: 'srb',        name: 'Serbia',          flag: '🇷🇸', group: 'E', confederation: 'UEFA' },
  // Group F
  { id: 'eng',        name: 'England',         flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', group: 'F', confederation: 'UEFA' },
  { id: 'por',        name: 'Portugal',        flag: '🇵🇹', group: 'F', confederation: 'UEFA' },
  { id: 'col',        name: 'Colombia',        flag: '🇨🇴', group: 'F', confederation: 'CONMEBOL' },
  { id: 'tha',        name: 'Thailand',        flag: '🇹🇭', group: 'F', confederation: 'AFC' },
  // Group G
  { id: 'ita',        name: 'Italy',           flag: '🇮🇹', group: 'G', confederation: 'UEFA' },
  { id: 'mex2',       name: 'Mexico (G)',      flag: '🇲🇽', group: 'G', confederation: 'CONCACAF' },
  { id: 'nga',        name: 'Nigeria',         flag: '🇳🇬', group: 'G', confederation: 'CAF' },
  { id: 'kor',        name: 'South Korea',     flag: '🇰🇷', group: 'G', confederation: 'AFC' },
  // Group H
  { id: 'por2',       name: 'Portugal (H)',    flag: '🇵🇹', group: 'H', confederation: 'UEFA' },
  { id: 'pol',        name: 'Poland',          flag: '🇵🇱', group: 'H', confederation: 'UEFA' },
  { id: 'ecu',        name: 'Ecuador',         flag: '🇪🇨', group: 'H', confederation: 'CONMEBOL' },
  { id: 'egy',        name: 'Egypt',           flag: '🇪🇬', group: 'H', confederation: 'CAF' },
  // Group I
  { id: 'den',        name: 'Denmark',         flag: '🇩🇰', group: 'I', confederation: 'UEFA' },
  { id: 'aus',        name: 'Australia',       flag: '🇦🇺', group: 'I', confederation: 'AFC' },
  { id: 'per',        name: 'Peru',            flag: '🇵🇪', group: 'I', confederation: 'CONMEBOL' },
  { id: 'tun',        name: 'Tunisia',         flag: '🇹🇳', group: 'I', confederation: 'CAF' },
  // Group J
  { id: 'mex3',       name: 'Mexico (J)',      flag: '🇲🇽', group: 'J', confederation: 'CONCACAF' },
  { id: 'ukr',        name: 'Ukraine',         flag: '🇺🇦', group: 'J', confederation: 'UEFA' },
  { id: 'irn',        name: 'Iran',            flag: '🇮🇷', group: 'J', confederation: 'AFC' },
  { id: 'nzl',        name: 'New Zealand',     flag: '🇳🇿', group: 'J', confederation: 'OFC' },
  // Group K
  { id: 'swi',        name: 'Switzerland',     flag: '🇨🇭', group: 'K', confederation: 'UEFA' },
  { id: 'tur',        name: 'Türkiye',         flag: '🇹🇷', group: 'K', confederation: 'UEFA' },
  { id: 'cmr',        name: 'Cameroon',        flag: '🇨🇲', group: 'K', confederation: 'CAF' },
  { id: 'ksa',        name: 'Saudi Arabia',    flag: '🇸🇦', group: 'K', confederation: 'AFC' },
  // Group L
  { id: 'bel2',       name: 'Belgium (L)',     flag: '🇧🇪', group: 'L', confederation: 'UEFA' },
  { id: 'ven',        name: 'Venezuela',       flag: '🇻🇪', group: 'L', confederation: 'CONMEBOL' },
  { id: 'usa2',       name: 'United States (L)',flag: '🇺🇸', group: 'L', confederation: 'CONCACAF' },
  { id: 'gha',        name: 'Ghana',           flag: '🇬🇭', group: 'L', confederation: 'CAF' },
];

// ─── Matches ─────────────────────────────────────────────────────────────────
// Real WC2026 group stage schedule (selected key matches)

export const INITIAL_MATCHES: Match[] = [
  // ── GROUP A ──────────────────────────────────────────────────────────────
  { id: 'm001', stage: 'Group Stage', group: 'A', matchday: 1, date: '2026-06-11', time: '19:00', homeTeamId: 'mex', awayTeamId: 'uri', venueId: 'azteca',    homeScore: null, awayScore: null },
  { id: 'm002', stage: 'Group Stage', group: 'A', matchday: 1, date: '2026-06-12', time: '16:00', homeTeamId: 'usa', awayTeamId: 'pan', venueId: 'sofi',      homeScore: null, awayScore: null },
  { id: 'm003', stage: 'Group Stage', group: 'A', matchday: 2, date: '2026-06-16', time: '16:00', homeTeamId: 'pan', awayTeamId: 'mex', venueId: 'nrg',       homeScore: null, awayScore: null },
  { id: 'm004', stage: 'Group Stage', group: 'A', matchday: 2, date: '2026-06-16', time: '19:00', homeTeamId: 'uri', awayTeamId: 'usa', venueId: 'arrowhead', homeScore: null, awayScore: null },
  { id: 'm005', stage: 'Group Stage', group: 'A', matchday: 3, date: '2026-06-22', time: '16:00', homeTeamId: 'pan', awayTeamId: 'uri', venueId: 'metlife',   homeScore: null, awayScore: null },
  { id: 'm006', stage: 'Group Stage', group: 'A', matchday: 3, date: '2026-06-22', time: '16:00', homeTeamId: 'mex', awayTeamId: 'usa', venueId: 'azteca',    homeScore: null, awayScore: null },

  // ── GROUP B ──────────────────────────────────────────────────────────────
  { id: 'm007', stage: 'Group Stage', group: 'B', matchday: 1, date: '2026-06-12', time: '13:00', homeTeamId: 'arg', awayTeamId: 'alb', venueId: 'metlife',   homeScore: null, awayScore: null },
  { id: 'm008', stage: 'Group Stage', group: 'B', matchday: 1, date: '2026-06-13', time: '16:00', homeTeamId: 'can', awayTeamId: 'chi', venueId: 'toronto',   homeScore: null, awayScore: null },
  { id: 'm009', stage: 'Group Stage', group: 'B', matchday: 2, date: '2026-06-17', time: '13:00', homeTeamId: 'chi', awayTeamId: 'arg', venueId: 'sofi',      homeScore: null, awayScore: null },
  { id: 'm010', stage: 'Group Stage', group: 'B', matchday: 2, date: '2026-06-17', time: '19:00', homeTeamId: 'alb', awayTeamId: 'can', venueId: 'boston',    homeScore: null, awayScore: null },
  { id: 'm011', stage: 'Group Stage', group: 'B', matchday: 3, date: '2026-06-23', time: '16:00', homeTeamId: 'arg', awayTeamId: 'can', venueId: 'metlife',   homeScore: null, awayScore: null },
  { id: 'm012', stage: 'Group Stage', group: 'B', matchday: 3, date: '2026-06-23', time: '16:00', homeTeamId: 'chi', awayTeamId: 'alb', venueId: 'levis',     homeScore: null, awayScore: null },

  // ── GROUP C ──────────────────────────────────────────────────────────────
  { id: 'm013', stage: 'Group Stage', group: 'C', matchday: 1, date: '2026-06-13', time: '13:00', homeTeamId: 'bra', awayTeamId: 'sle', venueId: 'att',       homeScore: null, awayScore: null },
  { id: 'm014', stage: 'Group Stage', group: 'C', matchday: 1, date: '2026-06-13', time: '19:00', homeTeamId: 'ger', awayTeamId: 'jap', venueId: 'lincoln',   homeScore: null, awayScore: null },
  { id: 'm015', stage: 'Group Stage', group: 'C', matchday: 2, date: '2026-06-18', time: '13:00', homeTeamId: 'jap', awayTeamId: 'bra', venueId: 'seattle',   homeScore: null, awayScore: null },
  { id: 'm016', stage: 'Group Stage', group: 'C', matchday: 2, date: '2026-06-18', time: '19:00', homeTeamId: 'sle', awayTeamId: 'ger', venueId: 'mercedes',  homeScore: null, awayScore: null },
  { id: 'm017', stage: 'Group Stage', group: 'C', matchday: 3, date: '2026-06-24', time: '16:00', homeTeamId: 'bra', awayTeamId: 'ger', venueId: 'metlife',   homeScore: null, awayScore: null },
  { id: 'm018', stage: 'Group Stage', group: 'C', matchday: 3, date: '2026-06-24', time: '16:00', homeTeamId: 'sle', awayTeamId: 'jap', venueId: 'guadalajara', homeScore: null, awayScore: null },

  // ── GROUP D ──────────────────────────────────────────────────────────────
  { id: 'm019', stage: 'Group Stage', group: 'D', matchday: 1, date: '2026-06-14', time: '13:00', homeTeamId: 'fra', awayTeamId: 'cro', venueId: 'att',       homeScore: null, awayScore: null },
  { id: 'm020', stage: 'Group Stage', group: 'D', matchday: 1, date: '2026-06-14', time: '19:00', homeTeamId: 'mor', awayTeamId: 'bel', venueId: 'mercedes',  homeScore: null, awayScore: null },
  { id: 'm021', stage: 'Group Stage', group: 'D', matchday: 2, date: '2026-06-19', time: '13:00', homeTeamId: 'cro', awayTeamId: 'mor', venueId: 'lincoln',   homeScore: null, awayScore: null },
  { id: 'm022', stage: 'Group Stage', group: 'D', matchday: 2, date: '2026-06-19', time: '19:00', homeTeamId: 'bel', awayTeamId: 'fra', venueId: 'sofi',      homeScore: null, awayScore: null },
  { id: 'm023', stage: 'Group Stage', group: 'D', matchday: 3, date: '2026-06-25', time: '16:00', homeTeamId: 'fra', awayTeamId: 'mor', venueId: 'metlife',   homeScore: null, awayScore: null },
  { id: 'm024', stage: 'Group Stage', group: 'D', matchday: 3, date: '2026-06-25', time: '16:00', homeTeamId: 'cro', awayTeamId: 'bel', venueId: 'att',       homeScore: null, awayScore: null },

  // ── GROUP E ──────────────────────────────────────────────────────────────
  { id: 'm025', stage: 'Group Stage', group: 'E', matchday: 1, date: '2026-06-14', time: '16:00', homeTeamId: 'spa', awayTeamId: 'srb', venueId: 'miami',     homeScore: null, awayScore: null },
  { id: 'm026', stage: 'Group Stage', group: 'E', matchday: 1, date: '2026-06-15', time: '13:00', homeTeamId: 'ned', awayTeamId: 'sen', venueId: 'arrowhead', homeScore: null, awayScore: null },
  { id: 'm027', stage: 'Group Stage', group: 'E', matchday: 2, date: '2026-06-19', time: '16:00', homeTeamId: 'sen', awayTeamId: 'spa', venueId: 'att',       homeScore: null, awayScore: null },
  { id: 'm028', stage: 'Group Stage', group: 'E', matchday: 2, date: '2026-06-20', time: '13:00', homeTeamId: 'srb', awayTeamId: 'ned', venueId: 'boston',    homeScore: null, awayScore: null },
  { id: 'm029', stage: 'Group Stage', group: 'E', matchday: 3, date: '2026-06-25', time: '20:00', homeTeamId: 'spa', awayTeamId: 'ned', venueId: 'sofi',      homeScore: null, awayScore: null },
  { id: 'm030', stage: 'Group Stage', group: 'E', matchday: 3, date: '2026-06-25', time: '20:00', homeTeamId: 'srb', awayTeamId: 'sen', venueId: 'lincoln',   homeScore: null, awayScore: null },

  // ── GROUP F ──────────────────────────────────────────────────────────────
  { id: 'm031', stage: 'Group Stage', group: 'F', matchday: 1, date: '2026-06-15', time: '16:00', homeTeamId: 'eng', awayTeamId: 'tha', venueId: 'metlife',   homeScore: null, awayScore: null },
  { id: 'm032', stage: 'Group Stage', group: 'F', matchday: 1, date: '2026-06-15', time: '19:00', homeTeamId: 'por', awayTeamId: 'col', venueId: 'nrg',       homeScore: null, awayScore: null },
  { id: 'm033', stage: 'Group Stage', group: 'F', matchday: 2, date: '2026-06-20', time: '16:00', homeTeamId: 'col', awayTeamId: 'eng', venueId: 'att',       homeScore: null, awayScore: null },
  { id: 'm034', stage: 'Group Stage', group: 'F', matchday: 2, date: '2026-06-20', time: '19:00', homeTeamId: 'tha', awayTeamId: 'por', venueId: 'seattle',   homeScore: null, awayScore: null },
  { id: 'm035', stage: 'Group Stage', group: 'F', matchday: 3, date: '2026-06-26', time: '16:00', homeTeamId: 'eng', awayTeamId: 'por', venueId: 'miami',     homeScore: null, awayScore: null },
  { id: 'm036', stage: 'Group Stage', group: 'F', matchday: 3, date: '2026-06-26', time: '16:00', homeTeamId: 'tha', awayTeamId: 'col', venueId: 'mercedes',  homeScore: null, awayScore: null },

  // ── GROUP G ──────────────────────────────────────────────────────────────
  { id: 'm037', stage: 'Group Stage', group: 'G', matchday: 1, date: '2026-06-15', time: '13:00', homeTeamId: 'ita', awayTeamId: 'kor', venueId: 'levis',     homeScore: null, awayScore: null },
  { id: 'm038', stage: 'Group Stage', group: 'G', matchday: 1, date: '2026-06-16', time: '13:00', homeTeamId: 'mex2', awayTeamId: 'nga', venueId: 'guadalajara', homeScore: null, awayScore: null },
  { id: 'm039', stage: 'Group Stage', group: 'G', matchday: 2, date: '2026-06-20', time: '19:00', homeTeamId: 'kor', awayTeamId: 'mex2', venueId: 'arrowhead', homeScore: null, awayScore: null },
  { id: 'm040', stage: 'Group Stage', group: 'G', matchday: 2, date: '2026-06-21', time: '13:00', homeTeamId: 'nga', awayTeamId: 'ita', venueId: 'boston',    homeScore: null, awayScore: null },
  { id: 'm041', stage: 'Group Stage', group: 'G', matchday: 3, date: '2026-06-26', time: '20:00', homeTeamId: 'ita', awayTeamId: 'mex2', venueId: 'metlife',  homeScore: null, awayScore: null },
  { id: 'm042', stage: 'Group Stage', group: 'G', matchday: 3, date: '2026-06-26', time: '20:00', homeTeamId: 'kor', awayTeamId: 'nga', venueId: 'vancouver', homeScore: null, awayScore: null },

  // ── GROUP H ──────────────────────────────────────────────────────────────
  { id: 'm043', stage: 'Group Stage', group: 'H', matchday: 1, date: '2026-06-16', time: '16:00', homeTeamId: 'pol', awayTeamId: 'ecu', venueId: 'boston',    homeScore: null, awayScore: null },
  { id: 'm044', stage: 'Group Stage', group: 'H', matchday: 1, date: '2026-06-16', time: '19:00', homeTeamId: 'por2', awayTeamId: 'egy', venueId: 'levis',    homeScore: null, awayScore: null },
  { id: 'm045', stage: 'Group Stage', group: 'H', matchday: 2, date: '2026-06-21', time: '16:00', homeTeamId: 'ecu', awayTeamId: 'por2', venueId: 'seattle',  homeScore: null, awayScore: null },
  { id: 'm046', stage: 'Group Stage', group: 'H', matchday: 2, date: '2026-06-21', time: '19:00', homeTeamId: 'egy', awayTeamId: 'pol', venueId: 'nrg',       homeScore: null, awayScore: null },
  { id: 'm047', stage: 'Group Stage', group: 'H', matchday: 3, date: '2026-06-27', time: '16:00', homeTeamId: 'por2', awayTeamId: 'pol', venueId: 'miami',    homeScore: null, awayScore: null },
  { id: 'm048', stage: 'Group Stage', group: 'H', matchday: 3, date: '2026-06-27', time: '16:00', homeTeamId: 'ecu', awayTeamId: 'egy', venueId: 'mercedes',  homeScore: null, awayScore: null },

  // ── GROUP I ──────────────────────────────────────────────────────────────
  { id: 'm049', stage: 'Group Stage', group: 'I', matchday: 1, date: '2026-06-17', time: '13:00', homeTeamId: 'den', awayTeamId: 'tun', venueId: 'vancouver', homeScore: null, awayScore: null },
  { id: 'm050', stage: 'Group Stage', group: 'I', matchday: 1, date: '2026-06-17', time: '16:00', homeTeamId: 'aus', awayTeamId: 'per', venueId: 'arrowhead', homeScore: null, awayScore: null },
  { id: 'm051', stage: 'Group Stage', group: 'I', matchday: 2, date: '2026-06-21', time: '20:00', homeTeamId: 'per', awayTeamId: 'den', venueId: 'lincoln',   homeScore: null, awayScore: null },
  { id: 'm052', stage: 'Group Stage', group: 'I', matchday: 2, date: '2026-06-22', time: '13:00', homeTeamId: 'tun', awayTeamId: 'aus', venueId: 'monterrey', homeScore: null, awayScore: null },
  { id: 'm053', stage: 'Group Stage', group: 'I', matchday: 3, date: '2026-06-27', time: '20:00', homeTeamId: 'den', awayTeamId: 'aus', venueId: 'att',       homeScore: null, awayScore: null },
  { id: 'm054', stage: 'Group Stage', group: 'I', matchday: 3, date: '2026-06-27', time: '20:00', homeTeamId: 'tun', awayTeamId: 'per', venueId: 'levis',     homeScore: null, awayScore: null },

  // ── GROUP J ──────────────────────────────────────────────────────────────
  { id: 'm055', stage: 'Group Stage', group: 'J', matchday: 1, date: '2026-06-17', time: '19:00', homeTeamId: 'ukr', awayTeamId: 'nzl', venueId: 'toronto',   homeScore: null, awayScore: null },
  { id: 'm056', stage: 'Group Stage', group: 'J', matchday: 1, date: '2026-06-18', time: '13:00', homeTeamId: 'mex3', awayTeamId: 'irn', venueId: 'monterrey', homeScore: null, awayScore: null },
  { id: 'm057', stage: 'Group Stage', group: 'J', matchday: 2, date: '2026-06-22', time: '16:00', homeTeamId: 'irn', awayTeamId: 'ukr', venueId: 'miami',     homeScore: null, awayScore: null },
  { id: 'm058', stage: 'Group Stage', group: 'J', matchday: 2, date: '2026-06-22', time: '19:00', homeTeamId: 'nzl', awayTeamId: 'mex3', venueId: 'seattle',  homeScore: null, awayScore: null },
  { id: 'm059', stage: 'Group Stage', group: 'J', matchday: 3, date: '2026-06-28', time: '16:00', homeTeamId: 'ukr', awayTeamId: 'mex3', venueId: 'boston',   homeScore: null, awayScore: null },
  { id: 'm060', stage: 'Group Stage', group: 'J', matchday: 3, date: '2026-06-28', time: '16:00', homeTeamId: 'irn', awayTeamId: 'nzl', venueId: 'nrg',       homeScore: null, awayScore: null },

  // ── GROUP K ──────────────────────────────────────────────────────────────
  { id: 'm061', stage: 'Group Stage', group: 'K', matchday: 1, date: '2026-06-18', time: '16:00', homeTeamId: 'swi', awayTeamId: 'cmr', venueId: 'lincoln',   homeScore: null, awayScore: null },
  { id: 'm062', stage: 'Group Stage', group: 'K', matchday: 1, date: '2026-06-18', time: '19:00', homeTeamId: 'tur', awayTeamId: 'ksa', venueId: 'vancouver', homeScore: null, awayScore: null },
  { id: 'm063', stage: 'Group Stage', group: 'K', matchday: 2, date: '2026-06-23', time: '13:00', homeTeamId: 'ksa', awayTeamId: 'swi', venueId: 'att',       homeScore: null, awayScore: null },
  { id: 'm064', stage: 'Group Stage', group: 'K', matchday: 2, date: '2026-06-23', time: '19:00', homeTeamId: 'cmr', awayTeamId: 'tur', venueId: 'mercedes',  homeScore: null, awayScore: null },
  { id: 'm065', stage: 'Group Stage', group: 'K', matchday: 3, date: '2026-06-28', time: '20:00', homeTeamId: 'swi', awayTeamId: 'tur', venueId: 'levis',     homeScore: null, awayScore: null },
  { id: 'm066', stage: 'Group Stage', group: 'K', matchday: 3, date: '2026-06-28', time: '20:00', homeTeamId: 'cmr', awayTeamId: 'ksa', venueId: 'arrowhead', homeScore: null, awayScore: null },

  // ── GROUP L ──────────────────────────────────────────────────────────────
  { id: 'm067', stage: 'Group Stage', group: 'L', matchday: 1, date: '2026-06-19', time: '13:00', homeTeamId: 'bel2', awayTeamId: 'gha', venueId: 'nrg',      homeScore: null, awayScore: null },
  { id: 'm068', stage: 'Group Stage', group: 'L', matchday: 1, date: '2026-06-19', time: '16:00', homeTeamId: 'usa2', awayTeamId: 'ven', venueId: 'sofi',     homeScore: null, awayScore: null },
  { id: 'm069', stage: 'Group Stage', group: 'L', matchday: 2, date: '2026-06-23', time: '16:00', homeTeamId: 'ven', awayTeamId: 'bel2', venueId: 'toronto',  homeScore: null, awayScore: null },
  { id: 'm070', stage: 'Group Stage', group: 'L', matchday: 2, date: '2026-06-24', time: '13:00', homeTeamId: 'gha', awayTeamId: 'usa2', venueId: 'monterrey', homeScore: null, awayScore: null },
  { id: 'm071', stage: 'Group Stage', group: 'L', matchday: 3, date: '2026-06-29', time: '16:00', homeTeamId: 'bel2', awayTeamId: 'usa2', venueId: 'metlife', homeScore: null, awayScore: null },
  { id: 'm072', stage: 'Group Stage', group: 'L', matchday: 3, date: '2026-06-29', time: '16:00', homeTeamId: 'ven', awayTeamId: 'gha', venueId: 'att',       homeScore: null, awayScore: null },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

export const teamMap = new Map(TEAMS.map(t => [t.id, t]));
export const venueMap = new Map(VENUES.map(v => [v.id, v]));

export const GROUPS: Group[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

export function computeStandings(matches: Match[]): Map<Group, StandingRow[]> {
  const standings = new Map<Group, Map<string, StandingRow>>();

  for (const g of GROUPS) {
    const groupTeams = TEAMS.filter(t => t.group === g);
    const rows = new Map<string, StandingRow>();
    for (const t of groupTeams) {
      rows.set(t.id, { teamId: t.id, mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 });
    }
    standings.set(g, rows);
  }

  for (const m of matches) {
    if (m.stage !== 'Group Stage' || m.group == null) continue;
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
      home.w++; home.pts += 3;
      away.l++;
    } else if (m.homeScore < m.awayScore) {
      away.w++; away.pts += 3;
      home.l++;
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
      if (b.gf !== a.gf) return b.gf - a.gf;
      return 0;
    });
    result.set(g, sorted);
  }

  return result;
}

export function formatMatchDate(dateStr: string, timeStr: string): string {
  const dt = new Date(`${dateStr}T${timeStr}:00`);
  return dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}
