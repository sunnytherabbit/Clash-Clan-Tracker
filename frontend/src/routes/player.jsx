import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useRiverRace } from "../hooks/useRiverRace";
import { formatNumber, formatDate } from "../lib/format";
import styles from "../styles/player.module.css";

const tabs = [
    { key: "profile", label: "Profile" },
    { key: "chests", label: "Upcoming Chests" },
    { key: "battles", label: "Battle Log" },
];

export default function Player() {
    const rawTag = useParams().tag || "";
    const tag = decodeURIComponent(rawTag);
    const { fetchPlayer, fetchPlayerChests, fetchPlayerBattles } = useRiverRace();

    const [player, setPlayer] = useState(null);
    const [chests, setChests] = useState(null);
    const [battles, setBattles] = useState(null);
    const [activeTab, setActiveTab] = useState("profile");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;
        async function load() {
            setLoading(true);
            setError("");
            try {
                const [p, c, b] = await Promise.allSettled([
                    fetchPlayer(tag),
                    fetchPlayerChests(tag),
                    fetchPlayerBattles(tag),
                ]);

                if (cancelled) return;

                if (p.status === "fulfilled") setPlayer(p.value);
                if (c.status === "fulfilled") setChests(c.value?.items || c.value);
                if (b.status === "fulfilled") setBattles(b.value);

                const errors = [p, c, b]
                    .filter((r) => r.status === "rejected")
                    .map((r) => r.reason?.message || r.reason);
                if (errors.length > 0) {
                    setError([...new Set(errors)].join("; "));
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, [tag, fetchPlayer, fetchPlayerChests, fetchPlayerBattles]);

    if (loading) return <p className={styles.empty}>Loading player...</p>;
    if (error) return <div className={styles.error}>{error}</div>;
    if (!player) return <p className={styles.empty}>No player data.</p>;

    const stats = [
        { label: "Trophies", value: player.trophies },
        { label: "Best Trophies", value: player.bestTrophies },
        { label: "Wins", value: player.wins },
        { label: "Losses", value: player.losses },
        { label: "Battles", value: player.battleCount },
        { label: "3-Crown Wins", value: player.threeCrownWins },
        { label: "Total Donations", value: player.totalDonations },
        { label: "Challenge Cards", value: player.challengeCardsWon },
        { label: "Tournament Cards", value: player.tournamentCardsWon },
        { label: "Star Points", value: player.starPoints },
        { label: "Exp Level", value: player.expLevel },
    ];

    return (
        <div className={styles.container}>
            <div className={styles.hero}>
                <div className={styles.heroInfo}>
                    <h2 className={styles.playerName}>{player.name}</h2>
                    <p className={styles.tag}>{player.tag}</p>
                    <div className={styles.meta}>
                        <span>Arena: {player.arena?.name || "—"}</span>
                        {player.clan && (
                            <span>
                                Clan: {player.clan.name} ({player.role || "Member"})
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className={styles.tabs}>
                {tabs.map((t) => (
                    <button
                        key={t.key}
                        className={
                            activeTab === t.key
                                ? `${styles.tab} ${styles.active}`
                                : styles.tab
                        }
                        onClick={() => setActiveTab(t.key)}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {activeTab === "profile" && (
                <div className={styles.grid}>
                    {stats.map((s) => (
                        <div key={s.label} className={styles.statCard}>
                            <span className={styles.statValue}>{formatNumber(s.value)}</span>
                            <span className={styles.statLabel}>{s.label}</span>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === "chests" && (
                <div className={styles.card}>
                    {chests && chests.length > 0 ? (
                        <ul className={styles.list}>
                            {chests.map((chest, i) => (
                                <li key={i} className={styles.listItem}>
                                    <span className={styles.rank}>#{i + 1}</span>
                                    <span className={styles.listName}>{chest.name}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className={styles.empty}>No upcoming chests.</p>
                    )}
                </div>
            )}

            {activeTab === "battles" && (
                <div className={styles.card}>
                    {battles && battles.length > 0 ? (
                        <ul className={styles.list}>
                            {battles.map((battle, i) => {
                                const myTeam = battle.team?.[0] || {};
                                const opponent = battle.opponent?.[0] || {};
                                const won = (myTeam.crowns || 0) > (opponent.crowns || 0);
                                return (
                                    <li key={i} className={styles.battleItem}>
                                        <div className={styles.battleHeader}>
                                            <span
                                                className={
                                                    won ? styles.victory : styles.defeat
                                                }
                                            >
                                                {won ? "Victory" : "Defeat"}
                                            </span>
                                            <span className={styles.battleTime}>
                                                {formatDate(battle.battleTime)}
                                            </span>
                                            <span className={styles.battleMode}>
                                                {battle.gameMode?.name || "—"}
                                            </span>
                                        </div>
                                        <div className={styles.battleScore}>
                                            <span>{myTeam.name || player.name}</span>
                                            <span className={styles.crowns}>
                                                {myTeam.crowns ?? 0} - {opponent.crowns ?? 0}
                                            </span>
                                            <span>{opponent.name || "Opponent"}</span>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <p className={styles.empty}>No battles found.</p>
                    )}
                </div>
            )}
        </div>
    );
}
