/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useContext, useRef, useEffect, useState } from 'react';
import { LayoutContext } from '@/layout/context/layoutcontext';
import { Chart } from 'primereact/chart';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import CustomDataTable from '@/app/components/DataTable';
import ToastNotifier from '@/app/components/ToastNotifier';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

const DashboardGuru = () => {
    const { layoutConfig } = useContext(LayoutContext);
    const toastRef = useRef(null);

    // --- Data Dummy ---
    const summary = {
        totalKelasDiajar: 5,
        totalSiswaDiajar: 150,
        jadwalHariIni: 3,
        mataPelajaranDiampu: 'Matematika'
    };

    const agenda = [
        { id: 1, jam: '08:00 - 09:30', kelas: 'X IPA 1', mataPelajaran: 'Matematika', status: 'Selesai' },
        { id: 2, jam: '09:45 - 11:15', kelas: 'XI IPS 2', mataPelajaran: 'Matematika', status: 'Selesai' },
        { id: 3, jam: '13:00 - 14:30', kelas: 'XII IPA 3', mataPelajaran: 'Matematika', status: 'Belum Dimulai' },
    ];

    const attendanceData = {
        labels: ['X IPA 1', 'XI IPS 2', 'XII IPA 3'],
        datasets: [
            {
                label: 'Hadir',
                backgroundColor: '#42A5F5',
                data: [30, 28, 25]
            },
            {
                label: 'Sakit',
                backgroundColor: '#FFC107',
                data: [1, 2, 0]
            },
            {
                label: 'Izin',
                backgroundColor: '#66BB6A',
                data: [1, 0, 1]
            },
            {
                label: 'Alpha',
                backgroundColor: '#EF5350',
                data: [0, 1, 2]
            }
        ]
    };

    const barChartOptions = {
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

    // --- State & Fungsi ---
    const [agendaTable, setAgendaTable] = useState(agenda);
    const [selectedAgenda, setSelectedAgenda] = useState(null);

    const actionTemplate = (rowData) => (
        <div className="flex gap-2">
            <Button label="Buka Absen" size="small" icon="pi pi-user-plus" severity="info" onClick={() => {
                toastRef.current?.showToast('00', `Buka form absensi untuk kelas ${rowData.kelas}`);
            }} />
        </div>
    );
    
    const statusTemplate = (rowData) => {
        const severity = rowData.status === 'Selesai' ? 'success' : 'warning';
        return <span className={`bg-${severity}-100 text-${severity}-600 font-bold px-2 py-1 border-round-sm text-xs`}>{rowData.status}</span>;
    };

    const agendaColumns = [
        { field: 'jam', header: 'Jam Mengajar' },
        { field: 'kelas', header: 'Kelas' },
        { field: 'mataPelajaran', header: 'Mata Pelajaran' },
        { field: 'status', header: 'Status', body: statusTemplate },
        { header: 'Aksi', body: actionTemplate, style: { width: '120px' } },
    ];

    const useCustom = !!(typeof CustomDataTable !== 'undefined');
    
    return (
        <div className="grid">
            <ToastNotifier ref={toastRef} />

            {/* Ringkasan */}
            <div className="col-12 lg:col-6 xl:col-4">
                <div className="card mb-2">
                    <div className="flex justify-content-between">
                        <div>
                            <span className="block text-500 font-medium mb-2">Mata Pelajaran Diampu</span>
                            <div className="text-900 font-medium text-xl">{summary.mataPelajaranDiampu}</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-green-100 border-round" style={{ width: '3rem', height: '3rem' }}>
                            <i className="pi pi-book text-green-600 text-xl" />
                        </div>
                    </div>
                    <small className="text-500">Mata pelajaran yang Anda ajarkan</small>
                </div>
            </div>

            <div className="col-12 lg:col-6 xl:col-4">
                <div className="card mb-2">
                    <div className="flex justify-content-between">
                        <div>
                            <span className="block text-500 font-medium mb-2">Total Kelas Diajar</span>
                            <div className="text-900 font-medium text-xl">{summary.totalKelasDiajar}</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-blue-100 border-round" style={{ width: '3rem', height: '3rem' }}>
                            <i className="pi pi-building text-blue-600 text-xl" />
                        </div>
                    </div>
                    <small className="text-500">Jumlah kelas yang Anda ampu</small>
                </div>
            </div>

            <div className="col-12 lg:col-6 xl:col-4">
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
                    <small className="text-500">Agenda mengajar Anda hari ini</small>
                </div>
            </div>

            {/* Agenda Mengajar */}
            <div className="col-12 md:col-7">
                <div className="card">
                    <h5>Agenda Mengajar Hari Ini</h5>
                    <CustomDataTable
                        data={agendaTable}
                        columns={agendaColumns}
                        paginator
                        rows={5}
                        rowsPerPageOptions={[5, 10, 20]}
                    />
                </div>
            </div>

            {/* Statistik Absensi */}
            <div className="col-12 md:col-5">
                <div className="card flex flex-column align-items-center">
                    <h5>Statistik Absensi Siswa per Kelas</h5>
                    <Chart type="bar" data={attendanceData} options={barChartOptions} className="w-full h-20rem" />
                    <small className="text-500 mt-3">Grafik kehadiran siswa di beberapa kelas</small>
                </div>
            </div>

            {/* Riwayat Absensi */}
            <div className="col-12">
                <div className="card">
                    <div className="flex justify-content-between align-items-center mb-3">
                        <h5>Riwayat Absensi</h5>
                        <Button label="Lihat Riwayat Lengkap" icon="pi pi-search" outlined onClick={() => toastRef.current?.showToast('00', 'Buka halaman riwayat absensi')} />
                    </div>
                    <p className="text-500 text-sm">Lihat rekap absensi harian Anda dan kelas yang Anda ajar.</p>
                </div>
            </div>
        </div>
    );
};

export default DashboardGuru;
