import { useMemo, useState } from 'react';
import { computeStandings, GROUPS } from './data';
import { useLiveScores } from './useLiveScores';
import ScheduleView from './components/ScheduleView';
import GroupsView from './components/GroupsView';
import TeamsView from './components/TeamsView';
import styles from './App.module.css';

type Tab = 'schedule' | 'groups' | 'teams';

const WC_LOGO = 'https://www.figma.com/api/mcp/asset/23df7400-0e77-4372-860f-065ebc722074';
const FINAL_DATE = new Date('2026-07-19');

function daysUntilFinal() {
  const now = new Date();
  const diff = FINAL_DATE.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function App() {
  const [tab, setTab] = useState<Tab>('schedule');
  const { matches, teams, status, lastUpdated, refresh, updateScore } = useLiveScores();

  const standings = useMemo(() => computeStandings(matches, teams), [matches, teams]);
  const activeGroups = useMemo(() => GROUPS.filter(g => standings.has(g)), [standings]);
  const played = matches.filter(m => m.homeScore !== null).length;
  const days = daysUntilFinal();

  if (status === 'loading') {
    return (
      <div className={styles.splash}>
        <img src={WC_LOGO} alt="" className={styles.splashLogo} />
        <div className={styles.splashTitle}>WORLD CUP 2026</div>
        <div className={styles.splashSub}>Loading…</div>
      </div>
    );
  }

  if (status === 'error' && matches.length === 0) {
    return (
      <div className={styles.splash}>
        <div className={styles.splashTitle}>WORLD CUP 2026</div>
        <div className={styles.splashSub}>Failed to load scores.</div>
        <button className={styles.retryBtn} onClick={refresh}>Try again</button>
      </div>
    );
  }

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <img src={WC_LOGO} alt="World Cup 2026" className={styles.logo} />
        <h1 className={styles.title}>WORLD CUP 2026</h1>
        <div className={styles.subtitle}>{days} days left</div>

        <div className={styles.stats}>
          <div className={styles.statBlock}>
            <span className={styles.statNum}>{played}</span>
            <span className={styles.statLbl}>Games played</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statBlock}>
            <span className={styles.statNum}>{matches.length - played}</span>
            <span className={styles.statLbl}>Games remain</span>
          </div>
        </div>

        <button
          className={`${styles.liveChip} ${status === 'live' ? styles.liveChipOn : ''}`}
          onClick={refresh}
          title={lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : undefined}
        >
          <span className={`${styles.liveDot} ${status === 'live' ? styles.liveDotPulse : ''}`} />
          {status === 'live' ? 'Live' : 'Retry'}
        </button>
      </header>

      <main className={styles.main}>
        {tab === 'schedule' && (
          <ScheduleView matches={matches} teams={teams} onScoreUpdate={updateScore} />
        )}
        {tab === 'groups' && (
          <GroupsView standings={standings} teams={teams} activeGroups={activeGroups} />
        )}
        {tab === 'teams' && (
          <TeamsView matches={matches} teams={teams} standings={standings} />
        )}
      </main>

      <nav className={styles.nav}>
        <div className={styles.navPill}>
          {([
            { id: 'schedule', icon: '📅', label: 'Schedule' },
            { id: 'groups',   icon: '🏆', label: 'Groups' },
            { id: 'teams',    icon: '🌍', label: 'Teams' },
          ] as const).map(({ id, icon, label }) => (
            <button
              key={id}
              className={`${styles.navBtn} ${tab === id ? styles.navBtnActive : ''}`}
              onClick={() => setTab(id)}
            >
              <span className={styles.navIcon}>{icon}</span>
              <span className={styles.navLabel}>{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
