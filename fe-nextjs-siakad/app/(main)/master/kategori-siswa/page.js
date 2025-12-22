"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import ToastNotifier from "../../../components/ToastNotifier";
import FormKategoriSiswa from "./components/FormKategoriSiswa";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function KategoriSiswaPage() {
  const toastRef = useRef(null);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selected, setSelected] = useState(null);

  const fetchKategori = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/master-kategori-siswa`);
      setData(res.data.data || []);
    } catch {
      toastRef.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Gagal mengambil data kategori",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKategori();
  }, []);

  const onAdd = () => {
    setSelected(null);
    setDialogVisible(true);
  };

  const onEdit = (row) => {
    setSelected(row);
    setDialogVisible(true);
  };

  const onDelete = async (row) => {
    if (!confirm(`Nonaktifkan kategori "${row.NAMA_KATEGORI}" ?`)) return;

    try {
      await axios.delete(
        `${API_URL}/master/kategori-siswa/${row.KATEGORI_ID}`
      );
      toastRef.current?.show({
        severity: "success",
        summary: "Sukses",
        detail: "Kategori berhasil dinonaktifkan",
      });
      fetchKategori();
    } catch {
      toastRef.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Gagal menghapus kategori",
      });
    }
  };

  const actionTemplate = (row) => (
    <div className="flex gap-2">
      <Button
        icon="pi pi-pencil"
        rounded
        text
        onClick={() => onEdit(row)}
      />
      <Button
        icon="pi pi-trash"
        rounded
        text
        severity="danger"
        onClick={() => onDelete(row)}
      />
    </div>
  );

  return (
    <div className="card">
      <ToastNotifier ref={toastRef} />

      <div className="flex justify-content-between align-items-center mb-3">
        <h3 className="m-0">Master Kategori Siswa</h3>
        <Button
          label="Tambah"
          icon="pi pi-plus"
          onClick={onAdd}
        />
      </div>

      <DataTable
        value={data}
        loading={loading}
        paginator
        rows={10}
        emptyMessage="Data kategori kosong"
      >
        <Column field="KATEGORI_ID" header="ID" />
        <Column field="NAMA_KATEGORI" header="Nama Kategori" />
        <Column field="DESKRIPSI" header="Deskripsi" />
        <Column field="PRIORITAS" header="Prioritas" />
        <Column field="STATUS" header="Status" />
        <Column body={actionTemplate} header="Aksi" />
      </DataTable>

      <FormKategoriSiswa
        visible={dialogVisible}
        onHide={() => setDialogVisible(false)}
        selected={selected}
        onSuccess={() => {
          setDialogVisible(false);
          fetchKategori();
        }}
      />
    </div>
  );
}
