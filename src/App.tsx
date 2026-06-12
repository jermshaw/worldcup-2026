import { useMemo } from 'react';
import { useState } from 'react';
import { computeStandings, GROUPS } from './data';
import { useLiveScores } from './useLiveScores';
import ScheduleView from './components/ScheduleView';
import GroupsView from './components/GroupsView';
import TeamsView from './components/TeamsView';
import styles from './App.module.css';

type Tab = 'schedule' | 'groups' | 'teams';

export default function App() {
  const [tab, setTab] = useState<Tab>('schedule');
  const { matches, teams, status, lastUpdated, refresh, updateScore } = useLiveScores();

  const standings = useMemo(
    () => computeStandings(matches, teams),
    [matches, teams]
  );

  const activeGroups = useMemo(
    () => GROUPS.filter(g => standings.has(g)),
    [standings]
  );

  const played = matches.filter(m => m.homeScore !== null).length;

  if (status === 'loading') {
    return (
      <div className={styles.loadingScreen}>
        <span className={styles.loadingBall}>⚽</span>
        <div className={styles.loadingText}>Loading World Cup 2026…</div>
      </div>
    );
  }

  if (status === 'error' && matches.length === 0) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.loadingText}>Failed to load scores.</div>
        <button className={styles.retryBtn} onClick={refresh}>Try again</button>
      </div>
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
            <button
              className={`${styles.liveBtn} ${styles[`liveBtnStatus_${status}`]}`}
              onClick={refresh}
              title={lastUpdated ? `Last updated ${lastUpdated.toLocaleTimeString()}` : 'Click to refresh'}
            >
              <span className={`${styles.liveDot} ${status === 'live' ? styles.liveDotPulse : ''}`} />
              {status === 'error' ? 'Retry' : 'Live'}
              {lastUpdated && status === 'live' && (
                <span className={styles.liveTime}>
                  {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </button>
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
            <ScheduleView matches={matches} teams={teams} onScoreUpdate={updateScore} />
          )}
          {tab === 'groups' && (
            <GroupsView standings={standings} teams={teams} activeGroups={activeGroups} />
          )}
          {tab === 'teams' && (
            <TeamsView matches={matches} teams={teams} standings={standings} />
          )}
        </div>
      </main>
    </div>
  );
}
