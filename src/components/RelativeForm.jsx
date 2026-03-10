import { useState } from "react";

const SAMPLE = [
    { name: "Grandma Rose", x: 5, y: 3 },
    { name: "Uncle Bob", x: -8, y: 7 },
    { name: "Aunt Mary", x: 12, y: -4 },
    { name: "Cousin Jake", x: -3, y: -9 },
    { name: "Sister Lily", x: 15, y: 6 },
    { name: "Brother Tom", x: -11, y: 2 },
    { name: "Nana Eliza", x: 7, y: -15 },
    { name: "Uncle Frank", x: -6, y: 13 },
];

export default function RelativeForm({ relatives, setRelatives }) {
    const [name, setName] = useState("");
    const [x, setX] = useState("");
    const [y, setY] = useState("");
    const [err, setErr] = useState("");

    function add() {
        if (!name.trim()) { setErr("Name is required."); return; }
        if (x === "" || y === "") { setErr("X and Y are required."); return; }
        if (isNaN(parseFloat(x)) || isNaN(parseFloat(y))) {
            setErr("X and Y must be numbers."); return;
        }
        setErr("");
        setRelatives([...relatives, { name: name.trim(), x: parseFloat(x), y: parseFloat(y) }]);
        setName(""); setX(""); setY("");
    }

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
                <h2 className="font-semibold text-white/90">Relatives</h2>
                <button
                    onClick={() => setRelatives(SAMPLE)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors"
                >
                    Load Sample (8)
                </button>
            </div>

            <div className="flex gap-3">
                <input placeholder="Name" value={name} onChange={e => setName(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && add()}
                    className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm placeholder-white/25 focus:outline-none focus:border-white/30" />
                <input placeholder="X" value={x} onChange={e => setX(e.target.value)}
                    className="w-20 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm placeholder-white/25 focus:outline-none focus:border-white/30" />
                <input placeholder="Y" value={y} onChange={e => setY(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && add()}
                    className="w-20 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm placeholder-white/25 focus:outline-none focus:border-white/30" />
                <button onClick={add}
                    className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm transition-colors">
                    Add
                </button>
            </div>

            {err && <p className="text-red-400 text-xs">{err}</p>}

            {relatives.length > 0 ? (
                <div className="space-y-1 max-h-48 overflow-y-auto">
                    {relatives.map((r, i) => (
                        <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 text-sm">
                            <span className="font-medium">{r.name}</span>
                            <span className="text-white/40 font-mono text-xs">({r.x}, {r.y})</span>
                            <button onClick={() => setRelatives(relatives.filter((_, idx) => idx !== i))}
                                className="text-white/25 hover:text-red-400 transition-colors ml-3 text-xs">✕</button>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-white/25 text-sm text-center py-3">No relatives added yet.</p>
            )}
        </div>
    );
}