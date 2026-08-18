import { useRiverRace } from "../hooks/useRiverRace";
import { formatNumber } from "../lib/format";
import styles from "../styles/overview.module.css";

const sortByFame = (a, b) => b.fame - a.fame || b.repairPoints - a.repairPoints;
const sortByScore = (a, b) => b.clanScore - a.clanScore;

const Empty = () => (
    <div className={styles.empty}>
        <p>No data available. Open the Settings tab to check the API key, then hit Refresh.</p>
    </div>
);

const Loading = () => (
    <div className={styles.empty}>
        <p>Loading river race data...</p>
    </div>
);

export default function Overview() {
    const { data, loading, error } = useRiverRace();

    if (loading && !data) return <Loading />;
    if (error) return <div className={styles.error}>{error}</div>;
    if (!data) return <Empty />;

    const clan = data.clan;
    const participants = (clan?.participants || []).slice().sort(sortByFame);
    const clans = (data.clans || []).slice().sort(sortByScore);
    const ownRank = clans.findIndex((c) => c.tag === clan?.tag) + 1;

    const stats = [
        { label: "Clan Score", value: clan?.clanScore },
        { label: "Fame", value: clan?.fame },
        { label: "Repair Points", value: clan?.repairPoints },
        { label: "Period Points", value: clan?.periodPoints },
        { label: "Participants", value: participants?.length },
    ];

    const topParticipants = participants.slice(0, 5);
    const topClans = clans.slice(0, 5);

    return (
        <div className={styles.container}>
            <div className={styles.hero}>
                <div className={styles.heroInfo}>
                    <span className={styles.state}>{data.state}</span>
                    <h2 className={styles.clanName}>{clan?.name}</h2>
                    <p className={styles.tag}>{clan?.tag}</p>
                    <div className={styles.meta}>
                        <span>Period {data.periodIndex}</span>
                        <span>Section {data.sectionIndex}</span>
                        <span>{data.periodType}</span>
                        {ownRank > 0 && <span>Rank #{ownRank}</span>}
                    </div>
                </div>
            </div>

            <div className={styles.stats}>
                {stats.map((s) => (
                    <div key={s.label} className={styles.statCard}>
                        <span className={styles.statValue}>{formatNumber(s.value)}</span>
                        <span className={styles.statLabel}>{s.label}</span>
                    </div>
                ))}
            </div>

            <div className={styles.columns}>
                <div className={styles.column}>
                    <h3 className={styles.columnTitle}>Top Participants</h3>
                    <div className={styles.card}>
                        {topParticipants.length === 0 ? (
                            <p className={styles.empty}>No participants yet.</p>
                        ) : (
                            <ul className={styles.list}>
                                {topParticipants.map((p, i) => (
                                    <li key={p.tag} className={styles.listItem}>
                                        <span className={styles.rank}>#{i + 1}</span>
                                        <div className={styles.listInfo}>
                                            <span className={styles.listName}>{p.name}</span>
                                            <span className={styles.listTag}>{p.tag}</span>
                                        </div>
                                        <span className={styles.listScore}>{formatNumber(p.fame)}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                <div className={styles.column}>
                    <h3 className={styles.columnTitle}>Race Leaderboard</h3>
                    <div className={styles.card}>
                        {topClans.length === 0 ? (
                            <p className={styles.empty}>No clans yet.</p>
                        ) : (
                            <ul className={styles.list}>
                                {topClans.map((c, i) => (
                                    <li
                                        key={c.tag}
                                        className={`${styles.listItem} ${
                                            c.tag === clan?.tag ? styles.ownClan : ""
                                        }`}
                                    >
                                        <span className={styles.rank}>#{i + 1}</span>
                                        <div className={styles.listInfo}>
                                            <span className={styles.listName}>{c.name}</span>
                                            <span className={styles.listTag}>{c.tag}</span>
                                        </div>
                                        <span className={styles.listScore}>
                                            {formatNumber(c.clanScore)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
