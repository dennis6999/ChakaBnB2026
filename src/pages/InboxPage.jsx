import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../services/supabase';
import { api } from '../services/api';
import { MessageSquare, Send, ArrowLeft, Loader, Check, CheckCheck } from 'lucide-react';

export default function InboxPage({ user, navigateTo }) {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeChat, setActiveChat] = useState(null); // { otherUserId, propertyId, name, avatar, propertyName }
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);

    const messagesEndRef = useRef(null);

    // Fetch messages on mount
    useEffect(() => {
        if (!user) {
            navigateTo('signin');
            return;
        }
        fetchMessages();

        // Subscribe to real-time new messages
        const channel = supabase
            .channel('public:messages')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages' },
                (payload) => {
                    const newMsg = payload.new;
                    // Only process if it belongs to me
                    if (newMsg.sender_id === user.id || newMsg.receiver_id === user.id) {
                        // When a new message comes in over realtime, we might need to fetch the property name again
                        // Or we can just optimistically append if we already have the property in state
                        setMessages(prev => [...prev, newMsg]);
                    }
                }
            )
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'messages' },
                (payload) => {
                    const updatedMsg = payload.new;
                    if (updatedMsg.sender_id === user.id || updatedMsg.receiver_id === user.id) {
                        setMessages(prev => prev.map(m => m.id === updatedMsg.id ? { ...m, ...updatedMsg } : m));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, navigateTo]);

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const data = await api.getUserConversations();
            setMessages(data);
        } catch (err) {
            console.error("Error fetching messages:", err);
        } finally {
            setLoading(false);
        }
    };

    // Scroll to bottom when reading chat
    useEffect(() => {
        if (activeChat) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            // Mark as read
            api.markMessagesAsRead(activeChat.otherUserId, activeChat.propertyId).catch(console.error);
        }
    }, [messages, activeChat]);

    // Group messages into conversations
    const conversations = [];
    const conversationMap = new Map();

    // Ensure messages is sorted by oldest first, so the last processed is the newest
    messages.forEach(msg => {
        const isMeSender = msg.sender_id === user?.id;
        const otherUserId = isMeSender ? msg.receiver_id : msg.sender_id;
        const otherUserName = isMeSender ? msg.receiver_name : msg.sender_name;

        const key = `${otherUserId}-${msg.property_id}`;

        if (!conversationMap.has(key)) {
            conversationMap.set(key, {
                otherUserId,
                otherUserName,
                propertyId: msg.property_id,
                propertyName: msg.properties?.name || 'Unknown Property',
                propertyImage: msg.properties?.image || null,
                lastMessage: msg.content,
                lastMessageTime: msg.created_at,
                unreadCount: (!isMeSender && !msg.read) ? 1 : 0
            });
        } else {
            const conv = conversationMap.get(key);
            conv.lastMessage = msg.content;
            conv.lastMessageTime = msg.created_at;
            if (!isMeSender && !msg.read) {
                conv.unreadCount += 1;
            }
        }
    });

    // Sort conversations by newest message
    conversations.push(...Array.from(conversationMap.values()).sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime)));

    const activeChatMessages = messages.filter(m =>
        m.property_id === activeChat?.propertyId &&
        (m.sender_id === activeChat?.otherUserId || m.receiver_id === activeChat?.otherUserId)
    );

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeChat) return;

        setSending(true);
        try {
            await api.sendMessage(
                activeChat.propertyId,
                activeChat.otherUserId,
                activeChat.otherUserName,
                newMessage.trim()
            );
            // Optimistic update handled by Realtime subscription
            setNewMessage('');
        } catch (err) {
            console.error("Failed to send message:", err);
            alert("Failed to send message.");
        } finally {
            setSending(false);
        }
    };

    const formatTime = (ts) => {
        return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-[60vh]">
                <Loader className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 flex-1 flex flex-col h-[calc(100vh-80px)]">
            <div className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden flex flex-1 w-full relative">

                {/* Conversations List (Left Pane) */}
                <div className={`w-full md:w-1/3 border-r border-stone-200 flex flex-col bg-stone-50/50 ${activeChat ? 'hidden md:flex' : 'flex'}`}>
                    <div className="p-4 border-b border-stone-200 bg-white">
                        <h2 className="text-xl font-black text-stone-900">Messages</h2>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {conversations.length === 0 ? (
                            <div className="p-8 text-center text-stone-400">
                                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p>No messages yet.</p>
                            </div>
                        ) : (
                            conversations.map((conv, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveChat(conv)}
                                    className={`w-full text-left p-4 flex gap-3 hover:bg-white transition border-b border-stone-100 ${activeChat?.otherUserId === conv.otherUserId && activeChat?.propertyId === conv.propertyId
                                            ? 'bg-white border-l-4 border-l-emerald-600'
                                            : 'border-l-4 border-l-transparent'
                                        }`}
                                >
                                    <div className="w-12 h-12 bg-stone-200 rounded-full flex-shrink-0 flex items-center justify-center text-stone-500 font-bold overflow-hidden">
                                        {conv.propertyImage ? (
                                            <img src={conv.propertyImage} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            conv.otherUserName.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-0.5">
                                            <h3 className="font-bold text-stone-900 truncate pr-2">{conv.otherUserName}</h3>
                                            <span className="text-xs text-stone-400 whitespace-nowrap">
                                                {formatTime(conv.lastMessageTime)}
                                            </span>
                                        </div>
                                        <p className="text-xs text-stone-500 font-medium mb-1 truncate">{conv.propertyName}</p>
                                        <div className="flex justify-between items-center">
                                            <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'text-stone-900 font-semibold' : 'text-stone-500'}`}>
                                                {conv.lastMessage}
                                            </p>
                                            {conv.unreadCount > 0 && (
                                                <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full ml-2 shrink-0">
                                                    {conv.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Chat Window (Right Pane) */}
                <div className={`w-full md:w-2/3 flex flex-col bg-white ${!activeChat ? 'hidden md:flex' : 'flex'} absolute md:relative inset-0`}>
                    {activeChat ? (
                        <>
                            {/* Chat Header */}
                            <div className="h-16 border-b border-stone-200 bg-white flex items-center px-4 gap-3 z-10">
                                <button
                                    onClick={() => setActiveChat(null)}
                                    className="md:hidden p-2 -ml-2 text-stone-500 hover:bg-stone-100 rounded-full"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </button>

                                <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold">
                                    {activeChat.otherUserName.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-stone-900 truncate">{activeChat.otherUserName}</h3>
                                    <p className="text-xs text-stone-500 truncate">{activeChat.propertyName}</p>
                                </div>
                                <button
                                    onClick={() => navigateTo('property', activeChat.propertyId)}
                                    className="text-xs font-bold text-emerald-600 hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition shrink-0"
                                >
                                    View Property
                                </button>
                            </div>

                            {/* Messages Area */}
                            <div className="flex-1 overflow-y-auto p-4 bg-stone-50 flex flex-col gap-3">
                                {activeChatMessages.map((msg, idx) => {
                                    const isMe = msg.sender_id === user.id;
                                    return (
                                        <div key={msg.id || idx} className={`flex max-w-[80%] ${isMe ? 'self-end' : 'self-start'}`}>
                                            <div className={`px-4 py-2.5 rounded-2xl ${isMe ? 'bg-emerald-600 text-white rounded-br-sm' : 'bg-white border border-stone-200 text-stone-800 rounded-bl-sm shadow-sm'}`}>
                                                <p className="text-sm leading-relaxed">{msg.content}</p>
                                                <div className={`flex items-center justify-end gap-1 mt-1 ${isMe ? 'text-emerald-200' : 'text-stone-400'}`}>
                                                    <span className="text-[10px]">{formatTime(msg.created_at)}</span>
                                                    {isMe && (
                                                        msg.read ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Message Input */}
                            <div className="p-4 bg-white border-t border-stone-200">
                                <form onSubmit={handleSend} className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Type a message..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        className="flex-1 bg-stone-100 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim() || sending}
                                        className="bg-emerald-600 text-white p-3 rounded-xl hover:bg-emerald-700 transition disabled:opacity-50 shrink-0"
                                    >
                                        <Send className="w-5 h-5" />
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-stone-400 p-8 hidden md:flex">
                            <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mb-4">
                                <MessageSquare className="w-8 h-8 text-stone-300" />
                            </div>
                            <h3 className="text-xl font-bold text-stone-800 mb-2">Your Messages</h3>
                            <p className="text-center max-w-sm text-stone-500">
                                Select a conversation from the left to start checking the details of your bookings.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
