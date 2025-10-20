/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useRef } from 'react';
import { Button } from 'primereact/button';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { InputText } from 'primereact/inputtext';
import ToastNotifier from '@/app/components/ToastNotifier';
import CustomDataTable from '@/app/components/DataTable';
import FormAgendaMengajarModal from './components/FormAgenda'; // pastikan path sesuai

export default function AgendaMengajarPage() {
  const toastRef = useRef(null);

  const kelasOptions = ['X IPA 1', 'X IPS 1', 'XI IPA 2', 'XI IPS 1', 'XII IPA 3', 'XII IPS 1'];
  const subjects = ['Matematika', 'Biologi', 'Fisika', 'Sejarah', 'Geografi', 'Sosiologi', 'Kimia', 'Ekonomi'];
  const statusOptions = ['Belum Dimulai', 'Selesai', 'Dibatalkan'];

  const emptyAgenda = { id: null, tanggal: null, kelas: '', mataPelajaran: '', materi: '', status: 'Belum Dimulai' };

  const [agendaList, setAgendaList] = useState([
    { id: 1, tanggal: new Date(), kelas: 'X IPA 1', mataPelajaran: 'Matematika', materi: 'Aljabar Lanjut', status: 'Selesai' },
    { id: 2, tanggal: new Date(), kelas: 'XI IPS 1', mataPelajaran: 'Ekonomi', materi: 'Pasar Modal', status: 'Belum Dimulai' },
    { id: 3, tanggal: new Date('2025-09-24'), kelas: 'XII IPA 3', mataPelajaran: 'Fisika', materi: 'Listrik Statis', status: 'Selesai' },
  ]);

  const [selectedAgenda, setSelectedAgenda] = useState(emptyAgenda);
  const [dialogMode, setDialogMode] = useState(null); // 'add' | 'edit'
  const [globalFilter, setGlobalFilter] = useState('');

  const handleSubmit = (data) => {
    let updatedList = [...agendaList];

    if (dialogMode === 'edit') {
      const index = updatedList.findIndex(a => a.id === selectedAgenda.id);
      updatedList[index] = { ...selectedAgenda, ...data };
      toastRef.current?.showToast('00', 'Agenda berhasil diperbarui!');
    } else {
      const newAgenda = { id: Date.now(), ...data };
      updatedList.push(newAgenda);
      toastRef.current?.showToast('00', 'Agenda berhasil ditambahkan!');
    }

    setAgendaList(updatedList);
    setSelectedAgenda(emptyAgenda);
    setDialogMode(null);
  };

  const handleDelete = (row) => {
    confirmDialog({
      message: `Yakin ingin menghapus agenda "${row.mataPelajaran}"?`,
      header: 'Konfirmasi Hapus',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Hapus',
      rejectLabel: 'Batal',
      acceptClassName: 'p-button-danger',
      accept: () => {
        setAgendaList(prev => prev.filter(a => a.id !== row.id));
        toastRef.current?.showToast('00', 'Agenda berhasil dihapus!');
      }
    });
  };

  const actionBodyTemplate = (row) => (
    <div className="flex gap-2">
      <Button icon="pi pi-pencil" size="small" severity="warning" onClick={() => { setSelectedAgenda(row); setDialogMode('edit'); }} />
      <Button icon="pi pi-trash" size="small" severity="danger" onClick={() => handleDelete(row)} />
    </div>
  );

  const columns = [
    { field: 'tanggal', header: 'Tanggal', body: row => row.tanggal.toLocaleDateString('id-ID'), style: { width: '120px' } },
    { field: 'kelas', header: 'Kelas' },
    { field: 'mataPelajaran', header: 'Mata Pelajaran' },
    { field: 'materi', header: 'Materi' },
    { field: 'status', header: 'Status' },
    { header: 'Aksi', body: actionBodyTemplate, style: { width: '120px' } },
  ];

  const filteredAgenda = agendaList.filter(a =>
    a.kelas.toLowerCase().includes(globalFilter.toLowerCase()) ||
    a.mataPelajaran.toLowerCase().includes(globalFilter.toLowerCase()) ||
    a.materi.toLowerCase().includes(globalFilter.toLowerCase())
  );

  return (
    <div className="card p-4">
      <h3 className="text-xl font-semibold mb-4">Agenda Mengajar</h3>

      <div className="flex justify-content-end gap-3 mb-3">
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            placeholder="Cari kelas, mata pelajaran, atau materi..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
        </span>
        <Button
          label="Tambah Agenda"
          icon="pi pi-plus"
          onClick={() => { setSelectedAgenda(emptyAgenda); setDialogMode('add'); }}
        />
      </div>

      <CustomDataTable data={filteredAgenda} columns={columns} paginator rows={10} rowsPerPageOptions={[10, 20]} />

      <FormAgendaMengajarModal
        isOpen={dialogMode !== null}
        onClose={() => { setDialogMode(null); setSelectedAgenda(emptyAgenda); }}
        onSubmit={handleSubmit}
        initialData={selectedAgenda}
      />

      <ConfirmDialog />
      <ToastNotifier ref={toastRef} />
    </div>
  );
}
