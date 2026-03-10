import { distance } from "./distance";

const SPEED = 40;
const VISIT_MIN = 15;
const DAY_MIN = 840;
const K = 4;

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

function buildAdjList(allPoints) {
    const n = allPoints.length;
    const adj = Array.from({ length: n }, () => []);

    for (let i = 0; i < n; i++) {
        const sorted = allPoints
            .map((p, j) => ({ j, d: distance(allPoints[i], p) }))
            .filter(e => e.j !== i)
            .sort((a, b) => a.d - b.d);

        const added = new Set([i]);
        if (i !== 0) {
            adj[i].push(0);
            adj[0].push(i);
            added.add(0);
        }
        let cnt = 0;
        for (const { j } of sorted) {
            if (cnt >= K) break;
            if (!added.has(j)) {
                adj[i].push(j);
                adj[j].push(i);
                added.add(j);
                cnt++;
            }
        }
    }
    return adj;
}

function dijkstraSingle(src, allPoints, adj) {
    const n = allPoints.length;
    const dist = new Array(n).fill(Infinity);
    const visited = new Array(n).fill(false);
    dist[src] = 0;

    for (let iter = 0; iter < n; iter++) {
        let u = -1;
        for (let i = 0; i < n; i++) {
            if (!visited[i] && (u === -1 || dist[i] < dist[u])) u = i;
        }
        if (u === -1 || dist[u] === Infinity) break;
        visited[u] = true;

        for (const v of adj[u]) {
            const nd = dist[u] + distance(allPoints[u], allPoints[v]);
            if (nd < dist[v]) dist[v] = nd;
        }
    }
    return dist;
}

export default function dijkstraRoute(points) {
    if (points.length === 0) return [];

    const home = { name: "Home", x: 0, y: 0 };
    const allPoints = [home, ...points];
    const n = allPoints.length;
    const adj = buildAdjList(allPoints);
    const sp = allPoints.map((_, src) => dijkstraSingle(src, allPoints, adj));

    const visited = new Set();
    const days = [];

    while (visited.size < points.length) {
        const day = { dayNumber: days.length + 1, visits: [], totalTravel: 0 };
        let curIdx = 0;
        let elapsed = 0;

        while (true) {
            let best = -1, bestDist = Infinity;

            for (let i = 1; i < n; i++) {
                const p = allPoints[i];
                if (visited.has(p)) continue;
                const toI = travelMin(sp[curIdx][i]);
                const toHome = travelMin(sp[i][0]);
                if (elapsed + toI + VISIT_MIN + toHome <= DAY_MIN && sp[curIdx][i] < bestDist) {
                    bestDist = sp[curIdx][i];
                    best = i;
                }
            }

            if (best === -1) break;

            const trav = travelMin(sp[curIdx][best]);
            elapsed += trav;
            const arrive = formatTime(elapsed);
            elapsed += VISIT_MIN;
            const depart = formatTime(elapsed);
            const p = allPoints[best];

            day.visits.push({ ...p, arrive, depart, travelMin: Math.round(trav) });
            day.totalTravel += Math.round(trav);
            visited.add(p);
            curIdx = best;
        }

        if (day.visits.length === 0) {
            const unvisited = points.filter(p => !visited.has(p));
            if (unvisited.length === 0) break;
            const cl = unvisited[0];
            const clIdx = allPoints.indexOf(cl);
            const trav = travelMin(sp[0][clIdx]);
            day.visits.push({
                ...cl,
                arrive: formatTime(trav),
                depart: formatTime(trav + VISIT_MIN),
                travelMin: Math.round(trav)
            });
            day.totalTravel += Math.round(trav);
            visited.add(cl);
            curIdx = clIdx;
        }

        const last = day.visits[day.visits.length - 1];
        const retMin = travelMin(sp[curIdx][0]);
        day.totalTravel += Math.round(retMin);
        day.returnTime = formatTime(parseTime(last.depart) + retMin);
        days.push(day);
    }

    return days;
}