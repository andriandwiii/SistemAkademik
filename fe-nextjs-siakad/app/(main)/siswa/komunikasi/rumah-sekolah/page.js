'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from 'primereact/button';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { InputText } from 'primereact/inputtext';
import { Badge } from 'primereact/badge';
import ToastNotifier from '../../../../components/ToastNotifier';
import CustomDataTable from '../../../../components/DataTable';
import FormKomunikasiRumahSekolahModal from './components/FormKomunikasiRumahSekolah';

export default function KomunikasiRumahSekolahPage() {
  const toastRef = useRef(null);

  const [records, setRecords] = useState([
    { id: 1, tujuan: 'Wali Kelas', subjek: 'Konsultasi Nilai', pesan: 'Mohon info nilai anak saya.', tanggal: '2025-10-01 08:30', status: 'Diterima', dibalas: true, _notified: true },
    { id: 2, tujuan: 'Guru BK', subjek: 'Izin Sakit Siswa', pesan: 'Anak saya izin sakit besok.', tanggal: '2025-10-02 09:15', status: 'Pending', dibalas: false },
  ]);

  const [selectedRecord, setSelectedRecord] = useState(null);
  const [dialogMode, setDialogMode] = useState(null);
  const [globalFilter, setGlobalFilter] = useState('');

  // ===== Notif otomatis untuk pesan baru dibalas =====
  useEffect(() => {
    records.forEach(r => {
      if (r.dibalas && !r._notified) {
        toastRef.current?.showToast('00', `Pesan ke "${r.tujuan}" telah dibalas`);
        r._notified = true;
      }
    });
  }, [records]);

  const handleSubmit = (data) => {
    if (!dialogMode) return;

    if (dialogMode === 'add') {
      const newData = { id: Date.now(), ...data, status: 'Pending', dibalas: false, _notified: false };
      setRecords(prev => [...prev, newData]);
      toastRef.current?.showToast('00', 'Pesan berhasil dikirim');
    }

    if (dialogMode === 'edit' && selectedRecord) {
      setRecords(prev => prev.map(r => r.id === selectedRecord.id ? { ...r, ...data } : r));
      toastRef.current?.showToast('00', 'Pesan berhasil diubah');
    }

    setDialogMode(null);
    setSelectedRecord(null);
  };

  const handleDelete = (row) => {
    confirmDialog({
      message: `Yakin ingin menghapus pesan ke "${row.tujuan}"?`,
      header: 'Konfirmasi Hapus',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Hapus',
      rejectLabel: 'Batal',
      acceptClassName: 'p-button-danger',
      accept: () => setRecords(prev => prev.filter(r => r.id !== row.id)),
    });
  };

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
      {!row.dibalas && (
        <Button icon="pi pi-pencil" size="small" severity="warning" onClick={() => {
          setDialogMode('edit');
          setSelectedRecord(row);
        }} />
      )}
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
    { header: 'Aksi', body: actionBodyTemplate, style: { width: '160px' } },
  ];

  const filteredRecords = records.filter(r => {
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

  const rowClass = (row) => row.dibalas ? 'bg-green-100 animate-pulse' : '';

  return (
    <div className="card p-4">
      <h3 className="text-xl font-semibold mb-4">Komunikasi Rumah – Sekolah</h3>

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

      <CustomDataTable data={filteredRecords} columns={columns} rowClassName={rowClass} />

      <ConfirmDialog />

      <FormKomunikasiRumahSekolahModal
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
