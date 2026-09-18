

"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import Footer from "@/components/layout/Footer";
import AccommodationSection from "@/components/home/AccommodationSection";
import RestaurantSection from "@/components/home/RestaurantSection";
import AmenitiesSection from "@/components/home/AmenitiesSection";
import ParkAndFlySection from "@/components/home/ParkAndFlySection";
import { ArrowRight, Plane, ShieldCheck, Clock, MapPin } from "lucide-react";

// Dynamically import heavy components
const BookingModal = dynamic(() => import("@/components/features/BookingModal"), {
  ssr: false,
});

const WhatsAppWidget = dynamic(() => import("@/components/features/WhatsAppWidget"), {
  ssr: false,
});

export default function Home() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string | undefined>(undefined);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Ensure page starts at the top on load
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  const heroImages = [
    "/assets/Hero/DSC_2681.jpg",
    "/assets/Hero/DSC_2695.jpg",
    "/assets/Hero/DSC_2797 (1).jpg",
    "/assets/Hero/DSC_2860.jpg",
    "/assets/Hero/_DSC9585 (1).jpg",
    "/assets/Hero/porthill-welcome.png"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [heroImages.length]);

  const handleOpenBooking = (roomId?: string) => {
    setSelectedRoomId(roomId);
    setIsBookingOpen(true);
  };

  return (
    <>
      <WhatsAppWidget />
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        initialRoomId={selectedRoomId}
      />

      {/* Hero Section */}
      <section className="relative h-[85vh] w-full flex items-center justify-center overflow-hidden">
        {/* Background Image Carousel */}
        <div className="absolute inset-0 z-0 bg-black">
          {heroImages.map((src, index) => (
            <div
              key={src}
              className={`absolute inset-0 transition-opacity duration-[1500ms] ease-in-out ${
                index === currentImageIndex ? "opacity-100" : "opacity-0"
              }`}
            >
              <Image
                src={src}
                alt="Port Hill Guest House Welcome"
                fill
                className="object-cover object-center brightness-50 animate-ken-burns"
                priority={index === 0}
              />
            </div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/90 via-transparent to-black/30" />
        </div>

        <div className="relative z-10 text-center max-w-4xl px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="inline-flex items-center gap-2 bg-brand-teal/90 text-white px-4 py-1.5 rounded-full text-sm font-semibold mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Plane size={16} className="animate-pulse" />
            <span>3 mins from Eldoret International Airport • 100 meters off tarmac</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Home Away From Home <br /> <span className="text-brand-teal">Where Comfort Meets Convenience</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto">
            Premium efficiency studios, an executive Airbnb, a vibrant <strong>Lounge Area</strong>, and ample secure parking. Perfectly positioned just <strong>3 minutes from the gates of Eldoret International Airport</strong>, and a mere 100 meters off the tarmac.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <button
              onClick={() => handleOpenBooking()}
              className="bg-brand-teal hover:bg-teal-600 text-white text-lg px-8 py-3 rounded-full font-bold transition-all shadow-lg hover:shadow-brand-teal/50 flex items-center justify-center gap-2"
            >
              Check Availability <ArrowRight size={20} />
            </button>
            <a href="#park-fly" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white text-lg px-8 py-3 rounded-full font-bold transition-all flex items-center justify-center gap-2">
              Secure Parking Info
            </a>
          </div>
        </div>
      </section>

      {/* Answer Section: The 3 Questions */}
      <section className="relative -mt-20 z-20 max-w-6xl mx-4 lg:mx-auto grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
        <div className="group relative flex flex-col items-center text-center bg-white rounded-2xl p-8 shadow-lg ring-1 ring-gray-900/5 overflow-hidden transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-2xl hover:shadow-brand-teal/10 hover:ring-brand-teal/30">
          <span aria-hidden className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-teal to-teal-400 origin-left scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-100" />
          <div className="relative w-16 h-16 mb-5 rounded-2xl bg-brand-teal/10 flex items-center justify-center transition-all duration-300 ease-out group-hover:bg-brand-teal group-hover:scale-110 group-hover:-rotate-6 group-hover:shadow-lg group-hover:shadow-brand-teal/40">
            <MapPin size={28} className="text-brand-teal transition-colors duration-300 group-hover:text-white" />
          </div>
          <h3 className="font-bold text-gray-900 text-xl mb-2 transition-colors duration-300 group-hover:text-brand-teal">Where are we?</h3>
          <p className="text-gray-600 text-base leading-relaxed">We are on the airport road, just <strong className="text-brand-teal">3 minutes</strong> from the main gate and <strong className="text-brand-teal">100 meters</strong> off the tarmac. Rest with us and be at check-in within minutes.</p>
        </div>

        <div className="group relative flex flex-col items-center text-center bg-white rounded-2xl p-8 shadow-lg ring-1 ring-gray-900/5 overflow-hidden transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-2xl hover:shadow-brand-teal/10 hover:ring-brand-teal/30">
          <span aria-hidden className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-teal to-teal-400 origin-left scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-100" />
          <div className="relative w-16 h-16 mb-5 rounded-2xl bg-brand-teal/10 flex items-center justify-center transition-all duration-300 ease-out group-hover:bg-brand-teal group-hover:scale-110 group-hover:-rotate-6 group-hover:shadow-lg group-hover:shadow-brand-teal/40">
            <ShieldCheck size={28} className="text-brand-teal transition-colors duration-300 group-hover:text-white" />
          </div>
          <h3 className="font-bold text-gray-900 text-xl mb-2 transition-colors duration-300 group-hover:text-brand-teal">Why choose us?</h3>
          <p className="text-gray-600 text-base leading-relaxed">Whether you are waiting out a delayed flight, refreshing before or after travel, avoiding an early start from Eldoret town, or seeing loved ones off, we are built around the airport schedule. <strong className="text-brand-teal">24/7 Security</strong>.</p>
        </div>

        <button
          type="button"
          onClick={() => handleOpenBooking()}
          aria-label="Open the booking form"
          className="group relative flex flex-col items-center text-center bg-white rounded-2xl p-8 shadow-lg ring-1 ring-gray-900/5 overflow-hidden transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-2xl hover:shadow-brand-teal/10 hover:ring-brand-teal/30 cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal focus-visible:ring-offset-2"
        >
          <span aria-hidden className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-teal to-teal-400 origin-left scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-100" />
          <div className="relative w-16 h-16 mb-5 rounded-2xl bg-brand-teal/10 flex items-center justify-center transition-all duration-300 ease-out group-hover:bg-brand-teal group-hover:scale-110 group-hover:-rotate-6 group-hover:shadow-lg group-hover:shadow-brand-teal/40">
            <Clock size={28} className="text-brand-teal transition-colors duration-300 group-hover:text-white" />
          </div>
          <h3 className="font-bold text-gray-900 text-xl mb-2 transition-colors duration-300 group-hover:text-brand-teal">How to book</h3>
          <p className="text-gray-600 text-base leading-relaxed">Book online for instant confirmation, or call <strong className="text-brand-teal">0757717616</strong>. <strong className="text-brand-teal">M-Pesa</strong> accepted.</p>
          <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-brand-teal transition-all duration-300 group-hover:gap-3">
            Check availability <ArrowRight size={16} />
          </span>
        </button>
      </section>

      <AccommodationSection onOpenBooking={handleOpenBooking} />

      <RestaurantSection />

      <AmenitiesSection />

      <ParkAndFlySection />

      {/* Final CTA */}
      <section className="py-20 bg-brand-teal text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-4xl font-bold mb-6">Ready to Experience Port Hill?</h2>
          <p className="text-xl mb-8 opacity-90">Secure your stay or parking spot today and travel with zero stress.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:0757717616" className="bg-white text-brand-teal px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors">
              Call 0757717616
            </a>
            <button
              onClick={() => handleOpenBooking()}
              className="bg-brand-dark hover:bg-black border border-white/30 text-white px-8 py-3 rounded-full font-bold transition-colors"
            >
              Book Online Now
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
