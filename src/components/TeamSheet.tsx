import { useState, useRef, useEffect } from 'react';
import type { Match, Team, StandingRow } from '../data';
import { formatMatchDate, isLive } from '../data';
import { getTeamColor } from '../teamColors';
import { FIFA_RANKINGS } from '../fifaRankings';
import WavingFlag from './WavingFlag';
import MatchSheet from './MatchSheet';
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


export default function TeamSheet({ team, row, matches, teams, onClose }: Props) {
  const teamColor = getTeamColor(team.id);
  const [dragY, setDragY] = useState(0);
  const [dismissing, setDismissing] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [squad, setSquad] = useState<{ id: number; name: string; position: string | null; dateOfBirth: string | null }[]>([]);
  const [coach, setCoach] = useState<string | null>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const touchActive = useRef(false);
  const touchStartY = useRef(0);
  const touchCurY = useRef(0);
  const pointerActive = useRef(false);
  const pointerStartY = useRef(0);

  useEffect(() => {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const prev = document.body.style.overflow;
    const prevPad = document.body.style.paddingRight;
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;
    return () => {
      document.body.style.overflow = prev;
      document.body.style.paddingRight = prevPad;
    };
  }, []);

  useEffect(() => {
    fetch('/.netlify/functions/squads')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data?.[team.id]) return;
        setCoach(data[team.id].coach);
        setSquad(data[team.id].squad);
      })
      .catch(() => null);
  }, [team.id]);

  function dismiss() {
    setDismissing(true);
    setDragY(window.innerHeight);
    setTimeout(onClose, 320);
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType === 'touch') return;
    pointerStartY.current = e.clientY;
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType === 'touch') return;
    if (!(e.buttons & 1)) return;
    const dy = e.clientY - pointerStartY.current;
    const scrolled = bodyRef.current?.scrollTop ?? 0;
    if (pointerActive.current) {
      setDragY(Math.max(0, dy));
    } else if (scrolled === 0 && dy > 10) {
      pointerActive.current = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      setDragY(dy);
    }
  }

  function onPointerUp() {
    if (!pointerActive.current) return;
    pointerActive.current = false;
    setDragY(prev => {
      if (prev > 120) { setDismissing(true); setTimeout(onClose, 320); return window.innerHeight; }
      return 0;
    });
  }

  useEffect(() => {
    const sheet = sheetRef.current;
    if (!sheet) return;

    function onTouchStart(e: TouchEvent) {
      touchStartY.current = e.touches[0].clientY;
      touchActive.current = false;
      touchCurY.current = 0;
    }

    function onTouchMove(e: TouchEvent) {
      const dy = e.touches[0].clientY - touchStartY.current;
      const scrolled = bodyRef.current?.scrollTop ?? 0;
      if (touchActive.current || (scrolled === 0 && dy > 0)) {
        touchActive.current = true;
        e.preventDefault();
        touchCurY.current = Math.max(0, dy);
        setDragY(touchCurY.current);
      }
    }

    function onTouchEnd() {
      if (!touchActive.current) return;
      touchActive.current = false;
      if (touchCurY.current > 120) {
        setDismissing(true);
        setDragY(window.innerHeight);
        setTimeout(onClose, 320);
      } else {
        setDragY(0);
      }
    }

    sheet.addEventListener('touchstart', onTouchStart, { passive: true });
    sheet.addEventListener('touchmove', onTouchMove, { passive: false });
    sheet.addEventListener('touchend', onTouchEnd);
    sheet.addEventListener('touchcancel', onTouchEnd);
    return () => {
      sheet.removeEventListener('touchstart', onTouchStart);
      sheet.removeEventListener('touchmove', onTouchMove);
      sheet.removeEventListener('touchend', onTouchEnd);
      sheet.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [onClose]);

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
    <>
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
          transition: (touchActive.current || pointerActive.current) ? 'none' : 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
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
            <p className={styles.teamSub}>
              Group {team.group}{FIFA_RANKINGS[team.id] ? <> • Ranked <span className={styles.rankNum}>{FIFA_RANKINGS[team.id]}</span> in the world</> : ''}
            </p>
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
                      <button
                        className={`${cardStyles.overlay} ${live ? cardStyles.overlayLive : ''}`}
                        onClick={() => setSelectedMatch(m)}
                      >
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
                      </button>
                    </div>
                  );
                })}
              </div>
            );
          })}

          {squad.length > 0 && (
            <div className={styles.squadCard}>
              <p className={styles.squadTitle}>Squad</p>
              {coach && (
                <div className={styles.squadGroup}>
                  <p className={styles.squadPos}>Coach</p>
                  <div className={styles.squadRow}>
                    <span className={styles.squadName}>{coach}</span>
                  </div>
                </div>
              )}
              {(['Goalkeeper', 'Defence', 'Midfield', 'Offence'] as const).map(pos => {
                const players = squad.filter(p => p.position === pos);
                if (!players.length) return null;
                const label: Record<string, string> = { Goalkeeper: 'Goalkeepers', Defence: 'Defenders', Midfield: 'Midfielders', Offence: 'Forwards' };
                return (
                  <div key={pos} className={styles.squadGroup}>
                    <p className={styles.squadPos}>{label[pos]}</p>
                    {players.map(p => (
                      <div key={p.id} className={styles.squadRow}>
                        <span className={styles.squadName}>{p.name}</span>
                        {p.dateOfBirth && (
                          <span className={styles.squadDob}>
                            {new Date().getFullYear() - new Date(p.dateOfBirth).getFullYear()}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
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

function StatBlock({ label, value, dim }: { label: string; value: number; dim?: boolean }) {
  return (
    <div className={styles.statBlock}>
      <span className={`${styles.statNum} ${dim ? styles.statDim : ''}`}>{value}</span>
      <span className={styles.statLbl}>{label}</span>
    </div>
  );
}
