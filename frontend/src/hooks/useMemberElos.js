import { useState, useEffect } from "react";
import { api_fetch } from "../lib/api";

export function useMemberElos(members) {
    const [elos, setElos] = useState({});
    const [error, setError] = useState("");

    useEffect(() => {
        if (!members?.length) return;

        let cancelled = false;

        api_fetch("/api/clan/members/elo")
            .then((data) => {
                if (cancelled) return;
                setElos(data || {});
            })
            .catch((err) => {
                if (cancelled) return;
                setError(err.message || "Failed to load ELO");
            });

        return () => {
            cancelled = true;
        };
    }, [members]);

    return { elos, error };
}
