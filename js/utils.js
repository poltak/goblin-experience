export const BUILD = '20260522-154257';

export function formatBuildStamp(build) {
    const text = String(build || '').trim();
    const m = text.match(/^(\d{4})(\d{2})(\d{2})-(\d{2})(\d{2})(\d{2})$/);
    if (!m) return text || 'unknown';
    const [, year, month, day, hour, minute, second] = m;
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

export function utcKey() {
    const d = new Date();
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')}`;
}

export function dateSeedUTC() {
    const key = utcKey();
    let h = 2166136261;
    for (let i=0;i<key.length;i++) h = Math.imul(h ^ key.charCodeAt(i), 16777619);
    return (h >>> 0);
}

export function pickByDay(items) {
    const s = dateSeedUTC();
    return items[s % items.length];
}

export function safeParse(json, fallback=null) {
    try { return JSON.parse(json); } catch (_) { return fallback; }
}

export function mulberry32(a) {
    return function() {
        let t = a += 0x6D2B79F5;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
}

export function fnv1a(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return (h >>> 0);
}

export function clamp(n, a, b) {
    return Math.max(a, Math.min(b, n));
}

export function formatAgo(ts) {
    if (!ts) return '';
    const s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
    if (s < 60) return `${s}s ago`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 48) return `${h}h ago`;
    const d = Math.floor(h / 24);
    return `${d}d ago`;
}

export function downloadText(filename, text) {
    const blob = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 500);
}
