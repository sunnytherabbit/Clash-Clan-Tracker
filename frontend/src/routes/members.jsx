import { useState } from "react";
import { useRiverRace } from "../hooks/useRiverRace";
import { usePlayerNavigate } from "../hooks/usePlayerNavigate";
import { formatNumber, formatDate } from "../lib/format";
import styles from "../styles/members.module.css";

const sortOptions = {
    trophies: (a, b) => (b.trophies || 0) - (a.trophies || 0),
    donations: (a, b) => (b.donations || 0) - (a.donations || 0),
    exp: (a, b) => (b.expLevel || 0) - (a.expLevel || 0),
    rank: (a, b) => (a.clanRank || 0) - (b.clanRank || 0),
};

export default function Members() {
    const { clanMembers, loading, error } = useRiverRace();
    const [sort, setSort] = useState("trophies");
    const [filter, setFilter] = useState("");

    if (loading && !clanMembers) return <p className={styles.empty}>Loading members...</p>;
    if (error) return <div className={styles.error}>{error}</div>;

    const members = (clanMembers || [])
        .slice()
        .sort(sortOptions[sort] || sortOptions.trophies)
        .filter(
            (m) =>
                m.name.toLowerCase().includes(filter.toLowerCase()) ||
                m.tag.toLowerCase().includes(filter.toLowerCase())
        );

    return (
        <div className={styles.container}>
            <div className={styles.toolbar}>
                <h2 className={styles.title}>Members</h2>
                <div className={styles.controls}>
                    <input
                        type="text"
                        className={styles.search}
                        placeholder="Search by name or tag..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />
                    <select
                        className={styles.select}
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                    >
                        <option value="trophies">Sort by Trophies</option>
                        <option value="donations">Sort by Donations</option>
                        <option value="exp">Sort by Exp Level</option>
                        <option value="rank">Sort by Clan Rank</option>
                    </select>
                </div>
            </div>

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
                            <MemberRow key={m.tag} member={m} />
                        ))}
                    </tbody>
                </table>
                {members.length === 0 && (
                    <p className={styles.empty}>No members match your search.</p>
                )}
            </div>
        </div>
    );
}

function MemberRow({ member }) {
    const goToPlayer = usePlayerNavigate(member.tag);

    return (
        <tr onClick={goToPlayer} className={styles.clickableRow}>
            <td>{member.clanRank}</td>
            <td className={styles.name}>{member.name}</td>
            <td className={styles.tag}>{member.tag}</td>
            <td>{member.role}</td>
            <td className={styles.num}>{formatNumber(member.expLevel)}</td>
            <td className={styles.num}>{formatNumber(member.trophies)}</td>
            <td className={styles.num}>{formatNumber(member.donations)}</td>
            <td className={styles.num}>{formatNumber(member.donationsReceived)}</td>
            <td className={styles.num}>{formatDate(member.lastSeen)}</td>
        </tr>
    );
}
