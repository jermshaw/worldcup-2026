// Static map of football-data.org match API ID → host city
// Venue data is not returned by the API, so this is maintained manually.
export const MATCH_CITY: Record<number, string> = {
  // ── Group Stage ─────────────────────────────────────
  537327: 'Mexico City',   // MEX vs RSA
  537328: 'Dallas',        // KOR vs CZE
  537333: 'Toronto',       // CAN vs BIH
  537345: 'New York',      // USA vs PAR
  537334: 'Los Angeles',   // QAT vs SUI
  537339: 'Seattle',       // BRA vs MAR
  537340: 'Miami',         // HAI vs SCO
  537346: 'Dallas',        // AUS vs TUR
  537351: 'Boston',        // GER vs CUW
  537357: 'Houston',       // NED vs JPN
  537352: 'Houston',       // CIV vs ECU
  537358: 'Miami',         // SWE vs TUN
  537369: 'Kansas City',   // ESP vs CPV
  537363: 'Philadelphia',  // BEL vs EGY
  537370: 'Miami',         // KSA vs URY
  537364: 'Seattle',       // IRN vs NZL
  537391: 'Los Angeles',   // FRA vs SEN
  537392: 'San Jose',      // IRQ vs NOR
  537397: 'Dallas',        // ARG vs ALG
  537398: 'Las Vegas',     // AUT vs JOR
  537403: 'Boston',        // POR vs COD
  537409: 'New York',      // ENG vs CRO
  537410: 'Philadelphia',  // GHA vs PAN
  537404: 'Kansas City',   // UZB vs COL
  537329: 'Miami',         // CZE vs RSA
  537335: 'Seattle',       // SUI vs BIH
  537336: 'Vancouver',     // CAN vs QAT
  537330: 'Guadalajara',   // MEX vs KOR
  537348: 'Kansas City',   // USA vs AUS
  537342: 'Boston',        // SCO vs MAR
  537341: 'Los Angeles',   // BRA vs HAI
  537347: 'Dallas',        // TUR vs PAR
  537359: 'Houston',       // NED vs SWE
  537353: 'Atlanta',       // GER vs CIV
  537354: 'Houston',       // ECU vs CUW
  537360: 'Miami',         // TUN vs JPN
  537371: 'Los Angeles',   // ESP vs KSA
  537365: 'Atlanta',       // BEL vs IRN
  537372: 'Philadelphia',  // URY vs CPV
  537366: 'Seattle',       // NZL vs EGY
  537399: 'Dallas',        // ARG vs AUT
  537393: 'Los Angeles',   // FRA vs IRQ
  537394: 'San Jose',      // NOR vs SEN
  537400: 'Las Vegas',     // JOR vs ALG
  537405: 'Boston',        // POR vs UZB
  537411: 'Atlanta',       // ENG vs GHA
  537412: 'New York',      // PAN vs CRO
  537406: 'Miami',         // COL vs COD
  537337: 'Toronto',       // SUI vs CAN
  537338: 'Vancouver',     // BIH vs QAT
  537344: 'Seattle',       // MAR vs HAI
  537343: 'Houston',       // SCO vs BRA
  537331: 'Guadalajara',   // CZE vs MEX
  537332: 'Monterrey',     // RSA vs KOR
  537355: 'Philadelphia',  // ECU vs GER
  537356: 'Houston',       // CUW vs CIV
  537361: 'Miami',         // TUN vs NED
  537362: 'Miami',         // JPN vs SWE
  537349: 'Kansas City',   // TUR vs USA
  537350: 'Kansas City',   // PAR vs AUS
  537395: 'Dallas',        // NOR vs FRA
  537396: 'Los Angeles',   // SEN vs IRQ
  537373: 'New York',      // URY vs ESP
  537374: 'Atlanta',       // CPV vs KSA
  537367: 'Seattle',       // NZL vs BEL
  537368: 'Seattle',       // EGY vs IRN
  537413: 'Los Angeles',   // PAN vs ENG
  537414: 'Los Angeles',   // CRO vs GHA
  537407: 'Kansas City',   // COL vs POR
  537408: 'Atlanta',       // COD vs UZB
  537401: 'Las Vegas',     // JOR vs ARG
  537402: 'Las Vegas',     // ALG vs AUT

  // ── Round of 32 ─────────────────────────────────────
  537417: 'Dallas',
  537423: 'Miami',
  537415: 'Los Angeles',
  537418: 'Houston',
  537424: 'Philadelphia',
  537416: 'Seattle',
  537425: 'New York',
  537426: 'Boston',
  537422: 'Kansas City',
  537421: 'Dallas',
  537420: 'Los Angeles',
  537419: 'Miami',
  537429: 'Houston',
  537428: 'Atlanta',
  537427: 'San Jose',
  537430: 'New York',

  // ── Round of 16 ─────────────────────────────────────
  537376: 'Dallas',
  537375: 'Los Angeles',
  537377: 'New York',
  537378: 'Houston',
  537379: 'Philadelphia',
  537380: 'Seattle',
  537381: 'Miami',
  537382: 'Dallas',

  // ── Quarter-finals ───────────────────────────────────
  537383: 'Los Angeles',
  537384: 'Houston',
  537385: 'Dallas',
  537386: 'New York',

  // ── Semi-finals ──────────────────────────────────────
  537387: 'Dallas',
  537388: 'New York',

  // ── Third place & Final ───────────────────────────────
  537389: 'Miami',
  537390: 'New York',
};
