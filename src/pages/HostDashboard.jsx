import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Plus, Home, MapPin, UploadCloud, Loader, Star, X } from 'lucide-react';

export default function HostDashboard({ user, navigateTo }) {
    const [myProperties, setMyProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);

    useEffect(() => {
        if (!user) {
            navigateTo('home');
            return;
        }
        loadProperties();
    }, [user]);

    const loadProperties = async () => {
        try {
            const data = await api.getHostProperties(user.id);
            setMyProperties(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

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
                    <p className="text-stone-500 mt-1">Manage your properties and review bookings</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-emerald-800 transition shadow-lg shadow-emerald-700/20 w-full sm:w-auto justify-center"
                >
                    <Plus className="w-5 h-5" /> Add Property
                </button>
            </div>

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
                        onClick={() => setShowAddModal(true)}
                        className="bg-stone-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-stone-800 transition inline-flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" /> Create Listing
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myProperties.map(property => (
                        <div key={property.id} className="bg-white border flex flex-col border-stone-200 rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer" onClick={() => navigateTo('property', property.id)}>
                            <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
                                {property.image ? (
                                    <img src={property.image} alt={property.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center flex-col text-stone-400">
                                        <Home className="w-8 h-8 mb-2 opacity-50" />
                                        <span className="text-xs font-medium">No Image</span>
                                    </div>
                                )}
                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-2.5 py-1 rounded-full text-xs font-bold text-stone-900">
                                    {property.type}
                                </div>
                            </div>
                            <div className="p-5 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-lg leading-tight line-clamp-1 group-hover:text-emerald-700 transition-colors">
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
                                <div className="mt-auto pt-4 border-t border-stone-100 flex items-end justify-between">
                                    <div className="font-black text-emerald-900 text-lg">
                                        KES {property.price.toLocaleString()}
                                        <span className="text-xs font-medium text-stone-500 ml-1">/ night</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Property Modal */}
            {showAddModal && (
                <AddPropertyModal
                    user={user}
                    onClose={() => setShowAddModal(false)}
                    onSuccess={(newProp) => {
                        setMyProperties([newProp, ...myProperties]);
                        setShowAddModal(false);
                    }}
                />
            )}
        </div>
    );
}

function AddPropertyModal({ user, onClose, onSuccess }) {
    const [saving, setSaving] = useState(false);
    const [step, setStep] = useState(1);
    const [mainImageFile, setMainImageFile] = useState(null);
    const [galleryFiles, setGalleryFiles] = useState([]);

    // Form State
    const [form, setForm] = useState({
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
        payment_preference: 'Pay at the property'
    });

    const ALL_FEATURES = ['Free WiFi', 'Free parking', 'Restaurant', 'Kitchen', 'Pool', 'Gym', 'Air conditioning', 'BBQ facilities', 'Pet friendly', 'Washing machine'];

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
            const payload = {
                ...form,
                host_id: user.id,
                host_name: user.name,
                host_joined: new Date().getFullYear().toString(),
                price: Number(form.price),
                rating: 0, // new properties start at 0
                reviews: 0,
                image: mainImageUrl,
                gallery: galleryUrls
            };

            const created = await api.createProperty(payload);
            onSuccess(created);
        } catch (err) {
            console.error("Failed to create property", err);
            alert("Failed to create property. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-stone-900/80 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b border-stone-100">
                    <h2 className="text-xl font-bold tracking-tight">Add New Property</h2>
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
                            <div>
                                <label className="block text-sm font-bold text-stone-700 mb-2">Location / Distance</label>
                                <input required type="text" name="distance" value={form.distance} onChange={handleInput} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-emerald-500" placeholder="e.g. 2.5 km from Chaka center" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-stone-700 mb-2">Description</label>
                                <textarea required name="description" value={form.description} onChange={handleInput} rows="4" className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-emerald-500" placeholder="Describe the atmosphere, surroundings, and experience..." />
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
                                <label className="block text-sm font-bold text-stone-700 mb-2">Main Cover Image <span className="text-red-500">*</span></label>
                                <div className="border-2 border-dashed border-stone-300 rounded-2xl p-6 flex flex-col items-center justify-center bg-stone-50 hover:bg-stone-100 transition cursor-pointer relative overflow-hidden">
                                    <input required type="file" accept="image/*" onChange={e => setMainImageFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    {mainImageFile ? (
                                        <p className="font-bold text-emerald-700 text-center">{mainImageFile.name}</p>
                                    ) : (
                                        <>
                                            <UploadCloud className="w-8 h-8 text-stone-400 mb-2" />
                                            <p className="text-sm font-medium text-stone-500">Click to upload or drag and drop</p>
                                        </>
                                    )}
                                </div>
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
                                <button type="submit" disabled={saving || !mainImageFile} className="bg-orange-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-700 disabled:opacity-50 flex items-center justify-center gap-2">
                                    {saving ? <><Loader className="w-5 h-5 animate-spin" /> Uploading...</> : 'Publish Listing'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
