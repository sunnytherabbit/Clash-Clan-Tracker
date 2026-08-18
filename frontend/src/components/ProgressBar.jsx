import styles from "./ProgressBar.module.css";

export default function ProgressBar({ value, max, label }) {
    const pct = Math.min(100, Math.max(0, max > 0 ? (value / max) * 100 : 0));
    return (
        <div className={styles.container}>
            {label && <span className={styles.label}>{label}</span>}
            <div className={styles.bar}>
                <div className={styles.fill} style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
}
