// Static map of football-data.org match API ID → host city
// Venue data is not returned by the API, so this is maintained manually.
export const MATCH_CITY: Record<number, string> = {
  // ── Group Stage ─────────────────────────────────────
  537327: 'Mexico City',   // MEX vs RSA
  537328: 'Guadalajara',   // KOR vs CZE
  537333: 'Monterrey',     // CAN vs BIH
  537345: 'Dallas',        // USA vs PAR
  537334: 'Miami',         // QAT vs SUI
  537339: 'Atlanta',       // BRA vs MAR
  537340: 'Houston',       // HAI vs SCO
  537346: 'Kansas City',   // AUS vs TUR
  537351: 'Philadelphia',  // GER vs CUW
  537357: 'New York',      // NED vs JPN
  537352: 'Boston',        // CIV vs ECU
  537358: 'Toronto',       // SWE vs TUN
  537369: 'Seattle',       // ESP vs CPV
  537363: 'Santa Clara',   // BEL vs EGY
  537370: 'Los Angeles',   // KSA vs URY
  537364: 'Vancouver',     // IRN vs NZL
  537391: 'Mexico City',   // FRA vs SEN
  537392: 'Guadalajara',   // IRQ vs NOR
  537397: 'Monterrey',     // ARG vs ALG
  537398: 'Santa Clara',   // AUT vs JOR
  537403: 'Houston',       // POR vs COD
  537409: 'Kansas City',   // ENG vs CRO
  537410: 'Miami',         // GHA vs PAN
  537404: 'Atlanta',       // UZB vs COL
  537329: 'Toronto',       // CZE vs RSA
  537335: 'Philadelphia',  // SUI vs BIH
  537336: 'New York',      // CAN vs QAT
  537330: 'Boston',        // MEX vs KOR
  537348: 'Santa Clara',   // USA vs AUS
  537342: 'Seattle',       // SCO vs MAR
  537341: 'Vancouver',     // BRA vs HAI
  537347: 'Los Angeles',   // TUR vs PAR
  537359: 'Monterrey',     // NED vs SWE
  537353: 'Mexico City',   // GER vs CIV
  537354: 'Guadalajara',   // ECU vs CUW
  537360: 'Dallas',        // TUN vs JPN
  537371: 'Atlanta',       // ESP vs KSA
  537365: 'Houston',       // BEL vs IRN
  537372: 'Miami',         // URY vs CPV
  537366: 'Kansas City',   // NZL vs EGY
  537399: 'New York',      // ARG vs AUT
  537393: 'Boston',        // FRA vs IRQ
  537394: 'Philadelphia',  // NOR vs SEN
  537400: 'Toronto',       // JOR vs ALG
  537405: 'Vancouver',     // POR vs UZB
  537411: 'Los Angeles',   // ENG vs GHA
  537412: 'Seattle',       // PAN vs CRO
  537406: 'Santa Clara',   // COL vs COD
  537337: 'Houston',       // SUI vs CAN
  537338: 'Kansas City',   // BIH vs QAT
  537344: 'Guadalajara',   // MAR vs HAI
  537343: 'Mexico City',   // SCO vs BRA
  537331: 'Dallas',        // CZE vs MEX
  537332: 'Monterrey',     // RSA vs KOR
  537355: 'Miami',         // ECU vs GER
  537356: 'Atlanta',       // CUW vs CIV
  537361: 'Toronto',       // TUN vs NED
  537362: 'New York',      // JPN vs SWE
  537349: 'Philadelphia',  // TUR vs USA
  537350: 'Boston',        // PAR vs AUS
  537395: 'Seattle',       // NOR vs FRA
  537396: 'Vancouver',     // SEN vs IRQ
  537373: 'Guadalajara',   // URY vs ESP
  537374: 'Mexico City',   // CPV vs KSA
  537367: 'Los Angeles',   // NZL vs BEL
  537368: 'Santa Clara',   // EGY vs IRN
  537413: 'Monterrey',     // PAN vs ENG
  537414: 'Dallas',        // CRO vs GHA
  537407: 'Atlanta',       // COL vs POR
  537408: 'Miami',         // COD vs UZB
  537401: 'Kansas City',   // JOR vs ARG
  537402: 'Houston',       // ALG vs AUT

  // ── Round of 32 ─────────────────────────────────────
  537415: 'Los Angeles',
  537416: 'Boston',
  537417: 'Monterrey',
  537418: 'Houston',
  537419: 'New York',
  537420: 'Dallas',
  537421: 'Mexico City',
  537422: 'Atlanta',
  537423: 'Santa Clara',
  537424: 'Seattle',
  537425: 'Toronto',
  537426: 'Los Angeles',
  537427: 'Vancouver',
  537428: 'Miami',
  537429: 'Kansas City',
  537430: 'Dallas',

  // ── Round of 16 ─────────────────────────────────────
  537375: 'Philadelphia',
  537376: 'Houston',
  537377: 'New York',
  537378: 'Mexico City',
  537379: 'Dallas',
  537380: 'Seattle',
  537381: 'Atlanta',
  537382: 'Vancouver',

  // ── Quarter-finals ───────────────────────────────────
  537383: 'Boston',
  537384: 'Los Angeles',
  537385: 'Miami',
  537386: 'Kansas City',

  // ── Semi-finals ──────────────────────────────────────
  537387: 'Dallas',
  537388: 'Atlanta',

  // ── Third place & Final ───────────────────────────────
  537389: 'Miami',
  537390: 'New York',
};
