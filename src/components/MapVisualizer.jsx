import { useState, useEffect, useRef, useCallback } from "react";

const W = 600, H = 480, PADDING = 52;
const SPEED = 40, VISIT_MIN = 15, DAY_MIN = 840;
const MAX_N = 15;

function dist(a, b) { return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2); }
function travelMin(d) { return (d / SPEED) * 60; }
function formatTime(m) {
    const total = Math.round(8 * 60 + m), h = Math.floor(total / 60) % 24, mn = total % 60;
    const ap = h >= 12 ? "PM" : "AM", hd = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${hd}:${mn < 10 ? "0" : ""}${mn} ${ap}`;
}

// ── GREEDY ───────────────────────────────────────────────────
function buildGreedySteps(points) {
    const home = { name: "Home", x: 0, y: 0 };
    const visited = new Set(), steps = [];
    let dayNum = 1;
    while (visited.size < points.length) {
        let current = home, elapsed = 0;
        steps.push({ type: "day", day: dayNum });
        while (true) {
            let best = null, bestD = Infinity;
            for (const p of points) {
                if (visited.has(p)) continue;
                const toP = travelMin(dist(current, p)), toH = travelMin(dist(p, home));
                if (elapsed + toP + VISIT_MIN + toH <= DAY_MIN && dist(current, p) < bestD) {
                    bestD = dist(current, p); best = p;
                }
            }
            if (!best) break;
            elapsed += travelMin(dist(current, best)) + VISIT_MIN;
            steps.push({ type: "visit", from: current, to: best, arrive: formatTime(elapsed - VISIT_MIN), elapsed });
            visited.add(best); current = best;
        }
        const lv = [...steps].reverse().find(s => s.type === "visit");
        steps.push({ type: "return", from: lv ? lv.to : home, to: home, returnTime: formatTime(elapsed) });
        dayNum++;
    }
    return steps;
}

// ── DIJKSTRA ─────────────────────────────────────────────────
function buildDijkstraSteps(points) {
    const home = { name: "Home", x: 0, y: 0 };
    const all = [home, ...points], n = all.length;
    const sp = all.map((_, src) => {
        const d = new Array(n).fill(Infinity); d[src] = 0;
        const vis = new Array(n).fill(false);
        for (let iter = 0; iter < n; iter++) {
            let u = -1;
            for (let j = 0; j < n; j++) if (!vis[j] && (u === -1 || d[j] < d[u])) u = j;
            if (u === -1 || d[u] === Infinity) break;
            vis[u] = true;
            for (let v = 0; v < n; v++) { const nd = d[u] + dist(all[u], all[v]); if (nd < d[v]) d[v] = nd; }
        }
        return d;
    });
    const visited = new Set(), steps = [];
    let dayNum = 1;
    while (visited.size < points.length) {
        let curIdx = 0, elapsed = 0;
        steps.push({ type: "day", day: dayNum });
        while (true) {
            let best = -1, bestD = Infinity;
            for (let i = 1; i < n; i++) {
                const p = all[i]; if (visited.has(p)) continue;
                const toI = travelMin(sp[curIdx][i]), toH = travelMin(sp[i][0]);
                if (elapsed + toI + VISIT_MIN + toH <= DAY_MIN && sp[curIdx][i] < bestD) { bestD = sp[curIdx][i]; best = i; }
            }
            if (best === -1) break;
            elapsed += travelMin(sp[curIdx][best]) + VISIT_MIN;
            steps.push({ type: "visit", from: all[curIdx], to: all[best], arrive: formatTime(elapsed - VISIT_MIN), elapsed });
            visited.add(all[best]); curIdx = best;
        }
        const lv = [...steps].reverse().find(s => s.type === "visit");
        steps.push({ type: "return", from: lv ? lv.to : home, to: home, returnTime: formatTime(elapsed) });
        dayNum++;
    }
    return steps;
}

// ── DP TSP ───────────────────────────────────────────────────
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
            if (!(mask & (1 << u)) || dp[mask][u] === Infinity) continue;
            for (let v = 0; v < ln; v++) {
                if (mask & (1 << v)) continue;
                const nm = mask | (1 << v), nc = dp[mask][u] + ld[u][v];
                if (nc < dp[nm][v]) { dp[nm][v] = nc; par[nm][v] = u; }
            }
        }
    }
    const full = states - 1;
    let best = Infinity, lastNode = 1;
    for (let u = 1; u < ln; u++) {
        if (dp[full][u] === Infinity) continue;
        const t = dp[full][u] + ld[u][0];
        if (t < best) { best = t; lastNode = u; }
    }
    const lpath = new Array(ln);
    let mask = full, cur = lastNode;
    for (let step = ln - 1; step >= 0; step--) {
        lpath[step] = cur;
        const prev = par[mask][cur];
        mask ^= (1 << cur); cur = prev;
    }
    return lpath.map(li => l2g[li]);
}

function buildDpSteps(points) {
    if (points.length > MAX_N) return [{ type: "error", msg: `DP TSP supports max ${MAX_N} relatives.` }];
    const home = { name: "Home", x: 0, y: 0 };
    const all = [home, ...points], n = all.length;
    const distMatrix = Array.from({ length: n }, (_, i) =>
        Array.from({ length: n }, (_, j) => dist(all[i], all[j])));
    const visited = new Set(), steps = [];
    let dayNum = 1;
    while (visited.size < points.length) {
        const unvis = all.map((_, i) => i).filter(i => i > 0 && !visited.has(all[i]));
        let bestPath = null;
        for (let cnt = 1; cnt <= Math.min(unvis.length, MAX_N); cnt++) {
            const sub = unvis.slice(0, cnt);
            const path = solveTSP(distMatrix, sub);
            let elapsed = 0;
            for (let pi = 1; pi < path.length; pi++) { elapsed += travelMin(distMatrix[path[pi - 1]][path[pi]]) + VISIT_MIN; }
            elapsed += travelMin(distMatrix[path[path.length - 1]][0]);
            if (elapsed <= DAY_MIN) bestPath = path; else break;
        }
        if (!bestPath) bestPath = [0, unvis[0]];
        steps.push({ type: "day", day: dayNum });
        let elapsed = 0;
        for (let pi = 1; pi < bestPath.length; pi++) {
            const from = bestPath[pi - 1], to = bestPath[pi];
            elapsed += travelMin(distMatrix[from][to]) + VISIT_MIN;
            steps.push({ type: "visit", from: all[from], to: all[to], arrive: formatTime(elapsed - VISIT_MIN), elapsed });
            visited.add(all[to]);
        }
        const lv = [...steps].reverse().find(s => s.type === "visit");
        steps.push({ type: "return", from: lv ? lv.to : home, to: home, returnTime: formatTime(elapsed) });
        dayNum++;
    }
    return steps;
}

// ── constants ─────────────────────────────────────────────────
const DAY_PALETTE = ["#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#f97316", "#ec4899", "#84cc16"];
const ALGO_COLORS = {
    greedy: { stroke: "#3b82f6", label: "Greedy", badge: "bg-blue-500/20 text-blue-300 border-blue-500/40" },
    dijkstra: { stroke: "#a855f7", label: "Dijkstra", badge: "bg-purple-500/20 text-purple-300 border-purple-500/40" },
    dp: { stroke: "#f59e0b", label: "DP TSP", badge: "bg-amber-500/20 text-amber-300 border-amber-500/40" },
};

function getBounds(points) {
    const xs = [...points.map(p => p.x), 0], ys = [...points.map(p => p.y), 0];
    const pad = Math.max(3, (Math.max(...xs) - Math.min(...xs)) * 0.15);
    return { minX: Math.min(...xs) - pad, maxX: Math.max(...xs) + pad, minY: Math.min(...ys) - pad, maxY: Math.max(...ys) + pad };
}
function toCanvas(x, y, bounds) {
    const { minX, maxX, minY, maxY } = bounds;
    const rangeX = maxX - minX || 1, rangeY = maxY - minY || 1;
    return { cx: PADDING + ((x - minX) / rangeX) * (W - PADDING * 2), cy: PADDING + ((maxY - y) / rangeY) * (H - PADDING * 2) };
}

export default function MapVisualizer({ relatives }) {
    const canvasRef = useRef(null);
    const animRef = useRef(null);
    const [algo, setAlgo] = useState("greedy");
    const [playing, setPlaying] = useState(false);
    const [stepIdx, setStepIdx] = useState(0);
    const [steps, setSteps] = useState([]);
    const [log, setLog] = useState([]);
    const [currentDay, setCurrentDay] = useState(1);
    const [error, setError] = useState("");

    useEffect(() => {
        setPlaying(false); setStepIdx(0); setLog([]); setCurrentDay(1); setError("");
        if (!relatives || relatives.length === 0) { setSteps([]); return; }
        let s;
        if (algo === "greedy") s = buildGreedySteps(relatives);
        else if (algo === "dijkstra") s = buildDijkstraSteps(relatives);
        else s = buildDpSteps(relatives);
        if (s[0]?.type === "error") { setError(s[0].msg); setSteps([]); return; }
        setSteps(s);
    }, [relatives, algo]);

    const draw = useCallback((upToStep) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, W, H);

        if (!relatives || relatives.length === 0) {
            ctx.fillStyle = "rgba(255,255,255,0.1)"; ctx.font = "14px monospace"; ctx.textAlign = "center";
            ctx.fillText("Add relatives to see the visualization", W / 2, H / 2);
            return;
        }

        const bounds = getBounds(relatives);

        // grid
        ctx.strokeStyle = "rgba(255,255,255,0.04)"; ctx.lineWidth = 1;
        for (let gx = PADDING; gx <= W - PADDING; gx += 40) { ctx.beginPath(); ctx.moveTo(gx, PADDING); ctx.lineTo(gx, H - PADDING); ctx.stroke(); }
        for (let gy = PADDING; gy <= H - PADDING; gy += 40) { ctx.beginPath(); ctx.moveTo(PADDING, gy); ctx.lineTo(W - PADDING, gy); ctx.stroke(); }

        // edges
        let day = 1;
        for (let i = 0; i <= upToStep && i < steps.length; i++) {
            const s = steps[i];
            if (s.type === "day") { day = s.day; continue; }
            if (s.type === "visit" || s.type === "return") {
                const dayColor = DAY_PALETTE[(day - 1) % DAY_PALETTE.length];
                const { cx: x1, cy: y1 } = toCanvas(s.from.x, s.from.y, bounds);
                const { cx: x2, cy: y2 } = toCanvas(s.to.x, s.to.y, bounds);
                ctx.shadowColor = dayColor; ctx.shadowBlur = 14;
                ctx.strokeStyle = dayColor; ctx.lineWidth = 2.5;
                ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
                ctx.shadowBlur = 0;
                const angle = Math.atan2(y2 - y1, x2 - x1);
                ctx.fillStyle = dayColor;
                ctx.beginPath();
                ctx.moveTo(x2, y2);
                ctx.lineTo(x2 - 10 * Math.cos(angle - 0.4), y2 - 10 * Math.sin(angle - 0.4));
                ctx.lineTo(x2 - 10 * Math.cos(angle + 0.4), y2 - 10 * Math.sin(angle + 0.4));
                ctx.closePath(); ctx.fill();
            }
        }

        // nodes
        for (const p of relatives) {
            const { cx, cy } = toCanvas(p.x, p.y, bounds);
            const visited = steps.slice(0, upToStep + 1).some(s => s.type === "visit" && s.to === p);
            ctx.beginPath(); ctx.arc(cx, cy, 14, 0, Math.PI * 2);
            ctx.fillStyle = visited ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.05)"; ctx.fill();
            ctx.strokeStyle = visited ? "#10b981" : "rgba(255,255,255,0.2)"; ctx.lineWidth = 1.5; ctx.stroke();
            ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2);
            ctx.fillStyle = visited ? "#10b981" : "rgba(255,255,255,0.4)"; ctx.fill();
            const label = p.name.split(" ").slice(-1)[0];
            ctx.fillStyle = visited ? "#10b981" : "rgba(255,255,255,0.55)";
            ctx.font = "10px monospace"; ctx.textAlign = "center";
            ctx.fillText(label, cx, cy + 26);
        }

        // home
        const { cx: hx, cy: hy } = toCanvas(0, 0, bounds);
        ctx.beginPath(); ctx.arc(hx, hy, 16, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(245,158,11,0.2)"; ctx.fill();
        ctx.strokeStyle = "#f59e0b"; ctx.lineWidth = 2; ctx.stroke();
        ctx.font = "13px monospace"; ctx.textAlign = "center"; ctx.fillText("🏠", hx, hy + 5);
        ctx.fillStyle = "#f59e0b"; ctx.font = "10px monospace"; ctx.fillText("Home", hx, hy + 28);
    }, [steps, relatives]);

    useEffect(() => { draw(stepIdx); }, [stepIdx, draw]);

    useEffect(() => {
        if (!playing) { clearInterval(animRef.current); return; }
        animRef.current = setInterval(() => {
            setStepIdx(prev => {
                if (prev >= steps.length - 1) { setPlaying(false); return prev; }
                const next = prev + 1, s = steps[next];
                if (s.type === "day") setCurrentDay(s.day);
                if (s.type === "visit") setLog(l => [...l, `Day ${s.day} → ${s.to.name} at ${s.arrive}`]);
                if (s.type === "return") setLog(l => [...l, `Day ${s.day} → Return home at ${s.returnTime}`]);
                return next;
            });
        }, 700);
        return () => clearInterval(animRef.current);
    }, [playing, steps]);

    function handleStep() {
        if (stepIdx >= steps.length - 1) return;
        const next = stepIdx + 1, s = steps[next];
        if (s.type === "day") setCurrentDay(s.day);
        if (s.type === "visit") setLog(l => [...l, `Day ${s.day} → ${s.to.name} at ${s.arrive}`]);
        if (s.type === "return") setLog(l => [...l, `Day ${s.day} → Return home at ${s.returnTime}`]);
        setStepIdx(next);
    }

    function handleReset() { setStepIdx(0); setLog([]); setCurrentDay(1); setPlaying(false); }

    const progress = steps.length ? Math.round((stepIdx / (steps.length - 1)) * 100) : 0;
    const c = ALGO_COLORS[algo];
    const totalDays = steps.filter(s => s.type === "day").length;
    const totalVisits = steps.filter(s => s.type === "visit").length;

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            {/* header */}
            <div className="px-6 py-4 border-b border-white/10 flex flex-wrap gap-4 items-center justify-between">
                <div>
                    <h3 className="font-bold text-base">Algorithm Visualizer</h3>
                    <p className="text-xs text-white/40 mt-0.5">Watch the route being built step by step</p>
                </div>
                <div className="flex gap-2">
                    {Object.entries(ALGO_COLORS).map(([key, val]) => (
                        <button key={key} onClick={() => setAlgo(key)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${algo === key ? val.badge + " scale-105" : "bg-white/5 border-white/10 text-white/40 hover:text-white/70"
                                }`}>
                            {val.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* error banner for DP TSP > 15 */}
            {error && (
                <div className="mx-4 mt-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
                    ⚠️ {error}
                </div>
            )}

            <div className="flex flex-col lg:flex-row">
                {/* canvas */}
                <div className="relative flex-1 p-4">
                    <canvas ref={canvasRef} width={W} height={H}
                        className="w-full rounded-xl border border-white/5"
                        style={{ background: "radial-gradient(ellipse at 30% 30%, #0d1b2a 0%, #030712 100%)" }}
                    />
                    {relatives && relatives.length > 0 && !error && (
                        <>
                            <div className="absolute top-6 left-6 px-3 py-1 rounded-full text-xs font-mono font-bold border"
                                style={{
                                    background: DAY_PALETTE[(currentDay - 1) % DAY_PALETTE.length] + "22",
                                    borderColor: DAY_PALETTE[(currentDay - 1) % DAY_PALETTE.length] + "66",
                                    color: DAY_PALETTE[(currentDay - 1) % DAY_PALETTE.length]
                                }}>
                                Day {currentDay}
                            </div>
                            <div className="absolute top-6 right-6 flex flex-col gap-1">
                                {Array.from({ length: Math.min(totalDays, 5) }, (_, i) => (
                                    <div key={i} className="flex items-center gap-1.5 text-xs" style={{ color: DAY_PALETTE[i] }}>
                                        <div className="w-4 h-0.5 rounded" style={{ background: DAY_PALETTE[i] }} />Day {i + 1}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* controls */}
                <div className="w-full lg:w-64 border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col">
                    <div className="p-4 space-y-3 border-b border-white/10">
                        <div>
                            <div className="flex justify-between text-xs text-white/40 mb-1">
                                <span>Progress</span><span>{progress}%</span>
                            </div>
                            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full rounded-full transition-all duration-300"
                                    style={{ width: progress + "%", background: c.stroke }} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => setPlaying(p => !p)}
                                disabled={!relatives || relatives.length === 0 || !!error}
                                className="py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-30"
                                style={{
                                    background: playing ? "#ef444420" : c.stroke + "33",
                                    border: `1px solid ${playing ? "#ef4444" : c.stroke}66`,
                                    color: playing ? "#ef4444" : c.stroke
                                }}>
                                {playing ? "⏸ Pause" : "▶ Play"}
                            </button>
                            <button onClick={handleStep}
                                disabled={!relatives || relatives.length === 0 || !!error || stepIdx >= steps.length - 1}
                                className="py-2 rounded-lg text-sm font-semibold bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 disabled:opacity-30 transition-all">
                                Step →
                            </button>
                        </div>
                        <button onClick={handleReset}
                            className="w-full py-2 rounded-lg text-xs text-white/40 border border-white/10 hover:bg-white/5 transition-all">
                            ↺ Reset
                        </button>
                        <div className="grid grid-cols-2 gap-2 pt-1">
                            <div className="bg-white/5 rounded-lg p-2 text-center">
                                <div className="text-lg font-bold" style={{ color: c.stroke }}>{totalDays || "—"}</div>
                                <div className="text-xs text-white/40">Days</div>
                            </div>
                            <div className="bg-white/5 rounded-lg p-2 text-center">
                                <div className="text-lg font-bold text-emerald-400">{totalVisits || "—"}</div>
                                <div className="text-xs text-white/40">Visits</div>
                            </div>
                        </div>
                    </div>

                    {/* log */}
                    <div className="flex-1 p-3 overflow-y-auto max-h-52 lg:max-h-none space-y-1">
                        <p className="text-xs text-white/30 font-mono mb-2">— activity log —</p>
                        {log.length === 0 && (
                            <p className="text-xs text-white/20 text-center pt-4">
                                {!relatives || relatives.length === 0 ? "Add relatives first" : "Press Play or Step to start"}
                            </p>
                        )}
                        {log.map((entry, i) => (
                            <div key={i} className="text-xs font-mono py-1 px-2 rounded bg-white/5"
                                style={{ color: entry.includes("Return") ? "#f59e0b" : c.stroke }}>
                                {entry}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}