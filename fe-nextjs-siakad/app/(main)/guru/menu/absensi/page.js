'use client';

import { useState, useRef } from 'react';
import { Button } from 'primereact/button';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Badge } from 'primereact/badge';
import { InputText } from 'primereact/inputtext';
import ToastNotifier from '../../../../components/ToastNotifier';
import CustomDataTable from '../../../../components/DataTable';
import AbsensiGuruFormModal from './components/absenform';

export default function AbsensiGuruPage() {
  const toastRef = useRef(null);

  const [records, setRecords] = useState([
    {
      id: 1,
      tanggal: '2025-09-25',
      status: 'Hadir',
      jamMasuk: '07:05',
      jamKeluar: '16:00',
      lokasi: { lat: -7.25, lng: 112.768 },
    },
    {
      id: 2,
      tanggal: '2025-09-24',
      status: 'Hadir',
      jamMasuk: '07:00',
      jamKeluar: '14:05',
      lokasi: { lat: -7.25, lng: 112.768 },
    },
    {
      id: 3,
      tanggal: '2025-09-23',
      status: 'Izin',
      jamMasuk: '-',
      jamKeluar: '-',
      lokasi: null,
    },
  ]);

  const [selectedRecord, setSelectedRecord] = useState(null);
  const [dialogMode, setDialogMode] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState('');

  const handleSubmit = (data) => {
    if (!dialogMode) return;

    let cleanedData = { ...data };
    if (cleanedData.status !== 'Hadir') {
      cleanedData.jamMasuk = '-';
      cleanedData.jamKeluar = '-';
      cleanedData.lokasi = null;
    }

    if (dialogMode === 'add') {
      const newData = { id: Date.now(), ...cleanedData };
      setRecords((prev) => [...prev, newData]);
      toastRef.current?.showToast('00', 'Absensi berhasil ditambahkan');
    }

    setDialogMode(null);
    setSelectedRecord(null);
  };

  const handleDelete = (row) => {
    confirmDialog({
      message: `Yakin ingin menghapus absensi tanggal "${row.tanggal}"?`,
      header: 'Konfirmasi Hapus',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Hapus',
      rejectLabel: 'Batal',
      acceptClassName: 'p-button-danger',
      accept: () => {
        setRecords((prev) => prev.filter((r) => r.id !== row.id));
        toastRef.current?.showToast('00', 'Absensi berhasil dihapus');
      },
    });
  };

  const actionBodyTemplate = (row) => (
    <div className="flex gap-2">
      {row.status === 'Hadir' && row.jamKeluar === '-' && (
        <Button
          label="Check Out"
          icon="pi pi-sign-out"
          size="small"
          severity="success"
          onClick={() => {
            const now = new Date();
            const jamKeluar = now.toTimeString().slice(0, 5);
            setRecords((prev) =>
              prev.map((r) => (r.id === row.id ? { ...r, jamKeluar } : r))
            );
            toastRef.current?.showToast('00', 'Check Out berhasil');
          }}
        />
      )}
      <Button
        icon="pi pi-trash"
        size="small"
        severity="danger"
        onClick={() => handleDelete(row)}
      />
    </div>
  );

  const statusTemplate = (row) => {
    let severity = 'secondary';
    switch (row.status) {
      case 'Hadir':
        severity = 'success';
        break;
      case 'Izin':
        severity = 'info';
        break;
      case 'Sakit':
        severity = 'warning';
        break;
      case 'Alpa':
        severity = 'danger';
        break;
    }
    return <Badge value={row.status} severity={severity} />;
  };

  const lokasiTemplate = (row) => {
    if (!row.lokasi) return '-';
    if (typeof row.lokasi === 'object' && row.lokasi.lat && row.lokasi.lng) {
      return `Lat: ${row.lokasi.lat.toFixed(3)}, Lng: ${row.lokasi.lng.toFixed(3)}`;
    }
    if (typeof row.lokasi === 'string') return row.lokasi;
    return '-';
  };

  const columns = [
    { field: 'tanggal', header: 'Tanggal', filter: true },
    { field: 'status', header: 'Status', body: statusTemplate, filter: true },
    { field: 'jamMasuk', header: 'Jam Masuk' },
    { field: 'jamKeluar', header: 'Jam Keluar' },
    { field: 'lokasi', header: 'Lokasi', body: lokasiTemplate },
    { header: 'Aksi', body: actionBodyTemplate, style: { width: '200px' } },
  ];

  const filteredRecords = records.filter((r) =>
    r.tanggal.toLowerCase().includes(globalFilter.toLowerCase()) ||
    r.status.toLowerCase().includes(globalFilter.toLowerCase())
  );

  return (
    <div className="card p-4">
      <h3 className="text-xl font-semibold mb-4">Absensi Guru</h3>

      <div className="flex justify-content-end gap-3 mb-3">
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            placeholder="Cari tanggal atau status..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
        </span>
        <Button
          label="Tambah Absensi"
          icon="pi pi-plus"
          onClick={() => {
            setDialogMode('add');
            setSelectedRecord(null);
          }}
        />
      </div>

      <CustomDataTable data={filteredRecords} loading={isLoading} columns={columns} />

      <ConfirmDialog />

      <AbsensiGuruFormModal
        isOpen={dialogMode !== null}
        onClose={() => {
          setDialogMode(null);
          setSelectedRecord(null);
        }}
        record={selectedRecord}
        onSubmit={handleSubmit}
        mode={dialogMode}
      />

      <ToastNotifier ref={toastRef} />
    </div>
  );
}
