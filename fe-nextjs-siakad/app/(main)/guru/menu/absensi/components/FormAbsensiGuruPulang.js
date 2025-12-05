"use client";

import { useState, useEffect, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { InputText } from "primereact/inputtext";
import SignatureCanvas from "react-signature-canvas";

const FormAbsensiGuruPulang = ({
  visible,
  onHide,
  onSave,
  isLoading,
  currentGuru // Data guru yang login (dari parent)
}) => {
  const toast = useRef(null);
  const sigCanvas = useRef(null);

  // --- STATE ---
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [loadingLokasi, setLoadingLokasi] = useState(false);

  // Reset form saat dialog dibuka
  useEffect(() => {
    if (visible) {
      setLatitude(null);
      setLongitude(null);

      // Reset Canvas Tanda Tangan
      if (sigCanvas.current) {
        sigCanvas.current.clear();
      }
      
      // Otomatis ambil lokasi saat form dibuka
      handleAmbilLokasi();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  // --- 1. AMBIL LOKASI (GPS) ---
  const handleAmbilLokasi = () => {
    setLoadingLokasi(true);
    if (!navigator.geolocation) {
      toast.current?.show({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'Browser tidak support GPS' 
      });
      setLoadingLokasi(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setLoadingLokasi(false);
        toast.current?.show({ 
          severity: 'success', 
          summary: 'Lokasi Terkunci', 
          detail: 'Koordinat berhasil diambil.' 
        });
      },
      (error) => {
        console.error(error);
        toast.current?.show({ 
          severity: 'warn', 
          summary: 'Gagal', 
          detail: 'Pastikan GPS aktif & izinkan akses lokasi.' 
        });
        setLoadingLokasi(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // --- 2. SUBMIT ---
  const handleSubmit = () => {
    // Validasi Guru
    if (!currentGuru) {
      toast.current?.show({ 
        severity: 'warn', 
        summary: 'Peringatan', 
        detail: 'Data guru tidak ditemukan.' 
      });
      return;
    }
    
    // Validasi Lokasi
    if (!latitude || !longitude) {
       toast.current?.show({ 
         severity: 'warn', 
         summary: 'Lokasi Kosong', 
         detail: 'Silakan klik tombol refresh lokasi.' 
       });
       return;
    }

    // Validasi Tanda Tangan
    if (sigCanvas.current && sigCanvas.current.isEmpty()) {
        toast.current?.show({ 
          severity: 'warn', 
          summary: 'TTD Kosong', 
          detail: 'Tanda tangan wajib diisi.' 
        });
        return;
    }

    // Ambil Data TTD
    const ttdBase64 = sigCanvas.current.toDataURL("image/png");

    const payload = {
        NIP: currentGuru.NIP, // Otomatis dari guru yang login
        LATITUDE: latitude,
        LONGITUDE: longitude,
        TANDA_TANGAN_KELUAR: ttdBase64,
    };

    onSave(payload);
  };

  return (
    <Dialog
      header="Konfirmasi Absen Pulang"
      visible={visible}
      style={{ width: "95vw", maxWidth: "450px" }}
      modal
      onHide={onHide}
      className="p-fluid"
      blockScroll
    >
      <Toast ref={toast} />

      <div className="flex flex-column gap-3">
        
        {/* INFO HEADER */}
        <div className="text-center mb-1">
            <i className="pi pi-sign-out text-4xl text-orange-500 mb-2"></i>
            <p className="text-gray-600 m-0 text-sm">
              Pastikan data lokasi dan tanda tangan sudah benar.
            </p>
        </div>

        {/* INFO GURU YANG LOGIN */}
        {currentGuru && (
          <div className="field p-3 bg-orange-50 border-round">
            <label className="font-bold text-orange-900 mb-2 block">
              <i className="pi pi-user mr-2"></i>Guru:
            </label>
            <div className="text-lg">
              <strong>{currentGuru.NAMA}</strong>
              <br />
              <small className="text-gray-600">NIP: {currentGuru.NIP}</small>
              <br />
              <small className="text-gray-600">{currentGuru.JABATAN || "Guru"}</small>
            </div>
          </div>
        )}

        {/* STATUS LOKASI (GPS) */}
        <div className="field">
            <label className="font-bold mb-1 block">Lokasi Saat Ini (GPS)</label>
            <div className="p-inputgroup">
                <span className="p-inputgroup-addon bg-gray-100">
                    <i className={loadingLokasi ? "pi pi-spin pi-spinner" : "pi pi-map-marker text-red-500"}></i>
                </span>
                <InputText 
                    value={latitude ? `${latitude}, ${longitude}` : (loadingLokasi ? "Sedang mengambil lokasi..." : "Lokasi belum diambil")} 
                    readOnly 
                    className={latitude ? "font-medium" : "text-gray-500 italic"}
                />
                <Button 
                    icon="pi pi-refresh" 
                    onClick={handleAmbilLokasi} 
                    loading={loadingLokasi}
                    severity="secondary"
                    tooltip="Ambil Ulang Lokasi"
                />
            </div>
            {latitude && (
              <small className="text-green-600">
                <i className="pi pi-check-circle"></i> Lokasi siap disimpan.
              </small>
            )}
        </div>

        {/* TANDA TANGAN DIGITAL */}
        <div className="field">
            <label className="font-bold mb-2 block">Tanda Tangan Keluar</label>
            <div className="border-1 border-400 border-round surface-0 relative overflow-hidden" style={{ height: '180px' }}>
                <SignatureCanvas
                    ref={sigCanvas}
                    penColor="black"
                    backgroundColor="white"
                    canvasProps={{ className: "w-full h-full" }}
                />
                <Button 
                    icon="pi pi-trash" 
                    className="absolute top-0 right-0 m-2 p-button-rounded p-button-danger p-button-text p-button-sm" 
                    onClick={() => sigCanvas.current.clear()}
                    tooltip="Hapus Tanda Tangan"
                />
            </div>
            <small className="text-gray-500">Silakan tanda tangan di dalam kotak di atas.</small>
        </div>

        {/* TOMBOL AKSI */}
        <div className="flex justify-content-end gap-2 pt-3 border-top-1 border-200 mt-2">
          <Button
            label="Batal"
            icon="pi pi-times"
            severity="secondary"
            text
            onClick={onHide}
            disabled={isLoading}
          />
          <Button
            label={isLoading ? "Menyimpan..." : "Simpan & Pulang"}
            icon="pi pi-check"
            severity="primary"
            onClick={handleSubmit}
            disabled={isLoading || !latitude || !currentGuru}
          />
        </div>
      </div>
    </Dialog>
  );
};

export default FormAbsensiGuruPulang;