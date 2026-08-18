import { useState } from "react";
import { useRiverRace } from "../hooks/useRiverRace";
import { api_fetch } from "../lib/api";
import styles from "../styles/settings.module.css";

const OFFICIAL_BASE = "https://api.clashroyale.com/v1";
const PROXY_BASE = "https://proxy.royaleapi.dev/v1";

export default function Settings() {
    const { refresh } = useRiverRace();
    const [token, setToken] = useState("");
    const [clanTag, setClanTag] = useState("");
    const [baseUrl, setBaseUrl] = useState(OFFICIAL_BASE);
    const [useProxy, setUseProxy] = useState(false);
    const [status, setStatus] = useState(null);
    const [saving, setSaving] = useState(false);

    const toggleProxy = (e) => {
        const checked = e.target.checked;
        setUseProxy(checked);
        setBaseUrl(checked ? PROXY_BASE : OFFICIAL_BASE);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setStatus(null);
        try {
            await api_fetch("/api/config", {
                method: "POST",
                body: JSON.stringify({
                    token: token || undefined,
                    clan_tag: clanTag ? `#${clanTag.replace(/^#/, "")}` : undefined,
                    base_url: baseUrl,
                }),
            });
            setStatus({ type: "success", message: "Saved. Refreshing data..." });
            setToken("");
            await refresh();
        } catch (err) {
            setStatus({ type: "error", message: err.message });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Settings</h2>

            <div className={styles.grid}>
                <form className={styles.card} onSubmit={handleSubmit}>
                    <h3 className={styles.cardTitle}>API Key</h3>
                    <p className={styles.description}>
                        Enter your Clash Royale API bearer token. Leave blank to keep the
                        existing token.
                    </p>
                    <label className={styles.label} htmlFor="token">
                        Bearer token
                    </label>
                    <textarea
                        id="token"
                        className={styles.textarea}
                        rows={4}
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        placeholder="Paste your Bearer token here"
                    />

                    <h3 className={styles.cardTitle}>Clan</h3>
                    <p className={styles.description}>
                        Clan tag used for the river race lookup. Do not include the leading #.
                    </p>
                    <input
                        id="clanTag"
                        type="text"
                        className={styles.input}
                        value={clanTag}
                        onChange={(e) => setClanTag(e.target.value)}
                        placeholder="RY8LY"
                    />

                    <h3 className={styles.cardTitle}>API Endpoint</h3>
                    <p className={styles.description}>
                        Use the RoyaleAPI proxy if your server has a dynamic IP. For the
                        proxy, create a Clash Royale key whitelisting
                        <strong> 45.79.218.79</strong>.
                    </p>
                    <label className={styles.checkbox}>
                        <input
                            type="checkbox"
                            checked={useProxy}
                            onChange={toggleProxy}
                        />
                        Use RoyaleAPI proxy
                    </label>
                    <input
                        type="text"
                        className={styles.input}
                        value={baseUrl}
                        onChange={(e) => {
                            setUseProxy(e.target.value === PROXY_BASE);
                            setBaseUrl(e.target.value);
                        }}
                        placeholder="https://api.clashroyale.com/v1"
                    />

                    <div className={styles.actions}>
                        <button
                            type="submit"
                            className={styles.save}
                            disabled={saving}
                        >
                            {saving ? "Saving..." : "Save & Refresh"}
                        </button>
                    </div>

                    {status && (
                        <div
                            className={
                                status.type === "success" ? styles.success : styles.error
                            }
                        >
                            {status.message}
                        </div>
                    )}
                </form>

                <div className={styles.card}>
                    <h3 className={styles.cardTitle}>About</h3>
                    <p className={styles.description}>
                        This dashboard fetches the current river race for the configured
                        clan. The token is stored in the backend <code>flask-server/.env</code>{" "}
                        file and is not tracked by Git.
                    </p>
                    <p className={styles.description}>
                        If you see an access-denied error, the API key does not allow access
                        from the request IP address. You can use the RoyaleAPI proxy and
                        whitelist the proxy IP (45.79.218.79) instead.
                    </p>
                </div>
            </div>
        </div>
    );
}
