import { useMemo } from 'react';
import type { Match, Team } from '../data';
import styles from './BracketView.module.css';

interface Props {
  matches: Match[];
  teams: Map<string, Team>;
}

const CARD_H = 56;
const CARD_W = 130;
const COL_GAP = 30;
const SLOT_H = 64; // CARD_H + 8px gap
const HEADER_H = 28;
const PAD_X = 16;
const PAD_Y = 12;

const ROUNDS = [
  { stage: 'Round of 32',  label: 'Round of 32',   count: 16 },
  { stage: 'Round of 16',  label: 'Round of 16',   count: 8  },
  { stage: 'Quarter-final', label: 'Quarter-finals', count: 4  },
  { stage: 'Semi-final',   label: 'Semi-finals',   count: 2  },
  { stage: 'Final',        label: 'Final',         count: 1  },
] as const;

// Compute absolute top positions for each card in each round.
// Each next-round card is centered between its two feeder cards.
function buildLayout() {
  const layout: Array<{
    stage: string;
    label: string;
    count: number;
    tops: number[];
    left: number;
  }> = [];

  let tops = Array.from({ length: 16 }, (_, i) => i * SLOT_H);

  for (let ri = 0; ri < ROUNDS.length; ri++) {
    const r = ROUNDS[ri];
    const left = PAD_X + ri * (CARD_W + COL_GAP);
    layout.push({ ...r, tops: tops.slice(0, r.count), left });

    // Next round: each card centered between pairs
    const next: number[] = [];
    for (let i = 0; i < tops.length - 1; i += 2) {
      const c1 = tops[i] + CARD_H / 2;
      const c2 = tops[i + 1] + CARD_H / 2;
      next.push((c1 + c2) / 2 - CARD_H / 2);
    }
    tops = next;
  }

  return layout;
}

const LAYOUT = buildLayout();
const TOTAL_W = PAD_X * 2 + ROUNDS.length * CARD_W + (ROUNDS.length - 1) * COL_GAP;
const TOTAL_H = PAD_Y + HEADER_H + 15 * SLOT_H + CARD_H + PAD_Y;

export default function BracketView({ matches, teams }: Props) {
  // Index knockout matches by stage + matchday (1-based position in round)
  const bySlot = useMemo(() => {
    const map = new Map<string, Match>();
    for (const m of matches) {
      if (m.stage !== 'Group Stage' && m.matchday != null) {
        map.set(`${m.stage}:${m.matchday}`, m);
      }
    }
    return map;
  }, [matches]);

  // y origin for cards (below headers)
  const cardY0 = PAD_Y + HEADER_H;

  return (
    <div className={styles.root}>
      <div className={styles.scroll}>
        <div className={styles.inner} style={{ width: TOTAL_W, height: TOTAL_H }}>

          {/* Connector lines */}
          <svg
            className={styles.svg}
            width={TOTAL_W}
            height={TOTAL_H}
          >
            {LAYOUT.slice(0, -1).map((round, ri) => {
              const next = LAYOUT[ri + 1];
              return round.tops.map((top, i) => {
                if (i % 2 !== 0) return null;
                const x1 = round.left + CARD_W;
                const xMid = round.left + CARD_W + COL_GAP / 2;
                const x2 = next.left;
                const y1 = cardY0 + top + CARD_H / 2;
                const y2 = cardY0 + round.tops[i + 1] + CARD_H / 2;
                const yNext = cardY0 + next.tops[i / 2] + CARD_H / 2;
                return (
                  <g key={`${ri}-${i}`}>
                    <line x1={x1}    y1={y1}    x2={xMid}  y2={y1}    />
                    <line x1={x1}    y1={y2}    x2={xMid}  y2={y2}    />
                    <line x1={xMid}  y1={y1}    x2={xMid}  y2={y2}    />
                    <line x1={xMid}  y1={yNext} x2={x2}    y2={yNext} />
                  </g>
                );
              });
            })}
          </svg>

          {/* Round headers + cards */}
          {LAYOUT.map(round =>
            round.tops.map((top, idx) => {
              const match = bySlot.get(`${round.stage}:${idx + 1}`);
              const home = match ? teams.get(match.homeTeamId) : null;
              const away = match ? teams.get(match.awayTeamId) : null;
              const scored = match?.homeScore != null && match?.awayScore != null;
              const homeWon = scored && match!.homeScore! > match!.awayScore!;
              const awayWon = scored && match!.awayScore! > match!.homeScore!;

              return (
                <div key={`${round.stage}-${idx}`}>
                  {/* Header for this column (render once per column, idx === 0) */}
                  {idx === 0 && (
                    <div
                      className={styles.colHeader}
                      style={{ left: round.left, top: PAD_Y, width: CARD_W }}
                    >
                      {round.label}
                    </div>
                  )}

                  <div
                    className={styles.card}
                    style={{ left: round.left, top: cardY0 + top, width: CARD_W, height: CARD_H }}
                  >
                    <div className={`${styles.team} ${scored && !homeWon ? styles.loser : ''}`}>
                      <span className={styles.flag}>{home?.flag ?? ''}</span>
                      <span className={styles.name}>{home?.name ?? 'TBD'}</span>
                      {scored && <span className={styles.score}>{match!.homeScore}</span>}
                    </div>
                    <div className={styles.divider} />
                    <div className={`${styles.team} ${scored && !awayWon ? styles.loser : ''}`}>
                      <span className={styles.flag}>{away?.flag ?? ''}</span>
                      <span className={styles.name}>{away?.name ?? 'TBD'}</span>
                      {scored && <span className={styles.score}>{match!.awayScore}</span>}
                    </div>
                  </div>
                </div>
              );
            })
          )}

        </div>
      </div>
    </div>
  );
}
