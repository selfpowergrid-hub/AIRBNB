
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar as CalendarIcon, CheckCircle2, Loader2, XCircle, Minus, Plus, ChevronLeft, ChevronRight, Copy, AlertCircle, Check, MessageCircle } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { format, isAfter, isBefore, isSameDay, addDays, parseISO, startOfDay, differenceInDays } from 'date-fns';
import { supabase } from '@/lib/supabase';
import {
    STUDIO, VILLA, STUDIO_FROM, VILLA_FROM, FALLBACK_ADDONS,
    studioRate, villaRate, accommodationTotal,
    type RoomType, type StayType,
} from '@/lib/pricing';
import 'react-day-picker/dist/style.css';


const TILL_NUMBER = '6817904';
const TILL_NAME = 'PORT HILL GUEST AND ACC.';
const SUPPORT_PHONE = '0757717616';
const ALERT_WHATSAPP = '254757717616';

const LABEL = 'text-[10px] font-semibold text-gray-500 uppercase tracking-[0.16em]';
const SECTION_H = 'flex items-center gap-2 text-[13px] font-bold text-brand-dark tracking-tight';
const SECTION_N = 'w-5 h-5 rounded-full bg-checkout-green/10 text-checkout-green text-[10px] font-bold flex items-center justify-center flex-shrink-0';

const CARD_BASE = 'w-full text-left p-3 rounded-xl border-2 transition-all duration-200';
const CARD_ON = CARD_BASE + ' border-checkout-green bg-checkout-green-soft ring-1 ring-checkout-green/20';
const CARD_OFF = CARD_BASE + ' border-gray-200 bg-white hover:border-checkout-green/40 hover:bg-checkout-green-soft/40';

const DOT_ON = 'w-4 h-4 rounded bg-checkout-green text-white flex items-center justify-center flex-shrink-0';
const DOT_OFF = 'w-4 h-4 rounded border-2 border-gray-300 flex-shrink-0';

const SEG_BASE = 'py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all';
const SEG_ON = SEG_BASE + ' bg-white text-checkout-green shadow-sm ring-1 ring-checkout-green/15';
const SEG_OFF = SEG_BASE + ' text-gray-500 hover:text-brand-dark';

const BED_BASE = 'py-2 rounded-lg border-2 transition-all duration-200 text-center';
const BED_ON = BED_BASE + ' border-checkout-green bg-checkout-green text-white';
const BED_OFF = BED_BASE + ' border-gray-200 bg-white text-brand-dark hover:border-checkout-green/40 hover:bg-checkout-green-soft/40';

const EXTRA_BASE = 'w-full flex items-center justify-between px-3 py-2 rounded-lg border-2 transition-all';
const EXTRA_ON = EXTRA_BASE + ' border-checkout-green bg-checkout-green-soft';
const EXTRA_OFF = EXTRA_BASE + ' border-gray-200 bg-white hover:border-checkout-green/40 hover:bg-checkout-green-soft/40';

const FIELD_BASE = 'px-3 py-2 rounded-lg border transition-colors cursor-pointer';
const FIELD_ON = FIELD_BASE + ' bg-checkout-green-soft border-checkout-green';
const FIELD_OFF = FIELD_BASE + ' border-transparent hover:bg-gray-50 hover:border-gray-200';

const STEP_BTN = 'w-7 h-7 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:border-checkout-green hover:text-checkout-green text-brand-dark transition-colors disabled:opacity-30 disabled:hover:border-gray-200 disabled:hover:text-brand-dark';

const INPUT_BASE = 'w-full px-3 py-2 bg-gray-50 border rounded-lg outline-none transition-all font-bold text-brand-dark focus:bg-white text-sm';
const INPUT = INPUT_BASE + ' border-gray-200 focus:border-checkout-green focus:ring-2 focus:ring-checkout-green/15';
const INPUT_BAD = INPUT_BASE + ' border-red-300 focus:border-red-400';

// Short, human-readable reference the guest can quote on the phone.
// Kept unique at the database level by a unique index on booking_ref.
function makeBookingRef(): string {
    const stamp = Date.now().toString(36).toUpperCase().slice(-5);
    const salt = Math.floor(Math.random() * 36).toString(36).toUpperCase();
    return 'PH-' + stamp + salt;
}

interface Room {
    id: string;
    name: string;
    price_per_night: number;
    max_guests: number;
    amenities?: string[];
}

interface Addon {
    id: string;
    name: string;
    price: number;
    category: string;
    sort_order: number;
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
    const [rooms, setRooms] = useState<Room[]>([]);
    const [roomType, setRoomType] = useState<RoomType>('studio');
    const [stayType, setStayType] = useState<StayType>('overnight');
    const [studioUnits, setStudioUnits] = useState(1);
    const [villaBedrooms, setVillaBedrooms] = useState(1);

    // New State for Split Dates
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);

    // Travelers State
    const [adults, setAdults] = useState(2);
    const [children, setChildren] = useState(0);

    const [existingBookings, setExistingBookings] = useState<Booking[]>([]);
    const [guestName, setGuestName] = useState('');
    const [guestPhone, setGuestPhone] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);


    // Popover States
    const [activePopover, setActivePopover] = useState<'start' | 'end' | 'travelers' | null>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    // Payment / feedback
    const [addons, setAddons] = useState<Addon[]>([]);
    const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
    const [mpesaCode, setMpesaCode] = useState('');
    const [bookingRef, setBookingRef] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [roomsLoading, setRoomsLoading] = useState(false);
    const [tillCopied, setTillCopied] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveWarning, setSaveWarning] = useState('');


    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setActivePopover(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchRooms = async () => {
        setRoomsLoading(true);
        setErrorMsg('');
        const { data, error } = await supabase.from('rooms').select('*');
        setRoomsLoading(false);
        if (error) {
            setErrorMsg(`We could not load room availability. Please refresh the page, or call ${SUPPORT_PHONE} and we will book you in directly.`);
            return;
        }
        if (data) {
            setRooms(data);
            // Deep links from the accommodation cards preselect the right type.
            if (initialRoomId) {
                const target = data.find(r => r.id === initialRoomId);
                if (target) setRoomType(/studio/i.test(target.name) ? 'studio' : 'villa');
            }
        }
    };

    // Extras are a nice-to-have: if they fail to load the guest can still book.
    const fetchAddons = async () => {
        const { data, error } = await supabase
            .from('addons')
            .select('*')
            .eq('is_active', true)
            .order('sort_order', { ascending: true });
        if (error || !data || data.length === 0) {
            setAddons(FALLBACK_ADDONS as Addon[]);
            return;
        }
        setAddons(data);
    };

    const fetchBookings = async (roomId: string) => {
        setExistingBookings([]);
        // Reads the availability view, not the bookings table: the calendar only
        // needs which dates are taken, never guest names or phone numbers.
        const { data, error } = await supabase
            .from('public_availability')
            .select('check_in, check_out')
            .eq('room_id', roomId);
        if (error) {
            setErrorMsg('We could not check which dates are already taken. Please refresh before booking.');
            return;
        }
        if (data) setExistingBookings(data);
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

    // The rooms table supplies identity and availability only; rates come from
    // lib/pricing, because a single price column cannot hold the bedroom ladder.
    const activeRoom = rooms.find(r =>
        roomType === 'studio' ? /studio/i.test(r.name) : /villa|executive|airbnb/i.test(r.name)
    );
    const selectedRoom = activeRoom ? activeRoom.id : '';

    const isDayRoom = roomType === 'studio' && stayType === 'day';
    // A day room occupies its date, so it books as a single night internally.
    const effectiveEnd = isDayRoom && startDate ? addDays(startDate, 1) : endDate;
    const nights = startDate && effectiveEnd
        ? Math.max(1, differenceInDays(startOfDay(effectiveEnd), startOfDay(startDate)))
        : 0;
    const datesChosen = isDayRoom ? !!startDate : !!(startDate && endDate);

    const isRangeInvalid = !!(startDate && effectiveEnd) && (() => {
        let current = startOfDay(startDate);
        const end = startOfDay(effectiveEnd);
        while (current <= end) {
            if (isBooked(current)) return true;
            current = addDays(current, 1);
        }
        return false;
    })();
    const selectedAddonItems = addons.filter(a => selectedAddons.includes(a.id));
    // Bonfire extras are a one-off charge for the stay, not multiplied by nights.
    const addonsTotal = selectedAddonItems.reduce((sum, a) => sum + Number(a.price || 0), 0);
    const roomTotal = datesChosen
        ? accommodationTotal({ roomType, stayType, studioUnits, villaBedrooms, nights })
        : 0;
    const totalAmount = roomTotal + addonsTotal;

    const stayLabel = roomType === 'studio'
        ? studioUnits + (studioUnits === 1 ? ' studio' : ' studios') + (isDayRoom ? ', day room' : '')
        : villaBedrooms + (villaBedrooms === 1 ? ' bedroom' : ' bedrooms');

    const toggleAddon = (id: string) => {
        setSelectedAddons(prev => prev.includes(id) ? prev.filter(x => x !== id) : prev.concat(id));
    };

    const whatsappHandoffUrl = 'https://wa.me/' + ALERT_WHATSAPP + '?text=' + encodeURIComponent(
        'Hello Port Hill, I have just booked online. Reference ' + bookingRef +
        '. Name: ' + guestName +
        '. M-Pesa code: ' + mpesaCode.trim().toUpperCase() +
        '. Total: KES ' + totalAmount.toLocaleString() + '.'
    );

    const normalisedPhone = guestPhone.replace(/[\s-]/g, '');
    const phoneValid = /^(?:\+?254|0)(7|1)\d{8}$/.test(normalisedPhone);
    const mpesaCodeValid = /^[A-Z0-9]{8,12}$/.test(mpesaCode.trim().toUpperCase());

    // Deferred to a microtask: these fetchers set state on their first line, and
    // doing that synchronously inside an effect cascades an extra render.
    useEffect(() => {
        if (!isOpen) return;
        let cancelled = false;
        void Promise.resolve().then(() => {
            if (cancelled) return;
            fetchRooms();
            fetchAddons();
        });
        return () => { cancelled = true; };
    }, [isOpen]);

    useEffect(() => {
        if (!selectedRoom) return;
        let cancelled = false;
        void Promise.resolve().then(() => {
            if (!cancelled) fetchBookings(selectedRoom);
        });
        return () => { cancelled = true; };
    }, [selectedRoom]);

    const handleCopyTill = async () => {
        try {
            await navigator.clipboard.writeText(TILL_NUMBER);
            setTillCopied(true);
            setTimeout(() => setTillCopied(false), 2000);
        } catch {
            // Clipboard blocked (insecure origin or denied) - the number is on screen anyway.
        }
    };

    const rateLine = roomType === 'studio'
        ? 'KES ' + studioRate(stayType).toLocaleString() +
          ' x ' + studioUnits + (studioUnits === 1 ? ' studio' : ' studios') +
          (isDayRoom ? ' (day)' : ' x ' + nights + (nights === 1 ? ' night' : ' nights'))
        : 'KES ' + villaRate(villaBedrooms).toLocaleString() +
          ' x ' + nights + (nights === 1 ? ' night' : ' nights');

    const canBook = datesChosen && !isRangeInvalid && !!selectedRoom &&
        !!guestName.trim() && phoneValid &&
        !(mpesaCode.trim() && !mpesaCodeValid);

    const paySteps = [
        'Open M-Pesa on your phone',
        'Select Lipa na M-Pesa',
        'Select Buy Goods and Services',
        'Enter Till Number ' + TILL_NUMBER,
        'Enter amount KES ' + totalAmount.toLocaleString(),
        'Enter your M-Pesa PIN and confirm',
        'Check the name reads ' + TILL_NAME,
    ];

    const buildBookingMessage = (ref: string) => {
        const lines = [
            'Hello Port Hill, I would like to book.',
            '',
            'Reference: ' + ref,
            'Name: ' + guestName,
            'Phone: ' + normalisedPhone,
            'Room: ' + (activeRoom ? activeRoom.name : '-'),
            'Booking: ' + stayLabel,
            'Check-in: ' + (startDate ? format(startDate, 'EEE dd MMM yyyy') : '-'),
        ];
        if (isDayRoom) {
            lines.push('Day room (same day)');
        } else {
            lines.push('Check-out: ' + (effectiveEnd ? format(effectiveEnd, 'EEE dd MMM yyyy') : '-'));
            lines.push('Nights: ' + nights);
        }
        lines.push('Guests: ' + adults + ' adults, ' + children + ' children');
        if (selectedAddonItems.length > 0) {
            lines.push('Extras: ' + selectedAddonItems.map(a => a.name).join(', ') +
                ' (KES ' + addonsTotal.toLocaleString() + ')');
        }
        lines.push('Total: KES ' + totalAmount.toLocaleString());
        if (mpesaCode.trim()) {
            lines.push('M-Pesa code: ' + mpesaCode.trim().toUpperCase());
        } else {
            lines.push('I will pay to Till ' + TILL_NUMBER + '.');
        }
        return lines.join('\n');
    };

    type SaveResult = { ok: true } | { ok: false; blocking: boolean; message: string };

    // Writes the reservation FIRST, so the database exclusion constraint gets the
    // final say on whether these dates are still free. Only once this succeeds is
    // the guest shown a confirmation.
    const saveReservation = async (ref: string): Promise<SaveResult> => {
        if (!startDate || !effectiveEnd) {
            return { ok: false, blocking: true, message: 'Please choose your dates first.' };
        }

        const code = mpesaCode.trim().toUpperCase();
        const { error } = await supabase.from('bookings').insert({
            room_id: selectedRoom,
            check_in: format(startDate, 'yyyy-MM-dd'),
            check_out: format(effectiveEnd, 'yyyy-MM-dd'),
            guest_name: guestName,
            guest_phone: normalisedPhone,
            adults: adults,
            children: children,
            nights: nights,
            total_amount: totalAmount,
            // Left null when absent: the unique index would otherwise collide
            // on empty strings across every unpaid booking.
            mpesa_code: code ? code : null,
            addon_items: selectedAddonItems.map(a => ({ id: a.id, name: a.name, price: Number(a.price) })),
            addons_total: addonsTotal,
            payment_status: code ? 'awaiting_verification' : 'awaiting_payment',
            booking_ref: ref,
            status: 'pending'
        });

        if (!error) {
            fetch('/api/notify-booking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bookingRef: ref,
                    guestName: guestName,
                    guestPhone: normalisedPhone,
                    roomName: activeRoom ? activeRoom.name : '',
                    checkIn: format(startDate, 'yyyy-MM-dd'),
                    checkOut: format(effectiveEnd, 'yyyy-MM-dd'),
                    nights: nights,
                    guests: adults + ' adults, ' + children + ' children',
                    addons: selectedAddonItems.map(a => a.name).join(', '),
                    total: totalAmount,
                    mpesaCode: code,
                }),
            }).catch(() => { /* alerting is best effort */ });
            return { ok: true };
        }

        // 23P01 = the dates overlap a live booking. 23505 = that M-Pesa code is
        // already on another booking. Both are definitive, so the guest must not
        // be told the reservation succeeded.
        if (error.code === '23P01') {
            void fetchBookings(selectedRoom);
            return {
                ok: false,
                blocking: true,
                message: 'Sorry - those dates were just taken by another guest. Please choose different dates.',
            };
        }
        if (error.code === '23505') {
            return {
                ok: false,
                blocking: true,
                message: 'That M-Pesa code is already on another booking. Please check your confirmation SMS.',
            };
        }

        // Anything else (database unreachable, for instance) is not proof the
        // dates are gone. Let the WhatsApp message through so the booking still
        // reaches the property, but say plainly that it is unconfirmed.
        console.warn('[booking] reservation row not saved: ' + error.message);
        return {
            ok: false,
            blocking: false,
            message: 'We could not record your reservation automatically, so it is not confirmed yet. Please send the WhatsApp message and we will confirm it by hand.',
        };
    };

    const handleBooking = async () => {
        if (!canBook || isSaving) return;

        setErrorMsg('');
        setSaveWarning('');
        setIsSaving(true);

        // The popup has to be created inside the click, before any await, or the
        // browser treats it as an unsolicited popup and blocks it. It waits on
        // about:blank and is only pointed at WhatsApp once the dates are secured.
        const popup = window.open('', '_blank');

        const ref = makeBookingRef();
        const result = await saveReservation(ref);
        setIsSaving(false);

        if (!result.ok && result.blocking) {
            if (popup) popup.close();
            setErrorMsg(result.message);
            return;
        }
        if (!result.ok) {
            setSaveWarning(result.message);
        }

        const url = 'https://wa.me/' + ALERT_WHATSAPP + '?text=' + encodeURIComponent(buildBookingMessage(ref));
        if (popup) {
            // Drop the handle back to this page before navigating away.
            popup.opener = null;
            popup.location.replace(url);
        } else {
            window.open(url, '_blank', 'noopener,noreferrer');
        }

        setBookingRef(ref);
        setIsSuccess(true);

        setTimeout(() => {
            onClose();
            setIsSuccess(false);
            setStartDate(undefined);
            setEndDate(undefined);
            setAdults(2);
            setChildren(0);
            setGuestName('');
            setGuestPhone('');
            setMpesaCode('');
            setSelectedAddons([]);
            setBookingRef('');
            setErrorMsg('');
            setSaveWarning('');
        }, 15000);
    };

    // Helper for rendering calendar popover
    const CalendarPopover = ({ type }: { type: 'start' | 'end' }) => (
        <div
            onClick={(e) => e.stopPropagation()}
            className="absolute top-full mt-2 left-0 z-50 bg-white rounded-3xl shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200 overflow-hidden min-w-[340px]"
        >
            {/* Calendar Header */}
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-100 flex items-center justify-between">
                <span className="flex-1 text-center text-xs font-bold text-gray-900 uppercase tracking-widest ml-6">
                    {type === 'start' ? 'Start Date' : 'End Date'}
                </span>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setActivePopover(null);
                    }}
                    className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors text-gray-500"
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
                        Chevron: ({ orientation }) => {
                            const Icon = orientation === 'left' ? ChevronLeft : ChevronRight;
                            return <Icon className="h-4 w-4" />;
                        }
                    }}
                />
            </div>
        </div>
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-brand-dark/80 backdrop-blur-xl animate-in fade-in duration-700">
            <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[94vh] flex flex-col shadow-[0_35px_80px_-15px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-300 relative border border-white/40 overflow-hidden">

                {/* Header */}
                <div className="px-5 sm:px-6 py-3.5 flex justify-between items-center border-b border-gray-100 flex-shrink-0">
                    <h3 className="font-bold text-lg text-brand-dark tracking-tight">
                        {isSuccess ? 'Reservation Received' : 'Book Your Stay'}
                    </h3>
                    <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={18} className="text-gray-500 hover:text-brand-dark" />
                    </button>
                </div>

                <div className="flex-1 min-h-0 flex flex-col">
                    {isSuccess ? (
                        <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center py-10 px-6 text-center animate-in fade-in zoom-in duration-500">
                            <div className="relative">
                                <div className="absolute inset-0 bg-checkout-green/20 blur-3xl rounded-full scale-150 animate-pulse" />
                                <div className="relative w-20 h-20 bg-gradient-to-br from-checkout-green to-checkout-green-dark text-white rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-checkout-green/30 transform rotate-3">
                                    <CheckCircle2 size={44} className="stroke-[3px]" />
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold text-brand-dark mb-3 tracking-tight">Reservation Received</h2>
                            <p className="text-gray-600 max-w-sm mx-auto text-lg leading-relaxed font-medium">
                                Thank you <span className="text-brand-dark font-bold underline decoration-checkout-green/50 decoration-4 underline-offset-4">{guestName}</span>. Send the WhatsApp message we opened and we will confirm your booking right away.
                            </p>
                            {saveWarning && (
                                <div className="mt-6 max-w-sm bg-amber-50 text-amber-900 px-5 py-4 rounded-2xl border border-amber-200 flex items-start gap-2.5 text-left">
                                    <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                                    <span className="text-sm font-semibold">{saveWarning}</span>
                                </div>
                            )}
                            {bookingRef && (
                                <div className="mt-8 bg-gray-50 border border-gray-100 rounded-3xl px-10 py-5">
                                    <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Your Reference</span>
                                    <span className="text-2xl font-bold tracking-widest text-brand-dark">{bookingRef}</span>
                                </div>
                            )}
                            <p className="text-sm text-gray-500 font-medium mt-6 max-w-sm">
                                Please keep this reference. Any questions, call <strong className="text-brand-dark">{SUPPORT_PHONE}</strong>.
                            </p>
                            <a
                                href={whatsappHandoffUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-6 inline-flex items-center gap-2 bg-checkout-green text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-checkout-green-dark transition-all shadow-lg shadow-checkout-green/25"
                            >
                                <MessageCircle size={18} />
                                Open WhatsApp again
                            </a>
                        </div>
                    ) : (
                        <div className="flex-1 min-h-0 overflow-y-auto lg:overflow-hidden flex flex-col lg:flex-row" ref={popoverRef}>

                            {/* ---------------- LEFT: the form ---------------- */}
                            <div className="flex-1 min-w-0 lg:overflow-y-auto px-5 sm:px-6 py-5 space-y-5">

                                <section className="space-y-2">
                                    <h3 className={SECTION_H}><span className={SECTION_N}>1</span> Accommodation</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <button type="button" onClick={() => setRoomType('studio')} className={roomType === 'studio' ? CARD_ON : CARD_OFF}>
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <span className="block font-bold text-brand-dark">{STUDIO.label}</span>
                                                    <span className="block text-xs text-gray-500 font-bold mt-0.5">{STUDIO.blurb}</span>
                                                </div>
                                                <span className={roomType === 'studio' ? DOT_ON : DOT_OFF}>
                                                    {roomType === 'studio' && <Check size={12} className="stroke-[4px]" />}
                                                </span>
                                            </div>
                                            <span className="block text-xs font-bold text-checkout-green mt-3">From KES {STUDIO_FROM.toLocaleString()}</span>
                                        </button>

                                        <button type="button" onClick={() => setRoomType('villa')} className={roomType === 'villa' ? CARD_ON : CARD_OFF}>
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <span className="block font-bold text-brand-dark">{VILLA.label}</span>
                                                    <span className="block text-xs text-gray-500 font-bold mt-0.5">{VILLA.blurb}</span>
                                                </div>
                                                <span className={roomType === 'villa' ? DOT_ON : DOT_OFF}>
                                                    {roomType === 'villa' && <Check size={12} className="stroke-[4px]" />}
                                                </span>
                                            </div>
                                            <span className="block text-xs font-bold text-checkout-green mt-3">From KES {VILLA_FROM.toLocaleString()}</span>
                                        </button>
                                    </div>
                                </section>

                                <section className="space-y-2">
                                    <h3 className={SECTION_H}><span className={SECTION_N}>2</span> Your stay</h3>
                                    {roomType === 'studio' ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <span className={LABEL}>Stay type</span>
                                                <div className="grid grid-cols-2 gap-1 p-1 bg-gray-100 rounded-2xl">
                                                    <button type="button" onClick={() => setStayType('overnight')} className={stayType === 'overnight' ? SEG_ON : SEG_OFF}>Overnight</button>
                                                    <button type="button" onClick={() => setStayType('day')} className={stayType === 'day' ? SEG_ON : SEG_OFF}>Day room</button>
                                                </div>
                                                <p className="text-xs text-gray-500 font-bold">
                                                    KES {studioRate(stayType).toLocaleString()} per studio{stayType === 'day' ? ' for the day' : ' per night'}
                                                </p>
                                            </div>
                                            <div className="space-y-2">
                                                <span className={LABEL}>How many studios</span>
                                                <div className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-lg px-3 py-1.5">
                                                    <button type="button" onClick={() => setStudioUnits(Math.max(1, studioUnits - 1))} disabled={studioUnits <= 1} className={STEP_BTN} aria-label="Fewer studios">
                                                        <Minus size={15} />
                                                    </button>
                                                    <span className="font-bold text-xl text-brand-dark tabular-nums">{studioUnits}</span>
                                                    <button type="button" onClick={() => setStudioUnits(Math.min(STUDIO.totalUnits, studioUnits + 1))} disabled={studioUnits >= STUDIO.totalUnits} className={STEP_BTN} aria-label="More studios">
                                                        <Plus size={15} />
                                                    </button>
                                                </div>
                                                <p className="text-xs text-gray-500 font-bold">{STUDIO.totalUnits} studios on the property</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <span className={LABEL}>Bedrooms required</span>
                                            <div className="grid grid-cols-5 gap-2">
                                                {Array.from({ length: VILLA.totalBedrooms }, (_, i) => i + 1).map(n => (
                                                    <button key={n} type="button" onClick={() => setVillaBedrooms(n)} className={villaBedrooms === n ? BED_ON : BED_OFF}>
                                                        <span className="block text-lg font-bold leading-none">{n}</span>
                                                        <span className="block text-[9px] font-bold uppercase tracking-wider mt-1.5 opacity-70">{villaRate(n).toLocaleString()}</span>
                                                    </button>
                                                ))}
                                            </div>
                                            <p className="text-xs text-gray-500 font-bold">
                                                KES {villaRate(villaBedrooms).toLocaleString()} per night{villaBedrooms === VILLA.totalBedrooms ? ' — the whole villa' : ''}
                                            </p>
                                        </div>
                                    )}
                                </section>

                                <section className="space-y-2">
                                    <h3 className={SECTION_H}><span className={SECTION_N}>3</span> {isDayRoom ? 'Date' : 'Dates'}</h3>
                                    <div className="bg-white rounded-xl border border-gray-200 p-1 flex flex-col sm:flex-row gap-1 relative z-40">
                                        <div className="flex-1 relative" onClick={() => setActivePopover(activePopover === 'start' ? null : 'start')}>
                                            <div className={activePopover === 'start' ? FIELD_ON : FIELD_OFF}>
                                                <span className={LABEL + ' block mb-1'}>{isDayRoom ? 'Date' : 'Check-in'}</span>
                                                <div className="flex items-center gap-2">
                                                    <CalendarIcon size={16} className="text-checkout-green flex-shrink-0" />
                                                    <span className={startDate ? 'font-bold text-brand-dark text-sm' : 'font-bold text-gray-500 text-sm'}>
                                                        {startDate ? format(startDate, 'dd MMM yyyy') : 'Select'}
                                                    </span>
                                                </div>
                                            </div>
                                            {activePopover === 'start' && <CalendarPopover type="start" />}
                                        </div>

                                        {!isDayRoom && (
                                            <>
                                                <div className="w-px bg-gray-100 hidden sm:block" />
                                                <div className="flex-1 relative" onClick={() => setActivePopover(activePopover === 'end' ? null : 'end')}>
                                                    <div className={activePopover === 'end' ? FIELD_ON : FIELD_OFF}>
                                                        <span className={LABEL + ' block mb-1'}>Check-out</span>
                                                        <div className="flex items-center gap-2">
                                                            <CalendarIcon size={16} className="text-checkout-green flex-shrink-0" />
                                                            <span className={endDate ? 'font-bold text-brand-dark text-sm' : 'font-bold text-gray-500 text-sm'}>
                                                                {endDate ? format(endDate, 'dd MMM yyyy') : 'Select'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {activePopover === 'end' && <CalendarPopover type="end" />}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    {isRangeInvalid && (
                                        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl border border-red-100 flex items-center gap-2">
                                            <XCircle size={16} className="flex-shrink-0" />
                                            <span className="text-xs font-bold uppercase tracking-widest">Those dates are unavailable</span>
                                        </div>
                                    )}
                                </section>

                                <section className="space-y-2">
                                    <h3 className={SECTION_H}><span className={SECTION_N}>4</span> Guests</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                                            <div>
                                                <p className="font-bold text-brand-dark text-sm">Adults</p>
                                                <p className="text-[11px] text-gray-500 font-bold">13 or above</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button type="button" onClick={() => setAdults(Math.max(1, adults - 1))} disabled={adults <= 1} className={STEP_BTN} aria-label="Fewer adults">
                                                    <Minus size={14} />
                                                </button>
                                                <span className="font-bold w-5 text-center tabular-nums">{adults}</span>
                                                <button type="button" onClick={() => setAdults(adults + 1)} className={STEP_BTN} aria-label="More adults">
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                                            <div>
                                                <p className="font-bold text-brand-dark text-sm">Children</p>
                                                <p className="text-[11px] text-gray-500 font-bold">Ages 0-12</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button type="button" onClick={() => setChildren(Math.max(0, children - 1))} disabled={children <= 0} className={STEP_BTN} aria-label="Fewer children">
                                                    <Minus size={14} />
                                                </button>
                                                <span className="font-bold w-5 text-center tabular-nums">{children}</span>
                                                <button type="button" onClick={() => setChildren(children + 1)} className={STEP_BTN} aria-label="More children">
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {addons.length > 0 && (
                                    <section className="space-y-2">
                                        <h3 className={SECTION_H}><span className={SECTION_N}>5</span> Extras <span className="text-gray-500 font-bold">(optional)</span></h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {addons.map(a => {
                                                const checked = selectedAddons.includes(a.id);
                                                return (
                                                    <button key={a.id} type="button" onClick={() => toggleAddon(a.id)} aria-pressed={checked} className={checked ? EXTRA_ON : EXTRA_OFF}>
                                                        <span className="flex items-center gap-3">
                                                            <span className={checked ? DOT_ON : DOT_OFF}>
                                                                {checked && <Check size={12} className="stroke-[4px]" />}
                                                            </span>
                                                            <span className="font-bold text-brand-dark text-sm">{a.name}</span>
                                                        </span>
                                                        <span className="font-bold text-checkout-green text-sm">KES {Number(a.price).toLocaleString()}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <p className="text-xs text-gray-500 font-bold">Charged once for the stay, not per night.</p>
                                    </section>
                                )}

                                <section className="space-y-2">
                                    <h3 className={SECTION_H}><span className={SECTION_N}>6</span> Your details</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <span className={LABEL}>Full name</span>
                                            <input
                                                required
                                                type="text"
                                                value={guestName}
                                                onChange={(e) => setGuestName(e.target.value)}
                                                placeholder="e.g. Jane Doe"
                                                className={INPUT}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <span className={LABEL}>WhatsApp number</span>
                                            <input
                                                required
                                                type="tel"
                                                value={guestPhone}
                                                onChange={(e) => setGuestPhone(e.target.value)}
                                                placeholder="07XX XXX XXX"
                                                className={guestPhone && !phoneValid ? INPUT_BAD : INPUT}
                                            />
                                            {guestPhone && !phoneValid && (
                                                <p className="text-xs font-bold text-red-500">Enter a valid Kenyan number</p>
                                            )}
                                        </div>
                                    </div>
                                </section>

                                <section className="space-y-2">
                                    <h3 className={SECTION_H}><span className={SECTION_N}>7</span> Payment</h3>

                                    <div className="rounded-xl border-2 border-dashed border-checkout-green/40 bg-checkout-green/5 px-4 py-3">
                                        <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.16em] mb-1">Lipa na M-Pesa · Buy Goods</span>
                                        <div className="flex items-center gap-2.5">
                                            <span className="text-2xl font-bold tracking-[0.1em] text-brand-dark">{TILL_NUMBER}</span>
                                            <button
                                                type="button"
                                                onClick={handleCopyTill}
                                                aria-label="Copy till number"
                                                className="p-1.5 rounded-md bg-white hover:bg-checkout-green hover:text-white text-gray-500 transition-colors border border-gray-100"
                                            >
                                                {tillCopied ? <CheckCircle2 size={15} /> : <Copy size={15} />}
                                            </button>
                                        </div>
                                        <span className="block text-[11px] font-bold text-checkout-green mt-1 tracking-wide">{TILL_NAME}</span>
                                    </div>

                                    <ol className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-1">
                                        {paySteps.map((stepText, i) => (
                                            <li className="flex gap-2 items-start text-[11px] text-gray-600 font-bold" key={i}>
                                                <span className="w-3.5 h-3.5 rounded-full bg-checkout-green/10 text-checkout-green text-[8px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                                                <span>{stepText}</span>
                                            </li>
                                        ))}
                                    </ol>

                                    <div className="space-y-1.5">
                                        <span className={LABEL}>M-Pesa code <span className="text-gray-400">(optional)</span></span>
                                        <input
                                            type="text"
                                            value={mpesaCode}
                                            onChange={(e) => setMpesaCode(e.target.value.toUpperCase())}
                                            placeholder="e.g. SFK3XY9ABC"
                                            maxLength={12}
                                            className={mpesaCode && !mpesaCodeValid ? INPUT_BAD + ' tracking-widest' : INPUT + ' tracking-widest'}
                                        />
                                        <p className={mpesaCode && !mpesaCodeValid ? 'text-xs font-bold text-red-500' : 'text-xs font-bold text-gray-500'}>
                                            {mpesaCode && !mpesaCodeValid
                                                ? 'That does not look like an M-Pesa code.'
                                                : 'Already paid? Paste the code. If not, leave blank and pay after sending.'}
                                        </p>
                                    </div>
                                </section>
                            </div>

                            {/* ---------------- RIGHT: summary rail ---------------- */}
                            <aside className="lg:w-[300px] lg:flex-shrink-0 lg:overflow-y-auto border-t lg:border-t-0 lg:border-l border-gray-100 bg-gray-50/70 px-5 sm:px-6 py-5">
                                <h3 className="font-bold text-brand-dark text-[11px] uppercase tracking-[0.16em] mb-3">Booking Summary</h3>

                                <p className="font-bold text-brand-dark text-sm leading-tight">
                                    {roomType === 'studio' ? STUDIO.label : VILLA.label}
                                </p>
                                <p className="text-xs text-gray-500 font-bold mt-0.5">{stayLabel}</p>

                                {datesChosen && !isRangeInvalid ? (
                                    <>
                                        <div className="mt-3 pt-3 border-t border-gray-200 space-y-1.5 text-[13px]">
                                            <div className="flex justify-between gap-3 text-gray-600 font-bold">
                                                <span className="min-w-0">{rateLine}</span>
                                                <span className="flex-shrink-0 text-brand-dark">{roomTotal.toLocaleString()}</span>
                                            </div>
                                            {selectedAddonItems.map(a => (
                                                <div key={a.id} className="flex justify-between gap-3 text-gray-600 font-bold">
                                                    <span className="min-w-0 truncate">{a.name}</span>
                                                    <span className="flex-shrink-0 text-brand-dark">{Number(a.price).toLocaleString()}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex justify-between items-baseline mt-3 pt-3 border-t border-gray-200">
                                            <span className="font-bold text-brand-dark text-sm">Total (KES)</span>
                                            <span className="text-xl font-bold text-brand-dark tracking-tight">{totalAmount.toLocaleString()}</span>
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-[13px] font-bold text-gray-500 mt-3 pt-3 border-t border-gray-200">
                                        {isDayRoom ? 'Pick a date to see your total.' : 'Pick your dates to see your total.'}
                                    </p>
                                )}

                                {errorMsg && (
                                    <div className="mt-3 bg-red-50 text-red-700 px-3 py-2.5 rounded-lg border border-red-100 flex items-start gap-2">
                                        <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                                        <span className="text-[11px] font-bold">{errorMsg}</span>
                                    </div>
                                )}
                                {roomsLoading && (
                                    <div className="mt-3 flex items-center gap-2 text-gray-500">
                                        <Loader2 size={13} className="animate-spin" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Checking availability</span>
                                    </div>
                                )}

                                <button
                                    onClick={handleBooking}
                                    disabled={!canBook || isSaving}
                                    className="w-full mt-4 bg-checkout-green text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-checkout-green/25 hover:bg-checkout-green-dark disabled:opacity-40 transition-all flex items-center justify-center gap-2"
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 size={17} className="animate-spin" />
                                            Securing your dates
                                        </>
                                    ) : (
                                        <>
                                            <MessageCircle size={17} />
                                            Book on WhatsApp
                                        </>
                                    )}
                                </button>

                                <p className="text-[10px] text-gray-500 font-bold text-center leading-relaxed mt-2">
                                    Opens WhatsApp with your booking ready to send. No payment is taken on this site.
                                </p>
                            </aside>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookingModal;
