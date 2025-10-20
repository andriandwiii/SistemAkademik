'use client';

import { useState, useRef } from "react";
import { Button } from "primereact/button";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Badge } from "primereact/badge";
import { InputText } from "primereact/inputtext";
import ToastNotifier from "../../../../components/ToastNotifier";
import CustomDataTable from "../../../../components/DataTable";
import AbsensiSiswaFormModal from "./components/FormAbsensi";

export default function AbsensiSiswaPage() {
  const toastRef = useRef(null);

  const [records, setRecords] = useState([
    {
      id: 1,
      nama: "Budi", // ini nanti harus dari tabel siswa
      tanggal: "2025-10-02",
      status: "Hadir",
      jamMasuk: "07:15:00",
      jamKeluar: "-",
      lokasi: { lat: -7.2501234, lng: 112.7689876 },
    },
    {
      id: 2,
      nama: "Siti",
      tanggal: "2025-10-01",
      status: "Izin",
      jamMasuk: "-",
      jamKeluar: "-",
      lokasi: "-",
    },
  ]);

  const [selectedRecord, setSelectedRecord] = useState(null);
  const [dialogMode, setDialogMode] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");

  const handleSubmit = (data) => {
    if (!dialogMode) return;

    let cleanedData = { ...data };

    if (dialogMode === "add") {
      const newData = {
        id: Date.now(),
        nama: "Budi", // sementara fixed, nanti ambil dari login siswa
        ...cleanedData,
      };
      setRecords((prev) => [...prev, newData]);
      toastRef.current?.showToast("00", "Absensi berhasil ditambahkan");
    }

    setDialogMode(null);
    setSelectedRecord(null);
  };

  const handleDelete = (row) => {
    confirmDialog({
      message: `Yakin ingin menghapus absensi "${row.nama}" tanggal "${row.tanggal}"?`,
      header: "Konfirmasi Hapus",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Hapus",
      rejectLabel: "Batal",
      acceptClassName: "p-button-danger",
      accept: () => {
        setRecords((prev) => prev.filter((r) => r.id !== row.id));
        toastRef.current?.showToast("00", "Absensi berhasil dihapus");
      },
    });
  };

  const actionBodyTemplate = (row) => (
    <div className="flex gap-2">
      {row.status === "Hadir" && row.jamKeluar === "-" && (
        <Button
          label="Check Out"
          icon="pi pi-sign-out"
          size="small"
          severity="success"
          onClick={() => {
            const now = new Date();
            const jamKeluar = now.toTimeString().split(" ")[0]; // HH:mm:ss
            setRecords((prev) =>
              prev.map((r) => (r.id === row.id ? { ...r, jamKeluar } : r))
            );
            toastRef.current?.showToast("00", "Check Out berhasil");
          }}
        />
      )}
      <Button
        icon="pi pi-trash"
        size="small"
        severity="danger"
        onClick={() => handleDelete(row)}
      />
    </div>
  );

  const statusTemplate = (row) => {
    let severity = "secondary";
    switch (row.status) {
      case "Hadir":
        severity = "success";
        break;
      case "Izin":
        severity = "info";
        break;
      case "Sakit":
        severity = "warning";
        break;
      case "Alpa":
        severity = "danger";
        break;
    }
    return <Badge value={row.status} severity={severity} />;
  };

  const lokasiTemplate = (row) => {
    if (!row.lokasi || row.lokasi === "-") return "-";

    if (typeof row.lokasi === "object" && row.lokasi.lat && row.lokasi.lng) {
      return `Lat: ${row.lokasi.lat.toFixed(6)}, Lng: ${row.lokasi.lng.toFixed(6)}`;
    }

    if (typeof row.lokasi === "string") {
      const [lat, lng] = row.lokasi.split(",");
      if (lat && lng) {
        return `Lat: ${parseFloat(lat).toFixed(6)}, Lng: ${parseFloat(lng).toFixed(6)}`;
      }
      return row.lokasi;
    }

    return "-";
  };

  const columns = [
  
    { field: "tanggal", header: "Tanggal", filter: true },
    { field: "status", header: "Status", body: statusTemplate, filter: true },
    { field: "jamMasuk", header: "Jam Masuk" },
    { field: "jamKeluar", header: "Jam Keluar" },
    { field: "lokasi", header: "Lokasi", body: lokasiTemplate },
    { header: "Aksi", body: actionBodyTemplate, style: { width: "200px" } },
  ];

  const filteredRecords = records.filter(
    (r) =>
      r.nama.toLowerCase().includes(globalFilter.toLowerCase()) ||
      r.tanggal.toLowerCase().includes(globalFilter.toLowerCase()) ||
      r.status.toLowerCase().includes(globalFilter.toLowerCase())
  );

  return (
    <div className="card p-4">
      <h3 className="text-xl font-semibold mb-4">Absensi Siswa</h3>

      <div className="flex justify-content-end gap-3 mb-3">
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            placeholder="Cari nama, tanggal atau status..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
        </span>
        <Button
          label="Tambah Absensi"
          icon="pi pi-plus"
          onClick={() => {
            setDialogMode("add");
            setSelectedRecord(null);
          }}
        />
      </div>

      <CustomDataTable data={filteredRecords} loading={isLoading} columns={columns} />

      <ConfirmDialog />

      <AbsensiSiswaFormModal
        isOpen={dialogMode !== null}
        onClose={() => {
          setDialogMode(null);
          setSelectedRecord(null);
        }}
        record={selectedRecord}
        onSubmit={handleSubmit}
        mode={dialogMode}
      />

      <ToastNotifier ref={toastRef} />
    </div>
  );
}
