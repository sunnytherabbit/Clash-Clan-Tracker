import { useRiverRace } from "../hooks/useRiverRace";
import { formatNumber } from "../lib/format";
import styles from "../styles/clans.module.css";

export default function Clans() {
    const { data, loading, error } = useRiverRace();

    if (loading && !data) return <p className={styles.empty}>Loading clans...</p>;
    if (error) return <div className={styles.error}>{error}</div>;

    const clan = data?.clan;
    const clans = (data?.clans || [])
        .slice()
        .sort((a, b) => b.clanScore - a.clanScore);

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>River Race Leaderboard</h2>

            <div className={styles.card}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Clan</th>
                            <th>Tag</th>
                            <th className={styles.num}>Clan Score</th>
                            <th className={styles.num}>Fame</th>
                            <th className={styles.num}>Repair</th>
                            <th className={styles.num}>Participants</th>
                        </tr>
                    </thead>
                    <tbody>
                        {clans.map((c, i) => (
                            <tr
                                key={c.tag}
                                className={c.tag === clan?.tag ? styles.ownClan : ""}
                            >
                                <td>
                                    <span
                                        className={
                                            i === 0
                                                ? `${styles.rank} ${styles.gold}`
                                                : i === 1
                                                ? `${styles.rank} ${styles.silver}`
                                                : i === 2
                                                ? `${styles.rank} ${styles.bronze}`
                                                : styles.rank
                                        }
                                    >
                                        {i + 1}
                                    </span>
                                </td>
                                <td className={styles.name}>{c.name}</td>
                                <td className={styles.tag}>{c.tag}</td>
                                <td className={styles.num}>{formatNumber(c.clanScore)}</td>
                                <td className={styles.num}>{formatNumber(c.fame)}</td>
                                <td className={styles.num}>{formatNumber(c.repairPoints)}</td>
                                <td className={styles.num}>{c.participants?.length ?? 0}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {clans.length === 0 && <p className={styles.empty}>No clans found.</p>}
            </div>
        </div>
    );
}
