'use client';

import { useState, useEffect, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';

export default function FormKomunikasiRumahSekolahModal({ isOpen, onClose, record, onSubmit, mode }) {
  const toast = useRef(null);

  const contacts = [
    { label: 'Wali Kelas', value: 'wali_kelas' },
    { label: 'TU', value: 'tu' },
    { label: 'Kepala Sekolah', value: 'kepala_sekolah' },
    { label: 'Guru BK', value: 'guru_bk' },
  ];

  const [form, setForm] = useState({
    tujuan: null,
    subjek: '',
    pesan: '',
  });

  useEffect(() => {
    if (record) {
      const selectedContact = contacts.find(c => c.label === record.tujuan);
      setForm({
        tujuan: selectedContact ? selectedContact.value : null,
        subjek: record.subjek || '',
        pesan: record.pesan || '',
      });
    } else {
      setForm({ tujuan: null, subjek: '', pesan: '' });
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

    const selectedContact = contacts.find(c => c.value === form.tujuan);
    const data = {
      tujuan: selectedContact?.label || '',
      subjek: form.subjek,
      pesan: form.pesan,
      tanggal: record ? record.tanggal : new Date().toLocaleString(),
    };

    onSubmit(data);
    toast.current?.show({ severity: 'success', summary: 'Berhasil', detail: mode === 'edit' ? 'Pesan berhasil diubah' : 'Pesan berhasil dikirim' });
    onClose();
  };

  const isReadOnly = mode === 'edit' && record?.dibalas;

  return (
    <Dialog
      header={mode === 'edit' ? 'Edit Pesan' : 'Kirim Pesan ke Sekolah'}
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
            placeholder="Pilih Tujuan"
            disabled={isReadOnly}
          />
        </div>

        <div>
          <label className="block mb-1">Subjek</label>
          <InputText
            value={form.subjek}
            onChange={(e) => setForm({ ...form, subjek: e.target.value })}
            className="w-full"
            placeholder="Masukkan subjek"
            readOnly={isReadOnly}
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
            readOnly={isReadOnly}
          />
        </div>
      </div>

      <div className="flex justify-content-end gap-2 mt-4">
        <Button label="Batal" icon="pi pi-times" severity="secondary" onClick={onClose} />
        {!isReadOnly && <Button label={mode === 'edit' ? "Simpan" : "Kirim"} icon="pi pi-send" onClick={handleSave} />}
      </div>
    </Dialog>
  );
}
