/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useContext, useRef, useEffect, useState } from 'react';
import { LayoutContext } from '@/layout/context/layoutcontext';
import { Chart } from 'primereact/chart';
import { Button } from 'primereact/button';
import CustomDataTable from '@/app/components/DataTable';
import ToastNotifier from '@/app/components/ToastNotifier';
import { Skeleton } from 'primereact/skeleton';
import DialogSiswaAgenda from '@/app/(main)/guru/dashboard/components/DialogSiswaAgenda';

const DashboardGuru = () => {
    const { layoutConfig } = useContext(LayoutContext);
    const toastRef = useRef(null);

    // State untuk data dari BE
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState(null);
    const [kelasWakel, setKelasWakel] = useState([]);
    const [jadwalGuru, setJadwalGuru] = useState([]);
    const [jadwalHariIni, setJadwalHariIni] = useState([]);
    const [summary, setSummary] = useState({
        totalKelasDiajar: 0,
        totalSiswaDiajar: 0,
        jadwalHariIni: 0,
        mataPelajaranDiampu: '-'
    });
    
    // Dialog Siswa
    const [siswaDialogVisible, setSiswaDialogVisible] = useState(false);
    const [selectedJadwalForSiswa, setSelectedJadwalForSiswa] = useState(null);

    // Fetch data dari BE
    useEffect(() => {
        fetchDashboardData();
    }, []);

    const getToken = () => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('token');
        }
        return null;
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

            // 1. Fetch profile user untuk mendapatkan email dan data guru
            const resProfile = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
                headers
            });

            if (!resProfile.ok) {
                const errorData = await resProfile.json().catch(() => ({}));
                throw new Error(errorData.message || 'Gagal mengambil profil user');
            }

            const profileData = await resProfile.json();
            
            if (profileData.status !== "00") {
                throw new Error(profileData.message || 'Gagal mengambil profil');
            }

            setUserProfile(profileData.user);
            
            // Jika user bukan guru, tampilkan error
            if (profileData.user.role !== 'GURU') {
                throw new Error('Akses ditolak. Hanya guru yang dapat mengakses dashboard ini.');
            }

            // Ambil NIP dari data guru yang sudah di-join di profile
            const nipGuru = profileData.user.guru?.NIP;

            if (!nipGuru) {
                throw new Error('Data guru tidak lengkap. NIP tidak ditemukan.');
            }

            // 3. Fetch transaksi wali kelas
            const resWakel = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/transaksi-wakel`, {
                headers
            });
            
            if (resWakel.ok) {
                const dataWakel = await resWakel.json();
                const myKelas = dataWakel.data?.filter(t => t.guru.NIP === nipGuru) || [];
                setKelasWakel(myKelas);
            }

            // 4. Fetch jadwal
            const resJadwal = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jadwal`, {
                headers
            });
            
            if (!resJadwal.ok) {
                throw new Error('Gagal mengambil jadwal');
            }

            const dataJadwal = await resJadwal.json();
            
            // Filter jadwal untuk guru ini
            const myJadwal = dataJadwal.data?.filter(j => j.guru?.NIP === nipGuru) || [];
            setJadwalGuru(myJadwal);

            // Filter jadwal hari ini
            const hariIni = getHariIndonesia();
            const jadwalToday = myJadwal.filter(j => j.hari?.HARI === hariIni);
            setJadwalHariIni(jadwalToday);

            // 5. Hitung summary
            const uniqueKelas = new Set(myJadwal.map(j => j.kelas?.KELAS_ID).filter(Boolean));
            const uniqueMapel = new Set(myJadwal.map(j => j.mata_pelajaran?.NAMA_MAPEL).filter(Boolean));
            
            setSummary({
                totalKelasDiajar: uniqueKelas.size,
                totalSiswaDiajar: uniqueKelas.size * 30,
                jadwalHariIni: jadwalToday.length,
                mataPelajaranDiampu: Array.from(uniqueMapel).join(', ') || 'Tidak ada'
            });

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            toastRef.current?.showToast('01', `Gagal memuat data: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Helper function untuk mendapatkan hari dalam bahasa Indonesia
    const getHariIndonesia = () => {
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        return days[new Date().getDay()];
    };

    const handleViewSiswa = (jadwalData) => {
        setSelectedJadwalForSiswa(jadwalData);
        setSiswaDialogVisible(true);
    };

    // Template untuk status jadwal
    const statusTemplate = (rowData) => {
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        
        const [startHour, startMin] = (rowData.jam_pelajaran?.WAKTU_MULAI || '00:00').split(':').map(Number);
        const [endHour, endMin] = (rowData.jam_pelajaran?.WAKTU_SELESAI || '00:00').split(':').map(Number);
        
        const startTime = startHour * 60 + startMin;
        const endTime = endHour * 60 + endMin;

        let status = 'Belum Dimulai';
        let severity = 'warning';

        if (currentTime >= endTime) {
            status = 'Selesai';
            severity = 'success';
        } else if (currentTime >= startTime && currentTime < endTime) {
            status = 'Sedang Berlangsung';
            severity = 'info';
        }

        return (
            <span className={`bg-${severity}-100 text-${severity}-600 font-bold px-2 py-1 border-round-sm text-xs`}>
                {status}
            </span>
        );
    };

    // Template untuk aksi
    const actionTemplate = (rowData) => (
        <div className="flex gap-2">
            <Button 
                label="Lihat Siswa" 
                size="small" 
                icon="pi pi-users" 
                severity="info"
                onClick={() => handleViewSiswa(rowData)}
            />
            <Button 
                label="Buka Absen" 
                size="small" 
                icon="pi pi-user-plus" 
                severity="success" 
                onClick={() => {
                    toastRef.current?.showToast('00', `Membuka form absensi untuk ${rowData.kelas?.NAMA_RUANG || 'kelas'}`);
                }} 
            />
        </div>
    );

    // Kolom untuk tabel agenda
    const agendaColumns = [
        { 
            field: 'jam_pelajaran.JP_KE', 
            header: 'JP Ke',
            body: (rowData) => `JP ${rowData.jam_pelajaran?.JP_KE || '-'}`,
            style: { width: '80px' }
        },
        { 
            field: 'jam_pelajaran.WAKTU_MULAI', 
            header: 'Jam',
            body: (rowData) => `${rowData.jam_pelajaran?.WAKTU_MULAI || '00:00'} - ${rowData.jam_pelajaran?.WAKTU_SELESAI || '00:00'}`,
            style: { width: '140px' }
        },
        { 
            field: 'kelas.NAMA_RUANG', 
            header: 'Kelas',
            body: (rowData) => {
                const tingkat = rowData.tingkatan?.TINGKATAN || '';
                const jurusan = rowData.jurusan?.NAMA_JURUSAN || '';
                const ruang = rowData.kelas?.NAMA_RUANG || '';
                return `${tingkat} ${jurusan} | ${ruang}`;
            }
        },
        { 
            field: 'mata_pelajaran.NAMA_MAPEL', 
            header: 'Mata Pelajaran',
            body: (rowData) => rowData.mata_pelajaran?.NAMA_MAPEL || '-'
        },
        { 
            header: 'Status', 
            body: statusTemplate,
            style: { width: '150px' }
        },
        { 
            header: 'Aksi', 
            body: actionTemplate, 
            style: { width: '280px' } 
        },
    ];

    // Data untuk chart absensi (dummy - bisa disesuaikan dengan data real)
    const attendanceData = {
        labels: jadwalHariIni.slice(0, 5).map(j => {
            const tingkat = j.tingkatan?.TINGKATAN || '';
            const jurusan = j.jurusan?.NAMA_JURUSAN || '';
            const ruang = j.kelas?.NAMA_RUANG || '';
        return `${tingkat} ${jurusan} | ${ruang}`;
    }),
        datasets: [ 
            {
                label: 'Hadir',
                backgroundColor: '#42A5F5',
                data: jadwalHariIni.slice(0, 5).map(() => Math.floor(Math.random() * 5) + 25)
            },
            {
                label: 'Sakit',
                backgroundColor: '#FFC107',
                data: jadwalHariIni.slice(0, 5).map(() => Math.floor(Math.random() * 3))
            },
            {
                label: 'Izin',
                backgroundColor: '#66BB6A',
                data: jadwalHariIni.slice(0, 5).map(() => Math.floor(Math.random() * 2))
            },
            {
                label: 'Alpha',
                backgroundColor: '#EF5350',
                data: jadwalHariIni.slice(0, 5).map(() => Math.floor(Math.random() * 2))
            }
        ]
    };

    const barChartOptions = {
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: layoutConfig.colorScheme === 'light' ? '#495057' : '#ebedef'
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: layoutConfig.colorScheme === 'light' ? '#495057' : '#ebedef'
                },
                grid: {
                    color: layoutConfig.colorScheme === 'light' ? '#ebedef' : '#323438'
                }
            },
            y: {
                ticks: {
                    color: layoutConfig.colorScheme === 'light' ? '#495057' : '#ebedef'
                },
                grid: {
                    color: layoutConfig.colorScheme === 'light' ? '#ebedef' : '#323438'
                }
            }
        }
    };

    if (loading) {
        return (
            <div className="grid">
                <div className="col-12">
                    <Skeleton height="120px" className="mb-3" />
                </div>
                <div className="col-12 lg:col-3">
                    <Skeleton height="100px" />
                </div>
                <div className="col-12 lg:col-3">
                    <Skeleton height="100px" />
                </div>
                <div className="col-12 lg:col-3">
                    <Skeleton height="100px" />
                </div>
                <div className="col-12 lg:col-3">
                    <Skeleton height="100px" />
                </div>
                <div className="col-12 xl:col-8">
                    <Skeleton height="400px" />
                </div>
                <div className="col-12 xl:col-4">
                    <Skeleton height="400px" />
                </div>
            </div>
        );
    }

    return (
        <div className="grid">
            <ToastNotifier ref={toastRef} />

            {/* Welcome Banner */}
            <div className="col-12">
                <div className="card mb-0" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                    <div className="flex align-items-center">
                        <div className="flex-1">
                            <h3 className="text-white mb-2">
                                Selamat Datang, {userProfile?.name || 'Guru'}   
                            </h3>
                            <p className="text-white text-sm mb-0 opacity-80">
                                {getHariIndonesia()}, {new Date().toLocaleDateString('id-ID', { 
                                    day: 'numeric', 
                                    month: 'long', 
                                    year: 'numeric' 
                                })}
                            </p>
                        </div>
                        <div>
                            <i className="pi pi-user-edit text-white" style={{ fontSize: '3rem', opacity: 0.3 }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Ringkasan */}
            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-2">
                    <div className="flex justify-content-between">
                        <div>
                            <span className="block text-500 font-medium mb-2">Mata Pelajaran</span>
                            <div className="text-900 font-medium" style={{ fontSize: '14px' }}>
                                {summary.mataPelajaranDiampu}
                            </div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-green-100 border-round" style={{ width: '3rem', height: '3rem' }}>
                            <i className="pi pi-book text-green-600 text-xl" />
                        </div>
                    </div>
                    <small className="text-500">Yang Anda ajarkan</small>
                </div>
            </div>

            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-2">
                    <div className="flex justify-content-between">
                        <div>
                            <span className="block text-500 font-medium mb-2">Total Kelas</span>
                            <div className="text-900 font-medium text-xl">{summary.totalKelasDiajar}</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-blue-100 border-round" style={{ width: '3rem', height: '3rem' }}>
                            <i className="pi pi-building text-blue-600 text-xl" />
                        </div>
                    </div>
                    <small className="text-500">Kelas yang Anda ampu</small>
                </div>
            </div>

            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-2">
                    <div className="flex justify-content-between">
                        <div>
                            <span className="block text-500 font-medium mb-2">Jadwal Hari Ini</span>
                            <div className="text-900 font-medium text-xl">{summary.jadwalHariIni} Jadwal</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-orange-100 border-round" style={{ width: '3rem', height: '3rem' }}>
                            <i className="pi pi-calendar text-orange-600 text-xl" />
                        </div>
                    </div>
                    <small className="text-500">Agenda mengajar ({getHariIndonesia()})</small>
                </div>
            </div>

            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-2">
                    <div className="flex justify-content-between">
                        <div>
                            <span className="block text-500 font-medium mb-2">Wali Kelas</span>
                            <div className="text-900 font-medium text-xl">
                                {kelasWakel.length > 0 ? kelasWakel.length : 'Tidak'}
                            </div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-purple-100 border-round" style={{ width: '3rem', height: '3rem' }}>
                            <i className="pi pi-users text-purple-600 text-xl" />
                        </div>
                    </div>
                    <small className="text-500">
                        {kelasWakel.length > 0 
                            ? `${kelasWakel[0]?.tingkatan?.TINGKATAN || ''} ${kelasWakel[0]?.jurusan?.NAMA_JURUSAN || ''} | ${kelasWakel[0]?.kelas?.NAMA_RUANG || ''}`
                            : 'Bukan wali kelas'
                        }
                    </small>
                </div>
            </div>

            {/* Agenda Mengajar */}
            <div className="col-12 xl:col-8">
                <div className="card">
                    <div className="flex justify-content-between align-items-center mb-3">
                        <h5>Agenda Mengajar Hari Ini ({getHariIndonesia()})</h5>
                        <Button 
                            label="Lihat Jadwal Lengkap" 
                            icon="pi pi-calendar" 
                            outlined 
                            size="small"
                            onClick={() => {
                                if (typeof window !== 'undefined') {
                                    window.location.href = '/guru/menu/agenda';
                                }
                            }} 
                        />
                    </div>
                    
                    {jadwalHariIni.length > 0 ? (
                        <CustomDataTable
                            data={jadwalHariIni}
                            columns={agendaColumns}
                            paginator
                            rows={5}
                            rowsPerPageOptions={[5, 10, 20]}
                        />
                    ) : (
                        <div className="text-center p-5">
                            <i className="pi pi-calendar-times text-6xl text-400 mb-3"></i>
                            <p className="text-500 text-xl">Tidak ada jadwal mengajar hari ini</p>
                            <p className="text-400">Nikmati waktu istirahat Anda</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Statistik Absensi */}
            <div className="col-12 xl:col-4">
                <div className="card">
                    <h5>Statistik Absensi Hari Ini</h5>
                    {jadwalHariIni.length > 0 ? (
                        <>
                            <Chart 
                                type="bar" 
                                data={attendanceData} 
                                options={barChartOptions} 
                                style={{ height: '300px' }}
                            />
                            <small className="text-500 mt-3 block text-center">
                                Grafik kehadiran siswa per kelas
                            </small>
                        </>
                    ) : (
                        <div className="text-center p-4">
                            <i className="pi pi-chart-bar text-6xl text-400 mb-3"></i>
                            <p className="text-500">Tidak ada data absensi hari ini</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Jadwal Minggu Ini */}
            <div className="col-12">
                <div className="card">
                    <div className="flex justify-content-between align-items-center mb-3">
                        <h5>Jadwal Mengajar Minggu Ini</h5>
                        <Button 
                            label="Refresh" 
                            icon="pi pi-refresh" 
                            outlined 
                            size="small"
                            onClick={fetchDashboardData} 
                        />
                    </div>
                    
                    <div className="grid">
                        {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'].map(hari => {
                            const jadwalHari = jadwalGuru.filter(j => j.hari?.HARI === hari);
                            const isToday = hari === getHariIndonesia();
                            
                            return (
                                <div key={hari} className="col-12 md:col-6 lg:col-4 xl:col">
                                    <div className={`p-3 border-round h-full ${isToday ? 'bg-blue-50 border-2 border-blue-200' : 'surface-100'}`}>
                                        <div className="flex align-items-center justify-content-between mb-3">
                                            <h6 className={`m-0 ${isToday ? 'text-blue-600' : 'text-900'}`}>
                                                {hari}
                                            </h6>
                                            {isToday && (
                                                <span className="bg-blue-600 text-white text-xs px-2 py-1 border-round font-bold">
                                                    Hari Ini
                                                </span>
                                            )}
                                        </div>
                                        {jadwalHari.length > 0 ? (
                                            <div className="flex flex-column gap-2">
                                                {jadwalHari.map((j, idx) => (
                                                    <div key={idx} className="bg-white border-round p-2 shadow-1">
                                                        <div className="flex align-items-center gap-2 mb-1">
                                                            <span className="bg-primary text-white text-xs px-2 py-1 border-round font-bold">
                                                                JP {j.jam_pelajaran?.JP_KE || '-'}
                                                            </span>
                                                            <span className="text-600 text-xs">
                                                                {j.jam_pelajaran?.WAKTU_MULAI || '00:00'} - {j.jam_pelajaran?.WAKTU_SELESAI || '00:00'}
                                                            </span>
                                                        </div>
                                                        <div className="text-900 font-semibold text-sm mb-1">
                                                            {j.mata_pelajaran?.NAMA_MAPEL || '-'}
                                                        </div>
                                                        <div className="text-600 text-xs">
                                                            {j.tingkatan?.TINGKATAN || ''} {j.jurusan?.NAMA_JURUSAN || ''} | {j.kelas?.NAMA_RUANG || ''}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center p-3">
                                                <i className="pi pi-inbox text-3xl text-400 mb-2"></i>
                                                <p className="text-500 text-sm m-0">Tidak ada jadwal</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            
            {/* Dialog Siswa Kelas */}
            <DialogSiswaAgenda
                visible={siswaDialogVisible}
                onHide={() => {
                    setSiswaDialogVisible(false);
                    setSelectedJadwalForSiswa(null);
                }}
                jadwalData={selectedJadwalForSiswa}
                token={getToken()}
            />
        </div>
    );
};

export default DashboardGuru;
