import { useRiverRace } from "../hooks/useRiverRace";
import { usePlayerNavigate } from "../hooks/usePlayerNavigate";
import { BadgeImage } from "../components/GameImage";
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

    const members = Array.isArray(clanMembers) ? clanMembers.slice() : [];
    const memberCount =
        clanInfo.memberCount ?? clanInfo.memberList?.length ?? members.length;

    const stats = [
        { label: "Members", value: memberCount },
        { label: "Clan Score", value: clanInfo.clanScore },
        { label: "Clan War Trophies", value: clanInfo.clanWarTrophies, icon: "/clan-war-trophy.webp" },
        { label: "Donations / Week", value: clanInfo.donationsPerWeek, icon: "/donated.webp" },
        { label: "Required Trophies", value: clanInfo.requiredTrophies },
    ];

    const topTrophies = members.slice().sort(sortByTrophies);
    const topDonations = members.slice().sort(sortByDonations);

    return (
        <div className={styles.container}>
            <div className={styles.hero}>
                <div className={styles.heroInfo}>
                    <div className={styles.heroTop}>
                        <BadgeImage
                            id={clanInfo.badgeId}
                            size="5rem"
                            className={styles.clanBadge}
                        />
                        <div className={styles.heroTitles}>
                            <span className={styles.state}>{clanInfo.type || "Clan"}</span>
                            <h2 className={styles.clanName}>{clanInfo.name}</h2>
                            <p className={styles.tag}>{clanInfo.tag}</p>
                        </div>
                    </div>
                    {clanInfo.description && (
                        <p className={styles.description}>{clanInfo.description}</p>
                    )}
                    <div className={styles.meta}>
                        <span>Location: {clanInfo.location?.name || "—"}</span>
                        <span>Members: {memberCount}</span>
                        <span>Required Trophies: {formatNumber(clanInfo.requiredTrophies)}</span>
                    </div>
                </div>
            </div>

            <div className={styles.stats}>
                {stats.map((s) => (
                    <div key={s.label} className={styles.statCard}>
                        <span className={styles.statValue}>
                            {formatNumber(s.value)}
                            {s.icon && (
                                <img src={s.icon} alt={s.label} className={styles.statIcon} />
                            )}
                        </span>
                        <span className={styles.statLabel}>{s.label}</span>
                    </div>
                ))}
            </div>

            <div className={styles.columns}>
                <div className={styles.column}>
                    <h3 className={styles.columnTitle}>Top by Trophies</h3>
                    <div className={`${styles.card} ${styles.scrollCard}`}>
                        {topTrophies.length === 0 ? (
                            <p className={styles.empty}>No members yet.</p>
                        ) : (
                            <ul className={styles.list}>
                                {topTrophies.map((m, i) => (
                                    <TopMemberItem key={m.tag} member={m} rank={i + 1} score={m.trophies} />
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                <div className={styles.column}>
                    <h3 className={styles.columnTitle}>Top by Donations</h3>
                    <div className={`${styles.card} ${styles.scrollCard}`}>
                        {topDonations.length === 0 ? (
                            <p className={styles.empty}>No members yet.</p>
                        ) : (
                            <ul className={styles.list}>
                                {topDonations.map((m, i) => (
                                    <TopMemberItem key={m.tag} member={m} rank={i + 1} score={m.donations} />
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function TopMemberItem({ member, rank, score }) {
    const goToPlayer = usePlayerNavigate(member.tag);

    return (
        <li onClick={goToPlayer} className={`${styles.listItem} ${styles.clickableItem}`}>
            <span className={styles.rank}>#{rank}</span>
            <div className={styles.listInfo}>
                <span className={styles.listName}>{member.name}</span>
                <span className={styles.listTag}>{member.tag}</span>
            </div>
            <span className={styles.listScore}>{formatNumber(score)}</span>
        </li>
    );
}
