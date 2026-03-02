import { useState } from 'react'

export default function ContactPage() {
    const [status, setStatus] = useState('idle'); // idle, sending, sent

    const handleSubmit = (e) => {
        e.preventDefault();
        setStatus('sending');
        // Simulate network request
        setTimeout(() => {
            setStatus('sent');
            setTimeout(() => setStatus('idle'), 3000);
        }, 1200);
    }

    return (
        <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center flex-1 text-center" style={{ animation: 'fadeIn 0.8s ease-out' }}>

            <div className="p-1 rounded-full bg-gradient-to-r from-transparent via-primary/20 to-transparent mb-6 animate-pulse">
                <div className="px-5 py-2 rounded-full bg-black/40 border border-primary/20 backdrop-blur-md">
                    <span className="text-primary font-bold tracking-widest uppercase text-xs md:text-sm">📧 Get In Touch</span>
                </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-black font-display tracking-tight text-white mb-4 leading-tight" style={{ textShadow: '0 8px 30px rgba(0,0,0,0.6)' }}>
                Contact <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-primary to-purple-500 italic drop-shadow-lg">Us</span>
            </h1>

            <p className="text-lg text-slate-300 max-w-lg mb-10 font-medium" style={{ textShadow: '0 4px 15px rgba(0,0,0,0.8)' }}>
                Have a business inquiry or general question? Drop us a message.
            </p>

            <form onSubmit={handleSubmit} className="w-full rounded-3xl p-8 backdrop-blur-xl bg-black/60 border border-white/10 shadow-2xl flex flex-col gap-6 text-left transition-all duration-300 hover:border-primary/30" style={{ boxShadow: '0 0 40px rgba(0,0,0,0.5)' }}>

                <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Your Name</label>
                    <div className="relative group">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-500 group-focus-within:text-primary transition-colors text-[20px]">person</span>
                        <input required type="text" className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 outline-none focus:border-primary focus:bg-primary/5 transition-all shadow-inner" placeholder="Steve" />
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Your Email</label>
                    <div className="relative group">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-500 group-focus-within:text-primary transition-colors text-[20px]">mail</span>
                        <input required type="email" className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 outline-none focus:border-primary focus:bg-primary/5 transition-all shadow-inner" placeholder="steve@minecraft.net" />
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Message</label>
                    <div className="relative group">
                        <span className="absolute left-4 top-4 material-symbols-outlined text-slate-500 group-focus-within:text-primary transition-colors text-[20px]">chat</span>
                        <textarea required rows="4" className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 outline-none focus:border-primary focus:bg-primary/5 transition-all shadow-inner resize-none" placeholder="How can we help?" />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={status !== 'idle'}
                    className={`mt-2 flex items-center justify-center gap-2 w-full py-4 rounded-xl font-bold uppercase tracking-widest transition-all duration-300 ${status === 'sent' ? 'bg-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.4)]' :
                            status === 'sending' ? 'bg-primary/50 text-white/50 cursor-wait' :
                                'bg-primary hover:bg-blue-400 text-white shadow-[0_0_20px_rgba(37,140,244,0.4)] hover:shadow-[0_0_30px_rgba(37,140,244,0.6)]'
                        }`}
                >
                    {status === 'idle' && (
                        <>
                            <span className="material-symbols-outlined text-[20px]">send</span>
                            Send Message
                        </>
                    )}
                    {status === 'sending' && (
                        <>
                            <span className="material-symbols-outlined text-[20px] animate-spin">autorenew</span>
                            Sending...
                        </>
                    )}
                    {status === 'sent' && (
                        <>
                            <span className="material-symbols-outlined text-[20px]">check_circle</span>
                            Message Sent
                        </>
                    )}
                </button>
            </form>
        </div>
    )
}
