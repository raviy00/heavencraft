import { useState } from 'react'

export default function HomePage() {
    const [copied, setCopied] = useState(false)
    const serverIP = import.meta.env.VITE_SERVER_IP || 'play.heavencraft.net'

    const handleCopy = () => {
        navigator.clipboard.writeText(serverIP)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="w-full max-w-5xl mx-auto flex flex-col items-center justify-center flex-1 text-center" style={{ animation: 'fadeIn 0.8s ease-out' }}>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black font-display tracking-tight text-white mb-6 leading-tight" style={{ textShadow: '0 8px 30px rgba(0,0,0,0.6)' }}>
                Your Next Great <br /> <span>Adventure</span> Awaits
            </h1>

            <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Server IP Badge */}
                <div
                    className="group relative flex items-center gap-4 pl-6 pr-2 py-2 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-xl shadow-2xl transition-all duration-300 hover:border-primary/50 hover:shadow-primary/20"
                    style={{ boxShadow: '0 0 40px rgba(0,0,0,0.5)' }}
                >
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500/20 text-green-400 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined shrink-0 text-xl">signal_cellular_alt</span>
                    </div>

                    <div className="flex flex-col text-left pr-4">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Server IP</span>
                        <span className="text-white font-mono font-bold text-base md:text-lg select-all tracking-tight">{serverIP}</span>
                    </div>

                    <button
                        onClick={handleCopy}
                        className={`relative overflow-hidden flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 ${copied ? 'bg-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.4)]' : 'bg-white/5 hover:bg-primary text-slate-300 hover:text-white hover:shadow-[0_0_20px_rgba(37,140,244,0.4)]'}`}
                        title="Copy IP"
                    >
                        <span className={`material-symbols-outlined transition-transform duration-300 ${copied ? 'scale-0 absolute' : 'scale-100'}`}>content_copy</span>
                        <span className={`material-symbols-outlined transition-transform duration-300 ${copied ? 'scale-100' : 'scale-0 absolute'}`}>check</span>
                    </button>
                </div>
            </div>
        </div>
    )
}
