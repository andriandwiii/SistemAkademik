/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useContext, useRef, useState, useEffect } from 'react';
import { LayoutContext } from '../../../../../layout/context/layoutcontext';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import CustomDataTable from '../../../../components/DataTable';

const DashboardJadwal = () => {
    const { layoutConfig } = useContext(LayoutContext);
    const toast = useRef(null);

    // --- Contoh data jadwal (dummy) ---
    const [schedules, setSchedules] = useState([
        { id: 1, no: 1, kodeMapel: 'MAT-101', namaMapel: 'Matematika', paketKeahlian: 'MIPA', kelompok: 'A', kelas: 'X IPA 1', guru: 'Budi Santoso', jamMengajar: '08:00 - 09:30' },
        { id: 2, no: 2, kodeMapel: 'SEJ-102', namaMapel: 'Sejarah', paketKeahlian: 'IPS', kelompok: 'B', kelas: 'XI IPS 2', guru: 'Siti Rahmawati', jamMengajar: '09:45 - 11:15' },
        { id: 3, no: 3, kodeMapel: 'FIS-103', namaMapel: 'Fisika', paketKeahlian: 'MIPA', kelompok: 'A', kelas: 'XII IPA 3', guru: 'Agus Wijaya', jamMengajar: '11:30 - 13:00' },
        { id: 4, no: 4, kodeMapel: 'BIO-104', namaMapel: 'Biologi', paketKeahlian: 'MIPA', kelompok: 'A', kelas: 'X IPA 1', guru: 'Indah Lestari', jamMengajar: '13:30 - 15:00' },
        { id: 5, no: 5, kodeMapel: 'GEO-105', namaMapel: 'Geografi', paketKeahlian: 'IPS', kelompok: 'B', kelas: 'XI IPS 1', guru: 'Siti Rahmawati', jamMengajar: '08:00 - 09:30' },
        { id: 6, no: 6, kodeMapel: 'MTK-106', namaMapel: 'Matematika', paketKeahlian: 'MIPA', kelompok: 'C', kelas: 'X MIPA 2', guru: 'Budi Santoso', jamMengajar: '10:00 - 11:30' },
    ]);

    // Filter / search
    const [globalFilter, setGlobalFilter] = useState('');
    const [specializationFilter, setSpecializationFilter] = useState(null);

    // Filtered data based on dropdown selection
    const [filteredSchedules, setFilteredSchedules] = useState(schedules);

    // Get unique specialization options from data
    const specializationOptions = ['Semua Paket Keahlian', ...new Set(schedules.map(item => item.paketKeahlian))];

    // Apply filter whenever specialization selection changes
    useEffect(() => {
        if (specializationFilter && specializationFilter !== 'Semua Paket Keahlian') {
            setFilteredSchedules(schedules.filter(s => s.paketKeahlian === specializationFilter));
        } else {
            setFilteredSchedules(schedules);
        }
    }, [specializationFilter, schedules]);


    // Export CSV helper
    const exportCSV = (rows, filename = 'jadwal.csv') => {
        if (!rows || rows.length === 0) {
            toast.current?.show({ severity: 'warn', summary: 'Kosong', detail: 'Tidak ada data untuk diexport' });
            return;
        }

        const keys = Object.keys(rows[0]);
        const csv = [
            keys.join(','),
            ...rows.map((r) => keys.map((k) => `"${(r[k] ?? '').toString().replace(/"/g, '""')}"`).join(',')),
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.setAttribute('download', filename);
        link.click();
        URL.revokeObjectURL(url);
    };

    // Cetak jadwal (print window)
    const handlePrintSchedule = () => {
        window.print();
    };

    // Actions pada jadwal
    const handleDeleteSchedule = (rowData) => {
        confirmDialog({
            message: `Hapus jadwal ${rowData.namaMapel} di kelas ${rowData.kelas}?`,
            header: 'Konfirmasi Hapus',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                setSchedules((prev) => prev.filter((s) => s.id !== rowData.id));
                toast.current?.show({ severity: 'success', summary: 'Dihapus', detail: 'Jadwal berhasil dihapus' });
            },
        });
    };

    const actionTemplate = (rowData) => (
        <div className="flex gap-2">
            <Button icon="pi pi-pencil" size="small" severity="warning" onClick={() => toast.current?.show({ severity: 'info', summary: 'Edit', detail: `Implementasi edit untuk ID ${rowData.id}` })} />
            <Button icon="pi pi-trash" size="small" severity="danger" onClick={() => handleDeleteSchedule(rowData)} />
        </div>
    );

    // Kolom untuk DataTable
    const scheduleColumns = [
        { field: 'no', header: 'No.', style: { width: '50px' } },
        { field: 'kodeMapel', header: 'Kode Mapel' },
        { field: 'namaMapel', header: 'Nama Mapel' },
        { field: 'paketKeahlian', header: 'Paket Keahlian' },
        { field: 'kelompok', header: 'Kelompok' },
        { field: 'kelas', header: 'Kelas' },
        { field: 'guru', header: 'Guru' },
        { field: 'jamMengajar', header: 'Jam Mengajar' },
        { header: 'Aksi', body: actionTemplate, style: { width: '120px' } },
    ];

    // Cek apakah CustomDataTable tersedia
    const useCustom = !!(typeof CustomDataTable !== 'undefined');

    return (
        <div className="grid">
            <Toast ref={toast} />

            <div className="col-12">
                <div className="card mb-2">
                    <div className="flex align-items-center justify-content-between">
                        <div className="flex align-items-center gap-3">
                            <InputText placeholder="Cari..." value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} />
                            <Dropdown
                                value={specializationFilter}
                                options={specializationOptions}
                                onChange={(e) => setSpecializationFilter(e.value)}
                                placeholder="Pilih Paket Keahlian"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button label="Tambah Jadwal" icon="pi pi-plus" onClick={() => toast.current?.show({ severity: 'info', summary: 'Tambah', detail: 'Form tambah jadwal akan muncul di sini' })} />
                            <Button label="Import Mapel" icon="pi pi-upload" onClick={() => toast.current?.show({ severity: 'info', summary: 'Import', detail: 'Fungsionalitas import akan diimplementasikan' })} />
                            <Button label="Export CSV" icon="pi pi-file" onClick={() => exportCSV(filteredSchedules, 'jadwal.csv')} />
                            <Button label="Cetak Jadwal" icon="pi pi-print" onClick={handlePrintSchedule} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabel Jadwal */}
            <div className="col-12">
                <div className="card">
                    <h5>Jadwal Pelajaran</h5>
                    {useCustom ? (
                        <CustomDataTable data={filteredSchedules} loading={false} columns={scheduleColumns} />
                    ) : (
                        <DataTable value={filteredSchedules} paginator rows={10} className="text-sm" globalFilter={globalFilter}>
                            <Column field="no" header="No." sortable />
                            <Column field="kodeMapel" header="Kode Mapel" sortable />
                            <Column field="namaMapel" header="Nama Mapel" sortable />
                            <Column field="paketKeahlian" header="Paket Keahlian" sortable />
                            <Column field="kelompok" header="Kelompok" sortable />
                            <Column field="kelas" header="Kelas" sortable />
                            <Column field="guru" header="Guru" sortable />
                            <Column field="jamMengajar" header="Jam Mengajar" sortable />
                            <Column header="Aksi" body={actionTemplate} style={{ width: '120px' }} />
                        </DataTable>
                    )}
                </div>
            </div>

            <ConfirmDialog />
        </div>
    );
};

export default DashboardJadwal;
