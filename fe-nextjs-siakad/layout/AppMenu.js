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

    // =========================
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
                icon: "pi pi-fw pi-database",
                items: [
                    {
                        label: "Manajemen Data Sekolah",
                        icon: "pi pi-fw pi-info-circle",
                        items: [
                            { label: "Master Agama", icon: "pi pi-user-plus", to: "/master/agama" },
                            { label: "Master Kelas", icon: "pi pi-fw pi-th-large", to: "/master/m.kelas" },
                            { label: "Master Mapel", icon: "pi pi-fw pi-bookmark", to: "/master/mapel" },
                            { label: "Master Hari", icon: "pi pi-fw pi-calendar", to: "/master/hari" },
                            { label: "Master Jadwal", icon: "pi pi-fw pi-calendar-times", to: "/master/jadwal" },
                            { label: "Master Jurusan", icon: "pi pi-fw pi-briefcase", to: "/master/jurusan" },
                            { label: "Master Gedung", icon: "pi pi-fw pi-building", to: "/master/gedung" },
                            { label: "Master Tingkatan", icon: "pi pi-fw pi-list", to: "/master/tingkatan" },
                            { label: "Master Ruang", icon: "pi pi-fw pi-th-large", to: "/master/ruang" },
                            { label: "Master Tahun Ajaran", icon: "pi pi-fw pi-calendar-plus", to: "/master/tahun_ajaran" },
                            { label: "Master Jam Pelajaran", icon: "pi pi-user-plus", to: "/master/jam_pelajaran" },
                            { label: "Master Jabatan", icon: "pi pi-user-plus", to: "/master/jabatan" },
                            { label: "Master KKM", icon: "pi pi-fw pi-file", to: "/master/kkm" },
                            { label: "Master Predikat", icon: "pi pi-fw pi-file", to: "/master/predikat" },
                            { label: "Master Kategori Siswa", icon: "pi pi-fw pi-tags", to: "/master/kategori-siswa" },
                            { label: "Master Komponen Biaya", icon: "pi pi-fw pi-tags", to: "/master/komponen-biaya" },
                            { label: "Master Tarif Biaya", icon: "pi pi-fw pi-tags", to: "/master/tarif-biaya" },
                            { label: "Tagihan Siswa", icon: "pi pi-fw pi-money-bill", to: "/master/tagihan" },
                            { label: "Master Pelanggaran", icon: "pi pi-fw pi-file", to: "/master/pelanggaran" },
                        ]
                    },
                    {
                        label: "Manajemen Siswa & User",
                        icon: "pi pi-fw pi-users",
                        items: [
                            { label: "Manajemen Siswa", icon: "pi pi-fw pi-users", to: "/master/siswa" },
                            { label: "Transaksi Siswa", icon: "pi pi-fw pi-money-bill", to: "/master/transaksi-siswa" },
                            { label: "Transaksi Kenaikan Kelas", icon: "pi pi-fw pi-money-bill", to: "/master/transaksi-siswa-naik" },
                            { label: "Transaksi Nilai", icon: "pi pi-fw pi-money-bill", to: "/master/transaksi_nilai" },
                            { label: "User", icon: "pi pi-fw pi-user", to: "/superadmin/menu/users" },
                            { label: "pembayaran Siswa", icon: "pi pi-fw pi-money-bill", to: "/master/pembayaran" }
                        ]
                    },
                    {
                        label: "Manajemen Guru",
                        icon: "pi pi-fw pi-users",
                        items: [    
                            { label: "Guru", icon: "pi pi-fw pi-users", to: "/master/guru" },
                            { label: "Transaksi Wali Kelas", icon: "pi pi-fw pi-user-edit", to: "/master/transaksi-wakel" },
                            { label: "Absensi Guru", icon: "pi pi-fw pi-user-edit", to: "/master/absensi-guru" }
                        ]
                    },
                    {
                        label: "Manajemen Absensi",
                        icon: "pi pi-fw pi-check-square",
                        items: [
                            // INI MENU YANG BARU DITAMBAHKAN SESUAI FOLDER TUTASM KAMU
                            { label: "Input Absensi (TU)", icon: "pi pi-fw pi-pencil", to: "/master/tutasm/absensi" },
                            { label: "Input Absensi (BPBK)", icon: "pi pi-fw pi-pencil", to: "/master/bpbkm" },
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
                items: [{ label: "Beranda", icon: "pi pi-fw pi-home", to: "/kurikulum/dashboard" }],
            },
            {
                label: "Akademik",
                items: [
                        { label: "Pengaturan Jadwal Pelajaran", icon: "pi pi-fw pi-calendar", to: "/kurikulum/menu/jadwal" },
                        { label: "Ujian", icon: "pi pi-fw pi-pencil", to: "/kurikulum/menu/ujian" },
                        { label: "Cetak Rapor", icon: "pi pi-fw pi-file", to: "/kurikulum/menu/rapor" },
                        { label: "Perencanaan Kegiatan Belajar", icon: "pi pi-fw pi-book", to: "/kurikulum/menu/rencana" },
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
                items: [{ label: "Beranda", icon: "pi pi-fw pi-home", to: "/kesiswaan/dashboard" }],
            },
            {
                label: "Data Siswa",
                items: [
                        { label: "Manajemen Data Siswa", icon: "pi pi-fw pi-users", to: "/kesiswaan/menu/data-siswa" },
                        { label: "Kenaikan Kelas", icon: "pi pi-fw pi-arrow-up", to: "/kesiswaan/menu/kenaikan-kelas" },
                        { label: "Transaksi Siswa", icon: "pi pi-fw pi-money-bill", to: "/kesiswaan/menu/transaksi-siswa" },
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
                items: [{ label: "Beranda", icon: "pi pi-fw pi-home", to: "/keuangan/dashboard" }],
            },
            {
                label: "Keuangan",
                items: [
                        { label: "Manajemen Keuangan", icon: "pi pi-fw pi-wallet", to: "/keuangan/menu/manajemen" },
                        { label: "Laporan Keuangan", icon: "pi pi-fw pi-file", to: "/keuangan/menu/laporan" },
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
                items: [{ label: "Beranda", icon: "pi pi-fw pi-home", to: "/tutasm/dashboard" }],
            },
            {
                label: "Kehadiran",
                items: [
                        { label: "Absensi Siswa", icon: "pi pi-fw pi-save", to: "/tutasm/absensi" },
                        { label: "Absensi Kelas", icon: "pi pi-fw pi-users", to: "/tutasm/jadwal" },
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
                items: [{ label: "Beranda", icon: "pi pi-fw pi-home", to: "/bpbkm/dashboard" }],
            },
            {
                label: "Bimbingan Konseling",
                items: [
                        { label: "Absensi Siswa", icon: "pi pi-fw pi-file-edit", to: "/bpbkm/menu/absensi" },
                      
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
                items: [{ label: "Beranda", icon: "pi pi-fw pi-home", to: "/adminweb/dashboard" }],
            },
            {
                label: "Pengelolaan Website",
                items: [
                        { label: "Website Sekolah", icon: "pi pi-fw pi-globe", to: "/adminweb/website" },
                        { label: "Media Sosial", icon: "pi pi-fw pi-share-alt", to: "/adminweb/sosial" },
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
                items: [{ label: "Beranda", icon: "pi pi-fw pi-home", to: "/guru/dashboard" }],
            },
            {
                label: "Kehadiran & Mengajar",
                items: [
                        { label: "Absensi Guru", icon: "pi pi-fw pi-user", to: "/guru/menu/absensi" },
                        { label: "Agenda Mengajar", icon: "pi pi-fw pi-calendar", to: "/guru/menu/agenda" },
                ],
            },
            {
                label: "Penilaian",
                items: [{ label: "Input Nilai", icon: "pi pi-fw pi-pencil", to: "/guru/menu/nilai" }],
            },
        ];
    }

    // =========================
    // 9. SISWA
    // =========================
    else if (userRole === "SISWA") {
        model = [
            {
                label: "Dashboard Siswa",
                items: [{ label: "Beranda", icon: "pi pi-fw pi-home", to: "/siswa/dashboard" }],
            },
            {
                label: "Akademik",
                items: [
                        { label: "Absensi Siswa", icon: "pi pi-fw pi-user-edit", to: "/siswa/menu/absensi" },
                        { label: "Nilai & Rapor", icon: "pi pi-fw pi-book", to: "/siswa/menu/nilai" },
                        { label: "Informasi Sekolah", icon: "pi pi-fw pi-info-circle", to: "/siswa/menu/informasi" },
                ],
            },
            {
                label: "Komunikasi",
                items: [
                        { label: "Rumah - Sekolah", icon: "pi pi-fw pi-comments", to: "/siswa/komunikasi/rumah-sekolah" },
                        { label: "Guru/Karyawan", icon: "pi pi-fw pi-users", to: "/siswa/komunikasi/guru" },
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
