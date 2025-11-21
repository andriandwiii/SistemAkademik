"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Dialog } from "primereact/dialog";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Message } from "primereact/message";

// Ambil URL API dari environment variable
const API_URL = process.env.NEXT_PUBLIC_API_URL;

const FormPredikat = ({ visible, onHide, onSave, selectedItem }) => {
  // --- STATE FORM DATA ---
  const [formData, setFormData] = useState({
    KODE_MAPEL: "",
    TAHUN_AJARAN_ID: "",
    TINGKATAN_ID: "",
    JURUSAN_ID: null,
    KELAS_ID: null,
    DESKRIPSI_A: "",
    DESKRIPSI_B: "",
    DESKRIPSI_C: "",
    DESKRIPSI_D: "",
  });

  // --- STATE OPSI DROPDOWN ---
  const [opsiMapel, setOpsiMapel] = useState([]);
  const [opsiTahun, setOpsiTahun] = useState([]);
  const [opsiTingkat, setOpsiTingkat] = useState([]);
  const [opsiJurusan, setOpsiJurusan] = useState([]);
  const [opsiKelas, setOpsiKelas] = useState([]);

  // --- 1. FETCH DATA MASTER DARI BACKEND ---
  useEffect(() => {
    const fetchMasterData = async () => {
      // Cek apakah dialog sedang terbuka agar tidak fetch terus menerus
      if (!visible) return;

      try {
        // Fetch Master Tahun Ajaran
        const resTahun = await axios.get(`${API_URL}/master-tahun-ajaran`);
        const dataTahun = resTahun.data.data.map((item) => ({
          label: `${item.NAMA_TAHUN_AJARAN} (${item.STATUS})`,
          value: item.TAHUN_AJARAN_ID,
        }));
        setOpsiTahun(dataTahun);

        // Fetch Master Mata Pelajaran
        const resMapel = await axios.get(`${API_URL}/master-mata-pelajaran`);
        const dataMapel = resMapel.data.data.map((item) => ({
          label: `${item.KODE_MAPEL} - ${item.NAMA_MAPEL}`,
          value: item.KODE_MAPEL,
        }));
        setOpsiMapel(dataMapel);

        // Fetch Master Tingkatan
        const resTingkat = await axios.get(`${API_URL}/master-tingkatan`);
        const dataTingkat = resTingkat.data.data.map((item) => ({
          label: item.TINGKATAN, 
          value: item.TINGKATAN_ID,
        }));
        setOpsiTingkat(dataTingkat);

        // Fetch Master Jurusan
        const resJurusan = await axios.get(`${API_URL}/master-jurusan`);
        const dataJurusan = resJurusan.data.data.map((item) => ({
          label: item.NAMA_JURUSAN,
          value: item.JURUSAN_ID,
        }));
        setOpsiJurusan(dataJurusan);

        // Fetch Master Kelas
        const resKelas = await axios.get(`${API_URL}/master-kelas`);
        const dataKelas = resKelas.data.data.map((item) => ({
          label: `${item.KELAS_ID} (R. ${item.NAMA_RUANG || '-'})`,
          value: item.KELAS_ID,
        }));
        setOpsiKelas(dataKelas);

      } catch (error) {
        console.error("Gagal mengambil data master:", error);
      }
    };

    fetchMasterData();
  }, [visible]); // Jalankan setiap kali dialog dibuka

  // --- 2. MAPPING DATA EDIT ---
  useEffect(() => {
    if (selectedItem) {
      // Ratakan data nested dari backend ke form state
      setFormData({
        KODE_MAPEL: selectedItem.mapel?.KODE_MAPEL || "",
        TAHUN_AJARAN_ID: selectedItem.tahun_ajaran?.TAHUN_AJARAN_ID || "",
        TINGKATAN_ID: selectedItem.target?.TINGKATAN_ID || "",
        JURUSAN_ID: selectedItem.target?.JURUSAN_ID || null,
        KELAS_ID: selectedItem.target?.KELAS_ID || null,
        DESKRIPSI_A: selectedItem.deskripsi?.A || "",
        DESKRIPSI_B: selectedItem.deskripsi?.B || "",
        DESKRIPSI_C: selectedItem.deskripsi?.C || "",
        DESKRIPSI_D: selectedItem.deskripsi?.D || "",
      });
    } else {
      // Reset form mode Tambah Baru
      setFormData({
        KODE_MAPEL: "",
        TAHUN_AJARAN_ID: "", 
        TINGKATAN_ID: "",
        JURUSAN_ID: null,
        KELAS_ID: null,
        DESKRIPSI_A: "",
        DESKRIPSI_B: "",
        DESKRIPSI_C: "",
        DESKRIPSI_D: "",
      });
    }
  }, [selectedItem, visible]);

  // Handle Perubahan Input
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle Submit
  const handleSubmit = () => {
    // Validasi Field Wajib
    if (!formData.KODE_MAPEL || !formData.TAHUN_AJARAN_ID || !formData.TINGKATAN_ID) {
      alert("Harap lengkapi Target Predikat (Mapel, Tahun Ajaran, dan Tingkatan)!");
      return;
    }

    // Validasi Isi Deskripsi (Minimal satu terisi)
    if (!formData.DESKRIPSI_A && !formData.DESKRIPSI_B && !formData.DESKRIPSI_C) {
        alert("Harap isi minimal satu deskripsi predikat (A/B/C).");
        return;
    }

    // Kirim ke Parent Component untuk diproses ke API
    onSave(formData);
  };

  return (
    <Dialog
      header={selectedItem ? "Edit Deskripsi Predikat" : "Tambah Deskripsi Predikat"}
      visible={visible}
      style={{ width: "50vw" }}
      breakpoints={{ "960px": "75vw", "641px": "95vw" }}
      modal
      onHide={onHide}
      className="p-fluid"
    >
      {/* --- BAGIAN 1: TARGET PREDIKAT --- */}
      <div className="card mb-3 p-3 border-1 surface-border border-round-md surface-ground">
        <h5 className="mb-3 text-color-secondary">Target Sasaran</h5>
        <div className="formgrid grid">
          
          {/* Tahun Ajaran */}
          <div className="field col-12 md:col-6">
            <label htmlFor="tahun">Tahun Ajaran <span className="text-red-500">*</span></label>
            <Dropdown
              id="tahun"
              value={formData.TAHUN_AJARAN_ID}
              options={opsiTahun}
              onChange={(e) => handleChange("TAHUN_AJARAN_ID", e.value)}
              placeholder="Pilih Tahun"
              filter
              emptyMessage="Tidak ada data tahun ajaran"
            />
          </div>

          {/* Mata Pelajaran */}
          <div className="field col-12 md:col-6">
            <label htmlFor="mapel">Mata Pelajaran <span className="text-red-500">*</span></label>
            <Dropdown
              id="mapel"
              value={formData.KODE_MAPEL}
              options={opsiMapel}
              onChange={(e) => handleChange("KODE_MAPEL", e.value)}
              placeholder="Pilih Mapel"
              filter
              emptyMessage="Tidak ada data mapel"
            />
          </div>

          {/* Tingkatan (Wajib) */}
          <div className="field col-12 md:col-4">
            <label htmlFor="tingkat">Tingkatan <span className="text-red-500">*</span></label>
            <Dropdown
              id="tingkat"
              value={formData.TINGKATAN_ID}
              options={opsiTingkat}
              onChange={(e) => handleChange("TINGKATAN_ID", e.value)}
              placeholder="Pilih Tingkat"
              emptyMessage="Tidak ada data tingkatan"
            />
          </div>

          {/* Jurusan (Opsional) */}
          <div className="field col-12 md:col-4">
            <label htmlFor="jurusan">Jurusan (Opsional)</label>
            <Dropdown
              id="jurusan"
              value={formData.JURUSAN_ID}
              options={opsiJurusan}
              onChange={(e) => handleChange("JURUSAN_ID", e.value)}
              placeholder="Semua Jurusan"
              showClear
              tooltip="Kosongkan jika berlaku untuk semua jurusan"
              emptyMessage="Tidak ada data jurusan"
            />
          </div>

          {/* Kelas (Opsional) */}
          <div className="field col-12 md:col-4">
            <label htmlFor="kelas">Kelas Spesifik (Opsional)</label>
            <Dropdown
              id="kelas"
              value={formData.KELAS_ID}
              options={opsiKelas}
              onChange={(e) => handleChange("KELAS_ID", e.value)}
              placeholder="Semua Kelas"
              showClear
              filter
              tooltip="Pilih hanya jika deskripsi ini KHUSUS untuk kelas tertentu"
              emptyMessage="Tidak ada data kelas"
            />
          </div>
          
          <div className="col-12">
            <Message 
                severity="info" 
                text="Jika Kelas/Jurusan dikosongkan (x), deskripsi akan berlaku secara umum sesuai Tingkatan." 
                className="w-full"
            />
          </div>
        </div>
      </div>

      {/* --- BAGIAN 2: ISI DESKRIPSI --- */}
      <div className="card p-3 border-1 surface-border border-round-md">
        <h5 className="mb-3 text-color-secondary">Isi Deskripsi Rapor</h5>
        
        <div className="field">
          <label htmlFor="deskA" className="font-bold text-green-600">Predikat A (Sangat Baik)</label>
          <InputTextarea
            id="deskA"
            value={formData.DESKRIPSI_A}
            onChange={(e) => handleChange("DESKRIPSI_A", e.target.value)}
            rows={2}
            placeholder="Contoh: Sangat baik dalam memahami konsep..."
            autoResize
          />
        </div>

        <div className="field">
          <label htmlFor="deskB" className="font-bold text-blue-600">Predikat B (Baik)</label>
          <InputTextarea
            id="deskB"
            value={formData.DESKRIPSI_B}
            onChange={(e) => handleChange("DESKRIPSI_B", e.target.value)}
            rows={2}
            placeholder="Contoh: Baik dalam memahami konsep..."
            autoResize
          />
        </div>

        <div className="field">
          <label htmlFor="deskC" className="font-bold text-orange-600">Predikat C (Cukup)</label>
          <InputTextarea
            id="deskC"
            value={formData.DESKRIPSI_C}
            onChange={(e) => handleChange("DESKRIPSI_C", e.target.value)}
            rows={2}
            placeholder="Contoh: Cukup memahami konsep..."
            autoResize
          />
        </div>

        <div className="field">
          <label htmlFor="deskD" className="font-bold text-red-600">Predikat D (Kurang)</label>
          <InputTextarea
            id="deskD"
            value={formData.DESKRIPSI_D}
            onChange={(e) => handleChange("DESKRIPSI_D", e.target.value)}
            rows={2}
            placeholder="Contoh: Perlu bimbingan khusus dalam..."
            autoResize
          />
        </div>
      </div>

      {/* --- FOOTER BUTTONS --- */}
      <div className="flex justify-content-end gap-2 mt-4">
        <Button 
            label="Batal" 
            icon="pi pi-times" 
            className="p-button-text" 
            onClick={onHide} 
        />
        <Button 
            label="Simpan Data" 
            icon="pi pi-check" 
            onClick={handleSubmit} 
            autoFocus 
        />
      </div>
    </Dialog>
  );
};

export default FormPredikat;