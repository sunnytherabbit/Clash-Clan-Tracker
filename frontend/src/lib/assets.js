import { useState, useEffect, useMemo } from "react";
import { api_fetch } from "./api";

const cache = {
    badges: null,
    arenas: null,
    cards: null,
};

const inFlight = {
    badges: null,
    arenas: null,
    cards: null,
};

async function loadAssetMap(type) {
    if (cache[type]) return cache[type];
    if (inFlight[type]) return inFlight[type];

    inFlight[type] = api_fetch(`/api/assets/${type}`)
        .then((data) => {
            cache[type] = data || {};
            return cache[type];
        })
        .finally(() => {
            inFlight[type] = null;
        });

    return inFlight[type];
}

export function useAssets() {
    const [state, setState] = useState({
        badges: {},
        arenas: {},
        cards: {},
        loading: true,
        error: "",
    });

    useEffect(() => {
        let cancelled = false;
        Promise.allSettled([
            loadAssetMap("badges"),
            loadAssetMap("arenas"),
            loadAssetMap("cards"),
        ]).then(([badgesRes, arenasRes, cardsRes]) => {
            if (cancelled) return;
            const errors = [badgesRes, arenasRes, cardsRes]
                .filter((r) => r.status === "rejected")
                .map((r) => r.reason?.message || r.reason);
            setState({
                badges: badgesRes.status === "fulfilled" ? badgesRes.value : {},
                arenas: arenasRes.status === "fulfilled" ? arenasRes.value : {},
                cards: cardsRes.status === "fulfilled" ? cardsRes.value : {},
                loading: false,
                error: errors.length ? errors.join("; ") : "",
            });
        });
        return () => {
            cancelled = true;
        };
    }, []);

    return state;
}

export function useAssetImage(type, id, assets) {
    return useMemo(() => {
        if (!id) return "";
        const map = assets?.[type] || {};
        return map[String(id)] || "";
    }, [type, id, assets]);
}
