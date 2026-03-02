export default function AboutPage() {
    return (
        <div className="w-full max-w-4xl mx-auto rounded-xl p-8 shadow-2xl backdrop-blur-3xl bg-black/40 border border-white/10" style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <h2 className="text-3xl font-display font-bold mb-4 text-white">About Us</h2>
            <div className="space-y-4 text-slate-300">
                <p>
                    Welcome to Heavencraft! We are a community-driven Minecraft server network dedicated to providing the best gameplay experience.
                </p>
                <p>
                    Founded in 2024, our mission is to create a welcoming, fun, and competitive environment for players of all ages.
                    Whether you prefer building massive kingdoms in Survival, conquering the economy in Skyblock, or battling it out in Minigames.
                </p>
                <div className="p-4 rounded bg-white/5 border border-white/10 mt-6">
                    <h3 className="text-primary font-bold mb-2">Dummy Stats Data</h3>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>10,000+ Unique Logins</li>
                        <li>99.9% Uptime guaranteed</li>
                        <li>Custom Anticheat System</li>
                        <li>Active Community Events every weekend</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}
