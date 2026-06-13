// Primary background color per national team (TLA → hex)
export const TEAM_COLORS: Record<string, string> = {
  // CONCACAF
  USA: '#1c64ac',
  MEX: '#006847',
  CAN: '#d80404',
  PAN: '#da121a',
  CRC: '#002b7f',
  HON: '#0073cf',
  JAM: '#000000',
  TRI: '#ce1126',

  // CONMEBOL
  ARG: '#74acdf',
  BRA: '#009c3b',
  URU: '#5aaae7',
  COL: '#fcd116',
  CHI: '#d52b1e',
  ECU: '#ffd100',
  PAR: '#d52b1e',
  PER: '#d91023',
  VEN: '#cf142b',
  BOL: '#d52b1e',

  // UEFA
  GER: '#3c3b3b',
  FRA: '#002395',
  ESP: '#aa151b',
  ENG: '#cf081f',
  POR: '#006600',
  ITA: '#003082',
  NED: '#ff6600',
  BEL: '#000000',
  CRO: '#ff0000',
  SRB: '#c6363c',
  SUI: '#d52b1e',
  TUR: '#e30a17',
  POL: '#dc143c',
  DEN: '#c60c30',
  UKR: '#005bbb',
  ALB: '#e41e20',
  NOR: '#ef2b2d',
  SWE: '#006aa7',
  ROU: '#002b7f',
  HUN: '#ce2939',
  SVK: '#003da5',
  CZE: '#d7141a',
  SVN: '#003da5',
  GRE: '#0d5eaf',
  SCO: '#003087',
  WAL: '#c8102e',
  IRL: '#169b62',
  ISL: '#003897',

  // CAF
  MAR: '#c1272d',
  NGA: '#008751',
  SEN: '#00853f',
  GHA: '#006b3f',
  CMR: '#007a5e',
  EGY: '#c09300',
  TUN: '#e70013',
  SLE: '#1eb53a',
  RSA: '#007a4d',
  CIV: '#f77f00',
  COD: '#007fff',

  // AFC
  JPN: '#bc002d',
  KOR: '#003478',
  AUS: '#ffcd00',
  IRN: '#239f40',
  KSA: '#006c35',
  THA: '#a51931',
  CHN: '#de2910',
  IRQ: '#ce1126',
  JOR: '#007a3d',
  QAT: '#8d1b3d',

  // OFC
  NZL: '#000000',
};

export function getTeamColor(tla: string): string {
  return TEAM_COLORS[tla] ?? '#2a2a3a';
}
