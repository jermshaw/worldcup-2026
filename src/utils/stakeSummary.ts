import type { Match, Team, Group, StandingRow } from '../data';
import { FIFA_RANKINGS } from '../fifaRankings';

function ordinal(n: number) {
  return n === 1 ? '1st' : n === 2 ? '2nd' : n === 3 ? '3rd' : `${n}th`;
}

export function getStakeSummary(
  m: Match,
  standings: Map<Group, StandingRow[]>,
  teams: Map<string, Team>,
): string | null {
  if (!m.group) return null;
  const groupRows = standings.get(m.group as Group);
  if (!groupRows) return null;

  const homeRow = groupRows.find(r => r.teamId === m.homeTeamId);
  const awayRow = groupRows.find(r => r.teamId === m.awayTeamId);
  const homePts = homeRow?.pts ?? 0;
  const awayPts = awayRow?.pts ?? 0;
  const homeMP = homeRow?.mp ?? 0;
  const awayMP = awayRow?.mp ?? 0;
  const homeName = teams.get(m.homeTeamId)?.name ?? m.homeTeamId;
  const awayName = teams.get(m.awayTeamId)?.name ?? m.awayTeamId;
  const homeRank = FIFA_RANKINGS[m.homeTeamId] ?? 100;
  const awayRank = FIFA_RANKINGS[m.awayTeamId] ?? 100;

  function getHighlights() {
    try {
      const raw = localStorage.getItem(`wc2026_highlights_${m.id}`);
      return raw ? JSON.parse(raw) as { hatTricks: string[]; redCards: string[] } : null;
    } catch { return null; }
  }

  // FINISHED
  if (m.status === 'FINISHED' && m.homeScore !== null && m.awayScore !== null) {
    const homePos = groupRows.findIndex(r => r.teamId === m.homeTeamId) + 1;
    const awayPos = groupRows.findIndex(r => r.teamId === m.awayTeamId) + 1;
    const margin = Math.abs(m.homeScore - m.awayScore);
    const totalGoals = m.homeScore + m.awayScore;
    const highlights = getHighlights();
    const hatTrick = highlights?.hatTricks[0] ?? null;

    if (m.homeScore > m.awayScore) {
      const isUpset = awayRank <= homeRank - 25;
      const prefix = hatTrick ? `${hatTrick} scored a hat trick. ` : '';
      const loser = `${awayName} are ${ordinal(awayPos)} with ${awayPts} pt${awayPts !== 1 ? 's' : ''}.`;
      if (isUpset)
        return `${prefix}${homeName} pull off an upset win over ${awayName}. They rise to ${ordinal(homePos)} in Group ${m.group}. ${loser}`;
      if (margin >= 3)
        return `${prefix}A convincing ${m.homeScore}-${m.awayScore} for ${homeName}. They rise to ${ordinal(homePos)} in Group ${m.group} with ${homePts} pts. ${loser}`;
      return `${prefix}${homeName} win and rise to ${ordinal(homePos)} in Group ${m.group} with ${homePts} pts. ${loser}`;
    }

    if (m.awayScore > m.homeScore) {
      const isUpset = homeRank <= awayRank - 25;
      const prefix = hatTrick ? `${hatTrick} scored a hat trick. ` : '';
      const loser = `${homeName} are ${ordinal(homePos)} with ${homePts} pt${homePts !== 1 ? 's' : ''}.`;
      if (isUpset)
        return `${prefix}${awayName} pull off an upset win over ${homeName}. They rise to ${ordinal(awayPos)} in Group ${m.group}. ${loser}`;
      if (margin >= 3)
        return `${prefix}A convincing ${m.awayScore}-${m.homeScore} for ${awayName}. They rise to ${ordinal(awayPos)} in Group ${m.group} with ${awayPts} pts. ${loser}`;
      return `${prefix}${awayName} win and rise to ${ordinal(awayPos)} in Group ${m.group} with ${awayPts} pts. ${loser}`;
    }

    // Draw
    const rankGap = Math.abs(homeRank - awayRank);
    const bigName = homeRank < awayRank ? homeName : awayName;
    const smallName = homeRank < awayRank ? awayName : homeName;
    const bigPos = homeRank < awayRank ? homePos : awayPos;
    const smallPos = homeRank < awayRank ? awayPos : homePos;
    if (rankGap >= 25)
      return `${smallName} hold ${bigName} to a draw. ${bigName} are ${ordinal(bigPos)}, ${smallName} ${ordinal(smallPos)} in Group ${m.group}.`;
    if (m.homeScore === 0)
      return `A goalless draw. ${homeName} are ${ordinal(homePos)}, ${awayName} ${ordinal(awayPos)} in Group ${m.group}.`;
    if (totalGoals >= 4)
      return `A ${m.homeScore}-${m.awayScore} thriller. ${homeName} are ${ordinal(homePos)}, ${awayName} ${ordinal(awayPos)} in Group ${m.group}.`;
    return `It's a draw. ${homeName} are ${ordinal(homePos)}, ${awayName} ${ordinal(awayPos)} in Group ${m.group}.`;
  }

  // LIVE
  if ((m.status === 'IN_PLAY' || m.status === 'PAUSED') && m.homeScore !== null && m.awayScore !== null) {
    const projPos = (teamId: string, addPts: number) =>
      groupRows.filter(r => r.teamId !== teamId && r.pts > (groupRows.find(x => x.teamId === teamId)?.pts ?? 0) + addPts).length + 1;
    const rankGap = Math.abs(homeRank - awayRank);

    if (m.homeScore > m.awayScore) {
      const pos = projPos(m.homeTeamId, 3);
      if (rankGap >= 25 && awayRank < homeRank)
        return `${homeName} are causing an upset. A win here would put them ${ordinal(pos)} in Group ${m.group} with ${homePts + 3} pts.`;
      return `${homeName} lead. A win here would put them ${ordinal(pos)} in Group ${m.group} with ${homePts + 3} pts.`;
    }
    if (m.awayScore > m.homeScore) {
      const pos = projPos(m.awayTeamId, 3);
      if (rankGap >= 25 && homeRank < awayRank)
        return `${awayName} are causing an upset. A win here would put them ${ordinal(pos)} in Group ${m.group} with ${awayPts + 3} pts.`;
      return `${awayName} lead. A win here would put them ${ordinal(pos)} in Group ${m.group} with ${awayPts + 3} pts.`;
    }
    if (m.homeScore === 0 && rankGap >= 25) {
      const favorName = homeRank < awayRank ? homeName : awayName;
      const underdogName = homeRank < awayRank ? awayName : homeName;
      return `${underdogName} are keeping ${favorName} at bay. A draw would leave both on ${homePts + 1} pts in Group ${m.group}.`;
    }
    const drawHomePts = homePts + 1;
    const drawAwayPts = awayPts + 1;
    const pt = (n: number) => `${n} pt${n !== 1 ? 's' : ''}`;
    const projDrawHomePos = groupRows.filter(r => r.teamId !== m.homeTeamId && r.pts > drawHomePts).length + 1;
    const projDrawAwayPos = groupRows.filter(r => r.teamId !== m.awayTeamId && r.pts > drawAwayPts).length + 1;
    const drawPos1 = projDrawHomePos;
    const drawPos2 = projDrawHomePos === projDrawAwayPos ? projDrawHomePos + 1 : projDrawAwayPos;
    const posCtx = `keeps them in ${ordinal(drawPos1)} and ${ordinal(drawPos2)} place in Group ${m.group}`;
    const ptCtx = drawHomePts === drawAwayPts ? `both ${pt(drawHomePts)}` : `${homeName} ${pt(drawHomePts)}, ${awayName} ${pt(drawAwayPts)}`;
    if (m.homeScore >= 2)
      return `An entertaining ${m.homeScore}-${m.awayScore} so far. A draw gives ${ptCtx}, but ${posCtx}.`;
    return `It's level. A draw gives ${ptCtx}, but ${posCtx}.`;
  }

  // UPCOMING
  if (homeMP === 0 && awayMP === 0) {
    const rankGap = Math.abs(homeRank - awayRank);
    if (rankGap >= 30) {
      const favorName = homeRank < awayRank ? homeName : awayName;
      const underdogName = homeRank < awayRank ? awayName : homeName;
      return `${underdogName} face a tough test against tournament favorites ${favorName} in Group ${m.group}.`;
    }
    return null;
  }

  if (homeMP <= 1 && awayMP <= 1) {
    if (homePts === 0 && awayPts === 0)
      return `Both teams lost their opener. The loser here is in serious trouble in Group ${m.group}.`;
    if (homePts === 1 && awayPts === 1)
      return `Both drew their first match. A win puts either side in the top two of Group ${m.group}.`;
    if (homePts === 3 && awayPts === 3)
      return `Both won their opener. The winner moves clear at the top of Group ${m.group}.`;
    if (homePts === 3 && awayPts === 1)
      return `${homeName} lead Group ${m.group} with 3 pts. ${awayName} need a win to keep pace.`;
    if (homePts === 1 && awayPts === 3)
      return `${awayName} lead Group ${m.group} with 3 pts. ${homeName} need a win to keep pace.`;
    if (homePts === 3 && awayPts === 0)
      return `${homeName} have 3 pts in Group ${m.group}. ${awayName} are bottom and need a win.`;
    if (homePts === 0 && awayPts === 3)
      return `${awayName} have 3 pts in Group ${m.group}. ${homeName} are bottom and need a win.`;
    if (homePts === 1 && awayPts === 0)
      return `${homeName} have 1 pt in Group ${m.group}. ${awayName} have none and must win to stay in contention.`;
    if (homePts === 0 && awayPts === 1)
      return `${awayName} have 1 pt in Group ${m.group}. ${homeName} have none and must win to stay in contention.`;
  }

  // Matchday 3+
  if (homePts === 0 && awayPts === 0)
    return `Neither team has a point in Group ${m.group}. Lose here and the World Cup is over.`;
  if (homePts === awayPts)
    return `Both have ${homePts} pts in Group ${m.group}. The winner advances; the loser likely goes home.`;

  const leaderName = homePts > awayPts ? homeName : awayName;
  const trailerName = homePts > awayPts ? awayName : homeName;
  const leaderPts = Math.max(homePts, awayPts);
  const trailerPts = Math.min(homePts, awayPts);

  if (trailerPts === 0)
    return `${leaderName} lead Group ${m.group} on ${leaderPts} pts. ${trailerName} need a win to stay in the tournament.`;
  return `${leaderName} lead on ${leaderPts} pts in Group ${m.group}. ${trailerName} trail on ${trailerPts} and need a result.`;
}

export function getGroupSummary(
  rows: StandingRow[],
  teams: Map<string, Team>,
  group: string,
): string | null {
  if (rows.length < 4) return null;

  const name = (id: string) => teams.get(id)?.name ?? id;
  const [r1, r2, r3, r4] = rows;
  const n1 = name(r1.teamId), n2 = name(r2.teamId);
  const n3 = name(r3.teamId), n4 = name(r4.teamId);

  const totalPlayed = rows.reduce((s, r) => s + r.mp, 0) / 2;
  if (totalPlayed === 0) return null;

  // max pts each team can still reach
  const maxPts = (r: StandingRow) => r.pts + 3 * (3 - r.mp);

  const thirdElim  = maxPts(r3) < r2.pts;
  const fourthElim = maxPts(r4) < r2.pts;

  // All 6 games done
  if (totalPlayed >= 6) {
    if (r1.pts === r2.pts)
      return `${n1} and ${n2} advance on equal points. ${n3} and ${n4} are out.`;
    return `${n1} and ${n2} advance. ${n3} and ${n4} are eliminated.`;
  }

  // Both spots mathematically clinched
  if (thirdElim && fourthElim) {
    if (totalPlayed === 4)
      return `${n1} and ${n2} have qualified. Matchday 3 is a dead rubber for ${n3} and ${n4}.`;
    return `${n1} and ${n2} are through. ${n3} and ${n4} cannot advance.`;
  }

  // Bottom two eliminated (but not top two locked yet — shouldn't happen, but just in case)
  if (thirdElim) {
    return `${n3} cannot advance. ${n4} still has a slim chance of reaching the top two.`;
  }

  // After matchday 2 (4 played, 2 remain)
  if (totalPlayed === 4) {
    if (r1.pts >= 6 && r2.pts >= 3) {
      const gap = r2.pts - r3.pts;
      if (gap >= 3)
        return `${n1} lead the group. ${n2} hold 2nd; ${n3} and ${n4} need wins and a favour on matchday 3.`;
      return `${n1} lead, but 2nd place is unsettled going into matchday 3.`;
    }
    if (r2.pts - r3.pts <= 1)
      return `It's tight in Group ${group}. The final round could still shuffle the top two.`;
    if (r3.pts === 0)
      return `${n1} and ${n2} are in control. ${n3} and ${n4} are winless and running out of time.`;
    return `${n1} and ${n2} lead, but ${n3} and ${n4} are still alive heading into matchday 3.`;
  }

  // After matchday 1 (2 played, 4 remain)
  if (totalPlayed === 2) {
    if (r1.pts === 3 && r2.pts === 3)
      return `Both openers were wins. ${n1} and ${n2} lead, but four games remain.`;
    if (r1.pts === 3 && r2.pts === 1 && r3.pts === 1)
      return `${n1} lead early. ${n2} and ${n3} drew. ${n4} are bottom after defeat.`;
    if (r1.pts === 1 && r4.pts === 1)
      return `Both opening games were draws. All four teams level on 1 pt. Matchday 2 will separate them.`;
    if (r1.pts === 3 && r4.pts === 0)
      return `Early leaders ${n1} and ${n2} after matchday 1. Four games still to play.`;
    return `Early days in Group ${group}. All four teams still in contention.`;
  }

  // Partial matchday 3 (5 played)
  if (totalPlayed === 5) {
    return `One game left in Group ${group}. ${n1} and ${n2} currently in the advancing positions.`;
  }

  return null;
}
