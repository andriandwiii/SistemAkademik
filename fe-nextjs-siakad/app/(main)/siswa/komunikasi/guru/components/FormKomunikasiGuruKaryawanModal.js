'use client';

import { useState, useEffect, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';

export default function FormKomunikasiGuruKaryawanModal({ isOpen, onClose, record, onSubmit, mode }) {
  const toast = useRef(null);

  const [form, setForm] = useState({
    tujuan: null,
    subjek: '',
    pesan: '',
    status: 'Pending', // default status
    dibalas: false,   // default balasan
  });

  const contacts = [
    { label: 'Pak Budi (Matematika)', value: 1 },
    { label: 'Bu Sinta (BK)', value: 2 },
    { label: 'Pak Andi (TU)', value: 3 },
    { label: 'Bu Ratna (Keuangan)', value: 4 }
  ];

  useEffect(() => {
    if (record) {
      setForm({
        tujuan: record.tujuan || null,
        subjek: record.subjek || '',
        pesan: record.pesan || '',
        status: record.status || 'Pending',
        dibalas: record.dibalas || false,
      });
    } else {
      setForm({
        tujuan: null,
        subjek: '',
        pesan: '',
        status: 'Pending',
        dibalas: false,
      });
    }
  }, [record]);

  const handleSave = () => {
    if (!form.tujuan) {
      toast.current?.show({ severity: 'warn', summary: 'Validasi', detail: 'Tujuan wajib dipilih' });
      return;
    }
    if (!form.subjek.trim()) {
      toast.current?.show({ severity: 'warn', summary: 'Validasi', detail: 'Subjek wajib diisi' });
      return;
    }
    if (!form.pesan.trim()) {
      toast.current?.show({ severity: 'warn', summary: 'Validasi', detail: 'Pesan wajib diisi' });
      return;
    }

    const data = {
      ...form,
      tanggal: new Date().toLocaleString(),
    };

    onSubmit(data);

    toast.current?.show({ severity: 'success', summary: 'Berhasil', detail: 'Pesan berhasil dikirim' });
    setForm({ tujuan: null, subjek: '', pesan: '', status: 'Pending', dibalas: false });
    onClose();
  };

  return (
    <Dialog
      header={mode === 'edit' ? 'Edit Pesan' : 'Kirim Pesan Guru/Karyawan'}
      visible={isOpen}
      style={{ width: '30rem' }}
      modal
      onHide={onClose}
    >
      <Toast ref={toast} />

      <div className="flex flex-column gap-3">
        <div>
          <label className="block mb-1">Tujuan</label>
          <Dropdown
            value={form.tujuan}
            options={contacts}
            onChange={(e) => setForm({ ...form, tujuan: e.value })}
            className="w-full"
            placeholder="Pilih Guru/Karyawan"
          />
        </div>

        <div>
          <label className="block mb-1">Subjek</label>
          <InputText
            value={form.subjek}
            onChange={(e) => setForm({ ...form, subjek: e.target.value })}
            className="w-full"
            placeholder="Masukkan subjek"
          />
        </div>

        <div>
          <label className="block mb-1">Pesan</label>
          <InputTextarea
            rows={5}
            value={form.pesan}
            onChange={(e) => setForm({ ...form, pesan: e.target.value })}
            className="w-full"
            placeholder="Tulis pesan anda..."
          />
        </div>
      </div>

      <div className="flex justify-content-end gap-2 mt-4">
        <Button label="Batal" icon="pi pi-times" severity="secondary" onClick={onClose} />
        <Button label="Kirim" icon="pi pi-send" onClick={handleSave} />
      </div>
    </Dialog>
  );
}
