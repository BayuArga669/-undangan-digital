'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import {
    Heart, MapPin, Calendar, Clock, Send, Volume2, VolumeX,
    ChevronDown, Copy, Check, MessageCircle, Wallet, Navigation,
    X, Home, Users, Image, MapPinned,
} from 'lucide-react';
import { getTemplateById } from '@/lib/templates';
import GoldenLeaf, { FloatingParticles } from './GoldenLeaf';
import GoldDivider from './GoldDivider';

interface Wish { id: string; guestName: string; message: string; createdAt: string; }
interface InvitationData {
    id: string; slug: string; templateId: string;
    groomName: string; brideName: string; groomPhoto: string; bridePhoto: string;
    groomFather: string; groomMother: string; brideFather: string; brideMother: string;
    coverPhoto?: string;
    eventDate: string | null; akadDate: string | null; akadTime: string; receptionTime: string;
    venue: string; venueAddress: string; lat: number | null; lng: number | null;
    story: string; galleryPhotos: string; musicUrl: string;
    bankName: string; bankAccount: string; bankHolder: string; qrisImage: string;
    wishes: Wish[];
}
interface Props { invitation: InvitationData; guestName: string; isFreePlan: boolean; }

const gold = '#8B6914';
const goldLight = '#DAA520';
const goldDark = '#6B4F0A';
const cream = '#FFF8F0';
const creamDark = '#F5EDE0';

const fadeUp = { hidden: { opacity: 0, y: 60 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' as const } } };
const fadeIn = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.6 } } };
const scaleUp = { hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.6 } } };
const stagger = { visible: { transition: { staggerChildren: 0.15 } } };
const slideLeft = { hidden: { opacity: 0, x: -60 }, visible: { opacity: 1, x: 0, transition: { duration: 0.7 } } };
const slideRight = { hidden: { opacity: 0, x: 60 }, visible: { opacity: 1, x: 0, transition: { duration: 0.7 } } };

export default function InvitationView({ invitation, guestName, isFreePlan }: Props) {
    const template = getTemplateById(invitation.templateId);
    const [opened, setOpened] = useState(false);
    const [muted, setMuted] = useState(true);
    const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [rsvpName, setRsvpName] = useState(guestName);
    const [rsvpStatus, setRsvpStatus] = useState('ATTENDING');
    const [rsvpCount, setRsvpCount] = useState(1);
    const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
    const [wishName, setWishName] = useState(guestName);
    const [wishMessage, setWishMessage] = useState('');
    const [wishes, setWishes] = useState<Wish[]>(invitation.wishes);
    const [wishSubmitted, setWishSubmitted] = useState(false);
    const [copiedAccount, setCopiedAccount] = useState(false);
    const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);
    const [activeSection, setActiveSection] = useState('home');
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const galleryPhotos: string[] = JSON.parse(invitation.galleryPhotos || '[]');
    const couplePhoto = invitation.groomPhoto || invitation.bridePhoto || '';

    // Countdown timer
    useEffect(() => {
        if (!invitation.eventDate) return;
        const target = new Date(invitation.eventDate).getTime();
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const diff = target - now;
            if (diff <= 0) { setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 }); clearInterval(interval); return; }
            setCountdown({
                days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((diff % (1000 * 60)) / 1000),
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [invitation.eventDate]);

    // Audio
    useEffect(() => {
        if (opened && invitation.musicUrl && audioRef.current) {
            audioRef.current.play().catch(() => { });
            setMuted(false);
        }
    }, [opened, invitation.musicUrl]);

    // Track active section for bottom nav
    useEffect(() => {
        if (!opened) return;
        const sectionIds = ['home', 'profile', 'event', 'galleries', 'location', 'comment'];
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) setActiveSection(entry.target.id);
            });
        }, { threshold: 0.3 });
        sectionIds.forEach((id) => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });
        return () => observer.disconnect();
    }, [opened]);

    const toggleMusic = () => {
        if (audioRef.current) {
            if (muted) audioRef.current.play().catch(() => { });
            else audioRef.current.pause();
            setMuted(!muted);
        }
    };

    const submitRsvp = async () => {
        try {
            await fetch('/api/rsvp', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ invitationId: invitation.id, name: rsvpName, rsvpStatus, rsvpCount })
            });
            setRsvpSubmitted(true);
        } catch (err) { console.error(err); }
    };

    const submitWish = async () => {
        try {
            const res = await fetch('/api/wishes', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ invitationId: invitation.id, guestName: wishName, message: wishMessage })
            });
            const wish = await res.json();
            setWishes([wish, ...wishes]);
            setWishMessage('');
            setWishSubmitted(true);
            setTimeout(() => setWishSubmitted(false), 3000);
        } catch (err) { console.error(err); }
    };

    const openMaps = () => {
        if (invitation.lat && invitation.lng) window.open(`https://www.google.com/maps?q=${invitation.lat},${invitation.lng}`, '_blank');
        else if (invitation.venueAddress) window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(invitation.venueAddress)}`, '_blank');
    };

    const copyBankAccount = () => {
        navigator.clipboard.writeText(invitation.bankAccount);
        setCopiedAccount(true);
        setTimeout(() => setCopiedAccount(false), 2000);
    };

    const scrollTo = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    const sectionPadding: React.CSSProperties = { padding: '80px 24px 100px', textAlign: 'center', position: 'relative', overflow: 'hidden' };

    // ==================== COVER / OPENING ====================
    if (!opened) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#FFFFFF', color: '#2d2518', textAlign: 'center', padding: '24px', position: 'relative', overflow: 'hidden' }}>
                {/* Background */}
                {invitation.coverPhoto ? (
                    <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
                        <img src={invitation.coverPhoto} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.7))' }} />
                    </div>
                ) : (
                    /* Cloud/Watercolor Background Effect */
                    <div style={{ position: 'absolute', inset: 0, opacity: 0.6, zIndex: 0, background: 'radial-gradient(circle at 10% 20%, #F5E6D3 0%, transparent 40%), radial-gradient(circle at 90% 80%, #F5E6D3 0%, transparent 40%)', filter: 'blur(40px)' }} />
                )}

                {!invitation.coverPhoto && (
                    <>
                        <GoldenLeaf position="top-left" size={280} opacity={1} variant="rustic" style={{ transform: 'translate(-40px, -40px) rotate(-10deg)' }} />
                        <GoldenLeaf position="top-right" size={200} opacity={0.6} variant="rustic" style={{ transform: 'scaleX(-1) translate(-20px, 20px)' }} />
                        <GoldenLeaf position="bottom-left" size={180} opacity={0.6} variant="rustic" />
                        <GoldenLeaf position="bottom-right" size={300} opacity={1} variant="rustic" style={{ transform: 'scale(-1, -1) translate(-30px, -30px)' }} />
                    </>
                )}

                <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: 'easeOut' }} style={{ position: 'relative', zIndex: 5 }}>
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} style={{ fontSize: '1rem', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '20px', color: invitation.coverPhoto ? '#F5E6D3' : '#8B6914', fontWeight: 600 }}>
                        The Wedding Of
                    </motion.p>

                    <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8 }}
                        style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2.5rem, 9vw, 3.8rem)', fontWeight: 700, color: invitation.coverPhoto ? '#FFFFFF' : '#6B4F0A', lineHeight: 1.1, marginBottom: '0', textShadow: '0 2px 10px rgba(139, 105, 20, 0.1)' }}>
                        {invitation.groomName}
                    </motion.h1>
                    <motion.p initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8, type: 'spring' }}
                        style={{ fontFamily: "'Great Vibes', cursive", fontSize: '2.8rem', color: invitation.coverPhoto ? '#F5E6D3' : '#B8860B', margin: '0' }}>&amp;</motion.p>
                    <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.8 }}
                        style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2.5rem, 9vw, 3.8rem)', fontWeight: 700, color: invitation.coverPhoto ? '#FFFFFF' : '#6B4F0A', lineHeight: 1.1, marginBottom: '32px', textShadow: '0 2px 10px rgba(139, 105, 20, 0.1)' }}>
                        {invitation.brideName}
                    </motion.h1>

                    {guestName && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}
                            style={{ marginBottom: '24px', padding: '16px 32px', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(5px)', borderRadius: '16px', border: '1px solid rgba(139, 105, 20, 0.15)', boxShadow: '0 4px 20px rgba(139, 105, 20, 0.05)' }}>
                            <p style={{ fontSize: '0.8rem', opacity: 0.6, marginBottom: '6px', letterSpacing: '1px', fontStyle: 'italic' }}>Kepada Yth.</p>
                            <p style={{ fontSize: '1.4rem', fontWeight: 700, fontFamily: "'Playfair Display', serif", color: '#333' }}>{guestName}</p>
                        </motion.div>
                    )}

                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.3 }}
                        onClick={() => setOpened(true)}
                        style={{ padding: '14px 44px', borderRadius: '50px', border: 'none', background: '#8B6914', color: 'white', fontWeight: 500, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 auto', boxShadow: '0 8px 25px rgba(139, 105, 20, 0.25)', fontFamily: "'Inter', sans-serif", letterSpacing: '0.5px' }}>
                        Buka Undangan <ChevronDown size={18} />
                    </motion.button>
                </motion.div>

                <div style={{ position: 'absolute', bottom: -10, left: 0, right: 0, zIndex: 15 }}>
                    <GoldDivider />
                </div>
            </div >
        );
    }

    // ==================== MAIN CONTENT ====================
    return (
        <div style={{ background: '#FFFFFF', color: '#2d2518', minHeight: '100vh', maxWidth: '540px', margin: '0 auto', position: 'relative', boxShadow: '0 0 60px rgba(0,0,0,0.05)', fontFamily: "'Inter', sans-serif" }}>
            {/* Audio */}
            {invitation.musicUrl && (
                <>
                    <audio ref={audioRef} src={invitation.musicUrl} loop />
                    <motion.button onClick={toggleMusic} whileTap={{ scale: 0.9 }}
                        style={{ position: 'fixed', top: '24px', left: '24px', zIndex: 50, width: '40px', height: '40px', borderRadius: '50%', border: '1px solid rgba(139, 105, 20, 0.2)', background: 'rgba(255,255,255,0.8)', color: '#8B6914', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                        {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </motion.button>
                </>
            )}

            <FloatingParticles count={8} color="#C19A6B" />

            {/* ==================== HOME SECTION ==================== */}
            <section id="home" style={{ ...sectionPadding, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
                {/* Background Decor */}
                <div style={{ position: 'absolute', inset: 0, zIndex: 0, background: 'radial-gradient(circle at 0% 0%, #F9F3EA 0%, transparent 50%), radial-gradient(circle at 100% 100%, #F9F3EA 0%, transparent 50%)', opacity: 0.8 }} />

                <GoldenLeaf position="top-left" size={280} opacity={0.9} variant="rustic" style={{ transform: 'translate(-50px, -40px)' }} />
                <GoldenLeaf position="bottom-right" size={260} opacity={0.9} variant="rustic" style={{ transform: 'scale(-1, -1) translate(-20px, -20px)' }} />

                <motion.div initial="hidden" animate="visible" variants={stagger} style={{ position: 'relative', zIndex: 5, width: '100%', textAlign: 'center' }}>
                    <motion.p variants={fadeIn} style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', color: '#8B6914', marginBottom: '24px', fontWeight: 600 }}>The Wedding</motion.p>

                    {/* Couple Photo Circle */}
                    {couplePhoto && (
                        <motion.div variants={scaleUp} style={{ width: '220px', height: '220px', borderRadius: '50%', overflow: 'hidden', margin: '0 auto 32px', border: '5px solid white', boxShadow: '0 10px 40px rgba(139, 105, 20, 0.15)' }}>
                            <img src={couplePhoto} alt="Couple" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </motion.div>
                    )}

                    <motion.h1 variants={fadeUp} style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2.2rem, 8vw, 3.2rem)', fontWeight: 700, color: '#6B4F0A', lineHeight: 1.1, marginBottom: '6px', textShadow: '0 2px 5px rgba(139, 105, 20, 0.1)' }}>
                        {invitation.groomName} <span style={{ fontFamily: "'Great Vibes', cursive", color: '#B8860B', fontSize: '90%', fontWeight: 400 }}>&amp;</span> {invitation.brideName}
                    </motion.h1>

                    {invitation.eventDate && (
                        <motion.p variants={fadeIn} style={{ fontSize: '1.2rem', color: '#8B6914', marginTop: '12px', fontWeight: 500, fontFamily: "'Playfair Display', serif', letterSpacing: '1px'" }}>
                            {format(new Date(invitation.eventDate), 'dd.MM.yyyy')}
                        </motion.p>
                    )}

                    {/* Save The Date Button */}
                    <motion.button variants={fadeUp} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            if (!invitation.eventDate) return;
                            const d = new Date(invitation.eventDate);
                            const dateStr = format(d, "yyyyMMdd'T'HHmmss");
                            window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=Pernikahan+${invitation.groomName}+%26+${invitation.brideName}&dates=${dateStr}/${dateStr}&details=Undangan+Pernikahan&location=${encodeURIComponent(invitation.venueAddress || invitation.venue || '')}`, '_blank');
                        }}
                        style={{ marginTop: '32px', padding: '12px 32px', borderRadius: '50px', border: 'none', background: '#8B6914', color: 'white', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', fontFamily: "'Playfair Display', serif", boxShadow: '0 5px 20px rgba(139, 105, 20, 0.2)' }}>
                        Save The Date
                    </motion.button>

                    {/* Countdown */}
                    {invitation.eventDate && (
                        <motion.div variants={fadeUp} style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '40px', flexWrap: 'wrap' }}>
                            {[
                                { value: countdown.days, label: 'Hari' },
                                { value: countdown.hours, label: 'Jam' },
                                { value: countdown.minutes, label: 'Menit' },
                                { value: countdown.seconds, label: 'Detik' },
                            ].map((item) => (
                                <div key={item.label} style={{ width: '70px', height: '70px', borderRadius: '50%', border: '1px solid #B8860B', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(2px)' }}>
                                    <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#6B4F0A', lineHeight: 1, fontFamily: "'Playfair Display', serif" }}>{item.value}</div>
                                    <div style={{ fontSize: '0.65rem', color: '#8B6914', fontWeight: 500, textTransform: 'uppercase', marginTop: '2px' }}>{item.label}</div>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </motion.div>

                <div style={{ position: 'absolute', bottom: -15, left: 0, right: 0, zIndex: 15 }}>
                    <GoldDivider flip />
                </div>
            </section>

            {/* ==================== MEMPELAI SECTION ==================== */}
            <section id="profile" style={{ ...sectionPadding, background: 'white' }}>
                <div style={{ position: 'absolute', inset: 0, opacity: 0.4, zIndex: 0, background: 'radial-gradient(circle at 100% 0%, #F5E6D3 0%, transparent 40%), radial-gradient(circle at 0% 100%, #F5E6D3 0%, transparent 40%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
                <GoldenLeaf position="top-right" size={130} opacity={0.1} color={goldLight} variant="rustic" />
                <GoldenLeaf position="bottom-left" size={140} opacity={0.1} color={goldLight} variant="rustic" />

                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={stagger} style={{ position: 'relative', zIndex: 5 }}>
                    <motion.p variants={fadeIn} style={{ fontFamily: "'Amiri', serif", fontSize: '1.4rem', color: gold, marginBottom: '8px', direction: 'rtl' }}>بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم</motion.p>
                    <motion.p variants={fadeIn} style={{ fontSize: '0.95rem', fontWeight: 600, color: goldDark, marginBottom: '16px' }}>Assalamu&apos;alaikum Warahmatullahi Wabarakatuh</motion.p>
                    <motion.p variants={fadeIn} style={{ fontSize: '0.85rem', opacity: 0.7, maxWidth: '420px', margin: '0 auto 40px', lineHeight: 1.7 }}>
                        Dengan memohon rahmat dan ridho Allah SWT yang telah menciptakan makhluk-Nya secara berpasang-pasangan, kami bermaksud menyelenggarakan acara pernikahan.
                    </motion.p>

                    <motion.h2 variants={fadeUp} style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', fontWeight: 700, color: gold, marginBottom: '36px' }}>
                        Mempelai <span style={{ fontFamily: "'Great Vibes', cursive", fontSize: '120%' }}>Pria &amp; Wanita</span>
                    </motion.h2>

                    {/* Groom */}
                    <motion.div variants={slideLeft} style={{ marginBottom: '40px' }}>
                        {invitation.groomPhoto && (
                            <div style={{ width: '150px', height: '150px', borderRadius: '50%', overflow: 'hidden', margin: '0 auto 16px', border: `3px solid ${goldLight}`, boxShadow: `0 6px 25px ${gold}20` }}>
                                <img src={invitation.groomPhoto} alt={invitation.groomName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                        )}
                        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', fontWeight: 700, color: gold, marginBottom: '8px' }}>{invitation.groomName}</h3>
                        {(invitation.groomFather || invitation.groomMother) && (
                            <p style={{ fontSize: '0.85rem', opacity: 0.6, lineHeight: 1.6 }}>
                                Putra dari<br />Bapak {invitation.groomFather}{invitation.groomMother && <><br />Ibu {invitation.groomMother}</>}
                            </p>
                        )}
                    </motion.div>

                    {/* Heart divider */}
                    <motion.div variants={scaleUp} style={{ margin: '0 auto 40px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                        <div style={{ width: '60px', height: '1px', background: `linear-gradient(to right, transparent, ${goldLight})` }} />
                        <Heart size={24} fill={goldLight} style={{ color: goldLight }} />
                        <div style={{ width: '60px', height: '1px', background: `linear-gradient(to left, transparent, ${goldLight})` }} />
                    </motion.div>

                    {/* Bride */}
                    <motion.div variants={slideRight}>
                        {invitation.bridePhoto && (
                            <div style={{ width: '150px', height: '150px', borderRadius: '50%', overflow: 'hidden', margin: '0 auto 16px', border: `3px solid ${goldLight}`, boxShadow: `0 6px 25px ${gold}20` }}>
                                <img src={invitation.bridePhoto} alt={invitation.brideName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                        )}
                        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', fontWeight: 700, color: gold, marginBottom: '8px' }}>{invitation.brideName}</h3>
                        {(invitation.brideFather || invitation.brideMother) && (
                            <p style={{ fontSize: '0.85rem', opacity: 0.6, lineHeight: 1.6 }}>
                                Putri dari<br />Bapak {invitation.brideFather}{invitation.brideMother && <><br />Ibu {invitation.brideMother}</>}
                            </p>
                        )}
                    </motion.div>
                </motion.div>

                <div style={{ position: 'absolute', bottom: -15, left: 0, right: 0, zIndex: 15 }}>
                    <GoldDivider />
                </div>
            </section>

            {/* ==================== EVENT SECTION ==================== */}
            <section id="event" style={{ ...sectionPadding, background: cream }}>
                <div style={{ position: 'absolute', inset: 0, opacity: 0.4, zIndex: 0, background: 'radial-gradient(circle at 0% 50%, #F5E6D3 0%, transparent 50%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
                <GoldenLeaf position="top-left" size={120} opacity={0.12} color={goldLight} variant="rustic" />
                <GoldenLeaf position="bottom-right" size={130} opacity={0.1} color={goldLight} variant="rustic" />

                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={stagger} style={{ position: 'relative', zIndex: 5 }}>
                    <motion.h2 variants={fadeUp} style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', fontWeight: 700, color: gold, marginBottom: '36px' }}>
                        Hari Spesial
                    </motion.h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '380px', margin: '0 auto' }}>
                        {/* Akad */}
                        {invitation.akadDate && (
                            <motion.div variants={fadeUp} style={{ padding: '28px 24px', borderRadius: '16px', background: 'white', border: `1px solid ${goldLight}30`, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', fontWeight: 700, color: gold, marginBottom: '16px', letterSpacing: '2px', textTransform: 'uppercase' }}>Akad</h3>
                                <p style={{ fontSize: '0.9rem', color: '#6b5d4a' }}>{format(new Date(invitation.akadDate), 'EEEE', { locale: idLocale })}</p>
                                <p style={{ fontSize: '2.5rem', fontWeight: 800, color: gold, lineHeight: 1.2 }}>{format(new Date(invitation.akadDate), 'dd')}</p>
                                <p style={{ fontSize: '0.9rem', color: '#6b5d4a', marginBottom: '12px' }}>{format(new Date(invitation.akadDate), 'MMMM yyyy', { locale: idLocale })}</p>
                                {invitation.akadTime && <p style={{ fontSize: '0.85rem', color: goldDark, fontWeight: 500 }}><Clock size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />{invitation.akadTime} WIB - Selesai</p>}
                                <p style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: '8px' }}>{invitation.venue}</p>
                            </motion.div>
                        )}

                        {/* Resepsi */}
                        {invitation.eventDate && (
                            <motion.div variants={fadeUp} style={{ padding: '28px 24px', borderRadius: '16px', background: 'white', border: `1px solid ${goldLight}30`, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', fontWeight: 700, color: gold, marginBottom: '16px', letterSpacing: '2px', textTransform: 'uppercase' }}>Resepsi</h3>
                                <p style={{ fontSize: '0.9rem', color: '#6b5d4a' }}>{format(new Date(invitation.eventDate), 'EEEE', { locale: idLocale })}</p>
                                <p style={{ fontSize: '2.5rem', fontWeight: 800, color: gold, lineHeight: 1.2 }}>{format(new Date(invitation.eventDate), 'dd')}</p>
                                <p style={{ fontSize: '0.9rem', color: '#6b5d4a', marginBottom: '12px' }}>{format(new Date(invitation.eventDate), 'MMMM yyyy', { locale: idLocale })}</p>
                                {invitation.receptionTime && <p style={{ fontSize: '0.85rem', color: goldDark, fontWeight: 500 }}><Clock size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />{invitation.receptionTime} WIB - Selesai</p>}
                                <p style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: '8px' }}>{invitation.venueAddress || invitation.venue}</p>
                            </motion.div>
                        )}
                    </div>
                </motion.div>

                <div style={{ position: 'absolute', bottom: -15, left: 0, right: 0, zIndex: 15 }}>
                    <GoldDivider flip />
                </div>
            </section>

            {/* ==================== GALLERY SECTION ==================== */}
            {galleryPhotos.length > 0 && (
                <section id="galleries" style={{ ...sectionPadding, background: 'white' }}>
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={stagger} style={{ position: 'relative', zIndex: 5 }}>
                        <motion.h2 variants={fadeUp} style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', fontWeight: 700, color: gold, marginBottom: '28px' }}>Galeri</motion.h2>

                        <motion.div variants={stagger} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', maxWidth: '420px', margin: '0 auto' }}>
                            {galleryPhotos.map((photo, i) => (
                                <motion.div key={i} variants={scaleUp} whileHover={{ scale: 1.05 }} onClick={() => setLightboxPhoto(photo)}
                                    style={{ aspectRatio: '1', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
                                    <img src={photo} alt={`Gallery ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.div>

                    <div style={{ position: 'absolute', bottom: -15, left: 0, right: 0, zIndex: 15 }}>
                        <GoldDivider />
                    </div>
                </section>
            )}

            {/* Lightbox */}
            <AnimatePresence>
                {lightboxPhoto && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setLightboxPhoto(null)}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
                        <button onClick={() => setLightboxPhoto(null)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X size={28} /></button>
                        <motion.img initial={{ scale: 0.8 }} animate={{ scale: 1 }} src={lightboxPhoto} alt="Full view" style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: '8px', objectFit: 'contain' }} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ==================== LOCATION SECTION ==================== */}
            {(invitation.venue || invitation.venueAddress) && (
                <section id="location" style={{ ...sectionPadding, background: cream }}>
                    <div style={{ position: 'absolute', inset: 0, opacity: 0.4, zIndex: 0, background: 'radial-gradient(circle at 100% 0%, #F5E6D3 0%, transparent 50%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
                    <GoldenLeaf position="top-right" size={110} opacity={0.1} color={goldLight} variant="rustic" />
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={stagger} style={{ position: 'relative', zIndex: 5 }}>
                        <motion.h2 variants={fadeUp} style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', fontWeight: 700, color: gold, marginBottom: '8px' }}>Denah Lokasi</motion.h2>
                        <motion.p variants={fadeIn} style={{ fontFamily: "'Great Vibes', cursive", fontSize: '1.2rem', color: goldLight, marginBottom: '24px' }}>Resepsi</motion.p>

                        {/* Map embed */}
                        {(invitation.lat && invitation.lng) && (
                            <motion.div variants={fadeUp} style={{ borderRadius: '12px', overflow: 'hidden', marginBottom: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                                <iframe src={`https://www.google.com/maps?q=${invitation.lat},${invitation.lng}&z=15&output=embed`} width="100%" height="250" style={{ border: 0 }} loading="lazy" />
                            </motion.div>
                        )}

                        <motion.div variants={fadeUp}>
                            <p style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '4px' }}>{invitation.venue}</p>
                            <p style={{ fontSize: '0.85rem', opacity: 0.6, maxWidth: '350px', margin: '0 auto 16px', lineHeight: 1.6 }}>{invitation.venueAddress}</p>
                            <button onClick={openMaps} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 28px', borderRadius: '8px', border: `2px solid ${gold}`, background: 'transparent', color: gold, fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}>
                                <Navigation size={16} /> Lihat Lokasi
                            </button>
                        </motion.div>
                    </motion.div>

                    <div style={{ position: 'absolute', bottom: -15, left: 0, right: 0, zIndex: 15 }}>
                        <GoldDivider />
                    </div>
                </section>
            )}

            {/* ==================== DIGITAL ENVELOPE ==================== */}
            {(invitation.bankName || invitation.qrisImage) && (
                <section style={{ ...sectionPadding, background: 'white' }}>
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={stagger} style={{ position: 'relative', zIndex: 5 }}>
                        <motion.div variants={fadeUp}>
                            <Wallet size={28} style={{ color: gold, marginBottom: '8px' }} />
                            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', fontWeight: 700, color: gold, marginBottom: '8px' }}>Amplop Digital</h2>
                            <p style={{ fontSize: '0.85rem', opacity: 0.6, maxWidth: '360px', margin: '0 auto 24px', lineHeight: 1.6 }}>Doa Restu Anda merupakan karunia yang sangat berarti bagi kami.</p>
                        </motion.div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '340px', margin: '0 auto' }}>
                            {invitation.bankName && (
                                <motion.div variants={fadeUp} style={{ padding: '24px', borderRadius: '12px', background: cream, border: `1px solid ${goldLight}20` }}>
                                    <p style={{ fontWeight: 700, marginBottom: '4px', color: gold }}>{invitation.bankName}</p>
                                    <p style={{ fontSize: '1.2rem', fontWeight: 700, color: goldDark, marginBottom: '4px', fontFamily: 'monospace' }}>{invitation.bankAccount}</p>
                                    <p style={{ fontSize: '0.85rem', opacity: 0.6, marginBottom: '12px' }}>a.n. {invitation.bankHolder}</p>
                                    <button onClick={copyBankAccount} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 20px', borderRadius: '8px', border: `1.5px solid ${gold}`, background: 'transparent', color: gold, fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>
                                        {copiedAccount ? <Check size={14} /> : <Copy size={14} />}
                                        {copiedAccount ? 'Tersalin!' : 'Salin'}
                                    </button>
                                </motion.div>
                            )}
                            {invitation.qrisImage && (
                                <motion.div variants={fadeUp} style={{ padding: '24px', borderRadius: '12px', background: cream, border: `1px solid ${goldLight}20`, textAlign: 'center' }}>
                                    <p style={{ fontWeight: 700, marginBottom: '12px', color: gold }}>QRIS</p>
                                    <img src={invitation.qrisImage} alt="QRIS" style={{ width: '180px', borderRadius: '8px' }} />
                                </motion.div>
                            )}
                        </div>
                    </motion.div>

                    <div style={{ position: 'absolute', bottom: -15, left: 0, right: 0, zIndex: 15 }}>
                        <GoldDivider flip />
                    </div>
                </section>
            )}

            {/* ==================== RSVP SECTION ==================== */}
            <section style={{ ...sectionPadding, background: cream }}>
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={stagger} style={{ position: 'relative', zIndex: 5 }}>
                    <motion.h2 variants={fadeUp} style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', fontWeight: 700, color: gold, marginBottom: '8px' }}>RSVP</motion.h2>
                    <motion.p variants={fadeIn} style={{ fontSize: '0.85rem', opacity: 0.6, marginBottom: '24px' }}>Silakan konfirmasi kehadiran anda kepada kedua mempelai.</motion.p>

                    {rsvpSubmitted ? (
                        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                            style={{ padding: '32px', borderRadius: '16px', background: 'white', maxWidth: '360px', margin: '0 auto', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                            <Check size={48} style={{ color: '#22C55E', marginBottom: '12px' }} />
                            <h3 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, marginBottom: '8px' }}>Terima Kasih!</h3>
                            <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Konfirmasi Anda telah kami terima.</p>
                        </motion.div>
                    ) : (
                        <motion.div variants={fadeUp} style={{ maxWidth: '360px', margin: '0 auto', padding: '28px', borderRadius: '16px', background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', textAlign: 'left' }}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: goldDark }}>Nama</label>
                                <input className="input-field" placeholder="Nama Anda" value={rsvpName} onChange={(e) => setRsvpName(e.target.value)} style={{ borderColor: `${goldLight}50`, fontSize: '0.9rem' }} />
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: goldDark }}>Konfirmasi</label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {[{ value: 'ATTENDING', label: '👍 Hadir' }, { value: 'MAYBE', label: '🤔 Mungkin' }, { value: 'NOT_ATTENDING', label: '🙏 Tidak' }].map((opt) => (
                                        <button key={opt.value} onClick={() => setRsvpStatus(opt.value)}
                                            style={{ flex: 1, padding: '10px 4px', borderRadius: '8px', border: `2px solid ${rsvpStatus === opt.value ? gold : '#e8e0d8'}`, background: rsvpStatus === opt.value ? `${gold}10` : 'white', color: rsvpStatus === opt.value ? gold : '#6b6b6b', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer' }}>
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {rsvpStatus === 'ATTENDING' && (
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: goldDark }}>Jumlah</label>
                                    <select className="input-field" value={rsvpCount} onChange={(e) => setRsvpCount(parseInt(e.target.value))} style={{ borderColor: `${goldLight}50` }}>
                                        {[1, 2, 3, 4, 5].map((n) => (<option key={n} value={n}>{n} orang</option>))}
                                    </select>
                                </div>
                            )}
                            <button onClick={submitRsvp} disabled={!rsvpName}
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', background: gold, color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem', opacity: rsvpName ? 1 : 0.5 }}>
                                <Send size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />Kirim Konfirmasi
                            </button>
                        </motion.div>
                    )}
                </motion.div>

                <div style={{ position: 'absolute', bottom: -15, left: 0, right: 0, zIndex: 15 }}>
                    <GoldDivider />
                </div>
            </section>

            {/* ==================== WISHES / UCAPAN SECTION ==================== */}
            <section id="comment" style={{ ...sectionPadding, background: 'white' }}>
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={stagger} style={{ position: 'relative', zIndex: 5 }}>
                    <motion.h2 variants={fadeUp} style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', fontWeight: 700, color: gold, marginBottom: '8px' }}>Ucapan Selamat</motion.h2>
                    <motion.p variants={fadeIn} style={{ fontSize: '0.85rem', opacity: 0.6, marginBottom: '24px' }}>Silakan memberikan ucapan selamat kepada kedua mempelai.</motion.p>

                    <motion.div variants={fadeUp} style={{ maxWidth: '400px', margin: '0 auto 24px', padding: '24px', borderRadius: '12px', background: cream, textAlign: 'left' }}>
                        <div style={{ marginBottom: '12px' }}>
                            <input className="input-field" placeholder="Nama Anda" value={wishName} onChange={(e) => setWishName(e.target.value)} style={{ borderColor: `${goldLight}50`, fontSize: '0.9rem' }} />
                        </div>
                        <div style={{ marginBottom: '12px' }}>
                            <textarea className="input-field" rows={3} placeholder="Tulis ucapan & doa..." value={wishMessage} onChange={(e) => setWishMessage(e.target.value)} style={{ resize: 'vertical', borderColor: `${goldLight}50`, fontSize: '0.9rem' }} />
                        </div>
                        <button onClick={submitWish} disabled={!wishName || !wishMessage}
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', background: gold, color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem', opacity: wishName && wishMessage ? 1 : 0.5 }}>
                            Kirim Ucapan
                        </button>
                        {wishSubmitted && <p style={{ textAlign: 'center', marginTop: '8px', fontSize: '0.85rem', color: '#22C55E' }}>✓ Ucapan terkirim!</p>}
                    </motion.div>

                    {/* Wish list */}
                    {wishes.length > 0 && (
                        <div style={{ maxWidth: '400px', margin: '0 auto', maxHeight: '350px', overflowY: 'auto', borderRadius: '12px', background: cream, padding: '8px' }}>
                            {wishes.map((wish) => (
                                <div key={wish.id} style={{ padding: '14px 16px', borderBottom: `1px solid ${goldLight}15`, display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: `linear-gradient(135deg, ${gold}, ${goldLight})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>
                                        {wish.guestName.charAt(0).toUpperCase()}
                                    </div>
                                    <div style={{ textAlign: 'left', flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                                            <span style={{ fontWeight: 600, fontSize: '0.85rem', color: goldDark }}>{wish.guestName}</span>
                                            <span style={{ fontSize: '0.7rem', opacity: 0.4 }}>{format(new Date(wish.createdAt), 'dd MMM', { locale: idLocale })}</span>
                                        </div>
                                        <p style={{ fontSize: '0.83rem', opacity: 0.7, lineHeight: 1.5, margin: 0 }}>{wish.message}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>

                <div style={{ position: 'absolute', bottom: -15, left: 0, right: 0, zIndex: 15 }}>
                    <GoldDivider flip />
                </div>
            </section>

            {/* ==================== CLOSING / QURAN ==================== */}
            <section style={{ ...sectionPadding, background: `linear-gradient(180deg, ${cream}, ${creamDark})` }}>
                <div style={{ position: 'absolute', inset: 0, opacity: 0.5, zIndex: 0, background: 'radial-gradient(circle at 50% 50%, #F5E6D3 0%, transparent 60%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
                <GoldenLeaf position="top-left" size={120} opacity={0.12} color={goldLight} variant="rustic" />
                <GoldenLeaf position="bottom-right" size={140} opacity={0.15} color={goldLight} variant="rustic" />

                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} style={{ position: 'relative', zIndex: 5, maxWidth: '420px', margin: '0 auto' }}>
                    <motion.h3 variants={fadeIn} style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', fontWeight: 700, color: gold, marginBottom: '16px' }}>QS. Ar-Rum: 21</motion.h3>
                    <motion.p variants={fadeIn} style={{ fontSize: '0.85rem', opacity: 0.7, lineHeight: 1.8, fontStyle: 'italic', marginBottom: '32px' }}>
                        &ldquo;Dan diantara tanda-tanda kekuasaan-Nya ialah diciptakan-Nya untukmu pasangan hidup dari jenismu sendiri, supaya kamu mendapatkan ketenangan hati dan dijadikan-Nya kasih sayang diantara kamu. Sesungguhnya yang demikian menjadi tanda-tanda kebesaran-Nya bagi orang-orang yang berfikir.&rdquo;
                    </motion.p>

                    <motion.div variants={fadeUp}>
                        <div style={{ width: '50px', height: '1px', background: goldLight, margin: '0 auto 20px' }} />
                        <p style={{ fontSize: '0.85rem', opacity: 0.6, marginBottom: '8px' }}>Atas kehadiran dan doa restu, kami mengucapkan terima kasih.</p>
                        <p style={{ fontSize: '0.85rem', opacity: 0.6, marginBottom: '20px' }}>Wassalamu&apos;alaikum Warahmatullahi Wabarakatuh</p>
                        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', fontWeight: 700, color: gold }}>
                            {invitation.groomName} &amp; {invitation.brideName}
                        </p>
                    </motion.div>
                </motion.div>
            </section>

            {/* Watermark */}
            {isFreePlan && (
                <div style={{ textAlign: 'center', padding: '12px', background: '#f8f5f0', fontSize: '0.75rem', color: '#999', paddingBottom: '70px' }}>
                    Dibuat dengan ❤️ menggunakan{' '}
                    <a href="/" style={{ color: gold, textDecoration: 'none', fontWeight: 600 }}>UndanganDigital</a>
                </div>
            )}

            {/* ==================== BOTTOM NAVIGATION ==================== */}
            <nav style={{
                position: 'fixed',
                bottom: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '100%',
                maxWidth: '540px',
                zIndex: 50,
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-around',
                alignItems: 'center',
                padding: '8px 0 calc(8px + env(safe-area-inset-bottom, 0px))',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderTop: `1px solid ${goldLight}30`,
                boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
            }}>
                {[
                    { id: 'home', icon: <Home size={18} />, label: 'Home' },
                    { id: 'profile', icon: <Users size={18} />, label: 'Mempelai' },
                    { id: 'event', icon: <Calendar size={18} />, label: 'Acara' },
                    { id: 'galleries', icon: <Image size={18} />, label: 'Galeri' },
                    { id: 'location', icon: <MapPinned size={18} />, label: 'Lokasi' },
                    { id: 'comment', icon: <MessageCircle size={18} />, label: 'Ucapan' },
                ].map((nav) => (
                    <a key={nav.id} href={`#${nav.id}`}
                        onClick={(e) => { e.preventDefault(); scrollTo(nav.id); }}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '2px',
                            textDecoration: 'none',
                            fontSize: '0.65rem',
                            fontWeight: 500,
                            color: activeSection === nav.id ? gold : '#999',
                            padding: '4px 8px',
                            borderRadius: '8px',
                            transition: 'all 0.2s ease',
                            cursor: 'pointer',
                        }}>
                        {nav.icon}
                        {nav.label}
                    </a>
                ))}
            </nav>
        </div>
    );
}
