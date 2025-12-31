"use client";
import React, { useContext, useState, useEffect } from "react";
import AppMenuitem from "./AppMenuitem";
import { LayoutContext } from "./context/layoutcontext";
import { MenuProvider } from "./context/menucontext";

const AppMenu = () => {
    const { layoutConfig } = useContext(LayoutContext);
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const roleFromLocalStorage = localStorage.getItem("ROLE"); // <- pakai "ROLE"
            console.log("ROLE DI LOCALSTORAGE:", roleFromLocalStorage);
            setUserRole(roleFromLocalStorage);
        }
    }, []);

    if (!userRole) return null;

    let model = []; 

// 1. SUPER ADMIN SEKOLAH
// =========================
if (userRole === "SUPER_ADMIN") {
    model = [
        {
            label: "Dashboard",
            items: [
                { label: "Dashboard Utama", icon: "pi pi-fw pi-home", to: "/superadmin/dashboard" }
            ]
        },
        {
            label: "Manajemen Sekolah",
            icon: "pi pi-fw pi-home",
            items: [
                {
                    label: "Manajemen Data Sekolah",
                    icon: "pi pi-fw pi-database",
                    items: [
                        { label: "Master Agama", icon: "pi pi-fw pi-heart", to: "/master/agama" },
                        { label: "Master Kelas", icon: "pi pi-fw pi-th-large", to: "/master/m.kelas" },
                        { label: "Master Mapel", icon: "pi pi-fw pi-book", to: "/master/mapel" },
                        { label: "Master Hari", icon: "pi pi-fw pi-calendar", to: "/master/hari" },
                        { label: "Master Jadwal", icon: "pi pi-fw pi-clock", to: "/master/jadwal" },
                        { label: "Master Jurusan", icon: "pi pi-fw pi-briefcase", to: "/master/jurusan" },
                        { label: "Master Gedung", icon: "pi pi-fw pi-building", to: "/master/gedung" },
                        { label: "Master Tingkatan", icon: "pi pi-fw pi-align-left", to: "/master/tingkatan" },
                        { label: "Master Ruang", icon: "pi pi-fw pi-map", to: "/master/ruang" },
                        { label: "Master Tahun Ajaran", icon: "pi pi-fw pi-calendar-plus", to: "/master/tahun_ajaran" },
                        { label: "Master Jam Pelajaran", icon: "pi pi-fw pi-list", to: "/master/jam_pelajaran" },
                        { label: "Master Jabatan", icon: "pi pi-fw pi-id-card", to: "/master/jabatan" },
                        { label: "Master KKM", icon: "pi pi-fw pi-chart-bar", to: "/master/kkm" },
                        { label: "Master Predikat", icon: "pi pi-fw pi-star", to: "/master/predikat" },
                        { label: "Master Kelompok Mapel", icon: "pi pi-fw pi-copy", to: "/master/kelompok_mapel" },
                        { label: "Master Pelanggaran", icon: "pi pi-fw pi-exclamation-triangle", to: "/master/pelanggaran" },
                        { label: "Master Informasi Sekolah", icon: "pi pi-fw pi-info-circle", to: "/master/informasi_sekolah" }
                    ]
                },
                {
                    label: "Manajemen Siswa & User",
                    icon: "pi pi-fw pi-users",
                    items: [
                        { label: "Manajemen Siswa", icon: "pi pi-fw pi-user", to: "/master/siswa" },
                        { label: "Transaksi Siswa", icon: "pi pi-fw pi-sync", to: "/master/transaksi-siswa" },
                        { label: "Kenaikan Kelas", icon: "pi pi-fw pi-sort-amount-up", to: "/master/transaksi-siswa-naik" },
                        { label: "Transaksi Nilai", icon: "pi pi-fw pi-file-edit", to: "/master/transaksi_nilai" },
                        { label: "User Management", icon: "pi pi-fw pi-user-plus", to: "/superadmin/menu/users" },
                        { label: "Pembayaran Siswa", icon: "pi pi-fw pi-money-bill", to: "/master/pembayaran" },
                        { label: "Gabung Mapel", icon: "pi pi-fw pi-clone", to: "/master/gabungan_mapel" }
                    ]
                },
                {
                    label: "Manajemen Guru",
                    icon: "pi pi-fw pi-briefcase",
                    items: [    
                        { label: "Data Guru", icon: "pi pi-fw pi-users", to: "/master/guru" },
                        { label: "Wali Kelas", icon: "pi pi-fw pi-user-edit", to: "/master/transaksi-wakel" },
                        { label: "Absensi Guru", icon: "pi pi-fw pi-check-circle", to: "/master/absensi-guru" }
                    ]
                },
                {
                    label: "Manajemen Absensi",
                    icon: "pi pi-fw pi-check-square",
                    items: [
                        { label: "Input Absensi (TU)", icon: "pi pi-fw pi-user-edit", to: "/master/tutasm/absensi" },
                        { label: "Input Absensi (BPBK)", icon: "pi pi-fw pi-shield", to: "/master/bpbkm" }
                    ]
                },
                {
                    label: "Manajemen Rapor",
                    icon: "pi pi-fw pi-file-pdf",
                    items: [
                        { label: "Mapping Rapor", icon: "pi pi-fw pi-sitemap", to: "/master/mapping_rapor" },
                        { label: "Data Tanggal", icon: "pi pi-fw pi-calendar", to: "/master/tanggal_rapor" },
                        { label: "Status Penilaian", icon: "pi pi-fw pi-eye", to: "/master/status_nilai" },
                        { label: "Kehadiran Rapor", icon: "pi pi-fw pi-check-circle", to: "/master/kehadiran_rapor" },
                        { label: "Cetak Buku Induk", icon: "pi pi-fw pi-print", to: "/master/buku_induk" }
                    ]
                }
            ]
        }
    ];
}
    // =========================
    // 2. KURIKULUM
    // =========================
   else if (userRole === "KURIKULUM") {
    model = [
        {
            label: "Dashboard Kurikulum",
            icon: "pi pi-fw pi-home",
            items: [
                { label: "Beranda", icon: "pi pi-fw pi-home", to: "/kurikulum/dashboard" }
            ],
        },
        {
            label: "Manajemen Akademik",
            icon: "pi pi-fw pi-book",
            items: [
                {
                    label: "Perencanaan & Penjadwalan",
                    icon: "pi pi-fw pi-calendar",
                    items: [
                        { label: "Pengaturan Jadwal Pelajaran", icon: "pi pi-fw pi-calendar", to: "/kurikulum/menu/jadwal" },
                        { label: "Perencanaan Kegiatan Belajar", icon: "pi pi-fw pi-book", to: "/kurikulum/menu/rencana" },
                    ],
                },
                {
                    label: "Penilaian & Laporan",
                    icon: "pi pi-fw pi-file",
                    items: [
                        { label: "Penilaian", icon: "pi pi-fw pi-pencil", to: "/kurikulum/menu/penilaian" },
                        { label: "Cetak / Penulisan Rapor", icon: "pi pi-fw pi-file", to: "/kurikulum/menu/rapor" },
                    ],
                },
                {
                    label: "Evaluasi & Informasi",
                    icon: "pi pi-fw pi-chart-line",
                    items: [
                        { label: "Evaluasi Diri / Review", icon: "pi pi-fw pi-chart-line", to: "/kurikulum/menu/evaluasi" },
                        { label: "Informasi Akademik", icon: "pi pi-fw pi-info-circle", to: "/kurikulum/menu/informasi" },
                    ],
                },
            ],
        },
    ];
}


    // =========================
    // 3. KESISWAAN
    // =========================
   else if (userRole === "KESISWAAN") {
    model = [
        {
            label: "Dashboard Kesiswaan",
            icon: "pi pi-fw pi-home",
            items: [
                { label: "Beranda", icon: "pi pi-fw pi-home", to: "/kesiswaan/dashboard" }
            ],
        },
        {
            label: "Manajemen Siswa",
            icon: "pi pi-fw pi-users",
            items: [
                {
                    label: "Data & Administrasi",
                    icon: "pi pi-fw pi-database",
                    items: [
                        { label: "Manajemen Data Siswa", icon: "pi pi-fw pi-users", to: "/kesiswaan/menu/data-siswa" },
                        { label: "Profil Siswa", icon: "pi pi-fw pi-id-card", to: "/kesiswaan/menu/profil-siswa" },
                        { label: "Kehadiran Siswa", icon: "pi pi-fw pi-calendar", to: "/kesiswaan/menu/kehadiran" },
                        { label: "Penanganan Administrasi", icon: "pi pi-fw pi-folder", to: "/kesiswaan/menu/administrasi" },
                    ],
                },
                {
                    label: "Akademik",
                    icon: "pi pi-fw pi-book",
                    items: [
                        { label: "Kenaikan Kelas", icon: "pi pi-fw pi-arrow-up", to: "/kesiswaan/menu/kenaikan-kelas" },
                        { label: "Transaksi Siswa", icon: "pi pi-fw pi-money-bill", to: "/kesiswaan/menu/transaksi-siswa" },
                    ],
                },
            ],
        },
        {
            label: "Komunikasi",
            icon: "pi pi-fw pi-comments",
            items: [
                {
                    label: "Rumah – Sekolah",
                    icon: "pi pi-fw pi-comments",
                    items: [
                        { label: "Komunikasi Rumah - Sekolah", icon: "pi pi-fw pi-comments", to: "/kesiswaan/menu/komunikasi" },
                    ],
                },
            ],
        },
    ];
}

    // =========================
    // 4. KEUANGAN
    // =========================
   else if (userRole === "KEUANGAN") {
    model = [
        {
            label: "Dashboard Keuangan",
            icon: "pi pi-fw pi-home",
            items: [
                { label: "Beranda", icon: "pi pi-fw pi-home", to: "/keuangan/dashboard" }
            ],
        },
        {
            label: "Manajemen Keuangan",
            icon: "pi pi-fw pi-wallet",
            items: [
                {
                    label: "Transaksi & Pembayaran",
                    icon: "pi pi-fw pi-money-bill",
                    items: [
                        { label: "Manajemen Keuangan", icon: "pi pi-fw pi-wallet", to: "/keuangan/menu/manajemen" },
                        { label: "Pembayaran SPP", icon: "pi pi-fw pi-credit-card", to: "/keuangan/menu/spp" },
                        { label: "Jenis Pembayaran/Biaya", icon: "pi pi-fw pi-list", to: "/keuangan/menu/jenis-biaya" },
                    ],
                },
                {
                    label: "Laporan & Rekap",
                    icon: "pi pi-fw pi-file",
                    items: [
                        { label: "Laporan Keuangan", icon: "pi pi-fw pi-file", to: "/keuangan/menu/laporan" },
                        { label: "Rekap Pembayaran Siswa", icon: "pi pi-fw pi-chart-bar", to: "/keuangan/menu/rekap" },
                    ],
                },
            ],
        },
    ];
}


    // =========================
    // 5. TU/TAS
    // =========================
   else if (userRole === "TU" || userRole === "TU_TASM") {
    model = [
        {
            label: "Dashboard TU/TAS",
            icon: "pi pi-fw pi-home",
            items: [
                { label: "Beranda", icon: "pi pi-fw pi-home", to: "/tutasm/dashboard" }
            ],
        },
        {
            label: "Administrasi Akademik",
            icon: "pi pi-fw pi-briefcase",
            items: [
                {
                    label: "Kehadiran",
                    icon: "pi pi-fw pi-calendar",
                    items: [
                        { label: "Absensi Siswa", icon: "pi pi-fw pi-save", to: "/tutasm/absensi" },
                        { label: "Absensi Kelas", icon: "pi pi-fw pi-users", to: "/tutasm/jadwal" },
                    ],
                },
                {
                    label: "Agenda & Guru",
                    icon: "pi pi-fw pi-user",
                    items: [
                        { label: "Agenda Guru", icon: "pi pi-fw pi-calendar-plus", to: "/tutasm/agenda-guru" },
                    ],
                },
            ],
        },
        {
            label: "Administrasi Sekolah",
            icon: "pi pi-fw pi-database",
            items: [
                {
                    label: "Data & Aset",
                    icon: "pi pi-fw pi-folder",
                    items: [
                        { label: "Pengelolaan Aset", icon: "pi pi-fw pi-building", to: "/tutasm/aset" },
                        { label: "Data Administrasi Sekolah", icon: "pi pi-fw pi-file", to: "/tutasm/administrasi-sekolah" },
                    ],
                },
            ],
        },
    ];
}


    // =========================
    // 6. BP/BK
    // =========================
   else if (userRole === "BP" || userRole === "BP_BKM") {
    model = [
        {
            label: "Dashboard BK",
            icon: "pi pi-fw pi-home",
            items: [
                { label: "Beranda", icon: "pi pi-fw pi-home", to: "/bpbkm/dashboard" }
            ],
        },
        {
            label: "Bimbingan Konseling",
            icon: "pi pi-fw pi-users",
            items: [
                {
                    label: "Data Siswa",
                    icon: "pi pi-fw pi-id-card",
                    items: [
                        { label: "Profil Siswa", icon: "pi pi-fw pi-id-card", to: "/bpbkm/menu/profil-siswa" },
                        { label: "Kehadiran Siswa", icon: "pi pi-fw pi-calendar", to: "/bpbkm/menu/absensi" },
                    ],
                },
                {
                    label: "Layanan Konseling",
                    icon: "pi pi-fw pi-comments",
                    items: [
                        { label: "Catatan BK", icon: "pi pi-fw pi-file-edit", to: "/bpbkm/menu/catatan-bk" },
                        { label: "Evaluasi Perilaku Siswa", icon: "pi pi-fw pi-chart-line", to: "/bpbkm/menu/evaluasi-perilaku" },
                        { label: "Kebutuhan Pendidikan Khusus", icon: "pi pi-fw pi-heart", to: "/bpbkm/menu/kebutuhan-khusus" },
                    ],
                },
            ],
        },
    ];
}


    // =========================
    // 7. ADMIN WEB SEKOLAH
    // =========================
   else if (userRole === "ADMIN_WEB") {
    model = [
        {
            label: "Dashboard Admin Web",
            icon: "pi pi-fw pi-home",
            items: [
                { label: "Beranda", icon: "pi pi-fw pi-home", to: "/adminweb/dashboard" }
            ],
        },
        {
            label: "Pengelolaan Konten",
            icon: "pi pi-fw pi-globe",
            items: [
                {
                    label: "Informasi Publik",
                    icon: "pi pi-fw pi-info-circle",
                    items: [
                        { label: "Informasi Sekolah", icon: "pi pi-fw pi-info-circle", to: "/adminweb/informasi" },
                        { label: "Pengumuman & Konten Publik", icon: "pi pi-fw pi-bullhorn", to: "/adminweb/pengumuman" },
                    ],
                },
                {
                    label: "Website & Media",
                    icon: "pi pi-fw pi-share-alt",
                    items: [
                        { label: "Website Sekolah", icon: "pi pi-fw pi-globe", to: "/adminweb/website" },
                        { label: "Media Sosial Sekolah", icon: "pi pi-fw pi-share-alt", to: "/adminweb/sosial" },
                    ],
                },
            ],
        },
    ];
}


    // =========================
    // 8. GURU
    // =========================
   else if (userRole === "GURU") {
    model = [
        {
            label: "Dashboard Guru",
            icon: "pi pi-fw pi-home",
            items: [
                { label: "Beranda", icon: "pi pi-fw pi-home", to: "/guru/dashboard" },
                { label: "Profil", icon: "pi pi-fw pi-user", to: "/guru/menu/profile" },
            ],
        },
        {
            label: "Manajemen Mengajar",
            icon: "pi pi-fw pi-briefcase",
            items: [
                {
                    label: "Aktivitas Mengajar",
                    icon: "pi pi-fw pi-database",
                    items: [
                        { label: "Absensi Guru", icon: "pi pi-fw pi-user", to: "/guru/menu/absensi" },
                        { label: "Kehadiran Rapor ", icon: "pi pi-fw pi-users", to: "/guru/menu/kehadiran-rapor" },
                        { label: "Agenda Mengajar", icon: "pi pi-fw pi-calendar", to: "/guru/menu/agenda" },
                        { label: "Input Nilai", icon: "pi pi-fw pi-pencil", to: "/guru/menu/nilai" },
                        { label: "Cetak Rapor", icon: "pi pi-fw pi-file", to: "/guru/menu/cetak-rapot" },
                        { label: "Informasi Sekolah", icon: "pi pi-fw pi-info-circle", to: "/guru/menu/informasi" },
                    ],
                },
            ],
        },
        {
            label: "Komunikasi",
            icon: "pi pi-fw pi-comments",
            items: [
                {
                    label: "Komunikasi Guru",
                    icon: "pi pi-fw pi-comments",
                    items: [
                        { label: "Komunikasi Antar Guru", icon: "pi pi-fw pi-comments", to: "/guru/menu/komunikasi-guru" },
                    ],
                },
            ],
        },
    ];
}



   // =========================
// 9. SISWA (Dropdown)
// =========================
else if (userRole === "SISWA") {
    model = [
        {
            label: "Dashboard Siswa",
            icon: "pi pi-fw pi-home",
            items: [
                { label: "Beranda", icon: "pi pi-fw pi-home", to: "/siswa/dashboard" }
            ],
        },
        {
            label: "Manajemen Akademik",
            icon: "pi pi-fw pi-book",
            items: [
                {
                    label: "Data Akademik",
                    icon: "pi pi-fw pi-database",
                    items: [
                        { label: "Profil Saya", icon: "pi pi-fw pi-id-card", to: "/siswa/menu/profile" },
                        { label: "Nilai & Rapor", icon: "pi pi-fw pi-book", to: "/siswa/menu/raport" },
                        { label: "Informasi Sekolah", icon: "pi pi-fw pi-info-circle", to: "/siswa/menu/informasi" },
                    ],
                },
            ],
        },
        {
            label: "Komunikasi",
            icon: "pi pi-fw pi-comments",
            items: [
                {
                    label: "Komunikasi Siswa",
                    icon: "pi pi-fw pi-comments",
                    items: [
                        { label: "Rumah - Sekolah", icon: "pi pi-fw pi-comments", to: "/siswa/komunikasi/rumah-sekolah" },
                        { label: "Guru / Karyawan", icon: "pi pi-fw pi-users", to: "/siswa/komunikasi/guru" },
                    ],
                },
            ],
        },
    ];
}


    return (
        <MenuProvider>
            <ul className="layout-menu">
                {model.map((item, i) => (
                    <AppMenuitem item={item} root={true} index={i} key={i} />
                ))}
            </ul>
        </MenuProvider>
    );
};

export default AppMenu;
