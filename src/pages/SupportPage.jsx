export default function SupportPage() {
    return (
        <div className="w-full max-w-4xl mx-auto rounded-xl p-8 shadow-2xl backdrop-blur-3xl bg-black/40 border border-white/10" style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <h2 className="text-3xl font-display font-bold mb-4 text-white">Server Support</h2>
            <p className="text-slate-300 mb-8">Need help? Open a ticket on our Discord or read the FAQ below.</p>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 rounded-lg bg-white/5 border border-white/10 hover:border-primary transition-colors cursor-pointer flex flex-col items-center text-center">
                    <span className="material-symbols-outlined text-4xl text-[#5865F2] mb-3">forum</span>
                    <h3 className="font-bold text-lg mb-2">Discord Community</h3>
                    <p className="text-sm text-slate-400">Fastest way to get help from staff and other players.</p>
                </div>

                <div className="p-6 rounded-lg bg-white/5 border border-white/10 hover:border-primary transition-colors cursor-pointer flex flex-col items-center text-center">
                    <span className="material-symbols-outlined text-4xl text-emerald-400 mb-3">book</span>
                    <h3 className="font-bold text-lg mb-2">Wiki & Guides</h3>
                    <p className="text-sm text-slate-400">Read our comprehensive server rules and tutorials.</p>
                </div>
            </div>
        </div>
    )
}
