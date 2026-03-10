export default function Navbar() {
    return (
        <div className="w-full border-b border-white/10 sticky top-0 z-10"
            style={{ background: "rgba(2,8,16,0.85)", backdropFilter: "blur(16px)" }}>
            <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-black font-black text-sm"
                        style={{ background: "linear-gradient(135deg, #10b981, #06b6d4)" }}>
                        IR
                    </div>
                    <div>
                        <h1 className="text-base font-bold tracking-tight leading-none">InviteRoute</h1>
                        <p className="text-xs text-white/30 leading-none mt-0.5">Route Optimiser</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-2 text-xs text-white/30 font-mono">
                        <span className="px-2 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400">Greedy</span>
                        <span className="px-2 py-1 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400">Dijkstra</span>
                        <span className="px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400">DP TSP</span>
                    </div>
                    <span className="text-xs px-2 py-1 rounded bg-white/5 border border-white/10 text-white/40">
                        DSA Capstone
                    </span>
                </div>
            </div>
        </div>
    );
}