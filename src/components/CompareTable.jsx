export default function CompareTable({ results }) {
    const { greedy, dijkstra, dp } = results;
    if (!greedy && !dijkstra && !dp) return null;

    const days = r => r && !r[0]?.error ? r.length : "—";
    const visit = r => r && !r[0]?.error ? r.reduce((s, d) => s + d.visits.length, 0) : "—";
    const trav = r => r && !r[0]?.error ? r.reduce((s, d) => s + d.totalTravel, 0) + " min" : "—";

    const gD = greedy && !greedy[0]?.error ? greedy.length : Infinity;
    const dD = dijkstra && !dijkstra[0]?.error ? dijkstra.length : Infinity;
    const pD = dp && !dp[0]?.error ? dp.length : Infinity;
    const best = Math.min(gD, dD, pD);

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <h3 className="font-semibold mb-4 text-sm text-white/70 uppercase tracking-wider">Comparison</h3>
            <table className="w-full text-sm">
                <thead>
                    <tr>
                        <th className="text-left pb-2 text-white/25 font-normal text-xs">Metric</th>
                        <th className="pb-2 text-blue-300   font-semibold text-xs">Greedy</th>
                        <th className="pb-2 text-purple-300 font-semibold text-xs">Dijkstra</th>
                        <th className="pb-2 text-amber-300  font-semibold text-xs">DP TSP</th>
                    </tr>
                </thead>
                <tbody>
                    <Row label="Days" g={days(greedy)} d={days(dijkstra)} p={days(dp)} gD={gD} dD={dD} pD={pD} best={best} isDay />
                    <Row label="Visits" g={visit(greedy)} d={visit(dijkstra)} p={visit(dp)} />
                    <Row label="Travel" g={trav(greedy)} d={trav(dijkstra)} p={trav(dp)} />
                    <tr className="border-t border-white/5">
                        <td className="py-2 text-white/40">Complexity</td>
                        <td className="py-2 text-center font-mono text-xs text-white/50">O(n²lgn)</td>
                        <td className="py-2 text-center font-mono text-xs text-white/50">O((V+E)lgV)</td>
                        <td className="py-2 text-center font-mono text-xs text-white/50">O(n²·2ⁿ)</td>
                    </tr>
                    <tr className="border-t border-white/5">
                        <td className="py-2 text-white/40">Optimal?</td>
                        <td className="py-2 text-center text-xs text-red-400">No</td>
                        <td className="py-2 text-center text-xs text-yellow-400">Paths only</td>
                        <td className="py-2 text-center text-xs text-emerald-400">Yes ✓</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}

function Row({ label, g, d, p, gD, dD, pD, best, isDay }) {
    return (
        <tr className="border-t border-white/5">
            <td className="py-2 pr-4 text-white/40">{label}</td>
            <td className={`py-2 text-center ${isDay && gD === best ? "text-blue-300 font-bold" : "text-white/60"}`}>
                {isDay && gD === best ? "🏆 " : ""}{g}
            </td>
            <td className={`py-2 text-center ${isDay && dD === best ? "text-purple-300 font-bold" : "text-white/60"}`}>
                {isDay && dD === best ? "🏆 " : ""}{d}
            </td>
            <td className={`py-2 text-center ${isDay && pD === best ? "text-amber-300 font-bold" : "text-white/60"}`}>
                {isDay && pD === best ? "🏆 " : ""}{p}
            </td>
        </tr>
    );
}