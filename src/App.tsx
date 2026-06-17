import { useMemo, useState } from 'react';
import { getWcScorerMap } from './components/MatchSheet';
import { getVenueMap } from './venueData';

getWcScorerMap();
getVenueMap();
import { computeStandings } from './data';
import { useLiveScores } from './useLiveScores';
import ScheduleView from './components/ScheduleView';
import StandingsView from './components/StandingsView';
import TeamsView from './components/TeamsView';
import styles from './App.module.css';
import tabSchedule from './assets/nav/tab-schedule.png';
import tabTeams from './assets/nav/tab-teams.png';
import tabStandings from './assets/nav/tab-standings.png';
import wcBall from './assets/nav/Ball.png';

type Tab = 'schedule' | 'teams' | 'standings';
const FINAL_DATE = new Date('2026-07-19');

function daysUntilFinal() {
  const now = new Date();
  const diff = FINAL_DATE.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function App() {
  const [tab, setTab] = useState<Tab>('schedule');
  const { matches, teams, status, refresh } = useLiveScores();

  const standings = useMemo(() => computeStandings(matches, teams), [matches, teams]);
  const played = matches.filter(m => m.homeScore !== null).length;
  const remaining = 104 - played;
  const days = daysUntilFinal();

  if (status === 'loading') {
    return (
      <div className={styles.splash}>
        <img src={wcBall} alt="" className={styles.splashLogo} />
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
      {tab !== 'teams' && tab !== 'standings' && <header className={styles.header}>
        <div className={styles.headerTop}>
          <img src={wcBall} alt="World Cup 2026" className={styles.logo} />
          <h1 className={styles.title}>{'WORLD CUP\n'}<span className={styles.titleYear}>2026</span></h1>
        </div>

        <div className={styles.stats}>
          <div className={styles.statBlock}>
            <span className={styles.statNum}>{played}</span>
            <span className={styles.statLbl}>Games played</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statBlock}>
            <span className={styles.statNum}>{remaining}</span>
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
          <ScheduleView matches={matches} teams={teams} />
        )}
        {tab === 'teams' && (
          <TeamsView matches={matches} teams={teams} standings={standings} />
        )}
        {tab === 'standings' && (
          <StandingsView matches={matches} teams={teams} standings={standings} />
        )}
      </main>

      <nav className={styles.nav}>
        <div className={styles.navPill}>
          <div
            className={styles.navHighlight}
            style={{ transform: `translateX(${({ schedule: 0, teams: 114, standings: 228 } as const)[tab]}px)` }}
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
