import { useState, useMemo } from 'react';
import type { Match, Team, Group } from '../data';
import { GROUPS, formatMatchDate } from '../data';
import styles from './ScheduleView.module.css';

interface Props {
  matches: Match[];
  teams: Map<string, Team>;
  onScoreUpdate: (matchId: string, home: number | null, away: number | null) => void;
}

export default function ScheduleView({ matches, teams, onScoreUpdate }: Props) {
  const [filterGroup, setFilterGroup] = useState<Group | 'All'>('All');
  const [filterTeam, setFilterTeam] = useState('All');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftHome, setDraftHome] = useState('');
  const [draftAway, setDraftAway] = useState('');

  const teamList = useMemo(
    () => [...teams.values()].sort((a, b) => a.name.localeCompare(b.name)),
    [teams]
  );

  const activeGroups = useMemo(
    () => GROUPS.filter(g => teamList.some(t => t.group === g)),
    [teamList]
  );

  const filtered = useMemo(() => {
    return matches.filter(m => {
      if (m.stage !== 'Group Stage') return false;
      if (filterGroup !== 'All' && m.group !== filterGroup) return false;
      if (filterTeam !== 'All' && m.homeTeamId !== filterTeam && m.awayTeamId !== filterTeam) return false;
      return true;
    });
  }, [matches, filterGroup, filterTeam]);

  const byDate = useMemo(() => {
    const groups = new Map<string, Match[]>();
    for (const m of filtered) {
      const existing = groups.get(m.date) ?? [];
      existing.push(m);
      groups.set(m.date, existing);
    }
    return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  function startEdit(m: Match) {
    setEditingId(m.id);
    setDraftHome(m.homeScore !== null ? String(m.homeScore) : '');
    setDraftAway(m.awayScore !== null ? String(m.awayScore) : '');
  }

  function commitEdit(matchId: string) {
    const h = parseInt(draftHome, 10);
    const a = parseInt(draftAway, 10);
    if (!isNaN(h) && !isNaN(a) && h >= 0 && a >= 0) {
      onScoreUpdate(matchId, h, a);
    } else if (draftHome === '' && draftAway === '') {
      onScoreUpdate(matchId, null, null);
    }
    setEditingId(null);
  }

  function matchResult(m: Match): 'home' | 'away' | 'draw' | null {
    if (m.homeScore === null || m.awayScore === null) return null;
    if (m.homeScore > m.awayScore) return 'home';
    if (m.homeScore < m.awayScore) return 'away';
    return 'draw';
  }

  return (
    <div className={styles.root}>
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Group</span>
          <div className={styles.pills}>
            <button
              className={`${styles.pill} ${filterGroup === 'All' ? styles.pillActive : ''}`}
              onClick={() => setFilterGroup('All')}
            >All</button>
            {activeGroups.map(g => (
              <button
                key={g}
                className={`${styles.pill} ${filterGroup === g ? styles.pillActive : ''}`}
                onClick={() => setFilterGroup(g)}
              >{g}</button>
            ))}
          </div>
        </div>
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Team</span>
          <select
            className={styles.select}
            value={filterTeam}
            onChange={e => setFilterTeam(e.target.value)}
          >
            <option value="All">All teams</option>
            {teamList.map(t => (
              <option key={t.id} value={t.id}>{t.flag} {t.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.matchCount}>{filtered.length} matches</div>

      {byDate.map(([date, dayMatches]) => (
        <div key={date} className={styles.day}>
          <div className={styles.dayHeader}>{formatMatchDate(date)}</div>
          <div className={styles.matchList}>
            {dayMatches.map(m => {
              const home = teams.get(m.homeTeamId);
              const away = teams.get(m.awayTeamId);
              if (!home || !away) return null;
              const result = matchResult(m);
              const isEditing = editingId === m.id;

              return (
                <div key={m.id} className={`${styles.matchCard} ${result ? styles.played : ''}`}>
                  <div className={styles.matchMeta}>
                    <span className={styles.matchTime}>{m.time}</span>
                    <span className={styles.groupBadge}>Group {m.group} · MD{m.matchday}</span>
                    <span className={styles.venue}>{m.venue}</span>
                  </div>
                  <div className={styles.matchBody}>
                    <div className={`${styles.teamSide} ${result === 'home' ? styles.winner : ''}`}>
                      <span className={styles.teamFlag}>{home.flag}</span>
                      <span className={styles.teamName}>{home.name}</span>
                    </div>

                    {isEditing ? (
                      <div className={styles.scoreEdit}>
                        <div>
                          <input
                            className={styles.scoreInput}
                            type="number"
                            min="0"
                            max="30"
                            value={draftHome}
                            onChange={e => setDraftHome(e.target.value)}
                            autoFocus
                          />
                          <span className={styles.scoreSep}>–</span>
                          <input
                            className={styles.scoreInput}
                            type="number"
                            min="0"
                            max="30"
                            value={draftAway}
                            onChange={e => setDraftAway(e.target.value)}
                          />
                        </div>
                        <div className={styles.editActions}>
                          <button className={styles.saveBtn} onClick={() => commitEdit(m.id)}>✓</button>
                          <button className={styles.cancelBtn} onClick={() => setEditingId(null)}>✕</button>
                        </div>
                      </div>
                    ) : (
                      <button className={styles.scoreBox} onClick={() => startEdit(m)}>
                        {m.homeScore !== null && m.awayScore !== null ? (
                          <>
                            <span className={result === 'home' ? styles.winScore : ''}>{m.homeScore}</span>
                            <span className={styles.scoreDash}>–</span>
                            <span className={result === 'away' ? styles.winScore : ''}>{m.awayScore}</span>
                          </>
                        ) : (
                          <span className={styles.vsLabel}>vs</span>
                        )}
                      </button>
                    )}

                    <div className={`${styles.teamSide} ${styles.teamSideRight} ${result === 'away' ? styles.winner : ''}`}>
                      <span className={styles.teamName}>{away.name}</span>
                      <span className={styles.teamFlag}>{away.flag}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
