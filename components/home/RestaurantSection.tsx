"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Utensils, Music, CircleDot, Maximize2 } from "lucide-react";
import ImageGallery from "@/components/features/ImageGallery";

export default function RestaurantSection() {
    const [galleryOpen, setGalleryOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const loungeImages = [
        "/assets/Lounge/DSC_2797 (1).jpg",
        "/assets/Lounge/DSC_2904.jpg",
        "/assets/Lounge/DSC_2908.jpg"
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % loungeImages.length);
        }, 4000);

        return () => clearInterval(interval);
    }, [loungeImages.length]);

    return (
        <section id="lounge" className="py-24 bg-brand-light relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    
                    {/* Content Side */}
                    <div className="space-y-8 order-2 lg:order-1 relative z-10">
                        <div className="inline-flex items-center gap-2 bg-brand-teal/10 text-brand-teal px-4 py-1.5 rounded-full font-semibold">
                            <Utensils size={18} />
                            <span>Eat, Play, Relax</span>
                        </div>

                        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
                            The Port Hill <br />
                            <span className="text-brand-teal">Lounge Area</span>
                        </h2>

                        <p className="text-gray-600 text-lg leading-relaxed">
                            Looking to unwind after a long flight, or seeking a vibrant spot while waiting? Our Lounge Area offers the perfect mix of delicious dining, engaging entertainment, and a thoroughly relaxing atmosphere.
                        </p>

                        <div className="space-y-6 pt-4">
                            <div className="flex gap-4 items-start">
                                <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0 border border-gray-100">
                                    <Utensils className="text-brand-teal" size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-xl">Restaurant & Dining</h3>
                                    <p className="text-gray-600 text-sm mt-1">Enjoy a hearty meal or a quick bite from our diverse menu, freshly prepared for our guests.</p>
                                </div>
                            </div>

                            <div className="flex gap-4 items-start">
                                <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0 border border-gray-100">
                                    <CircleDot className="text-brand-teal" size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-xl">Pool & Games</h3>
                                    <p className="text-gray-600 text-sm mt-1">Challenge friends or fellow travelers to a game of pool in our dedicated entertainment space.</p>
                                </div>
                            </div>

                            <div className="flex gap-4 items-start">
                                <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0 border border-gray-100">
                                    <Music className="text-brand-teal" size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-xl">Cool Music & Vibe</h3>
                                    <p className="text-gray-600 text-sm mt-1">Sink into comfort with expertly curated playlists creating a smooth, relaxing ambiance.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Image Carousel Side */}
                    <div 
                        className="relative h-[600px] rounded-3xl overflow-hidden shadow-2xl order-1 lg:order-2 group bg-black cursor-pointer group/img"
                        onClick={() => setGalleryOpen(true)}
                    >
                        {loungeImages.map((src, index) => (
                            <div
                                key={src}
                                className={`absolute inset-0 transition-opacity duration-[1500ms] ease-in-out ${
                                    index === currentImageIndex ? "opacity-100" : "opacity-0"
                                }`}
                            >
                                <Image
                                    src={src}
                                    alt="Port Hill Lounge Area"
                                    fill
                                    className="object-cover animate-ken-burns"
                                    priority={index === 0}
                                />
                            </div>
                        ))}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
                        
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center z-20">
                            <div className="bg-white/20 backdrop-blur-md p-4 rounded-full text-white">
                                <Maximize2 size={32} />
                            </div>
                        </div>

                        {/* Decorative floating card */}
                        <div className="absolute bottom-8 left-8 right-8 bg-white/95 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20 transform translate-y-2 opacity-0 group-hover/img:translate-y-0 group-hover/img:opacity-100 transition-all duration-500 z-30">
                            <p className="text-gray-900 font-bold text-lg text-center flex items-center justify-center gap-2">
                                <Music size={20} className="text-brand-teal animate-bounce" /> Your Perfect Layover Vibe
                            </p>
                        </div>
                    </div>

                </div>
            </div>
            
            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 -mt-32 -mr-32 w-96 h-96 bg-brand-teal/5 rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-0 left-0 -mb-32 -ml-32 w-96 h-96 bg-brand-accent/5 rounded-full blur-3xl -z-10" />
            
            {/* Gallery Modal */}
            <ImageGallery
                images={loungeImages}
                isOpen={galleryOpen}
                onClose={() => setGalleryOpen(false)}
                title="Lounge Area"
                initialIndex={currentImageIndex}
            />
        </section>
    );
}
