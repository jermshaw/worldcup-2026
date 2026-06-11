import { useState, useMemo } from 'react';
import type { Match, StandingRow, Group } from '../data';
import { TEAMS, teamMap, venueMap, formatMatchDate } from '../data';
import styles from './TeamsView.module.css';

interface Props {
  matches: Match[];
  standings: Map<Group, StandingRow[]>;
}

export default function TeamsView({ matches, standings }: Props) {
  const [selectedTeamId, setSelectedTeamId] = useState(TEAMS[0].id);

  const team = teamMap.get(selectedTeamId)!;

  const standing = useMemo(() => {
    const rows = standings.get(team.group) ?? [];
    return rows.find(r => r.teamId === selectedTeamId) ?? null;
  }, [standings, selectedTeamId, team.group]);

  const teamMatches = useMemo(() => {
    return matches.filter(
      m => m.homeTeamId === selectedTeamId || m.awayTeamId === selectedTeamId
    );
  }, [matches, selectedTeamId]);

  const groupRank = useMemo(() => {
    const rows = standings.get(team.group) ?? [];
    return rows.findIndex(r => r.teamId === selectedTeamId) + 1;
  }, [standings, selectedTeamId, team.group]);

  function matchResult(m: Match): 'W' | 'D' | 'L' | null {
    if (m.homeScore === null || m.awayScore === null) return null;
    const isHome = m.homeTeamId === selectedTeamId;
    const myScore = isHome ? m.homeScore : m.awayScore;
    const oppScore = isHome ? m.awayScore : m.homeScore;
    if (myScore > oppScore) return 'W';
    if (myScore < oppScore) return 'L';
    return 'D';
  }

  return (
    <div className={styles.root}>
      <div className={styles.sidebar}>
        <div className={styles.sidebarInner}>
          {TEAMS.map(t => (
            <button
              key={t.id}
              className={`${styles.teamBtn} ${selectedTeamId === t.id ? styles.teamBtnActive : ''}`}
              onClick={() => setSelectedTeamId(t.id)}
            >
              <span className={styles.teamBtnFlag}>{t.flag}</span>
              <span className={styles.teamBtnName}>{t.name}</span>
              <span className={styles.teamBtnGroup}>G{t.group}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.detail}>
        <div className={styles.teamHeader}>
          <span className={styles.bigFlag}>{team.flag}</span>
          <div>
            <h2 className={styles.teamTitle}>{team.name}</h2>
            <div className={styles.teamMeta}>
              Group {team.group} · {team.confederation}
            </div>
          </div>
          {groupRank > 0 && (
            <div className={`${styles.rankBadge} ${groupRank <= 2 ? styles.rankBadgeQualify : ''}`}>
              #{groupRank} in Group {team.group}
            </div>
          )}
        </div>

        {standing && (
          <div className={styles.statGrid}>
            <div className={styles.statCard}>
              <div className={styles.statVal}>{standing.mp}</div>
              <div className={styles.statLbl}>Played</div>
            </div>
            <div className={`${styles.statCard} ${styles.statCardGreen}`}>
              <div className={styles.statVal}>{standing.w}</div>
              <div className={styles.statLbl}>Wins</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statVal}>{standing.d}</div>
              <div className={styles.statLbl}>Draws</div>
            </div>
            <div className={`${styles.statCard} ${styles.statCardRed}`}>
              <div className={styles.statVal}>{standing.l}</div>
              <div className={styles.statLbl}>Losses</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statVal}>{standing.gf}–{standing.ga}</div>
              <div className={styles.statLbl}>GF–GA</div>
            </div>
            <div className={`${styles.statCard} ${styles.statCardGold}`}>
              <div className={styles.statVal}>{standing.pts}</div>
              <div className={styles.statLbl}>Points</div>
            </div>
          </div>
        )}

        <h3 className={styles.sectionTitle}>Matches</h3>
        <div className={styles.matchList}>
          {teamMatches.map(m => {
            const isHome = m.homeTeamId === selectedTeamId;
            const oppId = isHome ? m.awayTeamId : m.homeTeamId;
            const opp = teamMap.get(oppId)!;
            const venue = venueMap.get(m.venueId)!;
            const result = matchResult(m);
            const myScore = m.homeScore !== null && m.awayScore !== null
              ? (isHome ? m.homeScore : m.awayScore)
              : null;
            const oppScore = m.homeScore !== null && m.awayScore !== null
              ? (isHome ? m.awayScore : m.homeScore)
              : null;

            return (
              <div key={m.id} className={`${styles.matchRow} ${result ? styles.played : ''}`}>
                <div className={styles.matchDate}>{formatMatchDate(m.date, m.time)}</div>
                <div className={styles.matchInfo}>
                  <span className={styles.homeAway}>{isHome ? 'vs' : '@'}</span>
                  <span className={styles.oppFlag}>{opp.flag}</span>
                  <span className={styles.oppName}>{opp.name}</span>
                </div>
                <div className={styles.matchScore}>
                  {result !== null && myScore !== null && oppScore !== null ? (
                    <>
                      <span className={`${styles.resultBadge} ${styles[`result${result}`]}`}>{result}</span>
                      <span className={styles.scoreStr}>{myScore}–{oppScore}</span>
                    </>
                  ) : (
                    <span className={styles.upcoming}>{m.time} · {venue.city}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
