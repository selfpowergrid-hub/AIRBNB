
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Phone, MapPin } from 'lucide-react';
import TopBar from '../features/TopBar';
import BookingModal from '../features/BookingModal';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isBookingOpen, setIsBookingOpen] = useState(false);

    return (
        <>
            <div className="fixed w-full z-50">
                <TopBar />
                <nav className="bg-brand-dark/95 backdrop-blur-md border-b border-brand-teal/20 text-white shadow-lg">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-20">
                            {/* Logo Section */}
                            <div className="flex-shrink-0 flex items-center">
                                <Link href="/" className="font-bold text-2xl tracking-tighter flex items-center gap-2">
                                    <span className="text-brand-teal text-4xl">P</span>
                                    <div className="flex flex-col leading-none">
                                        <span className="text-lg tracking-widest text-brand-teal">PORT HILL</span>
                                        <span className="text-xs text-gray-400 tracking-[0.2em] uppercase">GUEST & ACCOMMODATION</span>
                                    </div>
                                </Link>
                            </div>

                            {/* Desktop Menu */}
                            <div className="hidden md:block">
                                <div className="ml-10 flex items-baseline space-x-8">
                                    <Link href="/" className="hover:text-brand-teal transition-colors px-3 py-2 text-sm font-medium">Home</Link>
                                    <Link href="#accommodation" className="hover:text-brand-teal transition-colors px-3 py-2 text-sm font-medium">Accommodation</Link>
                                    <Link href="#park-fly" className="hover:text-brand-teal transition-colors px-3 py-2 text-sm font-medium">Park & Fly</Link>
                                    <Link href="#location" className="hover:text-brand-teal transition-colors px-3 py-2 text-sm font-medium">Location</Link>
                                </div>
                            </div>

                            {/* CTA Button */}
                            <div className="hidden md:block">
                                <button
                                    onClick={() => setIsBookingOpen(true)}
                                    className="bg-brand-teal hover:bg-teal-600 text-white px-6 py-2 rounded-full font-medium transition-all flex items-center gap-2 shadow-lg shadow-brand-teal/20 hover:shadow-brand-teal/40"
                                >
                                    <Phone size={16} />
                                    <span>Book Now</span>
                                </button>
                            </div>

                            {/* Mobile menu button */}
                            <div className="-mr-2 flex md:hidden">
                                <button
                                    onClick={() => setIsOpen(!isOpen)}
                                    className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
                                >
                                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Menu */}
                    {isOpen && (
                        <div className="md:hidden bg-brand-dark border-b border-brand-teal/20">
                            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                                <Link href="/" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium hover:text-brand-teal hover:bg-gray-900">Home</Link>
                                <Link href="#accommodation" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium hover:text-brand-teal hover:bg-gray-900">Accommodation</Link>
                                <Link href="#park-fly" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium hover:text-brand-teal hover:bg-gray-900">Park & Fly</Link>
                                <Link href="#location" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium hover:text-brand-teal hover:bg-gray-900">Location</Link>
                                <button
                                    onClick={() => { setIsOpen(false); setIsBookingOpen(true); }}
                                    className="block w-full text-center mt-4 bg-brand-teal text-white py-3 rounded-md font-bold"
                                >
                                    Call or Book
                                </button>
                            </div>
                        </div>
                    )}
                </nav>
            </div>

            <BookingModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} />
        </>
    );
};

export default Navbar;
