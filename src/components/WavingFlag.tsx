import { useRef, useEffect } from 'react';
import styles from './WavingFlag.module.css';

// TLA (3-letter code) → ISO 3166-1 alpha-2 for flags.fmcdn.net
const TLA_TO_ISO2: Record<string, string> = {
  USA: 'us', MEX: 'mx', URU: 'uy', URY: 'uy', PAN: 'pa',
  ARG: 'ar', CAN: 'ca', CHI: 'cl', ALB: 'al',
  BRA: 'br', GER: 'de', JPN: 'jp', SLE: 'sl',
  FRA: 'fr', MAR: 'ma', CRO: 'hr', BEL: 'be',
  ESP: 'es', NED: 'nl', SEN: 'sn', SRB: 'rs',
  ENG: 'gb', POR: 'pt', COL: 'co', THA: 'th',
  ITA: 'it', NGA: 'ng', KOR: 'kr', POL: 'pl',
  ECU: 'ec', EGY: 'eg', DEN: 'dk', AUS: 'au',
  PER: 'pe', TUN: 'tn', UKR: 'ua', IRN: 'ir',
  NZL: 'nz', SUI: 'ch', TUR: 'tr', CMR: 'cm',
  KSA: 'sa', VEN: 've', GHA: 'gh', RSA: 'za',
  NOR: 'no', SWE: 'se', ROU: 'ro', HUN: 'hu',
  SVK: 'sk', CZE: 'cz', SVN: 'si', GRE: 'gr',
  SCO: 'gb-sct', WAL: 'gb-wls', IRL: 'ie', ISL: 'is',
  CRC: 'cr', HON: 'hn', JAM: 'jm', TRI: 'tt',
  HAI: 'ht', CUW: 'cw', BOL: 'bo', PAR: 'py', CPV: 'cv',
  ALG: 'dz', AUT: 'at', BIH: 'ba', CIV: 'ci',
  COD: 'cd', EQG: 'gq', GAB: 'ga', MOZ: 'mz',
  TAN: 'tz', ZIM: 'zw', ANG: 'ao', CHN: 'cn',
  IND: 'in', IDN: 'id', IRQ: 'iq', JOR: 'jo',
  KUW: 'kw', QAT: 'qa', UAE: 'ae', UZB: 'uz',
};

// Deterministic 0..1 value from a string — gives each team unique animation params
function hashStr(s: string): number {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  return h / 0xffff;
}

const BASE_W = 210;
const BASE_H = 111;
const BASE_CANVAS_H = 125;
const BASE_FREQUENCY = 40;
const BASE_AMPLITUDE = 7;

export default function WavingFlag({ teamId, width = BASE_W, timeOffset = 0 }: { teamId: string; width?: number; timeOffset?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const iso2 = TLA_TO_ISO2[teamId];
    if (!iso2) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const s = width / BASE_W;
    const W = width;
    const H = Math.round(BASE_H * s);
    const CANVAS_H = Math.round(BASE_CANVAS_H * s);
    const FREQUENCY = BASE_FREQUENCY * s;
    const AMPLITUDE = BASE_AMPLITUDE * s;

    // HiDPI fix: render at physical pixel density, display at CSS size
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const physW = W * dpr;
    const physH = H * dpr;
    const physCanvasH = CANVAS_H * dpr;
    const physAmp = AMPLITUDE * dpr;

    canvas.width = physW;
    canvas.height = physCanvasH;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${CANVAS_H}px`;

    const off = document.createElement('canvas');
    off.width = physW;
    off.height = physH;
    const oCtx = off.getContext('2d')!;

    const img = new Image();
    img.src = `https://flags.fmcdn.net/data/flags/w580/${iso2}.png`;

    // Per-team animation signature derived from TLA hash
    const h1 = hashStr(teamId);
    const h2 = hashStr(teamId + teamId);  // second independent hash via doubled string
    const h3 = hashStr(teamId + '~');
    const gustFreq    = 0.013 + h1 * 0.009;   // 0.013..0.022 (~5–8s gust period)
    const gustAmp     = 0.45  + h1 * 0.22;    // 0.45..0.67
    const flutterFreq = 0.033 + h2 * 0.016;   // 0.033..0.049 (~2–3s flutter)
    const flutterAmp  = 0.15  + h2 * 0.17;    // 0.15..0.32
    const flutterPh   = h2 * Math.PI * 2;
    const breathFreq  = 0.016 + h3 * 0.009;
    const breathAmp   = 0.10  + h3 * 0.12;
    const breathPh    = h3 * Math.PI * 2;

    let time = timeOffset;
    let frame = 0;
    let rafId: number;

    function drawFrame() {
      const speed = 1.0
        + gustAmp    * Math.sin(frame * gustFreq)
        + flutterAmp * Math.sin(frame * flutterFreq + flutterPh);

      const amp = physAmp * (1 + breathAmp * Math.sin(frame * breathFreq + breathPh));

      ctx!.clearRect(0, 0, physW, physCanvasH);
      for (let x = 0; x < W; x++) {
        const yOffset = Math.sin((x + time) / FREQUENCY) * amp;
        const px = x * dpr;
        ctx!.drawImage(off, px, 0, dpr, physH, px, yOffset + amp, dpr, physH);
        const slope = Math.cos((x + time) / FREQUENCY);
        const alpha = Math.abs(slope) * 0.18;
        ctx!.fillStyle = slope > 0
          ? `rgba(255,255,255,${alpha})`
          : `rgba(0,0,0,${alpha})`;
        ctx!.fillRect(px, yOffset + amp, dpr, physH);
      }
      time -= speed;
      frame++;
      rafId = requestAnimationFrame(drawFrame);
    }

    img.onload = () => {
      oCtx.drawImage(img, 0, 0, physW, physH);
      rafId = requestAnimationFrame(drawFrame);
    };

    return () => cancelAnimationFrame(rafId);
  }, [teamId, width, timeOffset]);

  return <canvas ref={canvasRef} className={styles.flag} />;
}
