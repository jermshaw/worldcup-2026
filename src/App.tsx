import { useState, useMemo } from 'react';
import { INITIAL_MATCHES, computeStandings } from './data';
import type { Match } from './data';
import ScheduleView from './components/ScheduleView';
import GroupsView from './components/GroupsView';
import TeamsView from './components/TeamsView';
import styles from './App.module.css';

type Tab = 'schedule' | 'groups' | 'teams';

export default function App() {
  const [tab, setTab] = useState<Tab>('schedule');
  const [matches, setMatches] = useState<Match[]>(INITIAL_MATCHES);

  const standings = useMemo(() => computeStandings(matches), [matches]);

  const played = matches.filter(m => m.homeScore !== null).length;

  function handleScoreUpdate(matchId: string, home: number | null, away: number | null) {
    setMatches(prev =>
      prev.map(m => m.id === matchId ? { ...m, homeScore: home, awayScore: away } : m)
    );
  }

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.logo}>
            <span className={styles.logoEmoji}>⚽</span>
            <div>
              <div className={styles.logoTitle}>World Cup 2026</div>
              <div className={styles.logoSub}>USA · Canada · Mexico</div>
            </div>
          </div>
          <div className={styles.headerStats}>
            <div className={styles.headerStat}>
              <span className={styles.headerStatVal}>{played}</span>
              <span className={styles.headerStatLbl}>Played</span>
            </div>
            <div className={styles.headerStat}>
              <span className={styles.headerStatVal}>{matches.length - played}</span>
              <span className={styles.headerStatLbl}>Remaining</span>
            </div>
            <div className={styles.headerStat}>
              <span className={styles.headerStatVal}>Jun 11</span>
              <span className={styles.headerStatLbl}>Kick-off</span>
            </div>
            <div className={styles.headerStat}>
              <span className={styles.headerStatVal}>Jul 19</span>
              <span className={styles.headerStatLbl}>Final</span>
            </div>
          </div>
        </div>
      </header>

      <div className={styles.nav}>
        <div className={styles.navInner}>
          {(['schedule', 'groups', 'teams'] as Tab[]).map(t => (
            <button
              key={t}
              className={`${styles.navBtn} ${tab === t ? styles.navBtnActive : ''}`}
              onClick={() => setTab(t)}
            >
              {t === 'schedule' && '📅 '}
              {t === 'groups' && '🏆 '}
              {t === 'teams' && '🌍 '}
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <main className={styles.main}>
        <div className={styles.content}>
          {tab === 'schedule' && (
            <ScheduleView matches={matches} onScoreUpdate={handleScoreUpdate} />
          )}
          {tab === 'groups' && (
            <GroupsView standings={standings} />
          )}
          {tab === 'teams' && (
            <TeamsView matches={matches} standings={standings} />
          )}
        </div>
      </main>
    </div>
  );
}
