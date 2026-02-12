
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, User, MessageCircle, ArrowRight } from 'lucide-react';

const KNOWLEDGE_BASE = [
    {
        keywords: ['distance', 'airport', 'location', 'far', 'where'],
        response: "We are located exactly 600m from the Eldoret International Airport departure gate. It's a 3-minute walk or a very short shuttle ride!"
    },
    {
        keywords: ['room', 'suite', 'accommodation', 'stay', 'units', 'villa', 'studio'],
        response: "We offer two main options: 7 Self-Contained Efficiency Studios (ideal for business) and a 5-Bedroom Executive Villa (perfect for families or groups). All units are modern and secure."
    },
    {
        keywords: ['parking', 'park', 'car', 'safe', 'secure'],
        response: "Yes! We have ample, secure parking with 24/7 manned security and CCTV. Our 'Park-and-Fly' service is very popular for transit travelers."
    },
    {
        keywords: ['book', 'price', 'availability', 'cost', 'reserve'],
        response: "You can check availability directly on our site using the 'Check Availability' button, or call/WhatsApp us at 0720 322 173 for instant rates."
    },
    {
        keywords: ['wifi', 'internet', 'netflix', 'tv'],
        response: "All our units are equipped with high-speed fiber Wi-Fi and Smart TVs ready for streaming (Netflix, YouTube, etc.)."
    },
    {
        keywords: ['food', 'kitchen', 'eat', 'restaurant'],
        response: "Our studios and villa feature kitchenettes. There are also local eateries nearby, and we can assist with food delivery during your stay."
    }
];

const AIAssistantWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', text: "Hello! I'm your Port Hill Concierge. How can I help you today?" }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;

        const userMessage = input.trim();
        setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
        setInput('');
        setIsTyping(true);

        // Simulate AI Logic
        setTimeout(() => {
            let responseText = "I'm sorry, I don't have information on that yet. Would you like to speak with our human concierge on WhatsApp?";

            const lowerInput = userMessage.toLowerCase();
            for (const entry of KNOWLEDGE_BASE) {
                if (entry.keywords.some(keyword => lowerInput.includes(keyword))) {
                    responseText = entry.response;
                    break;
                }
            }

            setMessages(prev => [...prev, { role: 'assistant', text: responseText }]);
            setIsTyping(false);
        }, 1000);
    };

    return (
        <div className="fixed bottom-6 right-6 z-[100] font-sans">
            {/* Toggle Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-brand-teal text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all flex items-center justify-center group relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    <Sparkles size={32} className="relative z-10" />
                    <span className="absolute -top-12 right-0 bg-brand-dark text-white text-[10px] py-1 px-3 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity font-bold uppercase tracking-widest">
                        Ask AI Assistant
                    </span>
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="bg-white w-[350px] sm:w-[400px] h-[550px] rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">

                    {/* Header */}
                    <div className="bg-brand-teal p-6 text-white flex justify-between items-center bg-gradient-to-br from-brand-teal to-teal-700">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-xl">
                                <Sparkles size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg leading-tight">Port Hill AI</h3>
                                <div className="flex items-center gap-1.5 opacity-80">
                                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                                    <span className="text-[10px] uppercase font-bold tracking-widest">Online Assistant</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-black/10 p-2 rounded-xl transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                    <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-brand-dark' : 'bg-brand-teal'}`}>
                                        {msg.role === 'user' ? <User size={16} className="text-white" /> : <Sparkles size={16} className="text-white" />}
                                    </div>
                                    <div className={`p-4 rounded-2xl text-sm shadow-sm ${msg.role === 'user'
                                        ? 'bg-brand-teal text-white rounded-tr-none'
                                        : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                                        }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-none flex gap-1 items-center">
                                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" />
                                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Questions */}
                    <div className="px-6 py-2 overflow-x-auto no-scrollbar flex gap-2 whitespace-nowrap bg-gray-50/50">
                        {['How far is the airport?', 'Units available?', 'Tell me about parking'].map((q, i) => (
                            <button
                                key={i}
                                onClick={() => { setInput(q); }}
                                className="text-[10px] font-bold uppercase tracking-tight bg-white border border-gray-200 px-3 py-1.5 rounded-full hover:border-brand-teal hover:text-brand-teal transition-colors"
                            >
                                {q}
                            </button>
                        ))}
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white border-t border-gray-100">
                        <div className="flex items-center gap-2 bg-gray-100 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-brand-teal/20 transition-all">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Type a message..."
                                className="flex-1 bg-transparent border-none outline-none text-sm px-2 text-gray-700"
                            />
                            <button
                                onClick={handleSend}
                                className="bg-brand-teal text-white p-2 rounded-xl hover:bg-teal-600 transition-colors"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                        <div className="mt-3">
                            <a
                                href="https://wa.me/254720322173?text=Hi%20Port%20Hill%2C%20I'm%20coming%20from%20the%20website%20and%20have%20a%20question..."
                                className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-brand-teal transition-colors"
                            >
                                <MessageCircle size={14} className="text-[#25D366]" /> Talk to a Human instead <ArrowRight size={10} />
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIAssistantWidget;
