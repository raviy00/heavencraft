export default function DonatePage() {
    return (
        <div className="w-full max-w-5xl mx-auto rounded-xl p-8 shadow-2xl backdrop-blur-3xl bg-black/40 border border-white/10 text-center" style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <h2 className="text-4xl font-display font-bold mb-4 text-yellow-400">Server Store</h2>
            <p className="text-slate-300 mb-10 max-w-2xl mx-auto">
                Support Heavencraft by purchasing a rank! All proceeds go directly to server hosting and development.
                Rank perks are compliant with Minecraft EULA.
            </p>

            <div className="grid md:grid-cols-3 gap-6">
                {['VIP', 'MVP', 'HEAVENLY'].map((rank, i) => (
                    <div key={rank} className="p-6 rounded-xl bg-gradient-to-b from-white/10 to-transparent border border-white/20 flex flex-col items-center">
                        <h3 className={`text-2xl font-bold font-display uppercase italic mb-2 ${i === 0 ? 'text-green-400' : i === 1 ? 'text-blue-400' : 'text-purple-400'
                            }`}>{rank} Rank</h3>
                        <span className="text-3xl font-bold text-white mb-6">${(i + 1) * 10}.00 <span className="text-sm text-slate-400">/mo</span></span>

                        <ul className="text-sm text-slate-300 space-y-2 mb-8 flex-1 text-left">
                            <li className="flex items-center gap-2"><span className="material-symbols-outlined text-xs text-primary">check</span> Colored Chat Tag</li>
                            <li className="flex items-center gap-2"><span className="material-symbols-outlined text-xs text-primary">check</span> {(i + 1) * 2} Set Homes</li>
                            <li className="flex items-center gap-2"><span className="material-symbols-outlined text-xs text-primary">check</span> Priority Queue</li>
                            {i > 0 && <li className="flex items-center gap-2"><span className="material-symbols-outlined text-xs text-primary">check</span> Glow Effect</li>}
                            {i > 1 && <li className="flex items-center gap-2"><span className="material-symbols-outlined text-xs text-primary">check</span> Custom Pet</li>}
                        </ul>

                        <button type="button" className="w-full py-2 rounded font-bold text-slate-900 uppercase" style={{ background: i === 2 ? '#c084fc' : i === 1 ? '#60a5fa' : '#4ade80' }}>
                            Add to Cart
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}
