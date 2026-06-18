import { useMemo, useEffect, useRef, useState } from 'react';
import type React from 'react';
import type { Match, Team } from '../data';
import { formatMatchDate, isLive } from '../data';
import { getTeamColor, getTeamTextColor } from '../teamColors';
import { getCityForVenue } from '../venueData';
import MatchSheet from './MatchSheet';
import styles from './ScheduleView.module.css';

interface Props {
  matches: Match[];
  teams: Map<string, Team>;
  scrollRef?: React.RefObject<HTMLElement>;
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

export default function ScheduleView({ matches, teams, scrollRef }: Props) {
  const [todayEl, setTodayEl] = useState<HTMLDivElement | null>(null);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [showBackToToday, setShowBackToToday] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const didInitialScroll = useRef(false);

  const selectedMatch = selectedMatchId ? matches.find(m => m.id === selectedMatchId) : undefined;

  // Measure header once
  useEffect(() => {
    const header = document.querySelector('header');
    if (header) setHeaderHeight(header.getBoundingClientRect().height);
  }, []);

  // Initial scroll to today + IntersectionObserver — runs when todayEl becomes available
  useEffect(() => {
    if (!todayEl) return;

    if (!didInitialScroll.current) {
      didInitialScroll.current = true;
      const header = document.querySelector('header');
      const h = header ? header.getBoundingClientRect().height : 0;
      const scrollEl = scrollRef?.current ?? window;
      const scrollTop = scrollRef?.current ? scrollRef.current.scrollTop : window.scrollY;
      const top = todayEl.getBoundingClientRect().top + scrollTop - h - 16;
      scrollEl.scrollTo({ top, behavior: 'instant' });
    }

    const obs = new IntersectionObserver(
      ([entry]) => {
        setShowBackToToday(!entry.isIntersecting);
      },
      { threshold: 0 }
    );
    obs.observe(todayEl);
    return () => obs.disconnect();
  }, [todayEl]);

  function scrollToToday() {
    if (!todayEl) return;
    const header = document.querySelector('header');
    const h = header ? header.getBoundingClientRect().height : 0;
    const scrollEl = scrollRef?.current ?? window;
    const scrollTop = scrollRef?.current ? scrollRef.current.scrollTop : window.scrollY;
    const top = todayEl.getBoundingClientRect().top + scrollTop - h - 16;
    scrollEl.scrollTo({ top, behavior: 'smooth' });
  }

  const byDate = useMemo(() => {
    const map = new Map<string, Match[]>();
    for (const m of matches) {
      const arr = map.get(m.date) ?? [];
      arr.push(m);
      map.set(m.date, arr);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [matches]);

  function matchResult(m: Match) {
    if (m.homeScore === null || m.awayScore === null) return null;
    if (m.homeScore > m.awayScore) return 'home';
    if (m.homeScore < m.awayScore) return 'away';
    return 'draw';
  }

  return (
    <>
    {showBackToToday && (
      <button
        className={styles.backToToday}
        style={{ top: headerHeight + 12 }}
        onClick={scrollToToday}
      >
        Back to today
      </button>
    )}
    <div className={styles.root}>
      {byDate.map(([date, dayMatches]) => {
        const { primary, secondary } = dayLabel(date);
        return (
          <div key={date} className={styles.day} ref={isToday(date) ? setTodayEl : undefined}>
            <div className={styles.dayHeader}>
              <span className={`${styles.dayPrimary} ${(isToday(date) || isTomorrow(date)) ? styles.dayPrimaryHighlight : ''}`}>{primary}</span>
              {secondary && <span className={styles.daySecondary}>{secondary}</span>}
            </div>

            <div className={styles.matchList}>
              {dayMatches.map(m => {
                const home = teams.get(m.homeTeamId);
                const away = teams.get(m.awayTeamId);
                const homeTbd = !home;
                const awayTbd = !away;

                const result = matchResult(m);
                const homeDim = result === 'away';
                const awayDim = result === 'home';
                const homeColor = homeTbd ? '#919191' : getTeamColor(m.homeTeamId);
                const awayColor = awayTbd ? '#666666' : getTeamColor(m.awayTeamId);
                const homeTextColor = homeTbd ? '#fff' : getTeamTextColor(m.homeTeamId);
                const awayTextColor = awayTbd ? '#fff' : getTeamTextColor(m.awayTeamId);

                const live = isLive(m);
                const isHalftime = m.timeElapsed === 'HT';
                const centerLabel = m.group ? `Group ${m.group}` : m.stage;

                return (
                  <button key={m.id} className={styles.card}
                    style={{ background: `linear-gradient(122.71deg, ${homeColor} 12%, ${awayColor} 88%)` }}
                    onClick={() => setSelectedMatchId(m.id)}>
                    {/* Home side */}
                    <div
                      className={`${styles.teamSide} ${styles.teamSideLeft} ${homeDim ? styles.teamSideDim : ''}`}
                      style={{ background: 'transparent', color: homeTextColor }}
                    >
                      {homeTbd ? (
                        <>
                          <span className={styles.teamFlag}>🏳️</span>
                          <span className={styles.teamName}>TBD</span>
                        </>
                      ) : home!.crest ? (
                        <>
                          <img src={home!.crest} className={styles.teamFlagImg} alt={home!.name} />
                          <span className={styles.teamName}>{home!.name}</span>
                        </>
                      ) : (
                        <>
                          <span className={styles.teamFlag}>{home!.flag}</span>
                          <span className={styles.teamName}>{home!.name}</span>
                        </>
                      )}
                    </div>

                    {/* Away side */}
                    <div
                      className={`${styles.teamSide} ${styles.teamSideRight} ${awayDim ? styles.teamSideDim : ''}`}
                      style={{ background: 'transparent', color: awayTextColor }}
                    >
                      {awayTbd ? (
                        <>
                          <span className={styles.teamFlag}>🏴</span>
                          <span className={styles.teamName}>TBD</span>
                        </>
                      ) : away!.crest ? (
                        <>
                          <img src={away!.crest} className={styles.teamFlagImg} alt={away!.name} />
                          <span className={styles.teamName}>{away!.name}</span>
                        </>
                      ) : (
                        <>
                          <span className={styles.teamFlag}>{away!.flag}</span>
                          <span className={styles.teamName}>{away!.name}</span>
                        </>
                      )}
                    </div>

                    {/* Center overlay */}
                    <div className={`${styles.overlay} ${(live || isHalftime) ? styles.overlayHalftime : ''}`}>
                      {m.homeScore !== null && m.awayScore !== null ? (
                        <>
                          {(live || isHalftime) && (
                            <div className={styles.halftimeLabel}>
                              {isHalftime ? 'Halftime' : m.timeElapsed && /^\d/.test(m.timeElapsed) ? `LIVE - ${m.timeElapsed}'` : 'LIVE'}
                            </div>
                          )}
                          <div className={styles.score}>
                            <span className={styles.scoreNum}>{m.homeScore}</span>
                            <span className={styles.scoreDash}>&nbsp;-&nbsp;</span>
                            <span className={styles.scoreNum}>{m.awayScore}</span>
                          </div>
                        </>
                      ) : (
                        <div className={styles.time}>{m.time}</div>
                      )}
                      <div className={styles.matchMeta}>
                        <div className={styles.groupLabel}>{centerLabel}</div>
                        {m.venue && (
                          <div className={styles.groupLabel}>{getCityForVenue(m.venue)}</div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>

      {selectedMatch && (
        <MatchSheet
          match={selectedMatch}
          teams={teams}
          onClose={() => setSelectedMatchId(null)}
        />
      )}
    </>
  );
}
