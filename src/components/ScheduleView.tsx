import { useMemo, useEffect, useRef, useState } from 'react';
import type { Match, Team, Group, StandingRow } from '../data';
import { formatMatchDate } from '../data';
import { getTeamColor } from '../teamColors';
import TeamSheet from './TeamSheet';
import styles from './ScheduleView.module.css';

interface Props {
  matches: Match[];
  teams: Map<string, Team>;
  standings: Map<Group, StandingRow[]>;
}

function isToday(dateStr: string) {
  return dateStr === new Date().toLocaleDateString('en-CA');
}

function isTomorrow(dateStr: string) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return dateStr === tomorrow.toLocaleDateString('en-CA');
}

function dayLabel(dateStr: string): { primary: string; secondary: string } {
  if (isToday(dateStr)) {
    return { primary: 'Today', secondary: `- ${formatMatchDate(dateStr)}` };
  }
  if (isTomorrow(dateStr)) {
    return { primary: 'Tomorrow', secondary: `- ${formatMatchDate(dateStr)}` };
  }
  return { primary: formatMatchDate(dateStr), secondary: '' };
}

export default function ScheduleView({ matches, teams, standings }: Props) {
  const todayRef = useRef<HTMLDivElement>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  const teamStandings = useMemo(() => {
    const map = new Map<string, StandingRow>();
    for (const rows of standings.values()) {
      for (const row of rows) map.set(row.teamId, row);
    }
    return map;
  }, [standings]);

  const selectedTeam = selectedTeamId ? teams.get(selectedTeamId) : undefined;
  const selectedRow = selectedTeamId ? teamStandings.get(selectedTeamId) : undefined;
  const selectedPosition = useMemo(() => {
    if (!selectedTeam) return 1;
    const rows = standings.get(selectedTeam.group) ?? [];
    const idx = rows.findIndex(r => r.teamId === selectedTeamId);
    return idx >= 0 ? idx + 1 : 1;
  }, [selectedTeam, selectedTeamId, standings]);

  useEffect(() => {
    if (todayRef.current) {
      const header = document.querySelector('header');
      const headerHeight = header ? header.getBoundingClientRect().height : 0;
      const top = todayRef.current.getBoundingClientRect().top + window.scrollY - headerHeight - 16;
      window.scrollTo({ top, behavior: 'instant' });
    }
  }, []);

  const filtered = useMemo(
    () => matches.filter(m => m.stage === 'Group Stage'),
    [matches]
  );

  const byDate = useMemo(() => {
    const map = new Map<string, Match[]>();
    for (const m of filtered) {
      const arr = map.get(m.date) ?? [];
      arr.push(m);
      map.set(m.date, arr);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  function matchResult(m: Match) {
    if (m.homeScore === null || m.awayScore === null) return null;
    if (m.homeScore > m.awayScore) return 'home';
    if (m.homeScore < m.awayScore) return 'away';
    return 'draw';
  }

  function isLive(m: Match) {
    return m.status === 'IN_PLAY' || m.status === 'PAUSED';
  }

  return (
    <>
    <div className={styles.root}>
      {byDate.map(([date, dayMatches]) => {
        const { primary, secondary } = dayLabel(date);
        return (
          <div key={date} className={styles.day} ref={isToday(date) ? todayRef : undefined}>
            <div className={styles.dayHeader}>
              <span className={styles.dayPrimary}>{primary}</span>
              {secondary && <span className={styles.daySecondary}>{secondary}</span>}
            </div>

            <div className={styles.matchList}>
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
                  <div key={m.id} className={`${styles.card} ${live ? styles.cardLive : ''}`}>
                    {/* Home side */}
                    <button
                      className={`${styles.teamSide} ${styles.teamSideLeft} ${homeDim ? styles.teamSideDim : ''}`}
                      style={{ background: homeColor }}
                      onClick={() => setSelectedTeamId(m.homeTeamId)}
                    >
                      {home.crest
                        ? <img src={home.crest} className={styles.teamFlagImg} alt={home.name} />
                        : <span className={styles.teamFlag}>{home.flag}</span>}
                      <span className={styles.teamName}>{home.name}</span>
                    </button>

                    {/* Away side */}
                    <button
                      className={`${styles.teamSide} ${styles.teamSideRight} ${awayDim ? styles.teamSideDim : ''}`}
                      style={{ background: awayColor }}
                      onClick={() => setSelectedTeamId(m.awayTeamId)}
                    >
                      {away.crest
                        ? <img src={away.crest} className={styles.teamFlagImg} alt={away.name} />
                        : <span className={styles.teamFlag}>{away.flag}</span>}
                      <span className={styles.teamName}>{away.name}</span>
                    </button>

                    {/* Center overlay */}
                    <div className={`${styles.overlay} ${live ? styles.overlayLive : ''}`}>
                      {live && (
                        <div className={styles.liveBadge}>
                          <span className={styles.liveDot} />
                          <span className={styles.liveText}>LIVE</span>
                        </div>
                      )}
                      {m.homeScore !== null && m.awayScore !== null ? (
                        <div className={styles.score}>
                          <span className={styles.scoreNum}>{m.homeScore}</span>
                          <span className={styles.scoreDash}>&nbsp;-&nbsp;</span>
                          <span className={styles.scoreNum}>{m.awayScore}</span>
                        </div>
                      ) : (
                        <div className={styles.time}>{m.time}</div>
                      )}
                      <div className={styles.groupLabel}>Group {m.group}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>

      {selectedTeam && (
        <TeamSheet
          team={selectedTeam}
          row={selectedRow}
          groupPosition={selectedPosition}
          matches={matches}
          teams={teams}
          onClose={() => setSelectedTeamId(null)}
        />
      )}
    </>
  );
}
