'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    ArrowRight,
    Heart,
    Calendar,
    MapPin,
    BookOpen,
    Image,
    Music,
    Wallet,
    Eye,
    Check,
    Upload,
    X,
    Loader2,
} from 'lucide-react';
import { templates } from '@/lib/templates';

const steps = [
    { id: 1, title: 'Template', icon: Heart },
    { id: 2, title: 'Pasangan', icon: Heart },
    { id: 3, title: 'Acara', icon: Calendar },
    { id: 4, title: 'Cerita', icon: BookOpen },
    { id: 5, title: 'Galeri', icon: Image },
    { id: 6, title: 'Musik', icon: Music },
    { id: 7, title: 'Amplop', icon: Wallet },
    { id: 8, title: 'Preview', icon: Eye },
];

export default function CreateInvitationPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [currentStep, setCurrentStep] = useState(1);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [formData, setFormData] = useState({
        templateId: searchParams.get('template') || 'elegant-rose',
        groomName: '',
        brideName: '',
        groomPhoto: '',
        bridePhoto: '',
        coverPhoto: '',
        groomFather: '',
        groomMother: '',
        brideFather: '',
        brideMother: '',
        eventDate: '',
        akadDate: '',
        akadTime: '',
        receptionTime: '',
        venue: '',
        venueAddress: '',
        lat: '',
        lng: '',
        story: '',
        galleryPhotos: '[]',
        musicUrl: '',
        bankName: '',
        bankAccount: '',
        bankHolder: '',
        qrisImage: '',
        slug: '',
    });

    const updateField = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleFileUpload = async (field: string) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = field === 'musicUrl' ? 'audio/*' : 'image/*';

        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            setUploading(true);
            try {
                const fd = new FormData();
                fd.append('file', file);
                const res = await fetch('/api/upload', { method: 'POST', body: fd });
                const data = await res.json();
                if (data.url) {
                    updateField(field, data.url);
                }
            } catch (err) {
                console.error('Upload error:', err);
            } finally {
                setUploading(false);
            }
        };
        input.click();
    };

    const handleGalleryUpload = async () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.multiple = true;

        input.onchange = async (e) => {
            const files = (e.target as HTMLInputElement).files;
            if (!files) return;

            setUploading(true);
            const currentPhotos = JSON.parse(formData.galleryPhotos || '[]');

            for (const file of Array.from(files)) {
                try {
                    const fd = new FormData();
                    fd.append('file', file);
                    const res = await fetch('/api/upload', { method: 'POST', body: fd });
                    const data = await res.json();
                    if (data.url) {
                        currentPhotos.push(data.url);
                    }
                } catch (err) {
                    console.error('Gallery upload error:', err);
                }
            }

            updateField('galleryPhotos', JSON.stringify(currentPhotos));
            setUploading(false);
        };
        input.click();
    };

    const removeGalleryPhoto = (index: number) => {
        const photos = JSON.parse(formData.galleryPhotos || '[]');
        photos.splice(index, 1);
        updateField('galleryPhotos', JSON.stringify(photos));
    };

    const handleSubmit = async (publish: boolean) => {
        setSaving(true);
        try {
            const res = await fetch('/api/invitations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    isPublished: publish,
                }),
            });

            if (res.ok) {
                router.push('/dashboard');
            }
        } catch (err) {
            console.error('Save error:', err);
        } finally {
            setSaving(false);
        }
    };

    const selectedTemplate = templates.find((t) => t.id === formData.templateId);
    const galleryPhotos: string[] = JSON.parse(formData.galleryPhotos || '[]');

    const fieldStyle: React.CSSProperties = { marginBottom: '20px' };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg-alt)' }}>
            {/* Header */}
            <header className="glass" style={{ position: 'sticky', top: 0, zIndex: 40, padding: '16px 0', borderBottom: '1px solid var(--color-border)' }}>
                <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'var(--color-text)' }}>
                        <ArrowLeft size={18} />
                        <span className="font-display" style={{ fontWeight: 700 }}>Buat Undangan</span>
                    </Link>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleSubmit(false)} className="btn btn-secondary btn-sm" disabled={saving}>
                            Simpan Draft
                        </button>
                        <button onClick={() => handleSubmit(true)} className="btn btn-primary btn-sm" disabled={saving}>
                            {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                            Publish
                        </button>
                    </div>
                </div>
            </header>

            <div className="container" style={{ padding: '32px 24px', maxWidth: '900px' }}>
                {/* Step Indicator */}
                <div style={{ display: 'flex', gap: '4px', marginBottom: '40px', overflowX: 'auto', paddingBottom: '8px' }}>
                    {steps.map((step) => (
                        <button
                            key={step.id}
                            onClick={() => setCurrentStep(step.id)}
                            style={{
                                flex: '1',
                                minWidth: '80px',
                                padding: '12px 8px',
                                borderRadius: 'var(--radius-md)',
                                border: 'none',
                                cursor: 'pointer',
                                background: currentStep === step.id ? 'var(--color-primary)' : currentStep > step.id ? 'var(--color-primary-100)' : 'var(--color-surface)',
                                color: currentStep === step.id ? 'white' : currentStep > step.id ? 'var(--color-primary)' : 'var(--color-text-muted)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '6px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                transition: 'all 0.2s ease',
                            }}
                        >
                            <step.icon size={16} />
                            {step.title}
                        </button>
                    ))}
                </div>

                {/* Step Content */}
                <div className="card" style={{ padding: '32px' }}>
                    {/* Step 1: Template Selection */}
                    {currentStep === 1 && (
                        <div>
                            <h2 className="font-display" style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px' }}>Pilih Template</h2>
                            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '24px' }}>Pilih desain yang sesuai dengan gaya pernikahan Anda.</p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                                {templates.map((t) => (
                                    <div
                                        key={t.id}
                                        onClick={() => updateField('templateId', t.id)}
                                        style={{
                                            borderRadius: 'var(--radius-md)',
                                            border: `2px solid ${formData.templateId === t.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
                                            overflow: 'hidden',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                        }}
                                    >
                                        <div style={{
                                            height: '120px',
                                            background: `linear-gradient(135deg, ${t.colorBg}, ${t.colorSecondary}30)`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}>
                                            <span style={{ fontFamily: t.fontDisplay, fontSize: '1rem', fontWeight: 700, color: t.colorPrimary }}>
                                                {t.name}
                                            </span>
                                        </div>
                                        <div style={{ padding: '12px', textAlign: 'center' }}>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{t.name}</div>
                                            {formData.templateId === t.id && (
                                                <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)' }}>✓ Dipilih</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Couple Info */}
                    {currentStep === 2 && (
                        <div>
                            <h2 className="font-display" style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px' }}>Informasi Pasangan</h2>
                            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '24px' }}>Masukkan data mempelai pria dan wanita.</p>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                <div>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px', color: 'var(--color-primary)' }}>🤵 Mempelai Pria</h3>
                                    <div style={fieldStyle}>
                                        <label className="input-label">Nama Lengkap *</label>
                                        <input className="input-field" placeholder="Nama mempelai pria" value={formData.groomName} onChange={(e) => updateField('groomName', e.target.value)} />
                                    </div>
                                    <div style={fieldStyle}>
                                        <label className="input-label">Putra dari Bapak</label>
                                        <input className="input-field" placeholder="Nama ayah" value={formData.groomFather} onChange={(e) => updateField('groomFather', e.target.value)} />
                                    </div>
                                    <div style={fieldStyle}>
                                        <label className="input-label">dan Ibu</label>
                                        <input className="input-field" placeholder="Nama ibu" value={formData.groomMother} onChange={(e) => updateField('groomMother', e.target.value)} />
                                    </div>
                                    <div style={fieldStyle}>
                                        <label className="input-label">Foto</label>
                                        {formData.groomPhoto ? (
                                            <div style={{ position: 'relative', width: '120px', height: '120px', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                                                <img src={formData.groomPhoto} alt="Groom" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                <button onClick={() => updateField('groomPhoto', '')} style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ) : (
                                            <button onClick={() => handleFileUpload('groomPhoto')} className="btn btn-secondary btn-sm" disabled={uploading}>
                                                {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                                                {uploading ? 'Uploading...' : 'Upload Foto'}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px', color: 'var(--color-primary)' }}>👰 Mempelai Wanita</h3>
                                    <div style={fieldStyle}>
                                        <label className="input-label">Nama Lengkap *</label>
                                        <input className="input-field" placeholder="Nama mempelai wanita" value={formData.brideName} onChange={(e) => updateField('brideName', e.target.value)} />
                                    </div>
                                    <div style={fieldStyle}>
                                        <label className="input-label">Putri dari Bapak</label>
                                        <input className="input-field" placeholder="Nama ayah" value={formData.brideFather} onChange={(e) => updateField('brideFather', e.target.value)} />
                                    </div>
                                    <div style={fieldStyle}>
                                        <label className="input-label">dan Ibu</label>
                                        <input className="input-field" placeholder="Nama ibu" value={formData.brideMother} onChange={(e) => updateField('brideMother', e.target.value)} />
                                    </div>
                                    <div style={fieldStyle}>
                                        <label className="input-label">Foto</label>
                                        {formData.bridePhoto ? (
                                            <div style={{ position: 'relative', width: '120px', height: '120px', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                                                <img src={formData.bridePhoto} alt="Bride" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                <button onClick={() => updateField('bridePhoto', '')} style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ) : (
                                            <button onClick={() => handleFileUpload('bridePhoto')} className="btn btn-secondary btn-sm" disabled={uploading}>
                                                {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                                                {uploading ? 'Uploading...' : 'Upload Foto'}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div style={{ gridColumn: '1 / -1', marginTop: '32px', padding: '24px', background: 'var(--color-bg-alt)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--color-border)' }}>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '8px', color: 'var(--color-primary)' }}>🖼️ Foto Sampul (Cover)</h3>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
                                        Upload foto landscape/portrait resolusi tinggi untuk background halaman utama.
                                    </p>
                                    <div style={fieldStyle}>
                                        {formData.coverPhoto ? (
                                            <div style={{ position: 'relative', width: '100%', height: '240px', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                                                <img src={formData.coverPhoto} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                <button onClick={() => updateField('coverPhoto', '')} style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ) : (
                                            <button onClick={() => handleFileUpload('coverPhoto')} className="btn btn-secondary" disabled={uploading} style={{ width: '100%', padding: '32px', flexDirection: 'column', gap: '8px' }}>
                                                <Image size={32} />
                                                <span>{uploading ? 'Uploading...' : 'Upload Foto Sampul'}</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Event Details */}
                    {currentStep === 3 && (
                        <div>
                            <h2 className="font-display" style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px' }}>Detail Acara</h2>
                            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '24px' }}>Isi informasi waktu dan lokasi acara.</p>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div style={fieldStyle}>
                                    <label className="input-label">Tanggal Akad</label>
                                    <input type="date" className="input-field" value={formData.akadDate} onChange={(e) => updateField('akadDate', e.target.value)} />
                                </div>
                                <div style={fieldStyle}>
                                    <label className="input-label">Waktu Akad</label>
                                    <input type="time" className="input-field" value={formData.akadTime} onChange={(e) => updateField('akadTime', e.target.value)} />
                                </div>
                                <div style={fieldStyle}>
                                    <label className="input-label">Tanggal Resepsi</label>
                                    <input type="date" className="input-field" value={formData.eventDate} onChange={(e) => updateField('eventDate', e.target.value)} />
                                </div>
                                <div style={fieldStyle}>
                                    <label className="input-label">Waktu Resepsi</label>
                                    <input type="time" className="input-field" value={formData.receptionTime} onChange={(e) => updateField('receptionTime', e.target.value)} />
                                </div>
                            </div>

                            <div style={fieldStyle}>
                                <label className="input-label">Nama Tempat / Venue</label>
                                <input className="input-field" placeholder="Cth: Gedung Serbaguna Wijaya" value={formData.venue} onChange={(e) => updateField('venue', e.target.value)} />
                            </div>
                            <div style={fieldStyle}>
                                <label className="input-label">Alamat Lengkap</label>
                                <textarea className="input-field" rows={3} placeholder="Alamat lengkap venue" value={formData.venueAddress} onChange={(e) => updateField('venueAddress', e.target.value)} style={{ resize: 'vertical' }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div style={fieldStyle}>
                                    <label className="input-label">Latitude (opsional)</label>
                                    <input className="input-field" placeholder="-6.xxxxx" value={formData.lat} onChange={(e) => updateField('lat', e.target.value)} />
                                </div>
                                <div style={fieldStyle}>
                                    <label className="input-label">Longitude (opsional)</label>
                                    <input className="input-field" placeholder="106.xxxxx" value={formData.lng} onChange={(e) => updateField('lng', e.target.value)} />
                                </div>
                            </div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                💡 Tip: Cari koordinat di Google Maps, klik kanan pada lokasi, lalu salin koordinatnya.
                            </p>
                        </div>
                    )}

                    {/* Step 4: Love Story */}
                    {currentStep === 4 && (
                        <div>
                            <h2 className="font-display" style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px' }}>Love Story</h2>
                            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '24px' }}>Ceritakan kisah cinta Anda (opsional).</p>
                            <div style={fieldStyle}>
                                <label className="input-label">Cerita Cinta</label>
                                <textarea
                                    className="input-field"
                                    rows={10}
                                    placeholder="Tulis cerita perjalanan cinta kalian di sini... Bagaimana pertama kali bertemu, bagaimana cerita asmara kalian, dan akhirnya memutuskan untuk menikah."
                                    value={formData.story}
                                    onChange={(e) => updateField('story', e.target.value)}
                                    style={{ resize: 'vertical' }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 5: Gallery */}
                    {currentStep === 5 && (
                        <div>
                            <h2 className="font-display" style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px' }}>Galeri Foto</h2>
                            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '24px' }}>Upload foto-foto pre-wedding atau foto bersama.</p>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                                {galleryPhotos.map((photo: string, i: number) => (
                                    <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                                        <img src={photo} alt={`Gallery ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <button
                                            onClick={() => removeGalleryPhoto(i)}
                                            style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={handleGalleryUpload}
                                    disabled={uploading}
                                    style={{
                                        aspectRatio: '1',
                                        borderRadius: 'var(--radius-md)',
                                        border: '2px dashed var(--color-border)',
                                        background: 'var(--color-bg-alt)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        color: 'var(--color-text-muted)',
                                        fontSize: '0.85rem',
                                        transition: 'all 0.2s ease',
                                    }}
                                >
                                    {uploading ? <Loader2 size={24} className="animate-spin" /> : <Upload size={24} />}
                                    {uploading ? 'Uploading...' : 'Tambah Foto'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 6: Music */}
                    {currentStep === 6 && (
                        <div>
                            <h2 className="font-display" style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px' }}>Musik Latar</h2>
                            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '24px' }}>Upload musik untuk menemani undangan Anda (opsional).</p>

                            {formData.musicUrl ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: 'var(--color-bg-alt)', borderRadius: 'var(--radius-md)' }}>
                                    <Music size={24} style={{ color: 'var(--color-primary)' }} />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Musik sudah diupload</div>
                                        <audio controls src={formData.musicUrl} style={{ width: '100%', marginTop: '8px' }} />
                                    </div>
                                    <button onClick={() => updateField('musicUrl', '')} className="btn btn-sm" style={{ background: '#FEF2F2', color: '#DC2626' }}>
                                        <X size={14} /> Hapus
                                    </button>
                                </div>
                            ) : (
                                <button onClick={() => handleFileUpload('musicUrl')} className="btn btn-secondary" disabled={uploading} style={{ width: '100%', padding: '40px', flexDirection: 'column', gap: '12px' }}>
                                    <Upload size={32} />
                                    <span>{uploading ? 'Uploading...' : 'Upload File Musik (MP3)'}</span>
                                </button>
                            )}
                        </div>
                    )}

                    {/* Step 7: Digital Envelope */}
                    {currentStep === 7 && (
                        <div>
                            <h2 className="font-display" style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px' }}>Amplop Digital</h2>
                            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '24px' }}>Tambahkan informasi rekening untuk menerima hadiah (opsional).</p>

                            <div style={fieldStyle}>
                                <label className="input-label">Nama Bank</label>
                                <input className="input-field" placeholder="Cth: BCA, Mandiri, BNI" value={formData.bankName} onChange={(e) => updateField('bankName', e.target.value)} />
                            </div>
                            <div style={fieldStyle}>
                                <label className="input-label">Nomor Rekening</label>
                                <input className="input-field" placeholder="Nomor rekening" value={formData.bankAccount} onChange={(e) => updateField('bankAccount', e.target.value)} />
                            </div>
                            <div style={fieldStyle}>
                                <label className="input-label">Atas Nama</label>
                                <input className="input-field" placeholder="Nama pemilik rekening" value={formData.bankHolder} onChange={(e) => updateField('bankHolder', e.target.value)} />
                            </div>
                            <div style={fieldStyle}>
                                <label className="input-label">QRIS (opsional)</label>
                                {formData.qrisImage ? (
                                    <div style={{ position: 'relative', width: '200px' }}>
                                        <img src={formData.qrisImage} alt="QRIS" style={{ width: '100%', borderRadius: 'var(--radius-md)' }} />
                                        <button onClick={() => updateField('qrisImage', '')} style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <X size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <button onClick={() => handleFileUpload('qrisImage')} className="btn btn-secondary btn-sm" disabled={uploading}>
                                        {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                                        {uploading ? 'Uploading...' : 'Upload QRIS'}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 8: Preview */}
                    {currentStep === 8 && (
                        <div>
                            <h2 className="font-display" style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px' }}>Preview & Publish</h2>
                            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '24px' }}>Review undangan Anda sebelum dipublish.</p>

                            <div style={{ display: 'grid', gap: '16px' }}>
                                <div style={{ padding: '16px', background: 'var(--color-bg-alt)', borderRadius: 'var(--radius-md)' }}>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Template</div>
                                    <div style={{ fontWeight: 600 }}>{selectedTemplate?.name}</div>
                                </div>
                                <div style={{ padding: '16px', background: 'var(--color-bg-alt)', borderRadius: 'var(--radius-md)' }}>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Pasangan</div>
                                    <div style={{ fontWeight: 600 }}>{formData.groomName || '...'} & {formData.brideName || '...'}</div>
                                </div>
                                <div style={{ padding: '16px', background: 'var(--color-bg-alt)', borderRadius: 'var(--radius-md)' }}>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Acara</div>
                                    <div style={{ fontWeight: 600 }}>{formData.venue || 'Belum diisi'}</div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>{formData.eventDate || 'Tanggal belum dipilih'}</div>
                                </div>
                                <div style={{ padding: '16px', background: 'var(--color-bg-alt)', borderRadius: 'var(--radius-md)' }}>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Konten</div>
                                    <div style={{ fontSize: '0.9rem' }}>
                                        {galleryPhotos.length} foto galeri • {formData.musicUrl ? '✓' : '✗'} Musik • {formData.bankName ? '✓' : '✗'} Amplop Digital
                                    </div>
                                </div>
                            </div>

                            <div style={fieldStyle}>
                                <label className="input-label">Custom URL Slug (opsional)</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
                                    <span style={{ padding: '12px 14px', background: 'var(--color-bg-alt)', border: '1.5px solid var(--color-border)', borderRight: 'none', borderRadius: 'var(--radius-md) 0 0 var(--radius-md)', fontSize: '0.9rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                                        undangan.com/
                                    </span>
                                    <input
                                        className="input-field"
                                        style={{ borderRadius: '0 var(--radius-md) var(--radius-md) 0' }}
                                        placeholder={`${formData.groomName.toLowerCase() || 'romeo'}-${formData.brideName.toLowerCase() || 'juliet'}`}
                                        value={formData.slug}
                                        onChange={(e) => updateField('slug', e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                                <button onClick={() => handleSubmit(false)} className="btn btn-secondary" disabled={saving} style={{ flex: 1 }}>
                                    Simpan sebagai Draft
                                </button>
                                <button onClick={() => handleSubmit(true)} className="btn btn-primary" disabled={saving} style={{ flex: 1 }}>
                                    {saving ? 'Menyimpan...' : '🚀 Publish Undangan'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Navigation */}
                    {currentStep < 8 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--color-border)' }}>
                            <button
                                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                                className="btn btn-secondary"
                                disabled={currentStep === 1}
                            >
                                <ArrowLeft size={16} /> Sebelumnya
                            </button>
                            <button
                                onClick={() => setCurrentStep(Math.min(8, currentStep + 1))}
                                className="btn btn-primary"
                            >
                                Selanjutnya <ArrowRight size={16} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
}
