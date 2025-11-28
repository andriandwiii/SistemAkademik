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
                backgroundColor: 'rgba(99, 102, 241, 0.8)',
                borderColor: 'rgb(99, 102, 241)',
                borderWidth: 2,
                borderRadius: 8,
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
                backgroundColor: [
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(250, 204, 21, 0.8)',
                    'rgba(59, 130, 246, 0.8)'
                ],
                borderColor: [
                    'rgb(34, 197, 94)',
                    'rgb(250, 204, 21)',
                    'rgb(59, 130, 246)'
                ],
                borderWidth: 2
            }]
        };
    };

    // Data untuk chart distribusi gender - ENHANCED
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
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(236, 72, 153, 0.8)'
                ],
                borderColor: [
                    'rgb(59, 130, 246)',
                    'rgb(236, 72, 153)'
                ],
                borderWidth: 2
            }]
        };
    };

    const barChartOptions = {
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
            legend: {
                display: true,
                position: 'top',
                labels: {
                    padding: 15,
                    font: {
                        size: 12,
                        weight: '500'
                    },
                    color: layoutConfig.colorScheme === 'light' ? '#495057' : '#ebedef',
                    usePointStyle: true,
                    pointStyle: 'circle'
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                cornerRadius: 8,
                titleFont: {
                    size: 14,
                    weight: 'bold'
                },
                bodyFont: {
                    size: 13
                },
                callbacks: {
                    label: function(context) {
                        return `${context.dataset.label}: ${context.parsed.y} siswa`;
                    }
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: layoutConfig.colorScheme === 'light' ? '#495057' : '#ebedef',
                    font: {
                        size: 11
                    }
                },
                grid: {
                    display: false
                }
            },
            y: {
                ticks: {
                    color: layoutConfig.colorScheme === 'light' ? '#495057' : '#ebedef',
                    font: {
                        size: 11
                    },
                    stepSize: 1
                },
                grid: {
                    color: layoutConfig.colorScheme === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)',
                    drawBorder: false
                },
                beginAtZero: true
            }
        }
    };

    const doughnutOptions = {
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    padding: 15,
                    font: {
                        size: 12,
                        weight: '500'
                    },
                    color: layoutConfig.colorScheme === 'light' ? '#495057' : '#ebedef',
                    usePointStyle: true,
                    pointStyle: 'circle',
                    generateLabels: function(chart) {
                        const data = chart.data;
                        if (data.labels.length && data.datasets.length) {
                            return data.labels.map((label, i) => {
                                const value = data.datasets[0].data[i];
                                const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                return {
                                    text: `${label}: ${value} (${percentage}%)`,
                                    fillStyle: data.datasets[0].backgroundColor[i],
                                    hidden: false,
                                    index: i
                                };
                            });
                        }
                        return [];
                    }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                cornerRadius: 8,
                titleFont: {
                    size: 14,
                    weight: 'bold'
                },
                bodyFont: {
                    size: 13
                },
                callbacks: {
                    label: function(context) {
                        const label = context.label || '';
                        const value = context.parsed;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                        return `${label}: ${value} siswa (${percentage}%)`;
                    }
                }
            }
        },
        cutout: '65%'
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
            body: (row) => (
                <span className="px-2 py-1 bg-indigo-100 text-indigo-800 border-round text-sm font-semibold">
                    {row.kelas?.KELAS_ID || '-'}
                </span>
            )
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
                    <Skeleton height="140px" className="mb-3" borderRadius="12px" />
                </div>
                <div className="col-12 lg:col-6 xl:col-3">
                    <Skeleton height="120px" borderRadius="12px" />
                </div>
                <div className="col-12 lg:col-6 xl:col-3">
                    <Skeleton height="120px" borderRadius="12px" />
                </div>
                <div className="col-12 lg:col-6 xl:col-3">
                    <Skeleton height="120px" borderRadius="12px" />
                </div>
                <div className="col-12 lg:col-6 xl:col-3">
                    <Skeleton height="120px" borderRadius="12px" />
                </div>
                <div className="col-12 xl:col-8">
                    <Skeleton height="450px" borderRadius="12px" />
                </div>
                <div className="col-12 xl:col-4">
                    <Skeleton height="450px" borderRadius="12px" />
                </div>
            </div>
        );
    }

    return (
        <div className="grid">
            <ToastNotifier ref={toastRef} />

            {/* Welcome Banner - Enhanced */}
            <div className="col-12">
                <div 
                    className="card mb-0 shadow-3" 
                    style={{ 
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        position: 'relative'
                    }}
                >
                    <div 
                        style={{
                            position: 'absolute',
                            top: '-50px',
                            right: '-50px',
                            width: '200px',
                            height: '200px',
                            background: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '50%'
                        }}
                    />
                    <div className="flex align-items-center justify-content-between" style={{ position: 'relative', zIndex: 1 }}>
                        <div className="flex-1">
                            <div className="flex align-items-center gap-3 mb-3">
                                <i className="pi pi-user text-white text-4xl" />
                                <div>
                                    <h2 className="text-white mb-1 font-bold" style={{ fontSize: '1.75rem' }}>
                                        Selamat Datang, {userProfile?.name || 'User'}!
                                    </h2>
                                    <p className="text-white mb-0 opacity-90" style={{ fontSize: '1rem' }}>
                                        {getHariIndonesia()}, {new Date().toLocaleDateString('id-ID', { 
                                            day: 'numeric', 
                                            month: 'long', 
                                            year: 'numeric' 
                                        })}
                                    </p>
                                </div>
                            </div>
                            <p className="text-white mb-0 opacity-80">
                                Kelola data kesiswaan dengan mudah dan efisien
                            </p>
                        </div>
                        <div className="hidden lg:block">
                            <i className="pi pi-users text-white" style={{ fontSize: '5rem', opacity: 0.2 }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary Cards - Enhanced */}
            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-2 shadow-2 hover:shadow-4 transition-duration-300" style={{ borderRadius: '12px' }}>
                    <div className="flex justify-content-between align-items-start">
                        <div className="flex-1">
                            <span className="block text-600 font-medium mb-2 text-sm">Total Siswa</span>
                            <div className="text-900 font-bold mb-2" style={{ fontSize: '2rem' }}>
                                {summary.totalSiswa}
                            </div>
                            <small className="text-500">Seluruh siswa terdaftar</small>
                        </div>
                        <div 
                            className="flex align-items-center justify-content-center border-round" 
                            style={{ 
                                width: '3.5rem', 
                                height: '3.5rem',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                            }}
                        >
                            <i className="pi pi-users text-white text-2xl" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-2 shadow-2 hover:shadow-4 transition-duration-300" style={{ borderRadius: '12px' }}>
                    <div className="flex justify-content-between align-items-start">
                        <div className="flex-1">
                            <span className="block text-600 font-medium mb-2 text-sm">Jumlah Kelas</span>
                            <div className="text-900 font-bold mb-2" style={{ fontSize: '2rem' }}>
                                {summary.totalKelas}
                            </div>
                            <small className="text-500">Kelas aktif</small>
                        </div>
                        <div 
                            className="flex align-items-center justify-content-center border-round" 
                            style={{ 
                                width: '3.5rem', 
                                height: '3.5rem',
                                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                            }}
                        >
                            <i className="pi pi-building text-white text-2xl" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-2 shadow-2 hover:shadow-4 transition-duration-300" style={{ borderRadius: '12px' }}>
                    <div className="flex justify-content-between align-items-start">
                        <div className="flex-1">
                            <span className="block text-600 font-medium mb-2 text-sm">Siswa Aktif</span>
                            <div className="text-900 font-bold mb-2" style={{ fontSize: '2rem' }}>
                                {summary.siswaAktif}
                            </div>
                            <small className="text-500">Status aktif</small>
                        </div>
                        <div 
                            className="flex align-items-center justify-content-center border-round" 
                            style={{ 
                                width: '3.5rem', 
                                height: '3.5rem',
                                background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)'
                            }}
                        >
                            <i className="pi pi-check-circle text-white text-2xl" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-2 shadow-2 hover:shadow-4 transition-duration-300" style={{ borderRadius: '12px' }}>
                    <div className="flex justify-content-between align-items-start">
                        <div className="flex-1">
                            <span className="block text-600 font-medium mb-2 text-sm">Total Transaksi</span>
                            <div className="text-900 font-bold mb-2" style={{ fontSize: '2rem' }}>
                                {summary.totalTransaksi}
                            </div>
                            <small className="text-500">Transaksi siswa ke kelas</small>
                        </div>
                        <div 
                            className="flex align-items-center justify-content-center border-round" 
                            style={{ 
                                width: '3.5rem', 
                                height: '3.5rem',
                                background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)'
                            }}
                        >
                            <i className="pi pi-list text-white text-2xl" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Section - Enhanced Layout */}
            <div className="col-12 xl:col-8">
                <div className="card shadow-2" style={{ borderRadius: '12px' }}>
                    <div className="flex justify-content-between align-items-center mb-4">
                        <div>
                            <h5 className="mb-1">Distribusi Siswa per Kelas</h5>
                            <small className="text-500">Top 8 kelas dengan siswa terbanyak</small>
                        </div>
                        <Button 
                            label="Refresh" 
                            icon="pi pi-refresh" 
                            outlined 
                            size="small"
                            onClick={fetchDashboardData}
                            className="p-button-sm"
                        />
                    </div>
                    
                    {dataTransaksi.length > 0 ? (
                        <Chart 
                            type="bar" 
                            data={getKelasDistribusiData()} 
                            options={barChartOptions} 
                            style={{ height: '350px' }}
                        />
                    ) : (
                        <div className="text-center p-5">
                            <i className="pi pi-chart-bar text-6xl text-300 mb-3"></i>
                            <p className="text-600 font-medium mb-1">Tidak ada data transaksi siswa</p>
                            <p className="text-500 text-sm">Assign siswa ke kelas untuk melihat distribusi</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="col-12 xl:col-4">
                <div className="grid">
                    {/* Gender Distribution - ENHANCED */}
                    <div className="col-12">
                        <div className="card shadow-2" style={{ borderRadius: '12px', height: '100%' }}>
                            <h5 className="mb-3">Distribusi Gender Siswa</h5>
                            {dataSiswa.length > 0 ? (
                                <div>
                                    <Chart 
                                        type="doughnut" 
                                        data={getGenderDistribusiData()} 
                                        options={doughnutOptions}
                                        style={{ height: '220px' }}
                                    />
                                    <div className="grid mt-3 pt-3 border-top-1 border-200">
                                        <div className="col-6 text-center">
                                            <div className="mb-2">
                                                <i className="pi pi-male text-blue-500 text-3xl"></i>
                                            </div>
                                            <div className="text-900 font-bold text-2xl mb-1">
                                                {dataSiswa.filter(s => {
                                                    const jk = s.JENIS_KELAMIN || s.jenis_kelamin || s.JK || s.jk || s.GENDER || s.gender;
                                                    return jk === 'L' || jk === 'Laki-laki' || jk === 'LAKI-LAKI' || jk === 'Male' || jk === 'M';
                                                }).length}
                                            </div>
                                            <div className="text-500 text-sm">Laki-laki</div>
                                        </div>
                                        <div className="col-6 text-center">
                                            <div className="mb-2">
                                                <i className="pi pi-female text-pink-500 text-3xl"></i>
                                            </div>
                                            <div className="text-900 font-bold text-2xl mb-1">
                                                {dataSiswa.filter(s => {
                                                    const jk = s.JENIS_KELAMIN || s.jenis_kelamin || s.JK || s.jk || s.GENDER || s.gender;
                                                    return jk === 'P' || jk === 'Perempuan' || jk === 'PEREMPUAN' || jk === 'Female' || jk === 'F';
                                                }).length}
                                            </div>
                                            <div className="text-500 text-sm">Perempuan</div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center p-4">
                                    <i className="pi pi-chart-pie text-5xl text-300 mb-3"></i>
                                    <p className="text-600 font-medium mb-1">Belum ada data siswa</p>
                                    <p className="text-500 text-sm">Tambahkan siswa untuk melihat distribusi</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Status Kenaikan - Enhanced */}
                    <div className="col-12">
                        <div className="card shadow-2" style={{ borderRadius: '12px' }}>
                            <h5 className="mb-3">Status Kenaikan Kelas</h5>
                            {dataKenaikan.length > 0 ? (
                                <Chart 
                                    type="doughnut" 
                                    data={getKenaikanStatusData()} 
                                    options={doughnutOptions}
                                    style={{ height: '220px' }}
                                />
                            ) : (
                                <div className="text-center p-4">
                                    <i className="pi pi-chart-pie text-5xl text-300 mb-3"></i>
                                    <p className="text-600 font-medium mb-1">Belum ada data kenaikan</p>
                                    <p className="text-500 text-sm">Data akan muncul setelah proses kenaikan kelas</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Data Siswa Terbaru - Enhanced */}
            <div className="col-12">
                <div className="card shadow-2" style={{ borderRadius: '12px' }}>
                    <div className="flex justify-content-between align-items-center mb-3">
                        <div>
                            <h5 className="mb-1">Data Siswa Terbaru</h5>
                            <small className="text-500">5 data siswa terbaru yang terdaftar</small>
                        </div>
                        <Button 
                            label="Lihat Semua" 
                            icon="pi pi-arrow-right" 
                            iconPos="right"
                            outlined 
                            size="small"
                            onClick={() => {
                                if (typeof window !== 'undefined') {
                                    window.location.href = '/kesiswaan/menu/data-siswa';
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
                            <i className="pi pi-users text-6xl text-300 mb-3"></i>
                            <p className="text-600 font-medium text-xl mb-2">Belum ada data siswa</p>
                            <p className="text-500">Tambahkan siswa baru untuk memulai</p>
                            <Button 
                                label="Tambah Siswa" 
                                icon="pi pi-plus" 
                                className="mt-3"
                                onClick={() => {
                                    if (typeof window !== 'undefined') {
                                        window.location.href = '/kesiswaan/menu/siswa';
                                    }
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Transaksi Siswa Terbaru - Enhanced */}
            <div className="col-12">
                <div className="card shadow-2" style={{ borderRadius: '12px' }}>
                    <div className="flex justify-content-between align-items-center mb-3">
                        <div>
                            <h5 className="mb-1">Transaksi Siswa Terbaru</h5>
                            <small className="text-500">5 transaksi penempatan siswa terbaru</small>
                        </div>
                        <Button 
                            label="Lihat Semua" 
                            icon="pi pi-arrow-right" 
                            iconPos="right"
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
                            <i className="pi pi-list text-6xl text-300 mb-3"></i>
                            <p className="text-600 font-medium text-xl mb-2">Belum ada transaksi siswa</p>
                            <p className="text-500">Assign siswa ke kelas untuk memulai</p>
                            <Button 
                                label="Kelola Transaksi" 
                                icon="pi pi-plus" 
                                className="mt-3"
                                onClick={() => {
                                    if (typeof window !== 'undefined') {
                                        window.location.href = '/kesiswaan/menu/transaksi-siswa';
                                    }
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardKesiswaan;