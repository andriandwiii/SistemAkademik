/* eslint-disable @next/next/no-img-element */
'use client';
import { Chart } from 'primereact/chart';
import React, { useContext, useState } from 'react';
import { LayoutContext } from '../../../../layout/context/layoutcontext';
import CustomDataTable from '../../../components/DataTable';

const DashboardKesiswaan = () => {
    const { layoutConfig } = useContext(LayoutContext);

    // Summary data
    const summary = {
        totalSiswa: 120,
        totalKelas: 10,
        nilaiRata: 85,
        kehadiranRata: 95,
        pengumuman: 5
    };

    // Chart data
    const attendanceData = {
        labels: ['Hadir', 'Alpa', 'Izin'],
        datasets: [
            {
                data: [95, 3, 2],
                backgroundColor: ['#22c55e', '#ef4444', '#facc15'],
                hoverBackgroundColor: ['#16a34a', '#dc2626', '#eab308']
            }
        ]
    };

    const nilaiData = {
        labels: ['Matematika', 'B.Indonesia', 'Fisika', 'Biologi', 'Sejarah'],
        datasets: [
            {
                label: 'Nilai Rata-rata',
                backgroundColor: '#3b82f6',
                data: [88, 85, 87, 90, 82]
            }
        ]
    };

    const chartOptions = {
        plugins: { legend: { labels: { color: layoutConfig.colorScheme === 'light' ? '#495057' : '#ebedef' } } },
        scales: {
            x: { ticks: { color: layoutConfig.colorScheme === 'light' ? '#495057' : '#ebedef' } },
            y: { ticks: { color: layoutConfig.colorScheme === 'light' ? '#495057' : '#ebedef' } }
        }
    };

    // Data siswa
    const [dataSiswa] = useState([
        { nama: 'Andrian Dwi', kelas: 'XI IPA 2', kehadiran: 'Hadir', nilaiRata: 87, status: 'Aktif' },
        { nama: 'Siti Aminah', kelas: 'XI IPA 1', kehadiran: 'Izin', nilaiRata: 85, status: 'Aktif' },
        { nama: 'Budi Santoso', kelas: 'XI IPS 2', kehadiran: 'Alpa', nilaiRata: 80, status: 'Aktif' },
    ]);

    const siswaColumns = [
        { field: 'nama', header: 'Nama Siswa' },
        { field: 'kelas', header: 'Kelas' },
        { field: 'status', header: 'Status' },
        { field: 'kehadiran', header: 'Kehadiran' },
        { field: 'nilaiRata', header: 'Nilai Rata-rata' },
    ];

    // Jadwal pelajaran
    const jadwalHariIni = [
        { jam: '07:00 - 07:45', pelajaran: 'Matematika', guru: 'Bu Sari', kelas: 'XI IPA 2', ruang: 'Kelas XI IPA 2' },
        { jam: '07:50 - 08:35', pelajaran: 'Bahasa Indonesia', guru: 'Pak Budi', kelas: 'XI IPA 2', ruang: 'Kelas XI IPA 2' },
    ];

    const jadwalColumns = [
        { field: 'jam', header: 'Jam' },
        { field: 'pelajaran', header: 'Pelajaran' },
        { field: 'guru', header: 'Guru' },
        { field: 'kelas', header: 'Kelas' },
        { field: 'ruang', header: 'Ruang' },
    ];

    return (
        <div className="grid">
            {/* Summary Cards */}
            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Total Siswa</span>
                            <div className="text-900 font-medium text-xl">{summary.totalSiswa}</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-blue-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-users text-blue-500 text-xl" />
                        </div>
                    </div>
                    <span className="text-500">Seluruh kelas</span>
                </div>
            </div>

            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Jumlah Kelas</span>
                            <div className="text-900 font-medium text-xl">{summary.totalKelas}</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-green-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-building text-green-500 text-xl" />
                        </div>
                    </div>
                    <span className="text-500">Kelas aktif</span>
                </div>
            </div>

            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Nilai Rata-rata</span>
                            <div className="text-900 font-medium text-xl">{summary.nilaiRata}</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-cyan-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-star text-cyan-500 text-xl" />
                        </div>
                    </div>
                    <span className="text-500">Semester ini</span>
                </div>
            </div>

            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Kehadiran Rata-rata</span>
                            <div className="text-900 font-medium text-xl">{summary.kehadiranRata}%</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-purple-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-check-square text-purple-500 text-xl" />
                        </div>
                    </div>
                    <span className="text-500">Semua siswa</span>
                </div>
            </div>

            {/* Charts */}
            <div className="col-12 md:col-4">
                <div className="card">
                    <h5>Distribusi Kehadiran</h5>
                    <Chart type="doughnut" data={attendanceData} />
                </div>
            </div>

            <div className="col-12 md:col-7">
                <div className="card">
                    <h5>Nilai Rata-rata per Mata Pelajaran</h5>
                    <Chart type="bar" data={nilaiData} options={chartOptions} />
                </div>
            </div>

            {/* Data Siswa */}
            <div className="col-12">
                <div className="card">
                    <h5>Manajemen Data Siswa</h5>
                    <CustomDataTable data={dataSiswa} columns={siswaColumns} />
                </div>
            </div>

            {/* Jadwal Pelajaran */}
            <div className="col-12">
                <div className="card">
                    <h5>Jadwal Pelajaran Hari Ini</h5>
                    <CustomDataTable data={jadwalHariIni} columns={jadwalColumns} />
                </div>
            </div>
        </div>
    );
};

export default DashboardKesiswaan;
