import { Metadata } from 'next';
import Layout from '../../layout/layout';

interface AppLayoutProps {
    children: React.ReactNode;
}

export const metadata: Metadata = {
    // Sesuaikan dengan domain sekolah, misal: siakad.sman1jakarta.sch.id
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://siakad.sekolahanda.sch.id"),
    title: {
        template: '%s | SIAKAD SMK Negeri 1 Kota',
        default: 'Sistem Informasi Akademik (SIAKAD) - SMA 1 MADIUN',
    },
    description: 'Portal Akademik Siswa dan Guru untuk pengelolaan nilai raport, presensi, dan jadwal pelajaran.',
    robots: { index: false, follow: false }, 
    viewport: { initialScale: 1, width: 'device-width' },
    openGraph: {
        type: 'website',
        title: 'SIAKAD SMK/SMA Digital',
        url: 'https://siakad.sekolahanda.sch.id',
        description: 'Pantau perkembangan akademik siswa, absensi, dan jadwal sekolah secara real-time.',
        images: ['/assets/images/logo-sekolah-banner.png'], 
        siteName: 'SIAKAD Sekolah'
    },
    icons: {
        icon: '/favicon.ico', // Gunakan logo Tut Wuri Handayani atau Logo Sekolah
        apple: '/apple-icon.png',
    }
};

export default function AppLayout({ children }: AppLayoutProps) {
    return (
        <Layout>
            {children}
        </Layout>
    );
}