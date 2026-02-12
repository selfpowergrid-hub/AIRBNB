
import React from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin, Facebook, MessageCircle } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-brand-dark text-white pt-16 pb-8 border-t border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    {/* Brand Column */}
                    <div className="col-span-1 md:col-span-2 space-y-4">
                        <Link href="/" className="font-bold text-2xl tracking-tighter flex items-center gap-2">
                            <span className="text-brand-teal text-3xl">P</span>
                            <div className="flex flex-col leading-none">
                                <span className="text-lg tracking-widest text-brand-teal">PORT HILL</span>
                                <span className="text-xs text-gray-400 tracking-[0.2em] uppercase">GUEST & ACCOMMODATION</span>
                            </div>
                        </Link>
                        <p className="text-gray-400 max-w-sm">
                            Experience the ultimate convenience just 600m from Eldoret International Airport.
                            Modern studios, executive villas, and secure parking for the discerning traveler.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-brand-teal font-semibold mb-4 uppercase tracking-wider text-sm">Quick Links</h3>
                        <ul className="space-y-2">
                            <li><Link href="#home" className="text-gray-300 hover:text-brand-teal transition-colors">Home</Link></li>
                            <li><Link href="#accommodation" className="text-gray-300 hover:text-brand-teal transition-colors">Accommodation</Link></li>
                            <li><Link href="#park-fly" className="text-gray-300 hover:text-brand-teal transition-colors">Park & Fly</Link></li>
                            <li><Link href="#contact" className="text-gray-300 hover:text-brand-teal transition-colors">Contact Us</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-brand-teal font-semibold mb-4 uppercase tracking-wider text-sm">Contact Us</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <MapPin className="text-brand-teal flex-shrink-0" size={20} />
                                <span className="text-gray-300">600m from Eldoret International Airport (Departure Gate)</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="text-brand-teal" size={20} />
                                <a href="tel:0720322173" className="text-gray-300 hover:text-brand-teal transition-colors">0720 322 173</a>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="text-brand-teal" size={20} />
                                <a href="mailto:porthillguest027@gmail.com" className="text-gray-300 hover:text-brand-teal transition-colors">porthillguest027@gmail.com</a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
                    <p>&copy; {new Date().getFullYear()} Port Hill Guest. All rights reserved.</p>
                    <div className="flex gap-5">
                        <a href="https://facebook.com/porthillguest" target="_blank" rel="noopener noreferrer" className="hover:text-brand-teal transition-all hover:scale-110">
                            <Facebook size={22} />
                        </a>
                        <a href="https://wa.me/254720322173?text=Hi%20Port%20Hill%2C%20I'm%20interested%20in%20booking..." target="_blank" rel="noopener noreferrer" className="hover:text-brand-teal transition-all hover:scale-110">
                            <MessageCircle size={22} />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
