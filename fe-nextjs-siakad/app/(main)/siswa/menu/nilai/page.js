'use client';

import { useState, useRef } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Badge } from 'primereact/badge';
import ToastNotifier from '../../../../components/ToastNotifier';
import CustomDataTable from '../../../../components/DataTable';
import FormNilaiRaport from './components/FormNilaiRaport';

export default function NilaiRaportPage() {
  const toastRef = useRef(null);

  // data dummy nilai siswa
  const [records] = useState([
    {
      id: 1,
      mapel: 'Matematika',
      tugas: 80,
      uts: 78,
      uas: 85,
      akhir: 81,
      predikat: 'B',
      semester: 'Semester 1',
    },
    {
      id: 2,
      mapel: 'Bahasa Indonesia',
      tugas: 75,
      uts: 70,
      uas: 80,
      akhir: 75,
      predikat: 'B',
      semester: 'Semester 1',
    },
    {
      id: 3,
      mapel: 'Bahasa Inggris',
      tugas: 88,
      uts: 90,
      uas: 92,
      akhir: 90,
      predikat: 'A',
      semester: 'Semester 1',
    },
  ]);

  const [globalFilter, setGlobalFilter] = useState('');
  const [semester, setSemester] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const semesterOptions = [
    { label: 'Semester 1', value: 'Semester 1' },
    { label: 'Semester 2', value: 'Semester 2' },
  ];

  // kolom tabel
  const columns = [
    { field: 'mapel', header: 'Mata Pelajaran', filter: true },
    { field: 'tugas', header: 'Nilai Tugas' },
    { field: 'uts', header: 'Nilai UTS' },
    { field: 'uas', header: 'Nilai UAS' },
    { field: 'akhir', header: 'Nilai Akhir' },
    {
      field: 'predikat',
      header: 'Predikat',
      body: (row) => (
        <Badge
          value={row.predikat}
          severity={row.predikat === 'A' ? 'success' : 'info'}
        />
      ),
    },
    { field: 'semester', header: 'Semester', filter: true },
    {
      header: 'Aksi',
      body: (row) => (
        <Button
          icon="pi pi-eye"
          label="Detail"
          size="small"
          onClick={() => setSelectedRecord(row)}
        />
      ),
    },
  ];

  // filter data
  const filteredRecords = records.filter(
    (r) =>
      (!semester || r.semester === semester) &&
      (r.mapel.toLowerCase().includes(globalFilter.toLowerCase()) ||
        r.semester.toLowerCase().includes(globalFilter.toLowerCase()))
  );

  // aksi export PDF/Excel (dummy)
  const handleExport = (type) => {
    toastRef.current?.showToast('00', `Export raport ke ${type} berhasil`);
  };

  return (
    <div className="card p-4">
      <h3 className="text-xl font-semibold mb-4">Nilai & Raport</h3>

      {/* Filter & Search */}
      <div className="flex items-center justify-between mb-3 w-full">
        {/* Kiri: tombol export */}
        <div className="flex gap-2">
          <Button
            label="Export PDF"
            icon="pi pi-file-pdf"
            severity="danger"
            onClick={() => handleExport('PDF')}
          />
          <Button
            label="Export Excel"
            icon="pi pi-file-excel"
            severity="success"
            onClick={() => handleExport('Excel')}
          />
        </div>

        {/* Tengah: dropdown semester */}
        <div className="flex-1 flex justify-center">
          <Dropdown
            value={semester}
            options={semesterOptions}
            onChange={(e) => setSemester(e.value)}
            placeholder="Pilih Semester"
            className="w-48"
          />
        </div>

        {/* Kanan: search */}
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            placeholder="Cari mata pelajaran..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
        </span>
      </div>

      {/* Tabel Nilai */}
      <CustomDataTable data={filteredRecords} loading={false} columns={columns} />

      {/* Modal Detail */}
      <FormNilaiRaport
        isOpen={selectedRecord !== null}
        onClose={() => setSelectedRecord(null)}
        record={selectedRecord}
      />

      <ToastNotifier ref={toastRef} />
    </div>
  );
}
