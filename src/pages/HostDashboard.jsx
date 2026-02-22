import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import { Plus, Home, MapPin, UploadCloud, Loader, Star, X, Calendar, User, Clock, CheckCircle, MessageSquare, TrendingUp, BarChart, DollarSign, Activity, Eye, EyeOff, Lock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, subDays, eachDayOfInterval, isSameDay, startOfMonth, endOfMonth } from 'date-fns';
import AlertModal from '../components/AlertModal.jsx';
import DatePicker from '../components/DatePicker.jsx';
import { AMENITIES } from '../utils/constants.js';

export default function HostDashboard({ user, navigateTo }) {
    const [myProperties, setMyProperties] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [messages, setMessages] = useState([]);
    const [activeTab, setActiveTab] = useState('analytics'); // 'analytics' | 'properties' | 'reservations' | 'messages'
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [showFormModal, setShowFormModal] = useState(false);
    const [propertyToEdit, setPropertyToEdit] = useState(null);
    const [showBlockDatesModal, setShowBlockDatesModal] = useState(false);
    const [propertyToBlock, setPropertyToBlock] = useState(null);
    const [alertConfig, setAlertConfig] = useState({ isOpen: false, title: '', message: '', type: 'error' });

    const showAlert = (message, title = 'Oops!', type = 'error') => {
        setAlertConfig({ isOpen: true, message, title, type });
    };

    const handleToggleActive = async (e, property) => {
        e.stopPropagation();
        setActionLoading(property.id + '-toggle');
        try {
            const newStatus = property.is_active === false ? true : false;
            await api.togglePropertyVisibility(property.id, newStatus);
            setMyProperties(prev => prev.map(p => p.id === property.id ? { ...p, is_active: newStatus } : p));
            showAlert(newStatus ? 'Property is now visible to guests' : 'Property is now hidden from search', 'Visibility Updated', 'success');
        } catch (err) {
            console.error('Failed to toggle visibility:', err);
            showAlert('Failed to update property visibility.');
        } finally {
            setActionLoading(null);
        }
    };

    useEffect(() => {
        if (!user) {
            navigateTo('home');
            return;
        }
        loadDashboardData();
    }, [user]);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const [propsData, resData, msgsData] = await Promise.all([
                api.getHostProperties(user.id),
                api.getHostReservations(user.id),
                api.getHostMessages(user.id)
            ]);
            setMyProperties(propsData);

            // Clean up: hide any past blocks that were merely 'Cancelled' instead of deleted
            const validReservations = resData.filter(r => !(r.status === 'Cancelled' && r.user_id === user.id));
            setReservations(validReservations);
            setMessages(msgsData);
        } catch (err) {
            console.error("Failed to load dashboard data:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (bookingId, newStatus) => {
        setActionLoading(bookingId);
        try {
            if (newStatus === 'DeleteBlock') {
                await api.deleteBooking(bookingId);
                setReservations(prev => prev.filter(r => r.id !== bookingId));
            } else {
                await api.updateBookingStatus(bookingId, newStatus);
                // Quick local UI update
                setReservations(prev => prev.map(r => r.id === bookingId ? { ...r, status: newStatus } : r));
            }
        } catch (err) {
            console.error("Failed to update status", err);
            showAlert("Failed to update booking status. Please try again.");
        } finally {
            setActionLoading(null);
        }
    };

    // --- Analytics Calculations ---
    const analytics = useMemo(() => {
        if (!reservations || reservations.length === 0) {
            return { totalRevenue: 0, totalBookings: 0, occupancyRate: 0, revenueData: [], statusData: [] };
        }

        const confirmed = reservations.filter(r => r.status === 'Confirmed' || r.status === 'Completed');
        const totalRevenue = confirmed.reduce((sum, r) => sum + (Number(r.total_price) || 0), 0);
        const totalBookings = reservations.length;

        // Simple Occupancy Calculation (Days booked vs total possible property days for roughly 30 days)
        const totalDaysBooked = confirmed.reduce((sum, r) => {
            const start = new Date(r.check_in);
            const end = new Date(r.check_out);
            const diffTime = Math.abs(end - start);
            return sum + Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }, 0);

        const maxPossibleDays = Math.max(1, myProperties.length) * 30;
        const occupancyRate = Math.min(100, Math.round((totalDaysBooked / maxPossibleDays) * 100));

        // Group revenue by month for the chart
        const revenueMap = {};
        confirmed.forEach(r => {
            const month = format(new Date(r.check_in), 'MMM yyyy');
            revenueMap[month] = (revenueMap[month] || 0) + (Number(r.total_price) || 0);
        });
        const revenueData = Object.keys(revenueMap).map(month => ({
            name: month,
            revenue: revenueMap[month]
        })).sort((a, b) => new Date(a.name) - new Date(b.name));

        // Status Doughnut Data
        const statusMap = { Confirmed: 0, Pending: 0, Cancelled: 0 };
        reservations.forEach(r => {
            if (statusMap[r.status] !== undefined) statusMap[r.status]++;
            else statusMap[r.status] = 1;
        });
        const statusData = Object.keys(statusMap)
            .filter(key => statusMap[key] > 0)
            .map(key => ({ name: key, value: statusMap[key] }));

        return { totalRevenue, totalBookings, occupancyRate, revenueData, statusData };
    }, [reservations, myProperties]);

    const timelineDays = useMemo(() => {
        const start = new Date(); // Today
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setDate(end.getDate() + 30); // 30 days ahead
        return eachDayOfInterval({ start, end });
    }, []);

    const getBookingStatusForDay = (propertyId, day) => {
        const activeRes = reservations.find(r => {
            if (r.status !== 'Confirmed' && r.status !== 'Completed' && r.status !== 'HostBlock') return false;
            // API returns properties wrapped or just property_id depending on join, let's check both
            const rPropId = r.property_id || r.properties?.id;
            if (rPropId !== propertyId) return false;
            const checkIn = new Date(r.check_in);
            checkIn.setHours(0, 0, 0, 0);
            const checkOut = new Date(r.check_out);
            checkOut.setHours(0, 0, 0, 0);
            return day >= checkIn && day < checkOut;
        });
        return activeRes ? (activeRes.status === 'HostBlock' ? 'blocked' : 'booked') : 'free';
    };

    const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6b7280']; // Emerald, Orange, Red, Gray

    if (loading) {
        return (
            <div className="flex-1 flex justify-center items-center py-20">
                <Loader className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-stone-900">Host Dashboard</h1>
                    <p className="text-stone-500 mt-1">Manage your properties and review incoming bookings</p>
                </div>
                {activeTab === 'properties' && (
                    <button
                        onClick={() => { setPropertyToEdit(null); setShowFormModal(true); }}
                        className="flex items-center gap-2 bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-emerald-800 transition shadow-lg shadow-emerald-700/20 w-full sm:w-auto justify-center shrink-0"
                    >
                        <Plus className="w-5 h-5" /> Add Property
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex border-b border-stone-200 mb-8 overflow-x-auto hide-scrollbar">
                {[
                    { id: 'analytics', label: 'Analytics Insights', count: null, icon: <TrendingUp className="w-4 h-4" /> },
                    { id: 'properties', label: 'My Listings', count: myProperties.length, icon: <Home className="w-4 h-4" /> },
                    { id: 'reservations', label: 'Reservations & Blocks', count: reservations.filter(r => r.status !== 'HostBlock').length || null, icon: <Calendar className="w-4 h-4" /> },
                    { id: 'messages', label: 'Inbox', count: messages.length, icon: <MessageSquare className="w-4 h-4" /> }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-6 py-4 text-sm font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${activeTab === tab.id
                            ? 'border-emerald-700 text-emerald-800'
                            : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'
                            }`}
                    >
                        {tab.icon}
                        {tab.label}
                        {tab.count !== null && (
                            <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === tab.id ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-500'
                                }`}>
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content: Analytics */}
            {activeTab === 'analytics' && (
                <div className="space-y-6">
                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm flex items-center gap-5 hover:shadow-md transition">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center shrink-0">
                                <DollarSign className="w-7 h-7 text-emerald-700" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-1">Total Revenue</p>
                                <h3 className="text-3xl font-black text-stone-900">KES {analytics.totalRevenue.toLocaleString()}</h3>
                            </div>
                        </div>
                        <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm flex items-center gap-5 hover:shadow-md transition">
                            <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center shrink-0">
                                <Activity className="w-7 h-7 text-orange-700" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-1">Occupancy Rate</p>
                                <h3 className="text-3xl font-black text-stone-900">{analytics.occupancyRate}%</h3>
                            </div>
                        </div>
                        <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm flex items-center gap-5 hover:shadow-md transition">
                            <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0">
                                <Calendar className="w-7 h-7 text-blue-700" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-1">Total Bookings</p>
                                <h3 className="text-3xl font-black text-stone-900">{analytics.totalBookings}</h3>
                            </div>
                        </div>
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Revenue Area Chart */}
                        <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm lg:col-span-2">
                            <h3 className="text-lg font-black text-stone-900 mb-6 flex items-center gap-2">
                                <BarChart className="w-5 h-5 text-emerald-600" /> Revenue Overview
                            </h3>
                            {analytics.revenueData.length > 0 ? (
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={analytics.revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280', fontWeight: 'bold' }} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280', fontWeight: 'bold' }} tickFormatter={(val) => `KES ${val / 1000}k`} dx={-10} />
                                            <RechartsTooltip
                                                formatter={(value) => [`KES ${value.toLocaleString()}`, 'Revenue']}
                                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                                            />
                                            <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="h-[300px] flex flex-col items-center justify-center text-stone-400 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                                    <BarChart className="w-8 h-8 mb-2 opacity-50" />
                                    <span className="font-medium text-sm">No revenue data yet</span>
                                </div>
                            )}
                        </div>

                        {/* Status Doughnut Chart */}
                        <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm">
                            <h3 className="text-lg font-black text-stone-900 mb-6">Booking Statuses</h3>
                            {analytics.statusData.length > 0 ? (
                                <div className="h-[300px] w-full relative">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={analytics.statusData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={80}
                                                outerRadius={110}
                                                paddingAngle={5}
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                {analytics.statusData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip
                                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                                        <span className="text-4xl font-black text-stone-900">{analytics.totalBookings}</span>
                                        <span className="text-xs font-bold text-stone-400 uppercase tracking-widest mt-1">Total</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-[300px] flex flex-col items-center justify-center text-stone-400 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                                    <Activity className="w-8 h-8 mb-2 opacity-50" />
                                    <span className="font-medium text-sm">No bookings yet</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Tab Content: Calendar */}
            {activeTab === 'calendar' && (
                <div className="space-y-6">
                    {/* Booking Timeline Grid */}
                    <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm overflow-hidden">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
                            <h3 className="text-lg font-black text-stone-900 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-blue-600" /> Availability Timeline (Next 30 Days)
                            </h3>
                            <div className="flex gap-4 flex-wrap text-xs font-bold text-stone-500">
                                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-stone-50 border border-stone-200"></div> Available</div>
                                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/30"></div> Booked</div>
                                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-orange-400 shadow-sm shadow-orange-400/30"></div> Pending</div>
                                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-stone-400 opacity-60"></div> Blocked</div>
                            </div>
                        </div>

                        <div className="overflow-x-auto custom-scrollbar pb-2">
                            <div className="min-w-[800px]">
                                {/* Header Row (Days) */}
                                <div className="flex border-b border-stone-100 pb-2 mb-3 pl-40">
                                    {timelineDays.map((day, i) => (
                                        <div key={i} className="flex-1 text-center min-w-[28px] flex flex-col items-center">
                                            <span className="text-[10px] font-bold text-stone-400 capitalize">{format(day, 'EEeeee').charAt(0)}</span>
                                            <span className={`text-xs mt-1 font-black ${isSameDay(day, new Date()) ? 'bg-orange-500 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-md' : 'text-stone-700'}`}>
                                                {format(day, 'd')}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Property Rows */}
                                {myProperties.length > 0 ? myProperties.map(property => (
                                    <div key={property.id} className="flex items-center mb-1.5 group">
                                        <div className="w-40 shrink-0 pr-4 font-bold text-xs text-stone-600 group-hover:text-stone-900 transition flex items-center justify-between gap-2 relative">
                                            <div className="flex items-center gap-2 truncate">
                                                <div className="w-6 h-6 rounded bg-stone-100 overflow-hidden shrink-0">
                                                    {property.image && <img src={property.image} className="w-full h-full object-cover" alt="" />}
                                                </div>
                                                <span className="truncate">{property.name}</span>
                                            </div>
                                            <button
                                                onClick={() => { setPropertyToBlock(property); setShowBlockDatesModal(true); }}
                                                className="opacity-0 group-hover:opacity-100 flex-shrink-0 bg-stone-900 text-white rounded p-1 hover:bg-stone-800 transition shadow-sm absolute right-2"
                                                title="Block Dates"
                                            >
                                                <Lock className="w-3 h-3" />
                                            </button>
                                        </div>
                                        <div className="flex-1 flex gap-1">
                                            {timelineDays.map((day, i) => {
                                                const status = getBookingStatusForDay(property.id, day);
                                                return (
                                                    <div
                                                        key={i}
                                                        title={`${property.name} - ${format(day, 'MMM d')}: ${status.toUpperCase()}`}
                                                        className={`flex-1 min-w-[28px] h-8 rounded-md transition-all duration-300 ${status === 'booked' ? 'bg-emerald-500 shadow-sm shadow-emerald-500/20 z-10 scale-y-105' :
                                                            status === 'pending' ? 'bg-orange-400 shadow-sm shadow-orange-400/20 z-10 scale-y-105 animate-pulse' :
                                                                status === 'blocked' ? 'bg-stone-400 opacity-60 z-10 scale-y-105' :
                                                                    'bg-stone-50 hover:bg-stone-100 border border-stone-100/50'}`}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-8 text-stone-400 text-sm font-medium">No properties to display.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )
            }

            {/* Tab Content: Properties */}
            {
                activeTab === 'properties' && (
                    <>
                        {myProperties.length === 0 ? (
                            <div className="text-center py-20 bg-white border border-stone-200 rounded-3xl">
                                <div className="bg-emerald-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Home className="text-emerald-600 w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold text-stone-900 mb-2">No properties yet</h3>
                                <p className="text-stone-500 max-w-sm mx-auto mb-6">
                                    Become a host by listing your first property on ChakaBnB. It's quick and easy!
                                </p>
                                <button
                                    onClick={() => { setPropertyToEdit(null); setShowFormModal(true); }}
                                    className="bg-stone-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-stone-800 transition inline-flex items-center gap-2"
                                >
                                    <Plus className="w-5 h-5" /> Create Listing
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {myProperties.map(property => (
                                    <div key={property.id} className="bg-white border flex flex-col border-stone-200 rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300 group">
                                        <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
                                            {property.image ? (
                                                <img src={property.image} alt={property.name} className={`w-full h-full object-cover transition duration-700 ${property.is_active === false ? 'grayscale opacity-50' : 'group-hover:scale-105'}`} />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center flex-col text-stone-400">
                                                    <Home className="w-8 h-8 mb-2 opacity-50" />
                                                    <span className="text-xs font-medium">No Image</span>
                                                </div>
                                            )}
                                            <div className="absolute top-4 left-4 flex gap-2">
                                                <div className="bg-white/90 backdrop-blur px-2.5 py-1 rounded-full text-xs font-bold text-stone-900 shadow-sm">
                                                    {property.type}
                                                </div>
                                                {property.is_active === false && (
                                                    <div className="bg-stone-900/90 text-white backdrop-blur px-2.5 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1">
                                                        <EyeOff className="w-3 h-3" /> Hidden
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="p-5 flex-1 flex flex-col">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className={`font-bold text-lg leading-tight line-clamp-1 transition-colors ${property.is_active === false ? 'text-stone-400' : 'group-hover:text-emerald-700'}`}>
                                                    {property.name}
                                                </h3>
                                                <div className="flex items-center gap-1 shrink-0 bg-stone-100 px-1.5 py-0.5 rounded-md">
                                                    <Star className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                                                    <span className="text-sm font-bold text-stone-700">{property.rating || 'New'}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-stone-500 text-sm mb-3">
                                                <MapPin className="w-4 h-4 text-stone-400" />
                                                <span className="line-clamp-1">{property.distance}</span>
                                            </div>
                                            <div className="mt-auto pt-4 border-t border-stone-100 flex items-center justify-between">
                                                <div className="font-black text-emerald-900 text-lg">
                                                    KES {property.price.toLocaleString()}
                                                    <span className="text-xs font-medium text-stone-500 ml-1">/ night</span>
                                                </div>
                                                <div className="flex gap-2 flex-wrap justify-end">
                                                    <button
                                                        onClick={(e) => handleToggleActive(e, property)}
                                                        disabled={actionLoading === property.id + '-toggle'}
                                                        className={`px-3 py-1.5 font-bold rounded-lg text-xs transition border ${property.is_active === false ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'}`}
                                                    >
                                                        {actionLoading === property.id + '-toggle' ? <Loader className="w-4 h-4 animate-spin inline" /> : (property.is_active === false ? 'Publish' : 'Hide')}
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setPropertyToEdit(property); setShowFormModal(true); }}
                                                        className="px-3 py-1.5 bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900 font-bold rounded-lg text-xs transition"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); navigateTo('property', property.id); }}
                                                        disabled={property.is_active === false}
                                                        className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold rounded-lg text-xs transition disabled:opacity-50"
                                                    >
                                                        View
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setPropertyToBlock(property); setShowBlockDatesModal(true); }}
                                                        className="px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 font-bold rounded-lg text-xs transition"
                                                    >
                                                        Block
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )
            }

            {/* Tab Content: Reservations */}
            {
                activeTab === 'reservations' && (
                    <>
                        {reservations.length === 0 ? (
                            <div className="text-center py-20 bg-stone-50 border border-stone-200 rounded-3xl border-dashed">
                                <div className="bg-stone-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Calendar className="text-stone-500 w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold text-stone-900 mb-2">No reservations or blocked dates</h3>
                                <p className="text-stone-500 max-w-sm mx-auto">
                                    When guests book your properties, they will appear here. You can also block dates from your properties tab.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-12">
                                {reservations.filter(r => r.status !== 'HostBlock').length > 0 && (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-black text-stone-900 mb-4 flex items-center gap-2">
                                            <User className="w-5 h-5 text-emerald-600" /> Guest Bookings
                                        </h3>
                                        {reservations.filter(r => r.status !== 'HostBlock').map(res => (
                                            <div key={res.id} className="bg-white border border-stone-200 rounded-2xl p-5 flex flex-col md:flex-row gap-6 shadow-sm hover:shadow-md transition">
                                                <div className="shrink-0 w-full md:w-48 aspect-video md:aspect-[4/3] rounded-xl overflow-hidden bg-stone-100">
                                                    {res.properties?.image ? (
                                                        <img src={res.properties.image} alt={res.properties.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Home className="w-8 h-8 text-stone-300" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 flex flex-col">
                                                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${res.status === 'HostBlock' ? 'bg-stone-200 text-stone-600' :
                                                                    res.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800' :
                                                                        res.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                                                            'bg-orange-100 text-orange-800'
                                                                    }`}>
                                                                    {res.status === 'HostBlock' ? 'Blocked' : (res.status || 'Pending')}
                                                                </span>
                                                                <span className="text-stone-400 text-xs font-medium">Ref: {res.id.split('-')[0].toUpperCase()}</span>
                                                            </div>
                                                            <h3 className="font-bold text-xl text-stone-900 mb-2">
                                                                {res.properties?.name || 'Unknown Property'}
                                                            </h3>
                                                            <div className="flex items-center gap-3 text-sm text-stone-600">
                                                                <div className="flex items-center gap-1.5 bg-stone-50 px-2.5 py-1 rounded-lg">
                                                                    <Calendar className="w-4 h-4 text-emerald-600" />
                                                                    <span className="font-semibold text-stone-900">
                                                                        {new Date(res.check_in).toLocaleDateString('en-KE', { month: 'short', day: 'numeric' })} - {new Date(res.check_out).toLocaleDateString('en-KE', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="text-left md:text-right bg-stone-50 p-4 rounded-xl border border-stone-100 shrink-0">
                                                            {res.status === 'HostBlock' ? (
                                                                <>
                                                                    <p className="text-xs text-stone-500 font-bold uppercase tracking-wider mb-1">Availability</p>
                                                                    <p className="font-black text-xl text-stone-700">Unavailable</p>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <p className="text-xs text-stone-500 font-bold uppercase tracking-wider mb-1">Total Payout</p>
                                                                    <p className="font-black text-2xl text-emerald-700">KES {res.total_price?.toLocaleString() || '0'}</p>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="mt-auto flex flex-col sm:flex-row items-start sm:items-center justify-between border-t border-stone-100 pt-4 gap-4">
                                                        <div className="flex items-center gap-2 text-sm">
                                                            {res.status === 'HostBlock' ? (
                                                                <>
                                                                    <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-stone-600 font-bold shrink-0">
                                                                        <Lock className="w-4 h-4" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-semibold text-stone-900">Blocked by You</p>
                                                                        <p className="text-stone-500 text-xs">Manual block</p>
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold shrink-0">
                                                                        <User className="w-4 h-4" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-semibold text-stone-900">Guest User</p>
                                                                        <p className="text-stone-500 text-xs text-ellipsis overflow-hidden max-w-[150px] sm:max-w-xs whitespace-nowrap">ID: {res.user_id.split('-')[0]}</p>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2 w-full sm:w-auto">
                                                            {res.status === 'HostBlock' ? (
                                                                <button
                                                                    onClick={() => handleUpdateStatus(res.id, 'DeleteBlock')}
                                                                    disabled={actionLoading === res.id}
                                                                    className="flex-1 sm:flex-none px-4 py-2 text-sm font-bold border-2 border-stone-200 text-stone-700 hover:bg-stone-50 rounded-lg transition disabled:opacity-50"
                                                                >
                                                                    {actionLoading === res.id ? 'Loading...' : 'Unblock Dates'}
                                                                </button>
                                                            ) : (
                                                                <>
                                                                    {res.status !== 'Cancelled' && (
                                                                        <button
                                                                            onClick={() => handleUpdateStatus(res.id, 'Cancelled')}
                                                                            disabled={actionLoading === res.id}
                                                                            className="flex-1 sm:flex-none px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                                                                        >
                                                                            {actionLoading === res.id ? 'Loading...' : 'Cancel'}
                                                                        </button>
                                                                    )}
                                                                    {res.status !== 'Confirmed' && res.status !== 'Cancelled' && (
                                                                        <button
                                                                            onClick={() => handleUpdateStatus(res.id, 'Confirmed')}
                                                                            disabled={actionLoading === res.id}
                                                                            className="flex-1 sm:flex-none px-4 py-2 text-sm font-bold bg-stone-900 text-white hover:bg-stone-800 rounded-lg transition disabled:opacity-50"
                                                                        >
                                                                            {actionLoading === res.id ? 'Loading...' : 'Approve'}
                                                                        </button>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {reservations.filter(r => r.status === 'HostBlock').length > 0 && (
                                    <div className="space-y-4 pt-4 border-t border-stone-200">
                                        <h3 className="text-lg font-black text-stone-900 mb-4 flex items-center gap-2">
                                            <Lock className="w-5 h-5 text-stone-500" /> Blocked Dates
                                        </h3>
                                        {reservations.filter(r => r.status === 'HostBlock').map(res => (
                                            <div key={res.id} className="bg-stone-50 border border-stone-200 rounded-2xl p-5 flex flex-col md:flex-row gap-6 shadow-sm hover:shadow-md transition">
                                                <div className="flex-1 flex flex-col">
                                                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-stone-200 text-stone-600">
                                                                    Blocked
                                                                </span>
                                                            </div>
                                                            <h3 className="font-bold text-xl text-stone-900 mb-2">
                                                                {res.properties?.name || 'Unknown Property'}
                                                            </h3>
                                                            <div className="flex items-center gap-3 text-sm text-stone-600">
                                                                <div className="flex items-center gap-1.5 bg-white border border-stone-200 px-2.5 py-1 rounded-lg">
                                                                    <Calendar className="w-4 h-4 text-stone-500" />
                                                                    <span className="font-semibold text-stone-900">
                                                                        {new Date(res.check_in).toLocaleDateString('en-KE', { month: 'short', day: 'numeric' })} - {new Date(res.check_out).toLocaleDateString('en-KE', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="mt-auto flex flex-col sm:flex-row items-start sm:items-center justify-between border-t border-stone-200 pt-4 gap-4">
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-stone-600 font-bold shrink-0">
                                                                <Lock className="w-4 h-4" />
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-stone-900">Blocked by You</p>
                                                                <p className="text-stone-500 text-xs">Manual block</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 w-full sm:w-auto">
                                                            <button
                                                                onClick={() => handleUpdateStatus(res.id, 'DeleteBlock')}
                                                                disabled={actionLoading === res.id}
                                                                className="flex-1 sm:flex-none px-4 py-2 text-sm font-bold border-2 border-stone-300 text-stone-700 hover:bg-white rounded-lg transition disabled:opacity-50 bg-white shadow-sm"
                                                            >
                                                                {actionLoading === res.id ? 'Loading...' : 'Unblock Dates'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )
            }

            {/* Tab Content: Messages */}
            {
                activeTab === 'messages' && (
                    <>
                        {messages.length === 0 ? (
                            <div className="text-center py-20 bg-emerald-50 border border-emerald-100 rounded-3xl border-dashed">
                                <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <MessageSquare className="text-emerald-700 w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold text-stone-900 mb-2">No messages yet</h3>
                                <p className="text-stone-500 max-w-sm mx-auto">
                                    When guests contact you regarding your properties, their messages will appear here.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {messages.map(msg => (
                                    <div key={msg.id} className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
                                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-800 font-bold text-lg">
                                                    {msg.guest_name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-stone-900 text-lg">{msg.guest_name}</h3>
                                                    <div className="text-stone-500 text-sm flex items-center gap-1.5 flex-wrap mt-0.5">
                                                        <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded ">{msg.properties?.name || 'Property Inquiry'}</span>
                                                        <span>• {new Date(msg.created_at).toLocaleString('en-KE', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-stone-50 border border-stone-100 p-4 rounded-xl text-stone-700 whitespace-pre-wrap text-sm leading-relaxed tracking-wide shadow-inner">
                                            {msg.message}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )
            }

            {/* Add/Edit Property Modal */}
            {
                showFormModal && (
                    <PropertyFormModal
                        user={user}
                        editProperty={propertyToEdit}
                        showAlert={showAlert}
                        onClose={() => { setShowFormModal(false); setPropertyToEdit(null); }}
                        onSuccess={(updatedProp) => {
                            if (propertyToEdit) {
                                setMyProperties(prev => prev.map(p => p.id === updatedProp.id ? updatedProp : p));
                            } else {
                                setMyProperties([updatedProp, ...myProperties]);
                            }
                            setShowFormModal(false);
                            setPropertyToEdit(null);
                        }}
                    />
                )
            }

            {/* Block Dates Modal */}
            {
                showBlockDatesModal && propertyToBlock && (
                    <BlockDatesModal
                        property={propertyToBlock}
                        onClose={() => { setShowBlockDatesModal(false); setPropertyToBlock(null); }}
                        onSuccess={(newBlock) => {
                            setReservations(prev => [newBlock, ...prev]);
                            setShowBlockDatesModal(false);
                            setPropertyToBlock(null);
                            showAlert('Dates successfully blocked.', 'Success', 'success');
                        }}
                        showAlert={showAlert}
                    />
                )
            }

            <AlertModal
                {...alertConfig}
                onClose={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
            />
        </div >
    );
}

function PropertyFormModal({ user, editProperty, showAlert, onClose, onSuccess }) {
    const isEdit = !!editProperty;
    const [saving, setSaving] = useState(false);
    const [step, setStep] = useState(1);
    const [mainImageFile, setMainImageFile] = useState(null);
    const [galleryFiles, setGalleryFiles] = useState([]);

    // Form State
    const [form, setForm] = useState(() => {
        if (isEdit) {
            return {
                name: editProperty.name || '',
                type: editProperty.type || 'Apartment',
                price: editProperty.price || '',
                distance: editProperty.distance || '',
                description: editProperty.description || '',
                room_info: editProperty.room_info || '',
                guests: editProperty.guests || 2,
                bedrooms: editProperty.bedrooms || 1,
                bathrooms: editProperty.bathrooms || 1,
                total_rooms: editProperty.total_rooms || 1,
                features: editProperty.features || [],
                cancellation_policy: editProperty.cancellation_policy || 'Free cancellation',
                meal_plan: editProperty.meal_plan || 'Room only',
                payment_preference: editProperty.payment_preference || 'Pay at the property',
                coordinates: editProperty.latitude && editProperty.longitude
                    ? `${editProperty.latitude}, ${editProperty.longitude}`
                    : '-0.6167, 37.0000'
            };
        }
        return {
            name: '',
            type: 'Apartment',
            price: '',
            distance: '',
            description: '',
            room_info: '',
            guests: 2,
            bedrooms: 1,
            bathrooms: 1,
            total_rooms: 1,
            features: [],
            cancellation_policy: 'Free cancellation',
            meal_plan: 'Room only',
            payment_preference: 'Pay at the property',
            coordinates: '-0.6167, 37.0000'
        };
    });

    const ALL_FEATURES = AMENITIES;

    const handleInput = (e) => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
    };

    const toggleFeature = (feat) => {
        setForm(f => {
            if (f.features.includes(feat)) return { ...f, features: f.features.filter(x => x !== feat) };
            return { ...f, features: [...f.features, feat] };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            let mainImageUrl = '';
            let galleryUrls = [];

            // 1. Upload Main Image
            if (mainImageFile) {
                const ext = mainImageFile.name.split('.').pop();
                const path = `${user.id}/${Date.now()}_main.${ext}`;
                mainImageUrl = await api.uploadPropertyImage(mainImageFile, path);
            }

            // 2. Upload Gallery Images
            for (let i = 0; i < galleryFiles.length; i++) {
                const file = galleryFiles[i];
                const ext = file.name.split('.').pop();
                const path = `${user.id}/${Date.now()}_gal_${i}.${ext}`;
                const url = await api.uploadPropertyImage(file, path);
                galleryUrls.push(url);
            }

            // 3. Save Property Record
            // Parse coordinates
            let lat = 0, lng = 0;
            if (form.coordinates) {
                const parts = form.coordinates.split(',').map(s => s.trim());
                if (parts.length >= 2) {
                    lat = Number(parts[0]);
                    lng = Number(parts[1]);
                }
            }

            const payload = {
                ...form,
                price: Number(form.price),
                latitude: lat,
                longitude: lng
            };
            delete payload.coordinates; // Don't send this to DB

            // Only update images if they were newly selected
            if (mainImageFile) payload.image = mainImageUrl;
            if (galleryFiles.length > 0) payload.gallery = galleryUrls;

            let result;
            if (isEdit) {
                result = await api.updateProperty(editProperty.id, payload);
            } else {
                payload.host_id = user.id;
                payload.host_name = user.name;
                payload.host_joined = new Date().getFullYear().toString();
                payload.rating = 0;
                payload.reviews = 0;
                result = await api.createProperty(payload);
            }

            onSuccess(result);
        } catch (err) {
            console.error(isEdit ? "Failed to update property" : "Failed to create property", err);
            showAlert(isEdit
                ? "Failed to update property: " + (err.message || 'Check console')
                : "Failed to create property: " + (err.message || 'Check console')
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-stone-900/80 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b border-stone-100">
                    <h2 className="text-xl font-bold tracking-tight">{isEdit ? 'Edit Property' : 'Add New Property'}</h2>
                    <button onClick={onClose} disabled={saving} className="p-2 hover:bg-stone-100 rounded-full transition disabled:opacity-50">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 md:p-8">
                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div>
                                <label className="block text-sm font-bold text-stone-700 mb-2">Property Name</label>
                                <input required type="text" name="name" value={form.name} onChange={handleInput} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-emerald-500" placeholder="e.g. Sunny Mountain Villa" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-stone-700 mb-2">Property Type</label>
                                    <select name="type" value={form.type} onChange={handleInput} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-emerald-500">
                                        <option>Apartment</option>
                                        <option>Villa</option>
                                        <option>Cabin</option>
                                        <option>Camp</option>
                                        <option>Hotel</option>
                                        <option>Resort</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-stone-700 mb-2">Price per Night (KES)</label>
                                    <input required type="number" name="price" value={form.price} onChange={handleInput} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-emerald-500" placeholder="e.g. 5000" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-stone-700 mb-2">Location / Distance</label>
                                    <input required type="text" name="distance" value={form.distance} onChange={handleInput} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-emerald-500" placeholder="e.g. 2.5 km from Chaka center" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-stone-700 mb-2">Map Coordinates</label>
                                    <input required type="text" name="coordinates" value={form.coordinates} onChange={handleInput} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-emerald-500" placeholder="e.g. -0.352, 36.998" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-stone-700 mb-2">Description</label>
                                <textarea required name="description" value={form.description} onChange={handleInput} rows="3" className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-emerald-500" placeholder="Describe the atmosphere, surroundings, and experience..." />
                            </div>
                            <div className="flex justify-end pt-4">
                                <button type="button" onClick={() => setStep(2)} className="bg-stone-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-stone-800">Next Step</button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Max Guests</label>
                                    <input type="number" name="guests" value={form.guests} onChange={handleInput} className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Bedrooms</label>
                                    <input type="number" name="bedrooms" value={form.bedrooms} onChange={handleInput} className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Bathrooms</label>
                                    <input type="number" name="bathrooms" value={form.bathrooms} step="0.5" onChange={handleInput} className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Total Rooms</label>
                                    <input type="number" name="total_rooms" value={form.total_rooms} onChange={handleInput} className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-stone-700 mb-3">Amenities & Features</label>
                                <div className="grid grid-cols-2 shrink-0 gap-3">
                                    {ALL_FEATURES.map(feat => (
                                        <label key={feat} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={form.features.includes(feat)}
                                                onChange={() => toggleFeature(feat)}
                                                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                                            />
                                            <span className="text-sm font-medium text-stone-600">{feat}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-between pt-4 border-t border-stone-100">
                                <button type="button" onClick={() => setStep(1)} className="px-6 py-3 rounded-xl font-bold text-stone-500 border border-stone-200 hover:bg-stone-50">Back</button>
                                <button type="button" onClick={() => setStep(3)} className="bg-stone-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-stone-800">Next Step</button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div>
                                <label className="block text-sm font-bold text-stone-700 mb-2">Main Cover Image {isEdit ? '' : <span className="text-red-500">*</span>}</label>
                                <div className="border-2 border-dashed border-stone-300 rounded-2xl p-6 flex flex-col items-center justify-center bg-stone-50 hover:bg-stone-100 transition cursor-pointer relative overflow-hidden">
                                    <input required={!isEdit} type="file" accept="image/*" onChange={e => setMainImageFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    {mainImageFile ? (
                                        <p className="font-bold text-emerald-700 text-center">{mainImageFile.name}</p>
                                    ) : (
                                        <>
                                            <UploadCloud className="w-8 h-8 text-stone-400 mb-2" />
                                            <p className="text-sm font-medium text-stone-500">{isEdit ? '(Optional) Select new cover image' : 'Click to upload or drag and drop'}</p>
                                        </>
                                    )}
                                </div>
                                {isEdit && !mainImageFile && form.image && (
                                    <p className="text-xs text-stone-500 mt-2">Currently using existing image.</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-stone-700 mb-2">Additional Gallery Images (up to 4)</label>
                                <div className="border-2 border-dashed border-stone-300 rounded-2xl p-6 flex flex-col items-center justify-center bg-stone-50 hover:bg-stone-100 transition cursor-pointer relative overflow-hidden">
                                    <input type="file" multiple accept="image/*" onChange={e => setGalleryFiles([...e.target.files].slice(0, 4))} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    {galleryFiles.length > 0 ? (
                                        <p className="font-bold text-emerald-700 text-center">{galleryFiles.length} files selected</p>
                                    ) : (
                                        <>
                                            <UploadCloud className="w-8 h-8 text-stone-400 mb-2" />
                                            <p className="text-sm font-medium text-stone-500">Select multiple images</p>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-between pt-4 border-t border-stone-100">
                                <button type="button" disabled={saving} onClick={() => setStep(2)} className="px-6 py-3 rounded-xl font-bold text-stone-500 border border-stone-200 hover:bg-stone-50 disabled:opacity-50">Back</button>
                                <button type="submit" disabled={saving || (!isEdit && !mainImageFile)} className="bg-orange-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-700 disabled:opacity-50 flex items-center justify-center gap-2">
                                    {saving ? <><Loader className="w-5 h-5 animate-spin" /> Saving...</> : (isEdit ? 'Save Changes' : 'Publish Listing')}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

function BlockDatesModal({ property, onClose, onSuccess, showAlert }) {
    const [saving, setSaving] = useState(false);
    const [checkIn, setCheckIn] = useState(null);
    const [checkOut, setCheckOut] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (!checkIn || !checkOut) {
                showAlert('Please select both a start and end date.');
                setSaving(false);
                return;
            }

            const startDate = checkIn.toLocaleDateString('en-CA');
            const endDate = checkOut.toLocaleDateString('en-CA');

            const result = await api.blockPropertyDates(
                property.id,
                startDate,
                endDate
            );

            // Re-fetch or locally append property mock so `getBookingStatusForDay` works if properties join is expected by frontend.
            const newBlock = { ...result, properties: property };
            onSuccess(newBlock);
        } catch (err) {
            console.error('Failed to block dates:', err);
            showAlert('Failed to block dates. See console active.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-stone-900/80 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in fade-in duration-200">
                <div className="flex justify-between items-center p-6 border-b border-stone-100">
                    <h2 className="text-xl font-bold tracking-tight">Block Dates</h2>
                    <button onClick={onClose} disabled={saving} className="p-2 hover:bg-stone-100 rounded-full transition disabled:opacity-50">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6">
                    <p className="text-stone-500 mb-6 text-sm">
                        Select an exact date range to mark as unavailable for <strong>{property.name}</strong>. Guests won't be able to book during this period.
                    </p>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex justify-center">
                            <DatePicker
                                checkIn={checkIn}
                                checkOut={checkOut}
                                onChange={(ci, co) => {
                                    setCheckIn(ci);
                                    setCheckOut(co);
                                }}
                            />
                        </div>
                        <div className="flex justify-end pt-4 gap-3 border-t border-stone-100">
                            <button type="button" onClick={onClose} disabled={saving} className="px-6 py-3 rounded-xl font-bold text-stone-500 border border-stone-200 hover:bg-stone-50">Cancel</button>
                            <button type="submit" disabled={saving || !checkIn || !checkOut} className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-red-600/20 transition">
                                {saving ? <><Loader className="w-4 h-4 animate-spin" /> Saving...</> : 'Block Dates'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
