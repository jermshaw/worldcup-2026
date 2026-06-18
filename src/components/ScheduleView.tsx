import { useMemo, useEffect, useRef, useState } from 'react';
import type React from 'react';
import type { Match, Team, Group } from '../data';
import { formatMatchDate, isLive, computeStandings } from '../data';
import { FIFA_RANKINGS } from '../fifaRankings';
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

  const standings = useMemo(() => computeStandings(matches, teams), [matches, teams]);

  function ordinal(n: number) {
    return n === 1 ? '1st' : n === 2 ? '2nd' : n === 3 ? '3rd' : `${n}th`;
  }

  function getStakeSummary(m: Match): string | null {
    if (!m.group) return null;
    const groupRows = standings.get(m.group as Group);
    if (!groupRows) return null;

    const homeRow = groupRows.find(r => r.teamId === m.homeTeamId);
    const awayRow = groupRows.find(r => r.teamId === m.awayTeamId);
    const homePts = homeRow?.pts ?? 0;
    const awayPts = awayRow?.pts ?? 0;
    const homeMP = homeRow?.mp ?? 0;
    const awayMP = awayRow?.mp ?? 0;
    const homeName = teams.get(m.homeTeamId)?.name ?? m.homeTeamId;
    const awayName = teams.get(m.awayTeamId)?.name ?? m.awayTeamId;
    const homeRank = FIFA_RANKINGS[m.homeTeamId] ?? 100;
    const awayRank = FIFA_RANKINGS[m.awayTeamId] ?? 100;

    function otherCtx() {
      const others = groupRows!.filter(r => r.teamId !== m.homeTeamId && r.teamId !== m.awayTeamId);
      if (others.length < 2) return '';
      const pos1 = groupRows!.findIndex(r => r.teamId === others[0].teamId) + 1;
      const pos2 = groupRows!.findIndex(r => r.teamId === others[1].teamId) + 1;
      const n1 = teams.get(others[0].teamId)?.name ?? '';
      const n2 = teams.get(others[1].teamId)?.name ?? '';
      const p1 = others[0].pts, p2 = others[1].pts;
      return ` ${n1} are ${ordinal(pos1)} with ${p1} pt${p1 !== 1 ? 's' : ''}, ${n2} are ${ordinal(pos2)} with ${p2}.`;
    }

    function getHighlights() {
      try {
        const raw = localStorage.getItem(`wc2026_highlights_${m.id}`);
        return raw ? JSON.parse(raw) as { hatTricks: string[]; redCards: string[] } : null;
      } catch { return null; }
    }

    // FINISHED — standings already include this result
    if (m.status === 'FINISHED' && m.homeScore !== null && m.awayScore !== null) {
      const homePos = groupRows.findIndex(r => r.teamId === m.homeTeamId) + 1;
      const awayPos = groupRows.findIndex(r => r.teamId === m.awayTeamId) + 1;
      const margin = Math.abs(m.homeScore - m.awayScore);
      const totalGoals = m.homeScore + m.awayScore;
      const highlights = getHighlights();
      const hatTrick = highlights?.hatTricks[0] ?? null;

      if (m.homeScore > m.awayScore) {
        const isUpset = awayRank <= homeRank - 25;
        const prefix = hatTrick ? `${hatTrick} scored a hat trick. ` : '';
        const loser = `${awayName} are ${ordinal(awayPos)} with ${awayPts} pt${awayPts !== 1 ? 's' : ''}.`;
        if (isUpset)
          return `${prefix}${homeName} pull off an upset win over ${awayName}. They rise to ${ordinal(homePos)} in Group ${m.group}. ${loser}`;
        if (margin >= 3)
          return `${prefix}A convincing ${m.homeScore}-${m.awayScore} for ${homeName}. They rise to ${ordinal(homePos)} in Group ${m.group} with ${homePts} pts. ${loser}`;
        return `${prefix}${homeName} win and rise to ${ordinal(homePos)} in Group ${m.group} with ${homePts} pts. ${loser}`;
      }

      if (m.awayScore > m.homeScore) {
        const isUpset = homeRank <= awayRank - 25;
        const prefix = hatTrick ? `${hatTrick} scored a hat trick. ` : '';
        const loser = `${homeName} are ${ordinal(homePos)} with ${homePts} pt${homePts !== 1 ? 's' : ''}.`;
        if (isUpset)
          return `${prefix}${awayName} pull off an upset win over ${homeName}. They rise to ${ordinal(awayPos)} in Group ${m.group}. ${loser}`;
        if (margin >= 3)
          return `${prefix}A convincing ${m.awayScore}-${m.homeScore} for ${awayName}. They rise to ${ordinal(awayPos)} in Group ${m.group} with ${awayPts} pts. ${loser}`;
        return `${prefix}${awayName} win and rise to ${ordinal(awayPos)} in Group ${m.group} with ${awayPts} pts. ${loser}`;
      }

      // Draw
      const rankGap = Math.abs(homeRank - awayRank);
      const bigName = homeRank < awayRank ? homeName : awayName;
      const smallName = homeRank < awayRank ? awayName : homeName;
      const bigPos = homeRank < awayRank ? homePos : awayPos;
      const smallPos = homeRank < awayRank ? awayPos : homePos;
      if (rankGap >= 25)
        return `${smallName} hold ${bigName} to a draw. ${bigName} are ${ordinal(bigPos)}, ${smallName} ${ordinal(smallPos)} in Group ${m.group}.`;
      if (m.homeScore === 0)
        return `A goalless draw. ${homeName} are ${ordinal(homePos)}, ${awayName} ${ordinal(awayPos)} in Group ${m.group}.`;
      if (totalGoals >= 4)
        return `A ${m.homeScore}-${m.awayScore} thriller. ${homeName} are ${ordinal(homePos)}, ${awayName} ${ordinal(awayPos)} in Group ${m.group}.`;
      return `It's a draw. ${homeName} are ${ordinal(homePos)}, ${awayName} ${ordinal(awayPos)} in Group ${m.group}.`;
    }

    // LIVE — standings don't include this match yet, so pts are pre-game
    if ((m.status === 'IN_PLAY' || m.status === 'PAUSED') && m.homeScore !== null && m.awayScore !== null) {
      const projPos = (teamId: string, addPts: number) =>
        groupRows.filter(r => r.teamId !== teamId && r.pts > (groupRows.find(x => x.teamId === teamId)?.pts ?? 0) + addPts).length + 1;
      const rankGap = Math.abs(homeRank - awayRank);

      if (m.homeScore > m.awayScore) {
        const pos = projPos(m.homeTeamId, 3);
        if (rankGap >= 25 && awayRank < homeRank)
          return `${homeName} are causing an upset. A win here would put them ${ordinal(pos)} in Group ${m.group} with ${homePts + 3} pts.`;
        return `${homeName} lead. A win here would put them ${ordinal(pos)} in Group ${m.group} with ${homePts + 3} pts.`;
      }
      if (m.awayScore > m.homeScore) {
        const pos = projPos(m.awayTeamId, 3);
        if (rankGap >= 25 && homeRank < awayRank)
          return `${awayName} are causing an upset. A win here would put them ${ordinal(pos)} in Group ${m.group} with ${awayPts + 3} pts.`;
        return `${awayName} lead. A win here would put them ${ordinal(pos)} in Group ${m.group} with ${awayPts + 3} pts.`;
      }
      if (m.homeScore === 0 && rankGap >= 25) {
        const favorName = homeRank < awayRank ? homeName : awayName;
        const underdogName = homeRank < awayRank ? awayName : homeName;
        return `${underdogName} are keeping ${favorName} at bay. A draw would leave both on ${homePts + 1} pts in Group ${m.group}.`;
      }
      const drawHomePts = homePts + 1;
      const drawAwayPts = awayPts + 1;
      const pt = (n: number) => `${n} pt${n !== 1 ? 's' : ''}`;
      const projDrawHomePos = groupRows.filter(r => r.teamId !== m.homeTeamId && r.pts > drawHomePts).length + 1;
      const projDrawAwayPos = groupRows.filter(r => r.teamId !== m.awayTeamId && r.pts > drawAwayPts).length + 1;
      const drawPos1 = projDrawHomePos;
      const drawPos2 = projDrawHomePos === projDrawAwayPos ? projDrawHomePos + 1 : projDrawAwayPos;
      const posCtx = `keeps them in ${ordinal(drawPos1)} and ${ordinal(drawPos2)} place in Group ${m.group}`;
      const ptCtx = drawHomePts === drawAwayPts ? `both ${pt(drawHomePts)}` : `${homeName} ${pt(drawHomePts)}, ${awayName} ${pt(drawAwayPts)}`;
      if (m.homeScore >= 2)
        return `An entertaining ${m.homeScore}-${m.awayScore} so far. A draw gives ${ptCtx}, but ${posCtx}.`;
      return `It's level. A draw gives ${ptCtx}, but ${posCtx}.`;
    }

    // UPCOMING
    if (homeMP === 0 && awayMP === 0) {
      const rankGap = Math.abs(homeRank - awayRank);
      if (rankGap >= 30) {
        const favorName = homeRank < awayRank ? homeName : awayName;
        const underdogName = homeRank < awayRank ? awayName : homeName;
        return `${underdogName} face a tough test against tournament favorites ${favorName} in Group ${m.group}.`;
      }
      return null;
    }

    if (homeMP <= 1 && awayMP <= 1) {
      if (homePts === 0 && awayPts === 0)
        return `Both teams lost their opener. The loser here is in serious trouble in Group ${m.group}.`;
      if (homePts === 1 && awayPts === 1)
        return `Both drew their first match. A win puts either side in the top two of Group ${m.group}.`;
      if (homePts === 3 && awayPts === 3)
        return `Both won their opener. The winner moves clear at the top of Group ${m.group}.`;
      if (homePts === 3 && awayPts === 1)
        return `${homeName} lead Group ${m.group} with 3 pts. ${awayName} need a win to keep pace.`;
      if (homePts === 1 && awayPts === 3)
        return `${awayName} lead Group ${m.group} with 3 pts. ${homeName} need a win to keep pace.`;
      if (homePts === 3 && awayPts === 0)
        return `${homeName} have 3 pts in Group ${m.group}. ${awayName} are bottom and need a win.`;
      if (homePts === 0 && awayPts === 3)
        return `${awayName} have 3 pts in Group ${m.group}. ${homeName} are bottom and need a win.`;
      if (homePts === 1 && awayPts === 0)
        return `${homeName} have 1 pt in Group ${m.group}. ${awayName} have none and must win to stay in contention.`;
      if (homePts === 0 && awayPts === 1)
        return `${awayName} have 1 pt in Group ${m.group}. ${homeName} have none and must win to stay in contention.`;
    }

    // Matchday 3+
    if (homePts === 0 && awayPts === 0)
      return `Neither team has a point in Group ${m.group}. Lose here and the World Cup is over.`;
    if (homePts === awayPts)
      return `Both have ${homePts} pts in Group ${m.group}. The winner advances; the loser likely goes home.`;

    const leaderName = homePts > awayPts ? homeName : awayName;
    const trailerName = homePts > awayPts ? awayName : homeName;
    const leaderPts = Math.max(homePts, awayPts);
    const trailerPts = Math.min(homePts, awayPts);

    if (trailerPts === 0)
      return `${leaderName} lead Group ${m.group} on ${leaderPts} pts. ${trailerName} need a win to stay in the tournament.`;
    return `${leaderName} lead on ${leaderPts} pts in Group ${m.group}. ${trailerName} trail on ${trailerPts} and need a result.`;
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
                const summary = getStakeSummary(m);
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
                    <div className={styles.cardTop}>
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
                    </div>
                    {summary && <div className={styles.cardSummary}>{summary}</div>}
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
          stakeSummary={getStakeSummary(selectedMatch)}
        />
      )}
    </>
  );
}
