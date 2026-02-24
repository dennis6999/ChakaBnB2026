import React, { useState } from 'react';
import { MapPin, Send, Instagram, Twitter, Linkedin, Facebook, Smartphone } from 'lucide-react';

export default function Footer({ navigateTo }) {
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (email.trim()) { setSubscribed(true); setEmail(''); }
    };

    const linkCls = "text-stone-400 hover:text-orange-400 transition cursor-pointer";

    return (
        <footer className="bg-stone-950 text-stone-400 pt-20 pb-32 md:pb-16 border-t-4 border-emerald-900 mt-auto relative overflow-hidden">
            {/* Subtle background glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-900/10 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-12 gap-10 mb-16 relative z-10">
                {/* Brand & Newsletter (Span 5) */}
                <div className="md:col-span-5">
                    <div className="text-3xl font-black text-white flex items-center gap-2 mb-6 tracking-tight">
                        <MapPin className="text-orange-500 w-8 h-8" /> Chakabnb
                    </div>
                    <p className="text-stone-400 text-sm font-medium max-w-sm mb-8 leading-relaxed">
                        Connecting you to the beauty of Nyeri County, Kenya. Discover local stays, experiences,
                        and genuine hospitality in Chaka town.
                    </p>

                    {/* Newsletter */}
                    <div className="bg-stone-900/50 p-5 rounded-2xl border border-stone-800 backdrop-blur-sm">
                        <p className="text-white font-bold text-sm mb-2">Get exclusive deals in your inbox</p>
                        {subscribed ? (
                            <p className="text-emerald-400 font-bold text-sm flex items-center gap-2">
                                <span className="w-5 h-5 bg-emerald-500/20 text-emerald-400 flex items-center justify-center rounded-full">✓</span>
                                You're subscribed!
                            </p>
                        ) : (
                            <form onSubmit={handleSubscribe} className="flex gap-2">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    className="flex-1 bg-stone-950 border border-stone-700/50 rounded-lg px-3 py-2 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition min-w-0"
                                />
                                <button
                                    type="submit"
                                    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2 text-sm font-bold flex-shrink-0 shadow-md shadow-orange-600/20"
                                >
                                    <Send className="w-4 h-4" /> Subscribe
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                {/* Explore Links (Span 2) */}
                <div className="md:col-span-2 md:col-start-6">
                    <h4 className="text-white font-black mb-4 uppercase tracking-widest text-[11px]">Explore</h4>
                    <ul className="space-y-3 text-sm font-medium">
                        <li><button onClick={() => navigateTo('search')} className={linkCls}>All Properties</button></li>
                        <li><span onClick={() => navigateTo('search')} className={linkCls}>Ranches & Camps</span></li>
                        <li><span onClick={() => navigateTo('search')} className={linkCls}>Town Apartments</span></li>
                        <li><span onClick={() => navigateTo('search')} className={linkCls}>Wellness Retreats</span></li>
                        <li><span className={linkCls}>Gift Cards</span></li>
                    </ul>
                </div>

                {/* Support Links (Span 2) */}
                <div className="md:col-span-2">
                    <h4 className="text-white font-black mb-4 uppercase tracking-widest text-[11px]">Support</h4>
                    <ul className="space-y-3 text-sm font-medium">
                        <li><span className={linkCls}>Help Center</span></li>
                        <li><span className={linkCls}>Cancellation Options</span></li>
                        <li><button onClick={() => navigateTo('inbox')} className={linkCls}>Contact Us</button></li>
                        <li><button onClick={() => navigateTo('host')} className={linkCls}>List Your Property</button></li>
                        <li><span className={linkCls}>Trust & Safety</span></li>
                    </ul>
                </div>

                {/* App Promo & Socials (Span 3) */}
                <div className="md:col-span-3">
                    <h4 className="text-white font-black mb-4 uppercase tracking-widest text-[11px]">Get the App</h4>
                    <div className="space-y-2 mb-6">
                        <button className="w-full bg-stone-900 border border-stone-800 hover:border-emerald-600 rounded-lg p-2.5 flex items-center justify-center gap-3 transition group">
                            <Smartphone className="text-white group-hover:text-emerald-500 transition w-5 h-5" />
                            <div className="text-left flex-1">
                                <div className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mb-0.5">Download on the</div>
                                <div className="text-white font-bold text-sm leading-none">App Store</div>
                            </div>
                        </button>
                        <button className="w-full bg-stone-900 border border-stone-800 hover:border-emerald-600 rounded-lg p-2.5 flex items-center justify-center gap-3 transition group">
                            {/* Quick generic android/play icon abstraction since lucide lacks an explicit App/Play store icon */}
                            <svg className="w-5 h-5 text-white group-hover:text-emerald-500 transition" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.523 15.3414C17.523 15.3414 16.0354 18.0673 14.1554 18.0673C12.446 18.0673 11.597 16.944 9.17205 16.944C6.70275 16.944 5.61905 18.0673 4.14445 18.0673C2.39695 18.0673 0.224609 13.9392 0.224609 10.3248C0.224609 5.89736 3.02985 3.51866 5.62685 3.51866C7.39765 3.51866 8.52835 4.54226 9.35125 4.54226C10.2201 4.54226 11.5815 3.39966 13.7259 3.39966C14.4921 3.39966 17.6534 3.73836 19.5101 6.37736C19.349 6.47166 17.078 7.74906 17.078 10.511C17.078 13.7745 19.8665 14.8696 19.8665 14.8696C19.8515 14.9224 19.4627 16.2736 17.523 15.3414ZM12.75 1.54326C12.75 1.54326 12.8711 3.42436 11.5173 4.88726C10.2977 6.20456 8.35655 6.13096 8.35655 6.13096C8.35655 6.13096 8.42195 4.31976 9.61335 2.92486C10.8804 1.44476 12.75 1.54326 12.75 1.54326Z" />
                            </svg>
                            <div className="text-left flex-1">
                                <div className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mb-0.5">Get it on</div>
                                <div className="text-white font-bold text-sm leading-none">Google Play</div>
                            </div>
                        </button>
                    </div>

                    <h4 className="text-white font-black mb-3 uppercase tracking-widest text-[11px]">Follow Us</h4>
                    <div className="flex items-center gap-2">
                        {[
                            { icon: Instagram, label: 'Instagram' },
                            { icon: Twitter, label: 'Twitter' },
                            { icon: Facebook, label: 'Facebook' },
                            { icon: Linkedin, label: 'LinkedIn' },
                        ].map(({ icon: Icon, label }) => (
                            <button
                                key={label}
                                aria-label={label}
                                className="w-9 h-9 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-400 hover:text-white hover:bg-emerald-800 hover:border-emerald-700 transition"
                            >
                                <Icon className="w-4 h-4" />
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="max-w-7xl mx-auto px-4 border-t border-stone-800/60 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium">
                <p>&copy; {new Date().getFullYear()} Chakabnb. A premium local experience.</p>
                <div className="flex gap-4">
                    <span className="hover:text-emerald-400 cursor-pointer transition">Privacy Policy</span>
                    <span className="hover:text-emerald-400 cursor-pointer transition">Terms of Service</span>
                    <span className="hover:text-emerald-400 cursor-pointer transition">Sitemap</span>
                </div>
            </div>
        </footer>
    );
}
