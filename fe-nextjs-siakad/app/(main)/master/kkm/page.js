"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Dialog } from "primereact/dialog";
import ToastNotifier from "../../../components/ToastNotifier";
import CustomDataTable from "../../../components/DataTable";
import FormKKM from "./components/FormKKM";

import dynamic from "next/dynamic";

// 🔹 Komponen print (tanpa SSR)
const PDFViewer = dynamic(() => import("./print/PDFViewer"), { ssr: false });
const AdjustPrintMarginLaporan = dynamic(
  () => import("./print/AdjustPrintMarginLaporan"),
  { ssr: false }
);

export default function MasterKKMPage() {
  const toastRef = useRef(null);
  const [kkmList, setKkmList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [dialogMode, setDialogMode] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");

  // untuk print/pdf
  const [adjustDialog, setAdjustDialog] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [jsPdfPreviewOpen, setJsPdfPreviewOpen] = useState(false);
  const [dataAdjust, setDataAdjust] = useState({
    marginTop: 15,
    marginBottom: 15,
    marginRight: 15,
    marginLeft: 15,
    paperSize: "A4",
    orientation: "portrait",
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : "";

  // 🔹 Ambil data awal
  useEffect(() => {
    if (!token) window.location.href = "/";
    else fetchKKM();
  }, [token]);

  // 🔹 Fetch data dari backend
  const fetchKKM = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/master-kkm`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok && json.data) {
        setKkmList(json.data);
      } else {
        toastRef.current?.showToast("01", json.message || "Gagal memuat data KKM");
      }
    } catch (err) {
      console.error(err);
      toastRef.current?.showToast("01", "Kesalahan koneksi server");
    } finally {
      setLoading(false);
    }
  };

  // 🔍 Pencarian KKM
  const handleSearch = (keyword) => {
    setSearchKeyword(keyword);
    if (!keyword) {
      fetchKKM();
    } else {
      const filtered = kkmList.filter(
        (item) =>
          item.KODE_KKM?.toLowerCase().includes(keyword.toLowerCase()) ||
          item.KODE_MAPEL?.toLowerCase().includes(keyword.toLowerCase()) ||
          item.KETERANGAN?.toLowerCase().includes(keyword.toLowerCase())
      );
      setKkmList(filtered);
    }
  };

  // 💾 Simpan data (tambah/edit)
  const handleSave = async (data) => {
    setLoading(true);
    try {
      const method = dialogMode === "add" ? "POST" : "PUT";
      const url =
        dialogMode === "add"
          ? `${API_URL}/master-kkm`
          : `${API_URL}/master-kkm/${selectedItem?.ID}`;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (res.ok) {
        toastRef.current?.showToast(
          "00",
          dialogMode === "add"
            ? "Data KKM berhasil ditambahkan"
            : "Data KKM berhasil diperbarui"
        );
        fetchKKM();
        setDialogMode(null);
        setSelectedItem(null);
      } else {
        toastRef.current?.showToast("01", result.message || "Gagal menyimpan data KKM");
      }
    } catch (err) {
      console.error(err);
      toastRef.current?.showToast("01", "Kesalahan server saat menyimpan data");
    } finally {
      setLoading(false);
    }
  };

  // ❌ Hapus data
  const handleDelete = (row) => {
    confirmDialog({
      message: `Yakin ingin menghapus data KKM "${row.KODE_KKM}" (${row.KODE_MAPEL})?`,
      header: "Konfirmasi Hapus",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Hapus",
      rejectLabel: "Batal",
      acceptClassName: "p-button-danger",
      accept: async () => {
        setLoading(true);
        try {
          const res = await fetch(`${API_URL}/master-kkm/${row.ID}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            toastRef.current?.showToast("00", "Data KKM berhasil dihapus");
            fetchKKM();
          } else {
            toastRef.current?.showToast("01", "Gagal menghapus data KKM");
          }
        } catch (err) {
          console.error(err);
          toastRef.current?.showToast("01", "Kesalahan koneksi server");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // 🧾 Kolom tabel sesuai field DB dan controller
  const columns = [
    { field: "ID", header: "ID", style: { width: "60px", textAlign: "center" } },
    { field: "KODE_KKM", header: "Kode KKM", style: { width: "120px" } },
    { field: "KODE_MAPEL", header: "Kode Mapel", style: { width: "120px" } },
     { field: "NAMA_MAPEL", header: "Nama Mata Pelajaran", style: { width: "200px" } },
    { field: "KOMPLEKSITAS", header: "Kompleksitas", style: { width: "120px", textAlign: "center" } },
    { field: "DAYA_DUKUNG", header: "Daya Dukung", style: { width: "120px", textAlign: "center" } },
    { field: "INTAKE", header: "Intake", style: { width: "120px", textAlign: "center" } },
    { field: "KKM", header: "Nilai KKM", style: { width: "100px", textAlign: "center" } },
    { field: "KETERANGAN", header: "Keterangan", style: { minWidth: "250px" } },
    { field: "STATUS", header: "Status", style: { width: "120px", textAlign: "center" } },
    {
      header: "Aksi",
      body: (row) => (
        <div className="flex gap-2 justify-center">
          <Button
            icon="pi pi-pencil"
            size="small"
            severity="warning"
            tooltip="Edit"
            onClick={() => {
              setSelectedItem(row);
              setDialogMode("edit");
            }}
          />
          <Button
            icon="pi pi-trash"
            size="small"
            severity="danger"
            tooltip="Hapus"
            onClick={() => handleDelete(row)}
          />
        </div>
      ),
      style: { width: "130px", textAlign: "center" },
    },
  ];

  return (
    <div className="card p-4">
      <ToastNotifier ref={toastRef} />
      <ConfirmDialog />

      <h3 className="text-xl font-semibold mb-4">
        Master Kriteria Ketuntasan Minimal (KKM)
      </h3>

      {/* 🔹 Toolbar (Print - Search - Tambah) */}
      <div className="flex justify-between flex-wrap items-center mb-3 gap-3">
        {/* Tombol Print di kiri */}
        <Button
          icon="pi pi-print"
          severity="warning"
          tooltip="Cetak Laporan"
          onClick={() => setAdjustDialog(true)}
        />

        {/* Pencarian di tengah */}
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            value={searchKeyword}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Cari KKM, mapel, atau keterangan..."
            className="w-64"
          />
        </span>

        {/* Tombol Tambah di kanan */}
        <Button
          label="Tambah KKM"
          icon="pi pi-plus"
          severity="info"
          onClick={() => {
            setDialogMode("add");
            setSelectedItem(null);
          }}
        />
      </div>

      {/* 🔹 Tabel utama */}
      <CustomDataTable
        data={kkmList}
        loading={loading}
        columns={columns}
        title="Daftar Data KKM"
      />

      {/* 🔹 Form Tambah/Edit */}
      <FormKKM
        visible={dialogMode !== null}
        onHide={() => {
          setDialogMode(null);
          setSelectedItem(null);
        }}
        selectedKKM={selectedItem}
        onSave={handleSave}
        token={token}
      />

      {/* 🔹 Dialog Pengaturan Print */}
      <AdjustPrintMarginLaporan
        adjustDialog={adjustDialog}
        setAdjustDialog={setAdjustDialog}
        dataKelas={kkmList}
        setPdfUrl={setPdfUrl}
        setFileName={setFileName}
        setJsPdfPreviewOpen={setJsPdfPreviewOpen}
        dataAdjust={dataAdjust}
        setDataAdjust={setDataAdjust}
      />

      {/* 🔹 Preview PDF */}
      <Dialog
        visible={jsPdfPreviewOpen}
        onHide={() => setJsPdfPreviewOpen(false)}
        modal
        style={{ width: "90vw", height: "90vh" }}
        header="Preview Laporan KKM"
        blockScroll
      >
        <PDFViewer pdfUrl={pdfUrl} fileName={fileName} />
      </Dialog>
    </div>
  );
}
