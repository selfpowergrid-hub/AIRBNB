
import React from 'react';
import { MessageCircle } from 'lucide-react';

const WhatsAppWidget = () => {
    return (
        <a
            href="https://wa.me/254757717616"
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#20bd5a] text-white p-4 rounded-full shadow-2xl transition-all hover:scale-110 flex items-center justify-center animate-bounce-slow group"
            aria-label="Chat on WhatsApp"
        >
            <MessageCircle size={32} fill="white" className="text-white" />
            <span className="absolute right-full mr-4 bg-white text-gray-800 px-4 py-2 rounded-lg shadow-xl text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Chat with Concierge
            </span>
        </a>
    );
};

export default WhatsAppWidget;
