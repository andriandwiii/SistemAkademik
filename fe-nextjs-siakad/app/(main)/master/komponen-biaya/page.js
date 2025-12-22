"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dropdown } from "primereact/dropdown";
import ToastNotifier from "../../../components/ToastNotifier";
import FormKomponenBiaya from "./components/FormKomponenBiaya";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const ENDPOINT = `${API_URL}/master-komponen-biaya`;

const JENIS_BIAYA_OPTIONS = [
  { label: "Semua", value: null },
  { label: "Rutin", value: "RUTIN" },
  { label: "Non Rutin", value: "NON_RUTIN" },
];

export default function KomponenBiayaPage() {
  const toastRef = useRef(null);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selected, setSelected] = useState(null);
  const [jenisBiaya, setJenisBiaya] = useState(null);

  const fetchKomponen = async () => {
    setLoading(true);
    try {
      const res = await axios.get(ENDPOINT, {
        params: jenisBiaya ? { jenis_biaya: jenisBiaya } : {},
      });
      setData(res.data.data || []);
    } catch {
      toastRef.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Gagal mengambil data komponen biaya",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKomponen();
  }, [jenisBiaya]);

  const onAdd = () => {
    setSelected(null);
    setDialogVisible(true);
  };

  const onEdit = (row) => {
    setSelected(row);
    setDialogVisible(true);
  };

  const onDelete = async (row) => {
    if (!confirm(`Nonaktifkan komponen "${row.NAMA_KOMPONEN}" ?`)) return;

    try {
      await axios.delete(`${ENDPOINT}/${row.KOMPONEN_ID}`);
      toastRef.current?.show({
        severity: "success",
        summary: "Sukses",
        detail: "Komponen berhasil dinonaktifkan",
      });
      fetchKomponen();
    } catch {
      toastRef.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Gagal menghapus komponen",
      });
    }
  };

  const actionTemplate = (row) => (
    <div className="flex gap-2">
      <Button icon="pi pi-pencil" rounded text onClick={() => onEdit(row)} />
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
        <h3 className="m-0">Master Komponen Biaya</h3>
        <Button label="Tambah" icon="pi pi-plus" onClick={onAdd} />
      </div>

      {/* Filter */}
      <div className="mb-3 w-15rem">
        <Dropdown
          value={jenisBiaya}
          options={JENIS_BIAYA_OPTIONS}
          onChange={(e) => setJenisBiaya(e.value)}
          placeholder="Filter Jenis Biaya"
        />
      </div>

      <DataTable
        value={data}
        loading={loading}
        paginator
        rows={10}
        emptyMessage="Data komponen biaya kosong"
      >
        <Column field="KOMPONEN_ID" header="ID" />
        <Column field="NAMA_KOMPONEN" header="Nama Komponen" />
        <Column field="JENIS_BIAYA" header="Jenis Biaya" />
        <Column
          field="WAJIB"
          header="Wajib"
          body={(row) => (row.WAJIB ? "Ya" : "Tidak")}
        />
        <Column field="URUTAN" header="Urutan" />
        <Column field="STATUS" header="Status" />
        <Column body={actionTemplate} header="Aksi" />
      </DataTable>

      <FormKomponenBiaya
        visible={dialogVisible}
        onHide={() => setDialogVisible(false)}
        selected={selected}
        onSuccess={() => {
          setDialogVisible(false);
          fetchKomponen();
        }}
      />
    </div>
  );
}
