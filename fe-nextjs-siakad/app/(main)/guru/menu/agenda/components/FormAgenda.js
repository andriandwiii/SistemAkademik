'use client';

import { useEffect, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';

export default function FormAgendaMengajarModal({ isOpen, onClose, onSubmit, initialData }) {
  const [tanggal, setTanggal] = useState(null);
  const [kelas, setKelas] = useState(null);
  const [mataPelajaran, setMataPelajaran] = useState(null);
  const [materi, setMateri] = useState('');
  const [status, setStatus] = useState('Belum Dimulai');

  const kelasOptions = ['X IPA 1', 'X IPS 1', 'XI IPA 2', 'XI IPS 1', 'XII IPA 3', 'XII IPS 1'];
  const subjects = ['Matematika', 'Biologi', 'Fisika', 'Sejarah', 'Geografi', 'Sosiologi', 'Kimia', 'Ekonomi'];
  const statusOptions = ['Belum Dimulai', 'Selesai', 'Dibatalkan'];

  useEffect(() => {
    if (initialData) {
      setTanggal(initialData.tanggal || null);
      setKelas(initialData.kelas || null);
      setMataPelajaran(initialData.mataPelajaran || null);
      setMateri(initialData.materi || '');
      setStatus(initialData.status || 'Belum Dimulai');
    } else {
      setTanggal(null);
      setKelas(null);
      setMataPelajaran(null);
      setMateri('');
      setStatus('Belum Dimulai');
    }
  }, [initialData, isOpen]);

  const handleSave = () => {
    if (!tanggal || !kelas || !mataPelajaran || !materi) {
      alert('Lengkapi semua field terlebih dahulu!');
      return;
    }

    const payload = {
      tanggal,
      kelas,
      mataPelajaran,
      materi,
      status
    };

    onSubmit(payload);
    onClose();
  };

  return (
    <Dialog
      header="Form Agenda Mengajar"
      visible={isOpen}
      modal
      onHide={onClose}
      style={{ width: '500px' }}
      footer={
        <div className="flex justify-content-end gap-2">
          <Button label="Batal" icon="pi pi-times" onClick={onClose} className="p-button-text" />
          <Button label="Simpan" icon="pi pi-check" onClick={handleSave} />
        </div>
      }
    >
      <div className="p-fluid formgrid grid">
        <div className="field col-12 md:col-6">
          <label>Tanggal</label>
          <Calendar value={tanggal} onChange={(e) => setTanggal(e.value)} dateFormat="dd/mm/yy" />
        </div>

        <div className="field col-12 md:col-6">
          <label>Kelas</label>
          <Dropdown options={kelasOptions} value={kelas} onChange={(e) => setKelas(e.value)} placeholder="Pilih Kelas" />
        </div>

        <div className="field col-12 md:col-6">
          <label>Mata Pelajaran</label>
          <Dropdown options={subjects} value={mataPelajaran} onChange={(e) => setMataPelajaran(e.value)} placeholder="Pilih Mata Pelajaran" />
        </div>

        <div className="field col-12 md:col-6">
          <label>Status</label>
          <Dropdown options={statusOptions} value={status} onChange={(e) => setStatus(e.value)} />
        </div>

        <div className="field col-12">
          <label>Materi</label>
          <InputTextarea value={materi} onChange={(e) => setMateri(e.target.value)} rows={3} autoResize placeholder="Masukkan materi yang diajarkan" />
        </div>
      </div>
    </Dialog>
  );
}
