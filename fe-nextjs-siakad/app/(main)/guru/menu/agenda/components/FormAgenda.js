'use client';

import { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';

export default function FormAgendaMengajar({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData, 
  jadwalGuru, 
  mode, 
  statusOptions 
}) {
  const [formData, setFormData] = useState(initialData);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleJadwalChange = (jadwalId) => {
    const selectedJadwal = jadwalGuru.find(j => j.ID === jadwalId);
    
    if (selectedJadwal) {
      const tingkat = selectedJadwal.tingkatan?.TINGKATAN || '';
      const jurusan = selectedJadwal.jurusan?.NAMA_JURUSAN || '';
      const ruang = selectedJadwal.kelas?.NAMA_RUANG || '';
      
      setFormData({
        ...formData,
        jadwalId: jadwalId,
        hari: selectedJadwal.hari?.HARI || '',
        kelas: `${tingkat} ${jurusan} | ${ruang}`,
        mataPelajaran: selectedJadwal.mata_pelajaran?.NAMA_MAPEL || '',
      });
    }
  };

  const handleSubmitForm = () => {
    if (!formData.tanggal || !formData.jadwalId || !formData.materi) {
      alert('Mohon lengkapi semua field yang wajib diisi');
      return;
    }

    onSubmit(formData);
  };

  // Options untuk dropdown jadwal
  const jadwalOptions = jadwalGuru.map(j => {
    const tingkat = j.tingkatan?.TINGKATAN || '';
    const jurusan = j.jurusan?.NAMA_JURUSAN || '';
    const ruang = j.kelas?.NAMA_RUANG || '';
    const mapel = j.mata_pelajaran?.NAMA_MAPEL || '';
    const hari = j.hari?.HARI || '';
    const jp = j.jam_pelajaran?.JP_KE || '';
    
    return {
      label: `${hari} - JP ${jp} - ${mapel} - ${tingkat} ${jurusan} | ${ruang}`,
      value: j.ID
    };
  });

  return (
    <Dialog
      visible={isOpen}
      style={{ width: '600px' }}
      header={mode === 'edit' ? 'Edit Agenda Mengajar' : 'Tambah Agenda Mengajar'}
      modal
      onHide={onClose}
      footer={
        <div>
          <Button label="Batal" icon="pi pi-times" onClick={onClose} className="p-button-text" />
          <Button label="Simpan" icon="pi pi-check" onClick={handleSubmitForm} autoFocus />
        </div>
      }
    >
      <div className="flex flex-column gap-3 mt-3">
        <div className="field">
          <label htmlFor="tanggal" className="font-semibold">
            Tanggal <span className="text-red-500">*</span>
          </label>
          <Calendar
            id="tanggal"
            value={formData.tanggal}
            onChange={(e) => setFormData({ ...formData, tanggal: e.value })}
            dateFormat="dd/mm/yy"
            showIcon
            className="w-full"
          />
        </div>

        <div className="field">
          <label htmlFor="jadwal" className="font-semibold">
            Pilih Jadwal <span className="text-red-500">*</span>
          </label>
          <Dropdown
            id="jadwal"
            value={formData.jadwalId}
            options={jadwalOptions}
            onChange={(e) => handleJadwalChange(e.value)}
            placeholder="Pilih jadwal mengajar"
            className="w-full"
            filter
            filterBy="label"
            emptyMessage="Tidak ada jadwal tersedia"
            disabled={mode === 'edit'}
          />
          {mode === 'edit' && (
            <small className="text-500">Jadwal tidak dapat diubah saat edit</small>
          )}
        </div>

        <div className="field">
          <label htmlFor="kelas" className="font-semibold">Kelas</label>
          <InputText
            id="kelas"
            value={formData.kelas}
            disabled
            className="w-full"
          />
        </div>

        <div className="field">
          <label htmlFor="mataPelajaran" className="font-semibold">Mata Pelajaran</label>
          <InputText
            id="mataPelajaran"
            value={formData.mataPelajaran}
            disabled
            className="w-full"
          />
        </div>

        <div className="field">
          <label htmlFor="materi" className="font-semibold">
            Materi Pembelajaran <span className="text-red-500">*</span>
          </label>
          <InputTextarea
            id="materi"
            value={formData.materi}
            onChange={(e) => setFormData({ ...formData, materi: e.target.value })}
            rows={3}
            className="w-full"
            placeholder="Contoh: Persamaan Kuadrat dan Penyelesaiannya"
          />
        </div>

        <div className="field">
          <label htmlFor="status" className="font-semibold">Status</label>
          <Dropdown
            id="status"
            value={formData.status}
            options={statusOptions.map(s => ({ label: s, value: s }))}
            onChange={(e) => setFormData({ ...formData, status: e.value })}
            className="w-full"
          />
        </div>
      </div>
    </Dialog>
  );
}