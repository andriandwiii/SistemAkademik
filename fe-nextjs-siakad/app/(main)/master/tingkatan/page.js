"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "primereact/button";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import ToastNotifier from "../../../components/ToastNotifier";
import CustomDataTable from "../../../components/DataTable";
import FormTingkatan from "./components/FormTingkatan";

export default function MasterTingkatanPage() {
  const toastRef = useRef(null);
  const isMounted = useRef(true);

  const [tingkatanList, setTingkatanList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTingkatan, setSelectedTingkatan] = useState(null);
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
    if (token) fetchTingkatan();
  }, [token]);

  const fetchTingkatan = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/master-tingkatan`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!isMounted.current) return;

      setTingkatanList(json.data || []);
    } catch (err) {
      console.error(err);
      toastRef.current?.showToast("01", "Gagal memuat data tingkatan");
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  };

  const handleSubmit = async (data) => {
    try {
      if (dialogMode === "add") {
        await fetch(`${API_URL}/master-tingkatan`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        });
        toastRef.current?.showToast("00", "Tingkatan berhasil ditambahkan");
      } else if (dialogMode === "edit" && selectedTingkatan) {
        await fetch(`${API_URL}/master-tingkatan/${selectedTingkatan.TINGKATAN_ID}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        });
        toastRef.current?.showToast("00", "Tingkatan berhasil diperbarui");
      }

      if (isMounted.current) {
        await fetchTingkatan();
        setDialogMode(null);
        setSelectedTingkatan(null);
      }
    } catch (err) {
      console.error(err);
      toastRef.current?.showToast("01", "Gagal menyimpan tingkatan");
    }
  };

  const handleDelete = (rowData) => {
    confirmDialog({
      message: `Yakin ingin menghapus tingkatan "${rowData.TINGKATAN}"?`,
      header: "Konfirmasi Hapus",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Hapus",
      rejectLabel: "Batal",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await fetch(`${API_URL}/master-tingkatan/${rowData.TINGKATAN_ID}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
          toastRef.current?.showToast("00", "Tingkatan berhasil dihapus");
          if (isMounted.current) await fetchTingkatan();
        } catch (err) {
          console.error(err);
          toastRef.current?.showToast("01", "Gagal menghapus tingkatan");
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
          setSelectedTingkatan(rowData);
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
    { field: "TINGKATAN_ID", header: "ID", style: { width: "60px" } },
    { field: "TINGKATAN", header: "Tingkatan", style: { minWidth: "150px" } },
    { field: "STATUS", header: "Status", style: { width: "120px" } },
    { header: "Actions", body: actionBodyTemplate, style: { width: "120px" } },
  ];

  return (
    <div className="card p-4">
      <h3 className="text-xl font-semibold mb-4">Master Tingkatan</h3>

      <div className="flex justify-content-end mb-3">
        <Button
          label="Tambah Tingkatan"
          icon="pi pi-plus"
          onClick={() => {
            setDialogMode("add");
            setSelectedTingkatan(null);
          }}
        />
      </div>

      <CustomDataTable data={tingkatanList} loading={isLoading} columns={columns} />

      <ConfirmDialog />

      <FormTingkatan
        visible={dialogMode !== null}
        onHide={() => {
          setDialogMode(null);
          setSelectedTingkatan(null);
        }}
        selectedTingkatan={selectedTingkatan}
        onSave={handleSubmit}
      />

      <ToastNotifier ref={toastRef} />
    </div>
  );
}
