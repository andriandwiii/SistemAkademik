/* eslint-disable @next/next/no-img-element */
'use client';

import { Chart } from 'primereact/chart';
import React, { useContext } from 'react';
import { LayoutContext } from '../../../../layout/context/layoutcontext';
import CustomDataTable from '../../../components/DataTable'; // ✅ pakai CustomDataTable

const DashboardAdminWeb = () => {
    const { layoutConfig } = useContext(LayoutContext);

    // =========================
    // Contoh data sekolah
    // =========================
    const sekolahData = {
        nama: 'SMP Negeri 1 Surakarta',
        alamat: 'Jl. Slamet Riyadi No. 123',
        jumlahSiswa: 320,
        jumlahGuru: 25,
        aset: { komputer: 50, meja: 120, kursi: 120 }
    };

    // Chart: Kehadiran (Pie/Doughnut)
    const attendanceData = {
        labels: ['Hadir', 'Alpa', 'Izin'],
        datasets: [
            {
                data: [85, 10, 5],
                backgroundColor: ['#22c55e', '#ef4444', '#facc15'],
                hoverBackgroundColor: ['#16a34a', '#dc2626', '#eab308']
            }
        ]
    };

    // Chart: Nilai rata-rata per mapel (Bar)
    const nilaiData = {
        labels: ['Matematika', 'B.Indonesia', 'Fisika', 'Biologi', 'Sejarah'],
        datasets: [
            {
                label: 'Nilai',
                backgroundColor: '#3b82f6',
                data: [90, 85, 88, 92, 80]
            }
        ]
    };

    const chartOptions = {
        plugins: {
            legend: {
                labels: {
                    color: layoutConfig.colorScheme === 'light' ? '#495057' : '#ebedef'
                }
            }
        },
        scales: {
            x: { ticks: { color: layoutConfig.colorScheme === 'light' ? '#495057' : '#ebedef' } },
            y: { ticks: { color: layoutConfig.colorScheme === 'light' ? '#495057' : '#ebedef' } }
        }
    };

    // Contoh data nilai & kehadiran hari ini
    const siswaHariIni = [
        { pelajaran: 'Matematika', status: 'Hadir', nilai: 90 },
        { pelajaran: 'Bahasa Indonesia', status: 'Hadir', nilai: 85 }
    ];

    const siswaHariIniColumns = [
        { field: 'pelajaran', header: 'Pelajaran' },
        { field: 'status', header: 'Kehadiran' },
        { field: 'nilai', header: 'Nilai' }
    ];

    // Contoh jadwal pelajaran
    const jadwalHariIni = [
        { jam: '07:00 - 07:45', pelajaran: 'Matematika', guru: 'Bu Sari', ruang: 'Kelas XI IPA 2' },
        { jam: '07:50 - 08:35', pelajaran: 'Bahasa Indonesia', guru: 'Pak Budi', ruang: 'Kelas XI IPA 2' },
        { jam: '08:45 - 09:30', pelajaran: 'Fisika', guru: 'Pak Andi', ruang: 'Lab Fisika' },
        { jam: '09:40 - 10:25', pelajaran: 'Sejarah', guru: 'Bu Ratna', ruang: 'Kelas XI IPA 2' },
        { jam: '10:35 - 11:20', pelajaran: 'Biologi', guru: 'Pak Yoga', ruang: 'Lab Biologi' },
        { jam: '11:30 - 12:15', pelajaran: 'Agama', guru: 'Bu Nisa', ruang: 'Kelas XI IPA 2' }
    ];

    const jadwalHariIniColumns = [
        { field: 'jam', header: 'Jam' },
        { field: 'pelajaran', header: 'Pelajaran' },
        { field: 'guru', header: 'Guru' },
        { field: 'ruang', header: 'Ruang' }
    ];

    // =========================
    // Render
    // =========================
    return (
        <div className="grid">
            {/* 4 Summary Cards */}
            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Informasi Sekolah</span>
                            <div className="text-900 font-medium text-xl">{sekolahData.nama}</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-blue-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-building text-blue-500 text-xl" />
                        </div>
                    </div>
                    <span className="text-green-500 font-medium">{sekolahData.alamat}</span>
                </div>
            </div>

            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Jumlah Siswa</span>
                            <div className="text-900 font-medium text-xl">{sekolahData.jumlahSiswa || 0}</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-green-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-users text-green-500 text-xl" />
                        </div>
                    </div>
                    <span className="text-500">Total seluruh siswa</span>
                </div>
            </div>

            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Jumlah Guru</span>
                            <div className="text-900 font-medium text-xl">{sekolahData.jumlahGuru || 0}</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-cyan-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-user-edit text-cyan-500 text-xl" />
                        </div>
                    </div>
                    <span className="text-500">Total guru & staff</span>
                </div>
            </div>

            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Jumlah Aset</span>
                            <div className="text-900 font-medium text-xl">
                                {(sekolahData.aset?.komputer || 0) + (sekolahData.aset?.meja || 0) + (sekolahData.aset?.kursi || 0)}
                            </div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-purple-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-cog text-purple-500 text-xl" />
                        </div>
                    </div>
                    <span className="text-500">Total aset fisik</span>
                </div>
            </div>

            {/* Chart Kehadiran (Pie) */}
            <div className="col-12 md:col-4">
                <div className="card">
                    <h5>Kehadiran Siswa</h5>
                    <Chart type="doughnut" data={attendanceData} />
                </div>
            </div>

            {/* Chart Nilai (Bar) */}
            <div className="col-12 md:col-7">
                <div className="card">
                    <h5>Nilai Rata-rata per Mata Pelajaran</h5>
                    <Chart type="bar" data={nilaiData} options={chartOptions} />
                </div>
            </div>

            {/* Data Kehadiran & Nilai */}
            <div className="col-12">
                <div className="card">
                    <h5>Data Kehadiran & Nilai Hari Ini</h5>
                    <CustomDataTable data={siswaHariIni} columns={siswaHariIniColumns} />
                </div>
            </div>

            {/* Jadwal Pelajaran */}
            <div className="col-12">
                <div className="card">
                    <h5>Jadwal Pelajaran Hari Ini</h5>
                    <CustomDataTable data={jadwalHariIni} columns={jadwalHariIniColumns} />
                </div>
            </div>
        </div>
    );
};

export default DashboardAdminWeb;
