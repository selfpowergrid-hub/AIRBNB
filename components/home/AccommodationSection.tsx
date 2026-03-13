import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Wifi, Tv, Coffee, Users, Shield, Briefcase, Maximize2 } from 'lucide-react';
import ImageGallery from '@/components/features/ImageGallery';


interface Props {
    onOpenBooking?: (roomId?: string) => void;
}

const AccommodationSection = ({ onOpenBooking }: Props) => {
    const [execIndex, setExecIndex] = useState(0);
    const [studioIndex, setStudioIndex] = useState(0);
    
    // Gallery State
    const [galleryOpen, setGalleryOpen] = useState(false);
    const [galleryImages, setGalleryImages] = useState<string[]>([]);
    const [galleryTitle, setGalleryTitle] = useState("");
    const [galleryStartIndex, setGalleryStartIndex] = useState(0);

    const openGallery = (images: string[], title: string, startIndex: number) => {
        setGalleryImages(images);
        setGalleryTitle(title);
        setGalleryStartIndex(startIndex);
        setGalleryOpen(true);
    };

    const studioImages = [
        "/assets/Studio/_DSC9478.jpg",
        "/assets/Studio/_DSC9559.jpg",
        "/assets/Studio/_DSC9567.jpg",
        "/assets/Studio/DSC_2721.jpg",
        "/assets/Studio/DSC_2725.jpg",
        "/assets/Studio/DSC_2734.jpg",
        "/assets/Studio/DSC_2835.jpg"
    ];

    const executiveImages = [
        "/assets/Executive/DSC_2691.jpg",
        "/assets/Executive/DSC_2697.jpg",
        "/assets/Executive/DSC_2707.jpg",
        "/assets/Executive/DSC_2720.jpg",
        "/assets/Executive/DSC_2734.jpg",
        "/assets/Executive/DSC_2737.jpg",
        "/assets/Executive/DSC_2739.jpg",
        "/assets/Executive/DSC_2740.jpg",
        "/assets/Executive/DSC_2821.jpg",
        "/assets/Executive/DSC_2865.jpg"
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setExecIndex((prev) => (prev + 1) % executiveImages.length);
            setStudioIndex((prev) => (prev + 1) % studioImages.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [executiveImages.length, studioImages.length]);

    return (
        <section id="accommodation" className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Tailored for Every Traveler</h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-2">
                        Very nice, sizeable and clean rooms. Whether you're a corporate guest needing efficiency or a family requiring space, we have the perfect unit.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                    {/* Efficiency Studio Card */}
                    <div className="bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 group">
                        <div 
                            className="relative h-64 overflow-hidden bg-black/5 cursor-pointer group/img"
                            onClick={() => openGallery(studioImages, "Efficiency Studio", studioIndex)}
                        >
                            {studioImages.map((src, index) => (
                                <div
                                    key={src}
                                    className={`absolute inset-0 transition-opacity duration-[1500ms] ease-in-out ${
                                        index === studioIndex ? "opacity-100" : "opacity-0"
                                    }`}
                                >
                                    <Image
                                        src={src}
                                        alt="Efficiency Studio"
                                        fill
                                        className="object-cover animate-ken-burns"
                                        priority={index === 0}
                                    />
                                </div>
                            ))}
                            <div className="absolute top-4 left-4 bg-brand-teal text-white px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-md z-10">
                                Best for Business
                            </div>
                            
                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center z-20">
                                <div className="bg-white/20 backdrop-blur-md p-3 rounded-full text-white">
                                    <Maximize2 size={24} />
                                </div>
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
                                <li className="flex gap-3 text-gray-700 items-start">
                                    <Coffee size={18} className="text-brand-teal mt-1 flex-shrink-0" />
                                    <div>
                                        <p className="font-semibold text-brand-dark">Overnight Stay: KES 2,500</p>
                                        <p className="text-sm text-gray-500">Includes breakfast</p>
                                    </div>
                                </li>
                                <li className="flex gap-3 text-gray-700 items-start">
                                    <Briefcase size={18} className="text-brand-teal mt-1 flex-shrink-0" />
                                    <div>
                                        <p className="font-semibold text-brand-dark">Day Room / Short Stay: KES 1,500</p>
                                        <p className="text-sm text-gray-500">Perfect for refreshing between flights</p>
                                    </div>
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
                        <div 
                            className="relative h-64 overflow-hidden bg-black/5 cursor-pointer group/img"
                            onClick={() => openGallery(executiveImages, "Executive Airbnb", execIndex)}
                        >
                            {executiveImages.map((src, index) => (
                                <div
                                    key={src}
                                    className={`absolute inset-0 transition-opacity duration-[1500ms] ease-in-out ${
                                        index === execIndex ? "opacity-100" : "opacity-0"
                                    }`}
                                >
                                    <Image
                                        src={src}
                                        alt="5-Bedroom Executive Villa"
                                        fill
                                        className="object-cover animate-ken-burns"
                                        priority={index === 0}
                                    />
                                </div>
                            ))}
                            <div className="absolute top-4 left-4 bg-brand-dark text-white px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-md z-10">
                                Best for Groups
                            </div>

                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center z-20">
                                <div className="bg-white/20 backdrop-blur-md p-3 rounded-full text-white">
                                    <Maximize2 size={24} />
                                </div>
                            </div>
                        </div>
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-1">Executive Airbnb</h3>
                                    <p className="text-gray-500">4-Bedroom Residential Unit</p>
                                </div>
                                <div className="bg-gray-100 p-2 rounded-lg">
                                    <Users size={24} className="text-brand-dark" />
                                </div>
                            </div>

                            <ul className="space-y-3 mb-8">
                                <li className="flex items-center gap-3 text-gray-700">
                                    <Users size={18} className="text-brand-teal" /> Exact Pricing: <strong className="ml-1 text-brand-dark">KES 6,000 / Night</strong>
                                </li>
                                <li className="flex items-center gap-3 text-gray-700">
                                    <Shield size={18} className="text-brand-teal" /> Private Compound & Security
                                </li>
                                <li className="flex items-center gap-3 text-gray-700">
                                    <Briefcase size={18} className="text-brand-teal" /> Ideal for families and groups
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

            {/* Gallery Modal */}
            <ImageGallery
                images={galleryImages}
                isOpen={galleryOpen}
                onClose={() => setGalleryOpen(false)}
                title={galleryTitle}
                initialIndex={galleryStartIndex}
            />
        </section>
    );
};

export default AccommodationSection;
