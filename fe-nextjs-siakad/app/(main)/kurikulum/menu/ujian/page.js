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

const DashboardUjian = () => {
    const { layoutConfig } = useContext(LayoutContext);
    const toast = useRef(null);

    // --- Contoh data ujian (dummy) ---
    const [exams, setExams] = useState([
        { id: 1, no: 1, kodeUjian: 'UAS-001', namaUjian: 'UAS Matematika', paketKeahlian: 'MIPA', kelas: 'X IPA 1', tanggal: '2025-12-15', waktu: '08:00 - 10:00' },
        { id: 2, no: 2, kodeUjian: 'PTS-002', namaUjian: 'PTS Sejarah', paketKeahlian: 'IPS', kelas: 'XI IPS 2', tanggal: '2025-10-20', waktu: '10:30 - 12:00' },
        { id: 3, no: 3, kodeUjian: 'UTS-003', namaUjian: 'UTS Fisika', paketKeahlian: 'MIPA', kelas: 'XII IPA 3', tanggal: '2025-10-22', waktu: '13:00 - 14:30' },
        { id: 4, no: 4, kodeUjian: 'UAS-004', namaUjian: 'UAS Biologi', paketKeahlian: 'MIPA', kelas: 'X IPA 1', tanggal: '2025-12-16', waktu: '08:00 - 10:00' },
        { id: 5, no: 5, kodeUjian: 'PTS-005', namaUjian: 'PTS Geografi', paketKeahlian: 'IPS', kelas: 'XI IPS 1', tanggal: '2025-10-21', waktu: '08:00 - 09:30' },
    ]);

    // Filter / search
    const [globalFilter, setGlobalFilter] = useState('');
    const [specializationFilter, setSpecializationFilter] = useState(null);

    // Filtered data based on dropdown selection
    const [filteredExams, setFilteredExams] = useState(exams);

    // Get unique specialization options from data
    const specializationOptions = ['Semua Paket Keahlian', ...new Set(exams.map(item => item.paketKeahlian))];

    // Apply filter whenever specialization selection changes
    useEffect(() => {
        if (specializationFilter && specializationFilter !== 'Semua Paket Keahlian') {
            setFilteredExams(exams.filter(e => e.paketKeahlian === specializationFilter));
        } else {
            setFilteredExams(exams);
        }
    }, [specializationFilter, exams]);


    // Export CSV helper
    const exportCSV = (rows, filename = 'jadwal_ujian.csv') => {
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
    const handleDeleteExam = (rowData) => {
        confirmDialog({
            message: `Hapus jadwal ujian ${rowData.namaUjian} di kelas ${rowData.kelas}?`,
            header: 'Konfirmasi Hapus',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                setExams((prev) => prev.filter((e) => e.id !== rowData.id));
                toast.current?.show({ severity: 'success', summary: 'Dihapus', detail: 'Jadwal ujian berhasil dihapus' });
            },
        });
    };

    const actionTemplate = (rowData) => (
        <div className="flex gap-2">
            <Button icon="pi pi-pencil" size="small" severity="warning" onClick={() => toast.current?.show({ severity: 'info', summary: 'Edit', detail: `Implementasi edit untuk ID ${rowData.id}` })} />
            <Button icon="pi pi-trash" size="small" severity="danger" onClick={() => handleDeleteExam(rowData)} />
        </div>
    );

    // Kolom untuk DataTable
    const examColumns = [
        { field: 'no', header: 'No.', style: { width: '50px' } },
        { field: 'kodeUjian', header: 'Kode Ujian' },
        { field: 'namaUjian', header: 'Nama Ujian' },
        { field: 'paketKeahlian', header: 'Paket Keahlian' },
        { field: 'kelas', header: 'Kelas' },
        { field: 'tanggal', header: 'Tanggal' },
        { field: 'waktu', header: 'Waktu' },
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
                            <Button label="Tambah Ujian" icon="pi pi-plus" onClick={() => toast.current?.show({ severity: 'info', summary: 'Tambah', detail: 'Form tambah ujian akan muncul di sini' })} />
                            <Button label="Export CSV" icon="pi pi-file" onClick={() => exportCSV(filteredExams, 'jadwal_ujian.csv')} />
                            <Button label="Cetak Jadwal" icon="pi pi-print" onClick={handlePrintSchedule} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabel Jadwal Ujian */}
            <div className="col-12">
                <div className="card">
                    <h5>Jadwal Ujian</h5>
                    {useCustom ? (
                        <CustomDataTable data={filteredExams} loading={false} columns={examColumns} />
                    ) : (
                        <DataTable value={filteredExams} paginator rows={10} className="text-sm" globalFilter={globalFilter}>
                            <Column field="no" header="No." sortable />
                            <Column field="kodeUjian" header="Kode Ujian" sortable />
                            <Column field="namaUjian" header="Nama Ujian" sortable />
                            <Column field="paketKeahlian" header="Paket Keahlian" sortable />
                            <Column field="kelas" header="Kelas" sortable />
                            <Column field="tanggal" header="Tanggal" sortable />
                            <Column field="waktu" header="Waktu" sortable />
                            <Column header="Aksi" body={actionTemplate} style={{ width: '120px' }} />
                        </DataTable>
                    )}
                </div>
            </div>

            <ConfirmDialog />
        </div>
    );
};

export default DashboardUjian;
