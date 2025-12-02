"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import { InputText } from "primereact/inputtext";

// Ambil URL API dari environment variable
const API_URL = process.env.NEXT_PUBLIC_API_URL;

const FormTransaksiKKM = ({ visible, onHide, onSave, selectedItem }) => {
  // --- STATE FORM DATA ---
  const [formData, setFormData] = useState({
    TRANSAKSI_ID: "", 
    TAHUN_AJARAN_ID: "",
    TINGKATAN_ID: "",
    JURUSAN_ID: null,
    KELAS_ID: null,
    KODE_MAPEL: "",
    KODE_KKM: "", 
  });

  // --- STATE OPSI DROPDOWN ---
  const [opsiMapel, setOpsiMapel] = useState([]);
  const [opsiTahun, setOpsiTahun] = useState([]);
  const [opsiTingkat, setOpsiTingkat] = useState([]);
  const [opsiJurusan, setOpsiJurusan] = useState([]);
  const [opsiKelas, setOpsiKelas] = useState([]);
  const [opsiKKM, setOpsiKKM] = useState([]); 

  // --- 1. FETCH DATA MASTER DARI BACKEND ---
  useEffect(() => {
    const fetchMasterData = async () => {
      if (!visible) return;

      try {
        // 1. Fetch Master Tahun Ajaran
        const resTahun = await axios.get(`${API_URL}/master-tahun-ajaran`);
        setOpsiTahun(resTahun.data.data.map((item) => ({
          label: `${item.NAMA_TAHUN_AJARAN} (${item.STATUS})`,
          value: item.TAHUN_AJARAN_ID,
        })));

        // 2. Fetch Master Mata Pelajaran
        const resMapel = await axios.get(`${API_URL}/master-mata-pelajaran`);
        setOpsiMapel(resMapel.data.data.map((item) => ({
          label: `${item.KODE_MAPEL} - ${item.NAMA_MAPEL}`,
          value: item.KODE_MAPEL,
        })));

        // 3. Fetch Master Tingkatan
        const resTingkat = await axios.get(`${API_URL}/master-tingkatan`);
        setOpsiTingkat(resTingkat.data.data.map((item) => ({
          label: item.TINGKATAN, 
          value: item.TINGKATAN_ID,
        })));

        // 4. Fetch Master Jurusan
        const resJurusan = await axios.get(`${API_URL}/master-jurusan`);
        setOpsiJurusan(resJurusan.data.data.map((item) => ({
          label: item.NAMA_JURUSAN,
          value: item.JURUSAN_ID,
        })));

        // 5. Fetch Master Kelas
        const resKelas = await axios.get(`${API_URL}/master-kelas`);
        setOpsiKelas(resKelas.data.data.map((item) => ({
          label: `${item.KELAS_ID} (R. ${item.NAMA_RUANG || '-'})`,
          value: item.KELAS_ID,
        })));

        // 6. Fetch Master KKM 
        const resKKM = await axios.get(`${API_URL}/master-kkm`);
        setOpsiKKM(resKKM.data.data.map((item) => ({
          label: `Nilai: ${item.KKM} (Mapel: ${item.KODE_MAPEL || '-'})`, 
          value: item.KODE_KKM, 
        })));

      } catch (error) {
        console.error("Gagal mengambil data master:", error);
      }
    };

    fetchMasterData();
  }, [visible]);

  // --- 2. MAPPING DATA EDIT ---
  useEffect(() => {
    if (selectedItem) {
      setFormData({
        TRANSAKSI_ID: selectedItem.TRANSAKSI_ID || "",
        TAHUN_AJARAN_ID: selectedItem.tahun_ajaran?.TAHUN_AJARAN_ID || selectedItem.TAHUN_AJARAN_ID || "",
        TINGKATAN_ID: selectedItem.tingkatan?.TINGKATAN_ID || selectedItem.TINGKATAN_ID || "",
        JURUSAN_ID: selectedItem.jurusan?.JURUSAN_ID || selectedItem.JURUSAN_ID || null,
        KELAS_ID: selectedItem.kelas?.KELAS_ID || selectedItem.KELAS_ID || null,
        KODE_MAPEL: selectedItem.mapel?.KODE_MAPEL || selectedItem.KODE_MAPEL || "",
        KODE_KKM: selectedItem.kkm?.KODE_KKM || selectedItem.KODE_KKM || "", 
      });
    } else {
      setFormData({
        TRANSAKSI_ID: "", 
        TAHUN_AJARAN_ID: "",
        TINGKATAN_ID: "",
        JURUSAN_ID: null,
        KELAS_ID: null,
        KODE_MAPEL: "",
        KODE_KKM: "",
      });
    }
  }, [selectedItem, visible]);

  // Handle Perubahan Input
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle Submit
  const handleSubmit = () => {
    if (!formData.TAHUN_AJARAN_ID || !formData.KODE_MAPEL || !formData.TINGKATAN_ID) {
      alert("Harap lengkapi Target (Tahun Ajaran, Mapel, dan Tingkatan)!");
      return;
    }

    if (!formData.KODE_KKM) {
        alert("Harap pilih data KKM!");
        return;
    }

    onSave(formData);
  };

  return (
    <Dialog
      header={selectedItem ? "Edit Transaksi KKM" : "Tambah Transaksi KKM"}
      visible={visible}
      style={{ width: "50vw" }}
      breakpoints={{ "960px": "75vw", "641px": "95vw" }}
      modal
      onHide={onHide}
      className="p-fluid"
    >
      {/* --- BAGIAN 1: TARGET DATA --- */}
      <div className="card mb-3 p-3 border-1 surface-border border-round-md surface-ground">
        <h5 className="mb-3 text-color-secondary">Target Sasaran</h5>
        
        {selectedItem && (
           <div className="field mb-3">
              <label htmlFor="trx_id" className="text-xs text-gray-500">ID Transaksi</label>
              <InputText value={formData.TRANSAKSI_ID} disabled className="p-inputtext-sm bg-gray-100" />
           </div>
        )}

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
              tooltip="Pilih hanya jika KKM ini KHUSUS untuk kelas tertentu"
            />
          </div>

          <div className="col-12">
            <Message 
                severity="info" 
                text="Jika Kelas/Jurusan dikosongkan, KKM berlaku umum sesuai Tingkatan." 
                className="w-full"
            />
          </div>
        </div>
      </div>

      {/* --- BAGIAN 2: PENENTUAN KKM --- */}
      <div className="card p-3 border-1 surface-border border-round-md">
        <h5 className="mb-3 text-color-secondary">Nilai KKM</h5>
        
        <div className="field">
          <label htmlFor="kkm" className="font-bold text-primary">Pilih Data KKM <span className="text-red-500">*</span></label>
          <Dropdown
            id="kkm"
            value={formData.KODE_KKM} 
            options={opsiKKM}
            onChange={(e) => handleChange("KODE_KKM", e.value)}
            placeholder="Pilih Nilai KKM"
            filter
            className="w-full"
            emptyMessage="Data Master KKM belum ada"
          />
          <small className="block mt-2 text-gray-500">
            Dropdown menampilkan: <b>Nilai KKM</b> dari tabel master_kkm.
          </small>
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
            label="Simpan Transaksi" 
            icon="pi pi-save" 
            onClick={handleSubmit} 
            autoFocus 
        />
      </div>
    </Dialog>
  );
};

export default FormTransaksiKKM;