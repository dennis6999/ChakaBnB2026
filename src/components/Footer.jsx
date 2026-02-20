import React, { useState } from 'react';
import { MapPin, Send } from 'lucide-react';

export default function Footer({ navigateTo }) {
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (email.trim()) { setSubscribed(true); setEmail(''); }
    };

    return (
        <footer className="bg-stone-900 text-stone-400 py-16 border-t-4 border-emerald-900 mt-auto">
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                <div className="md:col-span-2">
                    <div className="text-2xl font-black text-white flex items-center gap-2 mb-4 opacity-90">
                        <MapPin className="text-orange-500" /> Chakabnb
                    </div>
                    <p className="text-stone-500 text-sm font-medium max-w-sm mb-6">
                        Connecting you to the beauty of Nyeri County, Kenya. Discover local stays, experiences,
                        and genuine hospitality in Chaka town.
                    </p>

                    {/* Newsletter */}
                    <div>
                        <p className="text-white font-bold text-sm mb-3">Get exclusive deals in your inbox</p>
                        {subscribed ? (
                            <p className="text-emerald-400 font-medium text-sm">✓ You're subscribed! Welcome to Chakabnb.</p>
                        ) : (
                            <form onSubmit={handleSubscribe} className="flex gap-2">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    className="flex-1 bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500 transition min-w-0"
                                />
                                <button
                                    type="submit"
                                    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-xl transition flex items-center gap-1.5 text-sm font-bold flex-shrink-0"
                                >
                                    <Send className="w-3.5 h-3.5" /> Subscribe
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                <div>
                    <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Explore</h4>
                    <ul className="space-y-2 text-sm">
                        <li><button onClick={() => navigateTo('search')} className="hover:text-orange-400 transition">All Properties</button></li>
                        <li><span className="hover:text-orange-400 cursor-pointer transition">Ranches &amp; Camps</span></li>
                        <li><span className="hover:text-orange-400 cursor-pointer transition">Town Apartments</span></li>
                        <li><span className="hover:text-orange-400 cursor-pointer transition">Wellness Retreats</span></li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Support</h4>
                    <ul className="space-y-2 text-sm">
                        <li><span className="hover:text-orange-400 cursor-pointer transition">Help Center</span></li>
                        <li><span className="hover:text-orange-400 cursor-pointer transition">Cancellation Options</span></li>
                        <li><span className="hover:text-orange-400 cursor-pointer transition">Contact Us</span></li>
                        <li><span className="hover:text-orange-400 cursor-pointer transition">List Your Property</span></li>
                    </ul>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 text-center border-t border-stone-800 pt-8 text-sm">
                <p>Copyright &copy; 2026 Chakabnb. A premium local experience.</p>
            </div>
        </footer>
    );
}
