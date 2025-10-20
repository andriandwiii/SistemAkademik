'use client';

import { useEffect, useRef, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { InputText } from 'primereact/inputtext';

export default function FormNilaiRaport({ isOpen, onClose, record }) {
  const toast = useRef(null);
  const [form, setForm] = useState({
    mapel: '',
    tugas: '',
    uts: '',
    uas: '',
    akhir: '',
    predikat: '',
    semester: '',
  });

  useEffect(() => {
    if (record) {
      setForm({
        mapel: record.mapel || '',
        tugas: record.tugas || '',
        uts: record.uts || '',
        uas: record.uas || '',
        akhir: record.akhir || '',
        predikat: record.predikat || '',
        semester: record.semester || '',
      });
    }
  }, [record]);

  return (
    <Dialog
      header="Detail Nilai & Raport"
      visible={isOpen}
      style={{ width: '30rem' }}
      modal
      onHide={onClose}
    >
      <Toast ref={toast} />

      <div className="flex flex-column gap-3">
        <div>
          <label className="block mb-1">Mata Pelajaran</label>
          <InputText value={form.mapel} readOnly className="w-full" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block mb-1">Nilai Tugas</label>
            <InputText value={form.tugas} readOnly className="w-full" />
          </div>
          <div>
            <label className="block mb-1">Nilai UTS</label>
            <InputText value={form.uts} readOnly className="w-full" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block mb-1">Nilai UAS</label>
            <InputText value={form.uas} readOnly className="w-full" />
          </div>
          <div>
            <label className="block mb-1">Nilai Akhir</label>
            <InputText value={form.akhir} readOnly className="w-full" />
          </div>
        </div>
        <div>
          <label className="block mb-1">Predikat</label>
          <InputText value={form.predikat} readOnly className="w-full" />
        </div>
        <div>
          <label className="block mb-1">Semester</label>
          <InputText value={form.semester} readOnly className="w-full" />
        </div>
      </div>

      <div className="flex justify-content-end gap-2 mt-4">
        <Button label="Tutup" icon="pi pi-times" severity="secondary" onClick={onClose} />
      </div>
    </Dialog>
  );
}
