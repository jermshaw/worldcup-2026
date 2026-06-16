import { useState, useRef, useEffect } from 'react';
import type { Match, Team } from '../data';
import { isLive } from '../data';
import { getTeamColor } from '../teamColors';
import { FIFA_RANKINGS } from '../fifaRankings';
import { MATCH_CITY } from '../venueMap';
import WavingFlag from './WavingFlag';
import styles from './MatchSheet.module.css';

interface MatchDetail {
  possession: { home: number; away: number } | null;
  shotsOnTarget: { home: number; away: number } | null;
}

type MatchEventType = 'goal' | 'own_goal' | 'penalty' | 'yellow' | 'red' | 'yellow_red';
type MatchEvent = { minute: number; type: MatchEventType; teamId: string; playerName: string };

// Module-level cache — fetched once, shared across all MatchSheet instances
type ScorerEntry = { home: string | null; away: string | null };
let wcScorerMapCache: Promise<Record<string, ScorerEntry>> | null = null;

export function getWcScorerMap(): Promise<Record<string, ScorerEntry>> {
  if (!wcScorerMapCache) {
    wcScorerMapCache = (async () => {
      const [gamesRes, teamsRes] = await Promise.all([
        fetch('https://worldcup26.ir/get/games'),
        fetch('https://worldcup26.ir/get/teams'),
      ]);
      if (!gamesRes.ok || !teamsRes.ok) {
        wcScorerMapCache = null;
        return {};
      }
      const [gamesData, teamsData] = await Promise.all([gamesRes.json(), teamsRes.json()]);
      const idToFifa = new Map<string, string>(
        (teamsData.teams as { id: string; fifa_code: string }[]).map(t => [t.id, t.fifa_code])
      );
      const map: Record<string, ScorerEntry> = {};
      for (const g of gamesData.games as { home_team_id: string; away_team_id: string; home_scorers: string; away_scorers: string }[]) {
        const home = idToFifa.get(g.home_team_id);
        const away = idToFifa.get(g.away_team_id);
        if (home && away) map[`${home}:${away}`] = { home: g.home_scorers, away: g.away_scorers };
      }
      return map;
    })().catch(() => {
      wcScorerMapCache = null;
      return {};
    });
  }
  return wcScorerMapCache;
}

function parseScorerString(raw: string | null): Array<{ name: string; minute: number; penalty: boolean; ownGoal: boolean }> {
  if (!raw || raw === 'null' || raw === '{}') return [];
  const inner = raw.replace(/^\{|\}$/g, '');
  if (!inner || inner === 'null') return [];
  const found = inner.match(/"([^"]+)"/g);
  if (!found) return [];
  return found.map(m => {
    const entry = m.slice(1, -1);
    const penalty = /\(p\)/i.test(entry);
    const ownGoal = /\(og\)|\(o\.g\.\)/i.test(entry);
    const minuteMatch = entry.match(/(\d+)(?:\+\d+)?'/);
    const minute = minuteMatch ? parseInt(minuteMatch[1]) : 0;
    const name = entry.replace(/\s+\d+(?:\+\d+)?'.*$/, '').trim();
    return { name, minute, penalty, ownGoal };
  });
}

interface SquadPlayer {
  id: number;
  name: string;
  position: string | null;
  dateOfBirth: string | null;
}

interface TeamSquad {
  coach: string | null;
  squad: SquadPlayer[];
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

  const [dragY, setDragY] = useState(0);
  const [dismissing, setDismissing] = useState(false);
  const [detail, setDetail] = useState<MatchDetail | null>(null);
  const [wcEvents, setWcEvents] = useState<MatchEvent[]>([]);
  const [squads, setSquads] = useState<Record<string, TeamSquad>>({});
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
    getWcScorerMap().then(map => {
      const key = `${match.homeTeamId}:${match.awayTeamId}`;
      const entry = map[key];
      if (!entry) return;
      const goals: MatchEvent[] = [];
      for (const s of parseScorerString(entry.home))
        goals.push({ minute: s.minute, type: s.ownGoal ? 'own_goal' : s.penalty ? 'penalty' : 'goal', teamId: match.homeTeamId, playerName: s.name });
      for (const s of parseScorerString(entry.away))
        goals.push({ minute: s.minute, type: s.ownGoal ? 'own_goal' : s.penalty ? 'penalty' : 'goal', teamId: match.awayTeamId, playerName: s.name });
      goals.sort((a, b) => a.minute - b.minute);
      setWcEvents(goals);
    });
  }, [match.homeTeamId, match.awayTeamId]);

  useEffect(() => {
    fetch('/.netlify/functions/squads')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setSquads(data); })
      .catch(() => null);
  }, []);

  useEffect(() => {
    fetch(`/.netlify/functions/match?id=${match.apiId}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return;
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
      })
      .catch(() => null);
  }, [match.apiId]);

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
  const live = isLive(match);
  const matchLabel = match.matchNumber ? `Match ${match.matchNumber}` : match.stage;

  const homeEvents = wcEvents.filter(e => e.teamId === match.homeTeamId);
  const awayEvents = wcEvents.filter(e => e.teamId === match.awayTeamId);
  const hasEvents = homeEvents.length > 0 || awayEvents.length > 0;

  const homeSquad = squads[match.homeTeamId]?.squad ?? [];
  const awaySquad = squads[match.awayTeamId]?.squad ?? [];
  const hasSquads = homeSquad.length > 0 || awaySquad.length > 0;

  const currentYear = new Date().getFullYear();

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

        {/* Full-height color bands — outside scroll so they stay fixed */}
        <div className={styles.bgLeft} style={{ background: homeColor }} />
        <div className={styles.bgRight} style={{ background: awayColor }} />

        <div ref={bodyRef} className={styles.sheetScroll}>

        {/* Header */}
        <div className={styles.header} style={!hasScore ? { height: 300 } : undefined}>

          {/* Game label pill — top center */}
          <div className={styles.gamePill}>
            <span className={styles.gamePillPrimary}>{matchLabel}</span>
            <span className={styles.gamePillSub}>
              {match.group ? `Group ${match.group} • ` : ''}
              {new Date(`${match.date}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              {MATCH_CITY[match.apiId] ? ` • ${MATCH_CITY[match.apiId]}` : ''}
              {live ? (
                <> • <span className={styles.pillLiveDot} /> LIVE</>
              ) : match.status === 'FINISHED' ? (
                ' • Finished'
              ) : (
                ` • ${match.time}`
              )}
            </span>
          </div>

          {/* Home team */}
          <div className={styles.teamBlockLeft}>
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
          <div className={styles.teamBlockRight}>
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

          {/* Goals scored */}
          {hasEvents && (
            <div className={styles.card}>
              <p className={styles.cardTitle}>Goals scored</p>
              <div className={styles.twoCol}>
                <div className={styles.col}>
                  {homeEvents.map((ev, i) => (
                    <div key={i} className={styles.playerRow}>
                      <span className={styles.playerName}>{formatName(ev.playerName)}</span>
                      <span className={styles.playerNum}>{ev.minute}'</span>
                    </div>
                  ))}
                </div>
                <div className={styles.col}>
                  {awayEvents.map((ev, i) => (
                    <div key={i} className={styles.playerRow}>
                      <span className={styles.playerName}>{formatName(ev.playerName)}</span>
                      <span className={styles.playerNum}>{ev.minute}'</span>
                    </div>
                  ))}
                </div>
              </div>
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

          {/* Squads — single card, two flat columns */}
          {hasSquads && (
            <div className={styles.card}>
              <p className={styles.cardTitle}>Squads</p>
              <div className={styles.twoCol}>
                <div className={styles.col}>
                  {homeSquad.map(p => (
                    <div key={p.id} className={styles.playerRow}>
                      <span className={styles.playerName}>{p.name}</span>
                      {p.dateOfBirth && (
                        <span className={styles.playerNum}>
                          {currentYear - new Date(p.dateOfBirth).getFullYear()}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                <div className={styles.col}>
                  {awaySquad.map(p => (
                    <div key={p.id} className={styles.playerRow}>
                      <span className={styles.playerName}>{p.name}</span>
                      {p.dateOfBirth && (
                        <span className={styles.playerNum}>
                          {currentYear - new Date(p.dateOfBirth).getFullYear()}
                        </span>
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
