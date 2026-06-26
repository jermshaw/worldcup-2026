import { useMemo, useEffect } from 'react';
import type { Match, Team, Group, StandingRow } from '../data';
import { GROUPS } from '../data';
import { getGroupSummary } from '../utils/stakeSummary';
import { getTeamColor, getTeamTextColor } from '../teamColors';
import styles from './StandingsView.module.css';

interface Props {
  matches: Match[];
  teams: Map<string, Team>;
  standings: Map<Group, StandingRow[]>;
}

const CARD_W  = 300;
const CARD_H  = 68;
const COL_GAP = 30;
const COL_W   = CARD_W + COL_GAP; // 307
const SLOT_H  = 76;
const HEADER_H = 24;
const PAD_Y   = 16;

const KNOCKOUT_ROUNDS = [
  { stage: 'Round of 32',   label: 'Round of 32',    count: 16 },
  { stage: 'Round of 16',   label: 'Round of 16',    count: 8  },
  { stage: 'Quarter-final', label: 'Quarter-finals',  count: 4  },
  { stage: 'Semi-final',    label: 'Semi-finals',    count: 2  },
  { stage: 'Final',         label: 'Final',          count: 1  },
] as const;

function buildLayout() {
  let tops = Array.from({ length: 16 }, (_, i) => PAD_Y + HEADER_H + i * SLOT_H);
  return KNOCKOUT_ROUNDS.map(round => {
    const roundTops = tops.slice(0, round.count);
    const next: number[] = [];
    for (let i = 0; i < tops.length - 1; i += 2) {
      const c1 = tops[i] + CARD_H / 2;
      const c2 = tops[i + 1] + CARD_H / 2;
      next.push((c1 + c2) / 2 - CARD_H / 2);
    }
    tops = next;
    return { ...round, tops: roundTops };
  });
}

const LAYOUT = buildLayout();
const BRACKET_H = PAD_Y + HEADER_H + 15 * SLOT_H + CARD_H + PAD_Y;
// Last column has no gap after it
const BRACKET_W = (KNOCKOUT_ROUNDS.length - 1) * COL_W + CARD_W;

export default function StandingsView({ matches, teams, standings }: Props) {
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, []);

  const bySlot = useMemo(() => {
    const map = new Map<string, Match>();
    const byStage = new Map<string, Match[]>();
    for (const m of matches) {
      if (m.stage !== 'Group Stage') {
        const list = byStage.get(m.stage) ?? [];
        list.push(m);
        byStage.set(m.stage, list);
      }
    }
    for (const [stage, stageMatches] of byStage) {
      stageMatches.sort((a, b) => a.apiId - b.apiId);
      stageMatches.forEach((m, i) => map.set(`${stage}:${i + 1}`, m));
    }
    return map;
  }, [matches]);

  return (
    <div className={styles.root}>
      <h1 className={styles.title}>Standings</h1>

      <div className={styles.mainScroll}>

        {/* ── Group Stage ───────────────────────────────── */}
        <div className={styles.groupSection}>
          <p className={styles.stageLabel}>Group stage</p>
          {GROUPS.map(group => {
            const rows = standings.get(group) ?? [];
            if (rows.length === 0) return null;
            return (
              <div key={group} className={styles.card}>
                <p className={styles.groupTitle}>Group {group}</p>
                {(() => { const s = getGroupSummary(rows, teams, group); return s ? <p className={styles.groupSummary}>{s}</p> : null; })()}
                {rows.map((row, idx) => {
                  const team = teams.get(row.teamId);
                  const isAdvancing = idx < 2;
                  return (
                    <div key={row.teamId}>
                      <div className={styles.rowDivider} />
                      <div className={`${styles.teamRow} ${isAdvancing ? '' : styles.teamRowMuted}`}>
                        <div className={styles.teamLeft}>
                          <span className={styles.teamFlag}>{team?.flag ?? ''}</span>
                          <span className={styles.teamName}>{team?.name ?? row.teamId}</span>
                        </div>
                        <span className={styles.teamPts}>{row.pts}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* ── Knockout Bracket ──────────────────────────── */}
        <div className={styles.bracketScroll}>

            {/* SVG connector lines spanning the full canvas */}
            <svg
              className={styles.bracketSvg}
              width={BRACKET_W}
              height={BRACKET_H}
            >
              {LAYOUT.slice(0, -1).map((round, ri) => {
                const next = LAYOUT[ri + 1];
                return round.tops.map((top, i) => {
                  if (i % 2 !== 0) return null;
                  const x1    = ri * COL_W + CARD_W;
                  const xMid  = ri * COL_W + CARD_W + COL_GAP / 2;
                  const x2    = (ri + 1) * COL_W;
                  const y1    = top + CARD_H / 2;
                  const y2    = round.tops[i + 1] + CARD_H / 2;
                  const yNext = next.tops[i / 2] + CARD_H / 2;
                  return (
                    <g key={`${ri}-${i}`}>
                      <line x1={x1}   y1={y1}    x2={xMid}  y2={y1}    />
                      <line x1={x1}   y1={y2}    x2={xMid}  y2={y2}    />
                      <line x1={xMid} y1={y1}    x2={xMid}  y2={y2}    />
                      <line x1={xMid} y1={yNext} x2={x2}    y2={yNext} />
                    </g>
                  );
                });
              })}
            </svg>

            {/* Round columns — each is a snap target */}
            {LAYOUT.map((round, ri) => {
              const isLast = ri === LAYOUT.length - 1;
              return (
                <div
                  key={round.stage}
                  className={styles.roundCol}
                  style={{ width: isLast ? CARD_W : COL_W, height: BRACKET_H }}
                >
                  {/* Column header */}
                  <div className={styles.roundLabel} style={{ top: 0, width: CARD_W }}>
                    {round.label}
                  </div>

                  {/* Match cards */}
                  {round.tops.map((top, idx) => {
                    const match  = bySlot.get(`${round.stage}:${idx + 1}`);
                    const home   = match ? teams.get(match.homeTeamId) : null;
                    const away   = match ? teams.get(match.awayTeamId) : null;
                    const scored = match?.homeScore != null && match?.awayScore != null;
                    const homeWon = scored && match!.homeScore! > match!.awayScore!;
                    const awayWon = scored && match!.awayScore! > match!.homeScore!;

                    const homeColor = home ? getTeamColor(match!.homeTeamId) : null;
                    const awayColor = away ? getTeamColor(match!.awayTeamId) : null;
                    const cardBg = homeColor && awayColor
                      ? `linear-gradient(160deg, ${homeColor} 0%, ${awayColor} 100%)`
                      : homeColor
                      ? `linear-gradient(160deg, ${homeColor} 0%, #1a1a1a 100%)`
                      : awayColor
                      ? `linear-gradient(160deg, #1a1a1a 0%, ${awayColor} 100%)`
                      : undefined;

                    return (
                      <div
                        key={idx}
                        className={styles.bracketCard}
                        style={{ top, width: CARD_W, height: CARD_H, ...(cardBg ? { background: cardBg } : {}) }}
                      >
                        <div className={`${styles.bracketTeam} ${scored && !homeWon ? styles.bracketLoser : ''}`}>
                          {home ? (
                            <>
                              <span className={styles.bracketFlag}>{home.flag}</span>
                              <span className={styles.bracketName} style={{ color: getTeamTextColor(match!.homeTeamId) }}>{home.name}</span>
                              {scored && <span className={styles.bracketScore} style={{ color: getTeamTextColor(match!.homeTeamId) }}>{match!.homeScore}</span>}
                            </>
                          ) : <span className={styles.bracketTbd}>TBD</span>}
                        </div>
                        <div className={styles.bracketDivider} />
                        <div className={`${styles.bracketTeam} ${scored && !awayWon ? styles.bracketLoser : ''}`}>
                          {away ? (
                            <>
                              <span className={styles.bracketFlag}>{away.flag}</span>
                              <span className={styles.bracketName} style={{ color: getTeamTextColor(match!.awayTeamId) }}>{away.name}</span>
                              {scored && <span className={styles.bracketScore} style={{ color: getTeamTextColor(match!.awayTeamId) }}>{match!.awayScore}</span>}
                            </>
                          ) : <span className={styles.bracketTbd}>TBD</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
        </div>

      </div>
    </div>
  );
}
