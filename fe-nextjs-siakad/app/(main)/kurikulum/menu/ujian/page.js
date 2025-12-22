"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import ToastNotifier from "../../../../components/ToastNotifier";
import CustomDataTable from "../../../../components/DataTable";
import FormUjian from "./components/formujian";

export default function MengaturUjianPage() {
  const toastRef = useRef(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const [ujianList, setUjianList] = useState([]);
  const [kelasOptions, setKelasOptions] = useState([]);
  const [mapelOptions, setMapelOptions] = useState([]);
  const [guruOptions, setGuruOptions] = useState([]);

  const [dialogMode, setDialogMode] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  /* ===============================
   * FETCH DATA
   * =============================== */

  useEffect(() => {
    fetchUjian();
    fetchKelas();
    fetchMapel();
    fetchGuru();
  }, []);

  const fetchUjian = async () => {
    try {
      const res = await fetch(`${API_URL}/ujian`);
      const json = await res.json();
      setUjianList(Array.isArray(json.data) ? json.data : []);
    } catch {
      setUjianList([]);
    }
  };

  const fetchKelas = async () => {
    try {
      const res = await fetch(`${API_URL}/kelas`);
      const json = await res.json();

      setKelasOptions(
        Array.isArray(json.data)
          ? json.data.map((k) => ({
              label: `${k.TINGKATAN} ${k.NAMA_JURUSAN} ${k.NAMA_RUANG || ""}`,
              value: k.KELAS_ID,
            }))
          : []
      );
    } catch {
      setKelasOptions([]);
    }
  };

  const fetchMapel = async () => {
    try {
      const res = await fetch(`${API_URL}/master-mapel`);
      const json = await res.json();

      setMapelOptions(
        Array.isArray(json.data)
          ? json.data.map((m) => ({
              label: `${m.KODE_MAPEL} - ${m.NAMA_MAPEL}`,
              value: m.MAPEL_ID,
            }))
          : []
      );
    } catch {
      setMapelOptions([]);
    }
  };

  const fetchGuru = async () => {
    try {
      const res = await fetch(`${API_URL}/guru`);
      const json = await res.json();

      setGuruOptions(
        Array.isArray(json.data)
          ? json.data.map((g) => ({
              label: g.NAMA_GURU,
              value: g.GURU_ID,
            }))
          : []
      );
    } catch {
      setGuruOptions([]);
    }
  };

  /* ===============================
   * ACTION
   * =============================== */

  const handleSave = async (data) => {
    try {
      const url =
        dialogMode === "add"
          ? `${API_URL}/ujian`
          : `${API_URL}/ujian/${selectedItem.UJIAN_ID}`;

      await fetch(url, {
        method: dialogMode === "add" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      toastRef.current.showToast("00", "Data ujian berhasil disimpan");
      fetchUjian();
      setDialogMode(null);
      setSelectedItem(null);
    } catch {
      toastRef.current.showToast("01", "Gagal menyimpan data");
    }
  };

  const handleDelete = (row) => {
    confirmDialog({
      message: "Yakin ingin menghapus ujian ini?",
      header: "Konfirmasi",
      acceptClassName: "p-button-danger",
      accept: async () => {
        await fetch(`${API_URL}/ujian/${row.UJIAN_ID}`, { method: "DELETE" });
        fetchUjian();
      },
    });
  };

  /* ===============================
   * TABLE
   * =============================== */

  const columns = [
    { field: "KODE_UJIAN", header: "Kode" },
    { field: "NAMA_UJIAN", header: "Nama Ujian" },
    { field: "JENIS_UJIAN", header: "Jenis" },
    { field: "TANGGAL", header: "Tanggal" },
    { field: "STATUS", header: "Status" },
    {
      header: "Aksi",
      body: (row) => (
        <div className="flex gap-2">
          <Button
            icon="pi pi-pencil"
            severity="warning"
            onClick={() => {
              setSelectedItem(row);
              setDialogMode("edit");
            }}
          />
          <Button
            icon="pi pi-trash"
            severity="danger"
            onClick={() => handleDelete(row)}
          />
        </div>
      ),
    },
  ];

  /* ===============================
   * RENDER
   * =============================== */

  return (
    <div className="card p-4">
      <ToastNotifier ref={toastRef} />
      <ConfirmDialog />

      <h3>Mengatur Jadwal Ujian</h3>

      <div className="flex justify-content-end mb-3">
        <Button
          label="Tambah Ujian"
          icon="pi pi-plus"
          onClick={() => {
            setDialogMode("add");
            setSelectedItem(null);
          }}
        />
      </div>

      <CustomDataTable data={ujianList} columns={columns} />

      <FormUjian
        visible={dialogMode !== null}
        onHide={() => setDialogMode(null)}
        onSave={handleSave}
        selectedItem={selectedItem}
        kelasOptions={kelasOptions}
        mapelOptions={mapelOptions}
        guruOptions={guruOptions}
      />
    </div>
  );
}
