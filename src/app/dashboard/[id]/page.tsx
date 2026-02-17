'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import {
    ArrowLeft,
    Users,
    MessageCircle,
    Eye,
    ExternalLink,
    Copy,
    Check,
    UserPlus,
    Plus,
} from 'lucide-react';

interface Guest {
    id: string;
    name: string;
    phone: string;
    group: string;
    rsvpStatus: string;
    rsvpCount: number;
    createdAt: string;
}

interface Wish {
    id: string;
    guestName: string;
    message: string;
    createdAt: string;
}

interface InvitationDetail {
    id: string;
    slug: string;
    groomName: string;
    brideName: string;
    templateId: string;
    eventDate: string | null;
    venue: string;
    isPublished: boolean;
    viewCount: number;
    guests: Guest[];
    wishes: Wish[];
    _count: { guests: number; wishes: number };
}

export default function InvitationDetailPage() {
    const params = useParams();
    const [invitation, setInvitation] = useState<InvitationDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<'guests' | 'wishes'>('guests');
    const [copied, setCopied] = useState(false);
    const [showAddGuest, setShowAddGuest] = useState(false);
    const [newGuestName, setNewGuestName] = useState('');
    const [newGuestGroup, setNewGuestGroup] = useState('Umum');

    useEffect(() => {
        fetchInvitation();
    }, []);

    const fetchInvitation = async () => {
        try {
            const res = await fetch(`/api/invitations/${params.id}`);
            if (res.ok) {
                const data = await res.json();
                setInvitation(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const copyLink = () => {
        if (!invitation) return;
        navigator.clipboard.writeText(`${window.location.origin}/${invitation.slug}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const addGuest = async () => {
        if (!newGuestName.trim() || !invitation) return;
        try {
            await fetch('/api/rsvp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    invitationId: invitation.id,
                    name: newGuestName,
                    rsvpStatus: 'PENDING',
                }),
            });
            setNewGuestName('');
            setShowAddGuest(false);
            fetchInvitation();
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-alt)' }}>
                <p style={{ color: 'var(--color-text-muted)' }}>Memuat...</p>
            </div>
        );
    }

    if (!invitation) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-alt)' }}>
                <div style={{ textAlign: 'center' }}>
                    <p style={{ marginBottom: '16px' }}>Undangan tidak ditemukan</p>
                    <Link href="/dashboard" className="btn btn-primary">Kembali ke Dashboard</Link>
                </div>
            </div>
        );
    }

    const attending = invitation.guests.filter((g) => g.rsvpStatus === 'ATTENDING');
    const notAttending = invitation.guests.filter((g) => g.rsvpStatus === 'NOT_ATTENDING');
    const pending = invitation.guests.filter((g) => g.rsvpStatus === 'PENDING');

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg-alt)' }}>
            <header className="glass" style={{ position: 'sticky', top: 0, zIndex: 40, padding: '16px 0', borderBottom: '1px solid var(--color-border)' }}>
                <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'var(--color-text)' }}>
                        <ArrowLeft size={18} />
                        <span className="font-display" style={{ fontWeight: 700 }}>
                            {invitation.groomName} & {invitation.brideName}
                        </span>
                    </Link>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={copyLink} className="btn btn-secondary btn-sm">
                            {copied ? <Check size={14} /> : <Copy size={14} />}
                            {copied ? 'Tersalin!' : 'Salin Link'}
                        </button>
                        <Link href={`/${invitation.slug}`} target="_blank" className="btn btn-primary btn-sm">
                            <ExternalLink size={14} /> Lihat Undangan
                        </Link>
                    </div>
                </div>
            </header>

            <main className="container" style={{ padding: '32px 24px', maxWidth: '900px' }}>
                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '32px' }}>
                    {[
                        { label: 'Views', value: invitation.viewCount, icon: Eye, color: 'var(--color-accent)' },
                        { label: 'Hadir', value: attending.length, icon: Users, color: '#22C55E' },
                        { label: 'Tidak Hadir', value: notAttending.length, icon: Users, color: '#EF4444' },
                        { label: 'Belum Konfirmasi', value: pending.length, icon: Users, color: '#F59E0B' },
                        { label: 'Ucapan', value: invitation.wishes.length, icon: MessageCircle, color: '#8B5CF6' },
                    ].map((stat) => (
                        <div key={stat.label} className="card" style={{ textAlign: 'center', padding: '16px' }}>
                            <stat.icon size={20} style={{ color: stat.color, marginBottom: '6px' }} />
                            <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{stat.value}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '0', marginBottom: '24px' }}>
                    {(['guests', 'wishes'] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            style={{
                                flex: 1,
                                padding: '12px',
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontSize: '0.9rem',
                                background: tab === t ? 'var(--color-primary)' : 'var(--color-surface)',
                                color: tab === t ? 'white' : 'var(--color-text-secondary)',
                                borderRadius: t === 'guests' ? 'var(--radius-md) 0 0 var(--radius-md)' : '0 var(--radius-md) var(--radius-md) 0',
                            }}
                        >
                            {t === 'guests' ? `Tamu (${invitation.guests.length})` : `Ucapan (${invitation.wishes.length})`}
                        </button>
                    ))}
                </div>

                {/* Guests Tab */}
                {tab === 'guests' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                            <button onClick={() => setShowAddGuest(!showAddGuest)} className="btn btn-primary btn-sm">
                                <UserPlus size={14} /> Tambah Tamu
                            </button>
                        </div>

                        {showAddGuest && (
                            <div className="card" style={{ marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                                <div style={{ flex: 1 }}>
                                    <label className="input-label">Nama Tamu</label>
                                    <input className="input-field" placeholder="Nama tamu" value={newGuestName} onChange={(e) => setNewGuestName(e.target.value)} />
                                </div>
                                <div>
                                    <label className="input-label">Grup</label>
                                    <select className="input-field" value={newGuestGroup} onChange={(e) => setNewGuestGroup(e.target.value)}>
                                        <option value="Umum">Umum</option>
                                        <option value="Keluarga">Keluarga</option>
                                        <option value="VIP">VIP</option>
                                        <option value="Teman">Teman</option>
                                    </select>
                                </div>
                                <button onClick={addGuest} className="btn btn-primary btn-sm">
                                    <Plus size={14} /> Tambah
                                </button>
                            </div>
                        )}

                        {invitation.guests.length === 0 ? (
                            <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
                                <p style={{ color: 'var(--color-text-muted)' }}>Belum ada tamu yang RSVP</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gap: '8px' }}>
                                {invitation.guests.map((guest) => (
                                    <div key={guest.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px' }}>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{guest.name}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                                {guest.group} • {guest.rsvpCount} orang • {format(new Date(guest.createdAt), 'dd MMM yyyy', { locale: idLocale })}
                                            </div>
                                        </div>
                                        <span
                                            style={{
                                                padding: '4px 12px',
                                                borderRadius: 'var(--radius-full)',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                background:
                                                    guest.rsvpStatus === 'ATTENDING' ? '#DEF7EC' :
                                                        guest.rsvpStatus === 'NOT_ATTENDING' ? '#FDE8E8' : '#FEF3C7',
                                                color:
                                                    guest.rsvpStatus === 'ATTENDING' ? '#03543F' :
                                                        guest.rsvpStatus === 'NOT_ATTENDING' ? '#9B1C1C' : '#92400E',
                                            }}
                                        >
                                            {guest.rsvpStatus === 'ATTENDING' ? 'Hadir' : guest.rsvpStatus === 'NOT_ATTENDING' ? 'Tidak Hadir' : 'Pending'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Wishes Tab */}
                {tab === 'wishes' && (
                    <div>
                        {invitation.wishes.length === 0 ? (
                            <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
                                <p style={{ color: 'var(--color-text-muted)' }}>Belum ada ucapan</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gap: '8px' }}>
                                {invitation.wishes.map((wish) => (
                                    <div key={wish.id} className="card" style={{ padding: '16px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <span style={{ fontWeight: 600 }}>{wish.guestName}</span>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                                {format(new Date(wish.createdAt), 'dd MMM yyyy', { locale: idLocale })}
                                            </span>
                                        </div>
                                        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>{wish.message}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
