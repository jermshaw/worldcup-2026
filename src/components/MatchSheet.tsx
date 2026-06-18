import { useState, useRef, useEffect } from 'react';
import type { Match, Team } from '../data';
import { isLive } from '../data';
import { getTeamColor, getTeamTextColor } from '../teamColors';
import { FIFA_RANKINGS } from '../fifaRankings';
import { getCityForVenue } from '../venueData';
import WavingFlag from './WavingFlag';
import styles from './MatchSheet.module.css';

interface MatchDetail {
  possession: { home: number; away: number } | null;
  shotsOnTarget: { home: number; away: number } | null;
}

type MatchEventType = 'goal' | 'own_goal' | 'penalty' | 'yellow' | 'red' | 'yellow_red' | 'sub';
type MatchEvent = { minute: number; minuteLabel: string; type: MatchEventType; teamId: string; playerName: string; playerOutName?: string };

interface LineupPlayer {
  id: number;
  name: string;
  position: string | null;
  shirtNumber: number | null;
}

interface Props {
  match: Match;
  teams: Map<string, Team>;
  onClose: () => void;
}

function formatName(name: string): string {
  if (!name) return '';
  const parts = name.trim().split(' ');
  if (parts.length < 2) return name;
  return `${parts[0][0]}. ${parts.slice(1).join(' ')}`;
}


export default function MatchSheet({ match, teams, onClose }: Props) {
  const homeTeam = teams.get(match.homeTeamId);
  const awayTeam = teams.get(match.awayTeamId);
  const homeColor = getTeamColor(match.homeTeamId);
  const awayColor = getTeamColor(match.awayTeamId);
  const live = isLive(match);

  const [dragY, setDragY] = useState(0);
  const [dismissing, setDismissing] = useState(false);
  const [detail, setDetail] = useState<MatchDetail | null>(null);
  const [matchEvents, setMatchEvents] = useState<MatchEvent[]>([]);
  const [homeLineup, setHomeLineup] = useState<LineupPlayer[]>([]);
  const [awayLineup, setAwayLineup] = useState<LineupPlayer[]>([]);
  const bodyRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const touchActive = useRef(false);
  const touchStartY = useRef(0);
  const touchCurY = useRef(0);
  const pointerActive = useRef(false);
  const pointerStartY = useRef(0);

  useEffect(() => {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const prev = document.body.style.overflow;
    const prevPad = document.body.style.paddingRight;
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;
    return () => {
      document.body.style.overflow = prev;
      document.body.style.paddingRight = prevPad;
    };
  }, []);

  useEffect(() => {
    fetch(`/.netlify/functions/match?id=${match.apiId}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return;
        // Stats
        const getStat = (type: string) =>
          (data.statistics ?? []).find((s: { type: string }) => s.type === type);
        const poss = getStat('BALL_POSSESSION');
        const shots = getStat('SHOTS_ON_GOAL');
        setDetail({
          possession: poss
            ? { home: parseInt(poss.home ?? '0'), away: parseInt(poss.away ?? '0') }
            : null,
          shotsOnTarget: shots
            ? { home: parseInt(shots.home ?? '0'), away: parseInt(shots.away ?? '0') }
            : null,
        });
        // Build all match events
        const homeId: number = data.homeTeam?.id;
        const awayId: number = data.awayTeam?.id;
        const events: MatchEvent[] = [];

        // Goals
        for (const g of (data.goals ?? []) as Array<{
          minute: number | null;
          injuryTime?: number | null;
          type: string;
          team: { id: number; name: string };
          scorer: { name: string } | null;
        }>) {
          if (!g.scorer?.name) continue;
          const isOG = g.type === 'OWN';
          const isPen = g.type === 'PENALTY';
          const benefitsHome = isOG ? g.team.id === awayId : g.team.id === homeId;
          const min = g.minute ?? 0;
          const minuteLabel = g.injuryTime ? `${min}+${g.injuryTime}` : String(min);
          events.push({
            minute: min, minuteLabel,
            type: isOG ? 'own_goal' : isPen ? 'penalty' : 'goal',
            teamId: benefitsHome ? match.homeTeamId : match.awayTeamId,
            playerName: isOG ? `${g.scorer.name} (OG)` : isPen ? `${g.scorer.name} (P)` : g.scorer.name,
          });
        }

        // Substitutions
        for (const s of (data.substitutions ?? []) as Array<{
          minute: number | null;
          team: { id: number };
          playerIn: { name: string } | null;
          playerOut: { name: string } | null;
        }>) {
          if (!s.playerIn?.name) continue;
          const min = s.minute ?? 0;
          events.push({
            minute: min, minuteLabel: String(min),
            type: 'sub',
            teamId: s.team.id === homeId ? match.homeTeamId : match.awayTeamId,
            playerName: s.playerIn.name,
            playerOutName: s.playerOut?.name,
          });
        }

        // Bookings
        for (const b of (data.bookings ?? []) as Array<{
          minute: number | null;
          team: { id: number };
          player: { name: string } | null;
          card: string;
        }>) {
          if (!b.player?.name) continue;
          const min = b.minute ?? 0;
          const cardType: MatchEventType = b.card === 'RED' ? 'red' : b.card === 'YELLOW_RED' ? 'yellow_red' : 'yellow';
          events.push({
            minute: min, minuteLabel: String(min),
            type: cardType,
            teamId: b.team.id === homeId ? match.homeTeamId : match.awayTeamId,
            playerName: b.player.name,
          });
        }

        events.sort((a, b) => a.minute - b.minute);
        setMatchEvents(events);

        // Lineups
        setHomeLineup((data.homeTeam?.lineup ?? []) as LineupPlayer[]);
        setAwayLineup((data.awayTeam?.lineup ?? []) as LineupPlayer[]);
      })
      .catch(() => null);
  }, [match.apiId, match.homeTeamId, match.awayTeamId]);

  function dismiss() {
    setDismissing(true);
    setDragY(window.innerHeight);
    setTimeout(onClose, 320);
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType === 'touch') return;
    pointerStartY.current = e.clientY;
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType === 'touch') return;
    if (!(e.buttons & 1)) return;
    const dy = e.clientY - pointerStartY.current;
    const scrolled = bodyRef.current?.scrollTop ?? 0;
    if (pointerActive.current) {
      setDragY(Math.max(0, dy));
    } else if (scrolled === 0 && dy > 10) {
      pointerActive.current = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      setDragY(dy);
    }
  }

  function onPointerUp() {
    if (!pointerActive.current) return;
    pointerActive.current = false;
    setDragY(prev => {
      if (prev > 120) { setDismissing(true); setTimeout(onClose, 320); return window.innerHeight; }
      return 0;
    });
  }

  useEffect(() => {
    const sheet = sheetRef.current;
    if (!sheet) return;

    function onTouchStart(e: TouchEvent) {
      touchStartY.current = e.touches[0].clientY;
      touchActive.current = false;
      touchCurY.current = 0;
    }

    function onTouchMove(e: TouchEvent) {
      const dy = e.touches[0].clientY - touchStartY.current;
      const scrolled = bodyRef.current?.scrollTop ?? 0;
      if (touchActive.current || (scrolled === 0 && dy > 0)) {
        touchActive.current = true;
        e.preventDefault();
        touchCurY.current = Math.max(0, dy);
        setDragY(touchCurY.current);
      }
    }

    function onTouchEnd() {
      if (!touchActive.current) return;
      touchActive.current = false;
      if (touchCurY.current > 120) {
        setDismissing(true);
        setDragY(window.innerHeight);
        setTimeout(onClose, 320);
      } else {
        setDragY(0);
      }
    }

    sheet.addEventListener('touchstart', onTouchStart, { passive: true });
    sheet.addEventListener('touchmove', onTouchMove, { passive: false });
    sheet.addEventListener('touchend', onTouchEnd);
    sheet.addEventListener('touchcancel', onTouchEnd);
    return () => {
      sheet.removeEventListener('touchstart', onTouchStart);
      sheet.removeEventListener('touchmove', onTouchMove);
      sheet.removeEventListener('touchend', onTouchEnd);
      sheet.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [onClose]);

  const hasScore = match.homeScore !== null && match.awayScore !== null;
  const matchLabel = match.matchNumber ? `Match ${match.matchNumber}` : match.stage;

  const todayStr = new Date().toLocaleDateString('en-CA');
  const tomorrowDate = new Date(); tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowStr = tomorrowDate.toLocaleDateString('en-CA');
  const isToday = match.date === todayStr;
  const isTomorrow = match.date === tomorrowStr;

  function pillPrimary() {
    if (live) {
      const te = match.timeElapsed;
      if (te) return te === 'HT' ? 'Halftime' : /^\d/.test(te) ? `LIVE - ${te}'` : te;
      return 'LIVE';
    }
    if (match.status === 'FINISHED') return 'Finished';
    if (isToday) return `Today at ${match.time}`;
    if (isTomorrow) return `Tomorrow at ${match.time}`;
    const d = new Date(`${match.date}T12:00:00`);
    const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
    const monthDay = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${weekday}, ${monthDay} at ${match.time}`;
  }

  const city = getCityForVenue(match.venue);
  function pillSub() {
    const parts: string[] = [matchLabel];
    if (match.group) parts.push(`Group ${match.group}`);
    if (city) parts.push(city);
    return parts.join(' • ');
  }

  const isGoal = (e: MatchEvent) => e.type === 'goal' || e.type === 'own_goal' || e.type === 'penalty';
  const isBooking = (e: MatchEvent) => e.type === 'yellow' || e.type === 'red' || e.type === 'yellow_red';
  const homeGoals = matchEvents.filter(e => e.teamId === match.homeTeamId && isGoal(e));
  const awayGoals = matchEvents.filter(e => e.teamId === match.awayTeamId && isGoal(e));
  const homeSubs = matchEvents.filter(e => e.teamId === match.homeTeamId && e.type === 'sub');
  const awaySubs = matchEvents.filter(e => e.teamId === match.awayTeamId && e.type === 'sub');
  const homeBookings = matchEvents.filter(e => e.teamId === match.homeTeamId && isBooking(e));
  const awayBookings = matchEvents.filter(e => e.teamId === match.awayTeamId && isBooking(e));
  const hasHighlights = matchEvents.length > 0;

  const hasLineup = homeLineup.length > 0 || awayLineup.length > 0;

  return (
    <div
      className={`${styles.overlay} ${dismissing ? styles.overlayOut : ''}`}
      onClick={dismiss}
    >
      <div
        ref={sheetRef}
        className={styles.sheet}
        style={{
          transform: `translateY(${dragY}px)`,
          transition: (touchActive.current || pointerActive.current) ? 'none' : 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
        }}
        onClick={e => e.stopPropagation()}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div className={styles.dragZone}>
          <div className={styles.dragHandle} />
        </div>

        {/* Full-height gradient background */}
        <div className={styles.bgLeft} style={{ background: `linear-gradient(102.41deg, ${homeColor} 16%, ${awayColor} 77%)`, width: '100%' }} />

        <div ref={bodyRef} className={styles.sheetScroll}>

        {/* Header */}
        <div className={styles.header} style={!hasScore ? { height: 300 } : undefined}>

          {/* Game label pill — top center */}
          <div className={styles.gamePill}>
            <span className={styles.gamePillPrimary}>{pillPrimary()}</span>
            <span className={styles.gamePillSub}>{pillSub()}</span>
          </div>

          {/* VS label */}
          <span className={styles.vsLabel}>VS</span>

          {/* Home team */}
          <div className={styles.teamBlockLeft} style={{ color: getTeamTextColor(match.homeTeamId) }}>
            <WavingFlag teamId={match.homeTeamId} width={130} />
            <h2 className={styles.teamName}>{homeTeam?.name ?? match.homeTeamId}</h2>
            {FIFA_RANKINGS[match.homeTeamId] && (
              <p className={styles.teamRankText}>
                <span className={styles.teamRankMuted}>Ranked </span>
                <strong className={styles.teamRankBold}>{FIFA_RANKINGS[match.homeTeamId]}</strong>
                <span className={styles.teamRankMuted}> in the world</span>
              </p>
            )}
          </div>

          {/* Away team */}
          <div className={styles.teamBlockRight} style={{ color: getTeamTextColor(match.awayTeamId) }}>
            <WavingFlag teamId={match.awayTeamId} width={130} timeOffset={200} />
            <h2 className={styles.teamName}>{awayTeam?.name ?? match.awayTeamId}</h2>
            {FIFA_RANKINGS[match.awayTeamId] && (
              <p className={styles.teamRankText}>
                <span className={styles.teamRankMuted}>Ranked </span>
                <strong className={styles.teamRankBold}>{FIFA_RANKINGS[match.awayTeamId]}</strong>
                <span className={styles.teamRankMuted}> in the world</span>
              </p>
            )}
          </div>

          {/* Score bar — bottom of header */}
          <div className={styles.scoreBar}>
            {hasScore && (
              <div className={styles.scoreRow}>
                <span className={styles.scoreNum}>{match.homeScore}</span>
                <span className={styles.scoreNum}>{match.awayScore}</span>
              </div>
            )}
          </div>
        </div>

        {/* Scrollable body */}
        <div className={styles.body}>

          {/* Match highlights */}
          {hasHighlights && (
            <div className={styles.card}>
              <p className={styles.cardTitle}>Match highlights</p>

              {(homeGoals.length > 0 || awayGoals.length > 0) && (
                <div className={styles.highlightSection}>
                  <p className={styles.sectionLabel}>Goals</p>
                  <div className={styles.twoCol}>
                    <div className={styles.col}>
                      {homeGoals.map((ev, i) => (
                        <div key={i} className={styles.eventItem}>
                          <span className={styles.iconBall}>⚽</span>
                          <span className={styles.eventText}>{formatName(ev.playerName)} <span className={styles.eventMinInline}>{ev.minuteLabel}'</span></span>
                        </div>
                      ))}
                    </div>
                    <div className={styles.col}>
                      {awayGoals.map((ev, i) => (
                        <div key={i} className={styles.eventItem}>
                          <span className={styles.iconBall}>⚽</span>
                          <span className={styles.eventText}>{formatName(ev.playerName)} <span className={styles.eventMinInline}>{ev.minuteLabel}'</span></span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {(homeSubs.length > 0 || awaySubs.length > 0) && (
                <div className={styles.highlightSection}>
                  <p className={styles.sectionLabel}>Substitutions</p>
                  <div className={styles.twoCol}>
                    <div className={styles.col}>
                      {homeSubs.map((ev, i) => (
                        <div key={i} className={styles.eventItem}>
                          <span className={styles.iconSub}>↑</span>
                          <span className={styles.eventText}>{formatName(ev.playerName)} <span className={styles.eventMinInline}>{ev.minuteLabel}'</span></span>
                        </div>
                      ))}
                    </div>
                    <div className={styles.col}>
                      {awaySubs.map((ev, i) => (
                        <div key={i} className={styles.eventItem}>
                          <span className={styles.iconSub}>↑</span>
                          <span className={styles.eventText}>{formatName(ev.playerName)} <span className={styles.eventMinInline}>{ev.minuteLabel}'</span></span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {(homeBookings.length > 0 || awayBookings.length > 0) && (
                <div className={styles.highlightSection}>
                  <p className={styles.sectionLabel}>Bookings</p>
                  <div className={styles.twoCol}>
                    <div className={styles.col}>
                      {homeBookings.map((ev, i) => (
                        <div key={i} className={styles.eventItem}>
                          <div className={ev.type === 'red' ? styles.iconRed : ev.type === 'yellow_red' ? styles.iconYellowRed : styles.iconYellow} />
                          <span className={styles.eventText}>{formatName(ev.playerName)} <span className={styles.eventMinInline}>{ev.minuteLabel}'</span></span>
                        </div>
                      ))}
                    </div>
                    <div className={styles.col}>
                      {awayBookings.map((ev, i) => (
                        <div key={i} className={styles.eventItem}>
                          <div className={ev.type === 'red' ? styles.iconRed : ev.type === 'yellow_red' ? styles.iconYellowRed : styles.iconYellow} />
                          <span className={styles.eventText}>{formatName(ev.playerName)} <span className={styles.eventMinInline}>{ev.minuteLabel}'</span></span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Possession */}
          {detail?.possession && (
            <div className={styles.card}>
              <p className={styles.cardTitle}>Possession</p>
              <div className={styles.twoCol}>
                <span className={styles.statValue}>{detail.possession.home}%</span>
                <span className={styles.statValue}>{detail.possession.away}%</span>
              </div>
              <div className={styles.possBar}>
                <div className={styles.possSegment} style={{ flex: detail.possession.home, background: homeColor }} />
                <div className={styles.possSegment} style={{ flex: detail.possession.away, background: awayColor }} />
              </div>
            </div>
          )}

          {/* Shots on target */}
          {detail?.shotsOnTarget && (
            <div className={styles.card}>
              <p className={styles.cardTitle}>Shots on target</p>
              <div className={styles.twoCol}>
                <span className={styles.statValue}>{detail.shotsOnTarget.home}</span>
                <span className={styles.statValue}>{detail.shotsOnTarget.away}</span>
              </div>
            </div>
          )}

          {/* Line-ups */}
          {hasLineup && (
            <div className={styles.card}>
              <p className={styles.cardTitle}>Line-ups</p>
              <div className={styles.twoCol}>
                <div className={styles.col}>
                  {homeLineup.map(p => (
                    <div key={p.id} className={styles.playerRow}>
                      <span className={styles.playerName}>{p.name}</span>
                      {p.shirtNumber != null && (
                        <span className={styles.playerNum}>{p.shirtNumber}</span>
                      )}
                    </div>
                  ))}
                </div>
                <div className={styles.col}>
                  {awayLineup.map(p => (
                    <div key={p.id} className={styles.playerRow}>
                      <span className={styles.playerName}>{p.name}</span>
                      {p.shirtNumber != null && (
                        <span className={styles.playerNum}>{p.shirtNumber}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
        </div>{/* end sheetScroll */}
      </div>
    </div>
  );
}
