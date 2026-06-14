import { useState, useRef } from 'react';
import type { Match, Team, StandingRow } from '../data';
import { formatMatchDate } from '../data';
import { getTeamColor } from '../teamColors';
import WavingFlag from './WavingFlag';
import cardStyles from './ScheduleView.module.css';
import styles from './TeamSheet.module.css';

interface Props {
  team: Team;
  row: StandingRow | undefined;
  groupPosition: number;
  matches: Match[];
  teams: Map<string, Team>;
  onClose: () => void;
}

function isToday(dateStr: string) {
  return dateStr === new Date().toLocaleDateString('en-CA');
}

function isTomorrow(dateStr: string) {
  const t = new Date();
  t.setDate(t.getDate() + 1);
  return dateStr === t.toLocaleDateString('en-CA');
}

function dayLabel(dateStr: string) {
  if (isToday(dateStr)) return { primary: 'Today', secondary: `- ${formatMatchDate(dateStr)}` };
  if (isTomorrow(dateStr)) return { primary: 'Tomorrow', secondary: `- ${formatMatchDate(dateStr)}` };
  return { primary: formatMatchDate(dateStr), secondary: '' };
}

function matchResult(m: Match) {
  if (m.homeScore === null || m.awayScore === null) return null;
  if (m.homeScore > m.awayScore) return 'home';
  if (m.homeScore < m.awayScore) return 'away';
  return 'draw';
}

function isLive(m: Match) {
  return m.status === 'IN_PLAY' || m.status === 'PAUSED';
}

export default function TeamSheet({ team, row, groupPosition, matches, teams, onClose }: Props) {
  const teamColor = getTeamColor(team.id);
  const [dragY, setDragY] = useState(0);
  const [dismissing, setDismissing] = useState(false);
  const dragging = useRef(false);
  const startY = useRef(0);
  const sheetRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  function dismiss() {
    setDismissing(true);
    setDragY(window.innerHeight);
    setTimeout(onClose, 320);
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if ((bodyRef.current?.scrollTop ?? 0) > 0) return;
    dragging.current = true;
    startY.current = e.clientY;
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging.current) return;
    const delta = Math.max(0, e.clientY - startY.current);
    setDragY(delta);
  }

  function onPointerUp() {
    if (!dragging.current) return;
    dragging.current = false;
    if (dragY > 120) {
      dismiss();
    } else {
      setDragY(0);
    }
  }

  const teamMatches = matches.filter(
    m => m.stage === 'Group Stage' && (m.homeTeamId === team.id || m.awayTeamId === team.id)
  );

  const byDate = new Map<string, Match[]>();
  for (const m of teamMatches) {
    const arr = byDate.get(m.date) ?? [];
    arr.push(m);
    byDate.set(m.date, arr);
  }
  const dateGroups = [...byDate.entries()].sort(([a], [b]) => a.localeCompare(b));

  return (
    <div
      className={`${styles.overlay} ${dismissing ? styles.overlayOut : ''}`}
      onClick={dismiss}
    >
      <div
        ref={sheetRef}
        className={styles.sheet}
        style={{
          background: teamColor,
          transform: `translateY(${dragY}px)`,
          transition: dragging.current ? 'none' : 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
        }}
        onClick={e => e.stopPropagation()}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {/* Drag handle */}
        <div className={styles.dragHandle} />

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <WavingFlag teamId={team.id} />
            <h2 className={styles.teamName}>{team.name}</h2>
            <p className={styles.teamSub}>Group {team.group} · Position {groupPosition}</p>
          </div>
          <div className={styles.statsRow}>
            <StatBlock label="Points" value={row?.pts ?? 0} />
            <div className={styles.statDiv} />
            <StatBlock label="Wins" value={row?.w ?? 0} />
            <div className={styles.statDiv} />
            <StatBlock label="Losses" value={row?.l ?? 0} dim={(row?.l ?? 0) === 0} />
            <div className={styles.statDiv} />
            <StatBlock label="Draws" value={row?.d ?? 0} dim={(row?.d ?? 0) === 0} />
          </div>
        </div>

        {/* Matches */}
        <div ref={bodyRef} className={styles.body}>
          {dateGroups.length === 0 && (
            <p className={styles.empty}>No matches found</p>
          )}
          {dateGroups.map(([date, dayMatches]) => {
            const { primary, secondary } = dayLabel(date);
            return (
              <div key={date} className={styles.dateGroup}>
                <div className={styles.dateLabel}>
                  <span className={styles.datePrimary}>{primary}</span>
                  {secondary && <span className={styles.dateSecondary}> {secondary}</span>}
                </div>
                {dayMatches.map(m => {
                  const home = teams.get(m.homeTeamId);
                  const away = teams.get(m.awayTeamId);
                  if (!home || !away) return null;

                  const result = matchResult(m);
                  const homeDim = result === 'away';
                  const awayDim = result === 'home';
                  const homeColor = getTeamColor(m.homeTeamId);
                  const awayColor = getTeamColor(m.awayTeamId);
                  const live = isLive(m);

                  return (
                    <div key={m.id} className={`${cardStyles.card} ${live ? cardStyles.cardLive : ''}`}>
                      <div
                        className={`${cardStyles.teamSide} ${cardStyles.teamSideLeft} ${homeDim ? cardStyles.teamSideDim : ''}`}
                        style={{ background: homeColor }}
                      >
                        {home.crest
                          ? <img src={home.crest} className={cardStyles.teamFlagImg} alt={home.name} />
                          : <span className={cardStyles.teamFlag}>{home.flag}</span>}
                        <span className={cardStyles.teamName}>{home.name}</span>
                      </div>
                      <div
                        className={`${cardStyles.teamSide} ${cardStyles.teamSideRight} ${awayDim ? cardStyles.teamSideDim : ''}`}
                        style={{ background: awayColor }}
                      >
                        {away.crest
                          ? <img src={away.crest} className={cardStyles.teamFlagImg} alt={away.name} />
                          : <span className={cardStyles.teamFlag}>{away.flag}</span>}
                        <span className={cardStyles.teamName}>{away.name}</span>
                      </div>
                      <div className={`${cardStyles.overlay} ${live ? cardStyles.overlayLive : ''}`}>
                        {live && (
                          <div className={cardStyles.liveBadge}>
                            <span className={cardStyles.liveDot} />
                            <span className={cardStyles.liveText}>LIVE</span>
                          </div>
                        )}
                        {m.homeScore !== null && m.awayScore !== null ? (
                          <div className={cardStyles.score}>
                            <span className={cardStyles.scoreNum}>{m.homeScore}</span>
                            <span className={cardStyles.scoreDash}>&nbsp;-&nbsp;</span>
                            <span className={cardStyles.scoreNum}>{m.awayScore}</span>
                          </div>
                        ) : (
                          <div className={cardStyles.time}>{m.time}</div>
                        )}
                        <div className={cardStyles.groupLabel}>Group {m.group}</div>
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

function StatBlock({ label, value, dim }: { label: string; value: number; dim?: boolean }) {
  return (
    <div className={styles.statBlock}>
      <span className={`${styles.statNum} ${dim ? styles.statDim : ''}`}>{value}</span>
      <span className={styles.statLbl}>{label}</span>
    </div>
  );
}
