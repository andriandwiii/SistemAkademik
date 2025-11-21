/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useContext, useRef, useEffect, useState } from 'react';
import { LayoutContext } from '../../../../layout/context/layoutcontext';
import { Chart } from 'primereact/chart';
import { Button } from 'primereact/button';
import CustomDataTable from '../../../components/DataTable';
import ToastNotifier from '../../../components/ToastNotifier';
import { Skeleton } from 'primereact/skeleton';

const DashboardKesiswaan = () => {
    const { layoutConfig } = useContext(LayoutContext);
    const toastRef = useRef(null);

    // State untuk data dari BE
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState(null);
    const [dataSiswa, setDataSiswa] = useState([]);
    const [dataTransaksi, setDataTransaksi] = useState([]);
    const [dataKenaikan, setDataKenaikan] = useState([]);
    
    const [summary, setSummary] = useState({
        totalSiswa: 0,
        totalKelas: 0,
        siswaAktif: 0,
        totalTransaksi: 0
    });

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

            // 1. Fetch profile user
            const resProfile = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
                headers
            });

            if (resProfile.ok) {
                const profileData = await resProfile.json();
                if (profileData.status === "00") {
                    setUserProfile(profileData.user);
                }
            }

            // 2. Fetch data siswa
            const resSiswa = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/siswa`, {
                headers
            });

            let siswaData = [];
            if (resSiswa.ok) {
                const dataSiswaResponse = await resSiswa.json();
                if (dataSiswaResponse.status === '00') {
                    siswaData = Array.isArray(dataSiswaResponse.data) 
                        ? dataSiswaResponse.data 
                        : [dataSiswaResponse.data];
                    
                    // DEBUG: Log untuk melihat struktur data siswa
                    console.log('=== DEBUG DATA SISWA ===');
                    console.log('Total siswa:', siswaData.length);
                    if (siswaData.length > 0) {
                        console.log('Sample data siswa pertama:', siswaData[0]);
                        console.log('Semua keys dari siswa pertama:', Object.keys(siswaData[0]));
                    }
                    console.log('========================');
                    
                    setDataSiswa(siswaData);
                }
            }

            // 3. Fetch transaksi siswa
            const resTransaksi = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/transaksi-siswa`, {
                headers
            });

            let transaksiData = [];
            if (resTransaksi.ok) {
                const dataTransaksiResponse = await resTransaksi.json();
                if (dataTransaksiResponse.status === '00') {
                    transaksiData = dataTransaksiResponse.data || [];
                    setDataTransaksi(transaksiData);
                }
            }

            // 4. Fetch kenaikan kelas
            const resKenaikan = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/kenaikan-kelas`, {
                headers
            });

            let kenaikanData = [];
            if (resKenaikan.ok) {
                const dataKenaikanResponse = await resKenaikan.json();
                if (dataKenaikanResponse.status === '00') {
                    kenaikanData = dataKenaikanResponse.data || [];
                    setDataKenaikan(kenaikanData);
                }
            }

            // 5. Hitung summary
            const totalSiswa = siswaData.length;
            const siswaAktif = siswaData.filter(s => s.STATUS === 'Aktif').length;
            const kelasUnik = new Set(transaksiData.map(t => t.kelas?.KELAS_ID).filter(Boolean));
            
            setSummary({
                totalSiswa,
                totalKelas: kelasUnik.size,
                siswaAktif,
                totalTransaksi: transaksiData.length
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

    // Data untuk chart distribusi kelas
    const getKelasDistribusiData = () => {
        const kelasCount = {};
        dataTransaksi.forEach(t => {
            const kelasId = t.kelas?.KELAS_ID;
            if (kelasId) {
                kelasCount[kelasId] = (kelasCount[kelasId] || 0) + 1;
            }
        });

        const sortedKelas = Object.entries(kelasCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8);

        return {
            labels: sortedKelas.map(([kelas]) => kelas),
            datasets: [{
                label: 'Jumlah Siswa',
                backgroundColor: '#42A5F5',
                data: sortedKelas.map(([, count]) => count)
            }]
        };
    };

    // Data untuk chart status kenaikan
    const getKenaikanStatusData = () => {
        const statusCount = {
            NAIK: dataKenaikan.filter(k => k.STATUS === 'NAIK').length,
            TINGGAL: dataKenaikan.filter(k => k.STATUS === 'TINGGAL').length,
            LULUS: dataKenaikan.filter(k => k.STATUS === 'LULUS').length
        };

        return {
            labels: ['Naik Kelas', 'Tinggal Kelas', 'Lulus'],
            datasets: [{
                data: [statusCount.NAIK, statusCount.TINGGAL, statusCount.LULUS],
                backgroundColor: ['#66BB6A', '#FFC107', '#42A5F5'],
                hoverBackgroundColor: ['#4CAF50', '#FFA000', '#2196F3']
            }]
        };
    };

    // Data untuk chart distribusi gender
    const getGenderDistribusiData = () => {
        console.log('Data Siswa untuk Gender:', dataSiswa);
        
        // Cek berbagai kemungkinan field name untuk jenis kelamin
        const lakiLaki = dataSiswa.filter(s => {
            const jk = s.JENIS_KELAMIN || s.jenis_kelamin || s.JK || s.jk || s.GENDER || s.gender;
            return jk === 'L' || jk === 'Laki-laki' || jk === 'LAKI-LAKI' || jk === 'Male' || jk === 'M';
        }).length;
        
        const perempuan = dataSiswa.filter(s => {
            const jk = s.JENIS_KELAMIN || s.jenis_kelamin || s.JK || s.jk || s.GENDER || s.gender;
            return jk === 'P' || jk === 'Perempuan' || jk === 'PEREMPUAN' || jk === 'Female' || jk === 'F';
        }).length;

        console.log('Gender Count - Laki-laki:', lakiLaki, 'Perempuan:', perempuan);

        return {
            labels: ['Laki-laki', 'Perempuan'],
            datasets: [{
                data: [lakiLaki, perempuan],
                backgroundColor: ['#42A5F5', '#EC407A'],
                hoverBackgroundColor: ['#2196F3', '#E91E63']
            }]
        };
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
                },
                beginAtZero: true
            }
        }
    };

    const doughnutOptions = {
        plugins: {
            legend: {
                labels: {
                    color: layoutConfig.colorScheme === 'light' ? '#495057' : '#ebedef'
                }
            }
        }
    };

    // Columns untuk tabel siswa
    const siswaColumns = [
        { field: 'NIS', header: 'NIS', style: { minWidth: '120px' } },
        { field: 'NAMA', header: 'Nama Siswa', style: { minWidth: '180px' } },
        { 
            field: 'JENIS_KELAMIN', 
            header: 'JK', 
            style: { width: '80px' },
            body: (row) => {
                const jk = row.JENIS_KELAMIN || row.jenis_kelamin || row.JK || row.jk || row.GENDER || row.gender;
                const isLakiLaki = jk === 'L' || jk === 'Laki-laki' || jk === 'LAKI-LAKI' || jk === 'Male' || jk === 'M';
                const displayJK = isLakiLaki ? 'L' : 'P';
                
                return (
                    <span className={`px-2 py-1 border-round text-sm font-semibold ${
                        isLakiLaki 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-pink-100 text-pink-800'
                    }`}>
                        {displayJK}
                    </span>
                );
            }
        },
        { field: 'EMAIL', header: 'Email', style: { minWidth: '200px' } },
        { 
            field: 'STATUS', 
            header: 'Status',
            style: { width: '100px' },
            body: (row) => (
                <span className={`px-2 py-1 border-round text-sm font-semibold ${
                    row.STATUS === 'Aktif' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                    {row.STATUS || 'Aktif'}
                </span>
            )
        }
    ];

    // Columns untuk transaksi
    const transaksiColumns = [
        { field: 'TRANSAKSI_ID', header: 'ID Transaksi', style: { minWidth: '140px' } },
        {
            field: 'siswa.NAMA',
            header: 'Nama Siswa',
            style: { minWidth: '180px' },
            body: (row) => row.siswa?.NAMA || '-'
        },
        {
            field: 'kelas.KELAS_ID',
            header: 'Kelas',
            style: { minWidth: '100px' },
            body: (row) => row.kelas?.KELAS_ID || '-'
        },
        {
            field: 'tingkatan.TINGKATAN',
            header: 'Tingkatan',
            style: { width: '100px' },
            body: (row) => row.tingkatan?.TINGKATAN || '-'
        },
        {
            field: 'tahun_ajaran.NAMA_TAHUN_AJARAN',
            header: 'Tahun Ajaran',
            style: { minWidth: '140px' },
            body: (row) => row.tahun_ajaran?.NAMA_TAHUN_AJARAN || '-'
        }
    ];

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
                                Selamat Datang, {userProfile?.name || 'User'}
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
                            <i className="pi pi-users text-white" style={{ fontSize: '3rem', opacity: 0.3 }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-2">
                    <div className="flex justify-content-between">
                        <div>
                            <span className="block text-500 font-medium mb-2">Total Siswa</span>
                            <div className="text-900 font-medium text-xl">{summary.totalSiswa}</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-blue-100 border-round" style={{ width: '3rem', height: '3rem' }}>
                            <i className="pi pi-users text-blue-600 text-xl" />
                        </div>
                    </div>
                    <small className="text-500">Seluruh siswa terdaftar</small>
                </div>
            </div>

            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-2">
                    <div className="flex justify-content-between">
                        <div>
                            <span className="block text-500 font-medium mb-2">Jumlah Kelas</span>
                            <div className="text-900 font-medium text-xl">{summary.totalKelas}</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-green-100 border-round" style={{ width: '3rem', height: '3rem' }}>
                            <i className="pi pi-building text-green-600 text-xl" />
                        </div>
                    </div>
                    <small className="text-500">Kelas aktif</small>
                </div>
            </div>

            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-2">
                    <div className="flex justify-content-between">
                        <div>
                            <span className="block text-500 font-medium mb-2">Siswa Aktif</span>
                            <div className="text-900 font-medium text-xl">{summary.siswaAktif}</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-cyan-100 border-round" style={{ width: '3rem', height: '3rem' }}>
                            <i className="pi pi-check-circle text-cyan-600 text-xl" />
                        </div>
                    </div>
                    <small className="text-500">Status aktif</small>
                </div>
            </div>

            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-2">
                    <div className="flex justify-content-between">
                        <div>
                            <span className="block text-500 font-medium mb-2">Total Transaksi</span>
                            <div className="text-900 font-medium text-xl">{summary.totalTransaksi}</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-purple-100 border-round" style={{ width: '3rem', height: '3rem' }}>
                            <i className="pi pi-list text-purple-600 text-xl" />
                        </div>
                    </div>
                    <small className="text-500">Transaksi siswa ke kelas</small>
                </div>
            </div>

            {/* Charts Section */}
            <div className="col-12 xl:col-8">
                <div className="card">
                    <div className="flex justify-content-between align-items-center mb-3">
                        <h5>Distribusi Siswa per Kelas (Top 8)</h5>
                        <Button 
                            label="Refresh" 
                            icon="pi pi-refresh" 
                            outlined 
                            size="small"
                            onClick={fetchDashboardData} 
                        />
                    </div>
                    
                    {dataTransaksi.length > 0 ? (
                        <>
                            <Chart 
                                type="bar" 
                                data={getKelasDistribusiData()} 
                                options={barChartOptions} 
                                style={{ height: '300px' }}
                            />
                            <small className="text-500 mt-3 block text-center">
                                Grafik jumlah siswa per kelas
                            </small>
                        </>
                    ) : (
                        <div className="text-center p-4">
                            <i className="pi pi-chart-bar text-6xl text-400 mb-3"></i>
                            <p className="text-500">Tidak ada data transaksi siswa</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="col-12 xl:col-4">
                <div className="grid">
                    {/* Gender Distribution */}
                    <div className="col-12">
                        <div className="card">
                            <h5>Distribusi Gender</h5>
                            {dataSiswa.length > 0 ? (
                                <>
                                    <Chart 
                                        type="doughnut" 
                                        data={getGenderDistribusiData()} 
                                        options={doughnutOptions}
                                        style={{ height: '200px' }}
                                    />
                                    <div className="grid mt-3 pt-3 border-top-1 surface-border">
                                        <div className="col-6 text-center">
                                            <div className="mb-2">
                                                <i className="pi pi-male text-blue-500 text-2xl"></i>
                                            </div>
                                            <div className="text-900 font-bold text-xl mb-1">
                                                {dataSiswa.filter(s => {
                                                    const jk = s.JENIS_KELAMIN || s.jenis_kelamin || s.JK || s.jk || s.GENDER || s.gender;
                                                    return jk === 'L' || jk === 'Laki-laki' || jk === 'LAKI-LAKI' || jk === 'Male' || jk === 'M';
                                                }).length}
                                            </div>
                                            <small className="text-500">Laki-laki</small>
                                        </div>
                                        <div className="col-6 text-center">
                                            <div className="mb-2">
                                                <i className="pi pi-female text-pink-500 text-2xl"></i>
                                            </div>
                                            <div className="text-900 font-bold text-xl mb-1">
                                                {dataSiswa.filter(s => {
                                                    const jk = s.JENIS_KELAMIN || s.jenis_kelamin || s.JK || s.jk || s.GENDER || s.gender;
                                                    return jk === 'P' || jk === 'Perempuan' || jk === 'PEREMPUAN' || jk === 'Female' || jk === 'F';
                                                }).length}
                                            </div>
                                            <small className="text-500">Perempuan</small>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center p-3">
                                    <i className="pi pi-chart-pie text-4xl text-400 mb-2"></i>
                                    <p className="text-500 text-sm">Belum ada data siswa</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Status Kenaikan */}
                    <div className="col-12">
                        <div className="card">
                            <h5>Status Kenaikan Kelas</h5>
                            {dataKenaikan.length > 0 ? (
                                <>
                                    <Chart 
                                        type="doughnut" 
                                        data={getKenaikanStatusData()} 
                                        options={doughnutOptions}
                                        style={{ height: '200px' }}
                                    />
                                    <small className="text-500 mt-3 block text-center">
                                        Distribusi status kenaikan
                                    </small>
                                </>
                            ) : (
                                <div className="text-center p-3">
                                    <i className="pi pi-chart-pie text-4xl text-400 mb-2"></i>
                                    <p className="text-500 text-sm">Belum ada data kenaikan</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Data Siswa Terbaru */}
            <div className="col-12">
                <div className="card">
                    <div className="flex justify-content-between align-items-center mb-3">
                        <h5>Data Siswa Terbaru</h5>
                        <Button 
                            label="Lihat Semua" 
                            icon="pi pi-arrow-right" 
                            outlined 
                            size="small"
                            onClick={() => {
                                if (typeof window !== 'undefined') {
                                    window.location.href = '/kesiswaan/menu/siswa';
                                }
                            }} 
                        />
                    </div>
                    
                    {dataSiswa.length > 0 ? (
                        <CustomDataTable 
                            data={dataSiswa.slice(0, 5)} 
                            columns={siswaColumns}
                            paginator={false}
                        />
                    ) : (
                        <div className="text-center p-5">
                            <i className="pi pi-users text-6xl text-400 mb-3"></i>
                            <p className="text-500 text-xl">Belum ada data siswa</p>
                            <p className="text-400">Tambahkan siswa baru untuk memulai</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Transaksi Siswa Terbaru */}
            <div className="col-12">
                <div className="card">
                    <div className="flex justify-content-between align-items-center mb-3">
                        <h5>Transaksi Siswa Terbaru</h5>
                        <Button 
                            label="Lihat Semua" 
                            icon="pi pi-arrow-right" 
                            outlined 
                            size="small"
                            onClick={() => {
                                if (typeof window !== 'undefined') {
                                    window.location.href = '/kesiswaan/menu/transaksi-siswa';
                                }
                            }} 
                        />
                    </div>
                    
                    {dataTransaksi.length > 0 ? (
                        <CustomDataTable 
                            data={dataTransaksi.slice(0, 5)} 
                            columns={transaksiColumns}
                            paginator={false}
                        />
                    ) : (
                        <div className="text-center p-5">
                            <i className="pi pi-list text-6xl text-400 mb-3"></i>
                            <p className="text-500 text-xl">Belum ada transaksi siswa</p>
                            <p className="text-400">Assign siswa ke kelas untuk memulai</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardKesiswaan;