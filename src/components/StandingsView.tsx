import { useMemo } from 'react';
import type { Match, Team, Group, StandingRow } from '../data';
import { GROUPS } from '../data';
import styles from './StandingsView.module.css';

interface Props {
  matches: Match[];
  teams: Map<string, Team>;
  standings: Map<Group, StandingRow[]>;
}

const STAGES = [
  { id: 'group', label: 'Group stage',    apiStage: undefined },
  { id: 'r32',   label: 'Round of 32',    apiStage: 'Round of 32' },
  { id: 'r16',   label: 'Round of 16',    apiStage: 'Round of 16' },
  { id: 'qf',    label: 'Quarter finals', apiStage: 'Quarter-final' },
  { id: 'sf',    label: 'Semi finals',    apiStage: 'Semi-final' },
  { id: 'final', label: 'Final',          apiStage: 'Final' },
] as const;

export default function StandingsView({ matches, teams, standings }: Props) {
  const matchesByStage = useMemo(() => {
    const map = new Map<string, Match[]>();
    for (const s of STAGES) {
      if (!s.apiStage) continue;
      map.set(s.id, matches
        .filter(m => m.stage === s.apiStage)
        .sort((a, b) => (a.matchday ?? 0) - (b.matchday ?? 0)));
    }
    return map;
  }, [matches]);

  return (
    <div className={styles.root}>
      <h1 className={styles.title}>Standings</h1>

      <div className={styles.swiper}>
        {STAGES.map(stage => (
          <div key={stage.id} className={styles.page}>
            <p className={styles.stageLabel}>{stage.label}</p>

            {/* Group stage */}
            {stage.id === 'group' && GROUPS.map(group => {
              const rows = standings.get(group) ?? [];
              if (rows.length === 0) return null;
              return (
                <div key={group} className={styles.card}>
                  <p className={styles.groupTitle}>Group {group}</p>
                  {rows.map((row, idx) => {
                    const team = teams.get(row.teamId);
                    return (
                      <div key={row.teamId}>
                        <div className={styles.rowDivider} />
                        <div className={`${styles.teamRow} ${idx >= 2 ? styles.teamRowMuted : ''}`}>
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

            {/* Knockout stages */}
            {stage.id !== 'group' && (() => {
              const stageMatches = matchesByStage.get(stage.id) ?? [];
              if (stageMatches.length === 0) {
                return <p className={styles.emptyState}>Not yet available</p>;
              }
              return stageMatches.map(match => {
                const home    = teams.get(match.homeTeamId);
                const away    = teams.get(match.awayTeamId);
                const scored  = match.homeScore != null && match.awayScore != null;
                const homeWon = scored && match.homeScore! > match.awayScore!;
                const awayWon = scored && match.awayScore! > match.homeScore!;
                return (
                  <div key={match.id} className={styles.card}>
                    <div className={`${styles.matchRow} ${scored && !homeWon ? styles.matchLoser : ''}`}>
                      {home ? (
                        <div className={styles.teamLeft}>
                          <span className={styles.teamFlag}>{home.flag}</span>
                          <span className={styles.matchTeamName}>{home.name}</span>
                        </div>
                      ) : <span className={styles.matchTbd}>TBD</span>}
                      {scored && <span className={styles.matchScore}>{match.homeScore}</span>}
                    </div>
                    <div className={styles.rowDivider} />
                    <div className={`${styles.matchRow} ${scored && !awayWon ? styles.matchLoser : ''}`}>
                      {away ? (
                        <div className={styles.teamLeft}>
                          <span className={styles.teamFlag}>{away.flag}</span>
                          <span className={styles.matchTeamName}>{away.name}</span>
                        </div>
                      ) : <span className={styles.matchTbd}>TBD</span>}
                      {scored && <span className={styles.matchScore}>{match.awayScore}</span>}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        ))}
      </div>
    </div>
  );
}
