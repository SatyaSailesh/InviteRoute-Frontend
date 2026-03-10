import { useState } from "react";
import Navbar from "./components/Navbar";
import RelativeForm from "./components/RelativeForm";
import AlgoButtons from "./components/AlgoButtons";
import Itinerary from "./components/Itinerary";
import CompareTable from "./components/CompareTable";
import MapVisualizer from "./components/MapVisualizer";
import greedyRoute from "./algorithms/greedy";
import dijkstraRoute from "./algorithms/dijkstra";
import dpTspRoute from "./algorithms/dpTsp";

export default function App() {
  const [relatives, setRelatives] = useState([]);
  const [results, setResults] = useState({ greedy: null, dijkstra: null, dp: null });
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(false);

  function run(algo) {
    if (relatives.length === 0) return;
    setLoading(true);
    setActive(algo);
    setTimeout(() => {
      let result;
      if (algo === "greedy") result = greedyRoute(relatives);
      else if (algo === "dijkstra") result = dijkstraRoute(relatives);
      else if (algo === "dp") result = dpTspRoute(relatives);
      setResults(prev => ({ ...prev, [algo]: result }));
      setLoading(false);
    }, 50);
  }

  return (
    <div className="min-h-screen text-white"
      style={{ background: "radial-gradient(ellipse at top, #0a1628 0%, #020810 60%)" }}>
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-10 space-y-8">

        {/* ── Hero ── */}
        <div className="text-center space-y-3 py-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono
                          bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            DAA Capstone Project
          </div>
          <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white via-white/90 to-white/50 bg-clip-text text-transparent">
            Invitation Route Planner
          </h2>
          <p className="text-white/40 text-sm max-w-xl mx-auto leading-relaxed">
            Add relatives, run an algorithm, see the optimised multi-day delivery schedule.
            <br />
            <span className="text-white/25">Home (0,0) · 8 AM – 10 PM · 40 units/hr · 15 min/visit</span>
          </p>
        </div>

        {/* ── Stats bar (shows once relatives added) ── */}
        {relatives.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Relatives", value: relatives.length, color: "text-emerald-400" },
              { label: "Algorithms", value: "3", color: "text-blue-400" },
              { label: "Status", value: "Ready", color: "text-amber-400" },
            ].map(s => (
              <div key={s.label}
                className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-white/35 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* ── Form ── */}
        <RelativeForm relatives={relatives} setRelatives={setRelatives} />

        {/* ── Algo Buttons ── */}
        {relatives.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs text-white/30 font-mono px-1">— select algorithm to run —</p>
            <AlgoButtons active={active} onRun={run} loading={loading} />
          </div>
        ) : (
          <div className="text-center text-white/20 text-sm py-8 border border-dashed border-white/10 rounded-2xl">
            Add relatives above to enable the algorithms
          </div>
        )}

        {/* ── Visualizer ── */}
        {relatives.length > 0 && (
          <MapVisualizer relatives={relatives} />
        )}

        {/* ── Result ── */}
        {active && results[active] && (
          <div className="space-y-2">
            <p className="text-xs text-white/30 font-mono px-1">— route result —</p>
            <Itinerary result={results[active]} algo={active} />
          </div>
        )}

        {/* ── Compare ── */}
        {(results.greedy || results.dijkstra || results.dp) && (
          <CompareTable results={results} />
        )}

      </main>
    </div>
  );
}