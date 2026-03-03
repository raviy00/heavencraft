import { useState } from 'react'
import { contactApi } from '../api'

export default function ContactPage() {
    const [status, setStatus] = useState('idle'); // idle, sending, sent, error
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [errorMessage, setErrorMessage] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('sending');
        setErrorMessage('');

        try {
            await contactApi.submit(formData);
            setStatus('sent');
            setFormData({ name: '', email: '', message: '' }); // clear form

            // Reset button state after a few seconds
            setTimeout(() => setStatus('idle'), 4000);
        } catch (error) {
            setStatus('error');
            setErrorMessage(error.message || 'Failed to send message. Please try again later.');
            setTimeout(() => setStatus('idle'), 5000);
        }
    }

    return (
        <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center flex-1 text-center" style={{ animation: 'fadeIn 0.8s ease-out' }}>

            <h1 className="text-4xl md:text-6xl font-black font-display tracking-tight text-white mb-4 leading-tight" style={{ textShadow: '0 8px 30px rgba(0,0,0,0.6)' }}>
                Contact Us
            </h1>

            <p className="text-lg text-slate-300 max-w-lg mb-10 font-medium" style={{ textShadow: '0 4px 15px rgba(0,0,0,0.8)' }}>
                Have a business inquiry or general question? Drop us a message.
            </p>

            <form onSubmit={handleSubmit} className="w-full rounded-3xl p-8 backdrop-blur-xl bg-black/60 border border-white/10 shadow-2xl flex flex-col gap-6 text-left transition-all duration-300 hover:border-primary/30" style={{ boxShadow: '0 0 40px rgba(0,0,0,0.5)' }}>

                <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Your Name</label>
                    <div className="relative group">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-500 group-focus-within:text-primary transition-colors text-[20px]">person</span>
                        <input name="name" value={formData.name} onChange={handleChange} required type="text" className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 outline-none focus:border-primary focus:bg-primary/5 transition-all shadow-inner" placeholder="Steve" />
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Your Email</label>
                    <div className="relative group">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-500 group-focus-within:text-primary transition-colors text-[20px]">mail</span>
                        <input name="email" value={formData.email} onChange={handleChange} required type="email" className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 outline-none focus:border-primary focus:bg-primary/5 transition-all shadow-inner" placeholder="steve@minecraft.net" />
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Message</label>
                    <div className="relative group">
                        <span className="absolute left-4 top-4 material-symbols-outlined text-slate-500 group-focus-within:text-primary transition-colors text-[20px]">chat</span>
                        <textarea name="message" value={formData.message} onChange={handleChange} required rows="4" className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 outline-none focus:border-primary focus:bg-primary/5 transition-all shadow-inner resize-none" placeholder="How can we help?" />
                    </div>
                </div>

                {status === 'error' && (
                    <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-medium flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">error</span>
                        {errorMessage}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={status !== 'idle'}
                    className={`mt-2 flex items-center justify-center gap-2 w-full py-4 rounded-xl font-bold uppercase tracking-widest transition-all duration-300 ${status === 'sent' ? 'bg-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.4)]' :
                        status === 'sending' ? 'bg-primary/50 text-white/50 cursor-wait' :
                            status === 'error' ? 'bg-white/5 text-slate-400 cursor-not-allowed border border-white/10' :
                                'bg-primary hover:bg-blue-400 text-white shadow-[0_0_20px_rgba(37,140,244,0.4)] hover:shadow-[0_0_30px_rgba(37,140,244,0.6)]'
                        }`}
                >
                    {(status === 'idle' || status === 'error') && (
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
