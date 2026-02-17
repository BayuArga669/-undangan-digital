'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError(result.error);
            } else {
                router.push('/dashboard');
                router.refresh();
            }
        } catch {
            setError('Terjadi kesalahan. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(160deg, var(--color-bg) 0%, var(--color-primary-50) 50%, var(--color-bg-alt) 100%)',
                padding: '24px',
            }}
        >
            <div style={{ width: '100%', maxWidth: '440px' }}>
                <Link
                    href="/"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: 'var(--color-text-secondary)',
                        textDecoration: 'none',
                        fontSize: '0.9rem',
                        marginBottom: '32px',
                    }}
                >
                    <ArrowLeft size={16} />
                    Kembali ke Beranda
                </Link>

                <div
                    className="card"
                    style={{
                        padding: '40px 32px',
                        boxShadow: 'var(--shadow-lg)',
                        border: 'none',
                    }}
                >
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <Heart size={36} style={{ color: 'var(--color-primary)', marginBottom: '12px' }} />
                        <h1 className="font-display" style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '8px' }}>
                            Selamat Datang
                        </h1>
                        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                            Masuk untuk mengelola undangan Anda
                        </p>
                    </div>

                    {error && (
                        <div
                            style={{
                                padding: '12px 16px',
                                borderRadius: 'var(--radius-md)',
                                background: '#FEF2F2',
                                color: '#DC2626',
                                fontSize: '0.85rem',
                                marginBottom: '20px',
                                border: '1px solid #FECACA',
                            }}
                        >
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <label className="input-label">Email</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                                <input
                                    type="email"
                                    className="input-field"
                                    style={{ paddingLeft: '42px' }}
                                    placeholder="nama@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="input-label">Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="input-field"
                                    style={{ paddingLeft: '42px', paddingRight: '42px' }}
                                    placeholder="Masukkan password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '14px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: 'var(--color-text-muted)',
                                    }}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                            style={{ width: '100%', marginTop: '8px' }}
                        >
                            {loading ? 'Memproses...' : 'Masuk'}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: '24px', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                        Belum punya akun?{' '}
                        <Link href="/register" style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
                            Daftar Gratis
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
