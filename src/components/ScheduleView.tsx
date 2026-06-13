import { useState, useMemo } from 'react';
import type { Match, Team, Group } from '../data';
import { GROUPS, formatMatchDate } from '../data';
import { getTeamColor } from '../teamColors';
import styles from './ScheduleView.module.css';

interface Props {
  matches: Match[];
  teams: Map<string, Team>;
  onScoreUpdate: (matchId: string, home: number | null, away: number | null) => void;
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

  const filtered = useMemo(() => matches.filter(m => {
    if (m.stage !== 'Group Stage') return false;
    if (filterGroup !== 'All' && m.group !== filterGroup) return false;
    if (filterTeam !== 'All' && m.homeTeamId !== filterTeam && m.awayTeamId !== filterTeam) return false;
    return true;
  }), [matches, filterGroup, filterTeam]);

  const byDate = useMemo(() => {
    const map = new Map<string, Match[]>();
    for (const m of filtered) {
      const arr = map.get(m.date) ?? [];
      arr.push(m);
      map.set(m.date, arr);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
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

  function matchResult(m: Match) {
    if (m.homeScore === null || m.awayScore === null) return null;
    if (m.homeScore > m.awayScore) return 'home';
    if (m.homeScore < m.awayScore) return 'away';
    return 'draw';
  }

  return (
    <div className={styles.root}>
      {/* Filters */}
      <div className={styles.filters}>
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

      {/* Match list by day */}
      {byDate.map(([date, dayMatches]) => {
        const { primary, secondary } = dayLabel(date);
        return (
          <div key={date} className={styles.day}>
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
                const isEditing = editingId === m.id;
                const homeColor = getTeamColor(m.homeTeamId);
                const awayColor = getTeamColor(m.awayTeamId);

                return (
                  <div key={m.id} className={styles.card}>
                    {/* Home side */}
                    <div
                      className={`${styles.teamSide} ${styles.teamSideLeft} ${homeDim ? styles.teamSideDim : ''}`}
                      style={{ background: homeColor }}
                    >
                      <span className={styles.teamFlag}>{home.flag}</span>
                      <span className={styles.teamName}>{home.name}</span>
                    </div>

                    {/* Away side */}
                    <div
                      className={`${styles.teamSide} ${styles.teamSideRight} ${awayDim ? styles.teamSideDim : ''}`}
                      style={{ background: awayColor }}
                    >
                      <span className={styles.teamFlag}>{away.flag}</span>
                      <span className={styles.teamName}>{away.name}</span>
                    </div>

                    {/* Center overlay */}
                    {isEditing ? (
                      <div className={styles.overlay}>
                        <div className={styles.editRow}>
                          <input
                            className={styles.scoreInput}
                            type="number" min="0" max="30"
                            value={draftHome}
                            onChange={e => setDraftHome(e.target.value)}
                            autoFocus
                          />
                          <span className={styles.editDash}>-</span>
                          <input
                            className={styles.scoreInput}
                            type="number" min="0" max="30"
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
                      <button className={styles.overlay} onClick={() => startEdit(m)}>
                        {m.homeScore !== null && m.awayScore !== null ? (
                          <div className={styles.score}>
                            <span className={styles.scoreNum}>{m.homeScore}</span>
                            <span className={styles.scoreDash}> - </span>
                            <span className={styles.scoreNum}>{m.awayScore}</span>
                          </div>
                        ) : (
                          <div className={styles.time}>{m.time}</div>
                        )}
                        <div className={styles.groupLabel}>Group {m.group}</div>
                      </button>
                    )}
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
