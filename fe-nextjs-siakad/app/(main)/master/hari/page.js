"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "primereact/button";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import ToastNotifier from "../../../components/ToastNotifier";
import CustomDataTable from "../../../components/DataTable";
import FormHari from "./components/FormHari";

export default function MasterHariPage() {
  const toastRef = useRef(null);
  const isMounted = useRef(true);

  const [hariList, setHariList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedHari, setSelectedHari] = useState(null);
  const [dialogMode, setDialogMode] = useState(null);
  const [token, setToken] = useState("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Ambil token
  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) window.location.href = "/";
    else setToken(t);

    return () => {
      isMounted.current = false;
      toastRef.current = null;
    };
  }, []);

  // Fetch data hari
  useEffect(() => {
    if (token) fetchHari();
  }, [token]);

  const fetchHari = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/master-hari`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!isMounted.current) return;

      setHariList(json.data || []);
    } catch (err) {
      console.error(err);
      toastRef.current?.showToast("01", "Gagal memuat data hari");
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  };

  const handleSubmit = async (data) => {
    try {
      if (dialogMode === "add") {
        await fetch(`${API_URL}/master-hari`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        });
        toastRef.current?.showToast("00", "Hari berhasil ditambahkan");
      } else if (dialogMode === "edit" && selectedHari) {
        await fetch(`${API_URL}/master-hari/${selectedHari.HARI_ID}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        });
        toastRef.current?.showToast("00", "Hari berhasil diperbarui");
      }

      if (isMounted.current) {
        await fetchHari();
        setDialogMode(null);
        setSelectedHari(null);
      }
    } catch (err) {
      console.error(err);
      toastRef.current?.showToast("01", "Gagal menyimpan hari");
    }
  };

  const handleDelete = (rowData) => {
    confirmDialog({
      message: `Yakin ingin menghapus hari "${rowData.NAMA_HARI}"?`,
      header: "Konfirmasi Hapus",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Hapus",
      rejectLabel: "Batal",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await fetch(`${API_URL}/master-hari/${rowData.HARI_ID}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
          toastRef.current?.showToast("00", "Hari berhasil dihapus");
          if (isMounted.current) await fetchHari();
        } catch (err) {
          console.error(err);
          toastRef.current?.showToast("01", "Gagal menghapus hari");
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
          setSelectedHari(rowData);
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

  const columns = [
    { field: "HARI_ID", header: "ID", style: { width: "60px" } },
    { field: "NAMA_HARI", header: "Nama Hari", style: { minWidth: "150px" } },
    { field: "STATUS", header: "Status", style: { width: "120px" } },
    { header: "Actions", body: actionBodyTemplate, style: { width: "120px" } },
  ];

  return (
    <div className="card p-4">
      <h3 className="text-xl font-semibold mb-4">Master Hari</h3>

      <div className="flex justify-content-end mb-3">
        <Button
          label="Tambah Hari"
          icon="pi pi-plus"
          onClick={() => {
            setDialogMode("add");
            setSelectedHari(null);
          }}
        />
      </div>

      <CustomDataTable data={hariList} loading={isLoading} columns={columns} />

      <ConfirmDialog />

      <FormHari
        visible={dialogMode !== null}
        onHide={() => {
          setDialogMode(null);
          setSelectedHari(null);
        }}
        selectedHari={selectedHari}
        onSave={handleSubmit}
      />

      <ToastNotifier ref={toastRef} />
    </div>
  );
}
