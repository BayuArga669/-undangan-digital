'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import {
    Heart,
    Plus,
    Eye,
    Users,
    MessageCircle,
    ExternalLink,
    Trash2,
    LogOut,
    LayoutDashboard,
    Copy,
    Check,
    Shield,
} from 'lucide-react';

interface InvitationItem {
    id: string;
    slug: string;
    groomName: string;
    brideName: string;
    templateId: string;
    eventDate: string | null;
    isPublished: boolean;
    viewCount: number;
    createdAt: string;
    _count: { guests: number; wishes: number };
    guests: { id: string }[];
}

export default function DashboardPage() {
    const { data: session } = useSession();
    const [invitations, setInvitations] = useState<InvitationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [copiedSlug, setCopiedSlug] = useState('');

    useEffect(() => {
        fetchInvitations();
    }, []);

    const fetchInvitations = async () => {
        try {
            const res = await fetch('/api/invitations');
            const data = await res.json();
            setInvitations(data);
        } catch (err) {
            console.error('Error fetching invitations:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Apakah Anda yakin ingin menghapus undangan ini?')) return;

        try {
            await fetch(`/api/invitations/${id}`, { method: 'DELETE' });
            setInvitations((prev) => prev.filter((inv) => inv.id !== id));
        } catch (err) {
            console.error('Error deleting invitation:', err);
        }
    };

    const copyLink = (slug: string) => {
        navigator.clipboard.writeText(`${window.location.origin}/${slug}`);
        setCopiedSlug(slug);
        setTimeout(() => setCopiedSlug(''), 2000);
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg-alt)' }}>
            {/* Sidebar / Header */}
            <header
                className="glass"
                style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 40,
                    padding: '16px 0',
                    borderBottom: '1px solid var(--color-border)',
                }}
            >
                <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                        <LayoutDashboard size={22} style={{ color: 'var(--color-primary)' }} />
                        <span className="font-display" style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-text)' }}>
                            Dashboard
                        </span>
                    </Link>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                            Halo, <strong>{session?.user?.name}</strong>
                        </span>
                        {(session?.user as { role?: string })?.role === 'ADMIN' && (
                            <Link
                                href="/admin"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    color: '#6D28D9',
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    textDecoration: 'none',
                                    padding: '4px 10px',
                                    borderRadius: 'var(--radius-md)',
                                    background: '#EDE9FE',
                                }}
                            >
                                <Shield size={14} /> Admin
                            </Link>
                        )}
                        <Link href="/" style={{ color: 'var(--color-text-muted)', display: 'flex' }}>
                            <Heart size={18} />
                        </Link>
                        <button
                            onClick={() => signOut({ callbackUrl: '/' })}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}
                        >
                            <LogOut size={16} /> Keluar
                        </button>
                    </div>
                </div>
            </header>

            <main className="container" style={{ padding: '40px 24px' }}>
                {/* Stats Overview */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '16px',
                        marginBottom: '40px',
                    }}
                >
                    {[
                        { label: 'Total Undangan', value: invitations.length, icon: Heart, color: 'var(--color-primary)' },
                        { label: 'Total Tamu RSVP', value: invitations.reduce((acc, inv) => acc + inv._count.guests, 0), icon: Users, color: '#6b8f71' },
                        { label: 'Total Ucapan', value: invitations.reduce((acc, inv) => acc + inv._count.wishes, 0), icon: MessageCircle, color: '#b48ec5' },
                        { label: 'Total Views', value: invitations.reduce((acc, inv) => acc + inv.viewCount, 0), icon: Eye, color: 'var(--color-accent)' },
                    ].map((stat) => (
                        <div key={stat.label} className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div
                                style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: 'var(--radius-md)',
                                    background: `${stat.color}15`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                }}
                            >
                                <stat.icon size={22} style={{ color: stat.color }} />
                            </div>
                            <div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stat.value}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{stat.label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 className="font-display" style={{ fontSize: '1.4rem', fontWeight: 700 }}>Undangan Saya</h2>
                    <Link href="/dashboard/create" className="btn btn-primary">
                        <Plus size={18} /> Buat Undangan
                    </Link>
                </div>

                {/* Invitation List */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: 'var(--color-text-muted)' }}>
                        Memuat...
                    </div>
                ) : invitations.length === 0 ? (
                    <div
                        className="card"
                        style={{
                            textAlign: 'center',
                            padding: '60px',
                        }}
                    >
                        <Heart size={48} style={{ color: 'var(--color-primary-light)', marginBottom: '16px' }} />
                        <h3 className="font-display" style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>
                            Belum Ada Undangan
                        </h3>
                        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
                            Mulai buat undangan digital pertama Anda sekarang!
                        </p>
                        <Link href="/dashboard/create" className="btn btn-primary">
                            <Plus size={18} /> Buat Undangan Pertama
                        </Link>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '16px' }}>
                        {invitations.map((inv) => (
                            <div
                                key={inv.id}
                                className="card"
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    flexWrap: 'wrap',
                                    gap: '16px',
                                }}
                            >
                                <div style={{ flex: 1, minWidth: '200px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                                        <h3 className="font-display" style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                                            {inv.groomName && inv.brideName
                                                ? `${inv.groomName} & ${inv.brideName}`
                                                : 'Undangan Baru'}
                                        </h3>
                                        <span
                                            style={{
                                                padding: '2px 10px',
                                                borderRadius: 'var(--radius-full)',
                                                fontSize: '0.7rem',
                                                fontWeight: 600,
                                                background: inv.isPublished ? '#DEF7EC' : '#FEF3C7',
                                                color: inv.isPublished ? '#03543F' : '#92400E',
                                            }}
                                        >
                                            {inv.isPublished ? 'Published' : 'Draft'}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                                        <span>/{inv.slug}</span>
                                        {inv.eventDate && (
                                            <span>{format(new Date(inv.eventDate), 'dd MMM yyyy', { locale: idLocale })}</span>
                                        )}
                                        <span>{inv._count.guests} tamu</span>
                                        <span>{inv._count.wishes} ucapan</span>
                                        <span>{inv.viewCount} views</span>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    <button
                                        onClick={() => copyLink(inv.slug)}
                                        className="btn btn-secondary btn-sm"
                                        title="Salin link"
                                    >
                                        {copiedSlug === inv.slug ? <Check size={14} /> : <Copy size={14} />}
                                        {copiedSlug === inv.slug ? 'Tersalin!' : 'Salin Link'}
                                    </button>
                                    <Link
                                        href={`/${inv.slug}`}
                                        target="_blank"
                                        className="btn btn-secondary btn-sm"
                                    >
                                        <ExternalLink size={14} /> Preview
                                    </Link>
                                    <Link
                                        href={`/dashboard/${inv.id}`}
                                        className="btn btn-primary btn-sm"
                                    >
                                        Kelola
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(inv.id)}
                                        className="btn btn-sm"
                                        style={{
                                            background: '#FEF2F2',
                                            color: '#DC2626',
                                            border: '1px solid #FECACA',
                                        }}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
