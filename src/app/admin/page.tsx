'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import {
    Shield,
    Users,
    Crown,
    Heart,
    Search,
    LogOut,
    LayoutDashboard,
    Loader2,
    UserCheck,
    UserX,
    ChevronDown,
    Menu,
    X,
    TrendingUp,
    Bell,
    Settings,
    Home,
} from 'lucide-react';

interface UserItem {
    id: string;
    name: string;
    email: string;
    role: string;
    plan: string;
    createdAt: string;
    _count: { invitations: number };
}

export default function AdminPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [users, setUsers] = useState<UserItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'ALL' | 'FREE' | 'PREMIUM'>('ALL');
    const [updating, setUpdating] = useState<string | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activePage, setActivePage] = useState<'dashboard' | 'users'>('dashboard');
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const currentUser = session?.user as { id: string; role: string; name?: string; email?: string } | undefined;

    useEffect(() => {
        if (status === 'authenticated') {
            if (currentUser?.role !== 'ADMIN') {
                router.replace('/dashboard');
                return;
            }
            fetchUsers();
        }
    }, [status]);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users');
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (err) {
            console.error('Error fetching users:', err);
        } finally {
            setLoading(false);
        }
    };

    const togglePlan = async (userId: string, newPlan: string) => {
        setUpdating(userId);
        try {
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plan: newPlan }),
            });
            if (res.ok) {
                const updated = await res.json();
                setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
            }
        } catch (err) {
            console.error('Error updating user:', err);
        } finally {
            setUpdating(null);
        }
    };

    const filteredUsers = users.filter((u) => {
        const matchSearch =
            u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase());
        const matchFilter = filter === 'ALL' || u.plan === filter;
        return matchSearch && matchFilter;
    });

    const stats = {
        total: users.length,
        premium: users.filter((u) => u.plan === 'PREMIUM').length,
        free: users.filter((u) => u.plan === 'FREE').length,
        invitations: users.reduce((acc, u) => acc + u._count.invitations, 0),
    };

    if (status === 'loading' || loading) {
        return (
            <div style={styles.loadingScreen}>
                <Loader2 size={32} style={{ color: '#6366f1', animation: 'spin 1s linear infinite' }} />
                <span style={{ marginTop: '12px', color: '#94a3b8', fontSize: '0.9rem' }}>Memuat admin panel...</span>
            </div>
        );
    }

    if (currentUser?.role !== 'ADMIN') return null;

    return (
        <div style={styles.wrapper}>
            {/* ===== SIDEBAR ===== */}
            <aside style={{ ...styles.sidebar, ...(sidebarOpen ? {} : styles.sidebarCollapsed) }}>
                {/* Brand */}
                <div style={styles.sidebarBrand}>
                    <Shield size={28} style={{ color: '#818cf8' }} />
                    {sidebarOpen && (
                        <span style={styles.brandText}>Admin Panel</span>
                    )}
                </div>

                {/* Nav */}
                <nav style={styles.sidebarNav}>
                    <div style={styles.navSection}>
                        {sidebarOpen && <span style={styles.navLabel}>MENU</span>}
                    </div>

                    <button
                        onClick={() => setActivePage('dashboard')}
                        style={{
                            ...styles.navItem,
                            ...(activePage === 'dashboard' ? styles.navItemActive : {}),
                        }}
                    >
                        <LayoutDashboard size={20} />
                        {sidebarOpen && <span>Dashboard</span>}
                    </button>

                    <button
                        onClick={() => setActivePage('users')}
                        style={{
                            ...styles.navItem,
                            ...(activePage === 'users' ? styles.navItemActive : {}),
                        }}
                    >
                        <Users size={20} />
                        {sidebarOpen && <span>Kelola Users</span>}
                        {sidebarOpen && (
                            <span style={styles.navBadge}>{users.length}</span>
                        )}
                    </button>

                    <div style={{ ...styles.navSection, marginTop: '24px' }}>
                        {sidebarOpen && <span style={styles.navLabel}>LAINNYA</span>}
                    </div>

                    <Link href="/dashboard" style={{ ...styles.navItem, textDecoration: 'none' }}>
                        <Home size={20} />
                        {sidebarOpen && <span>User Dashboard</span>}
                    </Link>

                    <Link href="/" style={{ ...styles.navItem, textDecoration: 'none' }}>
                        <Heart size={20} />
                        {sidebarOpen && <span>Landing Page</span>}
                    </Link>
                </nav>

                {/* Sidebar Footer */}
                <div style={styles.sidebarFooter}>
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        style={styles.collapseBtn}
                        title={sidebarOpen ? 'Collapse' : 'Expand'}
                    >
                        <Menu size={18} />
                    </button>
                </div>
            </aside>

            {/* ===== MAIN ===== */}
            <div style={{ ...styles.main, ...(sidebarOpen ? {} : styles.mainExpanded) }}>
                {/* Top Bar */}
                <header style={styles.topbar}>
                    <div style={styles.topbarLeft}>
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            style={styles.hamburger}
                        >
                            <Menu size={20} />
                        </button>
                        <h1 style={styles.pageTitle}>
                            {activePage === 'dashboard' ? 'Dashboard' : 'Kelola Users'}
                        </h1>
                    </div>

                    <div style={styles.topbarRight}>
                        {/* User Menu */}
                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                style={styles.userBtn}
                            >
                                <div style={styles.avatar}>
                                    {currentUser?.name?.charAt(0)?.toUpperCase() || 'A'}
                                </div>
                                <div style={styles.userInfo}>
                                    <span style={styles.userName}>{currentUser?.name}</span>
                                    <span style={styles.userRole}>Administrator</span>
                                </div>
                                <ChevronDown size={16} style={{ color: '#94a3b8' }} />
                            </button>

                            {userMenuOpen && (
                                <>
                                    <div style={styles.overlay} onClick={() => setUserMenuOpen(false)} />
                                    <div style={styles.dropdown}>
                                        <Link href="/dashboard" style={styles.dropdownItem} onClick={() => setUserMenuOpen(false)}>
                                            <LayoutDashboard size={16} /> User Dashboard
                                        </Link>
                                        <Link href="/dashboard/profile" style={styles.dropdownItem} onClick={() => setUserMenuOpen(false)}>
                                            <Settings size={16} /> Profil
                                        </Link>
                                        <div style={styles.dropdownDivider} />
                                        <button
                                            onClick={() => signOut({ callbackUrl: '/' })}
                                            style={{ ...styles.dropdownItem, color: '#ef4444', border: 'none', background: 'none', width: '100%' }}
                                        >
                                            <LogOut size={16} /> Keluar
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div style={styles.content}>
                    {activePage === 'dashboard' ? (
                        <DashboardView stats={stats} users={users} />
                    ) : (
                        <UsersView
                            users={filteredUsers}
                            search={search}
                            setSearch={setSearch}
                            filter={filter}
                            setFilter={setFilter}
                            updating={updating}
                            togglePlan={togglePlan}
                            currentUserId={currentUser?.id || ''}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

/* ===== DASHBOARD VIEW ===== */
function DashboardView({ stats, users }: { stats: { total: number; premium: number; free: number; invitations: number }; users: UserItem[] }) {
    const recentUsers = users.slice(0, 5);

    return (
        <>
            {/* Stat Widgets */}
            <div style={styles.statsGrid}>
                {[
                    { label: 'Total Users', value: stats.total, icon: Users, color: '#6366f1', bg: '#eef2ff' },
                    { label: 'Premium', value: stats.premium, icon: Crown, color: '#f59e0b', bg: '#fffbeb' },
                    { label: 'Free', value: stats.free, icon: Users, color: '#10b981', bg: '#ecfdf5' },
                    { label: 'Undangan', value: stats.invitations, icon: Heart, color: '#ec4899', bg: '#fdf2f8' },
                ].map((stat) => (
                    <div key={stat.label} style={styles.statCard}>
                        <div style={styles.statTop}>
                            <div>
                                <p style={styles.statLabel}>{stat.label}</p>
                                <h3 style={styles.statValue}>{stat.value}</h3>
                            </div>
                            <div style={{ ...styles.statIcon, background: stat.bg }}>
                                <stat.icon size={22} style={{ color: stat.color }} />
                            </div>
                        </div>
                        <div style={styles.statBottom}>
                            <TrendingUp size={14} style={{ color: '#10b981' }} />
                            <span style={styles.statTrend}>Aktif</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Users */}
            <div style={styles.tableCard}>
                <div style={styles.tableHeader}>
                    <h3 style={styles.tableTitle}>User Terbaru</h3>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>User</th>
                                <th style={styles.th}>Plan</th>
                                <th style={styles.th}>Undangan</th>
                                <th style={styles.th}>Terdaftar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentUsers.map((user, i) => (
                                <tr key={user.id} style={{ borderBottom: i < recentUsers.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                                    <td style={styles.td}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ ...styles.tableAvatar, background: user.role === 'ADMIN' ? '#eef2ff' : '#f1f5f9', color: user.role === 'ADMIN' ? '#6366f1' : '#64748b' }}>
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, color: '#1e293b' }}>{user.name}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={styles.td}>
                                        <span style={{ ...styles.badge, ...(user.plan === 'PREMIUM' ? styles.badgePremium : styles.badgeFree) }}>
                                            {user.plan === 'PREMIUM' ? '⭐ Premium' : 'Free'}
                                        </span>
                                    </td>
                                    <td style={{ ...styles.td, textAlign: 'center', fontWeight: 600 }}>{user._count.invitations}</td>
                                    <td style={{ ...styles.td, color: '#94a3b8' }}>{format(new Date(user.createdAt), 'dd MMM yyyy', { locale: idLocale })}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

/* ===== USERS VIEW ===== */
function UsersView({
    users,
    search,
    setSearch,
    filter,
    setFilter,
    updating,
    togglePlan,
    currentUserId,
}: {
    users: UserItem[];
    search: string;
    setSearch: (v: string) => void;
    filter: 'ALL' | 'FREE' | 'PREMIUM';
    setFilter: (v: 'ALL' | 'FREE' | 'PREMIUM') => void;
    updating: string | null;
    togglePlan: (id: string, plan: string) => void;
    currentUserId: string;
}) {
    return (
        <div style={styles.tableCard}>
            {/* Toolbar */}
            <div style={styles.toolbar}>
                <div style={styles.searchBox}>
                    <Search size={16} style={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Cari nama atau email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={styles.searchInput}
                    />
                    {search && (
                        <button onClick={() => setSearch('')} style={styles.clearBtn}>
                            <X size={14} />
                        </button>
                    )}
                </div>
                <div style={styles.filterGroup}>
                    {(['ALL', 'FREE', 'PREMIUM'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            style={{
                                ...styles.filterBtn,
                                ...(filter === f ? styles.filterBtnActive : {}),
                            }}
                        >
                            {f === 'ALL' ? 'Semua' : f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>User</th>
                            <th style={styles.th}>Role</th>
                            <th style={styles.th}>Plan</th>
                            <th style={{ ...styles.th, textAlign: 'center' }}>Undangan</th>
                            <th style={styles.th}>Terdaftar</th>
                            <th style={{ ...styles.th, textAlign: 'center' }}>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan={6} style={{ padding: '48px 20px', textAlign: 'center', color: '#94a3b8' }}>
                                    <Users size={40} style={{ marginBottom: '12px', opacity: 0.3 }} />
                                    <p>Tidak ada user ditemukan</p>
                                </td>
                            </tr>
                        ) : (
                            users.map((user, i) => (
                                <tr
                                    key={user.id}
                                    style={{ borderBottom: i < users.length - 1 ? '1px solid #f1f5f9' : 'none' }}
                                >
                                    <td style={styles.td}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ ...styles.tableAvatar, background: user.role === 'ADMIN' ? '#eef2ff' : '#f1f5f9', color: user.role === 'ADMIN' ? '#6366f1' : '#64748b' }}>
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, color: '#1e293b' }}>{user.name}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={styles.td}>
                                        <span style={{ ...styles.badge, ...(user.role === 'ADMIN' ? styles.badgeAdmin : styles.badgeUser) }}>
                                            {user.role === 'ADMIN' ? '👑 Admin' : 'User'}
                                        </span>
                                    </td>
                                    <td style={styles.td}>
                                        <span style={{ ...styles.badge, ...(user.plan === 'PREMIUM' ? styles.badgePremium : styles.badgeFree) }}>
                                            {user.plan === 'PREMIUM' ? '⭐ Premium' : 'Free'}
                                        </span>
                                    </td>
                                    <td style={{ ...styles.td, textAlign: 'center' }}>
                                        <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{user._count.invitations}</span>
                                    </td>
                                    <td style={{ ...styles.td, color: '#94a3b8', fontSize: '0.85rem' }}>
                                        {format(new Date(user.createdAt), 'dd MMM yyyy', { locale: idLocale })}
                                    </td>
                                    <td style={{ ...styles.td, textAlign: 'center' }}>
                                        {user.role !== 'ADMIN' && (
                                            <button
                                                onClick={() => togglePlan(user.id, user.plan === 'PREMIUM' ? 'FREE' : 'PREMIUM')}
                                                disabled={updating === user.id}
                                                style={{
                                                    ...styles.actionBtn,
                                                    ...(user.plan === 'PREMIUM' ? styles.actionBtnDanger : styles.actionBtnSuccess),
                                                    opacity: updating === user.id ? 0.6 : 1,
                                                    cursor: updating === user.id ? 'not-allowed' : 'pointer',
                                                }}
                                            >
                                                {updating === user.id ? (
                                                    <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                                                ) : user.plan === 'PREMIUM' ? (
                                                    <><UserX size={14} /> Nonaktifkan</>
                                                ) : (
                                                    <><UserCheck size={14} /> Aktifkan</>
                                                )}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            <div style={styles.tableFooter}>
                <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                    Menampilkan {users.length} user
                </span>
            </div>
        </div>
    );
}

/* ===== STYLES ===== */
const styles: Record<string, React.CSSProperties> = {
    /* Layout */
    wrapper: {
        display: 'flex',
        minHeight: '100vh',
        background: '#f8fafc',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    },

    /* Sidebar */
    sidebar: {
        width: '260px',
        background: '#1e293b',
        color: '#e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 50,
        transition: 'width 0.3s ease',
        overflowX: 'hidden',
    },
    sidebarCollapsed: {
        width: '72px',
    },
    sidebarBrand: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '20px 22px',
        borderBottom: '1px solid #334155',
        minHeight: '65px',
    },
    brandText: {
        fontSize: '1.1rem',
        fontWeight: 700,
        color: '#f1f5f9',
        whiteSpace: 'nowrap' as const,
    },
    sidebarNav: {
        flex: 1,
        padding: '16px 12px',
        overflowY: 'auto' as const,
    },
    navSection: {
        padding: '8px 10px 4px',
    },
    navLabel: {
        fontSize: '0.65rem',
        fontWeight: 700,
        color: '#64748b',
        letterSpacing: '1.2px',
        textTransform: 'uppercase' as const,
    },
    navItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        width: '100%',
        padding: '10px 14px',
        borderRadius: '8px',
        border: 'none',
        background: 'transparent',
        color: '#94a3b8',
        fontSize: '0.9rem',
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'all 0.15s',
        marginBottom: '2px',
        textDecoration: 'none',
        whiteSpace: 'nowrap' as const,
    },
    navItemActive: {
        background: '#6366f1',
        color: '#fff',
    },
    navBadge: {
        marginLeft: 'auto',
        background: '#334155',
        color: '#94a3b8',
        padding: '2px 8px',
        borderRadius: '12px',
        fontSize: '0.7rem',
        fontWeight: 600,
    },
    sidebarFooter: {
        padding: '12px',
        borderTop: '1px solid #334155',
    },
    collapseBtn: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        padding: '8px',
        borderRadius: '8px',
        border: 'none',
        background: '#334155',
        color: '#94a3b8',
        cursor: 'pointer',
    },

    /* Main */
    main: {
        flex: 1,
        marginLeft: '260px',
        transition: 'margin-left 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
    },
    mainExpanded: {
        marginLeft: '72px',
    },

    /* Topbar */
    topbar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        height: '65px',
        background: '#fff',
        borderBottom: '1px solid #e2e8f0',
        position: 'sticky' as const,
        top: 0,
        zIndex: 40,
    },
    topbarLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
    },
    hamburger: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '36px',
        height: '36px',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        background: '#fff',
        color: '#64748b',
        cursor: 'pointer',
    },
    pageTitle: {
        fontSize: '1.15rem',
        fontWeight: 700,
        color: '#1e293b',
        margin: 0,
    },
    topbarRight: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    userBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '6px 12px',
        borderRadius: '10px',
        border: '1px solid #e2e8f0',
        background: '#fff',
        cursor: 'pointer',
        transition: 'all 0.15s',
    },
    avatar: {
        width: '34px',
        height: '34px',
        borderRadius: '8px',
        background: '#6366f1',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.85rem',
        fontWeight: 700,
    },
    userInfo: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
    userName: {
        fontSize: '0.85rem',
        fontWeight: 600,
        color: '#1e293b',
    },
    userRole: {
        fontSize: '0.7rem',
        color: '#94a3b8',
    },
    overlay: {
        position: 'fixed' as const,
        inset: 0,
        zIndex: 40,
    },
    dropdown: {
        position: 'absolute' as const,
        right: 0,
        top: 'calc(100% + 8px)',
        background: '#fff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
        minWidth: '200px',
        zIndex: 50,
        padding: '6px',
        overflow: 'hidden',
    },
    dropdownItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 14px',
        borderRadius: '8px',
        fontSize: '0.85rem',
        fontWeight: 500,
        color: '#475569',
        cursor: 'pointer',
        textDecoration: 'none',
        transition: 'background 0.1s',
    },
    dropdownDivider: {
        height: '1px',
        background: '#f1f5f9',
        margin: '4px 0',
    },

    /* Loading */
    loadingScreen: {
        minHeight: '100vh',
        background: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },

    /* Content */
    content: {
        flex: 1,
        padding: '24px',
    },

    /* Stats */
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '20px',
        marginBottom: '24px',
    },
    statCard: {
        background: '#fff',
        borderRadius: '14px',
        padding: '22px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    },
    statTop: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    statLabel: {
        fontSize: '0.8rem',
        fontWeight: 500,
        color: '#94a3b8',
        margin: '0 0 6px 0',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.3px',
    },
    statValue: {
        fontSize: '1.8rem',
        fontWeight: 800,
        color: '#1e293b',
        margin: 0,
        lineHeight: 1,
    },
    statIcon: {
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    statBottom: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        marginTop: '14px',
        paddingTop: '14px',
        borderTop: '1px solid #f1f5f9',
    },
    statTrend: {
        fontSize: '0.8rem',
        color: '#10b981',
        fontWeight: 500,
    },

    /* Table Card */
    tableCard: {
        background: '#fff',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        overflow: 'hidden',
    },
    tableHeader: {
        padding: '20px 24px',
        borderBottom: '1px solid #f1f5f9',
    },
    tableTitle: {
        fontSize: '1rem',
        fontWeight: 700,
        color: '#1e293b',
        margin: 0,
    },

    /* Toolbar */
    toolbar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 24px',
        borderBottom: '1px solid #f1f5f9',
        gap: '16px',
        flexWrap: 'wrap' as const,
    },
    searchBox: {
        position: 'relative' as const,
        flex: 1,
        maxWidth: '320px',
    },
    searchIcon: {
        position: 'absolute' as const,
        left: '12px',
        top: '50%',
        transform: 'translateY(-50%)',
        color: '#94a3b8',
    },
    searchInput: {
        width: '100%',
        padding: '9px 36px 9px 38px',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        fontSize: '0.85rem',
        background: '#f8fafc',
        color: '#1e293b',
        outline: 'none',
        boxSizing: 'border-box' as const,
    },
    clearBtn: {
        position: 'absolute' as const,
        right: '8px',
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'none',
        border: 'none',
        color: '#94a3b8',
        cursor: 'pointer',
        display: 'flex',
        padding: '4px',
    },
    filterGroup: {
        display: 'flex',
        gap: '4px',
        background: '#f1f5f9',
        borderRadius: '8px',
        padding: '3px',
    },
    filterBtn: {
        padding: '7px 14px',
        borderRadius: '6px',
        border: 'none',
        background: 'transparent',
        color: '#64748b',
        fontSize: '0.8rem',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.15s',
    },
    filterBtnActive: {
        background: '#fff',
        color: '#1e293b',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    },

    /* Table */
    table: {
        width: '100%',
        borderCollapse: 'collapse' as const,
    },
    th: {
        padding: '12px 24px',
        textAlign: 'left' as const,
        fontWeight: 600,
        color: '#64748b',
        fontSize: '0.75rem',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.5px',
        background: '#f8fafc',
        borderBottom: '1px solid #e2e8f0',
    },
    td: {
        padding: '14px 24px',
        fontSize: '0.9rem',
        verticalAlign: 'middle' as const,
    },
    tableAvatar: {
        width: '38px',
        height: '38px',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.85rem',
        fontWeight: 700,
        flexShrink: 0,
    },
    tableFooter: {
        padding: '14px 24px',
        borderTop: '1px solid #f1f5f9',
    },

    /* Badges */
    badge: {
        padding: '4px 10px',
        borderRadius: '6px',
        fontSize: '0.73rem',
        fontWeight: 600,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
    },
    badgePremium: {
        background: '#fef3c7',
        color: '#92400e',
    },
    badgeFree: {
        background: '#f1f5f9',
        color: '#64748b',
    },
    badgeAdmin: {
        background: '#eef2ff',
        color: '#4f46e5',
    },
    badgeUser: {
        background: '#f1f5f9',
        color: '#64748b',
    },

    /* Action Button */
    actionBtn: {
        padding: '7px 14px',
        borderRadius: '8px',
        border: 'none',
        fontSize: '0.8rem',
        fontWeight: 600,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        transition: 'all 0.15s',
    },
    actionBtnSuccess: {
        background: '#ecfdf5',
        color: '#059669',
    },
    actionBtnDanger: {
        background: '#fef2f2',
        color: '#dc2626',
    },
};
