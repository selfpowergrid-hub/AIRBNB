
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Calendar as CalendarIcon, Search, CheckCircle2, Loader2, ArrowRight, MoreVertical, ShieldCheck, Trash2, XCircle, Phone, Home, User, Clock, RefreshCw } from 'lucide-react';
import { DayPicker, DateRange } from 'react-day-picker';
import { format, isAfter, isBefore, isSameDay, addDays, parseISO, startOfDay } from 'date-fns';
import { supabase } from '@/lib/supabase';
import 'react-day-picker/dist/style.css';

interface Room {
    id: string;
    name: string;
    price_per_night: number;
    max_guests: number;
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
    const [range, setRange] = useState<DateRange>({
        from: undefined,
        to: undefined
    });
    const [existingBookings, setExistingBookings] = useState<Booking[]>([]);
    const [guestName, setGuestName] = useState('');
    const [guestPhone, setGuestPhone] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [adminPassword, setAdminPassword] = useState('');
    const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
    const [allBookings, setAllBookings] = useState<any[]>([]);
    const [adminError, setAdminError] = useState('');

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
            fetchAllBookings();
        } else {
            setAdminError('Invalid Key');
            setTimeout(() => setAdminError(''), 2000);
        }
    };

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

    const isRangeInvalid = range.from && range.to && (() => {
        let current = startOfDay(range.from);
        const end = startOfDay(range.to);
        while (current <= end) {
            if (isBooked(current)) return true;
            current = addDays(current, 1);
        }
        return false;
    })();

    const handleBooking = async () => {
        if (!range.from || !range.to || !guestName || !guestPhone) return;

        setIsLoading(true);
        const { error } = await supabase.from('bookings').insert({
            room_id: selectedRoom,
            check_in: format(range.from, 'yyyy-MM-dd'),
            check_out: format(range.to, 'yyyy-MM-dd'),
            guest_name: guestName,
            guest_phone: guestPhone,
            status: 'pending'
        });

        setIsLoading(false);
        if (!error) {
            setIsSuccess(true);
            setTimeout(() => {
                onClose();
                setIsSuccess(false);
                setStep(1);
                setRange({ from: undefined, to: undefined });
                setGuestName('');
                setGuestPhone('');
            }, 3000);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-dark/80 backdrop-blur-xl animate-in fade-in duration-700 overflow-y-auto">
            <div className="bg-white/95 backdrop-blur-sm rounded-[3rem] w-full max-w-2xl shadow-[0_35px_80px_-15px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 duration-500 relative my-8 border border-white/40">

                {/* Visual Accent Glows */}
                <div className="absolute -top-24 -left-24 w-64 h-64 bg-brand-teal/10 rounded-full blur-[80px] pointer-events-none" />
                <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-brand-accent/5 rounded-full blur-[80px] pointer-events-none" />

                {/* Header */}
                <div className="px-12 py-10 flex justify-between items-start bg-white/50 backdrop-blur-md border-b border-gray-100/50">
                    <div>
                        <h3 className="font-black text-4xl text-brand-dark tracking-tighter leading-tight">
                            {isSuccess ? 'Confirmed!' :
                                step === 10 || step === 11 ? 'Management' :
                                    step === 1 ? 'Book Your Stay' : 'Guest Details'}
                        </h3>
                        <p className="text-gray-400 font-bold text-xs mt-2 uppercase tracking-[0.2em] flex items-center gap-2">
                            <span className="w-8 h-[2px] bg-brand-teal/30" />
                            {step === 10 || step === 11 ? 'Administrative Access' :
                                step === 1 ? 'Select your dates' : 'Tell us who is visiting'}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => {
                                if (isAdminAuthenticated) setStep(11);
                                else setStep(10);
                            }}
                            className="p-4 rounded-2xl bg-brand-dark/5 hover:bg-brand-dark/10 transition-all border border-transparent hover:border-brand-dark/10 group"
                            title="Management Portal"
                        >
                            <MoreVertical size={20} className="text-brand-dark/30 group-hover:text-brand-dark transition-colors" />
                        </button>
                        <button
                            onClick={onClose}
                            className="bg-brand-dark/5 hover:bg-brand-dark/10 p-4 rounded-2xl transition-all group border border-transparent hover:border-brand-dark/10"
                            title="Close"
                        >
                            <X size={20} className="text-brand-dark/30 group-hover:text-brand-dark group-hover:rotate-90 transition-all duration-500" />
                        </button>
                    </div>
                </div>

                <div className="px-12 pb-12 pt-8">
                    {isSuccess ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in zoom-in duration-700">
                            <div className="relative">
                                <div className="absolute inset-0 bg-green-400/20 blur-3xl rounded-full scale-150 animate-pulse" />
                                <div className="relative w-28 h-28 bg-gradient-to-br from-green-400 to-green-600 text-white rounded-[2rem] flex items-center justify-center mb-10 shadow-2xl shadow-green-500/30 transform rotate-3">
                                    <CheckCircle2 size={64} className="stroke-[3px]" />
                                </div>
                            </div>
                            <h2 className="text-4xl font-black text-brand-dark mb-4 tracking-tighter">Reservation Sent!</h2>
                            <p className="text-gray-500 max-w-sm mx-auto text-lg leading-relaxed font-medium">
                                We've successfully received your booking request for <span className="text-brand-dark font-black underline decoration-brand-teal/50 decoration-4 underline-offset-4">{guestName}</span>.
                            </p>
                            <div className="mt-12 flex items-center gap-3 px-8 py-4 bg-gray-50/80 rounded-2xl text-brand-dark font-black text-xs uppercase tracking-widest border border-gray-200">
                                <Loader2 size={16} className="animate-spin text-brand-teal" />
                                Redirecting you...
                            </div>
                        </div>
                    ) : step === 10 ? (
                        <div className="py-10 flex flex-col items-center justify-center animate-in zoom-in-95 duration-500">
                            <div className="w-20 h-20 bg-brand-teal/10 text-brand-teal rounded-3xl flex items-center justify-center mb-8">
                                <ShieldCheck size={40} className="stroke-[2.5px]" />
                            </div>
                            <h3 className="text-3xl font-black text-brand-dark mb-2 tracking-tighter">Port Hill Management</h3>
                            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mb-10">Access Restricted</p>

                            <form onSubmit={handleAdminLogin} className="w-full max-w-xs space-y-4">
                                <input
                                    type="password"
                                    value={adminPassword}
                                    onChange={(e) => setAdminPassword(e.target.value)}
                                    placeholder="Management Key"
                                    className="w-full p-6 bg-white border-2 border-brand-teal/10 focus:border-brand-teal rounded-2xl outline-none transition-all font-black text-brand-dark text-center shadow-lg shadow-brand-teal/5"
                                    autoFocus
                                />
                                {adminError && <p className="text-red-500 text-[10px] font-black uppercase text-center tracking-widest animate-bounce">{adminError}</p>}
                                <button className="w-full bg-brand-teal text-white py-6 rounded-2xl font-black shadow-xl shadow-brand-teal/30 hover:shadow-brand-teal/50 transition-all hover:scale-[1.02]">
                                    Unlock Portal
                                </button>
                                <button type="button" onClick={() => setStep(1)} className="w-full text-gray-400 font-bold text-xs uppercase tracking-widest pt-4">Exit Management</button>
                            </form>
                        </div>
                    ) : step === 11 ? (
                        <div className="animate-in slide-in-from-bottom-5 duration-500">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-2xl font-black text-brand-dark tracking-tighter">All Reservations</h3>
                                <button onClick={() => setStep(1)} className="text-xs font-black text-brand-teal uppercase tracking-widest">Back to Booking</button>
                            </div>
                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {allBookings.map(b => (
                                    <div key={b.id} className={`p-6 rounded-3xl border-2 transition-all ${b.status === 'cancelled' ? 'border-gray-50 bg-gray-50/50 opacity-60' : 'border-gray-100 bg-white shadow-sm'}`}>
                                        <div className="flex flex-col sm:flex-row justify-between gap-4">
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className="font-black text-brand-dark">{b.guest_name}</span>
                                                    <span className="text-[10px] bg-brand-dark/5 px-2 py-0.5 rounded-full font-bold text-gray-400 uppercase">{b.rooms?.name}</span>
                                                </div>
                                                <div className="text-[11px] font-bold text-gray-400 tracking-wide uppercase">
                                                    {format(parseISO(b.check_in), 'MMM d')} — {format(parseISO(b.check_out), 'MMM d')}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {b.status !== 'cancelled' && (
                                                    <button
                                                        onClick={() => handleCancelBooking(b.id)}
                                                        className="p-3 bg-orange-50 text-orange-500 rounded-xl hover:bg-orange-500 hover:text-white transition-all"
                                                        title="Cancel Booking"
                                                    >
                                                        <XCircle size={18} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDeleteBooking(b.id)}
                                                    className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                                                    title="Delete Permanently"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-14">
                            {/* Left Side: Planning */}
                            <div className="space-y-10">
                                {step === 1 ? (
                                    <>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-brand-dark uppercase tracking-[0.3em] block ml-1 opacity-40">Accommodation</label>
                                            <div className="relative group">
                                                <select
                                                    value={selectedRoom}
                                                    onChange={(e) => setSelectedRoom(e.target.value)}
                                                    className="w-full p-5 bg-brand-light/50 border-2 border-transparent focus:border-brand-teal/30 focus:bg-white rounded-[1.5rem] outline-none transition-all font-black text-brand-dark appearance-none cursor-pointer shadow-sm group-hover:bg-brand-light"
                                                >
                                                    {rooms.map(room => (
                                                        <option key={room.id} value={room.id}>{room.name}</option>
                                                    ))}
                                                </select>
                                                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-brand-teal">
                                                    <Search size={18} className="stroke-[3px]" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-brand-dark/95 p-8 rounded-[2.5rem] border border-white/10 shadow-3xl relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 w-44 h-44 bg-brand-teal/20 rounded-full -mr-20 -mt-20 blur-3xl transition-all group-hover:scale-110 duration-700" />
                                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-accent/30 rounded-full -ml-16 -mb-16 blur-2xl opacity-50" />

                                            <div className="relative z-10">
                                                <div className="text-[9px] font-black text-brand-teal uppercase tracking-[0.4em] mb-6 opacity-90 flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-brand-teal animate-pulse" />
                                                    Selection Summary
                                                </div>
                                                <div className="flex items-center gap-5">
                                                    <div className="bg-white/10 backdrop-blur-xl text-white p-4 rounded-2xl border border-white/10 group-hover:bg-brand-teal transition-colors duration-500">
                                                        <CalendarIcon size={24} className="stroke-[2.5px]" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-2xl font-black text-white tracking-tighter">
                                                                {range.from ? format(range.from, 'MMM d') : '—'}
                                                            </span>
                                                            <ArrowRight size={16} className="text-brand-teal stroke-[3px]" />
                                                            <span className="text-2xl font-black text-white tracking-tighter">
                                                                {range.to ? format(range.to, 'MMM d') : '—'}
                                                            </span>
                                                        </div>
                                                        <span className="text-[10px] text-white/40 font-black uppercase tracking-widest mt-1">Check-in — Check-out</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            {isRangeInvalid && (
                                                <div className="bg-red-400/10 text-red-500 px-6 py-4 rounded-2xl border border-red-400/20 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
                                                    <X size={16} className="stroke-[3px]" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Selected range includes reserved dates</span>
                                                </div>
                                            )}

                                            <button
                                                disabled={!range.from || !range.to || isRangeInvalid}
                                                onClick={() => setStep(2)}
                                                className="w-full bg-brand-teal text-white py-5 rounded-full font-bold shadow-lg shadow-brand-teal/20 hover:bg-brand-teal/90 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-4 text-xl group"
                                            >
                                                <span>Next: Confirm Details</span>
                                                <ArrowRight size={24} className="stroke-[3px] transition-transform group-hover:translate-x-1" />
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="space-y-8 animate-in slide-in-from-right-16 duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-brand-dark uppercase tracking-[0.3em] block ml-1 opacity-40">Full Name</label>
                                            <input
                                                required
                                                type="text"
                                                value={guestName}
                                                onChange={(e) => setGuestName(e.target.value)}
                                                placeholder="e.g. John Doe"
                                                className="w-full p-5 bg-brand-teal/5 border-2 border-brand-teal/10 focus:border-brand-teal focus:bg-white rounded-[1.5rem] outline-none transition-all font-black text-brand-dark shadow-sm placeholder:text-brand-dark/20"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-brand-dark uppercase tracking-[0.3em] block ml-1 opacity-40">WhatsApp Number</label>
                                            <input
                                                required
                                                type="tel"
                                                value={guestPhone}
                                                onChange={(e) => setGuestPhone(e.target.value)}
                                                placeholder="+254..."
                                                className="w-full p-5 bg-brand-teal/5 border-2 border-brand-teal/10 focus:border-brand-teal focus:bg-white rounded-[1.5rem] outline-none transition-all font-black text-brand-dark shadow-sm placeholder:text-brand-dark/20"
                                            />
                                        </div>
                                        <div className="pt-8 flex gap-4">
                                            <button
                                                onClick={() => setStep(1)}
                                                className="px-8 border-2 border-brand-light text-gray-400 py-5 rounded-[1.5rem] font-black hover:bg-brand-light hover:text-brand-dark transition-all duration-300"
                                            >
                                                Back
                                            </button>
                                            <button
                                                onClick={handleBooking}
                                                disabled={!guestName || !guestPhone || isLoading}
                                                className="flex-[2] bg-brand-teal text-white py-5 rounded-full font-bold shadow-lg shadow-brand-teal/20 hover:bg-brand-teal/90 hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0 transition-all duration-300 flex items-center justify-center gap-4 text-xl group"
                                            >
                                                {isLoading ? (
                                                    <Loader2 size={24} className="animate-spin text-white" />
                                                ) : (
                                                    <>
                                                        Confirm & Send <ArrowRight size={24} className="stroke-[3px] group-hover:translate-x-1 transition-transform" />
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right Side: Calendar Display */}
                            <div className={`calendar-container transition-all duration-1000 cubic-bezier(0.23,1,0.32,1) ${step === 2 ? 'translate-x-20 opacity-0 blur-xl pointer-events-none' : 'translate-x-0'}`}>
                                <style>{`
                                    .rdp { --rdp-cell-size: 46px; margin: 0; }
                                    .rdp-months { justify-content: center; }
                                    .rdp-cell { padding: 2px; }
                                    .rdp-day { 
                                        width: var(--rdp-cell-size); 
                                        height: var(--rdp-cell-size); 
                                        border-radius: 16px; 
                                        font-weight: 900; 
                                        color: #1a1a1a; 
                                        font-size: 0.9rem;
                                        transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1); 
                                        border: 2px solid transparent;
                                    }
                                    .rdp-day_selected { 
                                        background: linear-gradient(135deg, #008080, #006666) !important; 
                                        color: white !important; 
                                        box-shadow: 0 12px 20px -8px rgba(0, 128, 128, 0.6);
                                        z-index: 10;
                                        border-radius: 16px !important;
                                    }
                                    .rdp-day_range_middle { 
                                        background-color: #f0fdfa !important; 
                                        color: #0d9488 !important; 
                                        border-radius: 0 !important;
                                        border-top: 2px solid #00808010;
                                        border-bottom: 2px solid #00808010;
                                    }
                                    .rdp-day_range_start { border-top-right-radius: 0 !important; border-bottom-right-radius: 0 !important; }
                                    .rdp-day_range_end { border-top-left-radius: 0 !important; border-bottom-left-radius: 0 !important; }
                                    .rdp-day:hover:not(.rdp-day_disabled):not(.rdp-day_selected) { 
                                        background-color: #00808008; 
                                        color: #008080;
                                        transform: scale(1.1);
                                        border-color: #00808020;
                                    }
                                    .rdp-nav_button { 
                                        background: white; 
                                        border: 1px solid #f1f5f9; 
                                        border-radius: 14px; 
                                        color: #1a1a1a; 
                                        padding: 10px;
                                        box-shadow: 0 4px 10px rgba(0,0,0,0.03);
                                        transition: all 0.3s;
                                    }
                                    .rdp-nav_button:hover { background: #f8fafc; color: #008080; transform: translateY(-2px); border-color: #00808030; }
                                    .rdp-head_cell { 
                                        font-weight: 900; 
                                        color: #94a3b8; 
                                        text-transform: uppercase; 
                                        font-size: 0.65rem; 
                                        letter-spacing: 0.2em; 
                                        padding-bottom: 2rem; 
                                    }
                                    .rdp-caption_label {
                                        font-weight: 900;
                                        color: #111;
                                        text-transform: uppercase;
                                        letter-spacing: 0.1em;
                                        font-size: 0.9rem;
                                    }
                                    .rdp-day_disabled { 
                                        color: #e2e8f0 !important; 
                                        opacity: 0.4;
                                        cursor: not-allowed;
                                    }
                                    .booked-day {
                                        background: linear-gradient(135deg, #fff5f5, #fff0f0) !important;
                                        color: #ef4444 !important;
                                        text-decoration: line-through;
                                        opacity: 0.9 !important;
                                        border: 1px solid #fee2e2 !important;
                                    }
                                    .rdp-day_disabled.booked-day {
                                        background: repeating-linear-gradient(45deg, #fff5f5, #fff5f5 5px, #fffafa 5px, #fffafa 10px) !important;
                                    }
                                `}</style>
                                <DayPicker
                                    mode="range"
                                    selected={range}
                                    onSelect={(selectedRange) => setRange(selectedRange || { from: undefined, to: undefined })}
                                    disabled={isDateDisabled}
                                    fromDate={new Date()}
                                    modifiers={{ booked: isBooked }}
                                    modifiersClassNames={{ booked: 'booked-day' }}
                                    footer={
                                        <div className="mt-12 flex flex-col gap-6 p-8 bg-brand-light/30 rounded-[2rem] border border-gray-100/80 shadow-inner">
                                            <div className="flex justify-between items-center group">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-5 h-5 bg-gradient-to-r from-brand-teal to-teal-600 rounded-lg shadow-lg group-hover:scale-110 transition-transform" />
                                                    <span className="text-[10px] font-black text-brand-dark uppercase tracking-[0.2em]">Selected Range</span>
                                                </div>
                                                <div className="h-[1px] flex-1 mx-6 bg-gradient-to-r from-gray-100 to-transparent" />
                                            </div>
                                            <div className="flex justify-between items-center group">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-5 h-5 bg-white border-2 border-red-200 rounded-lg relative overflow-hidden">
                                                        <div className="absolute inset-0 bg-red-50" />
                                                        <div className="absolute inset-0 flex items-center justify-center text-red-400 font-black text-xs leading-none">/</div>
                                                    </div>
                                                    <span className="text-[10px] font-black text-red-400 uppercase tracking-[0.2em]">Already Reserved</span>
                                                </div>
                                                <div className="h-[1px] flex-1 mx-6 bg-gradient-to-r from-gray-100 to-transparent" />
                                            </div>
                                        </div>
                                    }
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookingModal;
