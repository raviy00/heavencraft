export default function AboutPage() {
    return (
        <div className="w-full max-w-5xl mx-auto space-y-12" style={{ animation: 'fadeIn 0.5s ease-out' }}>

            {/* Header Section */}
            <div className="text-center space-y-4">
                <h1 className="text-4xl md:text-5xl font-display font-bold text-white tracking-wider uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                    About Us
                </h1>
                <p className="text-lg md:text-xl text-primary font-medium tracking-wide uppercase italic drop-shadow-md">
                    A relaxed space to call home
                </p>
                <div className="w-24 h-1 bg-primary mx-auto rounded-full shadow-[0_0_10px_rgba(37,140,244,0.5)]"></div>
            </div>

            {/* Main Welcome Content */}
            <div className="rounded-2xl p-8 md:p-12 shadow-2xl backdrop-blur-3xl bg-black/40 border border-white/10 relative overflow-hidden group">
                {/* Decorative background icon */}
                <div className="absolute -top-10 -right-10 p-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-700 pointer-events-none">
                    <span className="material-symbols-outlined" style={{ fontSize: '20rem' }}>diversity_3</span>
                </div>

                <h2 className="text-2xl md:text-3xl font-display font-medium text-white mb-6 relative z-10 flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-3xl">waving_hand</span>
                    Welcome to our community
                </h2>
                <div className="space-y-6 text-slate-300 text-lg leading-relaxed relative z-10">
                    <p className="text-xl text-slate-200">
                        Welcome to our <strong className="text-white font-semibold">friends only Minecraft community</strong>—a small, friendly server built for players who love building, exploring, and creating unforgettable moments together.
                    </p>
                    <p>
                        If you're looking for a relaxed, welcoming space where creativity thrives and teamwork matters, this is the perfect place to call home.
                    </p>
                </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Feature 1 */}
                <div className="rounded-2xl p-8 shadow-lg backdrop-blur-2xl bg-black/30 border border-white/5 hover:bg-black/50 hover:border-primary/30 transition-all duration-300 transform hover:-translate-y-2 group">
                    <div className="flex items-center gap-4 mb-5">
                        <div className="p-4 rounded-xl bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition-colors shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                            <span className="material-symbols-outlined text-4xl">castle</span>
                        </div>
                        <h3 className="text-xl font-bold text-white uppercase tracking-wider">Create & Explore</h3>
                    </div>
                    <p className="text-slate-400 text-lg leading-relaxed">
                        Whether you're designing massive castles, crafting cozy cottages, or venturing into the unknown in search of rare treasures, there’s always something exciting to do.
                    </p>
                </div>

                {/* Feature 2 */}
                <div className="rounded-2xl p-8 shadow-lg backdrop-blur-2xl bg-black/30 border border-white/5 hover:bg-black/50 hover:border-amber-400/30 transition-all duration-300 transform hover:-translate-y-2 group">
                    <div className="flex items-center gap-4 mb-5">
                        <div className="p-4 rounded-xl bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20 transition-colors shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                            <span className="material-symbols-outlined text-4xl">celebration</span>
                        </div>
                        <h3 className="text-xl font-bold text-white uppercase tracking-wider">Community Events</h3>
                    </div>
                    <p className="text-slate-400 text-lg leading-relaxed">
                        We regularly host fun community events to bring everyone together, strengthen friendships, and keep the adventure fresh.
                    </p>
                </div>

            </div>

        </div>
    )
}
