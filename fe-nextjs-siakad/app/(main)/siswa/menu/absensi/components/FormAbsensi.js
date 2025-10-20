'use client';

import { useState, useEffect, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";

export default function AbsensiSiswaFormModal({ isOpen, onClose, record, onSubmit, mode }) {
  const toast = useRef(null);

  const [form, setForm] = useState({
    status: "",
    lokasi: "",
  });

  const statusOptions = ["Hadir", "Izin", "Sakit", "Alpa"];

  useEffect(() => {
    if (record) {
      setForm({
        status: record.status || "",
        lokasi: record.lokasi || "",
      });
    } else {
      setForm({
        status: "",
        lokasi: "",
      });
    }
  }, [record]);

  const formatTime = (date) => {
    return date.toTimeString().split(" ")[0]; // HH:mm:ss
  };

  const handleSave = () => {
    if (!form.status) {
      toast.current?.show({
        severity: "warn",
        summary: "Validasi",
        detail: "Status wajib diisi",
      });
      return;
    }

    const today = new Date();
    const tanggal = today.toISOString().split("T")[0]; // yyyy-mm-dd
    const jamMasuk = formatTime(today);

    onSubmit({
      tanggal,
      status: form.status,
      jamMasuk: form.status === "Hadir" ? jamMasuk : "-",
      jamKeluar: "-",
      lokasi: form.status === "Hadir" ? form.lokasi : "-",
    });
  };

  const handleAmbilLokasi = () => {
    if (!navigator.geolocation) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Browser tidak mendukung geolokasi",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lokasiBaru = `${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`;
        setForm((prev) => ({ ...prev, lokasi: lokasiBaru }));
        toast.current?.show({
          severity: "success",
          summary: "Lokasi Berhasil",
          detail: lokasiBaru,
        });
      },
      (err) => {
        toast.current?.show({
          severity: "error",
          summary: "Gagal Ambil Lokasi",
          detail: err.message,
        });
      }
    );
  };

  return (
    <Dialog
      header={mode === "edit" ? "Edit Absensi" : "Tambah Absensi"}
      visible={isOpen}
      style={{ width: "30rem" }}
      modal
      onHide={onClose}
    >
      <Toast ref={toast} />

      <div className="flex flex-column gap-3">
        {/* Status */}
        <div>
          <label className="block mb-1">Status</label>
          <Dropdown
            value={form.status}
            options={statusOptions}
            onChange={(e) => setForm({ ...form, status: e.value })}
            className="w-full"
            placeholder="Pilih Status"
          />
        </div>

        {/* Lokasi */}
        <div>
          <label className="block mb-1">Lokasi Kehadiran</label>
          <div className="flex gap-2">
            <input
              className="p-inputtext w-full"
              value={form.lokasi}
              placeholder="Klik ambil lokasi"
              readOnly
              disabled={form.status !== "Hadir"}
            />
            <Button
              label="Ambil Lokasi"
              icon="pi pi-map-marker"
              severity="info"
              onClick={handleAmbilLokasi}
              disabled={form.status !== "Hadir"}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-content-end gap-2 mt-4">
        <Button label="Batal" icon="pi pi-times" severity="secondary" onClick={onClose} />
        <Button label="Simpan" icon="pi pi-check" onClick={handleSave} />
      </div>
    </Dialog>
  );
}
