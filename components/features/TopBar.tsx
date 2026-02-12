
'use client';

import React from 'react';
import { Globe, ChevronDown, Facebook, MessageCircle } from 'lucide-react';

const TopBar = () => {
    return (
        <div className="bg-brand-teal text-white py-2 text-xs font-medium relative z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                <div className="hidden sm:flex items-center gap-4">
                    <a href="mailto:book@porthill.co.ke" className="hover:text-gray-100 transition-colors">book@porthill.co.ke</a>
                    <span>|</span>
                    <a href="tel:0720322173" className="hover:text-gray-100 transition-colors">0720 322 173</a>
                    <span>|</span>
                    <div className="flex items-center gap-3 ml-2">
                        <a href="https://facebook.com/porthillguest" target="_blank" rel="noopener noreferrer" className="hover:text-gray-100 transition-colors">
                            <Facebook size={14} />
                        </a>
                        <a href="https://wa.me/254720322173?text=Hi%20Port%20Hill%2C%20quick%20question..." target="_blank" rel="noopener noreferrer" className="hover:text-gray-100 transition-colors">
                            <MessageCircle size={14} />
                        </a>
                    </div>
                </div>

                <div className="flex items-center gap-6 ml-auto">
                    {/* Currency Toggle */}
                    <div className="relative group cursor-pointer flex items-center gap-1">
                        <span>KES</span>
                        <ChevronDown size={14} />

                        <div className="absolute top-full right-0 mt-2 bg-white text-gray-900 rounded-md shadow-lg p-2 min-w-[80px] hidden group-hover:block">
                            <div className="hover:bg-gray-100 px-2 py-1 rounded cursor-pointer">KES</div>
                            <div className="hover:bg-gray-100 px-2 py-1 rounded cursor-pointer">USD</div>
                            <div className="hover:bg-gray-100 px-2 py-1 rounded cursor-pointer">EUR</div>
                        </div>
                    </div>

                    {/* Language Toggle */}
                    <div className="relative group cursor-pointer flex items-center gap-1">
                        <Globe size={14} />
                        <span>EN</span>
                        <ChevronDown size={14} />

                        <div className="absolute top-full right-0 mt-2 bg-white text-gray-900 rounded-md shadow-lg p-2 min-w-[100px] hidden group-hover:block">
                            <div className="hover:bg-gray-100 px-2 py-1 rounded cursor-pointer flex items-center gap-2">🇬🇧 EN</div>
                            <div className="hover:bg-gray-100 px-2 py-1 rounded cursor-pointer flex items-center gap-2">🇩🇪 DE</div>
                            <div className="hover:bg-gray-100 px-2 py-1 rounded cursor-pointer flex items-center gap-2">🇫🇷 FR</div>
                            <div className="hover:bg-gray-100 px-2 py-1 rounded cursor-pointer flex items-center gap-2">🇰🇪 SW</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TopBar;
