const colorMap = {
    greedy: { accent: "text-blue-300", bg: "bg-blue-500/10", border: "border-blue-500/20", dot: "bg-blue-400" },
    dijkstra: { accent: "text-purple-300", bg: "bg-purple-500/10", border: "border-purple-500/20", dot: "bg-purple-400" },
    dp: { accent: "text-amber-300", bg: "bg-amber-500/10", border: "border-amber-500/20", dot: "bg-amber-400" },
};
const algoLabel = { greedy: "Greedy", dijkstra: "Dijkstra", dp: "DP TSP" };

export default function Itinerary({ result, algo }) {
    if (!result || result.length === 0) return null;

    if (result[0]?.error) {
        return (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 text-red-300 text-sm">
                {result[0].msg}
            </div>
        );
    }

    const c = colorMap[algo] || colorMap.greedy;
    const totalDays = result.length;
    const totalVisits = result.reduce((s, d) => s + d.visits.length, 0);
    const totalTravel = result.reduce((s, d) => s + d.totalTravel, 0);

    return (
        <div className={`border rounded-2xl overflow-hidden ${c.border}`}>
            <div className={`${c.bg} px-5 py-4 flex flex-wrap gap-4 items-center justify-between`}>
                <div>
                    <span className={`text-xs font-mono font-bold uppercase tracking-wider ${c.accent}`}>
                        {algoLabel[algo]}
                    </span>
                    <h3 className="text-base font-semibold mt-0.5">Route Plan</h3>
                </div>
                <div className="flex gap-4 text-sm">
                    <Stat label="Days" value={totalDays} />
                    <Stat label="Visits" value={totalVisits} />
                    <Stat label="Travel" value={totalTravel + " min"} />
                </div>
            </div>

            <div className="divide-y divide-white/5">
                {result.map(day => (
                    <div key={day.dayNumber} className="px-5 py-4 space-y-3">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${c.dot}`} />
                            <span className="text-sm font-semibold">Day {day.dayNumber}</span>
                            <span className="text-xs text-white/30 ml-auto">
                                8:00 AM → {day.returnTime} · {day.totalTravel} min travel
                            </span>
                        </div>
                        <div className="space-y-1 pl-4">
                            {day.visits.map((v, i) => (
                                <div key={i} className="flex items-center gap-3 text-sm">
                                    <span className="text-white/25 font-mono text-xs w-4">{i + 1}</span>
                                    <span className="flex-1 font-medium">{v.name}</span>
                                    <span className="text-white/35 font-mono text-xs">({v.x}, {v.y})</span>
                                    <span className="text-white/35 text-xs">{v.arrive} – {v.depart}</span>
                                    <span className="text-white/25 text-xs">{v.travelMin}m</span>
                                </div>
                            ))}
                            <div className="flex items-center gap-3 text-sm text-white/30 pt-1">
                                <span className="text-xs w-4">🏠</span>
                                <span className="flex-1">Return Home</span>
                                <span className="text-xs">{day.returnTime}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function Stat({ label, value }) {
    return (
        <div className="text-center">
            <div className="font-bold">{value}</div>
            <div className="text-xs text-white/35">{label}</div>
        </div>
    );
}