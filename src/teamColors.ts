// Official primary brand colors from FIFA WC2026 team reference cards.
// ⚠ ENG and TUR are white in the official reference — white text will be
//   invisible; handle contrast in the UI for those two teams.

export const TEAM_COLORS: Record<string, string> = {
  // ── CONCACAF ──────────────────────────────────────────────────────────────
  USA: '#2933D6',   // vivid royal blue
  MEX: '#4A9940',   // bright forest green
  CAN: '#C8322A',   // warm crimson
  PAN: '#D84030',   // tomato red
  CRC: '#002B7F',   // deep navy
  HON: '#0032A0',   // navy blue
  JAM: '#111111',   // black
  TRI: '#CE1020',   // red
  HAI: '#2B38CC',   // vivid blue
  CUW: '#3060C8',   // royal blue

  // ── CONMEBOL ──────────────────────────────────────────────────────────────
  ARG: '#AACCE8',   // celeste sky blue
  BRA: '#F0C428',   // Seleção yellow
  URU: '#A8C4E8',   // sky blue (slightly deeper than ARG)
  COL: '#F0C030',   // gold yellow
  CHI: '#D52B1E',   // red
  ECU: '#F0BF28',   // golden yellow
  PAR: '#D83A30',   // tomato red
  PER: '#D91023',   // red
  VEN: '#CF142B',   // red
  BOL: '#D52B1E',   // red

  // ── UEFA ──────────────────────────────────────────────────────────────────
  GER: '#111111',   // black
  FRA: '#2840A0',   // navy blue
  ESP: '#D44030',   // tomato red
  ENG: '#F0F0F0',   // white ⚠
  POR: '#D44038',   // tomato red (red jersey primary)
  ITA: '#003082',   // deep navy
  NED: '#E07018',   // dutch orange
  BEL: '#8B1828',   // dark maroon
  CRO: '#D44035',   // tomato red
  SRB: '#C6363C',   // red
  SUI: '#D43830',   // tomato red
  TUR: '#F0F0F0',   // white ⚠
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
  SEN: '#F0C430',   // golden yellow
  GHA: '#EEC028',   // golden yellow
  CMR: '#007A5E',   // teal-green
  EGY: '#D44030',   // tomato red
  TUN: '#D43828',   // tomato red
  SLE: '#1EB53A',   // bright green
  RSA: '#EAC028',   // golden yellow
  CIV: '#E07820',   // orange
  COD: '#4080D8',   // cornflower blue
  ALG: '#3A8E4C',   // medium green
  CPV: '#1C2C70',   // dark navy

  // ── AFC ───────────────────────────────────────────────────────────────────
  JPN: '#2B38D0',   // vivid blue (away kit primary)
  KOR: '#D83830',   // tomato red
  AUS: '#E8B828',   // golden amber
  IRN: '#D44035',   // red
  KSA: '#3A8E44',   // medium green
  THA: '#A51931',   // deep red
  CHN: '#DE2910',   // vivid red
  IRQ: '#3A7848',   // forest green
  JOR: '#D44228',   // tomato red
  QAT: '#8A1828',   // deep maroon
  UZB: '#2A3AD4',   // vivid blue

  // ── OFC ───────────────────────────────────────────────────────────────────
  NZL: '#111111',   // black
};

export function getTeamColor(tla: string): string {
  return TEAM_COLORS[tla] ?? '#2a2a3a';
}
