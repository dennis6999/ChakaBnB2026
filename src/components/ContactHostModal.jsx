import React, { useState } from 'react';
import { X, Send, Loader } from 'lucide-react';
import { api } from '../services/api.js';

/**
 * ContactHostModal
 * Props: host { name }, propertyName, propertyId, hostId, guestName, onClose
 */
export default function ContactHostModal({ host, propertyName, propertyId, hostId, guestName, onClose }) {
    const [message, setMessage] = useState('');
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!message.trim()) return;
        setLoading(true);
        try {
            await api.sendMessage({
                property_id: propertyId,
                host_id: hostId,
                guest_name: guestName,
                message: message.trim()
            });
            setSent(true);
        } catch (err) {
            console.error("Failed to send message:", err);
            alert("Failed to send message. Please log in or try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-stone-100 overflow-hidden">
                <div className="bg-emerald-900 text-white px-6 py-5 flex justify-between items-center">
                    <h2 className="text-xl font-bold">Contact Host</h2>
                    <button onClick={onClose} className="hover:bg-white/20 p-1.5 rounded-full transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-8">
                    {sent ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Send className="w-8 h-8 text-emerald-700" />
                            </div>
                            <h3 className="text-xl font-bold text-stone-900 mb-2">Message Sent!</h3>
                            <p className="text-stone-500 mb-6">
                                {host.name} usually replies within a few hours. We'll notify you when they respond.
                            </p>
                            <button onClick={onClose} className="bg-emerald-900 text-white font-bold px-6 py-3 rounded-xl hover:bg-emerald-800 transition">
                                Done
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center gap-3 mb-6 p-4 bg-stone-50 rounded-2xl border border-stone-100">
                                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-800 font-bold">
                                    {host.name.charAt(0)}
                                </div>
                                <div>
                                    <div className="font-bold text-stone-900 text-sm">{host.name}</div>
                                    <div className="text-xs text-stone-500">{propertyName}</div>
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Your Message</label>
                                <textarea
                                    rows={5}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Hi! I'm interested in your property and have a few questions..."
                                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                                />
                            </div>

                            <div className="flex gap-3">
                                <button onClick={onClose} className="flex-1 border-2 border-stone-200 text-stone-600 font-bold py-3 rounded-xl hover:bg-stone-50 transition">
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSend}
                                    disabled={!message.trim() || loading}
                                    className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                    {loading ? 'Sending…' : 'Send Message'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
