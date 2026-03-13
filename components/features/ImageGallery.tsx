"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";

interface ImageGalleryProps {
    images: string[];
    initialIndex?: number;
    isOpen: boolean;
    onClose: () => void;
    title: string;
}

export default function ImageGallery({ images, initialIndex = 0, isOpen, onClose, title }: ImageGalleryProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    useEffect(() => {
        if (isOpen) {
            setCurrentIndex(initialIndex);
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen, initialIndex]);

    const handlePrevious = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    }, [images.length]);

    const handleNext = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
    }, [images.length]);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
        if (e.key === "ArrowLeft") handlePrevious();
        if (e.key === "ArrowRight") handleNext();
    }, [onClose, handlePrevious, handleNext]);

    useEffect(() => {
        if (isOpen) {
            window.addEventListener("keydown", handleKeyDown);
        }
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, handleKeyDown]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 md:p-8 animate-in fade-in duration-300">
            {/* Close Button */}
            <button 
                onClick={onClose}
                className="absolute top-6 right-6 z-[110] text-white/70 hover:text-white transition-colors bg-white/10 p-2 rounded-full backdrop-blur-md"
            >
                <X size={28} />
            </button>

            {/* Title & Counter */}
            <div className="absolute top-6 left-6 z-[110] text-white">
                <h3 className="text-xl font-bold">{title}</h3>
                <p className="text-sm text-white/50">Image {currentIndex + 1} of {images.length}</p>
            </div>

            {/* Navigation Buttons */}
            <button 
                onClick={handlePrevious}
                className="absolute left-4 md:left-8 z-[110] text-white/70 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-3 md:p-4 rounded-full backdrop-blur-md"
            >
                <ChevronLeft size={32} />
            </button>

            <button 
                onClick={handleNext}
                className="absolute right-4 md:right-8 z-[110] text-white/70 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-3 md:p-4 rounded-full backdrop-blur-md"
            >
                <ChevronRight size={32} />
            </button>

            {/* Main Image Container */}
            <div className="relative w-full max-w-6xl h-full flex items-center justify-center pointer-events-none">
                <div className="relative w-full h-[70vh] md:h-full transition-transform duration-500 pointer-events-auto">
                    <Image
                        src={images[currentIndex]}
                        alt={`${title} - Image ${currentIndex + 1}`}
                        fill
                        className="object-contain"
                        priority
                    />
                </div>
            </div>

            {/* Thumbnails Strip (Optional but nice) */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[110] flex gap-2 max-w-[90vw] overflow-x-auto pb-2 scrollbar-hide">
                {images.map((src, index) => (
                    <button
                        key={src}
                        onClick={() => setCurrentIndex(index)}
                        className={`relative w-16 h-12 rounded-lg overflow-hidden shrink-0 transition-all duration-300 border-2 ${
                            index === currentIndex ? "border-brand-teal scale-110" : "border-transparent opacity-50 hover:opacity-100"
                        }`}
                    >
                        <Image src={src} alt="Thumbnail" fill className="object-cover" />
                    </button>
                ))}
            </div>
        </div>
    );
}
