import { useMemo, useEffect, useState, useRef, useCallback } from 'react';
import type { Match, Team, Group, StandingRow } from '../data';
import { GROUPS } from '../data';
import { getGroupSummary } from '../utils/stakeSummary';
import { getTeamColor, getTeamTextColor } from '../teamColors';
import MatchSheet from './MatchSheet';
import styles from './StandingsView.module.css';

interface Props {
  matches: Match[];
  teams: Map<string, Team>;
  standings: Map<Group, StandingRow[]>;
}

const CARD_W  = 330;
const CARD_H  = 104;
const COL_GAP = 30;
const COL_W   = CARD_W + COL_GAP;
const SLOT_H  = 114;
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
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollX, setScrollX] = useState(0);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollX(e.currentTarget.scrollLeft);
  }, []);

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

    // ── Round of 32: infer bracket order from R16 pairings ──
    // R16 apiIds are sequential in bracket order (created as placeholders before the
    // tournament). R32 apiIds are also sequential but in calendar/schedule order, which
    // does not match bracket pairing. We recover the correct R32 order by looking at
    // which R32 matches produced each R16 team.
    const r32All = (byStage.get('Round of 32') ?? []).sort((a, b) => a.apiId - b.apiId);
    const r16All = (byStage.get('Round of 16') ?? []).sort((a, b) => a.apiId - b.apiId);

    const winnerToR32 = new Map<string, Match>();
    for (const m of r32All) {
      if (m.status === 'FINISHED' && m.homeScore !== null && m.awayScore !== null) {
        if (m.homeScore !== m.awayScore) {
          const winner = m.homeScore > m.awayScore ? m.homeTeamId : m.awayTeamId;
          winnerToR32.set(winner, m);
        }
      }
    }

    const r32Ordered: (Match | null)[] = [];
    const usedR32Ids = new Set<string>();

    for (const r16 of r16All) {
      const homeTbd = r16.homeTeamId.startsWith('TBD');
      const awayTbd = r16.awayTeamId.startsWith('TBD');
      const homeR32 = homeTbd ? null : (winnerToR32.get(r16.homeTeamId) ?? null);
      const awayR32 = awayTbd ? null : (winnerToR32.get(r16.awayTeamId) ?? null);

      for (const r32 of [homeR32, awayR32]) {
        if (r32 && !usedR32Ids.has(r32.id)) {
          r32Ordered.push(r32);
          usedR32Ids.add(r32.id);
        } else {
          r32Ordered.push(null);
        }
      }
    }

    // Fill null slots with unmatched R32 matches in apiId order
    const r32Remaining = r32All.filter(m => !usedR32Ids.has(m.id));
    let ri = 0;
    for (let i = 0; i < r32Ordered.length; i++) {
      if (r32Ordered[i] === null && ri < r32Remaining.length) {
        r32Ordered[i] = r32Remaining[ri++];
      }
    }
    while (ri < r32Remaining.length) r32Ordered.push(r32Remaining[ri++]);

    r32Ordered.forEach((m, i) => { if (m) map.set(`Round of 32:${i + 1}`, m); });

    // ── All other knockout rounds: apiId order = bracket order ──
    // If the API created new match records for known teams (instead of updating
    // the original TBD placeholders), there may be more matches than bracket slots.
    // In that case, drop all-TBD matches so known matchups take the visible slots.
    for (const [stage, stageMatches] of byStage) {
      if (stage === 'Round of 32') continue;
      stageMatches.sort((a, b) => a.apiId - b.apiId);
      const expectedCount = KNOCKOUT_ROUNDS.find(r => r.stage === stage)?.count;
      let toSlot = stageMatches;
      if (expectedCount && stageMatches.length > expectedCount) {
        const known = stageMatches.filter(m => !m.homeTeamId.startsWith('TBD') || !m.awayTeamId.startsWith('TBD'));
        const tbd   = stageMatches.filter(m =>  m.homeTeamId.startsWith('TBD') && m.awayTeamId.startsWith('TBD'));
        toSlot = [...known, ...tbd].slice(0, expectedCount);
        toSlot.sort((a, b) => a.apiId - b.apiId);
      }
      toSlot.forEach((m, i) => map.set(`${stage}:${i + 1}`, m));
    }

    return map;
  }, [matches]);

  return (
    <>
    <div className={styles.root}>
      <h1 className={styles.title}>Standings</h1>

      {/* ── Sticky column labels ── */}
      <div className={styles.labelStrip}>
        <div
          className={styles.labelInner}
          style={{ transform: `translateX(-${scrollX}px)` }}
        >
          <div className={styles.labelColHeader} style={{ width: 330 }}>Group stage</div>
          {LAYOUT.map((round, ri) => (
            <div
              key={round.stage}
              className={styles.labelColHeader}
              style={{ width: ri === LAYOUT.length - 1 ? CARD_W : COL_W }}
            >
              {round.label}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.mainScroll} ref={scrollRef} onScroll={handleScroll}>

        {/* ── Group Stage ───────────────────────────────── */}
        <div className={styles.groupSection}>
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

                    const tappable = match && (home || away);
                    return (
                      <div
                        key={idx}
                        className={styles.bracketCard}
                        style={{ top, width: CARD_W, height: CARD_H, ...(cardBg ? { background: cardBg } : {}), ...(tappable ? { cursor: 'pointer' } : {}) }}
                        onClick={tappable ? () => setSelectedMatch(match) : undefined}
                      >
                        {match && (
                          <div className={styles.bracketMatchInfo}>
                            {(() => { const d = new Date(`${match.date}T12:00:00`); return `${d.toLocaleDateString('en-US', { weekday: 'short' })} • ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • ${match.time}`; })()}
                          </div>
                        )}
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

    {selectedMatch && (
      <MatchSheet
        match={selectedMatch}
        teams={teams}
        onClose={() => setSelectedMatch(null)}
      />
    )}
    </>
  );
}
