import { distance } from "./distance";

const SPEED = 40;
const VISIT_MIN = 15;
const DAY_MIN = 840;

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

export default function greedyRoute(points) {
    if (points.length === 0) return [];

    const home = { name: "Home", x: 0, y: 0 };
    const visited = new Set();
    const days = [];

    while (visited.size < points.length) {
        const day = { dayNumber: days.length + 1, visits: [], totalTravel: 0 };
        let current = home;
        let elapsed = 0;

        while (true) {
            let best = null, bestDist = Infinity;

            for (const p of points) {
                if (visited.has(p)) continue;
                const toP = travelMin(distance(current, p));
                const toHome = travelMin(distance(p, home));
                if (elapsed + toP + VISIT_MIN + toHome <= DAY_MIN) {
                    if (distance(current, p) < bestDist) {
                        bestDist = distance(current, p);
                        best = p;
                    }
                }
            }

            if (!best) break;

            const trav = travelMin(distance(current, best));
            elapsed += trav;
            const arrive = formatTime(elapsed);
            elapsed += VISIT_MIN;
            const depart = formatTime(elapsed);

            day.visits.push({ ...best, arrive, depart, travelMin: Math.round(trav) });
            day.totalTravel += Math.round(trav);
            visited.add(best);
            current = best;
        }

        if (day.visits.length === 0) {
            const unvisited = points.filter(p => !visited.has(p));
            if (unvisited.length === 0) break;
            const cl = unvisited.reduce((a, b) =>
                distance(home, a) <= distance(home, b) ? a : b);
            const trav = travelMin(distance(home, cl));
            day.visits.push({
                ...cl,
                arrive: formatTime(trav),
                depart: formatTime(trav + VISIT_MIN),
                travelMin: Math.round(trav)
            });
            day.totalTravel += Math.round(trav);
            visited.add(cl);
            current = cl;
        }

        const last = day.visits[day.visits.length - 1];
        const retMin = travelMin(distance(current, home));
        day.totalTravel += Math.round(retMin);
        day.returnTime = formatTime(parseTime(last.depart) + retMin);
        days.push(day);
    }

    return days;
}