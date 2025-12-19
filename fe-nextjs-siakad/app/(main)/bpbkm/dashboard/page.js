'use client';

import React, { useContext, useRef, useState, useEffect } from 'react';
import { LayoutContext } from '../../../../layout/context/layoutcontext';
import { Chart } from 'primereact/chart';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Calendar } from 'primereact/calendar';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const DashboardBPBK = () => {
    const { layoutConfig } = useContext(LayoutContext);
    const toast = useRef(null);

    const [absensiHariIni, setAbsensiHariIni] = useState([]);
    const [statistikHarian, setStatistikHarian] = useState({ HADIR: 0, ALPA: 0, IZIN: 0, SAKIT: 0, MEMBOLOS: 0 });
    const [loading, setLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());

    const fetchDataDashboard = async (date) => {
        setLoading(true);
        const token = localStorage.getItem('token');
        const formattedDate = date.toISOString().split('T')[0];

        try {
            const res = await axios.get(`${API_URL}/laporan-absensi/dashboard-bk?tanggal=${formattedDate}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const { statistik_harian, detail_absensi } = res.data.data;

            setAbsensiHariIni(detail_absensi || []);

            const harianObj = { HADIR: 0, ALPA: 0, IZIN: 0, SAKIT: 0, MEMBOLOS: 0 };
            if (statistik_harian) {
                statistik_harian.forEach(item => {
                    harianObj[item.STATUS] = parseInt(item.TOTAL);
                });
            }
            setStatistikHarian(harianObj);

        } catch (error) {
            console.error("Error fetching dashboard:", error);
            toast.current?.show({ 
                severity: 'error', 
                summary: 'Gagal Memuat Data', 
                detail: 'Cek koneksi server atau token anda' 
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDataDashboard(selectedDate);
    }, [selectedDate]);

    const getStatusSeverity = (status) => {
        switch (status) {
            case 'ALPA': return 'danger';
            case 'MEMBOLOS': return 'warning';
            case 'IZIN': return 'info';
            case 'SAKIT': return 'success';
            default: return null;
        }
    };

    const pieData = {
        labels: ['Hadir', 'Alpa', 'Izin', 'Sakit', 'Bolos'],
        datasets: [{
            data: [statistikHarian.HADIR, statistikHarian.ALPA, statistikHarian.IZIN, statistikHarian.SAKIT, statistikHarian.MEMBOLOS],
            backgroundColor: ['#10b981', '#ef4444', '#3b82f6', '#f59e0b', '#7c3aed'],
        }],
    };

    const chartOptions = {
        plugins: {
            legend: { position: 'bottom', labels: { color: layoutConfig.colorScheme === 'light' ? '#495057' : '#ebedef' } }
        },
        maintainAspectRatio: false
    };

    return (
        <div className="grid">
            <Toast ref={toast} />

            <div className="col-12 flex flex-column md:flex-row align-items-center justify-content-between mb-3">
                <h4 className="m-0">Dashboard Pemantauan Siswa</h4>
                <div className="p-inputgroup flex-1 md:flex-none" style={{ width: '250px' }}>
                    <span className="p-inputgroup-addon bg-primary border-primary">
                        <i className="pi pi-calendar"></i>
                    </span>
                    <Calendar 
                        value={selectedDate} 
                        onChange={(e) => setSelectedDate(e.value)} 
                        dateFormat="yy-mm-dd" 
                        showIcon={false} 
                        placeholder="Pilih Tanggal"
                    />
                </div>
            </div>

            {/* Stats Cards */}
            <div className="col-12 lg:col-3">
                <div className="card mb-0 shadow-2 border-left-3 border-red-500">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-2">Total Alpa</span>
                            <div className="text-900 font-bold text-xl">{statistikHarian.ALPA}</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-red-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-user-times text-red-500 text-xl" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="col-12 lg:col-3">
                <div className="card mb-0 shadow-2 border-left-3 border-purple-500">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-2">Membolos</span>
                            <div className="text-900 font-bold text-xl">{statistikHarian.MEMBOLOS}</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-purple-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-directions text-purple-500 text-xl" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="col-12 lg:col-3">
                <div className="card mb-0 shadow-2 border-left-3 border-blue-500">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-2">Izin & Sakit</span>
                            <div className="text-900 font-bold text-xl">{statistikHarian.IZIN + statistikHarian.SAKIT}</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-blue-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-info-circle text-blue-500 text-xl" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="col-12 lg:col-3">
                <div className="card mb-0 shadow-2 border-left-3 border-green-500">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-2">Persentase Hadir</span>
                            <div className="text-900 font-bold text-xl">
                                {Math.round((statistikHarian.HADIR / (Object.values(statistikHarian).reduce((a, b) => a + b, 0) || 1)) * 100)}%
                            </div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-green-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-check-circle text-green-500 text-xl" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="col-12 xl:col-4">
                <div className="card">
                    <h5>Status Absensi</h5>
                    <div style={{ height: '300px' }}>
                        <Chart type="doughnut" data={pieData} options={chartOptions} />
                    </div>
                </div>
            </div>

            <div className="col-12 xl:col-8">
                <div className="card">
                    <div className="flex align-items-center justify-content-between mb-4">
                        <h5>Daftar Ketidakhadiran Siswa</h5>
                        <Button icon="pi pi-refresh" rounded text onClick={() => fetchDataDashboard(selectedDate)} loading={loading} />
                    </div>
                    <DataTable 
                        value={absensiHariIni} 
                        rows={6} 
                        paginator 
                        responsiveLayout="scroll" 
                        loading={loading}
                        emptyMessage="Semua siswa hadir pada tanggal ini."
                    >
                        <Column field="NIS" header="NIS" style={{ width: '20%' }} />
                        <Column field="NAMA" header="Nama Siswa" style={{ width: '40%' }} />
                        <Column field="KELAS_ID" header="Kelas" style={{ width: '20%' }} />
                        <Column 
                            field="STATUS" 
                            header="Status" 
                            body={(row) => <Tag severity={getStatusSeverity(row.STATUS)} value={row.STATUS} />} 
                            style={{ width: '20%' }} 
                        />
                    </DataTable>
                </div>
            </div>
        </div>
    );
};

export default DashboardBPBK;