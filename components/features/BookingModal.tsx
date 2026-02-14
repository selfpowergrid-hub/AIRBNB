
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar as CalendarIcon, Search, CheckCircle2, Loader2, ArrowRight, MoreVertical, ShieldCheck, Trash2, XCircle, Users, Minus, Plus, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker, DateRange } from 'react-day-picker';
import { format, isAfter, isBefore, isSameDay, addDays, parseISO, startOfDay, differenceInDays } from 'date-fns';
import { supabase } from '@/lib/supabase';
import 'react-day-picker/dist/style.css';


interface Room {
    id: string;
    name: string;
    price_per_night: number;
    max_guests: number;
    amenities?: string[];
}

interface Booking {
    check_in: string;
    check_out: string;
}

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialRoomId?: string;
}

const BookingModal = ({ isOpen, onClose, initialRoomId }: BookingModalProps) => {
    const [step, setStep] = useState(1);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [selectedRoom, setSelectedRoom] = useState<string>('');

    // New State for Split Dates
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);

    // Travelers State
    const [adults, setAdults] = useState(2);
    const [children, setChildren] = useState(0);

    const [existingBookings, setExistingBookings] = useState<Booking[]>([]);
    const [guestName, setGuestName] = useState('');
    const [guestPhone, setGuestPhone] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Admin State
    const [adminPassword, setAdminPassword] = useState('');
    const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
    const [allBookings, setAllBookings] = useState<any[]>([]);
    const [adminError, setAdminError] = useState('');
    const [adminTab, setAdminTab] = useState<'reservations' | 'settings'>('reservations');
    const [editingRoom, setEditingRoom] = useState<Room | null>(null);

    // Popover States
    const [activePopover, setActivePopover] = useState<'start' | 'end' | 'travelers' | null>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setActivePopover(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen) {
            fetchRooms();
        }
    }, [isOpen]);

    useEffect(() => {
        if (selectedRoom) {
            fetchBookings(selectedRoom);
        }
    }, [selectedRoom]);

    const fetchRooms = async () => {
        const { data, error } = await supabase.from('rooms').select('*');
        if (data) {
            setRooms(data);
            if (initialRoomId) {
                setSelectedRoom(initialRoomId);
            } else if (data.length > 0) {
                setSelectedRoom(data[0].id);
            }
        }
    };

    const fetchBookings = async (roomId: string) => {
        setExistingBookings([]);
        const { data, error } = await supabase
            .from('bookings')
            .select('check_in, check_out')
            .eq('room_id', roomId)
            .neq('status', 'cancelled');
        if (data) setExistingBookings(data);
    };

    const fetchAllBookings = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('bookings')
            .select('*, rooms(name)')
            .order('created_at', { ascending: false });
        if (data) setAllBookings(data);
        setIsLoading(false);
    };

    const handleCancelBooking = async (id: string) => {
        if (!confirm('Cancel this booking and free up dates?')) return;
        const { error } = await supabase
            .from('bookings')
            .update({ status: 'cancelled' })
            .eq('id', id);
        if (!error) fetchAllBookings();
    };

    const handleDeleteBooking = async (id: string) => {
        if (!confirm('PERMANENTLY DELETE this record? This cannot be undone.')) return;
        const { error } = await supabase
            .from('bookings')
            .delete()
            .eq('id', id);
        if (!error) fetchAllBookings();
    };

    const handleAdminLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (adminPassword === 'porthill2024') {
            setIsAdminAuthenticated(true);
            setStep(11);
            setAdminTab('reservations');
            fetchAllBookings();
            fetchRooms();
        } else {
            setAdminError('Invalid Key');
            setTimeout(() => setAdminError(''), 2000);
        }
    };

    const handleUpdateRoom = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingRoom) return;

        setIsLoading(true);
        const { error } = await supabase
            .from('rooms')
            .update({
                name: editingRoom.name,
                price_per_night: editingRoom.price_per_night,
                amenities: editingRoom.amenities
            })
            .eq('id', editingRoom.id);

        if (!error) {
            setEditingRoom(null);
            fetchRooms();
        }
        setIsLoading(false);
    };

    const toggleAmenity = (room: Room, amenity: string) => {
        const currentAmenities = room.amenities || [];
        const newAmenities = currentAmenities.includes(amenity)
            ? currentAmenities.filter(a => a !== amenity)
            : [...currentAmenities, amenity];

        setEditingRoom({ ...room, amenities: newAmenities });
    };

    const PREDEFINED_AMENITIES = [
        'King Bed', 'En-suite', 'Kitchenette', 'Wi-Fi', 'Security',
        'Airport Transfer', 'Parking', 'Smart TV', 'Air Con', 'Hot Shower'
    ];

    const isDateDisabled = (date: Date) => {
        const d = startOfDay(date);
        // Disable past dates
        if (isBefore(d, startOfDay(new Date()))) return true;

        // Disable booked dates
        return existingBookings.some(booking => {
            const start = startOfDay(parseISO(booking.check_in));
            const end = startOfDay(parseISO(booking.check_out));
            return (isAfter(d, start) || isSameDay(d, start)) &&
                (isBefore(d, end) || isSameDay(d, end));
        });
    };

    const isBooked = (date: Date) => {
        const d = startOfDay(date);
        return existingBookings.some(booking => {
            const start = startOfDay(parseISO(booking.check_in));
            const end = startOfDay(parseISO(booking.check_out));
            return (isAfter(d, start) || isSameDay(d, start)) &&
                (isBefore(d, end) || isSameDay(d, end));
        });
    };

    const isRangeInvalid = startDate && endDate && (() => {
        let current = startOfDay(startDate);
        const end = startOfDay(endDate);
        while (current <= end) {
            if (isBooked(current)) return true;
            current = addDays(current, 1);
        }
        return false;
    })();

    const handleBooking = async () => {
        if (!startDate || !endDate || !guestName || !guestPhone) return;

        setIsLoading(true);
        const { error } = await supabase.from('bookings').insert({
            room_id: selectedRoom,
            check_in: format(startDate, 'yyyy-MM-dd'),
            check_out: format(endDate, 'yyyy-MM-dd'),
            guest_name: guestName,
            guest_phone: guestPhone,
            adults: adults,
            children: children,
            status: 'pending'
        });

        setIsLoading(false);
        if (!error) {
            setIsSuccess(true);
            setTimeout(() => {
                onClose();
                setIsSuccess(false);
                setStep(1);
                setStartDate(undefined);
                setEndDate(undefined);
                setAdults(2);
                setChildren(0);
                setGuestName('');
                setGuestPhone('');
            }, 3000);
        }
    };

    // Helper for rendering calendar popover
    const CalendarPopover = ({ type }: { type: 'start' | 'end' }) => (
        <div
            onClick={(e) => e.stopPropagation()}
            className="absolute top-full mt-2 left-0 z-50 bg-white rounded-3xl shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200 overflow-hidden min-w-[340px]"
        >
            {/* Calendar Header */}
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-100 flex items-center justify-between">
                <span className="flex-1 text-center text-xs font-black text-gray-900 uppercase tracking-widest ml-6">
                    {type === 'start' ? 'Start Date' : 'End Date'}
                </span>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setActivePopover(null);
                    }}
                    className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors text-gray-400"
                >
                    <X size={16} />
                </button>
            </div>

            <div className="p-4">
                <style>{`
                    .rdp { 
                        --rdp-cell-size: 40px; 
                        margin: 0; 
                    }
                    /* Month Header */
                    .rdp-caption { 
                        padding: 0 0 1rem 0;
                        color: #1a1a1a;
                    }
                    .rdp-caption_label { 
                        font-weight: 900 !important; 
                        font-size: 1rem;
                        text-transform: capitalize;
                    }
                    /* Navigation Arrows */
                    .rdp-nav_button {
                        background: white;
                        border: 1px solid #e5e7eb;
                        border-radius: 8px;
                        color: #008080;
                    }
                    .rdp-nav_button:hover {
                        background: #f9fafb;
                    }
                    /* Weekday Labels */
                    .rdp-head_cell {
                        font-size: 0.75rem;
                        font-weight: 900;
                        color: #1a1a1a;
                        text-transform: capitalize;
                    }
                    /* Days */
                    .rdp-day {
                        font-weight: 800;
                        color: #1a1a1a;
                        font-size: 0.875rem;
                    }
                    .rdp-day_selected { 
                        background-color: #008080 !important; 
                        color: white !important; 
                        border-radius: 12px;
                    }
                    .rdp-day:hover:not(.rdp-day_disabled) { 
                        background-color: #f0fdfa; 
                        color: #008080; 
                        border-radius: 12px;
                    }
                    /* Booked/Disabled Style (Red Strike-through) */
                    .rdp-day_disabled, .booked-date {
                        color: #9ca3af !important;
                        position: relative;
                        background: transparent !important;
                    }
                    .rdp-day_disabled::after, .booked-date::after {
                        content: '';
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        width: 24px;
                        height: 24px;
                        transform: translate(-50%, -50%);
                        background: linear-gradient(to top right, transparent calc(50% - 1px), #ef4444 50%, transparent calc(50% + 1px));
                        pointer-events: none;
                    }
                `}</style>
                <DayPicker
                    mode="single"
                    selected={type === 'start' ? startDate : endDate}
                    onSelect={(date) => {
                        if (type === 'start') {
                            setStartDate(date);
                            if (endDate && date && isAfter(date, endDate)) {
                                setEndDate(addDays(date, 1));
                            }
                            setActivePopover('end'); // Auto-advance
                        } else {
                            setEndDate(date);
                            setActivePopover(null);
                        }
                    }}
                    disabled={(date) => {
                        if (isDateDisabled(date)) return true;
                        if (type === 'end' && startDate && isBefore(date, startDate)) return true;
                        return false;
                    }}
                    fromDate={type === 'end' && startDate ? startDate : new Date()}
                    modifiers={{ booked: isBooked }}
                    modifiersClassNames={{ booked: 'booked-date' }}
                    components={{
                        IconLeft: () => <ChevronLeft className="h-4 w-4" />,
                        IconRight: () => <ChevronRight className="h-4 w-4" />
                    }}
                />
            </div>
        </div>
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-dark/80 backdrop-blur-xl animate-in fade-in duration-700 overflow-y-auto">
            <div className={`bg-white/95 backdrop-blur-sm rounded-[3rem] w-full ${step === 1 ? 'max-w-5xl' : 'max-w-2xl'} shadow-[0_35px_80px_-15px_rgba(0,0,0,0.5)] overflow-visible animate-in zoom-in-95 duration-500 relative my-8 border border-white/40 transition-all`}>

                {/* Header */}
                <div className="px-8 py-6 flex justify-between items-center border-b border-gray-100/50">
                    <h3 className="font-black text-2xl text-brand-dark tracking-tighter">
                        {isSuccess ? 'Confirmed!' : step === 1 ? 'Book Your Stay' : 'Guest Details'}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} className="text-gray-600 hover:text-brand-dark" />
                    </button>
                </div>

                <div className="p-8">
                    {isSuccess ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in zoom-in duration-700">
                            <div className="relative">
                                <div className="absolute inset-0 bg-green-400/20 blur-3xl rounded-full scale-150 animate-pulse" />
                                <div className="relative w-28 h-28 bg-gradient-to-br from-green-400 to-green-600 text-white rounded-[2rem] flex items-center justify-center mb-10 shadow-2xl shadow-green-500/30 transform rotate-3">
                                    <CheckCircle2 size={64} className="stroke-[3px]" />
                                </div>
                            </div>
                            <h2 className="text-4xl font-black text-brand-dark mb-4 tracking-tighter">Reservation Sent!</h2>
                            <p className="text-gray-600 max-w-sm mx-auto text-lg leading-relaxed font-medium">
                                We've successfully received your booking request for <span className="text-brand-dark font-black underline decoration-brand-teal/50 decoration-4 underline-offset-4">{guestName}</span>.
                            </p>
                        </div>
                    ) : step === 1 ? (
                        <div className="space-y-8" ref={popoverRef}>
                            {/* NEW BOOKING BAR */}
                            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-2 flex flex-col md:flex-row gap-2 relative z-40">

                                {/* 1. Where To */}
                                <div className="flex-1 relative group">
                                    <div className="h-full px-6 py-3 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-200">
                                        <label className="text-[10px] font-black text-gray-900 uppercase tracking-wider block mb-1">Type</label>
                                        <div className="flex items-center justify-between">
                                            <select
                                                className="w-full bg-transparent font-black text-brand-dark outline-none appearance-none cursor-pointer text-lg truncate pr-4"
                                                value={selectedRoom}
                                                onChange={(e) => setSelectedRoom(e.target.value)}
                                            >
                                                {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                            </select>
                                            <ChevronDown size={16} className="text-gray-600 ml-[-20px] pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                <div className="w-px bg-gray-100 hidden md:block" />

                                {/* 2. Start Date */}
                                <div
                                    className="flex-1 relative"
                                    onClick={() => setActivePopover(activePopover === 'start' ? null : 'start')}
                                >
                                    <div className={`h-full px-6 py-3 rounded-2xl transition-colors cursor-pointer border ${activePopover === 'start' ? 'bg-brand-teal/5 border-brand-teal' : 'hover:bg-gray-50 border-transparent hover:border-gray-200'}`}>
                                        <label className="text-[10px] font-black text-gray-900 uppercase tracking-wider block mb-1">Check-In</label>
                                        <div className="flex items-center gap-2">
                                            <CalendarIcon size={18} className="text-brand-teal" />
                                            <span className={`font-black text-lg ${startDate ? 'text-brand-dark' : 'text-gray-500'}`}>
                                                {startDate ? format(startDate, 'MMM dd, yyyy') : 'Select Date'}
                                            </span>
                                        </div>
                                    </div>
                                    {activePopover === 'start' && <CalendarPopover type="start" />}
                                </div>

                                <div className="w-px bg-gray-100 hidden md:block" />

                                {/* 3. End Date */}
                                <div
                                    className="flex-1 relative"
                                    onClick={() => setActivePopover(activePopover === 'end' ? null : 'end')}
                                >
                                    <div className={`h-full px-6 py-3 rounded-2xl transition-colors cursor-pointer border ${activePopover === 'end' ? 'bg-brand-teal/5 border-brand-teal' : 'hover:bg-gray-50 border-transparent hover:border-gray-200'}`}>
                                        <label className="text-[10px] font-black text-gray-900 uppercase tracking-wider block mb-1">Check-Out</label>
                                        <div className="flex items-center gap-2">
                                            <CalendarIcon size={18} className="text-brand-teal" />
                                            <span className={`font-black text-lg ${endDate ? 'text-brand-dark' : 'text-gray-500'}`}>
                                                {endDate ? format(endDate, 'MMM dd, yyyy') : 'Select Date'}
                                            </span>
                                        </div>
                                    </div>
                                    {activePopover === 'end' && <CalendarPopover type="end" />}
                                </div>

                                <div className="w-px bg-gray-100 hidden md:block" />

                                {/* 4. Travelers */}
                                <div className="flex-1 relative">
                                    <div
                                        className={`h-full px-6 py-3 rounded-2xl transition-colors cursor-pointer border ${activePopover === 'travelers' ? 'bg-brand-teal/5 border-brand-teal' : 'hover:bg-gray-50 border-transparent hover:border-gray-200'}`}
                                        onClick={() => setActivePopover(activePopover === 'travelers' ? null : 'travelers')}
                                    >
                                        <label className="text-[10px] font-black text-gray-900 uppercase tracking-wider block mb-1">Travelers</label>
                                        <div className="flex items-center gap-2">
                                            <Users size={18} className="text-brand-teal" />
                                            <span className="font-black text-lg text-brand-dark">
                                                {adults + children} Guests
                                            </span>
                                        </div>
                                    </div>

                                    {/* Travelers Popover */}
                                    {activePopover === 'travelers' && (
                                        <div className="absolute top-full right-0 mt-2 w-72 bg-white p-6 rounded-3xl shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
                                            <div className="space-y-6">
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <p className="font-black text-brand-dark">Adults</p>
                                                        <p className="text-xs text-gray-900 font-black uppercase tracking-tighter opacity-70">Ages 13 or above</p>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            onClick={() => setAdults(Math.max(1, adults - 1))}
                                                            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-brand-dark"
                                                        >
                                                            <Minus size={14} />
                                                        </button>
                                                        <span className="font-black w-4 text-center">{adults}</span>
                                                        <button
                                                            onClick={() => setAdults(adults + 1)}
                                                            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-brand-dark"
                                                        >
                                                            <Plus size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="w-full h-px bg-gray-100" />
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <p className="font-black text-brand-dark">Children</p>
                                                        <p className="text-xs text-gray-900 font-black uppercase tracking-tighter opacity-70">Ages 0-12</p>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            onClick={() => setChildren(Math.max(0, children - 1))}
                                                            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-brand-dark"
                                                        >
                                                            <Minus size={14} />
                                                        </button>
                                                        <span className="font-black w-4 text-center">{children}</span>
                                                        <button
                                                            onClick={() => setChildren(children + 1)}
                                                            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-brand-dark"
                                                        >
                                                            <Plus size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => setActivePopover(null)}
                                                    className="w-full bg-brand-teal text-white py-3 rounded-xl font-bold text-sm"
                                                >
                                                    Done
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* 5. Search/Book Button */}
                                <div className="p-2">
                                    <button
                                        disabled={!startDate || !endDate || isRangeInvalid}
                                        onClick={() => setStep(2)}
                                        className="h-full px-8 bg-brand-teal text-white rounded-2xl font-black shadow-lg shadow-brand-teal/20 hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
                                    >
                                        <Search size={20} className="stroke-[3px]" />
                                        <span className="hidden md:inline">Check</span>
                                    </button>
                                </div>
                            </div>

                            {/* Warning for Invalid Dates */}
                            {isRangeInvalid && (
                                <div className="bg-red-50 text-red-500 px-6 py-4 rounded-2xl border border-red-100 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-500 max-w-md mx-auto">
                                    <XCircle size={18} />
                                    <span className="text-xs font-black uppercase tracking-widest">Selected dates unavailable</span>
                                </div>
                            )}

                            {/* Bottom Actions/Admin */}
                            <div className="flex justify-center pt-8">
                                <button
                                    onClick={() => {
                                        if (isAdminAuthenticated) setStep(11);
                                        else setStep(10);
                                    }}
                                    className="text-xs font-black text-gray-900 hover:text-brand-teal uppercase tracking-widest flex items-center gap-2 transition-colors"
                                >
                                    <ShieldCheck size={14} />
                                    Management Access
                                </button>
                            </div>
                        </div>
                    ) : step === 2 ? (
                        <div className="space-y-8 animate-in slide-in-from-right-16 duration-700">
                            <div className="bg-brand-teal/5 p-6 rounded-3xl border border-brand-teal/10">
                                <h4 className="font-black text-brand-dark mb-4 flex items-center gap-2">
                                    <CheckCircle2 size={18} className="text-brand-teal" />
                                    Trip Summary
                                </h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="block text-xs font-black text-gray-900 uppercase">Check-In</span>
                                        <span className="font-black text-brand-dark">{startDate && format(startDate, 'MMM dd, yyyy')}</span>
                                    </div>
                                    <div>
                                        <span className="block text-xs font-black text-gray-900 uppercase">Check-Out</span>
                                        <span className="font-black text-brand-dark">{endDate && format(endDate, 'MMM dd, yyyy')}</span>
                                    </div>
                                    <div>
                                        <span className="block text-xs font-black text-gray-900 uppercase">Room</span>
                                        <span className="font-black text-brand-dark">{rooms.find(r => r.id === selectedRoom)?.name}</span>
                                    </div>
                                    <div>
                                        <span className="block text-xs font-black text-gray-900 uppercase">Guests</span>
                                        <span className="font-black text-brand-dark">{adults} Adults, {children} Kids</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-brand-dark uppercase tracking-wider ml-2">Full Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={guestName}
                                        onChange={(e) => setGuestName(e.target.value)}
                                        placeholder="e.g. John Doe"
                                        className="w-full p-4 bg-gray-50 border border-gray-100 focus:border-brand-teal focus:bg-white rounded-2xl outline-none transition-all font-bold text-brand-dark"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-brand-dark uppercase tracking-wider ml-2">WhatsApp Number</label>
                                    <input
                                        required
                                        type="tel"
                                        value={guestPhone}
                                        onChange={(e) => setGuestPhone(e.target.value)}
                                        placeholder="+254..."
                                        className="w-full p-4 bg-gray-50 border border-gray-100 focus:border-brand-teal focus:bg-white rounded-2xl outline-none transition-all font-bold text-brand-dark"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setStep(1)}
                                    className="px-8 border border-gray-200 text-gray-600 py-4 rounded-2xl font-black hover:bg-gray-50 hover:text-brand-dark transition-all"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleBooking}
                                    disabled={!guestName || !guestPhone || isLoading}
                                    className="flex-[2] bg-brand-teal text-white py-4 rounded-2xl font-bold shadow-lg shadow-brand-teal/20 hover:bg-brand-teal/90 hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0 transition-all flex items-center justify-center gap-4 text-lg group"
                                >
                                    {isLoading ? (
                                        <Loader2 size={24} className="animate-spin text-white" />
                                    ) : (
                                        <>
                                            Confirm Booking <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    ) : step === 10 ? (
                        <div className="py-10 flex flex-col items-center justify-center animate-in zoom-in-95 duration-500">
                            <div className="w-16 h-16 bg-brand-teal/10 text-brand-teal rounded-2xl flex items-center justify-center mb-6">
                                <ShieldCheck size={32} />
                            </div>
                            <h3 className="text-2xl font-black text-brand-dark mb-2 tracking-tighter">Admin Portal</h3>
                            <p className="text-gray-600 font-bold text-[10px] uppercase tracking-widest mb-8">Access Restricted</p>

                            <form onSubmit={handleAdminLogin} className="w-full max-w-xs space-y-4">
                                <input
                                    type="password"
                                    value={adminPassword}
                                    onChange={(e) => setAdminPassword(e.target.value)}
                                    placeholder="Management Key"
                                    className="w-full p-5 bg-gray-50 border border-gray-200 focus:border-brand-teal rounded-2xl outline-none transition-all font-black text-brand-dark text-center"
                                    autoFocus
                                />
                                {adminError && <p className="text-red-500 text-[10px] font-black uppercase text-center tracking-widest animate-bounce">{adminError}</p>}
                                <button className="w-full bg-brand-teal text-white py-5 rounded-2xl font-black shadow-xl shadow-brand-teal/20 hover:shadow-brand-teal/40 transition-all hover:scale-[1.02]">
                                    Unlock
                                </button>
                                <button type="button" onClick={() => setStep(1)} className="w-full text-gray-500 font-bold text-xs uppercase tracking-widest pt-2">Exit</button>
                            </form>
                        </div>
                    ) : (
                        // Admin View (Step 11)
                        <div className="animate-in slide-in-from-bottom-5 duration-500">
                            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                                <div className="flex bg-gray-100 p-1 rounded-2xl w-full sm:w-auto">
                                    <button
                                        onClick={() => setAdminTab('reservations')}
                                        className={`flex-1 sm:flex-none px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${adminTab === 'reservations' ? 'bg-white text-brand-teal shadow-sm' : 'text-gray-500'}`}
                                    >
                                        Reservations
                                    </button>
                                    <button
                                        onClick={() => setAdminTab('settings')}
                                        className={`flex-1 sm:flex-none px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${adminTab === 'settings' ? 'bg-white text-brand-teal shadow-sm' : 'text-gray-500'}`}
                                    >
                                        Settings
                                    </button>
                                </div>
                                <button onClick={() => setStep(1)} className="text-xs font-black text-brand-teal hover:text-brand-dark uppercase tracking-widest transition-colors">Back to Booking</button>
                            </div>

                            {adminTab === 'reservations' ? (
                                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-xl font-black text-brand-dark tracking-tighter">Recent Bookings</h3>
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{allBookings.length} Total</span>
                                    </div>
                                    {allBookings.map(b => (
                                        <div key={b.id} className={`p-5 rounded-3xl border transition-all ${b.status === 'cancelled' ? 'border-gray-100 bg-gray-50/50 opacity-60' : 'border-gray-200 bg-white hover:border-brand-teal/30 shadow-sm'}`}>
                                            <div className="flex flex-col sm:flex-row justify-between gap-4">
                                                <div>
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <span className="font-black text-brand-dark">{b.guest_name}</span>
                                                        <span className="text-[10px] bg-brand-dark/5 px-2 py-0.5 rounded-full font-bold text-gray-600 uppercase">{b.rooms?.name}</span>
                                                    </div>
                                                    <div className="text-[11px] font-bold text-gray-600 tracking-wide uppercase flex gap-2">
                                                        <span>{format(parseISO(b.check_in), 'MMM d')} — {format(parseISO(b.check_out), 'MMM d')}</span>
                                                        <span className="text-brand-teal">•</span>
                                                        <span>{b.adults || 1} Ad, {b.children || 0} Ch</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {b.status !== 'cancelled' && (
                                                        <button
                                                            onClick={() => handleCancelBooking(b.id)}
                                                            className="p-2 bg-orange-50 text-orange-500 rounded-lg hover:bg-orange-500 hover:text-white transition-all"
                                                            title="Cancel Booking"
                                                        >
                                                            <XCircle size={16} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDeleteBooking(b.id)}
                                                        className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                                                        title="Delete Permanently"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-6 max-h-[550px] overflow-y-auto pr-2 custom-scrollbar pb-8">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-xl font-black text-brand-dark tracking-tighter">Facility Settings</h3>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Manage Units & Pricing</p>
                                    </div>

                                    {editingRoom ? (
                                        <div className="bg-gray-50 rounded-[2rem] p-8 border border-gray-200 animate-in slide-in-from-right-8 duration-500">
                                            <div className="flex justify-between items-center mb-6">
                                                <h4 className="font-black text-brand-dark uppercase text-xs tracking-widest">Editing: {editingRoom.name}</h4>
                                                <button onClick={() => setEditingRoom(null)} className="text-gray-400 hover:text-brand-dark">
                                                    <X size={18} />
                                                </button>
                                            </div>

                                            <form onSubmit={handleUpdateRoom} className="space-y-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Display Name</label>
                                                        <input
                                                            type="text"
                                                            value={editingRoom.name}
                                                            onChange={(e) => setEditingRoom({ ...editingRoom, name: e.target.value })}
                                                            className="w-full p-4 bg-white border border-gray-100 rounded-2xl outline-none font-bold text-brand-dark focus:border-brand-teal transition-all"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Price per Night (KES)</label>
                                                        <input
                                                            type="number"
                                                            value={editingRoom.price_per_night}
                                                            onChange={(e) => setEditingRoom({ ...editingRoom, price_per_night: Number(e.target.value) })}
                                                            className="w-full p-4 bg-white border border-gray-100 rounded-2xl outline-none font-bold text-brand-dark focus:border-brand-teal transition-all"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Available Amenities</label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {PREDEFINED_AMENITIES.map(amenity => (
                                                            <button
                                                                type="button"
                                                                key={amenity}
                                                                onClick={() => toggleAmenity(editingRoom, amenity)}
                                                                className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-tighter transition-all ${(editingRoom.amenities || []).includes(amenity)
                                                                        ? 'bg-brand-teal text-white shadow-md'
                                                                        : 'bg-white text-gray-400 border border-gray-100 hover:border-brand-teal/30'
                                                                    }`}
                                                            >
                                                                {amenity}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="flex gap-3 pt-4">
                                                    <button
                                                        disabled={isLoading}
                                                        className="flex-1 bg-brand-teal text-white py-4 rounded-2xl font-black shadow-lg shadow-brand-teal/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center"
                                                    >
                                                        {isLoading ? <Loader2 size={20} className="animate-spin" /> : 'Save Changes'}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setEditingRoom(null)}
                                                        className="px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-400 hover:text-brand-dark transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-4">
                                            {rooms.map(room => (
                                                <div key={room.id} className="p-6 bg-white border border-gray-200 rounded-[2rem] hover:border-brand-teal/30 shadow-sm transition-all group">
                                                    <div className="flex justify-between items-start">
                                                        <div className="space-y-1">
                                                            <h4 className="font-black text-brand-dark text-lg tracking-tighter">{room.name}</h4>
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-brand-teal font-black text-sm">KES {room.price_per_night} /night</span>
                                                                <span className="text-gray-300">|</span>
                                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Max {room.max_guests} Guests</span>
                                                            </div>
                                                            <div className="flex flex-wrap gap-1.5 mt-3">
                                                                {(room.amenities || []).slice(0, 4).map(a => (
                                                                    <span key={a} className="text-[9px] font-black text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md uppercase tracking-tighter opacity-70 italic">{a}</span>
                                                                ))}
                                                                {(room.amenities || []).length > 4 && (
                                                                    <span className="text-[9px] font-black text-brand-teal/60">+{(room.amenities || []).length - 4} more</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => setEditingRoom(room)}
                                                            className="p-3 bg-gray-50 text-gray-400 rounded-2xl group-hover:bg-brand-teal group-hover:text-white transition-all shadow-sm"
                                                        >
                                                            <MoreVertical size={20} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}

                                            <button className="p-6 border-2 border-dashed border-gray-200 rounded-[2rem] flex items-center justify-center gap-2 text-gray-400 hover:border-brand-teal hover:text-brand-teal transition-all group">
                                                <Plus size={20} className="group-hover:scale-110 transition-transform" />
                                                <span className="font-black uppercase text-xs tracking-widest">Add New Accommodation Type</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookingModal;
