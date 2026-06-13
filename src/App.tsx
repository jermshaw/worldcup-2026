import { useMemo, useState } from 'react';
import { computeStandings, GROUPS } from './data';
import { useLiveScores } from './useLiveScores';
import ScheduleView from './components/ScheduleView';
import GroupsView from './components/GroupsView';
import TeamsView from './components/TeamsView';
import styles from './App.module.css';
import tabSchedule from './assets/nav/tab-schedule.png';
import tabTeams from './assets/nav/tab-teams.png';
import tabStandings from './assets/nav/tab-standings.png';

type Tab = 'schedule' | 'teams' | 'standings';

const WC_LOGO = 'https://www.figma.com/api/mcp/asset/23df7400-0e77-4372-860f-065ebc722074';
const FINAL_DATE = new Date('2026-07-19');

function daysUntilFinal() {
  const now = new Date();
  const diff = FINAL_DATE.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function App() {
  const [tab, setTab] = useState<Tab>('schedule');
  const { matches, teams, status, lastUpdated, refresh } = useLiveScores();

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
      {tab !== 'teams' && <header className={styles.header}>
        <div className={styles.headerTop}>
          <img src={WC_LOGO} alt="World Cup 2026" className={styles.logo} />
          <h1 className={styles.title}>{'WORLD CUP\n2026'}</h1>
          <button
            className={`${styles.liveChip} ${status === 'live' ? styles.liveChipOn : ''}`}
            onClick={refresh}
            title={lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : undefined}
          >
            <span className={`${styles.liveDot} ${status === 'live' ? styles.liveDotPulse : ''}`} />
            {status === 'live' ? 'Live' : 'Retry'}
          </button>
        </div>

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
          <div className={styles.statDivider} />
          <div className={styles.statBlock}>
            <span className={styles.statNum}>{days}</span>
            <span className={styles.statLbl}>Days left</span>
          </div>
        </div>
      </header>}

      <main className={styles.main}>
        {tab === 'schedule' && (
          <ScheduleView matches={matches} teams={teams} standings={standings} />
        )}
        {tab === 'teams' && (
          <TeamsView matches={matches} teams={teams} standings={standings} />
        )}
        {tab === 'standings' && (
          <GroupsView standings={standings} teams={teams} activeGroups={activeGroups} />
        )}
      </main>

      <nav className={styles.nav}>
        <div className={styles.navPill}>
          <div
            className={styles.navHighlight}
            style={{ transform: `translateX(${({ schedule: 0, teams: 117, standings: 232 } as const)[tab]}px)` }}
          />
          {([
            { id: 'schedule',  img: tabSchedule,   label: 'Schedule' },
            { id: 'teams',     img: tabTeams,       label: 'Teams' },
            { id: 'standings', img: tabStandings,   label: 'Standings' },
          ] as const).map(({ id, img, label }) => (
            <button
              key={id}
              className={`${styles.navBtn} ${tab === id ? styles.navBtnActive : ''}`}
              onClick={() => setTab(id)}
            >
              <img src={img} className={styles.navIcon} alt={label} />
              <span className={styles.navLabel}>{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
