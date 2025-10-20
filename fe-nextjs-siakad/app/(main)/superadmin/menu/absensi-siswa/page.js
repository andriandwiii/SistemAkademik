"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import ToastNotifier from "../../../../components/ToastNotifier";
import CustomDataTable from "../../../../components/DataTable";
import FormAbsensiSiswa from "./components/FormAbsensiSiswa";

export default function AbsensiSiswaPage() {
  const toastRef = useRef(null);
  const isMounted = useRef(true);
  const [absensi, setAbsensi] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAbsensi, setSelectedAbsensi] = useState(null);
  const [dialogMode, setDialogMode] = useState(null);
  const [token, setToken] = useState("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) window.location.href = "/";
    else setToken(t);

    return () => {
      isMounted.current = false;
      toastRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (token) fetchAbsensi();
  }, [token]);

  const fetchAbsensi = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/absensi/siswa`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!isMounted.current) return;
      setAbsensi(json.data || []);
    } catch (err) {
      console.error(err);
      toastRef.current?.showToast("01", "Gagal memuat data absensi");
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  };

  const handleSubmit = async (data) => {
    try {
      if (dialogMode === "add") {
        await fetch(`${API_URL}/absensi/siswa`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        });
        toastRef.current?.showToast("00", "Absensi berhasil ditambahkan");
      } else if (dialogMode === "edit" && selectedAbsensi) {
        await fetch(`${API_URL}/absensi/siswa/${selectedAbsensi.ABSENSI_ID}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        });
        toastRef.current?.showToast("00", "Absensi berhasil diperbarui");
      }

      if (isMounted.current) {
        await fetchAbsensi();
        setDialogMode(null);
        setSelectedAbsensi(null);
      }
    } catch (err) {
      console.error(err);
      toastRef.current?.showToast("01", "Gagal menyimpan absensi");
    }
  };

  const handleDelete = (rowData) => {
    confirmDialog({
      message: `Yakin ingin menghapus absensi siswa "${rowData.siswa?.NAMA}"?`,
      header: "Konfirmasi Hapus",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Hapus",
      rejectLabel: "Batal",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await fetch(`${API_URL}/absensi/siswa/${rowData.ABSENSI_ID}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
          toastRef.current?.showToast("00", "Absensi berhasil dihapus");
          if (isMounted.current) await fetchAbsensi();
        } catch (err) {
          console.error(err);
          toastRef.current?.showToast("01", "Gagal menghapus absensi");
        }
      },
    });
  };

  const actionBodyTemplate = (rowData) => (
    <div className="flex gap-2">
      <Button
        icon="pi pi-pencil"
        size="small"
        severity="warning"
        onClick={() => {
          setSelectedAbsensi(rowData);
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

  // ✅ Fungsi bantu untuk format tanggal ke Indonesia
  const formatTanggal = (isoDate) => {
    if (!isoDate) return "-";
    try {
      return new Date(isoDate).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    } catch {
      return isoDate;
    }
  };

  const columns = [
    { field: "ABSENSI_ID", header: "ID", style: { width: "60px" } },
    {
      header: "Nama Siswa",
      body: (row) => (
        <div>
          <div className="font-medium">{row.siswa?.NAMA || "-"}</div>
          <small className="text-gray-500">({row.siswa?.NIS || "-"})</small>
        </div>
      ),
    },
    {
      header: "Jadwal",
      body: (row) =>
        row.jadwal
          ? `${row.jadwal.NAMA_MAPEL || "-"} - ${row.jadwal.NAMA_KELAS || "-"} (${row.jadwal.NAMA_HARI || "-"}) | ${row.jadwal.NAMA_GURU || "-"} [${row.jadwal.JAM_MULAI || "-"} - ${row.jadwal.JAM_SELESAI || "-"}]`
          : "-",
    },
    {
      header: "Tanggal",
      body: (row) => formatTanggal(row.TANGGAL),
    },
    { field: "JAM_ABSEN", header: "Jam Absen" },
    { field: "STATUS", header: "Status" },
    { field: "KETERANGAN", header: "Keterangan" },
    { header: "Aksi", body: actionBodyTemplate, style: { width: "120px" } },
  ];

  return (
    <div className="card p-4">
      <h3 className="text-xl font-semibold mb-4">Absensi Siswa</h3>

      <div className="flex justify-content-end mb-3">
        <Button
          label="Tambah Absensi"
          icon="pi pi-plus"
          onClick={() => {
            setDialogMode("add");
            setSelectedAbsensi(null);
          }}
        />
      </div>

      <CustomDataTable data={absensi} loading={isLoading} columns={columns} />

      <ConfirmDialog />

      <FormAbsensiSiswa
        visible={dialogMode !== null}
        onHide={() => {
          setDialogMode(null);
          setSelectedAbsensi(null);
        }}
        onSave={handleSubmit}
        selectedAbsensi={selectedAbsensi}
        token={token}
      />

      <ToastNotifier ref={toastRef} />
    </div>
  );
}
    