export interface Template {
    id: string;
    name: string;
    category: string;
    description: string;
    colorPrimary: string;
    colorSecondary: string;
    colorAccent: string;
    colorBg: string;
    colorText: string;
    fontDisplay: string;
    fontBody: string;
    isPremium: boolean;
}

export const templates: Template[] = [
    {
        id: 'elegant-rose',
        name: 'Elegant Rose',
        category: 'Pernikahan',
        description: 'Tema rose gold yang elegan dengan ornamen floral. Cocok untuk pernikahan yang mewah dan romantis.',
        colorPrimary: '#b76e79',
        colorSecondary: '#d4a0a7',
        colorAccent: '#c9a96e',
        colorBg: '#fdf2f4',
        colorText: '#2d2d2d',
        fontDisplay: "'Playfair Display', serif",
        fontBody: "'Inter', sans-serif",
        isPremium: false,
    },
    {
        id: 'rustic-garden',
        name: 'Rustic Garden',
        category: 'Pernikahan',
        description: 'Tema greenery dengan nuansa alam yang hangat. Sempurna untuk pernikahan outdoor atau garden party.',
        colorPrimary: '#6b8f71',
        colorSecondary: '#a8c5a0',
        colorAccent: '#c9a96e',
        colorBg: '#f5f7f0',
        colorText: '#2d3527',
        fontDisplay: "'Playfair Display', serif",
        fontBody: "'Inter', sans-serif",
        isPremium: false,
    },
    {
        id: 'modern-minimalist',
        name: 'Modern Minimalist',
        category: 'Pernikahan',
        description: 'Desain clean dan modern dengan tipografi yang kuat. Untuk pasangan yang menyukai kesederhanaan.',
        colorPrimary: '#2d2d2d',
        colorSecondary: '#6b6b6b',
        colorAccent: '#c9a96e',
        colorBg: '#ffffff',
        colorText: '#1a1a1a',
        fontDisplay: "'Playfair Display', serif",
        fontBody: "'Inter', sans-serif",
        isPremium: false,
    },
    {
        id: 'javanese-royal',
        name: 'Javanese Royal',
        category: 'Pernikahan',
        description: 'Perpaduan motif batik dan aksen emas tradisional. Menampilkan keindahan budaya Jawa yang megah.',
        colorPrimary: '#8B6914',
        colorSecondary: '#DAA520',
        colorAccent: '#8B0000',
        colorBg: '#FFF8E7',
        colorText: '#2d2518',
        fontDisplay: "'Playfair Display', serif",
        fontBody: "'Inter', sans-serif",
        isPremium: true,
    },
    {
        id: 'dreamy-pastel',
        name: 'Dreamy Pastel',
        category: 'Pernikahan',
        description: 'Nuansa pastel watercolor yang lembut dan dreamy. Cocok untuk pernikahan yang romantis dan feminine.',
        colorPrimary: '#b48ec5',
        colorSecondary: '#f0b5c8',
        colorAccent: '#87CEEB',
        colorBg: '#fdf5ff',
        colorText: '#3d2d4d',
        fontDisplay: "'Playfair Display', serif",
        fontBody: "'Inter', sans-serif",
        isPremium: true,
    },
];

export function getTemplateById(id: string): Template | undefined {
    return templates.find((t) => t.id === id);
}
