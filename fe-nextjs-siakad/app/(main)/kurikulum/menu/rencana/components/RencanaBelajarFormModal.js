'use client';

import { useState, useEffect, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';

export default function RencanaBelajarFormModal({ isOpen, onClose, record, onSubmit, mode, statusOptions }) {
  const toast = useRef(null);

  const [form, setForm] = useState({
    tanggal: null,
    kelas: '',
    mataPelajaran: '',
    materi: '',
    status: 'Terjadwal',
  });

  const kelasOptions = ['X IPA 1', 'X IPS 1', 'XI IPA 2', 'XI IPS 1', 'XII IPA 3', 'XII IPS 1'];
  const mataPelajaranOptions = ['Matematika', 'Biologi', 'Fisika', 'Sejarah', 'Geografi', 'Sosiologi', 'Kimia', 'Ekonomi'];

  useEffect(() => {
    if (record) setForm(record);
    else setForm({ tanggal: null, kelas: '', mataPelajaran: '', materi: '', status: 'Terjadwal' });
  }, [record]);

  const handleSave = () => {
    if (!form.tanggal || !form.kelas || !form.mataPelajaran || !form.materi) {
      toast.current?.show({ severity: 'warn', summary: 'Validasi', detail: 'Harap lengkapi semua field' });
      return;
    }

    onSubmit(form);
  };

  return (
    <Dialog
      header={mode === 'edit' ? 'Edit Rencana Belajar' : 'Tambah Rencana Belajar'}
      visible={isOpen}
      style={{ width: '35rem' }}
      modal
      onHide={onClose}
    >
      <Toast ref={toast} />
      <div className="p-fluid formgrid grid">
        <div className="field col-12 md:col-6">
          <label>Tanggal</label>
          <Calendar
            value={form.tanggal ? new Date(form.tanggal) : null}
            onChange={(e) => setForm({ ...form, tanggal: e.value })}
            dateFormat="dd/mm/yy"
            placeholder="Pilih Tanggal"
            showIcon
          />
        </div>

        <div className="field col-12 md:col-6">
          <label>Kelas</label>
          <Dropdown
            value={form.kelas}
            options={kelasOptions}
            onChange={(e) => setForm({ ...form, kelas: e.value })}
            placeholder="Pilih Kelas"
          />
        </div>

        <div className="field col-12 md:col-6">
          <label>Mata Pelajaran</label>
          <Dropdown
            value={form.mataPelajaran}
            options={mataPelajaranOptions}
            onChange={(e) => setForm({ ...form, mataPelajaran: e.value })}
            placeholder="Pilih Mata Pelajaran"
          />
        </div>

        <div className="field col-12 md:col-6">
          <label>Status</label>
          <Dropdown
            value={form.status}
            options={statusOptions}
            onChange={(e) => setForm({ ...form, status: e.value })}
          />
        </div>

        <div className="field col-12">
          <label>Materi</label>
          <InputText
            value={form.materi}
            onChange={(e) => setForm({ ...form, materi: e.target.value })}
            placeholder="Tuliskan materi yang akan diajarkan..."
          />
        </div>
      </div>

      <div className="flex justify-content-end gap-2 mt-4">
        <Button label="Batal" icon="pi pi-times" severity="secondary" onClick={onClose} />
        <Button label="Simpan" icon="pi pi-check" severity="success" onClick={handleSave} />
      </div>
    </Dialog>
  );
}
