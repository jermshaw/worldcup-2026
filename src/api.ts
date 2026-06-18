// Types matching football-data.org v4 API response
export interface ApiTeam {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
}

export interface ApiGoal {
  minute: number | null;
  injuryTime?: number | null;
  type: 'REGULAR' | 'EXTRA_TIME' | 'PENALTY' | 'OWN';
  team: { id: number; name: string; tla: string };
  scorer: { id?: number; name: string } | null;
}

export interface ApiBooking {
  minute: number | null;
  card: 'YELLOW' | 'RED' | 'YELLOW_RED';
  team: { id: number; name: string; tla: string };
  player: { id?: number; name: string } | null;
}

export interface ApiMatch {
  id: number;
  utcDate: string;
  status: 'SCHEDULED' | 'TIMED' | 'IN_PLAY' | 'PAUSED' | 'FINISHED' | 'SUSPENDED' | 'POSTPONED' | 'CANCELLED' | 'AWARDED';
  minute?: number | null;
  injuryTime?: number | null;
  stage: string;
  group: string | null;
  matchday: number | null;
  homeTeam: ApiTeam;
  awayTeam: ApiTeam;
  score: {
    winner: 'HOME_TEAM' | 'AWAY_TEAM' | 'DRAW' | null;
    fullTime: { home: number | null; away: number | null };
    halfTime: { home: number | null; away: number | null };
  };
  venue: string | null;
  goals: ApiGoal[] | null;
  bookings: ApiBooking[] | null;
}

export interface ApiResponse {
  matches: ApiMatch[];
  // Scorer data from worldcup26.ir, keyed by "{homeTla}:{awayTla}"
  scorersByKey?: Record<string, { home: string | null; away: string | null }>;
}

// TLA → flag emoji
export const FLAG_MAP: Record<string, string> = {
  USA: '🇺🇸', MEX: '🇲🇽', URU: '🇺🇾', PAN: '🇵🇦',
  ARG: '🇦🇷', CAN: '🇨🇦', CHI: '🇨🇱', ALB: '🇦🇱',
  BRA: '🇧🇷', GER: '🇩🇪', JPN: '🇯🇵', SLE: '🇸🇱',
  FRA: '🇫🇷', MAR: '🇲🇦', CRO: '🇭🇷', BEL: '🇧🇪',
  ESP: '🇪🇸', NED: '🇳🇱', SEN: '🇸🇳', SRB: '🇷🇸',
  ENG: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', POR: '🇵🇹', COL: '🇨🇴', THA: '🇹🇭',
  ITA: '🇮🇹', NGA: '🇳🇬', KOR: '🇰🇷', POL: '🇵🇱',
  ECU: '🇪🇨', EGY: '🇪🇬', DEN: '🇩🇰', AUS: '🇦🇺',
  PER: '🇵🇪', TUN: '🇹🇳', UKR: '🇺🇦', IRN: '🇮🇷',
  NZL: '🇳🇿', SUI: '🇨🇭', TUR: '🇹🇷', CMR: '🇨🇲',
  KSA: '🇸🇦', VEN: '🇻🇪', GHA: '🇬🇭', RSA: '🇿🇦',
  NOR: '🇳🇴', SWE: '🇸🇪', ROU: '🇷🇴', HUN: '🇭🇺',
  SVK: '🇸🇰', CZE: '🇨🇿', SVN: '🇸🇮', GRE: '🇬🇷',
  SCO: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', WAL: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', IRL: '🇮🇪', ISL: '🇮🇸',
  CRC: '🇨🇷', HON: '🇭🇳', JAM: '🇯🇲', TRI: '🇹🇹',
  HAI: '🇭🇹', CUW: '🇨🇼',
  BOL: '🇧🇴', PAR: '🇵🇾', URY: '🇺🇾',
  ALG: '🇩🇿', AUT: '🇦🇹', BIH: '🇧🇦',
  CIV: '🇨🇮', COD: '🇨🇩', EQG: '🇬🇶',
  GAB: '🇬🇦', MAL: '🇲🇱', MOZ: '🇲🇿', TAN: '🇹🇿',
  ZIM: '🇿🇼', ANG: '🇦🇴', BEN: '🇧🇯', BFA: '🇧🇫',
  CPV: '🇨🇻', COM: '🇰🇲', DJI: '🇩🇯', ERI: '🇪🇷',
  ETH: '🇪🇹', GAM: '🇬🇲', GUI: '🇬🇳', KEN: '🇰🇪',
  LBR: '🇱🇷', LBA: '🇱🇾', MRI: '🇲🇺', MTN: '🇲🇷',
  NAM: '🇳🇦', NIG: '🇳🇪', RWA: '🇷🇼', SOM: '🇸🇴',
  SSD: '🇸🇸', SDN: '🇸🇩', SWZ: '🇸🇿', UGA: '🇺🇬',
  ZAM: '🇿🇲', CHN: '🇨🇳', IND: '🇮🇳',
  IDN: '🇮🇩', IRQ: '🇮🇶', JOR: '🇯🇴', KUW: '🇰🇼',
  LBN: '🇱🇧', MAS: '🇲🇾', MYA: '🇲🇲', OMN: '🇴🇲',
  PHI: '🇵🇭', QAT: '🇶🇦', SYR: '🇸🇾', TPE: '🇹🇼',
  TKM: '🇹🇲', UAE: '🇦🇪', UZB: '🇺🇿', VIE: '🇻🇳',
  YEM: '🇾🇪',
};

// TLA → confederation
export const CONF_MAP: Record<string, string> = {
  USA: 'CONCACAF', MEX: 'CONCACAF', PAN: 'CONCACAF', CAN: 'CONCACAF',
  CRC: 'CONCACAF', HON: 'CONCACAF', JAM: 'CONCACAF', TRI: 'CONCACAF',
  HAI: 'CONCACAF', CUW: 'CONCACAF',
  ARG: 'CONMEBOL', BRA: 'CONMEBOL', URU: 'CONMEBOL', COL: 'CONMEBOL',
  CHI: 'CONMEBOL', ECU: 'CONMEBOL', PAR: 'CONMEBOL', PER: 'CONMEBOL',
  VEN: 'CONMEBOL', BOL: 'CONMEBOL',
  GER: 'UEFA', FRA: 'UEFA', ESP: 'UEFA', ENG: 'UEFA', POR: 'UEFA',
  ITA: 'UEFA', NED: 'UEFA', BEL: 'UEFA', CRO: 'UEFA', SRB: 'UEFA',
  SUI: 'UEFA', TUR: 'UEFA', POL: 'UEFA', DEN: 'UEFA', UKR: 'UEFA',
  ALB: 'UEFA', NOR: 'UEFA', SWE: 'UEFA', ROU: 'UEFA', HUN: 'UEFA',
  SVK: 'UEFA', CZE: 'UEFA', SVN: 'UEFA', GRE: 'UEFA', SCO: 'UEFA',
  WAL: 'UEFA', IRL: 'UEFA', ISL: 'UEFA', AUT: 'UEFA', BIH: 'UEFA',
  MAR: 'CAF', NGA: 'CAF', SEN: 'CAF', GHA: 'CAF', CMR: 'CAF',
  EGY: 'CAF', TUN: 'CAF', SLE: 'CAF', RSA: 'CAF', CIV: 'CAF',
  COD: 'CAF', ALG: 'CAF', CPV: 'CAF',
  JPN: 'AFC', KOR: 'AFC', AUS: 'AFC', IRN: 'AFC', KSA: 'AFC',
  THA: 'AFC', CHN: 'AFC', IRQ: 'AFC', JOR: 'AFC', QAT: 'AFC',
  UAE: 'AFC', UZB: 'AFC',
  NZL: 'OFC',
};
