// Official primary brand colors from FIFA WC2026 team reference cards.
// ⚠ ENG and TUR are white in the official reference — white text will be
//   invisible; handle contrast in the UI for those two teams.

export const TEAM_COLORS: Record<string, string> = {
  // ── CONCACAF ──────────────────────────────────────────────────────────────
  USA: '#2933D6',   // vivid royal blue
  MEX: '#4A9940',   // bright forest green
  CAN: '#E80000',   // red
  PAN: '#D6312E',   // red
  CRC: '#002B7F',   // deep navy
  HON: '#0032A0',   // navy blue
  JAM: '#111111',   // black
  TRI: '#CE1020',   // red
  HAI: '#2B38CC',   // vivid blue
  CUW: '#3060C8',   // royal blue

  // ── CONMEBOL ──────────────────────────────────────────────────────────────
  ARG: '#43A6DA',   // celeste
  BRA: '#F0C428',   // Seleção yellow
  URU: '#34A2F9',   // sky blue
  COL: '#F0C030',   // gold yellow
  CHI: '#D52B1E',   // red
  ECU: '#F0BF28',   // golden yellow
  PAR: '#D02B15',   // red
  PER: '#D91023',   // red
  VEN: '#CF142B',   // red
  BOL: '#D52B1E',   // red

  // ── UEFA ──────────────────────────────────────────────────────────────────
  GER: '#1F1F1F',   // black
  FRA: '#2840A0',   // navy blue
  ESP: '#F0331A',   // red
  ENG: '#13203A',   // navy
  POR: '#F0331A',   // red
  ITA: '#003082',   // deep navy
  NED: '#FF7100',   // dutch orange
  BEL: '#8B1828',   // dark maroon
  CRO: '#E4321D',   // red
  SRB: '#C6363C',   // red
  SUI: '#F70000',   // red
  TUR: '#A1002F',   // crimson
  POL: '#DC143C',   // red
  DEN: '#C60C30',   // red
  UKR: '#005BBB',   // cobalt blue
  ALB: '#E41E20',   // red
  NOR: '#B83028',   // deep brick red
  SWE: '#3D6635',   // forest green
  ROU: '#002B7F',   // navy
  HUN: '#CE2939',   // red
  SVK: '#003DA5',   // blue
  CZE: '#D43830',   // tomato red
  SVN: '#003DA5',   // blue
  GRE: '#0D5EAF',   // blue
  SCO: '#1E2E6E',   // deep navy
  WAL: '#D01225',   // red
  IRL: '#169B62',   // green
  ISL: '#003897',   // navy
  AUT: '#D04535',   // brick red
  BIH: '#2B3DCC',   // vivid blue

  // ── CAF ───────────────────────────────────────────────────────────────────
  MAR: '#CC3830',   // tomato red
  NGA: '#008751',   // green
  SEN: '#D7C11F',   // golden yellow
  GHA: '#EEC028',   // golden yellow
  CMR: '#007A5E',   // teal-green
  EGY: '#D44030',   // tomato red
  TUN: '#DB332E',   // red
  SLE: '#1EB53A',   // bright green
  RSA: '#DEAB00',   // gold
  CIV: '#E07820',   // orange
  COD: '#2B7EF8',   // blue
  ALG: '#00A362',   // green
  CPV: '#232E74',   // navy

  // ── AFC ───────────────────────────────────────────────────────────────────
  JPN: '#2B38D0',   // vivid blue (away kit primary)
  KOR: '#F04040',   // red
  AUS: '#E8B828',   // golden amber
  IRN: '#D23323',   // red
  KSA: '#4BA359',   // green
  THA: '#A51931',   // deep red
  CHN: '#DE2910',   // vivid red
  IRQ: '#3A7848',   // forest green
  JOR: '#007E39',   // green
  QAT: '#85263D',   // deep maroon
  UZB: '#0D27A4',   // deep blue

  // ── OFC ───────────────────────────────────────────────────────────────────
  NZL: '#00216B',   // navy
};

export function getTeamColor(tla: string): string {
  return TEAM_COLORS[tla] ?? '#2a2a3a';
}

export function getTeamTextColor(_tla: string): string {
  return '#fff';
}
