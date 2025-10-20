"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "primereact/button";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import ToastNotifier from "../../../components/ToastNotifier";
import CustomDataTable from "../../../components/DataTable";
import FormKelas from "./components/FormKelas";

export default function KelasPage() {
  const toastRef = useRef(null);
  const isMounted = useRef(true);

  const [kelas, setKelas] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedKelas, setSelectedKelas] = useState(null);
  const [dialogMode, setDialogMode] = useState(null);
  const [token, setToken] = useState("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Ambil token dari localStorage
  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) window.location.href = "/";
    else setToken(t);
  }, []);

  // Fetch data kelas ketika token sudah ada
  useEffect(() => {
    if (token) fetchKelas();
  }, [token]);

  // Cleanup ketika komponen unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
      toastRef.current = null;
    };
  }, []);

  // ==============================
  // Ambil semua data kelas
  // ==============================
  const fetchKelas = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/master-kelas`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!isMounted.current) return;

      if (json.status === "00" || json.status === "success") {
        setKelas(json.data || []);
      } else {
        toastRef.current?.showToast("01", json.message || "Gagal memuat data kelas");
      }
    } catch (err) {
      console.error(err);
      toastRef.current?.showToast("01", "Gagal memuat data kelas");
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  };

  // ==============================
  // Tambah atau Update Kelas
  // ==============================
  const handleSubmit = async (data) => {
    if (!dialogMode) return;

    try {
      let res;
      if (dialogMode === "add") {
        res = await fetch(`${API_URL}/master-kelas`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        });
      } else if (dialogMode === "edit" && selectedKelas) {
        res = await fetch(`${API_URL}/master-kelas/${selectedKelas.KELAS_ID}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        });
      }

      const result = await res.json();

      if (result.status === "00" || result.status === "success") {
        toastRef.current?.showToast("00", result.message || "Kelas berhasil disimpan");
        await fetchKelas();
        setDialogMode(null);
        setSelectedKelas(null);
      } else {
        toastRef.current?.showToast("01", result.message || "Gagal menyimpan kelas");
      }
    } catch (err) {
      console.error(err);
      toastRef.current?.showToast("01", "Terjadi kesalahan saat menyimpan kelas");
    }
  };

  // ==============================
  // Hapus Data Kelas
  // ==============================
  const handleDelete = (rowData) => {
    confirmDialog({
      message: `Yakin ingin menghapus kelas "${rowData.NAMA_KELAS}"?`,
      header: "Konfirmasi Hapus",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Hapus",
      rejectLabel: "Batal",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          const res = await fetch(`${API_URL}/master-kelas/${rowData.KELAS_ID}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
          const result = await res.json();

          if (result.status === "00" || result.status === "success") {
            toastRef.current?.showToast("00", "Kelas berhasil dihapus");
            if (isMounted.current) {
              setKelas((prev) =>
                prev.filter((k) => k.KELAS_ID !== rowData.KELAS_ID)
              );
            }
          } else {
            toastRef.current?.showToast("01", result.message || "Gagal menghapus kelas");
          }
        } catch (err) {
          console.error(err);
          toastRef.current?.showToast("01", "Terjadi kesalahan saat menghapus kelas");
        }
      },
    });
  };

  // ==============================
  // Template tombol aksi
  // ==============================
  const actionBodyTemplate = (rowData) => (
    <div className="flex gap-2">
      <Button
        icon="pi pi-pencil"
        size="small"
        severity="warning"
        onClick={() => {
          setSelectedKelas(rowData);
          setDialogMode("edit");
        }}
      />
      <Button
        icon="pi pi-trash"
        size="small"
        severity="danger"
        onClick={() => handleDelete(rowData)}
      />
    </div>
  );

  // ==============================
  // Kolom DataTable
  // ==============================
  const kelasColumns = [
    { field: "KELAS_ID", header: "ID", style: { width: "60px" } },
    { field: "NAMA_KELAS", header: "Nama Kelas", filter: true },
    { field: "TINGKATAN", header: "Tingkatan", filter: true },
    { field: "NAMA_JURUSAN", header: "Jurusan", filter: true },
    { field: "NAMA_GEDUNG", header: "Gedung", filter: true },
    {
      header: "Actions",
      body: actionBodyTemplate,
      style: { width: "120px" },
    },
  ];

  return (
    <div className="card p-4">
      <h3 className="text-xl font-semibold mb-4">Manage Kelas</h3>

      <div className="flex justify-content-end mb-3">
        <Button
          label="Tambah Kelas"
          icon="pi pi-plus"
          onClick={() => {
            setDialogMode("add");
            setSelectedKelas(null);
          }}
        />
      </div>

      <CustomDataTable data={kelas} loading={isLoading} columns={kelasColumns} />

      <ConfirmDialog />

      <FormKelas
        visible={dialogMode !== null}
        onHide={() => {
          setDialogMode(null);
          setSelectedKelas(null);
        }}
        selectedKelas={selectedKelas}
        onSave={handleSubmit}
      />

      <ToastNotifier ref={toastRef} />
    </div>
  );
}
