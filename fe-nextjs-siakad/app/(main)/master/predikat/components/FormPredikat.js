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
  // ✅ STATE SIMPLIFIED - HANYA TAHUN + TINGKATAN
  const [formData, setFormData] = useState({
    TAHUN_AJARAN_ID: "",
    TINGKATAN_ID: null, // Nullable - kosong = berlaku untuk semua tingkatan
    DESKRIPSI_A: "",
    DESKRIPSI_B: "",
    DESKRIPSI_C: "",
    DESKRIPSI_D: "",
  });

  // ✅ OPSI DROPDOWN - HAPUS MAPEL, JURUSAN, KELAS
  const [opsiTahun, setOpsiTahun] = useState([]);
  const [opsiTingkat, setOpsiTingkat] = useState([]);

  // ✅ FETCH MASTER DATA - HANYA TAHUN + TINGKATAN
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

        // Fetch Master Tingkatan
        const resTingkat = await axios.get(`${API_URL}/master-tingkatan`);
        const dataTingkat = resTingkat.data.data.map((item) => ({
          label: item.TINGKATAN, 
          value: item.TINGKATAN_ID,
        }));
        setOpsiTingkat(dataTingkat);

      } catch (error) {
        console.error("Gagal mengambil data master:", error);
      }
    };

    fetchMasterData();
  }, [visible]);

  // ✅ MAPPING DATA EDIT - SIMPLIFIED
  useEffect(() => {
    if (selectedItem) {
      setFormData({
        TAHUN_AJARAN_ID: selectedItem.TAHUN_AJARAN_ID || "",
        TINGKATAN_ID: selectedItem.TINGKATAN_ID || null,
        DESKRIPSI_A: selectedItem.deskripsi?.A || "",
        DESKRIPSI_B: selectedItem.deskripsi?.B || "",
        DESKRIPSI_C: selectedItem.deskripsi?.C || "",
        DESKRIPSI_D: selectedItem.deskripsi?.D || "",
      });
    } else {
      // Reset form mode Tambah Baru
      setFormData({
        TAHUN_AJARAN_ID: "",
        TINGKATAN_ID: null,
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
    // ✅ VALIDASI SIMPLIFIED - HANYA TAHUN AJARAN WAJIB
    if (!formData.TAHUN_AJARAN_ID) {
      alert("Harap pilih Tahun Ajaran!");
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
      style={{ width: "45vw" }}
      breakpoints={{ "960px": "70vw", "641px": "95vw" }}
      modal
      onHide={onHide}
      className="p-fluid"
    >
      {/* ✅ BAGIAN 1: TARGET PREDIKAT - SIMPLIFIED */}
      <div className="card mb-3 p-3 border-1 surface-border border-round-md surface-ground">
        <h5 className="mb-3 text-color-secondary">🎯 Target Sasaran</h5>
        <div className="formgrid grid">
          
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

          {/* Tingkatan (OPSIONAL) */}
          <div className="field col-12 md:col-6">
            <label htmlFor="tingkat">Tingkatan (Opsional)</label>
            <Dropdown
              id="tingkat"
              value={formData.TINGKATAN_ID}
              options={opsiTingkat}
              onChange={(e) => handleChange("TINGKATAN_ID", e.value)}
              placeholder="Semua Tingkatan"
              showClear
              emptyMessage="Tidak ada data tingkatan"
            />
            <small className="text-gray-500">
              Kosongkan jika berlaku untuk semua tingkatan (10, 11, 12)
            </small>
          </div>
          
          <div className="col-12">
            <Message 
              severity="info" 
              text="🔔 Predikat bersifat GLOBAL per tahun ajaran. Jika tingkatan dikosongkan, predikat akan berlaku untuk semua kelas." 
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* ✅ BAGIAN 2: ISI DESKRIPSI */}
      <div className="card p-3 border-1 surface-border border-round-md">
        <h5 className="mb-3 text-color-secondary">📝 Isi Deskripsi Rapor</h5>
        
        <div className="field">
          <label htmlFor="deskA" className="font-bold text-green-600">
            Predikat A (Sangat Baik)
          </label>
          <InputTextarea
            id="deskA"
            value={formData.DESKRIPSI_A}
            onChange={(e) => handleChange("DESKRIPSI_A", e.target.value)}
            rows={2}
            placeholder="Contoh: Siswa menguasai {materi} dengan sangat baik dan mampu mengaplikasikan..."
            autoResize
          />
          <small className="text-gray-500">
            Tip: Gunakan placeholder seperti {"{materi}"} atau {"{nama}"} untuk template dinamis
          </small>
        </div>

        <div className="field">
          <label htmlFor="deskB" className="font-bold text-blue-600">
            Predikat B (Baik)
          </label>
          <InputTextarea
            id="deskB"
            value={formData.DESKRIPSI_B}
            onChange={(e) => handleChange("DESKRIPSI_B", e.target.value)}
            rows={2}
            placeholder="Contoh: Siswa menguasai {materi} dengan baik..."
            autoResize
          />
        </div>

        <div className="field">
          <label htmlFor="deskC" className="font-bold text-orange-600">
            Predikat C (Cukup)
          </label>
          <InputTextarea
            id="deskC"
            value={formData.DESKRIPSI_C}
            onChange={(e) => handleChange("DESKRIPSI_C", e.target.value)}
            rows={2}
            placeholder="Contoh: Siswa cukup memahami {materi}..."
            autoResize
          />
        </div>

        <div className="field">
          <label htmlFor="deskD" className="font-bold text-red-600">
            Predikat D (Kurang)
          </label>
          <InputTextarea
            id="deskD"
            value={formData.DESKRIPSI_D}
            onChange={(e) => handleChange("DESKRIPSI_D", e.target.value)}
            rows={2}
            placeholder="Contoh: Siswa perlu bimbingan khusus dalam memahami {materi}..."
            autoResize
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