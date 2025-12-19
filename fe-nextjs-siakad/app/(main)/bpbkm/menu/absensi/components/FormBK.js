"use client";

import { useState, useEffect, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { SelectButton } from "primereact/selectbutton";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const FormBK = ({ visible, onHide, editData, token, onSaveSuccess }) => {
  const toast = useRef(null);
  const [loading, setLoading] = useState(false);
  
  // State Master Data
  const [listGuruBK, setListGuruBK] = useState([]);
  const [masterPelanggaran, setMasterPelanggaran] = useState([]);

  // State Form
  const [selectedNipBK, setSelectedNipBK] = useState(null); // Menyimpan NIP terpilih
  const [catatan, setCatatan] = useState("");
  const [statusTangani, setStatusTangani] = useState(0);
  const [statusBaru, setStatusBaru] = useState(null); 
  const [selectedPelanggaran, setSelectedPelanggaran] = useState(null);

  const opsiStatusTangani = [
    { label: 'PENDING', value: 0 },
    { label: 'SELESAI', value: 1 }
  ];

  const opsiKategoriAbsen = [
    { label: 'ALPA', value: 'ALPA' },
    { label: 'IZIN', value: 'IZIN' },
    { label: 'SAKIT', value: 'SAKIT' },
    { label: 'BOLOS', value: 'BOLOS' },
    { label: 'HADIR', value: 'HADIR' }
  ];

  // 1. Fetch Daftar Guru BK & Pelanggaran
  const fetchInitialData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      
      // Ambil data Pelanggaran
      const resPelanggaran = await fetch(`${API_URL}/master-pelanggaran`, { headers });
      const jsonPelanggaran = await resPelanggaran.json();
      setMasterPelanggaran(jsonPelanggaran.data || []);

      // Ambil data Guru (Sesuaikan endpoint master guru Anda)
      const resGuru = await fetch(`${API_URL}/master-guru`, { headers });
      const jsonGuru = await resGuru.json();
      // Filter hanya guru yang bertugas sebagai BP/BK (opsional jika backend belum filter)
      setListGuruBK(jsonGuru.data || []);
      
    } catch (err) {
      console.error("Gagal memuat data:", err);
    }
  };

  useEffect(() => {
    if (visible) {
      fetchInitialData();
      if (editData) {
        setSelectedNipBK(editData.VERIFIKASI_BK_ID || null);
        setCatatan(editData.CATATAN_BK || "");
        setStatusTangani(editData.SUDAH_DITANGGANI || 0);
        setStatusBaru(editData.STATUS); 
        setSelectedPelanggaran(editData.KODE_PELANGGARAN || null);
      }
    }
  }, [visible, editData]);

  const handleSaveBK = async () => {
    if (!selectedNipBK) {
      return toast.current.show({ 
        severity: 'error', 
        summary: 'Validasi', 
        detail: 'Silakan pilih Guru BK/Verifikator terlebih dahulu.' 
      });
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/bk-absensi/tindakan/${editData.ABSENSI_ID}`, {
        method: "PUT",
        headers: { 
            "Content-Type": "application/json", 
            Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          catatan: catatan,
          statusTangani: statusTangani,
          statusBaru: statusBaru,
          nipBK: selectedNipBK, // Dikirim ke backend
          kodePelanggaran: selectedPelanggaran,
          alasan: "Verifikasi oleh Superadmin"
        }),
      });

      const json = await response.json();
      
      if (response.ok && json.status === "00") {
        toast.current.show({ severity: 'success', summary: 'Sukses', detail: 'Data berhasil diverifikasi' });
        setTimeout(() => {
            onSaveSuccess();
            onHide();
        }, 500);
      } else {
        throw new Error(json.message || "Gagal menyimpan data");
      }
    } catch (error) {
      toast.current.show({ severity: 'error', summary: 'Gagal', detail: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toast ref={toast} />
      <Dialog 
        header="Mode Superadmin: Penugasan BK" 
        visible={visible} 
        style={{ width: "450px" }} 
        modal 
        onHide={onHide}
        footer={
          <div className="flex justify-content-end gap-2 p-3">
            <Button label="Batal" icon="pi pi-times" onClick={onHide} className="p-button-text p-button-secondary" />
            <Button label="Simpan Verifikasi" icon="pi pi-check" onClick={handleSaveBK} loading={loading} />
          </div>
        }
      >
        <div className="p-fluid">
            {/* Informasi Siswa */}
            <div className="mb-4 text-sm font-bold text-700">
                Siswa: {editData?.siswa?.NAMA || editData?.NAMA} ({editData?.KELAS_ID})
            </div>

            {/* DROPDOWN PILIH GURU BK */}
            <div className="field mb-4">
                <label className="font-bold text-sm text-primary">Pilih Guru BK/Verifikator</label>
                <Dropdown 
                    value={selectedNipBK} 
                    options={listGuruBK} 
                    optionLabel="NAMA" // Sesuaikan dengan field nama di DB
                    optionValue="NIP"  // Sesuaikan dengan field NIP di DB
                    onChange={(e) => setSelectedNipBK(e.value)} 
                    placeholder="-- Pilih Guru Penanggung Jawab --"
                    filter // Supaya bisa mencari nama guru dengan mengetik
                    showClear
                    className={!selectedNipBK ? "p-invalid" : ""}
                />
                <small className="text-500">Pilih guru yang memberikan pembinaan.</small>
            </div>

            <div className="field mb-3">
                <label className="font-bold text-sm">Status Absensi</label>
                <Dropdown 
                    value={statusBaru} 
                    options={opsiKategoriAbsen} 
                    onChange={(e) => setStatusBaru(e.value)} 
                    placeholder="Update Status"
                />
            </div>

            <div className="field mb-3">
                <label className="font-bold text-sm">Kategori Pelanggaran</label>
                <Dropdown 
                    value={selectedPelanggaran} 
                    options={masterPelanggaran} 
                    optionLabel="NAMA_PELANGGARAN" 
                    optionValue="KODE_PELANGGARAN"
                    onChange={(e) => setSelectedPelanggaran(e.value)} 
                    placeholder="Pilih Pelanggaran"
                    filter
                />
            </div>

            <div className="field mb-3">
                <label className="font-bold text-sm">Status Penanganan</label>
                <SelectButton 
                    value={statusTangani} 
                    options={opsiStatusTangani} 
                    onChange={(e) => setStatusTangani(e.value)} 
                />
            </div>

            <div className="field">
                <label className="font-bold text-sm">Catatan Pembinaan</label>
                <InputTextarea 
                    value={catatan} 
                    onChange={(e) => setCatatan(e.target.value)} 
                    rows={3} 
                    placeholder="Contoh: Siswa sudah dipanggil dan diberikan arahan..."
                    autoResize
                />
            </div>
        </div>
      </Dialog>
    </>
  );
};

export default FormBK;