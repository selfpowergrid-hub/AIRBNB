'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
    Loader2, LogOut, ShieldCheck, RefreshCw, CheckCircle2, XCircle,
    Trash2, AlertCircle, Search, ArrowLeft,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

// Staff console. Unlike the old in-modal panel, access here is a real Supabase
// Auth session, so the row level security policies in the migration apply to
// every query. Create staff users in the Supabase dashboard (Authentication →
// Users); there is no self-service sign-up.

interface Reservation {
    id: string;
    booking_ref: string | null;
    guest_name: string;
    guest_phone: string;
    check_in: string;
    check_out: string;
    nights: number | null;
    adults: number | null;
    children: number | null;
    total_amount: number | null;
    addons_total: number | null;
    addon_items: { name: string; price: number }[] | null;
    mpesa_code: string | null;
    payment_status: string;
    status: string;
    created_at: string;
    rooms?: { name: string } | null;
}

interface RoomRow {
    id: string;
    name: string;
    price_per_night: number;
}

const PAYMENT_LABELS: Record<string, { label: string; className: string }> = {
    awaiting_payment: { label: 'Awaiting payment', className: 'bg-gray-100 text-gray-600' },
    awaiting_verification: { label: 'Verify payment', className: 'bg-amber-100 text-amber-800' },
    paid: { label: 'Paid', className: 'bg-green-100 text-green-700' },
    refunded: { label: 'Refunded', className: 'bg-blue-100 text-blue-700' },
    failed: { label: 'Failed', className: 'bg-red-100 text-red-700' },
};

export default function ManageBookingsPage() {
    const [checkingSession, setCheckingSession] = useState(true);
    const [signedIn, setSignedIn] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [authError, setAuthError] = useState('');
    const [authBusy, setAuthBusy] = useState(false);

    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [rooms, setRooms] = useState<RoomRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [query, setQuery] = useState('');
    const [tab, setTab] = useState<'reservations' | 'rates'>('reservations');
    const [savingRoomId, setSavingRoomId] = useState<string | null>(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            setSignedIn(!!data.session);
            setCheckingSession(false);
        });
        const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
            setSignedIn(!!session);
        });
        return () => sub.subscription.unsubscribe();
    }, []);

    const loadData = useCallback(async () => {
        setLoading(true);
        setError('');

        const [bookingsRes, roomsRes] = await Promise.all([
            supabase.from('bookings').select('*, rooms(name)').order('created_at', { ascending: false }),
            supabase.from('rooms').select('id, name, price_per_night').order('name'),
        ]);

        if (bookingsRes.error) setError('Could not load reservations: ' + bookingsRes.error.message);
        else setReservations(bookingsRes.data as Reservation[]);

        if (roomsRes.error) setError(prev => prev || 'Could not load rooms: ' + roomsRes.error!.message);
        else setRooms(roomsRes.data as RoomRow[]);

        setLoading(false);
    }, []);

    useEffect(() => {
        if (!signedIn) return;
        // Deferred to a microtask: calling loadData synchronously here would set
        // state during the effect and cascade an extra render.
        let cancelled = false;
        void Promise.resolve().then(() => {
            if (!cancelled) loadData();
        });
        return () => { cancelled = true; };
    }, [signedIn, loadData]);

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthBusy(true);
        setAuthError('');
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        setAuthBusy(false);
        if (error) {
            setAuthError(error.message);
            return;
        }
        setPassword('');
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        setReservations([]);
        setRooms([]);
    };

    const setPaymentStatus = async (id: string, payment_status: string) => {
        setError('');
        const { error } = await supabase.from('bookings').update({ payment_status }).eq('id', id);
        if (error) {
            setError('Could not update payment: ' + error.message);
            return;
        }
        setReservations(prev => prev.map(r => (r.id === id ? { ...r, payment_status } : r)));
    };

    const cancelReservation = async (id: string) => {
        if (!confirm('Cancel this booking and free up the dates?')) return;
        const { error } = await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', id);
        if (error) {
            setError('Could not cancel: ' + error.message);
            return;
        }
        setReservations(prev => prev.map(r => (r.id === id ? { ...r, status: 'cancelled' } : r)));
    };

    const deleteReservation = async (id: string) => {
        if (!confirm('Permanently delete this record? This cannot be undone.')) return;
        const { error } = await supabase.from('bookings').delete().eq('id', id);
        if (error) {
            setError('Could not delete: ' + error.message);
            return;
        }
        setReservations(prev => prev.filter(r => r.id !== id));
    };

    const saveRoomRate = async (room: RoomRow, price: number) => {
        setSavingRoomId(room.id);
        setError('');
        const { error } = await supabase.from('rooms').update({ price_per_night: price }).eq('id', room.id);
        setSavingRoomId(null);
        if (error) {
            setError('Could not save rate: ' + error.message);
            return;
        }
        setRooms(prev => prev.map(r => (r.id === room.id ? { ...r, price_per_night: price } : r)));
    };

    const filtered = reservations.filter(r => {
        if (!query.trim()) return true;
        const q = query.toLowerCase();
        return (
            (r.guest_name || '').toLowerCase().includes(q) ||
            (r.guest_phone || '').includes(q) ||
            (r.booking_ref || '').toLowerCase().includes(q) ||
            (r.mpesa_code || '').toLowerCase().includes(q)
        );
    });

    const toVerify = reservations.filter(r => r.payment_status === 'awaiting_verification').length;

    // ------------------------------------------------------------------
    if (checkingSession) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 size={32} className="animate-spin text-brand-teal" />
            </main>
        );
    }

    if (!signedIn) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <form
                    onSubmit={handleSignIn}
                    className="w-full max-w-sm bg-white rounded-3xl shadow-xl ring-1 ring-gray-900/5 p-8 space-y-5"
                >
                    <div className="w-14 h-14 rounded-2xl bg-brand-teal/10 text-brand-teal flex items-center justify-center mx-auto">
                        <ShieldCheck size={28} />
                    </div>
                    <div className="text-center">
                        <h1 className="text-xl font-bold text-brand-dark">Staff Sign In</h1>
                        <p className="text-sm text-gray-500 font-medium mt-1">Port Hill reservations</p>
                    </div>

                    <div className="space-y-3">
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="Email"
                            autoComplete="username"
                            className="w-full p-4 bg-gray-50 border border-gray-100 focus:border-brand-teal focus:bg-white rounded-2xl outline-none font-bold text-brand-dark transition-all"
                        />
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Password"
                            autoComplete="current-password"
                            className="w-full p-4 bg-gray-50 border border-gray-100 focus:border-brand-teal focus:bg-white rounded-2xl outline-none font-bold text-brand-dark transition-all"
                        />
                    </div>

                    {authError && (
                        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-2xl border border-red-100 flex items-start gap-2">
                            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                            <span className="text-sm font-bold">{authError}</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={authBusy}
                        className="w-full bg-brand-teal text-white py-4 rounded-2xl font-bold hover:bg-brand-teal/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    >
                        {authBusy ? <Loader2 size={20} className="animate-spin" /> : 'Sign In'}
                    </button>

                    <Link href="/" className="flex items-center justify-center gap-2 text-xs font-bold text-gray-500 hover:text-brand-teal uppercase tracking-widest transition-colors">
                        <ArrowLeft size={14} /> Back to site
                    </Link>
                </form>
            </main>
        );
    }

    // ------------------------------------------------------------------
    return (
        <main className="min-h-screen bg-gray-50">
            <header className="bg-white border-b border-gray-100 sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-teal/10 text-brand-teal flex items-center justify-center">
                            <ShieldCheck size={20} />
                        </div>
                        <div>
                            <h1 className="font-bold text-brand-dark leading-tight">Reservations</h1>
                            <p className="text-xs text-gray-500 font-bold">Port Hill staff console</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={loadData}
                            className="p-2.5 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
                            aria-label="Refresh"
                        >
                            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        </button>
                        <button
                            onClick={handleSignOut}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs uppercase tracking-widest transition-colors"
                        >
                            <LogOut size={14} /> Sign out
                        </button>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-1">
                    {(['reservations', 'rates'] as const).map(t => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={tab === t
                                ? 'px-4 py-3 text-xs font-bold uppercase tracking-widest text-brand-teal border-b-2 border-brand-teal'
                                : 'px-4 py-3 text-xs font-bold uppercase tracking-widest text-gray-500 border-b-2 border-transparent hover:text-gray-600'}
                        >
                            {t === 'reservations' ? 'Reservations' : 'Room rates'}
                            {t === 'reservations' && toVerify > 0 && (
                                <span className="ml-2 bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">{toVerify}</span>
                            )}
                        </button>
                    ))}
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-5">
                {error && (
                    <div className="bg-red-50 text-red-700 px-6 py-4 rounded-2xl border border-red-100 flex items-start gap-3">
                        <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
                        <span className="text-sm font-bold">{error}</span>
                    </div>
                )}

                {tab === 'reservations' ? (
                    <>
                        <div className="relative max-w-md">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                placeholder="Search name, phone, reference or M-Pesa code"
                                className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-100 focus:border-brand-teal rounded-2xl outline-none font-bold text-sm text-brand-dark transition-all"
                            />
                        </div>

                        {loading && reservations.length === 0 ? (
                            <div className="flex items-center justify-center gap-3 py-20 text-gray-500">
                                <Loader2 size={20} className="animate-spin" />
                                <span className="font-bold text-xs uppercase tracking-widest">Loading</span>
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="bg-white rounded-3xl ring-1 ring-gray-900/5 py-20 text-center">
                                <p className="font-bold text-brand-dark">No reservations found</p>
                                <p className="text-sm text-gray-500 font-medium mt-1">
                                    {query ? 'Try a different search.' : 'New bookings will appear here.'}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filtered.map(r => {
                                    const badge = PAYMENT_LABELS[r.payment_status] || PAYMENT_LABELS.awaiting_payment;
                                    const cancelled = r.status === 'cancelled';
                                    return (
                                        <div
                                            key={r.id}
                                            className={cancelled
                                                ? 'bg-white rounded-3xl ring-1 ring-gray-900/5 p-6 opacity-60'
                                                : 'bg-white rounded-3xl ring-1 ring-gray-900/5 p-6'}
                                        >
                                            <div className="flex flex-wrap items-start justify-between gap-4">
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-3 flex-wrap">
                                                        <span className="font-bold text-brand-dark text-lg">{r.guest_name}</span>
                                                        <span className={'text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ' + badge.className}>
                                                            {badge.label}
                                                        </span>
                                                        {cancelled && (
                                                            <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-gray-200 text-gray-600">
                                                                Cancelled
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-500 font-bold mt-1">
                                                        {r.booking_ref || 'no ref'} &middot; {r.guest_phone}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-2xl font-bold text-brand-dark tracking-tight">
                                                        KES {Number(r.total_amount || 0).toLocaleString()}
                                                    </p>
                                                    {r.mpesa_code && (
                                                        <p className="text-xs font-bold text-brand-teal tracking-widest mt-0.5">{r.mpesa_code}</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-5 border-t border-gray-100 text-sm">
                                                <div>
                                                    <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">Room</span>
                                                    <span className="font-bold text-brand-dark">{r.rooms?.name || '-'}</span>
                                                </div>
                                                <div>
                                                    <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">Check-in</span>
                                                    <span className="font-bold text-brand-dark">{r.check_in}</span>
                                                </div>
                                                <div>
                                                    <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">Check-out</span>
                                                    <span className="font-bold text-brand-dark">{r.check_out}</span>
                                                </div>
                                                <div>
                                                    <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">Guests</span>
                                                    <span className="font-bold text-brand-dark">
                                                        {r.adults ?? 0} adults, {r.children ?? 0} children
                                                    </span>
                                                </div>
                                            </div>

                                            {r.addon_items && r.addon_items.length > 0 && (
                                                <p className="text-sm text-gray-600 font-bold mt-4">
                                                    Extras: {r.addon_items.map(a => a.name).join(', ')}
                                                    {' '}(KES {Number(r.addons_total || 0).toLocaleString()})
                                                </p>
                                            )}

                                            <div className="flex flex-wrap gap-2 mt-5">
                                                {r.payment_status !== 'paid' && (
                                                    <button
                                                        onClick={() => setPaymentStatus(r.id, 'paid')}
                                                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 font-bold text-xs uppercase tracking-widest transition-colors"
                                                    >
                                                        <CheckCircle2 size={14} /> Mark paid
                                                    </button>
                                                )}
                                                {r.payment_status === 'awaiting_verification' && (
                                                    <button
                                                        onClick={() => setPaymentStatus(r.id, 'failed')}
                                                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 font-bold text-xs uppercase tracking-widest transition-colors"
                                                    >
                                                        <XCircle size={14} /> Payment not found
                                                    </button>
                                                )}
                                                {!cancelled && (
                                                    <button
                                                        onClick={() => cancelReservation(r.id)}
                                                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 font-bold text-xs uppercase tracking-widest transition-colors"
                                                    >
                                                        <XCircle size={14} /> Cancel
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => deleteReservation(r.id)}
                                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 font-bold text-xs uppercase tracking-widest transition-colors"
                                                >
                                                    <Trash2 size={14} /> Delete
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="space-y-3">
                        {rooms.length === 0 && !loading && (
                            <div className="bg-white rounded-3xl ring-1 ring-gray-900/5 py-20 text-center">
                                <p className="font-bold text-brand-dark">No rooms yet</p>
                            </div>
                        )}
                        {rooms.map(room => (
                            <form
                                key={room.id}
                                onSubmit={e => {
                                    e.preventDefault();
                                    const value = Number(new FormData(e.currentTarget).get('price'));
                                    if (Number.isFinite(value) && value >= 0) saveRoomRate(room, value);
                                }}
                                className="bg-white rounded-3xl ring-1 ring-gray-900/5 p-6 flex flex-wrap items-end gap-4"
                            >
                                <div className="flex-1 min-w-[200px]">
                                    <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Room</span>
                                    <span className="font-bold text-brand-dark text-lg">{room.name}</span>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                                        Price per night (KES)
                                    </label>
                                    <input
                                        name="price"
                                        type="number"
                                        min={0}
                                        step={50}
                                        defaultValue={room.price_per_night}
                                        className="w-40 p-3 bg-gray-50 border border-gray-100 focus:border-brand-teal focus:bg-white rounded-xl outline-none font-bold text-brand-dark transition-all"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={savingRoomId === room.id}
                                    className="px-6 py-3 rounded-xl bg-brand-teal text-white font-bold text-xs uppercase tracking-widest hover:bg-brand-teal/90 disabled:opacity-50 transition-colors flex items-center gap-2"
                                >
                                    {savingRoomId === room.id ? <Loader2 size={14} className="animate-spin" /> : 'Save'}
                                </button>
                            </form>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
