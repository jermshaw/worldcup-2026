import { useMemo, useEffect, useRef } from 'react';
import type { Match, Team } from '../data';
import { formatMatchDate } from '../data';
import { getTeamColor } from '../teamColors';
import styles from './ScheduleView.module.css';

interface Props {
  matches: Match[];
  teams: Map<string, Team>;
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

export default function ScheduleView({ matches, teams }: Props) {
  const todayRef = useRef<HTMLDivElement>(null);

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

  return (
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

                return (
                  <div key={m.id} className={styles.card}>
                    {/* Home side */}
                    <div
                      className={`${styles.teamSide} ${styles.teamSideLeft} ${homeDim ? styles.teamSideDim : ''}`}
                      style={{ background: homeColor }}
                    >
                      {home.crest
                        ? <img src={home.crest} className={styles.teamFlagImg} alt={home.name} />
                        : <span className={styles.teamFlag}>{home.flag}</span>}
                      <span className={styles.teamName}>{home.name}</span>
                    </div>

                    {/* Away side */}
                    <div
                      className={`${styles.teamSide} ${styles.teamSideRight} ${awayDim ? styles.teamSideDim : ''}`}
                      style={{ background: awayColor }}
                    >
                      {away.crest
                        ? <img src={away.crest} className={styles.teamFlagImg} alt={away.name} />
                        : <span className={styles.teamFlag}>{away.flag}</span>}
                      <span className={styles.teamName}>{away.name}</span>
                    </div>

                    {/* Center overlay */}
                    <div className={styles.overlay}>
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
  );
}
