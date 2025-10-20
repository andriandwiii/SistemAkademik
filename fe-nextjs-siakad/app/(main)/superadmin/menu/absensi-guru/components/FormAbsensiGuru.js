"use client";

import { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";

const SEKOLAH_COORDS = { lat: -7.556, lng: 110.831 };

export default function FormAbsensiGuru({
  visible,
  onHide,
  onSave,
  guruOptions,
  selectedAbsensi, // <-- tambah props
  mode, // 'add' atau 'edit'
}) {
  const [guruId, setGuruId] = useState(null);
  const [tanggal, setTanggal] = useState("");
  const [jamMasuk, setJamMasuk] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [jarakSekolah, setJarakSekolah] = useState("");
  const [status, setStatus] = useState("Hadir");

  // Inisialisasi form untuk add atau edit
  useEffect(() => {
    if (visible) {
      if (selectedAbsensi && mode === "edit") {
        // edit mode
        setGuruId(selectedAbsensi.GURU_ID || null);
        setTanggal(selectedAbsensi.TANGGAL?.split("T")[0] || "");
        setJamMasuk(selectedAbsensi.JAM_MASUK || "");
        setLatitude(selectedAbsensi.LATITUDE || "");
        setLongitude(selectedAbsensi.LONGITUDE || "");
        setJarakSekolah(selectedAbsensi.JARAK_SEKOLAH || "");
        setStatus(selectedAbsensi.STATUS || "Hadir");
      } else {
        // add mode
        setTanggal(new Date().toISOString().split("T")[0]);
        setJamMasuk("");
        setLatitude("");
        setLongitude("");
        setJarakSekolah("");
        setStatus("Hadir");
        setGuruId(null);
      }
    }
  }, [visible, selectedAbsensi, mode]);

  // Ambil lokasi guru
  const handleGetLocation = () => {
    if (!navigator.geolocation) return alert("GPS tidak tersedia");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLatitude(lat);
        setLongitude(lng);
        setJarakSekolah(
          calculateDistance(lat, lng, SEKOLAH_COORDS.lat, SEKOLAH_COORDS.lng)
        );
      },
      () => alert("Gagal mendapatkan lokasi. Pastikan GPS aktif")
    );
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371000;
    const toRad = (deg) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  };

  // Check-In otomatis hanya untuk add
  const handleCheckIn = () => {
    if (!guruId) return alert("Pilih guru terlebih dahulu");
    const now = new Date();
    const jam = now.toTimeString().split(" ")[0].substring(0, 5); // HH:MM
    setJamMasuk(jam);
    handleGetLocation();
  };

  const handleSubmit = () => {
    if (!guruId || !jamMasuk) return alert("Lakukan Check-In terlebih dahulu!");

    const payload = {
      GURU_ID: guruId,
      TANGGAL: tanggal,
      JAM_MASUK: jamMasuk,
      LATITUDE: latitude,
      LONGITUDE: longitude,
      JARAK_SEKOLAH: jarakSekolah,
      STATUS: status,
    };

    onSave(payload);
  };

  return (
    <Dialog
      header={mode === "add" ? "Tambah Absensi Guru (Check-In)" : "Edit Absensi Guru"}
      visible={visible}
      modal
      onHide={onHide}
      style={{ width: "35vw" }}
    >
      <div className="p-fluid">
        {/* Pilih Guru */}
        <div className="field">
          <label>Guru</label>
          <Dropdown
            value={guruId}
            options={guruOptions}
            onChange={(e) => setGuruId(e.value)}
            placeholder="Pilih Guru"
            showClear
            filter
            disabled={mode === "edit"} // tidak bisa ganti guru saat edit
          />
        </div>

        {/* Tanggal */}
        <div className="field">
          <label>Tanggal</label>
          <InputText value={tanggal} readOnly />
        </div>

        {/* Tombol Check-In hanya untuk add */}
        {mode === "add" && (
          <div className="field flex gap-2 mb-3">
            <Button
              label="Check In"
              icon="pi pi-sign-in"
              onClick={handleCheckIn}
              disabled={!!jamMasuk}
            />
          </div>
        )}

        {/* Jam Masuk */}
        <div className="field">
          <label>Jam Masuk</label>
          <InputText value={jamMasuk} readOnly={mode === "add"} /> 
        </div>

        {/* Lokasi */}
        <div className="field flex gap-2 align-items-center">
          <Button
            label="Dapatkan Lokasi"
            icon="pi pi-map-marker"
            onClick={handleGetLocation}
          />
        </div>

        <div className="field">
          <label>Latitude</label>
          <InputText value={latitude} readOnly />
        </div>

        <div className="field">
          <label>Longitude</label>
          <InputText value={longitude} readOnly />
        </div>

        <div className="field">
          <label>Jarak Sekolah (meter)</label>
          <InputText value={jarakSekolah} readOnly />
        </div>

        {/* Status */}
        <div className="field">
          <label>Status</label>
          <Dropdown
            value={status}
            options={["Hadir", "Terlambat", "Izin", "Sakit", "Alpa"].map(
              (s) => ({ label: s, value: s })
            )}
            onChange={(e) => setStatus(e.value)}
          />
        </div>

        {/* Tombol Simpan */}
        <div className="flex justify-content-end gap-2 mt-3">
          <Button label="Batal" className="p-button-text" onClick={onHide} />
          <Button
            label="Simpan"
            icon="pi pi-check"
            onClick={handleSubmit}
            disabled={!jamMasuk}
          />
        </div>
      </div>
    </Dialog>
  );
}
