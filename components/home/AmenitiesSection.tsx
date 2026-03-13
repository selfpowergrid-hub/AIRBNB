
import React from 'react';
import {
    Wifi,
    ShieldCheck,
    Car,
    Tv,
    Coffee,
    Utensils,
    Briefcase,
    Video,
    Wind, // For AC/Fan equivalent (Airy)
    MapPin,
    ArrowRight,
    Clock,
    Star
} from 'lucide-react';

const amenities = [
    {
        category: "Internet & Office",
        items: [
            { icon: Wifi, label: "Fast & Stable Wi-Fi (Fiber)" },
            { icon: Briefcase, label: "Dedicated Workspace" }
        ]
    },
    {
        category: "Security & Safety",
        items: [
            { icon: ShieldCheck, label: "24/7 Manned Gate Security" },
            { icon: Video, label: "CCTV Surveillance" },
            { icon: Car, label: "Secure Free Parking" }
        ]
    },
    {
        category: "Room & Comfort",
        items: [
            { icon: Tv, label: "Smart TV with Netflix/YouTube" },
            { icon: Wind, label: "Cool & Airy Pot Hill Breeze" },
            { icon: MapPin, label: "Private Entrance" }
        ]
    },
    {
        category: "Kitchen & Dining",
        items: [
            { icon: Coffee, label: "Coffee Maker & Kettle" },
            { icon: Utensils, label: "Fully Equipped Kitchenette" } // Assuming for studios/villa
        ]
    }
];

const AmenitiesSection = () => {
    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-start gap-12">

                    {/* Header */}
                    <div className="md:w-1/3 space-y-4">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">
                            What this place offers
                        </h2>
                        <p className="text-lg text-gray-500">
                            Everything you need for a productive business trip or a relaxing family getaway.
                        </p>
                    </div>

                    {/* Grid */}
                    <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-y-10 gap-x-8">
                        {amenities.map((category, idx) => (
                            <div key={idx} className="space-y-4">
                                <h3 className="font-bold text-gray-900 text-lg border-b border-gray-100 pb-2 mb-4">
                                    {category.category}
                                </h3>
                                <ul className="space-y-4">
                                    {category.items.map((item, itemIdx) => (
                                        <li key={itemIdx} className="flex items-center gap-4 text-gray-700">
                                            <item.icon size={24} className="text-gray-500 shrink-0" />
                                            <span className="text-base">{item.label}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                </div>

                <div className="mt-16 text-center md:text-left border-t border-gray-100 pt-8">
                    <p className="text-gray-500 text-sm mb-4">
                        * Some amenities may vary by unit type (Studio vs Villa).
                    </p>
                    <button className="inline-flex items-center justify-center px-6 py-3 border border-gray-900 rounded-lg text-gray-900 font-semibold hover:bg-gray-50 transition-colors">
                        Show all 30+ amenities <ArrowRight size={18} className="ml-2" />
                    </button>
                    <p className="text-xs text-brand-teal mt-2">
                        (Functionality coming soon)
                    </p>
                </div>

                {/* Policies & Offers */}
                <div className="mt-16 border-t border-gray-100 pt-16">
                    <div className="bg-gray-50 rounded-2xl p-8 md:p-12 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-teal/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Policies & Special Offers</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                            <div className="space-y-4">
                                <h3 className="font-semibold text-lg text-brand-teal flex items-center gap-2">
                                    <Clock size={20} /> Check-in & Check-out
                                </h3>
                                <ul className="space-y-3 text-gray-700">
                                    <li><strong>Check-in:</strong> Any time.</li>
                                    <li><strong>Check-out:</strong> By 11:00 AM. <br />
                                        <span className="text-sm text-gray-500 italic">Can be extended based on circumstance (To be discussed with receptionist).</span>
                                    </li>
                                </ul>
                            </div>
                            <div className="space-y-4">
                                <h3 className="font-semibold text-lg text-brand-teal flex items-center gap-2">
                                    <Star size={20} /> Frequent Clients
                                </h3>
                                <p className="text-gray-700">
                                    We value our returning guests. <strong>There is always more for a recent or frequent client.</strong> Let us know you've stayed with us before for special considerations!
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AmenitiesSection;
