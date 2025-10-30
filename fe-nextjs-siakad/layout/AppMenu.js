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
                            { label: "Master Wilayah", icon: "pi pi-fw pi-building", to: "/master/wilayah" },
                            { label: "Master Aset Sekolah", icon: "pi pi-tags", to: "/master/aset_sekolah" },
                            { label: "Master Kelas", icon: "pi pi-fw pi-th-large", to: "/master/m.kelas" },
                            { label: "Master Kurikulum", icon: "pi pi-fw pi-book", to: "/master/kurikulum" },
                            { label: "Master Mapel", icon: "pi pi-fw pi-bookmark", to: "/master/mapel" },
                            { label: "Master Mapel Kelas", icon: "pi pi-fw pi-bookmark", to: "/master/mapel-kelas" },
                            { label: "Master Hari", icon: "pi pi-fw pi-calendar", to: "/master/hari" },
                            { label: "Master Jadwal", icon: "pi pi-fw pi-calendar-times", to: "/master/jadwal" },
                            { label: "Master Jurusan", icon: "pi pi-fw pi-briefcase", to: "/master/jurusan" },
                            { label: "Master Gedung", icon: "pi pi-fw pi-building", to: "/master/gedung" },
                            { label: "Master Tingkatan", icon: "pi pi-fw pi-list", to: "/master/tingkatan" },
                            { label: "Master Ruang", icon: "pi pi-fw pi-th-large", to: "/master/ruang" },
                            { label: "Master Tahun Ajaran", icon: "pi pi-fw pi-calendar-plus", to: "/master/tahun_ajaran" },
                            
                            { label: "Master Jabatan", icon: "pi pi-user-plus", to: "/master/jabatan" },
                            

                        ]
                    },
                    {
                        label: "Manajemen Siswa & User",
                        icon: "pi pi-fw pi-users",
                        items: [
                            { label: "Manajemen Siswa", icon: "pi pi-fw pi-users", to: "/master/siswa" },
                            { label: "Informasi Sekolah", icon: "pi pi-fw pi-info-circle", to: "/master/informasi_sekolah" },
                            { label: "Transaksi Siswa", icon: "pi pi-fw pi-money-bill", to: "/master/transaksi-siswa" },
                            { label: "User", icon: "pi pi-fw pi-user", to: "/superadmin/menu/users" }
                        ]
                    },
                    {
                        label: "Manajemen Guru",
                        icon: "pi pi-fw pi-users",
                        items: [
                            { label: "Guru", icon: "pi pi-fw pi-users", to: "/master/guru" },
                            { label: "Transaksi Wali Kelas", icon: "pi pi-fw pi-user-edit", to: "/master/transaksi-wakel" }
                        ]
                    },
                    {
                        label: "Manajemen Absensi",
                        icon: "pi pi-fw pi-check-square",
                        items: [
                            { label: "Absensi Siswa", icon: "pi pi-fw pi-check-square", to: "/superadmin/menu/absensi-siswa" },
                            { label: "Absensi Guru", icon: "pi pi-fw pi-user", to: "/superadmin/menu/absensi-guru" }
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
                        { label: "Profil Siswa", icon: "pi pi-fw pi-id-card", to: "/kesiswaan/profil-siswa" },
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
                        { label: "Absensi Siswa", icon: "pi pi-fw pi-user-check", to: "/tu/absensi-siswa" },
                        { label: "Absensi Kelas", icon: "pi pi-fw pi-users", to: "/tu/absensi-kelas" },
                        { label: "Agenda Guru", icon: "pi pi-fw pi-calendar", to: "/tu/agenda-guru" },
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
                        { label: "Absensi Siswa", icon: "pi pi-fw pi-user-check", to: "/bpbkm/absensi" },
                        { label: "Catatan BK", icon: "pi pi-fw pi-file-edit", to: "/bpbkm/menu/catatan" },
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
                        { label: "Absensi Kelas", icon: "pi pi-fw pi-box", to: "/guru/menu/absen-kelas" },
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
