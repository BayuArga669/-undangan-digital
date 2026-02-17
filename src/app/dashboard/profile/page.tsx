'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    User,
    Mail,
    Lock,
    Save,
    Loader2,
    Check,
    Shield,
    Calendar,
    FileText,
    AlertCircle,
    Eye,
    EyeOff,
    Camera,
    ImageIcon,
    Trash2,
} from 'lucide-react';

interface ProfileData {
    id: string;
    name: string;
    email: string;
    profileImage: string;
    plan: string;
    createdAt: string;
    _count: { invitations: number };
}

export default function ProfilePage() {
    const { data: session, update: updateSession } = useSession();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    // Form fields
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [profileImage, setProfileImage] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await fetch('/api/profile');
            if (res.ok) {
                const data = await res.json();
                setProfile(data);
                setName(data.name);
                setEmail(data.email);
                setProfileImage(data.profileImage || '');
            }
        } catch (err) {
            console.error('Fetch profile error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!name.trim() || !email.trim()) {
            setError('Nama dan email wajib diisi');
            return;
        }

        if (newPassword && newPassword !== confirmPassword) {
            setError('Konfirmasi password tidak cocok');
            return;
        }

        if (newPassword && newPassword.length < 6) {
            setError('Password baru minimal 6 karakter');
            return;
        }

        setSaving(true);
        try {
            const body: Record<string, string> = { name: name.trim(), email: email.trim(), profileImage };
            if (newPassword) {
                body.currentPassword = currentPassword;
                body.newPassword = newPassword;
            }

            const res = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess('Profil berhasil diperbarui!');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                // Update the session with new data
                await updateSession({ name: name.trim(), email: email.trim() });
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError(data.error || 'Gagal memperbarui profil');
            }
        } catch {
            setError('Terjadi kesalahan');
        } finally {
            setSaving(false);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-alt)' }}>
                <Loader2 size={32} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
            </div>
        );
    }

    const userInitial = profile?.name?.charAt(0)?.toUpperCase() || 'U';

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setError('Foto terlalu besar (maks 5MB)');
            return;
        }

        if (!file.type.startsWith('image/')) {
            setError('File harus berupa gambar');
            return;
        }

        setUploadingPhoto(true);
        setError('');
        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                setProfileImage(data.url);
                // Auto-save the photo
                const saveRes = await fetch('/api/profile', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ profileImage: data.url }),
                });
                if (saveRes.ok) {
                    setSuccess('Foto profil berhasil diperbarui!');
                    setTimeout(() => setSuccess(''), 3000);
                }
            } else {
                setError('Gagal upload foto');
            }
        } catch {
            setError('Gagal upload foto');
        } finally {
            setUploadingPhoto(false);
        }
    };

    const handleRemovePhoto = async () => {
        setProfileImage('');
        const res = await fetch('/api/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ profileImage: '' }),
        });
        if (res.ok) {
            setSuccess('Foto profil dihapus!');
            setTimeout(() => setSuccess(''), 3000);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg-alt)' }}>
            {/* Header */}
            <header className="glass" style={{ position: 'sticky', top: 0, zIndex: 40, padding: '16px 0', borderBottom: '1px solid var(--color-border)' }}>
                <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'var(--color-text)' }}>
                        <ArrowLeft size={18} />
                        <span className="font-display" style={{ fontWeight: 700 }}>Pengaturan Profil</span>
                    </Link>
                </div>
            </header>

            <div className="container" style={{ padding: '32px 24px', maxWidth: '700px' }}>
                {/* Profile Card */}
                <div className="card" style={{ padding: '32px', marginBottom: '24px', textAlign: 'center' }}>
                    {/* Avatar with Upload */}
                    <div style={{ position: 'relative', display: 'inline-block', marginBottom: '16px' }}>
                        {profileImage ? (
                            <img
                                src={profileImage}
                                alt="Profile"
                                style={{
                                    width: '96px',
                                    height: '96px',
                                    borderRadius: '50%',
                                    objectFit: 'cover',
                                    border: '4px solid white',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                                }}
                            />
                        ) : (
                            <div style={{
                                width: '96px',
                                height: '96px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '2.2rem',
                                fontWeight: 700,
                                border: '4px solid white',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                            }}>
                                {userInitial}
                            </div>
                        )}
                        {/* Camera Button */}
                        <label
                            htmlFor="profile-photo-upload"
                            style={{
                                position: 'absolute',
                                bottom: '0',
                                right: '0',
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: 'var(--color-primary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                cursor: 'pointer',
                                border: '3px solid white',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                transition: 'transform 0.2s ease',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
                            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                        >
                            {uploadingPhoto ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
                        </label>
                        <input
                            id="profile-photo-upload"
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            style={{ display: 'none' }}
                        />
                    </div>

                    {/* Upload Status */}
                    {uploadingPhoto && (
                        <div style={{ marginBottom: '12px', color: 'var(--color-primary)', fontSize: '0.8rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Loader2 size={13} className="animate-spin" /> Uploading...
                        </div>
                    )}

                    {/* Remove Photo Button */}
                    {profileImage && !uploadingPhoto && (
                        <div style={{ marginBottom: '12px' }}>
                            <button
                                type="button"
                                onClick={handleRemovePhoto}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: '#DC2626',
                                    fontSize: '0.8rem',
                                    fontWeight: 500,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                }}
                            >
                                <Trash2 size={13} /> Hapus Foto
                            </button>
                        </div>
                    )}
                    <h2 className="font-display" style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '4px' }}>
                        {profile?.name}
                    </h2>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
                        {profile?.email}
                    </p>

                    {/* Stats */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '32px',
                        padding: '16px 0',
                        borderTop: '1px solid var(--color-border)',
                    }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center', color: 'var(--color-text-muted)', fontSize: '0.8rem', marginBottom: '4px' }}>
                                <Shield size={14} /> Paket
                            </div>
                            <div style={{
                                fontWeight: 700,
                                fontSize: '0.9rem',
                                padding: '4px 14px',
                                borderRadius: 'var(--radius-full)',
                                background: profile?.plan === 'PREMIUM' ? 'linear-gradient(135deg, var(--color-accent), var(--color-accent-dark))' : 'var(--color-bg-alt)',
                                color: profile?.plan === 'PREMIUM' ? 'white' : 'var(--color-text)',
                                display: 'inline-block',
                            }}>
                                {profile?.plan === 'PREMIUM' ? '⭐ Premium' : 'Gratis'}
                            </div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center', color: 'var(--color-text-muted)', fontSize: '0.8rem', marginBottom: '4px' }}>
                                <FileText size={14} /> Undangan
                            </div>
                            <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                                {profile?._count?.invitations || 0}
                            </div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center', color: 'var(--color-text-muted)', fontSize: '0.8rem', marginBottom: '4px' }}>
                                <Calendar size={14} /> Bergabung
                            </div>
                            <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                                {profile?.createdAt ? formatDate(profile.createdAt) : '-'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Alert Messages */}
                {success && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '14px 16px',
                        borderRadius: 'var(--radius-md)',
                        background: '#F0FDF4',
                        border: '1px solid #BBF7D0',
                        color: '#15803D',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        marginBottom: '16px',
                    }}>
                        <Check size={18} /> {success}
                    </div>
                )}

                {error && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '14px 16px',
                        borderRadius: 'var(--radius-md)',
                        background: '#FEF2F2',
                        border: '1px solid #FECACA',
                        color: '#DC2626',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        marginBottom: '16px',
                    }}>
                        <AlertCircle size={18} /> {error}
                    </div>
                )}

                {/* Edit Form */}
                <form onSubmit={handleSaveProfile}>
                    {/* Basic Info */}
                    <div className="card" style={{ padding: '28px', marginBottom: '24px' }}>
                        <h3 className="font-display" style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <User size={18} style={{ color: 'var(--color-primary)' }} />
                            Informasi Dasar
                        </h3>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '24px' }}>
                            Perbarui nama dan email akun Anda.
                        </p>

                        <div style={{ marginBottom: '20px' }}>
                            <label className="input-label">Nama Lengkap</label>
                            <div style={{ position: 'relative' }}>
                                <User size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                                <input
                                    className="input-field"
                                    style={{ paddingLeft: '40px' }}
                                    placeholder="Nama lengkap Anda"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="input-label">Email</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                                <input
                                    className="input-field"
                                    type="email"
                                    style={{ paddingLeft: '40px' }}
                                    placeholder="email@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Change Password */}
                    <div className="card" style={{ padding: '28px', marginBottom: '24px' }}>
                        <h3 className="font-display" style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Lock size={18} style={{ color: 'var(--color-primary)' }} />
                            Ubah Password
                        </h3>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '24px' }}>
                            Kosongkan jika tidak ingin mengubah password.
                        </p>

                        <div style={{ marginBottom: '20px' }}>
                            <label className="input-label">Password Saat Ini</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                                <input
                                    className="input-field"
                                    type={showCurrentPassword ? 'text' : 'password'}
                                    style={{ paddingLeft: '40px', paddingRight: '40px' }}
                                    placeholder="••••••••"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex' }}
                                >
                                    {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label className="input-label">Password Baru</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                                <input
                                    className="input-field"
                                    type={showNewPassword ? 'text' : 'password'}
                                    style={{ paddingLeft: '40px', paddingRight: '40px' }}
                                    placeholder="Minimal 6 karakter"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex' }}
                                >
                                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="input-label">Konfirmasi Password Baru</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                                <input
                                    className="input-field"
                                    type="password"
                                    style={{ paddingLeft: '40px' }}
                                    placeholder="Ulangi password baru"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                            {newPassword && confirmPassword && newPassword !== confirmPassword && (
                                <p style={{ color: '#DC2626', fontSize: '0.8rem', marginTop: '6px' }}>
                                    Password tidak cocok
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Save Button */}
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={saving}
                        style={{
                            width: '100%',
                            padding: '14px',
                            fontSize: '1rem',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                        }}
                    >
                        {saving ? (
                            <>
                                <Loader2 size={18} className="animate-spin" /> Menyimpan...
                            </>
                        ) : (
                            <>
                                <Save size={18} /> Simpan Perubahan
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
