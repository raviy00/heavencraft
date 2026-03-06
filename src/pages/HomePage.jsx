import { useState } from 'react'

export default function HomePage() {
    const [copied, setCopied] = useState(false)
    const serverIP = import.meta.env.VITE_SERVER_IP || 'heavencraft_tm.aternos.me:39013'

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

            {/* Discord Support Floating Widget */}
            <a
                href="https://discord.gg/jkUp4r8c"
                target="_blank"
                rel="noreferrer"
                className="fixed bottom-6 right-6 flex items-center justify-center w-14 h-14 rounded-full bg-[#5865F2] hover:bg-[#4752C4] shadow-lg hover:shadow-[0_0_20px_rgba(88,101,242,0.6)] transition-all duration-300 hover:scale-110 z-50 group"
                title="Join our Discord for support!"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="28"
                    height="28"
                    fill="white"
                    viewBox="0 0 127.14 96.36"
                >
                    <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.31,60,73.31,53s5-12.74,11.43-12.74S96.33,46,96.22,53,91.18,65.69,84.69,65.69Z" />
                </svg>
                {/* Tooltip on hover */}
                <span className="absolute right-full mr-4 bg-black/80 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 pointer-events-none whitespace-nowrap border border-white/10 shadow-lg">
                    Support
                </span>
            </a>
        </div>
    )
}
