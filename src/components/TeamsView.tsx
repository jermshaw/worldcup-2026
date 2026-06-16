import { useState, useMemo, useEffect } from 'react';
import type { Match, Team, Group, StandingRow } from '../data';
import { GROUPS } from '../data';
import { getTeamColor } from '../teamColors';
import TeamSheet from './TeamSheet';
import searchIcon from '../assets/nav/Search.png';
import styles from './TeamsView.module.css';

interface Props {
  matches: Match[];
  teams: Map<string, Team>;
  standings: Map<Group, StandingRow[]>;
}

export default function TeamsView({ matches, teams, standings }: Props) {
  const [search, setSearch] = useState('');
  const [sortMode, setSortMode] = useState<'groups' | 'abc'>('groups');
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const teamStandings = useMemo(() => {
    const map = new Map<string, StandingRow>();
    for (const rows of standings.values()) {
      for (const row of rows) map.set(row.teamId, row);
    }
    return map;
  }, [standings]);

  const filteredTeams = useMemo(() => {
    const q = search.toLowerCase();
    return [...teams.values()].filter(t =>
      !q || t.name.toLowerCase().includes(q) || t.id.toLowerCase().includes(q) || `group ${t.group}`.toLowerCase().includes(q)
    );
  }, [teams, search]);

  const activeGroups = useMemo(
    () => GROUPS.filter(g => filteredTeams.some(t => t.group === g)),
    [filteredTeams]
  );

  function teamsByGroup(g: Group): Team[] {
    return filteredTeams
      .filter(t => t.group === g)
      .sort((a, b) => (teamStandings.get(b.id)?.pts ?? 0) - (teamStandings.get(a.id)?.pts ?? 0));
  }

  const sortedAlpha = useMemo(
    () => [...filteredTeams].sort((a, b) => a.name.localeCompare(b.name)),
    [filteredTeams]
  );

  const selectedTeam = selectedTeamId ? teams.get(selectedTeamId) : undefined;
  const selectedRow = selectedTeamId ? teamStandings.get(selectedTeamId) : undefined;
  const selectedPosition = useMemo(() => {
    if (!selectedTeam) return 1;
    const rows = standings.get(selectedTeam.group) ?? [];
    const idx = rows.findIndex(r => r.teamId === selectedTeamId);
    return idx >= 0 ? idx + 1 : 1;
  }, [selectedTeam, selectedTeamId, standings]);

  return (
    <div className={styles.root}>
      <div className={styles.stickyHeader}>
        <div className={styles.titleRow}>
          <h2 className={styles.title}>Teams</h2>
          <div className={styles.toggle}>
            <button
              className={`${styles.toggleBtn} ${sortMode === 'groups' ? styles.toggleBtnActive : ''}`}
              onClick={() => setSortMode('groups')}
            >Groups</button>
            <button
              className={`${styles.toggleBtn} ${sortMode === 'abc' ? styles.toggleBtnActive : ''}`}
              onClick={() => setSortMode('abc')}
            >ABC</button>
          </div>
        </div>

        <div className={styles.searchWrap}>
          <img src={searchIcon} className={styles.searchIcon} alt="" />
          <input
            className={styles.searchInput}
            placeholder="Search teams or groups"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.listContent}>
        {sortMode === 'groups' ? (
          activeGroups.map(g => (
            <div key={g} className={styles.group}>
              <div className={styles.groupHeader}>Group {g}</div>
              {teamsByGroup(g).map(team => (
                <TeamCard
                  key={team.id}
                  team={team}
                  row={teamStandings.get(team.id)}
                  onClick={() => setSelectedTeamId(team.id)}
                />
              ))}
            </div>
          ))
        ) : (
          <div className={styles.group}>
            {sortedAlpha.map(team => (
              <TeamCard
                key={team.id}
                team={team}
                row={teamStandings.get(team.id)}
                onClick={() => setSelectedTeamId(team.id)}
              />
            ))}
          </div>
        )}
      </div>

      {selectedTeam && (
        <TeamSheet
          team={selectedTeam}
          row={selectedRow}
          groupPosition={selectedPosition}
          matches={matches}
          teams={teams}
          onClose={() => setSelectedTeamId(null)}
        />
      )}
    </div>
  );
}

interface CardProps {
  team: Team;
  row: StandingRow | undefined;
  onClick: () => void;
}

function TeamCard({ team, row, onClick }: CardProps) {
  return (
    <button className={styles.card} style={{ background: getTeamColor(team.id) }} onClick={onClick}>
      <div className={styles.cardLeft}>
        {team.crest
          ? <img src={team.crest} className={styles.cardFlagImg} alt={team.name} />
          : <span className={styles.cardFlag}>{team.flag}</span>}
        <span className={styles.cardName}>{team.name}</span>
      </div>
      <div className={styles.cardStats}>
        <StatCol label="Pts" value={row?.pts ?? 0} />
        <div className={styles.statDivider} />
        <StatCol label="Wins" value={row?.w ?? 0} />
        <div className={styles.statDivider} />
        <StatCol label="Loss" value={row?.l ?? 0} dim={(row?.l ?? 0) === 0} />
        <div className={styles.statDivider} />
        <StatCol label="Draw" value={row?.d ?? 0} dim={(row?.d ?? 0) === 0} />
      </div>
    </button>
  );
}

function StatCol({ label, value, dim }: { label: string; value: number; dim?: boolean }) {
  return (
    <div className={styles.statCol}>
      <span className={`${styles.statNum} ${dim ? styles.statDim : ''}`}>{value}</span>
      <span className={`${styles.statLbl} ${dim ? styles.statDim : ''}`}>{label}</span>
    </div>
  );
}
