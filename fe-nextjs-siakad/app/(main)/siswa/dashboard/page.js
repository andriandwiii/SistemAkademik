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

            // 1. Fetch profile user (sudah include data siswa + transaksi kelas)
            const resProfile = await fetch(`${baseURL}/auth/profile`, { headers });
            
            if (!resProfile.ok) {
                throw new Error('Gagal mengambil profil user');
            }

            const profileData = await resProfile.json();
            
            if (profileData.status !== "00") {
                throw new Error(profileData.message || 'Gagal mengambil profil');
            }

            setUserProfile(profileData.user);

            // Validasi role siswa
            if (profileData.user.role !== 'SISWA') {
                throw new Error('Akses ditolak. Hanya siswa yang dapat mengakses dashboard ini.');
            }

            // Data siswa sudah lengkap dari profile
            const siswaFromProfile = profileData.user.siswa;
            
            if (!siswaFromProfile) {
                throw new Error('Data siswa tidak ditemukan.');
            }

            setSiswaData(siswaFromProfile);

            // 2. Fetch jadwal berdasarkan kelas siswa
            const transaksiKelas = siswaFromProfile.transaksi_siswa_kelas;
            
            if (transaksiKelas && transaksiKelas.length > 0) {
                // Ambil kelas pertama (kelas aktif)
                const kelasAktif = transaksiKelas[0];
                const kelasId = kelasAktif.KELAS_ID;

                // Fetch semua jadwal
                const resJadwal = await fetch(`${baseURL}/jadwal`, { headers });
                
                if (resJadwal.ok) {
                    const dataJadwal = await resJadwal.json();
                    const allJadwalData = dataJadwal.data || [];
                    
                    // Filter jadwal untuk kelas siswa ini
                    const jadwalKelas = allJadwalData.filter(j => j.kelas?.KELAS_ID === kelasId);
                    
                    // Debug: Log struktur data guru
                    if (jadwalKelas.length > 0) {
                        console.log('Sample jadwal data:', jadwalKelas[0]);
                        console.log('Guru data structure:', jadwalKelas[0]?.guru);
                    }
                    
                    setAllJadwal(jadwalKelas);

                    // Filter jadwal hari ini
                    const hariIni = getHariIndonesia();
                    const jadwalToday = jadwalKelas.filter(j => j.hari?.HARI === hariIni);
                    setJadwalHariIni(jadwalToday);
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

    // Chart: Kehadiran (dummy - bisa diganti dengan data real dari API absensi)
    const attendanceData = {
        labels: ['Hadir', 'Sakit', 'Izin', 'Alpha'],
        datasets: [
            {
                data: [85, 5, 8, 2],
                backgroundColor: ['#22c55e', '#facc15', '#3b82f6', '#ef4444'],
                hoverBackgroundColor: ['#16a34a', '#eab308', '#2563eb', '#dc2626']
            }
        ]
    };

    // Chart: Nilai rata-rata per mapel (dummy)
    const nilaiData = {
        labels: jadwalHariIni.slice(0, 5).map(j => j.mata_pelajaran?.NAMA_MAPEL || '-'),
        datasets: [
            {
                label: 'Nilai (Dummy)',
                backgroundColor: '#3b82f6',
                data: jadwalHariIni.slice(0, 5).map(() => Math.floor(Math.random() * 20) + 75)
            }
        ]
    };

    const chartOptions = {
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

    // Kolom untuk jadwal hari ini
    const jadwalColumns = [
        { 
            field: 'jam_pelajaran.JP_KE', 
            header: 'JP',
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
            field: 'mata_pelajaran.NAMA_MAPEL', 
            header: 'Mata Pelajaran',
            body: (rowData) => rowData.mata_pelajaran?.NAMA_MAPEL || '-'
        },
        { 
            field: 'guru.NAMA', 
            header: 'Guru',
            body: (rowData) => {
                // Coba berbagai kemungkinan field nama guru
                const namaGuru = rowData.guru?.NAMA_GURU || 
                                rowData.guru?.NAMA || 
                                rowData.guru?.nama || 
                                rowData.guru?.nama_guru ||
                                (rowData.guru && typeof rowData.guru === 'string' ? rowData.guru : null);
                
                console.log('Guru data in table:', rowData.guru); // Debug log
                return namaGuru || '-';
            }
        },
        { 
            header: 'Status', 
            body: statusTemplate,
            style: { width: '150px' }
        }
    ];

    if (loading) {
        return (
            <div className="grid">
                <ToastNotifier ref={toastRef} />
                <div className="col-12">
                    <Skeleton height="120px" className="mb-3" />
                </div>
                <div className="col-12 lg:col-3">
                    <Skeleton height="100px" className="mb-2" />
                </div>
                <div className="col-12 lg:col-3">
                    <Skeleton height="100px" className="mb-2" />
                </div>
                <div className="col-12 lg:col-3">
                    <Skeleton height="100px" className="mb-2" />
                </div>
                <div className="col-12 lg:col-3">
                    <Skeleton height="100px" className="mb-2" />
                </div>
                <div className="col-12 md:col-6">
                    <Skeleton height="300px" />
                </div>
                <div className="col-12 md:col-6">
                    <Skeleton height="300px" />
                </div>
            </div>
        );
    }

    // Data kelas siswa dari transaksi
    const transaksiKelas = siswaData?.transaksi_siswa_kelas?.[0];
    const tingkatan = transaksiKelas?.tingkatan?.TINGKATAN || '-';
    const jurusan = transaksiKelas?.jurusan?.NAMA_JURUSAN || '-';
    const namaRuang = transaksiKelas?.kelas?.NAMA_RUANG || '-';

    return (
        <div className="grid">
            <ToastNotifier ref={toastRef} />

            {/* Welcome Banner */}
            <div className="col-12">
                <div className="card mb-0" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                    <div className="flex align-items-center">
                        <div className="flex-1">
                            <h3 className="text-white mb-2">
                                Selamat Datang, {siswaData?.NAMA || userProfile?.name || 'Siswa'}
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
                            <i className="pi pi-user text-white" style={{ fontSize: '3rem', opacity: 0.3 }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* 4 Summary Cards */}
            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Profil</span>
                            <div className="text-900 font-medium text-xl">{siswaData?.NAMA || userProfile?.name || '-'}</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-blue-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-user text-blue-500 text-xl" />
                        </div>
                    </div>
                    <span className="text-green-500 font-medium">Kelas {tingkatan} </span>
                    <span className="text-500">{jurusan}</span>
                </div>
            </div>

            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">NIS</span>
                            <div className="text-900 font-medium text-xl">{siswaData?.NIS || '-'}</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-orange-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-id-card text-orange-500 text-xl" />
                        </div>
                    </div>
                    <span className="text-500">Nomor Induk Siswa</span>
                </div>
            </div>

            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Ruang Kelas</span>
                            <div className="text-900 font-medium text-xl">{namaRuang}</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-cyan-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-building text-cyan-500 text-xl" />
                        </div>
                    </div>
                    <span className="text-500">Lokasi belajar</span>
                </div>
            </div>

            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Jadwal Hari Ini</span>
                            <div className="text-900 font-medium text-xl">{jadwalHariIni.length} Mapel</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-purple-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-calendar text-purple-500 text-xl" />
                        </div>
                    </div>
                    <span className="text-500">Agenda belajar ({getHariIndonesia()})</span>
                </div>
            </div>

            {/* Chart Kehadiran (Pie) */}
            <div className="col-12 md:col-5">
                <div className="card">
                    <h5>Kehadiran Siswa (Dummy)</h5>
                    <div style={{ height: '300px' }}>
                        <Chart type="doughnut" data={attendanceData} options={{ maintainAspectRatio: false }} />
                    </div>
                    <small className="text-500 mt-3 block text-center">
                        Data kehadiran bulan ini
                    </small>
                </div>
            </div>

            {/* Chart Nilai (Bar) */}
            <div className="col-12 md:col-7">
                <div className="card">
                    <h5>Nilai Rata-rata per Mata Pelajaran (Dummy)</h5>
                    {jadwalHariIni.length > 0 ? (
                        <>
                            <div style={{ height: '300px' }}>
                                <Chart type="bar" data={nilaiData} options={chartOptions} />
                            </div>
                            <small className="text-500 mt-3 block text-center">
                                Berdasarkan mata pelajaran hari ini
                            </small>
                        </>
                    ) : (
                        <div className="text-center p-5">
                            <i className="pi pi-chart-bar text-6xl text-400 mb-3"></i>
                            <p className="text-500">Tidak ada data nilai hari ini</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Jadwal Pelajaran Hari Ini */}
            <div className="col-12">
                <div className="card">
                    <div className="flex justify-content-between align-items-center mb-3">
                        <h5>Jadwal Pelajaran Hari Ini ({getHariIndonesia()})</h5>
                        <Button 
                            label="Lihat Jadwal Lengkap" 
                            icon="pi pi-calendar" 
                            outlined 
                            size="small"
                            onClick={() => {
                                // Scroll ke section jadwal minggu ini
                                document.getElementById('jadwal-minggu-ini')?.scrollIntoView({ behavior: 'smooth' });
                            }} 
                        />
                    </div>
                    
                    {jadwalHariIni.length > 0 ? (
                        <CustomDataTable
                            data={jadwalHariIni}
                            columns={jadwalColumns}
                            paginator
                            rows={10}
                            rowsPerPageOptions={[5, 10, 20]}
                        />
                    ) : (
                        <div className="text-center p-5">
                            <i className="pi pi-calendar-times text-6xl text-400 mb-3"></i>
                            <p className="text-500 text-xl">Tidak ada jadwal pelajaran hari ini</p>
                            <p className="text-400">Nikmati waktu libur Anda</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Jadwal Minggu Ini - NEW SECTION */}
            <div className="col-12" id="jadwal-minggu-ini">
                <div className="card">
                    <div className="flex justify-content-between align-items-center mb-3">
                        <h5>Jadwal Pelajaran Minggu Ini</h5>
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
                            const jadwalHari = allJadwal.filter(j => j.hari?.HARI === hari);
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
                                                        <div className="text-600 text-xs mb-1">
                                                            {(() => {
                                                                // Coba berbagai kemungkinan field nama guru
                                                                const namaGuru = j.guru?.NAMA_GURU || 
                                                                                j.guru?.NAMA || 
                                                                                j.guru?.nama || 
                                                                                j.guru?.nama_guru ||
                                                                                (j.guru && typeof j.guru === 'string' ? j.guru : null);
                                                                
                                                                return namaGuru || '-';
                                                            })()}
                                                        </div>
                                                        {/* Status badge untuk hari ini */}
                                                        {isToday && (
                                                            <div className="mt-2">
                                                                {statusTemplate(j)}
                                                            </div>
                                                        )}
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


        </div>
    );
};

export default DashboardSiswa;
