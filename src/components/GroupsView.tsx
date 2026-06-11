import { useState } from 'react';
import type { Group, StandingRow } from '../data';
import { GROUPS, teamMap } from '../data';
import styles from './GroupsView.module.css';

interface Props {
  standings: Map<Group, StandingRow[]>;
}

export default function GroupsView({ standings }: Props) {
  const [activeGroup, setActiveGroup] = useState<Group>('A');
  const rows = standings.get(activeGroup) ?? [];

  return (
    <div className={styles.root}>
      <div className={styles.groupNav}>
        {GROUPS.map(g => (
          <button
            key={g}
            className={`${styles.groupBtn} ${activeGroup === g ? styles.groupBtnActive : ''}`}
            onClick={() => setActiveGroup(g)}
          >
            {g}
          </button>
        ))}
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.thPos}>#</th>
              <th className={styles.thTeam}>Team</th>
              <th>MP</th>
              <th>W</th>
              <th>D</th>
              <th>L</th>
              <th>GF</th>
              <th>GA</th>
              <th className={styles.thGd}>GD</th>
              <th className={styles.thPts}>Pts</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => {
              const team = teamMap.get(row.teamId);
              if (!team) return null;
              const qualify = idx < 2;
              return (
                <tr key={row.teamId} className={`${styles.row} ${qualify ? styles.qualifyRow : ''}`}>
                  <td className={styles.pos}>
                    {qualify && <span className={styles.qualifyDot} />}
                    {idx + 1}
                  </td>
                  <td className={styles.tdTeam}>
                    <span className={styles.flag}>{team.flag}</span>
                    <span className={styles.name}>{team.name}</span>
                    <span className={styles.conf}>{team.confederation}</span>
                  </td>
                  <td>{row.mp}</td>
                  <td className={row.w > 0 ? styles.statGreen : ''}>{row.w}</td>
                  <td>{row.d}</td>
                  <td className={row.l > 0 ? styles.statRed : ''}>{row.l}</td>
                  <td>{row.gf}</td>
                  <td>{row.ga}</td>
                  <td className={`${styles.gd} ${row.gd > 0 ? styles.gdPos : row.gd < 0 ? styles.gdNeg : ''}`}>
                    {row.gd > 0 ? `+${row.gd}` : row.gd}
                  </td>
                  <td className={styles.pts}>{row.pts}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className={styles.legend}>
        <span className={styles.legendDot} />
        <span className={styles.legendText}>Top 2 advance to Round of 32</span>
      </div>
    </div>
  );
}
