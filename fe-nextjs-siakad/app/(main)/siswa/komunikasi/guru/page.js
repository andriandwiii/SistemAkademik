'use client';

import { useState, useRef } from 'react';
import { Button } from 'primereact/button';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { InputText } from 'primereact/inputtext';
import { Badge } from 'primereact/badge';
import ToastNotifier from '../../../../components/ToastNotifier';
import CustomDataTable from '../../../../components/DataTable';
import FormKomunikasiGuruKaryawanModal from './components/FormKomunikasiGuruKaryawanModal';

export default function KomunikasiGuruKaryawanPage() {
  const toastRef = useRef(null);

  // Dummy data guru/karyawan
  const contacts = [
    { label: 'Pak Budi (Matematika)', value: 1 },
    { label: 'Bu Sinta (BK)', value: 2 },
    { label: 'Pak Andi (TU)', value: 3 },
    { label: 'Bu Ratna (Keuangan)', value: 4 }
  ];

  // Data dummy pesan
  const [records, setRecords] = useState([
    {
      id: 1,
      tujuan: 'Pak Budi (Matematika)',
      subjek: 'Konsultasi Nilai',
      pesan: 'Mohon penjelasan nilai UTS anak saya.',
      tanggal: '2025-10-01 09:15',
      status: 'Diterima',
      dibalas: true
    },
    {
      id: 2,
      tujuan: 'Bu Sinta (BK)',
      subjek: 'Konseling Siswa',
      pesan: 'Minta jadwal konseling untuk kelas 10.',
      tanggal: '2025-10-02 10:30',
      status: 'Ditolak',
      dibalas: false
    },
  ]);

  const [selectedRecord, setSelectedRecord] = useState(null);
  const [dialogMode, setDialogMode] = useState(null);
  const [globalFilter, setGlobalFilter] = useState('');

  // === Fungsi submit pesan baru / edit ===
  const handleSubmit = (data) => {
    if (!dialogMode) return;

    if (dialogMode === 'add') {
      // Ambil label guru/karyawan berdasarkan value
      const selectedContact = contacts.find(c => c.label === data.tujuan || c.value === data.tujuan);
      const newData = { 
        id: Date.now(), 
        ...data,
        tujuan: selectedContact?.label || data.tujuan
      };
      setRecords((prev) => [...prev, newData]);
      toastRef.current?.showToast('00', 'Pesan berhasil dikirim');
    }

    setDialogMode(null);
    setSelectedRecord(null);
  };

  // === Hapus pesan ===
  const handleDelete = (row) => {
    confirmDialog({
      message: `Yakin ingin menghapus pesan ke "${row.tujuan}"?`,
      header: 'Konfirmasi Hapus',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Hapus',
      rejectLabel: 'Batal',
      acceptClassName: 'p-button-danger',
      accept: () => setRecords((prev) => prev.filter((r) => r.id !== row.id)),
    });
  };

  // === Badge status ===
  const statusBadge = (status) => {
    switch(status) {
      case 'Diterima': return <Badge value="Diterima" severity="success" />;
      case 'Ditolak': return <Badge value="Ditolak" severity="danger" />;
      default: return <Badge value="Pending" severity="warning" />;
    }
  };

  const replyBadge = (dibalas) =>
    dibalas ? <Badge value="Sudah Dibalas" severity="success"/> : <Badge value="Belum Dibalas" severity="warning"/>;

  const actionBodyTemplate = (row) => (
    <div className="flex gap-2">
      <Button icon="pi pi-trash" size="small" severity="danger" onClick={() => handleDelete(row)} />
    </div>
  );

  const columns = [
    { field: 'tujuan', header: 'Tujuan', filter: true },
    { field: 'subjek', header: 'Subjek', filter: true },
    { field: 'pesan', header: 'Pesan' },
    { field: 'tanggal', header: 'Tanggal' },
    { header: 'Status', body: (row) => statusBadge(row.status) },
    { header: 'Balasan', body: (row) => replyBadge(row.dibalas) },
    { header: 'Aksi', body: actionBodyTemplate, style: { width: '120px' } },
  ];

  // === Filter aman ===
  const filteredRecords = records.filter((r) => {
    const tujuan = `${r.tujuan || ''}`;
    const subjek = `${r.subjek || ''}`;
    const pesan = `${r.pesan || ''}`;
    const filter = `${globalFilter || ''}`;
    return (
      tujuan.toLowerCase().includes(filter.toLowerCase()) ||
      subjek.toLowerCase().includes(filter.toLowerCase()) ||
      pesan.toLowerCase().includes(filter.toLowerCase())
    );
  });

  return (
    <div className="card p-4">
      <h3 className="text-xl font-semibold mb-4">Komunikasi Guru/Karyawan</h3>

      <div className="flex justify-content-end gap-3 mb-3">
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            placeholder="Cari tujuan, subjek atau pesan..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
        </span>
        <Button
          label="Kirim Pesan Baru"
          icon="pi pi-plus"
          onClick={() => { setDialogMode('add'); setSelectedRecord(null); }}
        />
      </div>

      <CustomDataTable data={filteredRecords} columns={columns} />

      <ConfirmDialog />

      <FormKomunikasiGuruKaryawanModal
        isOpen={dialogMode !== null}
        onClose={() => { setDialogMode(null); setSelectedRecord(null); }}
        record={selectedRecord}
        onSubmit={handleSubmit}
        mode={dialogMode}
      />

      <ToastNotifier ref={toastRef} />
    </div>
  );
}
