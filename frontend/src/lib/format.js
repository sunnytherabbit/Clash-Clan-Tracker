export function formatNumber(n) {
    if (n === undefined || n === null) return "—";
    return n.toLocaleString();
}

function parseClashDate(str) {
    if (!str) return null;

    const compressed = str.match(
        /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})\.(\d{3})Z$/
    );
    if (compressed) {
        const [, year, month, day, hour, min, sec, ms] = compressed;
        return new Date(
            `${year}-${month}-${day}T${hour}:${min}:${sec}.${ms}Z`
        );
    }

    const d = new Date(str);
    return isNaN(d.getTime()) ? null : d;
}

export function formatDate(iso) {
    if (!iso) return "—";
    const d = parseClashDate(iso);
    if (!d) return iso;
    return d.toLocaleString();
}

export function formatTimeAgo(iso) {
    if (!iso) return { full: "—", ago: "—" };
    const d = parseClashDate(iso);
    if (!d) return { full: iso, ago: "—" };

    const now = new Date();
    const diffMs = Math.max(0, now.getTime() - d.getTime());
    const totalMinutes = Math.floor(diffMs / 60000);
    const totalHours = Math.floor(totalMinutes / 60);
    const days = Math.floor(totalHours / 24);
    const hours = totalHours % 24;
    const minutes = totalMinutes % 60;

    let ago;
    if (days > 0) {
        ago = `${days}d ${hours}h ago`;
    } else if (hours > 0) {
        ago = `${hours}h ${minutes}m ago`;
    } else {
        ago = `${minutes}m ago`;
    }

    return { full: d.toLocaleString(), ago };
}
