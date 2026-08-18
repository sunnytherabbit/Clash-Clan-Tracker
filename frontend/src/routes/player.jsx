import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useRiverRace } from "../hooks/useRiverRace";
import { ArenaImage, BadgeImage, CardImage, PlayerBadgeImage } from "../components/GameImage";
import Deck from "../components/Deck";
import ProgressBar from "../components/ProgressBar";
import { formatNumber, formatDate } from "../lib/format";
import styles from "../styles/player.module.css";

const tabs = [
    { key: "profile", label: "Profile" },
    { key: "battles", label: "Battle Log" },
];

const allStats = (player) => [
    { label: "Exp Level", value: player.expLevel },
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
    { label: "War Day Wins", value: player.warDayWins },
    { label: "Clan Cards", value: player.clanCardsCollected },
    { label: "Exp Points", value: player.expPoints },
];

function Section({ title, children }) {
    return (
        <div className={styles.section}>
            <h3 className={styles.sectionTitle}>{title}</h3>
            {children}
        </div>
    );
}

function SeasonCard({ title, season }) {
    if (!season) return null;
    return (
        <div className={styles.seasonCard}>
            <h4 className={styles.seasonTitle}>{title}</h4>
            <div className={styles.seasonStats}>
                <span>Trophies: {formatNumber(season.trophies)}</span>
                {season.bestTrophies !== undefined && (
                    <span>Best: {formatNumber(season.bestTrophies)}</span>
                )}
                {season.rank !== undefined && season.rank !== null && (
                    <span>Rank: #{formatNumber(season.rank)}</span>
                )}
                {season.leagueNumber !== undefined && (
                    <span>League: {season.leagueNumber}</span>
                )}
                {season.arena && <span>{season.arena.name}</span>}
            </div>
        </div>
    );
}

export default function Player() {
    const rawTag = useParams().tag || "";
    const tag = decodeURIComponent(rawTag);
    const { fetchPlayer, fetchPlayerBattles } = useRiverRace();

    const [player, setPlayer] = useState(null);
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
                const [p, b] = await Promise.allSettled([
                    fetchPlayer(tag),
                    fetchPlayerBattles(tag),
                ]);

                if (cancelled) return;

                if (p.status === "fulfilled") setPlayer(p.value);
                if (b.status === "fulfilled") setBattles(b.value);

                const errors = [p, b]
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
    }, [tag, fetchPlayer, fetchPlayerBattles]);

    if (loading) return <p className={styles.empty}>Loading player...</p>;
    if (error) return <div className={styles.error}>{error}</div>;
    if (!player) return <p className={styles.empty}>No player data.</p>;

    const stats = allStats(player);

    return (
        <div className={styles.container}>
            <div className={styles.hero}>
                <div className={styles.heroInfo}>
                    <div className={styles.heroTop}>
                        <ArenaImage
                            id={player.arena?.id}
                            name={player.arena?.name}
                            size="5.5rem"
                        />
                        <div className={styles.heroTitles}>
                            <h2 className={styles.playerName}>{player.name}</h2>
                            <p className={styles.tag}>{player.tag}</p>
                            {player.arena && (
                                <p className={styles.arenaName}>{player.arena.name}</p>
                            )}
                        </div>
                        <div className={styles.trophyBox}>
                            <span className={styles.trophyValue}>
                                {formatNumber(player.trophies)}
                            </span>
                            <span className={styles.trophyLabel}>Trophies</span>
                        </div>
                    </div>

                    <div className={styles.meta}>
                        {player.clan && (
                            <span className={styles.clanMeta}>
                                <BadgeImage
                                    id={player.clan.badgeId}
                                    size="1.5rem"
                                    className={styles.clanBadge}
                                />
                                {player.clan.name} · {player.role || "Member"}
                            </span>
                        )}
                        <span>Level {player.expLevel}</span>
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
                <>
                    <Section title="Stats">
                        <div className={styles.grid}>
                            {stats.map((s) => (
                                <div key={s.label} className={styles.statCard}>
                                    <span className={styles.statValue}>
                                        {formatNumber(s.value)}
                                    </span>
                                    <span className={styles.statLabel}>{s.label}</span>
                                </div>
                            ))}
                        </div>
                    </Section>

                    {player.currentDeck && player.currentDeck.length > 0 && (
                        <Section title="Current Deck">
                            <div className={styles.card}>
                                <Deck cards={player.currentDeck} size="4rem" />
                            </div>
                        </Section>
                    )}

                    {player.currentFavouriteCard && (
                        <Section title="Favourite Card">
                            <div className={styles.favCard}>
                                <CardImage
                                    card={player.currentFavouriteCard}
                                    size="5rem"
                                />
                                <div>
                                    <p className={styles.favName}>
                                        {player.currentFavouriteCard.name}
                                    </p>
                                    <p className={styles.favLevel}>
                                        Level {player.currentFavouriteCard.level}
                                    </p>
                                </div>
                            </div>
                        </Section>
                    )}

                    {(player.currentPathOfLegendSeasonResult ||
                        player.lastPathOfLegendSeasonResult ||
                        player.bestPathOfLegendSeasonResult) && (
                        <Section title="Path of Legend">
                            <div className={styles.seasons}>
                                <SeasonCard
                                    title="Current"
                                    season={player.currentPathOfLegendSeasonResult}
                                />
                                <SeasonCard
                                    title="Last"
                                    season={player.lastPathOfLegendSeasonResult}
                                />
                                <SeasonCard
                                    title="Best"
                                    season={player.bestPathOfLegendSeasonResult}
                                />
                            </div>
                        </Section>
                    )}

                    {player.badges && player.badges.length > 0 && (
                        <Section title="Badges">
                            <div className={`${styles.card} ${styles.scrollCard}`}>
                                <ul className={styles.badgeList}>
                                    {player.badges.map((badge, i) => (
                                        <li key={i} className={styles.badgeItem}>
                                            <PlayerBadgeImage badge={badge} size="3.5rem" />
                                            <div className={styles.badgeInfo}>
                                                <span className={styles.badgeName}>{badge.name}</span>
                                                <span className={styles.badgeLevel}>
                                                    Lv {badge.level}/{badge.maxLevel}
                                                </span>
                                                <ProgressBar
                                                    value={badge.progress}
                                                    max={badge.target}
                                                    label={`${formatNumber(
                                                        badge.progress
                                                    )} / ${formatNumber(badge.target)}`}
                                                />
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </Section>
                    )}

                    {player.achievements && player.achievements.length > 0 && (
                        <Section title="Achievements">
                            <div className={`${styles.card} ${styles.scrollCard}`}>
                                <ul className={styles.badgeList}>
                                    {player.achievements.map((a, i) => (
                                        <li key={i} className={styles.badgeItem}>
                                            <span className={styles.badgeName}>{a.name}</span>
                                            <span className={styles.badgeLevel}>
                                                {a.stars} ★
                                            </span>
                                            <ProgressBar
                                                value={a.value}
                                                max={a.target}
                                                label={`${formatNumber(a.value)} / ${formatNumber(
                                                    a.target
                                                )}`}
                                            />
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </Section>
                    )}
                </>
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
                                            {battle.arena && (
                                                <span>{battle.arena.name}</span>
                                            )}
                                        </div>
                                        <div className={styles.battleTeams}>
                                            <div className={styles.battleTeam}>
                                                <span className={styles.battlePlayer}>
                                                    {myTeam.name || player.name}
                                                </span>
                                                <Deck cards={myTeam.cards} size="2.5rem" />
                                            </div>
                                            <div className={styles.battleVersus}>
                                                <span className={styles.crowns}>
                                                    {myTeam.crowns ?? 0} -{" "}
                                                    {opponent.crowns ?? 0}
                                                </span>
                                            </div>
                                            <div className={styles.battleTeam}>
                                                <span className={styles.battlePlayer}>
                                                    {opponent.name || "Opponent"}
                                                </span>
                                                <Deck cards={opponent.cards} size="2.5rem" />
                                            </div>
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
