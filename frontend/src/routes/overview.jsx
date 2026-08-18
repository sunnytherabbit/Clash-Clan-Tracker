import { useRiverRace } from "../hooks/useRiverRace";
import { PlayerLink } from "../components/PlayerLink";
import { formatNumber } from "../lib/format";
import styles from "../styles/overview.module.css";

const sortByTrophies = (a, b) => (b.trophies || 0) - (a.trophies || 0);
const sortByDonations = (a, b) => (b.donations || 0) - (a.donations || 0);

const Empty = () => (
    <div className={styles.empty}>
        <p>No clan data available. Open the Settings tab to check the API key, then hit Refresh.</p>
    </div>
);

const Loading = () => (
    <div className={styles.empty}>
        <p>Loading clan data...</p>
    </div>
);

export default function Overview() {
    const { clanInfo, clanMembers, loading, error } = useRiverRace();

    if (loading && !clanInfo && !clanMembers) return <Loading />;
    if (error) return <div className={styles.error}>{error}</div>;
    if (!clanInfo) return <Empty />;

    const members = (clanMembers || []).slice();
    const stats = [
        { label: "Members", value: clanInfo.memberCount },
        { label: "Clan Score", value: clanInfo.clanScore },
        { label: "Clan War Trophies", value: clanInfo.clanWarTrophies },
        { label: "Donations / Week", value: clanInfo.donationsPerWeek },
        { label: "Required Trophies", value: clanInfo.requiredTrophies },
    ];

    const topTrophies = members.slice().sort(sortByTrophies).slice(0, 5);
    const topDonations = members.slice().sort(sortByDonations).slice(0, 5);

    return (
        <div className={styles.container}>
            <div className={styles.hero}>
                <div className={styles.heroInfo}>
                    <span className={styles.state}>{clanInfo.type || "Clan"}</span>
                    <h2 className={styles.clanName}>{clanInfo.name}</h2>
                    <p className={styles.tag}>{clanInfo.tag}</p>
                    {clanInfo.description && (
                        <p className={styles.description}>{clanInfo.description}</p>
                    )}
                    <div className={styles.meta}>
                        <span>Location: {clanInfo.location?.name || "—"}</span>
                        <span>Members: {clanInfo.memberCount}</span>
                        <span>Required Trophies: {formatNumber(clanInfo.requiredTrophies)}</span>
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
                    <h3 className={styles.columnTitle}>Top by Trophies</h3>
                    <div className={styles.card}>
                        {topTrophies.length === 0 ? (
                            <p className={styles.empty}>No members yet.</p>
                        ) : (
                            <ul className={styles.list}>
                                {topTrophies.map((m, i) => (
                                    <li key={m.tag} className={styles.listItem}>
                                        <span className={styles.rank}>#{i + 1}</span>
                                        <div className={styles.listInfo}>
                                            <span className={styles.listName}>
                                                <PlayerLink tag={m.tag} name={m.name} />
                                            </span>
                                            <span className={styles.listTag}>{m.tag}</span>
                                        </div>
                                        <span className={styles.listScore}>
                                            {formatNumber(m.trophies)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                <div className={styles.column}>
                    <h3 className={styles.columnTitle}>Top by Donations</h3>
                    <div className={styles.card}>
                        {topDonations.length === 0 ? (
                            <p className={styles.empty}>No members yet.</p>
                        ) : (
                            <ul className={styles.list}>
                                {topDonations.map((m, i) => (
                                    <li key={m.tag} className={styles.listItem}>
                                        <span className={styles.rank}>#{i + 1}</span>
                                        <div className={styles.listInfo}>
                                            <span className={styles.listName}>
                                                <PlayerLink tag={m.tag} name={m.name} />
                                            </span>
                                            <span className={styles.listTag}>{m.tag}</span>
                                        </div>
                                        <span className={styles.listScore}>
                                            {formatNumber(m.donations)}
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
