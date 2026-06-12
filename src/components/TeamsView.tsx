import { useState, useMemo } from 'react';
import type { Match, StandingRow, Group, Team } from '../data';
import { formatMatchDate } from '../data';
import styles from './TeamsView.module.css';

interface Props {
  matches: Match[];
  teams: Map<string, Team>;
  standings: Map<Group, StandingRow[]>;
}

export default function TeamsView({ matches, teams, standings }: Props) {
  const teamList = useMemo(
    () => [...teams.values()].sort((a, b) => a.group.localeCompare(b.group) || a.name.localeCompare(b.name)),
    [teams]
  );

  const [selectedId, setSelectedId] = useState<string>(teamList[0]?.id ?? '');
  const team = teams.get(selectedId);

  const standing = useMemo(() => {
    if (!team) return null;
    return (standings.get(team.group) ?? []).find(r => r.teamId === selectedId) ?? null;
  }, [standings, selectedId, team]);

  const groupRank = useMemo(() => {
    if (!team) return 0;
    return (standings.get(team.group) ?? []).findIndex(r => r.teamId === selectedId) + 1;
  }, [standings, selectedId, team]);

  const teamMatches = useMemo(
    () => matches.filter(m => m.homeTeamId === selectedId || m.awayTeamId === selectedId),
    [matches, selectedId]
  );

  function matchResult(m: Match): 'W' | 'D' | 'L' | null {
    if (m.homeScore === null || m.awayScore === null) return null;
    const isHome = m.homeTeamId === selectedId;
    const myScore = isHome ? m.homeScore : m.awayScore;
    const oppScore = isHome ? m.awayScore : m.homeScore;
    if (myScore > oppScore) return 'W';
    if (myScore < oppScore) return 'L';
    return 'D';
  }

  if (!team) return null;

  return (
    <div className={styles.root}>
      <div className={styles.sidebar}>
        <div className={styles.sidebarInner}>
          {teamList.map(t => (
            <button
              key={t.id}
              className={`${styles.teamBtn} ${selectedId === t.id ? styles.teamBtnActive : ''}`}
              onClick={() => setSelectedId(t.id)}
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
            <div className={styles.teamMeta}>Group {team.group} · {team.confederation}</div>
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
            const isHome = m.homeTeamId === selectedId;
            const oppId = isHome ? m.awayTeamId : m.homeTeamId;
            const opp = teams.get(oppId);
            if (!opp) return null;
            const result = matchResult(m);
            const myScore = m.homeScore !== null ? (isHome ? m.homeScore : m.awayScore) : null;
            const oppScore = m.awayScore !== null ? (isHome ? m.awayScore : m.homeScore) : null;

            return (
              <div key={m.id} className={`${styles.matchRow} ${result ? styles.played : ''}`}>
                <div className={styles.matchDate}>{formatMatchDate(m.date)}</div>
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
                    <span className={styles.upcoming}>{m.time} · {m.venue}</span>
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
