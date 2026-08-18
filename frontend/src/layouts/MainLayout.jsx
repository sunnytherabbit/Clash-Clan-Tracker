import { NavLink, Outlet } from "react-router-dom";
import { useDarkMode } from "../hooks/useDarkMode";
import { useRiverRace } from "../hooks/useRiverRace";
import styles from "../styles/mainLayout.module.css";

const tabs = [
    { to: "/overview", label: "Overview" },
    { to: "/participants", label: "Participants" },
    { to: "/clans", label: "Clans" },
    { to: "/settings", label: "Settings" },
];

export default function MainLayout() {
    const { darkMode, toggleDarkMode } = useDarkMode();
    const { loading, refresh } = useRiverRace();

    return (
        <div className={styles.app}>
            <header className={styles.header}>
                <div className={styles.brand}>
                    <span className={styles.logo}>CR</span>
                    <h1 className={styles.title}>Clash Clan Tracker</h1>
                </div>

                <nav className={styles.tabs}>
                    {tabs.map((tab) => (
                        <NavLink
                            key={tab.to}
                            to={tab.to}
                            className={({ isActive }) =>
                                isActive ? `${styles.tab} ${styles.active}` : styles.tab
                            }
                        >
                            {tab.label}
                        </NavLink>
                    ))}
                </nav>

                <div className={styles.actions}>
                    <button
                        className={styles.refresh}
                        onClick={refresh}
                        disabled={loading}
                        aria-label="Refresh data"
                    >
                        {loading ? "Loading..." : "Refresh"}
                    </button>
                    <button className={styles.theme} onClick={toggleDarkMode}>
                        {darkMode ? "Light" : "Dark"}
                    </button>
                </div>
            </header>

            <main className={styles.main}>
                <Outlet />
            </main>
        </div>
    );
}
