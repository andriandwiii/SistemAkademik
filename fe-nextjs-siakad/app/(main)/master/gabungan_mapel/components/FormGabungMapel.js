"use client";

import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { MultiSelect } from "primereact/multiselect"; // Import MultiSelect untuk centang-centang
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function FormGabungMapel({ visible, onHide, onSave, selectedData }) {
  const [mapelOptions, setMapelOptions] = useState([]);
  const [jurusanOptions, setJurusanOptions] = useState([]);
  const [formData, setFormData] = useState({
    MAPEL_INDUK_ID: null,
    MAPEL_KOMPONEN_IDS: [], // Sekarang berbentuk Array untuk menampung banyak pilihan
    JURUSAN_ID_REF: null,
    KETERANGAN: "",
  });

  useEffect(() => {
    if (visible) {
      loadDropdownData();
      if (selectedData) {
        setFormData({
          MAPEL_INDUK_ID: selectedData.mapel_induk?.ID || null,
          MAPEL_KOMPONEN_IDS: [selectedData.mapel_komponen?.ID], // Jika edit, masukkan ID lama ke array
          JURUSAN_ID_REF: selectedData.jurusan?.ID || null,
          KETERANGAN: selectedData.KETERANGAN || "",
        });
      } else {
        setFormData({ MAPEL_INDUK_ID: null, MAPEL_KOMPONEN_IDS: [], JURUSAN_ID_REF: null, KETERANGAN: "" });
      }
    }
  }, [visible, selectedData]);

  const loadDropdownData = async () => {
    try {
      const token = localStorage.getItem("token");
      const [resMapel, resJurusan] = await Promise.all([
        axios.get(`${API_URL}/master-mata-pelajaran`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/master-jurusan`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      
      setMapelOptions(resMapel.data.data.map(m => ({ 
        label: `${m.KODE_MAPEL} - ${m.NAMA_MAPEL}`, 
        value: m.ID 
      })));
      
      setJurusanOptions(resJurusan.data.data.map(j => ({ 
        label: j.NAMA_JURUSAN, 
        value: j.id 
      })));
    } catch (err) {
      console.error("Gagal memuat data dropdown");
    }
  };

  return (
    <Dialog 
      header={selectedData ? "Edit Gabung Mapel" : "Tambah Gabung Mapel (Multi)"} 
      visible={visible} 
      style={{ width: "500px" }} 
      onHide={onHide} 
      modal 
      footer={
        <div className="mt-3">
          <Button label="Batal" icon="pi pi-times" text onClick={onHide} />
          <Button label="Simpan" icon="pi pi-check" onClick={() => onSave(formData)} />
        </div>
      }
    >
      <div className="flex flex-column gap-3">
        {/* 1. Pilih Induk (Satu Saja) */}
        <div className="flex flex-column gap-2">
          <label className="font-bold">Mata Pelajaran Induk</label>
          <Dropdown 
            value={formData.MAPEL_INDUK_ID} 
            options={mapelOptions} 
            filter 
            onChange={(e) => setFormData({ ...formData, MAPEL_INDUK_ID: e.value })} 
            placeholder="Pilih Mapel Induk (IPA/IPS)" 
            className="w-full"
          />
        </div>

        {/* 2. Pilih Komponen (Bisa Centang Banyak) */}
        <div className="flex flex-column gap-2">
          <label className="font-bold">Mata Pelajaran Komponen (Centang Anggota)</label>
          <MultiSelect 
            value={formData.MAPEL_KOMPONEN_IDS} 
            options={mapelOptions} 
            filter 
            onChange={(e) => setFormData({ ...formData, MAPEL_KOMPONEN_IDS: e.value })} 
            placeholder="Pilih Mapel Anggota" 
            display="chip" // Menampilkan pilihan dalam bentuk chip biar rapi
            className="w-full"
          />
        </div>

        <div className="flex flex-column gap-2">
          <label className="font-bold">Jurusan</label>
          <Dropdown 
            value={formData.JURUSAN_ID_REF} 
            options={jurusanOptions} 
            filter 
            onChange={(e) => setFormData({ ...formData, JURUSAN_ID_REF: e.value })} 
            placeholder="Pilih Jurusan" 
            showClear 
            className="w-full"
          />
        </div>

        <div className="flex flex-column gap-2">
          <label className="font-bold">Keterangan</label>
          <InputTextarea 
            value={formData.KETERANGAN} 
            onChange={(e) => setFormData({ ...formData, KETERANGAN: e.target.value })} 
            rows={3} 
            className="w-full"
          />
        </div>
      </div>
    </Dialog>
  );
}