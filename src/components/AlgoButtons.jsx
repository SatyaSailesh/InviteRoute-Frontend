const ALGOS = [
    { key: "greedy", label: "Greedy", complexity: "O(n² log n)", desc: "Nearest-neighbor heuristic. Fast but not optimal.", color: "blue" },
    { key: "dijkstra", label: "Dijkstra", complexity: "O((V+E) log V)", desc: "Shortest road-network paths + greedy scheduling.", color: "purple" },
    { key: "dp", label: "DP TSP", complexity: "O(n² · 2ⁿ)", desc: "Held-Karp exact optimal. Best result guaranteed.", color: "amber" },
];

const C = {
    blue: { btn: "bg-blue-500 hover:bg-blue-400", badge: "bg-blue-500/15 text-blue-300 border-blue-500/30", ring: "ring-blue-500/40" },
    purple: { btn: "bg-purple-500 hover:bg-purple-400", badge: "bg-purple-500/15 text-purple-300 border-purple-500/30", ring: "ring-purple-500/40" },
    amber: { btn: "bg-amber-500 hover:bg-amber-400", badge: "bg-amber-500/15 text-amber-300 border-amber-500/30", ring: "ring-amber-500/40" },
};

export default function AlgoButtons({ active, onRun, loading }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {ALGOS.map(a => {
                const c = C[a.color];
                return (
                    <button key={a.key} onClick={() => onRun(a.key)} disabled={loading}
                        className={
                            "flex flex-col gap-2 p-4 rounded-2xl border text-left transition-all " +
                            "bg-white/5 border-white/10 hover:bg-white/10 " +
                            (active === a.key ? `ring-2 ${c.ring} border-transparent ` : "") +
                            (loading ? "opacity-50 cursor-not-allowed " : "")
                        }>
                        <div className="flex items-center justify-between">
                            <span className="font-semibold text-sm">{a.label}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full border font-mono ${c.badge}`}>{a.complexity}</span>
                        </div>
                        <p className="text-xs text-white/40">{a.desc}</p>
                    </button>
                );
            })}
        </div>
    );
}