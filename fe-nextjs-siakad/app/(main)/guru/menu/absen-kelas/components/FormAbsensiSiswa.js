'use client';

import { useEffect, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';

export default function FormAbsensiSiswaModal({ isOpen, onClose, onSubmit, initialData }) {
  const [kelas, setKelas] = useState(null);
  const [mapel, setMapel] = useState(null);
  const [jamMulai, setJamMulai] = useState(null);
  const [jamSelesai, setJamSelesai] = useState(null);
  const [catatan, setCatatan] = useState('');

  const kelasOptions = ["XI IPA 1", "XI IPA 2", "XI IPS 1"];
  const mapelOptions = ["Matematika", "Bahasa Indonesia", "Bahasa Inggris"];

  // reset form saat modal dibuka atau ada initialData
  useEffect(() => {
    if (initialData) {
      setKelas(initialData.kelas || null);
      setMapel(initialData.mapel || null);
      setJamMulai(initialData.jamMulai || null);
      setJamSelesai(initialData.jamSelesai || null);
      setCatatan(initialData.catatan || '');
    } else {
      setKelas(null);
      setMapel(null);
      setJamMulai(null);
      setJamSelesai(null);
      setCatatan('');
    }
  }, [initialData, isOpen]);

  const handleSave = () => {
    if (!kelas || !mapel || !jamMulai || !jamSelesai) {
      alert('Lengkapi semua field terlebih dahulu!');
      return;
    }

    const payload = {
      kelas,
      mapel,
      jamMulai,
      jamSelesai,
      catatan
    };

    onSubmit(payload);
    onClose();
  };

  return (
    <Dialog
      header="Form Absensi Siswa"
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
          <label htmlFor="kelas" className="font-medium">Kelas</label>
          <Dropdown
            id="kelas"
            value={kelas}
            options={kelasOptions}
            onChange={(e) => setKelas(e.value)}
            placeholder="Pilih Kelas"
          />
        </div>

        <div className="field col-12 md:col-6">
          <label htmlFor="mapel" className="font-medium">Mata Pelajaran</label>
          <Dropdown
            id="mapel"
            value={mapel}
            options={mapelOptions}
            onChange={(e) => setMapel(e.value)}
            placeholder="Pilih Mata Pelajaran"
          />
        </div>

        <div className="field col-12 md:col-6">
          <label htmlFor="jamMulai" className="font-medium">Jam Mulai</label>
          <Calendar
            id="jamMulai"
            value={jamMulai}
            onChange={(e) => setJamMulai(e.value)}
            timeOnly
            hourFormat="24"
            showIcon
            className="w-full"
          />
        </div>

        <div className="field col-12 md:col-6">
          <label htmlFor="jamSelesai" className="font-medium">Jam Selesai</label>
          <Calendar
            id="jamSelesai"
            value={jamSelesai}
            onChange={(e) => setJamSelesai(e.value)}
            timeOnly
            hourFormat="24"
            showIcon
            className="w-full"
          />
        </div>

        <div className="field col-12">
          <label htmlFor="catatan" className="font-medium">Catatan / Deskripsi (Opsional)</label>
          <InputTextarea
            id="catatan"
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            rows={3}
            autoResize
            placeholder="Misalnya: Absensi harian pertemuan pertama."
          />
        </div>
      </div>
    </Dialog>
  );
}
