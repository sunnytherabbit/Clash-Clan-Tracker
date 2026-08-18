import { useRiverRace } from "../hooks/useRiverRace";
import { PlayerLink } from "../components/PlayerLink";
import { formatNumber, formatDate } from "../lib/format";
import styles from "../styles/clan.module.css";

export default function Clan() {
    const { clanInfo, clanMembers, loading, error } = useRiverRace();

    if (loading && !clanInfo && !clanMembers) {
        return <p className={styles.empty}>Loading clan...</p>;
    }
    if (error) return <div className={styles.error}>{error}</div>;

    const members = Array.isArray(clanMembers) ? clanMembers : [];

    return (
        <div className={styles.container}>
            {clanInfo && (
                <div className={styles.hero}>
                    <div className={styles.heroInfo}>
                        <span className={styles.type}>{clanInfo.type || "Clan"}</span>
                        <h2 className={styles.clanName}>{clanInfo.name}</h2>
                        <p className={styles.tag}>{clanInfo.tag}</p>
                        {clanInfo.description && (
                            <p className={styles.description}>{clanInfo.description}</p>
                        )}
                        <div className={styles.meta}>
                            <span>Location: {clanInfo.location?.name || "—"}</span>
                            <span>Members: {clanInfo.memberCount}</span>
                            <span>Required Trophies: {formatNumber(clanInfo.requiredTrophies)}</span>
                            <span>Clan Score: {formatNumber(clanInfo.clanScore)}</span>
                            <span>Donations / week: {formatNumber(clanInfo.donationsPerWeek)}</span>
                        </div>
                    </div>
                </div>
            )}

            <h3 className={styles.sectionTitle}>Members</h3>
            <div className={styles.card}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Name</th>
                            <th>Tag</th>
                            <th>Role</th>
                            <th className={styles.num}>Exp</th>
                            <th className={styles.num}>Trophies</th>
                            <th className={styles.num}>Donations</th>
                            <th className={styles.num}>Received</th>
                            <th className={styles.num}>Last Seen</th>
                        </tr>
                    </thead>
                    <tbody>
                        {members.map((m) => (
                            <tr key={m.tag}>
                                <td>{m.clanRank}</td>
                                <td className={styles.name}>
                                    <PlayerLink tag={m.tag} name={m.name} />
                                </td>
                                <td className={styles.tag}>{m.tag}</td>
                                <td>{m.role}</td>
                                <td className={styles.num}>{formatNumber(m.expLevel)}</td>
                                <td className={styles.num}>{formatNumber(m.trophies)}</td>
                                <td className={styles.num}>{formatNumber(m.donations)}</td>
                                <td className={styles.num}>{formatNumber(m.donationsReceived)}</td>
                                <td className={styles.num}>{formatDate(m.lastSeen)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {members.length === 0 && <p className={styles.empty}>No members found.</p>}
            </div>
        </div>
    );
}
