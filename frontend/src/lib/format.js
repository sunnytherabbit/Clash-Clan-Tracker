export function formatNumber(n) {
    if (n === undefined || n === null) return "—";
    return n.toLocaleString();
}

export function formatDate(iso) {
    if (!iso) return "—";
    try {
        return new Date(iso).toLocaleString();
    } catch {
        return iso;
    }
}
