import { useState } from "react";
import { useRiverRace } from "../hooks/useRiverRace";
import { PlayerLink } from "../components/PlayerLink";
import { formatNumber } from "../lib/format";
import styles from "../styles/participants.module.css";

const sortOptions = {
    fame: (a, b) => b.fame - a.fame || b.repairPoints - a.repairPoints,
    repair: (a, b) => b.repairPoints - a.repairPoints || b.fame - a.fame,
    decks: (a, b) => b.decksUsed - a.decksUsed,
    decksToday: (a, b) => b.decksUsedToday - a.decksUsedToday,
};

export default function Participants() {
    const { data, loading, error } = useRiverRace();
    const [sort, setSort] = useState("fame");
    const [filter, setFilter] = useState("");

    if (loading && !data) return <p className={styles.empty}>Loading participants...</p>;
    if (error) return <div className={styles.error}>{error}</div>;

    const participants = (data?.clan?.participants || [])
        .slice()
        .sort(sortOptions[sort] || sortOptions.fame)
        .filter(
            (p) =>
                p.name.toLowerCase().includes(filter.toLowerCase()) ||
                p.tag.toLowerCase().includes(filter.toLowerCase())
        );

    return (
        <div className={styles.container}>
            <div className={styles.toolbar}>
                <h2 className={styles.title}>Participants</h2>
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
                        <option value="fame">Sort by Fame</option>
                        <option value="repair">Sort by Repair</option>
                        <option value="decks">Sort by Decks Used</option>
                        <option value="decksToday">Sort by Decks Today</option>
                    </select>
                </div>
            </div>

            <div className={styles.card}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Name</th>
                            <th>Tag</th>
                            <th className={styles.num}>Fame</th>
                            <th className={styles.num}>Repair</th>
                            <th className={styles.num}>Boat Attacks</th>
                            <th className={styles.num}>Decks Used</th>
                            <th className={styles.num}>Decks Today</th>
                        </tr>
                    </thead>
                    <tbody>
                        {participants.map((p, i) => (
                            <tr key={p.tag}>
                                <td>{i + 1}</td>
                                <td className={styles.name}>
                                    <PlayerLink tag={p.tag} name={p.name} />
                                </td>
                                <td className={styles.tag}>{p.tag}</td>
                                <td className={styles.num}>{formatNumber(p.fame)}</td>
                                <td className={styles.num}>{formatNumber(p.repairPoints)}</td>
                                <td className={styles.num}>{formatNumber(p.boatAttacks)}</td>
                                <td className={styles.num}>{formatNumber(p.decksUsed)}</td>
                                <td className={styles.num}>{formatNumber(p.decksUsedToday)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {participants.length === 0 && (
                    <p className={styles.empty}>No participants match your search.</p>
                )}
            </div>
        </div>
    );
}
