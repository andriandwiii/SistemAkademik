"use client";

import React, { useEffect, useState, useRef } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Dialog } from "primereact/dialog";
import ToastNotifier from "../../../components/ToastNotifier";
import CustomDataTable from "../../../components/DataTable";
import FormJadwal from "./components/FormJadwal";
import AdjustPrintMarginLaporanJadwal from "./print/AdjustPrintMarginLaporanJadwal";
import dynamic from "next/dynamic";

const PDFViewer = dynamic(() => import("./print/PDFViewer"), { ssr: false });

export default function MasterJadwalPage() {
  const toastRef = useRef(null);
  const [jadwalList, setJadwalList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [dialogMode, setDialogMode] = useState(null);

  const [kelasOptions, setKelasOptions] = useState([]);
  const [mapelKelasOptions, setMapelKelasOptions] = useState([]);
  const [hariOptions, setHariOptions] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");

  const [adjustDialog, setAdjustDialog] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [jsPdfPreviewOpen, setJsPdfPreviewOpen] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    fetchJadwal();
    fetchKelas();
    fetchMapelKelas();
    fetchHari();
  }, []);

  // 🔹 Fetch semua data
  const fetchJadwal = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/jadwal`);
      const json = await res.json();
      setJadwalList(json.data || []);
    } catch (err) {
      console.error(err);
      toastRef.current?.showToast("01", "Gagal memuat data jadwal");
    } finally {
      setLoading(false);
    }
  };

  const fetchKelas = async () => {
    try {
      const res = await fetch(`${API_URL}/kelas`);
      const json = await res.json();
      setKelasOptions(
        json.data?.map((k) => ({
          label: `${k.TINGKATAN || "-"} ${k.NAMA_JURUSAN || "-"} ${k.NAMA_RUANG || "-"}`,
          value: k.KELAS_ID,
        })) || []
      );
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMapelKelas = async () => {
    try {
      const res = await fetch(`${API_URL}/mapel-kelas`);
      const json = await res.json();
      setMapelKelasOptions(
        json.data?.map((m) => ({
          label: `${m.mapel?.KODE_MAPEL || "-"} - ${m.mapel?.NAMA_MAPEL || "-"} (${m.guru?.NAMA_GURU || "-"})`,
          value: m.MAPEL_KELAS_ID,
        })) || []
      );
    } catch (err) {
      console.error(err);
    }
  };

  const fetchHari = async () => {
    try {
      const res = await fetch(`${API_URL}/master-hari`);
      const json = await res.json();
      setHariOptions(
        json.data?.map((h) => ({
          label: h.NAMA_HARI,
          value: h.HARI_ID,
        })) || []
      );
    } catch (err) {
      console.error(err);
    }
  };

  // 🔍 Search Filter
  const handleSearch = (keyword) => {
    setSearchKeyword(keyword);
    if (!keyword) {
      fetchJadwal();
    } else {
      const filtered = jadwalList.filter(
        (j) =>
          j.mapel?.NAMA_MAPEL?.toLowerCase().includes(keyword.toLowerCase()) ||
          j.kelas?.NAMA_JURUSAN?.toLowerCase().includes(keyword.toLowerCase()) ||
          j.hari?.NAMA_HARI?.toLowerCase().includes(keyword.toLowerCase())
      );
      setJadwalList(filtered);
    }
  };

  // 💾 Simpan (Tambah/Edit)
  const handleSave = async (data) => {
    try {
      if (dialogMode === "add") {
        await fetch(`${API_URL}/jadwal`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        toastRef.current?.showToast("00", "Jadwal berhasil ditambahkan");
      } else if (dialogMode === "edit" && selectedItem) {
        await fetch(`${API_URL}/jadwal/${selectedItem.JADWAL_ID}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        toastRef.current?.showToast("00", "Jadwal berhasil diperbarui");
      }
      fetchJadwal();
      setDialogMode(null);
      setSelectedItem(null);
    } catch (err) {
      console.error(err);
      toastRef.current?.showToast("01", "Gagal menyimpan jadwal");
    }
  };

  // ❌ Hapus Data
  const handleDelete = (row) => {
    confirmDialog({
      message: `Yakin ingin menghapus jadwal "${row.mapel?.NAMA_MAPEL}"?`,
      header: "Konfirmasi Hapus",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Hapus",
      rejectLabel: "Batal",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await fetch(`${API_URL}/jadwal/${row.JADWAL_ID}`, { method: "DELETE" });
          toastRef.current?.showToast("00", "Jadwal berhasil dihapus");
          fetchJadwal();
        } catch (err) {
          console.error(err);
          toastRef.current?.showToast("01", "Gagal menghapus jadwal");
        }
      },
    });
  };

  // 🔹 Kolom tabel
  const columns = [
    { field: "JADWAL_ID", header: "ID", style: { width: "60px" } },
    {
      header: "Kelas",
      body: (row) =>
        `${row.kelas?.TINGKATAN || "-"} ${row.kelas?.NAMA_JURUSAN || "-"} ${row.kelas?.NAMA_RUANG || "-"}`,
    },
    {
      header: "Mata Pelajaran",
      body: (row) =>
        `${row.mapel?.KODE_MAPEL || "-"} - ${row.mapel?.NAMA_MAPEL || "-"} (${row.guru?.NAMA_GURU || "-"})`,
    },
    { header: "Hari", body: (row) => row.hari?.NAMA_HARI || "-" },
    { field: "JAM_MULAI", header: "Jam Mulai" },
    { field: "JAM_SELESAI", header: "Jam Selesai" },
    {
      header: "Actions",
      body: (row) => (
        <div className="flex gap-2">
          <Button
            icon="pi pi-pencil"
            size="small"
            severity="warning"
            onClick={() => {
              setSelectedItem(row);
              setDialogMode("edit");
            }}
          />
          <Button
            icon="pi pi-trash"
            size="small"
            severity="danger"
            onClick={() => handleDelete(row)}
          />
        </div>
      ),
      style: { width: "120px" },
    },
  ];

  return (
    <div className="card p-4">
      <ToastNotifier ref={toastRef} />
      <ConfirmDialog />

      <h3 className="text-xl font-semibold mb-4">Master Jadwal</h3>

      {/* 🔹 Toolbar: Print | Search | Tambah */}
      <div className="flex justify-content-end align-items-center mb-3 gap-3 flex-wrap">
        <Button
          icon="pi pi-print"
          severity="warning"
          onClick={() => setAdjustDialog(true)}
        />

        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            value={searchKeyword}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Cari mapel / kelas / hari..."
            className="w-64"
          />
        </span>

        <Button
          label="Tambah Jadwal"
          icon="pi pi-plus"
          onClick={() => {
            setDialogMode("add");
            setSelectedItem(null);
          }}
        />
      </div>

      {/* 🔹 Data Table */}
      <CustomDataTable data={jadwalList} loading={loading} columns={columns} />

      {/* 🔹 Form Tambah/Edit */}
      <FormJadwal
        visible={dialogMode !== null}
        onHide={() => {
          setDialogMode(null);
          setSelectedItem(null);
        }}
        selectedItem={selectedItem}
        onSave={handleSave}
        kelasOptions={kelasOptions}
        mapelKelasOptions={mapelKelasOptions}
        hariOptions={hariOptions}
      />

      {/* 🔹 Dialog Print */}
      <AdjustPrintMarginLaporanJadwal
        adjustDialog={adjustDialog}
        setAdjustDialog={setAdjustDialog}
        dataJadwal={jadwalList}
        setPdfUrl={setPdfUrl}
        setFileName={setFileName}
        setJsPdfPreviewOpen={setJsPdfPreviewOpen}
      />

      {/* 🔹 PDF Preview */}
      <Dialog
        visible={jsPdfPreviewOpen}
        onHide={() => setJsPdfPreviewOpen(false)}
        modal
        style={{ width: "90vw", height: "90vh" }}
        header="Preview Laporan Jadwal"
      >
        <PDFViewer pdfUrl={pdfUrl} fileName={fileName} paperSize="A4" />
      </Dialog>
    </div>
  );
}
