import { useState } from "react";
import { useRiverRace } from "../hooks/useRiverRace";
import { usePlayerNavigate } from "../hooks/usePlayerNavigate";
import { formatNumber, formatTimeAgo } from "../lib/format";
import styles from "../styles/members.module.css";

const columns = [
    { key: "clanRank", label: "Rank", defaultDir: "asc" },
    { key: "name", label: "Name", text: true, defaultDir: "asc" },
    { key: "tag", label: "Tag", text: true, defaultDir: "asc" },
    { key: "role", label: "Role", text: true, defaultDir: "asc" },
    { key: "expLevel", label: "Exp", numeric: true, defaultDir: "desc" },
    { key: "trophies", label: "Trophies", numeric: true, defaultDir: "desc" },
    { key: "donations", label: "Donations", numeric: true, defaultDir: "desc" },
    { key: "donationsReceived", label: "Received", numeric: true, defaultDir: "desc" },
    { key: "lastSeen", label: "Last Seen", date: true, defaultDir: "desc" },
];

function compare(a, b, col) {
    if (col.numeric) {
        const na = Number(a[col.key]) || 0;
        const nb = Number(b[col.key]) || 0;
        return na - nb;
    }
    const sa = a[col.key] || "";
    const sb = b[col.key] || "";
    return String(sa).localeCompare(String(sb));
}

export default function Members() {
    const { clanMembers, loading, error } = useRiverRace();
    const [sortConfig, setSortConfig] = useState({
        key: "clanRank",
        dir: "asc",
    });
    const [filter, setFilter] = useState("");

    if (loading && !clanMembers) return <p className={styles.empty}>Loading members...</p>;
    if (error) return <div className={styles.error}>{error}</div>;

    const col = columns.find((c) => c.key === sortConfig.key) || columns[0];

    const members = (clanMembers || [])
        .slice()
        .sort((a, b) => {
            const c = compare(a, b, col);
            return sortConfig.dir === "asc" ? c : -c;
        })
        .filter(
            (m) =>
                m.name.toLowerCase().includes(filter.toLowerCase()) ||
                m.tag.toLowerCase().includes(filter.toLowerCase())
        );

    function handleSort(key) {
        setSortConfig((current) => {
            if (current.key === key) {
                return { key, dir: current.dir === "asc" ? "desc" : "asc" };
            }
            const nextCol = columns.find((c) => c.key === key);
            return { key, dir: nextCol?.defaultDir || "asc" };
        });
    }

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
                </div>
            </div>

            <div className={styles.card}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            {columns.map((c) => (
                                <th
                                    key={c.key}
                                    onClick={() => handleSort(c.key)}
                                    className={
                                        c.numeric || c.date
                                            ? `${styles.header} ${styles.num}`
                                            : styles.header
                                    }
                                >
                                    <span className={styles.headerContent}>
                                        {c.label}
                                        {sortConfig.key === c.key && (
                                            <span className={styles.arrow}>
                                                {sortConfig.dir === "asc" ? " ▲" : " ▼"}
                                            </span>
                                        )}
                                    </span>
                                </th>
                            ))}
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
    const lastSeen = formatTimeAgo(member.lastSeen);

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
            <td className={`${styles.num} ${styles.lastSeen}`}>
                <span className={styles.ago}>{lastSeen.ago}</span>
                <span className={styles.fullDate}>{lastSeen.full}</span>
            </td>
        </tr>
    );
}
