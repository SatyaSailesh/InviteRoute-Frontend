import { distance } from "./distance";

const SPEED = 40;
const VISIT_MIN = 15;
const DAY_MIN = 840;
const MAX_N = 15;

function travelMin(d) { return (d / SPEED) * 60; }

function formatTime(minFrom8AM) {
    const total = Math.round(8 * 60 + minFrom8AM);
    const h = Math.floor(total / 60) % 24;
    const m = total % 60;
    const ampm = h >= 12 ? "PM" : "AM";
    const hd = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${hd}:${m < 10 ? "0" : ""}${m} ${ampm}`;
}

function parseTime(t) {
    const [hm, ap] = t.split(" ");
    let [h, m] = hm.split(":").map(Number);
    if (ap === "PM" && h !== 12) h += 12;
    if (ap === "AM" && h === 12) h = 0;
    return (h - 8) * 60 + m;
}

function solveTSP(distMatrix, subset) {
    const ln = subset.length + 1;
    const l2g = [0, ...subset];
    const ld = Array.from({ length: ln }, (_, i) =>
        Array.from({ length: ln }, (_, j) => distMatrix[l2g[i]][l2g[j]]));
    const states = 1 << ln;
    const dp = Array.from({ length: states }, () => new Array(ln).fill(Infinity));
    const par = Array.from({ length: states }, () => new Array(ln).fill(-1));

    dp[1][0] = 0;

    for (let mask = 1; mask < states; mask++) {
        for (let u = 0; u < ln; u++) {
            if (!(mask & (1 << u))) continue;
            if (dp[mask][u] === Infinity) continue;
            for (let v = 0; v < ln; v++) {
                if (mask & (1 << v)) continue;
                const nm = mask | (1 << v);
                const nc = dp[mask][u] + ld[u][v];
                if (nc < dp[nm][v]) { dp[nm][v] = nc; par[nm][v] = u; }
            }
        }
    }

    const full = states - 1;
    let best = Infinity, lastNode = 1;
    for (let u = 1; u < ln; u++) {
        if (dp[full][u] === Infinity) continue;
        const total = dp[full][u] + ld[u][0];
        if (total < best) { best = total; lastNode = u; }
    }

    const lpath = new Array(ln);
    let mask = full, cur = lastNode;
    for (let step = ln - 1; step >= 0; step--) {
        lpath[step] = cur;
        const prev = par[mask][cur];
        mask ^= (1 << cur);
        cur = prev;
    }

    return lpath.map(li => l2g[li]);
}

export default function dpTspRoute(points) {
    if (points.length === 0) return [];
    if (points.length > MAX_N) {
        return [{ error: true, msg: `DP TSP supports up to ${MAX_N} relatives. You have ${points.length}.` }];
    }

    const home = { name: "Home", x: 0, y: 0 };
    const allPoints = [home, ...points];
    const n = allPoints.length;
    const distMatrix = Array.from({ length: n }, (_, i) =>
        Array.from({ length: n }, (_, j) => distance(allPoints[i], allPoints[j])));

    const visited = new Set();
    const days = [];

    while (visited.size < points.length) {
        const unvis = allPoints
            .map((p, i) => i)
            .filter(i => i > 0 && !visited.has(allPoints[i]));
        const maxTry = Math.min(unvis.length, MAX_N);
        let bestPath = null;

        for (let cnt = 1; cnt <= maxTry; cnt++) {
            const sub = unvis.slice(0, cnt);
            const path = solveTSP(distMatrix, sub);

            let elapsed = 0;
            for (let pi = 1; pi < path.length; pi++) {
                elapsed += travelMin(distMatrix[path[pi - 1]][path[pi]]);
                elapsed += VISIT_MIN;
            }
            elapsed += travelMin(distMatrix[path[path.length - 1]][0]);

            if (elapsed <= DAY_MIN) bestPath = path;
            else break;
        }

        if (!bestPath) bestPath = [0, unvis[0]];

        const day = { dayNumber: days.length + 1, visits: [], totalTravel: 0 };
        let elapsed = 0;

        for (let pi = 1; pi < bestPath.length; pi++) {
            const from = bestPath[pi - 1];
            const to = bestPath[pi];
            const trav = travelMin(distMatrix[from][to]);
            elapsed += trav;
            const arrive = formatTime(elapsed);
            elapsed += VISIT_MIN;
            const depart = formatTime(elapsed);
            const p = allPoints[to];

            day.visits.push({ ...p, arrive, depart, travelMin: Math.round(trav) });
            day.totalTravel += Math.round(trav);
            visited.add(p);
        }

        const lastIdx = bestPath[bestPath.length - 1];
        const retMin = travelMin(distMatrix[lastIdx][0]);
        day.totalTravel += Math.round(retMin);
        const last = day.visits[day.visits.length - 1];
        day.returnTime = formatTime(parseTime(last.depart) + retMin);
        days.push(day);
    }

    return days;
}