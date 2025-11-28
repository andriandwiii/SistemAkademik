"use client";

import { useState, useRef, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import SignatureCanvas from "react-signature-canvas";

const FormAbsensiGuru = ({
  visible,
  onHide,
  onSave,       
  isLoading,    
  userNip,      
  guruOptions   
}) => {
  const toast = useRef(null);
  // PERBAIKAN 1: Gunakan null untuk inisialisasi ref
  const sigCanvas = useRef(null); 

  // --- STATE FORM ---
  const [selectedNip, setSelectedNip] = useState(null);
  const [status, setStatus] = useState("Hadir");
  const [keterangan, setKeterangan] = useState("");
  
  // State Khusus Hadir
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [foto, setFoto] = useState(null);
  
  // State UI
  const [loadingLokasi, setLoadingLokasi] = useState(false);

  // Opsi Status
  const statusOptions = [
    { label: "Hadir", value: "Hadir" },
    { label: "Izin", value: "Izin" },
    { label: "Sakit", value: "Sakit" },
    { label: "Dinas Luar", value: "Dinas Luar" },
  ];

  // --- RESET FORM SAAT DIALOG DIBUKA ---
  useEffect(() => {
    if (visible) {
      setSelectedNip(userNip || null); 
      setStatus("Hadir");
      setKeterangan("");
      setLatitude(null);
      setLongitude(null);
      setFoto(null);
      
      // Bersihkan Canvas TTD
      setTimeout(() => {
         // Cek apakah ref sudah terpasang
         if (sigCanvas.current) sigCanvas.current.clear();
      }, 100);
    }
  }, [visible, userNip]);

  // === 1. FUNGSI AMBIL LOKASI (GEOLOCATION) ===
  const handleAmbilLokasi = () => {
    setLoadingLokasi(true);

    if (!navigator.geolocation) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Browser tidak support GPS' });
      setLoadingLokasi(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setLoadingLokasi(false);
        toast.current?.show({ severity: 'success', summary: 'Berhasil', detail: 'Lokasi terkunci!' });
      },
      (error) => {
        let msg = "Gagal mengambil lokasi.";
        if (error.code === 1) msg = "Izin lokasi ditolak. Aktifkan GPS!";
        else if (error.code === 2) msg = "Sinyal GPS lemah.";
        console.error(error);
        toast.current?.show({ severity: 'error', summary: 'Gagal', detail: msg });
        setLoadingLokasi(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // === 2. HANDLE FILE FOTO ===
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { 
        toast.current?.show({ severity: 'warn', summary: 'Terlalu Besar', detail: 'Max ukuran 5MB' });
        return;
      }
      setFoto(file);
    }
  };

  // === 3. SUBMIT DATA ===
  const handleSubmit = () => {
    // 1. Validasi NIP Guru
    if (!selectedNip) {
        toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Silakan pilih Guru terlebih dahulu.' });
        return;
    }

    // 2. Validasi Kelengkapan Berdasarkan Status
    if (status === 'Hadir') {
      if (!latitude || !longitude) {
        toast.current?.show({ severity: 'warn', summary: 'Lokasi Kosong', detail: 'Klik tombol ambil lokasi dulu.' });
        return;
      }
      if (!foto) {
        toast.current?.show({ severity: 'warn', summary: 'Foto Kosong', detail: 'Wajib upload foto selfie.' });
        return;
      }
      // Cek apakah canvas kosong
      if (sigCanvas.current && sigCanvas.current.isEmpty()) {
        toast.current?.show({ severity: 'warn', summary: 'TTD Kosong', detail: 'Tanda tangan wajib diisi.' });
        return;
      }
    } else {
        if (!keterangan) {
            toast.current?.show({ severity: 'warn', summary: 'Keterangan Kosong', detail: 'Wajib isi alasan izin/sakit.' });
            return;
        }
    }

    // 3. Susun FormData
    const formData = new FormData();
    formData.append("NIP", selectedNip);
    formData.append("STATUS", status);

    if (status === 'Hadir') {
        formData.append("LATITUDE", latitude);
        formData.append("LONGITUDE", longitude);
        
        // --- PERBAIKAN UTAMA DI SINI ---
        // Jangan pakai getTrimmedCanvas(), langsung toDataURL()
        // Ini menghindari error webpack dan lebih stabil
        const ttdBase64 = sigCanvas.current.toDataURL("image/png");
        formData.append("TANDA_TANGAN_MASUK", ttdBase64);

        formData.append("FOTO_MASUK", foto);
    } else {
        formData.append("KETERANGAN", keterangan);
    }

    // Kirim ke Parent
    onSave(formData);
  };

  return (
    <Dialog
      header="Form Absensi Guru"
      visible={visible}
      style={{ width: "95vw", maxWidth: "500px" }}
      modal
      onHide={onHide}
      className="p-fluid"
      blockScroll
      appendTo="self" // Tambahan agar Dropdown tidak tertutup (opsional, tapi aman)
    >
      <Toast ref={toast} />

      <div className="flex flex-column gap-3">
        
        {/* 1. PILIH GURU (DROPDOWN) */}
        <div className="field">
            <label className="font-bold">Nama Guru</label>
            <Dropdown 
                value={selectedNip} 
                onChange={(e) => setSelectedNip(e.value)} 
                options={guruOptions} 
                optionLabel="label" 
                optionValue="value"
                placeholder="Pilih Guru..." 
                filter 
                className="w-full"
                appendTo="self" 
                emptyMessage="Data guru tidak ditemukan"
            />
            {selectedNip && <small className="text-gray-500">NIP: {selectedNip}</small>}
        </div>

        {/* 2. PILIH STATUS */}
        <div className="field">
          <label className="font-bold">Status Kehadiran</label>
          <Dropdown
            value={status}
            options={statusOptions}
            onChange={(e) => setStatus(e.value)}
            placeholder="Pilih Status"
            className="w-full"
            appendTo="self"
          />
        </div>

        {/* --- FORM KHUSUS HADIR --- */}
        {status === "Hadir" && (
          <>
            {/* Lokasi */}
            <div className="field">
              <label className="font-bold">Lokasi (GPS)</label>
              <div className="flex gap-2">
                 <InputText 
                    value={latitude ? `${latitude}, ${longitude}` : ""} 
                    placeholder="Koordinat kosong" 
                    readOnly 
                    className="flex-1"
                 />
                 <Button 
                    icon={loadingLokasi ? "pi pi-spin pi-spinner" : "pi pi-map-marker"} 
                    className="p-button-warning w-4rem" 
                    onClick={handleAmbilLokasi}
                    disabled={loadingLokasi}
                    tooltip="Ambil Lokasi"
                 />
              </div>
              {latitude && (
                  <small className="text-green-600">
                    <i className="pi pi-check-circle mr-1"></i>Lokasi berhasil diambil.
                  </small>
              )}
            </div>

            {/* Upload Foto */}
            <div className="field">
              <label className="font-bold">Foto Selfie</label>
              <div className="border-1 border-300 border-round p-3 surface-50">
                  <input 
                    type="file" 
                    accept="image/*" 
                    capture="user" 
                    onChange={handleFileChange} 
                    className="w-full"
                  />
                  {foto && (
                      <div className="mt-2 text-sm text-green-600 font-semibold">
                          <i className="pi pi-image mr-1"></i>{foto.name}
                      </div>
                  )}
              </div>
            </div>

            {/* Tanda Tangan */}
            <div className="field">
              <label className="font-bold mb-2 block">Tanda Tangan Digital</label>
              <div className="border-1 border-400 border-round surface-0 relative" style={{ height: '160px' }}>
                <SignatureCanvas
                  ref={sigCanvas}
                  penColor="black"
                  backgroundColor="white"
                  canvasProps={{ className: "w-full h-full" }}
                />
                {/* Tombol Clear TTD */}
                <Button 
                    icon="pi pi-refresh" 
                    className="absolute top-0 right-0 m-1 p-button-rounded p-button-secondary p-button-text" 
                    onClick={() => sigCanvas.current.clear()}
                    tooltip="Ulangi TTD"
                />
              </div>
              <small className="text-gray-500">Tanda tangan di dalam kotak.</small>
            </div>
          </>
        )}

        {/* --- FORM KHUSUS IZIN/SAKIT --- */}
        {status !== "Hadir" && (
            <div className="field">
                <label className="font-bold">Keterangan / Alasan</label>
                <InputTextarea 
                    rows={4} 
                    value={keterangan}
                    onChange={(e) => setKeterangan(e.target.value)}
                    placeholder="Contoh: Sakit demam, Izin ada acara keluarga..."
                />
            </div>
        )}

        {/* BUTTON ACTION */}
        <div className="flex justify-content-end gap-2 mt-3 pt-3 border-top-1 border-200">
          <Button
            label="Batal"
            icon="pi pi-times"
            severity="secondary"
            onClick={onHide}
            disabled={isLoading}
            text
          />
          <Button
            label={isLoading ? "Menyimpan..." : "Simpan Data"}
            icon="pi pi-check"
            onClick={handleSubmit}
            disabled={isLoading || loadingLokasi}
            severity="primary"
          />
        </div>

      </div>
    </Dialog>
  );
};

export default FormAbsensiGuru;