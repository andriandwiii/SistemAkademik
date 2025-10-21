"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import ToastNotifier from "../../../components/ToastNotifier";
import CustomDataTable from "../../../components/DataTable";
import FormTahunAjaran from "./components/FormTahunAjaran";

export default function MasterTahunAjaranPage() {
  const toastRef = useRef(null);
  const isMounted = useRef(true);

  const [tahunAjaran, setTahunAjaran] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTahunAjaran, setSelectedTahunAjaran] = useState(null);
  const [dialogMode, setDialogMode] = useState(null);
  const [token, setToken] = useState("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Ambil token
  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) window.location.href = "/";
    else setToken(t);
  }, []);

  // Ambil data
  useEffect(() => {
    if (token) fetchTahunAjaran();
  }, [token]);

  // Cleanup
  useEffect(() => {
    return () => {
      isMounted.current = false;
      toastRef.current = null;
    };
  }, []);

  // Fetch tahun ajaran
  const fetchTahunAjaran = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/master-tahun-ajaran`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!isMounted.current) return;
      setTahunAjaran(json.data || []);
      setFilteredData(json.data || []);
    } catch (err) {
      console.error(err);
      toastRef.current?.showToast("01", "Gagal memuat data tahun ajaran");
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  };

  // Filter pencarian
  const handleSearch = (term) => {
    setSearchTerm(term);
    if (!term.trim()) {
      setFilteredData(tahunAjaran);
      return;
    }

    const filtered = tahunAjaran.filter((item) =>
      Object.values(item).some((value) =>
        String(value).toLowerCase().includes(term.toLowerCase())
      )
    );
    setFilteredData(filtered);
  };

  // Tambah / Edit data
  const handleSubmit = async (data) => {
    if (!dialogMode) return;

    try {
      let res;
      if (dialogMode === "add") {
        res = await fetch(`${API_URL}/master-tahun-ajaran`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        });
      } else if (dialogMode === "edit" && selectedTahunAjaran) {
        res = await fetch(
          `${API_URL}/master-tahun-ajaran/${selectedTahunAjaran.ID}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
          }
        );
      }

      const result = await res.json();

      if (result.status === "00" || result.status === "success") {
        toastRef.current?.showToast("00", "Tahun ajaran berhasil disimpan");
        await fetchTahunAjaran();
        setDialogMode(null);
        setSelectedTahunAjaran(null);
      } else {
        toastRef.current?.showToast("01", "Gagal menyimpan tahun ajaran");
      }
    } catch (err) {
      console.error(err);
      toastRef.current?.showToast("01", "Terjadi kesalahan server");
    }
  };

  // Hapus data
  const handleDelete = (rowData) => {
    confirmDialog({
      message: `Yakin ingin menghapus tahun ajaran "${rowData.NAMA_TAHUN_AJARAN}"?`,
      header: "Konfirmasi Hapus",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Hapus",
      rejectLabel: "Batal",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          const res = await fetch(
            `${API_URL}/master-tahun-ajaran/${rowData.ID}`,
            {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const result = await res.json();

          if (result.status === "00" || result.status === "success") {
            toastRef.current?.showToast("00", "Tahun ajaran berhasil dihapus");
            if (isMounted.current) {
              setTahunAjaran((prev) =>
                prev.filter((t) => t.ID !== rowData.ID)
              );
              setFilteredData((prev) =>
                prev.filter((t) => t.ID !== rowData.ID)
              );
            }
          } else {
            toastRef.current?.showToast("01", "Gagal menghapus data");
          }
        } catch (err) {
          console.error(err);
          toastRef.current?.showToast("01", "Kesalahan koneksi ke server");
        }
      },
    });
  };

  // Tombol Aksi
  const actionBodyTemplate = (rowData) => (
    <div className="flex gap-2 justify-content-center">
      <Button
        icon="pi pi-pencil"
        size="small"
        rounded
        severity="warning"
        tooltip="Edit"
        onClick={() => {
          setSelectedTahunAjaran(rowData);
          setDialogMode("edit");
        }}
      />
      <Button
        icon="pi pi-trash"
        size="small"
        rounded
        severity="danger"
        tooltip="Hapus"
        onClick={() => handleDelete(rowData)}
      />
    </div>
  );

  // Kolom tabel sesuai struktur DB
  const tahunAjaranColumns = [
    { field: "ID", header: "ID", style: { width: "60px", textAlign: "center" } },
    { field: "TAHUN_AJARAN_ID", header: "Kode Tahun Ajaran", style: { width: "140px" } },
    { field: "NAMA_TAHUN_AJARAN", header: "Nama Tahun Ajaran", style: { width: "200px" } },
    { field: "STATUS", header: "Status", style: { width: "120px" } },
    { header: "Aksi", body: actionBodyTemplate, style: { width: "120px" } },
  ];

  return (
    <div className="card p-4 surface-card border-round-lg shadow-2">
      <div className="flex justify-content-between align-items-center mb-5">
        <h3 className="text-2xl font-bold text-black m-0">
          Manajemen Tahun Ajaran
        </h3>

        <div className="flex align-items-center gap-3 mt-8">
          <span className="p-input-icon-left">
            <i className="pi pi-search" />
            <InputText
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Cari tahun ajaran..."
              className="p-inputtext-sm"
              style={{ width: "260px", height: "38px" }}
            />
          </span>

          <Button
            label="Tambah"
            icon="pi pi-plus"
            severity="info"
            className="p-button-sm font-semibold"
            style={{
              height: "38px",
              backgroundColor: "#007ad9",
              border: "none",
            }}
            onClick={() => {
              setDialogMode("add");
              setSelectedTahunAjaran(null);
            }}
          />
        </div>
      </div>

      <CustomDataTable
        data={filteredData}
        loading={isLoading}
        columns={tahunAjaranColumns}
      />

      <ConfirmDialog />

      <FormTahunAjaran
        visible={dialogMode !== null}
        onHide={() => {
          setDialogMode(null);
          setSelectedTahunAjaran(null);
        }}
        selectedTahunAjaran={selectedTahunAjaran}
        onSave={handleSubmit}
      />

      <ToastNotifier ref={toastRef} />
    </div>
  );
}
