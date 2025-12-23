/* eslint-disable @next/next/no-img-element */
'use client';
import { Chart } from 'primereact/chart';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import React, { useContext, useEffect, useState } from 'react';
import { LayoutContext } from '../../layout/context/layoutcontext';
import { ChartData, ChartOptions } from 'chart.js';
import { useRouter } from 'next/navigation';

const Dashboard = () => {
    const [lineOptions, setLineOptions] = useState<ChartOptions>({});
    const { layoutConfig } = useContext(LayoutContext);
    const router = useRouter();

    // Data Grafik Presensi (First: Kehadiran, Second: Izin/Sakit)
    const attendanceData: ChartData = {
        labels: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
        datasets: [
            {
                label: 'Siswa Hadir',
                data: [98, 95, 99, 92, 85, 90],
                fill: false,
                backgroundColor: '#2f4860',
                borderColor: '#2f4860',
                tension: 0.4
            },
            {
                label: 'Izin/Sakit',
                data: [2, 5, 1, 8, 15, 10],
                fill: false,
                backgroundColor: '#00bb7e',
                borderColor: '#00bb7e',
                tension: 0.4
            }
        ]
    };

    const applyTheme = (isDark: boolean) => {
        const textColor = isDark ? '#ebedef' : '#495057';
        const gridColor = isDark ? 'rgba(160, 167, 181, .3)' : '#ebedef';

        const options: ChartOptions = {
            plugins: { legend: { labels: { color: textColor } } },
            scales: {
                x: { ticks: { color: textColor }, grid: { color: gridColor } },
                y: { ticks: { color: textColor }, grid: { color: gridColor } }
            }
        };
        setLineOptions(options);
    };

    useEffect(() => {
        applyTheme(layoutConfig.colorScheme === 'dark');
    }, [layoutConfig.colorScheme]);

    return (
        <div className="grid">
            {/* --- SEKSI HEADER / LANDING ACCESS --- */}
            <div className="col-12">
                <div className="card flex flex-column md:flex-row align-items-center justify-content-between" 
                     style={{ borderRadius: '1rem', background: 'linear-gradient(90deg, rgba(33, 150, 243, 0.1) 0%, rgba(33, 150, 243, 0) 100%)' }}>
                    <div className="p-3">
                        <h2 className="text-900 font-bold mb-2">Selamat Datang di SIAKAD Digital</h2>
                        <p className="text-600 m-0">Portal Akademik Terpadu SMK Negeri 1 Kota - Pantau nilai dan kehadiran lebih mudah.</p>
                    </div>
                    <div className="p-3">
                        <Button label="Login SISWA / GURU" icon="pi pi-sign-in" className="p-button-raised" 
                                onClick={() => router.push('/auth/login')} />
                    </div>
                </div>
            </div>

            {/* --- STATS CARDS --- */}
            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Total Siswa</span>
                            <div className="text-900 font-medium text-xl">1.250</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-blue-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-users text-blue-500 text-xl" />
                        </div>
                    </div>
                    <span className="text-green-500 font-medium">Aktif </span>
                    <span className="text-500">Tahun Ajaran 2024/2025</span>
                </div>
            </div>
            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Guru & Staf</span>
                            <div className="text-900 font-medium text-xl">85</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-orange-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-user-edit text-orange-500 text-xl" />
                        </div>
                    </div>
                    <span className="text-green-500 font-medium">10 </span>
                    <span className="text-500">Hadir Hari Ini</span>
                </div>
            </div>
            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Mata Pelajaran</span>
                            <div className="text-900 font-medium text-xl">42</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-cyan-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-book text-cyan-500 text-xl" />
                        </div>
                    </div>
                    <span className="text-green-500 font-medium">12 </span>
                    <span className="text-500">Ujian Berlangsung</span>
                </div>
            </div>
            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Pengumuman</span>
                            <div className="text-900 font-medium text-xl">3 Baru</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-purple-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-megaphone text-purple-500 text-xl" />
                        </div>
                    </div>
                    <span className="text-green-500 font-medium">Cek </span>
                    <span className="text-500">Informasi terbaru</span>
                </div>
            </div>

            {/* --- CHARTS & TABLES --- */}
            <div className="col-12 lg:col-8">
                <div className="card">
                    <h5>Statistik Kehadiran Siswa (Minggu Ini)</h5>
                    <Chart type="line" data={attendanceData} options={lineOptions} />
                </div>
            </div>

            <div className="col-12 lg:col-4">
                <div className="card">
                    <h5>Agenda Sekolah</h5>
                    <ul className="list-none p-0 m-0">
                        <li className="flex flex-column md:flex-row md:align-items-center md:justify-content-between mb-4">
                            <div>
                                <span className="text-900 font-medium mr-2 mb-1 md:mb-0">Ujian Tengah Semester</span>
                                <div className="mt-1 text-600">Mulai: 25 Okt 2024</div>
                            </div>
                            <div className="mt-2 md:mt-0 flex align-items-center">
                                <i className="pi pi-calendar text-blue-500 mr-2"></i>
                            </div>
                        </li>
                        <li className="flex flex-column md:flex-row md:align-items-center md:justify-content-between mb-4">
                            <div>
                                <span className="text-900 font-medium mr-2 mb-1 md:mb-0">Rapat Pleno Komite</span>
                                <div className="mt-1 text-600">Mulai: 30 Okt 2024</div>
                            </div>
                            <div className="mt-2 md:mt-0 flex align-items-center">
                                <i className="pi pi-calendar text-orange-500 mr-2"></i>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="col-12">
                <div className="card">
                    <h5>Daftar Kelas & Wali Kelas</h5>
                    <DataTable value={[]} emptyMessage="Data kelas tidak ditemukan.">
                        <Column field="kelas" header="Kelas" />
                        <Column field="wali" header="Wali Kelas" />
                        <Column field="jumlahSiswa" header="Jumlah Siswa" />
                        <Column field="status" header="Status" />
                    </DataTable>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;