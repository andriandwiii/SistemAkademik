'use client';

import { Chart } from 'primereact/chart';
import React, { useContext, useEffect, useState, useRef } from 'react';
import { LayoutContext } from '../../../../layout/context/layoutcontext';
import { Skeleton } from 'primereact/skeleton';
import { Button } from 'primereact/button';
import CustomDataTable from '../../../components/DataTable';
import ToastNotifier from '../../../components/ToastNotifier';

const DashboardSiswa = () => {
    const { layoutConfig } = useContext(LayoutContext);
    const toastRef = useRef(null);
    
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState(null);
    const [siswaData, setSiswaData] = useState(null);
    const [jadwalHariIni, setJadwalHariIni] = useState([]);
    const [allJadwal, setAllJadwal] = useState([]);
    
    // State baru untuk data absensi real
    const [attendanceStats, setAttendanceStats] = useState([0, 0, 0, 0]); // [Hadir, Sakit, Izin, Alpa]

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const getToken = () => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('token');
        }
        return null;
    };

    const getHariIndonesia = () => {
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        return days[new Date().getDay()];
    };

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const token = getToken();
            
            if (!token) {
                toastRef.current?.showToast('01', 'Sesi login tidak ditemukan. Silakan login kembali.');
                setTimeout(() => {
                    if (typeof window !== 'undefined') {
                        window.location.href = '/auth/login';
                    }
                }, 2000);
                return;
            }

            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };

            const baseURL = process.env.NEXT_PUBLIC_API_URL;

            // 1. Fetch Profile
            const resProfile = await fetch(`${baseURL}/auth/profile`, { headers });
            const profileData = await resProfile.json();
            
            if (profileData.status !== "00") throw new Error(profileData.message || 'Gagal mengambil profil');

            const sisData = profileData.user.siswa;
            setUserProfile(profileData.user);
            setSiswaData(sisData);

            // 2. Fetch Rekap Absensi (REAL DATA)
            // Menggunakan route: /api/tu-absensi/rekap/:nis
            try {
                const resAbsen = await fetch(`${baseURL}/tu-absensi/rekap/${sisData.NIS}`, { headers });
                const absenJson = await resAbsen.json();
                if (absenJson.status === "00") {
                    const r = absenJson.data;
                    setAttendanceStats([r.HADIR, r.SAKIT, r.IZIN, r.ALPA]);
                }
            } catch (err) {
                console.error("Gagal mengambil data absensi:", err);
            }

            // 3. Fetch Jadwal
            const transaksiKelas = sisData.transaksi_siswa_kelas;
            if (transaksiKelas && transaksiKelas.length > 0) {
                const kelasId = transaksiKelas[0].KELAS_ID;
                const resJadwal = await fetch(`${baseURL}/jadwal`, { headers });
                
                if (resJadwal.ok) {
                    const dataJadwal = await resJadwal.json();
                    const allJadwalData = dataJadwal.data || [];
                    const jadwalKelas = allJadwalData.filter(j => j.kelas?.KELAS_ID === kelasId);
                    
                    setAllJadwal(jadwalKelas);
                    const hariIni = getHariIndonesia();
                    setJadwalHariIni(jadwalKelas.filter(j => j.hari?.HARI === hariIni));
                }
            }

            toastRef.current?.showToast('00', 'Data dashboard berhasil dimuat');

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            toastRef.current?.showToast('01', `Gagal memuat data: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Chart: Kehadiran (Sekarang menggunakan attendanceStats dari API)
    const attendanceData = {
        labels: ['Hadir', 'Sakit', 'Izin', 'Alpha'],
        datasets: [
            {
                data: attendanceStats, 
                backgroundColor: ['#22c55e', '#facc15', '#3b82f6', '#ef4444'],
                hoverBackgroundColor: ['#16a34a', '#eab308', '#2563eb', '#dc2626']
            }
        ]
    };

    // Chart: Nilai (Sisa dummy - bisa disesuaikan jika API nilai sudah ada)
    const nilaiData = {
        labels: jadwalHariIni.slice(0, 5).map(j => j.mata_pelajaran?.NAMA_MAPEL || '-'),
        datasets: [
            {
                label: 'Nilai Siswa',
                backgroundColor: '#3b82f6',
                data: jadwalHariIni.slice(0, 5).map(() => Math.floor(Math.random() * 20) + 75)
            }
        ]
    };

    // --- TEMPLATE & COLUMNS (Sama seperti kode Anda sebelumnya) ---
    const statusTemplate = (rowData) => {
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        const [startHour, startMin] = (rowData.jam_pelajaran?.WAKTU_MULAI || '00:00').split(':').map(Number);
        const [endHour, endMin] = (rowData.jam_pelajaran?.WAKTU_SELESAI || '00:00').split(':').map(Number);
        const startTime = startHour * 60 + startMin;
        const endTime = endHour * 60 + endMin;
        let status = 'Belum Dimulai'; let severity = 'warning';
        if (currentTime >= endTime) { status = 'Selesai'; severity = 'success'; }
        else if (currentTime >= startTime && currentTime < endTime) { status = 'Sedang Berlangsung'; severity = 'info'; }
        return <span className={`bg-${severity}-100 text-${severity}-600 font-bold px-2 py-1 border-round-sm text-xs`}>{status}</span>;
    };

    const jadwalColumns = [
        { field: 'jam_pelajaran.JP_KE', header: 'JP', body: (rowData) => `JP ${rowData.jam_pelajaran?.JP_KE || '-'}` },
        { field: 'jam_pelajaran.WAKTU_MULAI', header: 'Jam', body: (rowData) => `${rowData.jam_pelajaran?.WAKTU_MULAI} - ${rowData.jam_pelajaran?.WAKTU_SELESAI}` },
        { field: 'mata_pelajaran.NAMA_MAPEL', header: 'Mata Pelajaran', body: (rowData) => rowData.mata_pelajaran?.NAMA_MAPEL || '-' },
        { field: 'guru.NAMA', header: 'Guru', body: (rowData) => rowData.guru?.NAMA || '-' },
        { header: 'Status', body: statusTemplate }
    ];

    if (loading) {
        return (
            <div className="grid">
                <ToastNotifier ref={toastRef} />
                <div className="col-12"><Skeleton height="120px" className="mb-3" /></div>
                <div className="col-12 md:col-6"><Skeleton height="300px" /></div>
                <div className="col-12 md:col-6"><Skeleton height="300px" /></div>
            </div>
        );
    }

    const tKelas = siswaData?.transaksi_siswa_kelas?.[0];

    return (
        <div className="grid">
            <ToastNotifier ref={toastRef} />

            {/* Welcome Banner */}
            <div className="col-12">
                <div className="card mb-0" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                    <div className="flex align-items-center">
                        <div className="flex-1">
                            <h3 className="text-white mb-2">Selamat Datang, {siswaData?.NAMA || 'Siswa'}</h3>
                            <p className="text-white text-sm mb-0 opacity-80">{getHariIndonesia()}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        </div>
                        <i className="pi pi-user text-white" style={{ fontSize: '3rem', opacity: 0.3 }} />
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="col-12 lg:col-3">
                <div className="card mb-0">
                    <span className="block text-500 font-medium mb-3">Profil</span>
                    <div className="text-900 font-medium text-xl">{siswaData?.NAMA || '-'}</div>
                    <span className="text-green-500 font-medium">Kelas {tKelas?.tingkatan?.TINGKATAN}</span>
                </div>
            </div>
            <div className="col-12 lg:col-3">
                <div className="card mb-0">
                    <span className="block text-500 font-medium mb-3">NIS</span>
                    <div className="text-900 font-medium text-xl">{siswaData?.NIS || '-'}</div>
                    <span className="text-500">Nomor Induk Siswa</span>
                </div>
            </div>
            <div className="col-12 lg:col-3">
                <div className="card mb-0">
                    <span className="block text-500 font-medium mb-3">Ruang</span>
                    <div className="text-900 font-medium text-xl">{tKelas?.kelas?.NAMA_RUANG || '-'}</div>
                    <span className="text-500">Lokasi Belajar</span>
                </div>
            </div>
            <div className="col-12 lg:col-3">
                <div className="card mb-0">
                    <span className="block text-500 font-medium mb-3">Jadwal</span>
                    <div className="text-900 font-medium text-xl">{jadwalHariIni.length} Mapel</div>
                    <span className="text-500">Hari {getHariIndonesia()}</span>
                </div>
            </div>

            {/* Charts Section */}
            <div className="col-12 md:col-5">
                <div className="card">
                    <h5>Kehadiran Siswa </h5>
                    <div style={{ height: '300px' }}>
                        <Chart type="doughnut" data={attendanceData} options={{ maintainAspectRatio: false }} />
                    </div>
                    <small className="text-500 mt-3 block text-center">Rekapitulasi total kehadiran</small>
                </div>
            </div>

            <div className="col-12 md:col-7">
                <div className="card">
                    <h5>Nilai Rata-rata Mata Pelajaran</h5>
                    <div style={{ height: '300px' }}>
                        <Chart type="bar" data={nilaiData} options={{ maintainAspectRatio: false }} />
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <div className="col-12">
                <div className="card">
                    <h5>Jadwal Pelajaran Hari Ini</h5>
                    <CustomDataTable data={jadwalHariIni} columns={jadwalColumns} paginator rows={5} />
                </div>
            </div>
        </div>
    );
};

export default DashboardSiswa;