import { useState, useEffect, useCallback } from "react";
import { RiverRaceContext } from "./RiverRaceContext";
import { api_fetch } from "../lib/api";

export function RiverRaceProvider({ children }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [lastUpdated, setLastUpdated] = useState(null);

    const refresh = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const response = await api_fetch("/api/riverrace");
            setData(response);
            setLastUpdated(new Date());
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        refresh();
    }, [refresh]);

    return (
        <RiverRaceContext.Provider value={{ data, loading, error, lastUpdated, refresh }}>
            {children}
        </RiverRaceContext.Provider>
    );
}
