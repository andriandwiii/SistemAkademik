/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useRef } from 'react';
import { Button } from 'primereact/button';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { InputText } from 'primereact/inputtext';
import ToastNotifier from '@/app/components/ToastNotifier';
import CustomDataTable from '@/app/components/DataTable';
import FormAbsensiSiswaModal from './components/FormAbsensiSiswa';

export default function AbsensiKelasPage() {
  const toastRef = useRef(null);

  const [records, setRecords] = useState([
    {
      id: 1,
      kelas: 'XI IPA 1',
      mapel: 'Matematika',
      jam: '07:00 - 08:30',
      catatan: 'Pertemuan pertama',
      waktuDibuat: '2025-09-29 08:00:00'
    },
    {
      id: 2,
      kelas: 'XI IPA 2',
      mapel: 'Bahasa Indonesia',
      jam: '08:45 - 10:15',
      catatan: 'materi pengantar',
      waktuDibuat: '2025-09-29 08:05:00'
    },
    {
      id: 3,
      kelas: 'XI IPS 1',
      mapel: 'Bahasa Inggris',
      jam: '10:30 - 12:00',
      catatan: 'materi dasar grammar',
      waktuDibuat: '2025-09-29 08:10:00'
    }
  ]);

  const [selectedRecord, setSelectedRecord] = useState(null);
  const [dialogMode, setDialogMode] = useState(null);
  const [globalFilter, setGlobalFilter] = useState('');

  const handleSubmit = (data) => {
    const newRecord = {
      id: Date.now(),
      kelas: data.kelas,
      mapel: data.mapel,
      jam: `${data.jamMulai.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} - ${data.jamSelesai.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`,
      catatan: data.catatan || '-',
      waktuDibuat: new Date().toLocaleString('id-ID')
    };

    setRecords((prev) => [newRecord, ...prev]);
    toastRef.current?.showToast('00', 'Absensi siswa berhasil ditambahkan');

    setDialogMode(null);
    setSelectedRecord(null);
  };

  const handleDelete = (row) => {
    confirmDialog({
      message: `Yakin ingin menghapus absensi kelas "${row.kelas}"?`,
      header: 'Konfirmasi Hapus',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Hapus',
      rejectLabel: 'Batal',
      acceptClassName: 'p-button-danger',
      accept: () => {
        setRecords((prev) => prev.filter((r) => r.id !== row.id));
        toastRef.current?.showToast('00', 'Data absensi berhasil dihapus');
      },
    });
  };

  const actionBodyTemplate = (row) => (
    <div className="flex gap-2">
      <Button
        icon="pi pi-trash"
        size="small"
        severity="danger"
        onClick={() => handleDelete(row)}
      />
    </div>
  );

  const columns = [
    { field: 'kelas', header: 'Kelas', filter: true },
    { field: 'mapel', header: 'Mata Pelajaran', filter: true },
    { field: 'jam', header: 'Jam' },
    { field: 'catatan', header: 'Catatan' },
    { field: 'waktuDibuat', header: 'Waktu Dibuat' },
    { header: 'Aksi', body: actionBodyTemplate, style: { width: '120px' } },
  ];

  return (
    <div className="card p-4">
      <h3 className="text-xl font-semibold mb-4">Absensi Kelas</h3>

      <div className="flex justify-content-end gap-3 mb-3">
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            placeholder="Cari kelas atau mata pelajaran..."
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

      <CustomDataTable
        data={records.filter((r) =>
          r.kelas.toLowerCase().includes(globalFilter.toLowerCase()) ||
          r.mapel.toLowerCase().includes(globalFilter.toLowerCase())
        )}
        columns={columns}
      />

      <ConfirmDialog />

      <FormAbsensiSiswaModal
        isOpen={dialogMode !== null}
        onClose={() => {
          setDialogMode(null);
          setSelectedRecord(null);
        }}
        onSubmit={handleSubmit}
        initialData={selectedRecord}
      />

      <ToastNotifier ref={toastRef} />
    </div>
  );
}
