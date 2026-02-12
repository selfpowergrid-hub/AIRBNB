
import React from 'react';
import Image from 'next/image';
import { ShieldCheck, Map, Clock, Video } from 'lucide-react';

const ParkAndFlySection = () => {
    return (
        <section id="park-fly" className="py-20 bg-brand-dark text-white relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-teal/5 lg:bg-brand-teal/10 skew-x-12 transform translate-x-20" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-8">
                        <div className="inline-block bg-brand-teal/20 text-brand-teal px-4 py-1.5 rounded-full font-semibold border border-brand-teal/30">
                            The "Park-and-Fly" Hub
                        </div>

                        <h2 className="text-4xl md:text-5xl font-extrabold leading-tight">
                            Secure Parking.<br />
                            <span className="text-brand-teal">Peace of Mind.</span>
                        </h2>

                        <p className="text-gray-400 text-lg">
                            Don't leave your car unsecured. Enjoy our "ample packing space" with 24/7 manned security, CCTV surveillance, and dedicated spots for transit travelers.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                            <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                                <ShieldCheck className="text-brand-teal shrink-0" size={32} />
                                <div>
                                    <h4 className="font-bold text-lg">24/7 Security</h4>
                                    <p className="text-sm text-gray-400">Guarded gate and perimeter surveillance.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                                <Clock className="text-brand-teal shrink-0" size={32} />
                                <div>
                                    <h4 className="font-bold text-lg">Instant Transfer</h4>
                                    <p className="text-sm text-gray-400">3-minute shuttle or walk to the terminal.</p>
                                </div>
                            </div>
                        </div>

                        <button className="bg-brand-teal hover:bg-teal-600 text-white px-8 py-4 rounded-full font-bold transition-all shadow-lg hover:shadow-brand-teal/50">
                            Reserve Parking Slot
                        </button>
                    </div>

                    <div className="relative">
                        <div className="aspect-square rounded-full border-2 border-brand-teal/30 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] animate-pulse opacity-20" />
                        <div className="bg-gradient-to-br from-gray-800 to-black p-2 rounded-3xl shadow-2xl relative">
                            {/* Placeholder for a map or parking image */}
                            <div className="bg-gray-700 h-96 rounded-2xl flex items-center justify-center relative overflow-hidden group">
                                <Image
                                    src="/assets/secure-parking.png"
                                    alt="Secure Parking Lot"
                                    fill
                                    className="object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                                />

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ParkAndFlySection;
