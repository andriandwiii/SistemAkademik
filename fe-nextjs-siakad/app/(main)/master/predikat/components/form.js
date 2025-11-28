"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Dialog } from "primereact/dialog";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Message } from "primereact/message";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const FormPredikat = ({ visible, onHide, onSave, selectedItem }) => {
  // STATE - MAPEL + TAHUN AJARAN
  const [formData, setFormData] = useState({
    KODE_MAPEL: "",
    TAHUN_AJARAN_ID: "",
    DESKRIPSI_A: "",
    DESKRIPSI_B: "",
    DESKRIPSI_C: "",
    DESKRIPSI_D: "",
  });

  // OPSI DROPDOWN
  const [opsiTahun, setOpsiTahun] = useState([]);
  const [opsiMapel, setOpsiMapel] = useState([]);

  // FETCH MASTER DATA
  useEffect(() => {
    const fetchMasterData = async () => {
      if (!visible) return;

      try {
        // Fetch Master Tahun Ajaran
        const resTahun = await axios.get(`${API_URL}/master-tahun-ajaran`);
        const dataTahun = resTahun.data.data.map((item) => ({
          label: `${item.NAMA_TAHUN_AJARAN} (${item.STATUS})`,
          value: item.TAHUN_AJARAN_ID,
        }));
        setOpsiTahun(dataTahun);

        // ✅ Fetch Master Mata Pelajaran - TAMPILKAN KODE MAPEL
        const resMapel = await axios.get(`${API_URL}/master-mata-pelajaran`);
        const dataMapel = resMapel.data.data.map((item) => ({
          label: `${item.NAMA_MAPEL} (${item.KODE_MAPEL})`, // ✅ TAMBAH KODE
          value: item.KODE_MAPEL,
        }));
        setOpsiMapel(dataMapel);

      } catch (error) {
        console.error("Gagal mengambil data master:", error);
      }
    };

    fetchMasterData();
  }, [visible]);

  // MAPPING DATA EDIT
  useEffect(() => {
    if (selectedItem) {
      setFormData({
        KODE_MAPEL: selectedItem.KODE_MAPEL || "",
        TAHUN_AJARAN_ID: selectedItem.TAHUN_AJARAN_ID || "",
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
    // VALIDASI - MAPEL + TAHUN WAJIB
    if (!formData.KODE_MAPEL || !formData.TAHUN_AJARAN_ID) {
      alert("Harap pilih Mata Pelajaran dan Tahun Ajaran!");
      return;
    }

    // Validasi Isi Deskripsi (Minimal satu terisi)
    if (!formData.DESKRIPSI_A && !formData.DESKRIPSI_B && !formData.DESKRIPSI_C && !formData.DESKRIPSI_D) {
      alert("Harap isi minimal satu deskripsi predikat (A/B/C/D).");
      return;
    }

    // Kirim ke Parent Component
    onSave(formData);
  };

  return (
    <Dialog
      header={selectedItem ? "Edit Deskripsi Predikat" : "Tambah Deskripsi Predikat"}
      visible={visible}
      style={{ width: "50vw" }}
      breakpoints={{ "960px": "70vw", "641px": "95vw" }}
      modal
      onHide={onHide}
      className="p-fluid"
    >
      {/* BAGIAN 1: TARGET PREDIKAT - PER MAPEL */}
      <div className="card mb-3 p-3 border-1 surface-border border-round-md surface-ground">
        <h5 className="mb-3 text-color-secondary">Target Sasaran</h5>
        <div className="formgrid grid">
          
          {/* ✅ Mata Pelajaran (WAJIB) - DENGAN KODE */}
          <div className="field col-12 md:col-6">
            <label htmlFor="mapel">
              Mata Pelajaran <span className="text-red-500">*</span>
            </label>
            <Dropdown
              id="mapel"
              value={formData.KODE_MAPEL}
              options={opsiMapel}
              onChange={(e) => handleChange("KODE_MAPEL", e.value)}
              placeholder="Pilih Mata Pelajaran"
              filter
              filterPlaceholder="Cari mata pelajaran..."
              emptyMessage="Tidak ada data mata pelajaran"
              emptyFilterMessage="Tidak ditemukan"
            />
            <small className="text-gray-500">
              Format: Nama Mapel (Kode)
            </small>
          </div>

          {/* Tahun Ajaran (WAJIB) */}
          <div className="field col-12 md:col-6">
            <label htmlFor="tahun">
              Tahun Ajaran <span className="text-red-500">*</span>
            </label>
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
          
          <div className="col-12">
            <Message 
              severity="info" 
              text="Setiap mata pelajaran memiliki template deskripsi predikat yang berbeda-beda per tahun ajaran." 
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* BAGIAN 2: ISI DESKRIPSI */}
      <div className="card p-3 border-1 surface-border border-round-md">
        <h5 className="mb-3 text-color-secondary">Template Deskripsi Rapor</h5>
        
        <div className="field col-12">
          <label htmlFor="deskA">
            Predikat A (Sangat Baik)
            <span className="text-gray-500 ml-2 text-xs">Nilai: {">="} Batas B</span>
          </label>
          <InputTextarea
            id="deskA"
            value={formData.DESKRIPSI_A}
            onChange={(e) => handleChange("DESKRIPSI_A", e.target.value)}
            rows={2}
            autoResize
            placeholder="Contoh: Siswa sangat menguasai konsep {materi} dengan baik"
          />
        </div>

        <div className="field col-12">
          <label htmlFor="deskB">
            Predikat B (Baik)
            <span className="text-gray-500 ml-2 text-xs">Nilai: Batas C - Batas B</span>
          </label>
          <InputTextarea
            id="deskB"
            value={formData.DESKRIPSI_B}
            onChange={(e) => handleChange("DESKRIPSI_B", e.target.value)}
            rows={2}
            autoResize
            placeholder="Contoh: Siswa menguasai konsep {materi}"
          />
        </div>

        <div className="field col-12">
          <label htmlFor="deskC">
            Predikat C (Cukup)
            <span className="text-gray-500 ml-2 text-xs">Nilai: KKM - Batas C</span>
          </label>
          <InputTextarea
            id="deskC"
            value={formData.DESKRIPSI_C}
            onChange={(e) => handleChange("DESKRIPSI_C", e.target.value)}
            rows={2}
            autoResize
            placeholder="Contoh: Siswa cukup menguasai konsep {materi}"
          />
        </div>

        <div className="field col-12">
          <label htmlFor="deskD">
            Predikat D (Kurang)
            <span className="text-gray-500 ml-2 text-xs">Nilai: {"<"} KKM</span>
          </label>
          <InputTextarea
            id="deskD"
            value={formData.DESKRIPSI_D}
            onChange={(e) => handleChange("DESKRIPSI_D", e.target.value)}
            rows={2}
            autoResize
            placeholder="Contoh: Siswa perlu bimbingan dalam {materi}"
          />
        </div>
      </div>

      {/* Footer Buttons */}
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