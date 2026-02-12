

"use client";

import React, { useState } from "react";
import Image from "next/image";
import Footer from "@/components/layout/Footer";
import AccommodationSection from "@/components/home/AccommodationSection";
import AmenitiesSection from "@/components/home/AmenitiesSection";
import ParkAndFlySection from "@/components/home/ParkAndFlySection";
import AIAssistantWidget from "@/components/features/AIAssistantWidget";
import BookingModal from "@/components/features/BookingModal";
import { ArrowRight, Plane, ShieldCheck, Clock, MapPin } from "lucide-react";

export default function Home() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string | undefined>(undefined);

  const handleOpenBooking = (roomId?: string) => {
    setSelectedRoomId(roomId);
    setIsBookingOpen(true);
  };

  return (
    <>
      <AIAssistantWidget />
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        initialRoomId={selectedRoomId}
      />

      {/* Hero Section */}
      <section className="relative h-[85vh] w-full flex items-center justify-center overflow-hidden">
        {/* Background Image/Video */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/assets/porthill-welcome.png"
            alt="Welcome to Port Hill Guest House"
            fill
            className="object-cover object-top brightness-50 animate-ken-burns"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/90 via-transparent to-black/30" />
        </div>

        <div className="relative z-10 text-center max-w-4xl px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="inline-flex items-center gap-2 bg-brand-teal/90 text-white px-4 py-1.5 rounded-full text-sm font-semibold mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Plane size={16} className="animate-pulse" />
            <span>600m from Eldoret International Airport</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
            The Smartest Way to <br /> <span className="text-brand-teal">Fly & Stay</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto">
            Efficiency studios, executive villas, and secure park-and-fly services.
            <strong> Where are you?</strong> 3 minutes from the gate.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <button
              onClick={() => handleOpenBooking()}
              className="bg-brand-teal hover:bg-teal-600 text-white text-lg px-8 py-3 rounded-full font-bold transition-all shadow-lg hover:shadow-brand-teal/50 flex items-center justify-center gap-2"
            >
              Check Availability <ArrowRight size={20} />
            </button>
            <a href="#park-fly" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white text-lg px-8 py-3 rounded-full font-bold transition-all flex items-center justify-center gap-2">
              Park & Fly Info
            </a>
          </div>
        </div>
      </section>

      {/* Answer Section: The 3 Questions */}
      <section className="py-12 bg-white relative -mt-20 z-20 max-w-6xl mx-auto rounded-xl shadow-2xl mx-4 lg:mx-auto grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
        <div className="p-8 text-center space-y-3 group hover:bg-gray-50 transition-colors rounded-l-xl">
          <div className="w-12 h-12 bg-brand-teal/10 text-brand-teal rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
            <MapPin size={24} className="text-brand-teal" />
          </div>
          <h3 className="font-bold text-gray-900 text-lg">Where am I?</h3>
          <p className="text-gray-600 text-sm">Located on the airport road, exactly <strong className="text-brand-teal">600m</strong> from the main gate. You can't get closer without a boarding pass.</p>
        </div>
        <div className="p-8 text-center space-y-3 group hover:bg-gray-50 transition-colors">
          <div className="w-12 h-12 bg-brand-teal/10 text-brand-teal rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
            <ShieldCheck size={24} className="text-brand-teal" />
          </div>
          <h3 className="font-bold text-gray-900 text-lg">Why stay here?</h3>
          <p className="text-gray-600 text-sm">Avoid Nairobi traffic. Early flight? Sleep in. Late arrival? Be home in minutes. <strong className="text-brand-teal">24/7 Security</strong>.</p>
        </div>
        <div className="p-8 text-center space-y-3 group hover:bg-gray-50 transition-colors rounded-r-xl">
          <div className="w-12 h-12 bg-brand-teal/10 text-brand-teal rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform"
            onClick={() => handleOpenBooking()}
          >
            <Clock size={24} className="text-brand-teal cursor-pointer" />
          </div>
          <h3 className="font-bold text-gray-900 text-lg">How do I book?</h3>
          <p className="text-gray-600 text-sm">Instant confirmation via our engine or call <strong className="text-brand-teal">0720 322 173</strong>. M-Pesa enabled.</p>
        </div>
      </section>

      <AccommodationSection onOpenBooking={handleOpenBooking} />

      <AmenitiesSection />

      <ParkAndFlySection />

      {/* Final CTA */}
      <section className="py-20 bg-brand-teal text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-4xl font-bold mb-6">Ready to Experience Port Hill?</h2>
          <p className="text-xl mb-8 opacity-90">Secure your stay or parking spot today and travel with zero stress.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:0720322173" className="bg-white text-brand-teal px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors">
              Call 0720 322 173
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
