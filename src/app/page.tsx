'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { motion } from 'framer-motion';
import {
  Heart,
  Send,
  Users,
  Wallet,
  MapPin,
  Clock,
  MessageCircle,
  ChevronRight,
  Star,
  Check,
  Menu,
  X,
  LogOut,
  User,
  Plus,
  LayoutDashboard,
  Settings,
  Sparkles,
} from 'lucide-react';
import { templates } from '@/lib/templates';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const features = [
  {
    icon: Heart,
    title: 'Template Premium',
    description: 'Koleksi template undangan yang elegan dan modern untuk setiap momen spesial Anda.',
  },
  {
    icon: Users,
    title: 'RSVP Digital',
    description: 'Kelola konfirmasi kehadiran tamu secara real-time melalui dashboard.',
  },
  {
    icon: Wallet,
    title: 'Amplop Digital',
    description: 'Terima hadiah pernikahan secara digital melalui transfer bank atau QRIS.',
  },
  {
    icon: MapPin,
    title: 'Navigasi Peta',
    description: 'Tamu dapat langsung membuka Google Maps menuju lokasi acara Anda.',
  },
  {
    icon: Clock,
    title: 'Countdown Timer',
    description: 'Hitung mundur menuju hari bahagia Anda yang ditampilkan secara elegan.',
  },
  {
    icon: MessageCircle,
    title: 'Ucapan & Doa',
    description: 'Kolom ucapan untuk tamu menulis doa dan harapan terbaik mereka.',
  },
];

export default function HomePage() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileImage, setProfileImage] = useState('');
  const profileRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch profile image when logged in
  useEffect(() => {
    if (session?.user) {
      fetch('/api/profile')
        .then(res => res.ok ? res.json() : null)
        .then(data => { if (data?.profileImage) setProfileImage(data.profileImage); })
        .catch(() => { });
    }
  }, [session]);

  const userInitial = session?.user?.name?.charAt(0)?.toUpperCase() || 'U';

  const renderAvatar = (size: number, fontSize: string) => {
    if (profileImage) {
      return (
        <img
          src={profileImage}
          alt="Profile"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: '50%',
            objectFit: 'cover',
          }}
        />
      );
    }
    return (
      <div style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize,
        fontWeight: 700,
      }}>
        {userInitial}
      </div>
    );
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Navbar */}
      <nav
        className="glass"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          padding: '16px 0',
        }}
      >
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Heart size={28} style={{ color: 'var(--color-primary)' }} />
            <span className="font-display" style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-text)' }}>
              Undangan<span style={{ color: 'var(--color-primary)' }}>Digital</span>
            </span>
          </Link>

          {/* Desktop menu */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }} className="desktop-nav">
            <Link href="#features" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 500 }}>Fitur</Link>
            <Link href="#templates" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 500 }}>Template</Link>
            <Link href="#pricing" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 500 }}>Harga</Link>
            {session ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Link href="/dashboard/create" className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Plus size={16} /> Buat Undangan
                </Link>
                {/* Profile Dropdown */}
                <div ref={profileRef} style={{ position: 'relative' }}>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      background: 'none',
                      border: '1.5px solid var(--color-border)',
                      borderRadius: 'var(--radius-full)',
                      padding: '5px 14px 5px 5px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {renderAvatar(32, '0.85rem')}
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text)', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {session.user?.name}
                    </span>
                  </button>

                  {/* Dropdown Menu */}
                  {profileOpen && (
                    <div style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      right: 0,
                      minWidth: '220px',
                      background: 'white',
                      borderRadius: 'var(--radius-lg)',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                      border: '1px solid var(--color-border)',
                      padding: '8px',
                      zIndex: 100,
                      animation: 'fadeInUp 0.2s ease',
                    }}>
                      {/* User Info */}
                      <div style={{ padding: '12px', borderBottom: '1px solid var(--color-border)', marginBottom: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {renderAvatar(40, '1rem')}
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text)' }}>{session.user?.name}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{session.user?.email}</div>
                          </div>
                        </div>
                      </div>

                      <Link
                        href="/dashboard"
                        onClick={() => setProfileOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 12px',
                          borderRadius: 'var(--radius-md)',
                          textDecoration: 'none',
                          color: 'var(--color-text)',
                          fontSize: '0.9rem',
                          fontWeight: 500,
                          transition: 'background 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-bg-alt)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <LayoutDashboard size={18} style={{ color: 'var(--color-text-muted)' }} /> Dashboard
                      </Link>

                      <Link
                        href="/dashboard/create"
                        onClick={() => setProfileOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 12px',
                          borderRadius: 'var(--radius-md)',
                          textDecoration: 'none',
                          color: 'var(--color-text)',
                          fontSize: '0.9rem',
                          fontWeight: 500,
                          transition: 'background 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-bg-alt)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <Plus size={18} style={{ color: 'var(--color-text-muted)' }} /> Buat Undangan
                      </Link>

                      <Link
                        href="/dashboard/profile"
                        onClick={() => setProfileOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 12px',
                          borderRadius: 'var(--radius-md)',
                          textDecoration: 'none',
                          color: 'var(--color-text)',
                          fontSize: '0.9rem',
                          fontWeight: 500,
                          transition: 'background 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-bg-alt)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <Settings size={18} style={{ color: 'var(--color-text-muted)' }} /> Pengaturan
                      </Link>

                      <div style={{ height: '1px', background: 'var(--color-border)', margin: '4px 0' }} />

                      <button
                        onClick={() => { setProfileOpen(false); signOut(); }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 12px',
                          borderRadius: 'var(--radius-md)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#DC2626',
                          fontSize: '0.9rem',
                          fontWeight: 500,
                          width: '100%',
                          transition: 'background 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#FEF2F2')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <LogOut size={18} /> Keluar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Link href="/login" className="btn btn-secondary btn-sm">Masuk</Link>
                <Link href="/register" className="btn btn-primary btn-sm">Daftar Gratis</Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-nav-btn"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', display: 'none' }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="container" style={{ paddingTop: '16px', paddingBottom: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Link href="#features" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--color-text-secondary)', textDecoration: 'none', padding: '8px 0' }}>Fitur</Link>
              <Link href="#templates" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--color-text-secondary)', textDecoration: 'none', padding: '8px 0' }}>Template</Link>
              <Link href="#pricing" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--color-text-secondary)', textDecoration: 'none', padding: '8px 0' }}>Harga</Link>
              {session ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid var(--color-border)', marginBottom: '4px' }}>
                    {renderAvatar(36, '0.9rem')}
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{session.user?.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{session.user?.email}</div>
                    </div>
                  </div>
                  <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="btn btn-primary" style={{ textAlign: 'center' }}>
                    <LayoutDashboard size={16} /> Dashboard
                  </Link>
                  <Link href="/dashboard/create" onClick={() => setMobileMenuOpen(false)} className="btn btn-secondary" style={{ textAlign: 'center' }}>
                    <Plus size={16} /> Buat Undangan
                  </Link>
                  <Link href="/dashboard/profile" onClick={() => setMobileMenuOpen(false)} className="btn btn-secondary" style={{ textAlign: 'center' }}>
                    <Settings size={16} /> Pengaturan
                  </Link>
                  <button onClick={() => { setMobileMenuOpen(false); signOut(); }} className="btn" style={{ textAlign: 'center', background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}>
                    <LogOut size={16} /> Keluar
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="btn btn-secondary" style={{ textAlign: 'center' }}>Masuk</Link>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="btn btn-primary" style={{ textAlign: 'center' }}>Daftar Gratis</Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(160deg, var(--color-bg) 0%, var(--color-primary-50) 50%, var(--color-bg-alt) 100%)',
        }}
      >
        {/* Floating decorations */}
        <div style={{ position: 'absolute', top: '15%', left: '10%', opacity: 0.15, fontSize: '120px' }} className="animate-float font-script">❤</div>
        <div style={{ position: 'absolute', bottom: '20%', right: '8%', opacity: 0.12, fontSize: '90px', animationDelay: '1s' }} className="animate-float font-script">✿</div>
        <div style={{ position: 'absolute', top: '30%', right: '20%', opacity: 0.1, fontSize: '60px', animationDelay: '2s' }} className="animate-float">💍</div>

        <div className="container" style={{ textAlign: 'center', paddingTop: '120px', paddingBottom: '80px' }}>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} style={{ marginBottom: '24px' }}>
              <span
                className="glass"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 20px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--color-primary)',
                }}
              >
                <Sparkles size={16} />
                Platform Undangan Digital #1 di Indonesia
              </span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="font-display"
              style={{
                fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                fontWeight: 800,
                lineHeight: 1.15,
                marginBottom: '24px',
                maxWidth: '800px',
                margin: '0 auto 24px',
              }}
            >
              Wujudkan{' '}
              <span className="text-gradient">Undangan Impian</span>
              <br />
              dalam Hitungan Menit
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              style={{
                fontSize: '1.15rem',
                color: 'var(--color-text-secondary)',
                maxWidth: '600px',
                margin: '0 auto 40px',
                lineHeight: 1.7,
              }}
            >
              Buat undangan pernikahan digital yang elegan, lengkap dengan RSVP, amplop digital, galeri foto, musik, dan banyak fitur premium lainnya.
            </motion.p>

            <motion.div variants={fadeInUp} style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href={session ? '/dashboard/create' : '/register'} className="btn btn-primary btn-lg">
                {session ? 'Buat Undangan' : 'Buat Undangan Gratis'} <ChevronRight size={20} />
              </Link>
              <Link href="#templates" className="btn btn-secondary btn-lg">
                Lihat Template
              </Link>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              style={{
                display: 'flex',
                gap: '32px',
                justifyContent: 'center',
                marginTop: '60px',
                flexWrap: 'wrap',
              }}
            >
              {[
                { number: '10K+', label: 'Undangan Dibuat' },
                { number: '50+', label: 'Template Premium' },
                { number: '99%', label: 'Kepuasan User' },
              ].map((stat) => (
                <div key={stat.label} style={{ textAlign: 'center' }}>
                  <div className="font-display text-gradient" style={{ fontSize: '2rem', fontWeight: 800 }}>{stat.number}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="section" style={{ background: 'var(--color-surface)' }}>
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            style={{ textAlign: 'center', marginBottom: '60px' }}
          >
            <motion.p variants={fadeInUp} className="font-script" style={{ fontSize: '1.5rem', color: 'var(--color-primary)', marginBottom: '8px' }}>
              Fitur Unggulan
            </motion.p>
            <motion.h2 variants={fadeInUp} className="font-display" style={{ fontSize: '2.2rem', fontWeight: 700, marginBottom: '16px' }}>
              Semua yang Anda Butuhkan
            </motion.h2>
            <motion.p variants={fadeInUp} style={{ color: 'var(--color-text-secondary)', maxWidth: '500px', margin: '0 auto' }}>
              Fitur lengkap untuk membuat undangan digital yang sempurna dan berkesan.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '24px',
            }}
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={fadeInUp}
                className="card"
                style={{
                  textAlign: 'center',
                  padding: '40px 28px',
                  cursor: 'default',
                }}
              >
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--color-primary-50)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                  }}
                >
                  <feature.icon size={28} style={{ color: 'var(--color-primary)' }} />
                </div>
                <h3 className="font-display" style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '12px' }}>
                  {feature.title}
                </h3>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Templates Section */}
      <section id="templates" className="section" style={{ background: 'var(--color-bg-alt)' }}>
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            style={{ textAlign: 'center', marginBottom: '60px' }}
          >
            <motion.p variants={fadeInUp} className="font-script" style={{ fontSize: '1.5rem', color: 'var(--color-primary)', marginBottom: '8px' }}>
              Koleksi Template
            </motion.p>
            <motion.h2 variants={fadeInUp} className="font-display" style={{ fontSize: '2.2rem', fontWeight: 700, marginBottom: '16px' }}>
              Desain yang Memukau
            </motion.h2>
            <motion.p variants={fadeInUp} style={{ color: 'var(--color-text-secondary)', maxWidth: '500px', margin: '0 auto' }}>
              Pilih dari koleksi template premium kami dan sesuaikan dengan gaya Anda.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '24px',
            }}
          >
            {templates.map((template) => (
              <motion.div
                key={template.id}
                variants={fadeInUp}
                style={{
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                }}
                whileHover={{ y: -8, boxShadow: '0 12px 40px rgba(0,0,0,0.1)' }}
              >
                {/* Template Preview */}
                <div
                  style={{
                    height: '220px',
                    background: `linear-gradient(135deg, ${template.colorBg}, ${template.colorSecondary}20)`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    padding: '24px',
                  }}
                >
                  {template.isPremium && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 12px',
                        borderRadius: 'var(--radius-full)',
                        background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-dark))',
                        color: 'white',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}
                    >
                      <Star size={12} /> Premium
                    </span>
                  )}
                  <div style={{ fontFamily: template.fontDisplay, fontSize: '1.6rem', fontWeight: 700, color: template.colorPrimary, marginBottom: '4px' }}>
                    Romeo & Juliet
                  </div>
                  <div style={{ width: '40px', height: '2px', background: template.colorAccent, margin: '8px 0' }} />
                  <div style={{ fontFamily: template.fontBody, fontSize: '0.85rem', color: template.colorText, opacity: 0.6 }}>
                    14 Februari 2026
                  </div>
                </div>

                <div style={{ padding: '20px' }}>
                  <h3 className="font-display" style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>
                    {template.name}
                  </h3>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '16px' }}>
                    {template.description}
                  </p>
                  <Link
                    href={session ? `/dashboard/create?template=${template.id}` : '/register'}
                    className="btn btn-primary btn-sm"
                    style={{ width: '100%' }}
                  >
                    Gunakan Template <ChevronRight size={16} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="section" style={{ background: 'var(--color-surface)' }}>
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            style={{ textAlign: 'center', marginBottom: '60px' }}
          >
            <motion.p variants={fadeInUp} className="font-script" style={{ fontSize: '1.5rem', color: 'var(--color-primary)', marginBottom: '8px' }}>
              Harga
            </motion.p>
            <motion.h2 variants={fadeInUp} className="font-display" style={{ fontSize: '2.2rem', fontWeight: 700, marginBottom: '16px' }}>
              Mulai dari Gratis!
            </motion.h2>
            <motion.p variants={fadeInUp} style={{ color: 'var(--color-text-secondary)', maxWidth: '500px', margin: '0 auto' }}>
              Pilih paket yang sesuai dengan kebutuhan Anda.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '24px',
              maxWidth: '750px',
              margin: '0 auto',
            }}
          >
            {/* Free Plan */}
            <motion.div
              variants={fadeInUp}
              className="card"
              style={{ padding: '40px 32px', textAlign: 'center' }}
            >
              <h3 className="font-display" style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px' }}>Gratis</h3>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '4px' }}>
                Rp 0
              </div>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '32px', fontSize: '0.9rem' }}>Selamanya gratis</p>
              <div style={{ textAlign: 'left', marginBottom: '32px' }}>
                {[
                  '3 Template gratis',
                  'RSVP dasar',
                  'Ucapan & Doa',
                  'Countdown Timer',
                  'Navigasi Peta',
                  'Maks. 100 tamu',
                  'Watermark UndanganDigital',
                ].map((feature) => (
                  <div key={feature} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', fontSize: '0.95rem' }}>
                    <Check size={18} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                    {feature}
                  </div>
                ))}
              </div>
              <Link href={session ? '/dashboard/create' : '/register'} className="btn btn-secondary" style={{ width: '100%' }}>
                {session ? 'Buat Undangan' : 'Mulai Gratis'}
              </Link>
            </motion.div>

            {/* Premium Plan */}
            <motion.div
              variants={fadeInUp}
              style={{
                padding: '40px 32px',
                textAlign: 'center',
                borderRadius: 'var(--radius-lg)',
                background: 'linear-gradient(160deg, var(--color-primary-50), white)',
                border: '2px solid var(--color-primary)',
                position: 'relative',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: '-14px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  padding: '6px 20px',
                  borderRadius: 'var(--radius-full)',
                  background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
                  color: 'white',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                }}
              >
                ⭐ Paling Populer
              </span>
              <h3 className="font-display" style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px' }}>Premium</h3>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '4px' }}>
                <span style={{ fontSize: '1.2rem', color: 'var(--color-text-muted)' }}>Rp</span> 99.000
              </div>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '32px', fontSize: '0.9rem' }}>per undangan</p>
              <div style={{ textAlign: 'left', marginBottom: '32px' }}>
                {[
                  'Semua template premium',
                  'RSVP tak terbatas',
                  'Amplop Digital (QRIS)',
                  'Galeri foto unlimited',
                  'Musik latar',
                  'Tamu tak terbatas',
                  'Custom URL slug',
                  'Tanpa watermark',
                  'Ucapan & Doa',
                  'Analytics lengkap',
                ].map((feature) => (
                  <div key={feature} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', fontSize: '0.95rem' }}>
                    <Check size={18} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                    {feature}
                  </div>
                ))}
              </div>
              <Link href={session ? '/dashboard/create' : '/register'} className="btn btn-primary" style={{ width: '100%' }}>
                {session ? 'Buat Undangan Premium' : 'Pilih Premium'} <Sparkles size={18} />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        style={{
          padding: '100px 0',
          background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
          textAlign: 'center',
          color: 'white',
        }}
      >
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2 variants={fadeInUp} className="font-display" style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '16px' }}>
              Siap Membuat Undangan Impian Anda?
            </motion.h2>
            <motion.p variants={fadeInUp} style={{ fontSize: '1.1rem', opacity: 0.9, maxWidth: '500px', margin: '0 auto 40px', lineHeight: 1.7 }}>
              Bergabunglah dengan ribuan pasangan yang telah mempercayakan momen spesial mereka kepada kami.
            </motion.p>
            <motion.div variants={fadeInUp}>
              <Link
                href={session ? '/dashboard/create' : '/register'}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '16px 40px',
                  borderRadius: 'var(--radius-full)',
                  background: 'white',
                  color: 'var(--color-primary-dark)',
                  fontWeight: 700,
                  textDecoration: 'none',
                  fontSize: '1.05rem',
                  transition: 'all 0.3s ease',
                }}
              >
                Mulai Sekarang <Send size={18} />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '48px 0', background: 'var(--color-text)', color: 'rgba(255,255,255,0.6)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Heart size={20} style={{ color: 'var(--color-primary-light)' }} />
            <span className="font-display" style={{ color: 'white', fontWeight: 700 }}>UndanganDigital</span>
          </div>
          <p style={{ fontSize: '0.85rem' }}>
            © 2026 UndanganDigital. Dibuat dengan ❤️ di Indonesia.
          </p>
        </div>
      </footer>

      {/* Responsive styles */}
      <style jsx global>{`
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-nav-btn {
            display: block !important;
          }
        }
        @media (min-width: 769px) {
          .mobile-nav-btn {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
