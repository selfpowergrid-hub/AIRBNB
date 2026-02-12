
import React from 'react';
import Image from 'next/image';
import { Wifi, Tv, Coffee, Users, Shield, Briefcase } from 'lucide-react';


interface Props {
    onOpenBooking?: (roomId?: string) => void;
}

const AccommodationSection = ({ onOpenBooking }: Props) => {
    return (
        <section id="accommodation" className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Tailored for Every Traveler</h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Whether you're a corporate guest needing efficiency or a family requiring space, we have the perfect unit.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                    {/* Efficiency Studio Card */}
                    <div className="bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 group">
                        <div className="relative h-64 overflow-hidden">
                            <Image
                                src="/assets/studio-suite.png"
                                alt="Efficiency Studio"
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute top-4 left-4 bg-brand-teal text-white px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-md">
                                Best for Business
                            </div>
                        </div>
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-1">Efficiency Studio</h3>
                                    <p className="text-gray-500">7 Self-Contained Studio Houses</p>
                                </div>
                                <div className="bg-gray-100 p-2 rounded-lg">
                                    <Briefcase size={24} className="text-brand-teal" />
                                </div>
                            </div>

                            <ul className="space-y-3 mb-8">
                                <li className="flex items-center gap-3 text-gray-700">
                                    <Wifi size={18} className="text-brand-teal" /> High-Speed Wi-Fi Workstation
                                </li>
                                <li className="flex items-center gap-3 text-gray-700">
                                    <Tv size={18} className="text-brand-teal" /> Smart TV & Stream Ready
                                </li>
                                <li className="flex items-center gap-3 text-gray-700">
                                    <Coffee size={18} className="text-brand-teal" /> Kitchenette & Coffee Bar
                                </li>
                            </ul>

                            <button
                                onClick={() => onOpenBooking?.()}
                                className="w-full py-3 border-2 border-brand-teal text-brand-teal font-bold rounded-xl hover:bg-brand-teal hover:text-white transition-colors"
                            >
                                Check Availability
                            </button>
                        </div>
                    </div>

                    {/* Executive Villa Card */}
                    <div className="bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 group">
                        <div className="relative h-64 overflow-hidden">
                            <Image
                                src="/assets/villa-sitting-family.jpg"
                                alt="5-Bedroom Executive Villa"
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute top-4 left-4 bg-brand-dark text-white px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-md">
                                Best for Groups
                            </div>
                        </div>
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-1">Executive Villa</h3>
                                    <p className="text-gray-500">5-Bedroom Residential Unit</p>
                                </div>
                                <div className="bg-gray-100 p-2 rounded-lg">
                                    <Users size={24} className="text-brand-dark" />
                                </div>
                            </div>

                            <ul className="space-y-3 mb-8">
                                <li className="flex items-center gap-3 text-gray-700">
                                    <Users size={18} className="text-brand-teal" /> Ideal for Diaspora Families
                                </li>
                                <li className="flex items-center gap-3 text-gray-700">
                                    <Shield size={18} className="text-brand-teal" /> Private Compound & Security
                                </li>
                                <li className="flex items-center gap-3 text-gray-700">
                                    <Briefcase size={18} className="text-brand-teal" /> Perfect for Athletic Teams
                                </li>
                            </ul>

                            <button
                                onClick={() => onOpenBooking?.()}
                                className="w-full py-3 border-2 border-brand-dark text-brand-dark font-bold rounded-xl hover:bg-brand-dark hover:text-white transition-colors"
                            >
                                Book Executive Villa
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AccommodationSection;
