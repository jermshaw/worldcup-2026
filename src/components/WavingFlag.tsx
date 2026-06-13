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
  HAI: 'ht', CUW: 'cw', BOL: 'bo', PAR: 'py',
  ALG: 'dz', AUT: 'at', BIH: 'ba', CIV: 'ci',
  COD: 'cd', EQG: 'gq', GAB: 'ga', MOZ: 'mz',
  TAN: 'tz', ZIM: 'zw', ANG: 'ao', CHN: 'cn',
  IND: 'in', IDN: 'id', IRQ: 'iq', JOR: 'jo',
  KUW: 'kw', QAT: 'qa', UAE: 'ae', UZB: 'uz',
};

const W = 210;
const H = 111;
const CANVAS_H = 125;
const FREQUENCY = 40;
const AMPLITUDE = 7;

export default function WavingFlag({ teamId }: { teamId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const iso2 = TLA_TO_ISO2[teamId];
    if (!iso2) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const off = document.createElement('canvas');
    off.width = W;
    off.height = H;
    const oCtx = off.getContext('2d')!;

    const img = new Image();
    img.src = `https://flags.fmcdn.net/data/flags/w580/${iso2}.png`;

    let time = 0;
    let rafId: number;

    function drawFrame() {
      ctx!.clearRect(0, 0, W, CANVAS_H);
      for (let x = 0; x < W; x++) {
        const yOffset = Math.sin((x + time) / FREQUENCY) * AMPLITUDE;
        ctx!.drawImage(off, x, 0, 1, H, x, yOffset + AMPLITUDE, 1, H);
        const slope = Math.cos((x + time) / FREQUENCY);
        const alpha = Math.abs(slope) * 0.18;
        ctx!.fillStyle = slope > 0
          ? `rgba(255,255,255,${alpha})`
          : `rgba(0,0,0,${alpha})`;
        ctx!.fillRect(x, yOffset + AMPLITUDE, 1, H);
      }
      time -= 1;
      rafId = requestAnimationFrame(drawFrame);
    }

    img.onload = () => {
      oCtx.drawImage(img, 0, 0, W, H);
      rafId = requestAnimationFrame(drawFrame);
    };

    return () => cancelAnimationFrame(rafId);
  }, [teamId]);

  return <canvas ref={canvasRef} width={W} height={CANVAS_H} className={styles.flag} />;
}
