import { useState, useMemo } from "react";
import { useRiverRace } from "../hooks/useRiverRace";
import { useMemberElos } from "../hooks/useMemberElos";
import { usePlayerNavigate } from "../hooks/usePlayerNavigate";
import { LeagueBadge } from "../components/LeagueBadge";
import { formatNumber, formatTimeAgo } from "../lib/format";
import styles from "../styles/members.module.css";

const roleRanks = {
    leader: 1,
    coLeader: 2,
    elder: 3,
    member: 4,
};

const columns = [
    { key: "clanRank", label: "Rank", numeric: true, defaultDir: "asc" },
    { key: "name", label: "Name", text: true, defaultDir: "asc" },
    { key: "tag", label: "Tag", text: true, defaultDir: "asc" },
    { key: "roleRank", label: "Role", numeric: true, defaultDir: "asc" },
    { key: "expLevel", label: "Exp", numeric: true, defaultDir: "desc" },
    { key: "leagueName", label: "League", text: true, defaultDir: "asc" },
    { key: "elo", label: "ELO", numeric: true, defaultDir: "desc" },
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
    const { elos } = useMemberElos(clanMembers);
    const [sortConfig, setSortConfig] = useState({
        key: "clanRank",
        dir: "asc",
    });
    const [filter, setFilter] = useState("");

    const enrichedMembers = useMemo(() => {
        return (clanMembers || []).map((m) => {
            const e = elos[m.tag] || {};
            const hasElo = e.elo != null && e.elo > 0 && e.leagueNumber != null;
            const rawElo = e.elo ?? 0;
            const displayElo = hasElo ? rawElo : m.trophies;
            const sortElo = hasElo ? rawElo : -1;

            return {
                ...m,
                roleRank: roleRanks[m.role] ?? 99,
                elo: sortElo,
                displayElo,
                hasElo,
                leagueNumber: e.leagueNumber,
                leagueName: e.leagueName || "",
            };
        });
    }, [clanMembers, elos]);

    if (loading && !clanMembers) return <p className={styles.empty}>Loading members...</p>;
    if (error) return <div className={styles.error}>{error}</div>;

    const col = columns.find((c) => c.key === sortConfig.key) || columns[0];

    const members = enrichedMembers
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
                                        <span className={styles.arrow} aria-hidden="true">
                                            {sortConfig.key === c.key
                                                ? sortConfig.dir === "asc"
                                                    ? "▲"
                                                    : "▼"
                                                : ""}
                                        </span>
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
            <td className={styles.leagueCell}>
                {member.leagueNumber ? (
                    <span className={styles.league}>
                        <LeagueBadge
                            leagueNumber={member.leagueNumber}
                            name={member.leagueName}
                            size="1.75rem"
                        />
                        {member.leagueName && (
                            <span className={styles.leagueName}>{member.leagueName}</span>
                        )}
                    </span>
                ) : (
                    "—"
                )}
            </td>
            <td className={styles.num}>
                <span className={member.hasElo ? styles.elo : styles.trophies}>
                    {formatNumber(member.displayElo)}
                </span>
                {!member.hasElo && (
                    <img
                        src="/trophy.webp"
                        alt="Trophy Road"
                        className={styles.trophyIcon}
                        title="Trophy Road"
                    />
                )}
            </td>
            <td className={styles.num}>{formatNumber(member.donations)}</td>
            <td className={styles.num}>{formatNumber(member.donationsReceived)}</td>
            <td className={`${styles.num} ${styles.lastSeen}`}>
                <span className={styles.ago}>{lastSeen.ago}</span>
                <span className={styles.fullDate}>{lastSeen.full}</span>
            </td>
        </tr>
    );
}
