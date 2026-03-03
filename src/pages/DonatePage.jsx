export default function DonatePage() {
    return (
        <div className="w-full max-w-5xl mx-auto rounded-xl p-8 shadow-2xl backdrop-blur-3xl bg-black/40 border border-white/10 text-center" style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <h2 className="text-4xl font-display font-bold mb-4 text-yellow-400">Server Store</h2>
            <p className="text-slate-300 mb-10 max-w-2xl mx-auto">
                Support Heavencraft by purchasing a rank! All proceeds go directly to server hosting and development.
                Rank perks are compliant with Minecraft EULA.
            </p>

            <div className="flex flex-col items-center justify-center min-h-[300px] border border-white/20 rounded-xl bg-white/5 backdrop-blur-sm shadow-inner">
                <span className="material-symbols-outlined text-6xl text-slate-500 mb-4 animate-bounce">
                    inventory_2
                </span>
                <h3 className="text-2xl font-bold font-display uppercase tracking-widest text-slate-300">
                    Coming Soon
                </h3>
                <p className="text-slate-400 mt-2 max-w-sm text-center">
                    We are currently setting up our global store. Check back later for rank updates!
                </p>
            </div>
        </div>
    )
}
