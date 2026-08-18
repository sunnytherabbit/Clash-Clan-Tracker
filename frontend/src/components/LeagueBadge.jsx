import styles from "./LeagueBadge.module.css";

export function LeagueBadge({ leagueNumber, name, size = "2.5rem", showName = false }) {
    if (!leagueNumber) {
        return <span className={styles.placeholder}>-</span>;
    }

    const hue = ((leagueNumber - 1) * 35) % 360;
    const gradientId = `league-gradient-${leagueNumber}`;
    const colourStart = `hsl(${hue} 85% 60%)`;
    const colourEnd = `hsl(${hue} 85% 40%)`;

    return (
        <div
            className={styles.badge}
            style={{ width: size, height: size }}
            title={name || `League ${leagueNumber}`}
        >
            <svg viewBox="0 0 40 40" width="100%" height="100%" role="img" aria-label={name}>
                <defs>
                    <radialGradient
                        id={gradientId}
                        cx="50%"
                        cy="30%"
                        r="70%"
                        fx="50%"
                        fy="30%"
                    >
                        <stop offset="0%" stopColor={colourStart} />
                        <stop offset="100%" stopColor={colourEnd} />
                    </radialGradient>
                </defs>
                <circle cx="20" cy="20" r="18" fill={`url(#${gradientId})`} />
                <circle cx="20" cy="20" r="15" fill="none" stroke="#fff" strokeWidth="1.5" opacity="0.4" />
                <text
                    x="20"
                    y="25"
                    textAnchor="middle"
                    fill="#fff"
                    fontSize="15"
                    fontWeight="800"
                    fontFamily="system-ui, sans-serif"
                >
                    {leagueNumber}
                </text>
            </svg>
            {showName && name && <span className={styles.name}>{name}</span>}
        </div>
    );
}
