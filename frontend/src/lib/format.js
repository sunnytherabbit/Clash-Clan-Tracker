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
