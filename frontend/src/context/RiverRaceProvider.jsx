import { useState, useEffect, useCallback } from "react";
import { RiverRaceContext } from "./RiverRaceContext";
import { api_fetch } from "../lib/api";

export function RiverRaceProvider({ children }) {
    const [clanInfo, setClanInfo] = useState(null);
    const [clanMembers, setClanMembers] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [lastUpdated, setLastUpdated] = useState(null);

    const refresh = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const [clan, members] = await Promise.allSettled([
                api_fetch("/api/clan"),
                api_fetch("/api/clan/members"),
            ]);

            const errors = [];
            if (clan.status === "fulfilled") {
                setClanInfo(clan.value);
            } else {
                errors.push(clan.reason?.message || clan.reason);
            }

            if (members.status === "fulfilled") {
                setClanMembers(members.value?.items || members.value);
            } else {
                errors.push(members.reason?.message || members.reason);
            }

            if (errors.length > 0) {
                const unique = [...new Set(errors)];
                setError(unique.join("; "));
            } else {
                setLastUpdated(new Date());
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchPlayer = useCallback((tag) => {
        const decoded = decodeURIComponent(tag);
        return api_fetch(`/api/player/${encodeURIComponent(decoded)}`);
    }, []);

    const fetchPlayerBattles = useCallback((tag) => {
        const decoded = decodeURIComponent(tag);
        return api_fetch(`/api/player/${encodeURIComponent(decoded)}/battles`);
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        refresh();
    }, [refresh]);

    return (
        <RiverRaceContext.Provider
            value={{
                clanInfo,
                clanMembers,
                loading,
                error,
                lastUpdated,
                refresh,
                fetchPlayer,
                fetchPlayerBattles,
            }}
        >
            {children}
        </RiverRaceContext.Provider>
    );
}
