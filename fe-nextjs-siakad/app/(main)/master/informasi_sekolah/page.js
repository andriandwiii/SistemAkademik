"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Dialog } from "primereact/dialog";
import { Tag } from "primereact/tag";
import ToastNotifier from "../../../components/ToastNotifier";
import CustomDataTable from "../../../components/DataTable";
import FormInfoSekolah from "./components/FormInfoSekolah";
import dynamic from "next/dynamic";

// 🔹 Import Dinamis untuk PDF Tools
const PDFViewer = dynamic(() => import("./print/PDFViewer"), { ssr: false });
const AdjustPrintMarginLaporan = dynamic(
  () => import("./print/AdjustPrintMarginLaporan"),
  { ssr: false }
);

export default function MasterInfoSekolahPage() {
  const toastRef = useRef(null);
  const [infoList, setInfoList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [dialogMode, setDialogMode] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");

  // 🔹 State untuk Printing
  const [adjustDialog, setAdjustDialog] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [jsPdfPreviewOpen, setJsPdfPreviewOpen] = useState(false);
  const [dataAdjust, setDataAdjust] = useState({
    marginTop: 10,
    marginBottom: 10,
    marginRight: 10,
    marginLeft: 10,
    paperSize: "A4",
    orientation: "portrait",
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

  useEffect(() => {
    if (!token) {
      window.location.href = "/";
    } else {
      fetchInfoSekolah();
    }
  }, [token]);

  // 🔹 Fetch Data (Menggunakan endpoint baru: /api/master-infosekolah)
  const fetchInfoSekolah = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/master-infosekolah`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setInfoList(json.data || []);
    } catch (err) {
      console.error(err);
      toastRef.current?.showToast("01", "Gagal memuat data informasi");
    } finally {
      setLoading(false);
    }
  };

  // 🔍 Search Filter
  const handleSearch = (keyword) => {
    setSearchKeyword(keyword);
    if (!keyword) {
      fetchInfoSekolah();
    } else {
      const filtered = infoList.filter(
        (i) =>
          i.JUDUL?.toLowerCase().includes(keyword.toLowerCase()) ||
          i.KATEGORI?.toLowerCase().includes(keyword.toLowerCase())
      );
      setInfoList(filtered);
    }
  };

  // 💾 Save Handler (Tambah & Edit)
  const handleSave = async (data) => {
    setLoading(true);
    try {
      const isAdd = dialogMode === "add";
      const url = isAdd 
        ? `${API_URL}/master-infosekolah` 
        : `${API_URL}/master-infosekolah/${selectedItem.ID}`;
      
      const res = await fetch(url, {
        method: isAdd ? "POST" : "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        toastRef.current?.showToast("00", `Data berhasil ${isAdd ? "disimpan" : "diperbarui"}`);
        fetchInfoSekolah();
        setDialogMode(null);
        setSelectedItem(null);
      } else {
        throw new Error("Gagal menyimpan");
      }
    } catch (err) {
      console.error(err);
      toastRef.current?.showToast("01", "Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  };

  // ❌ Delete Handler
  const handleDelete = (row) => {
    confirmDialog({
      message: `Hapus informasi "${row.JUDUL}"?`,
      header: "Konfirmasi Hapus",
      icon: "pi pi-info-circle",
      acceptClassName: "p-button-danger",
      accept: async () => {
        setLoading(true);
        try {
          await fetch(`${API_URL}/master-infosekolah/${row.ID}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
          toastRef.current?.showToast("00", "Berhasil dihapus");
          fetchInfoSekolah();
        } catch (err) {
          toastRef.current?.showToast("01", "Gagal menghapus");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // 🎨 Tag Colors
  const getSeverity = (kat) => {
    switch (kat) {
      case "Akademik": return "info";
      case "Ekstrakurikuler": return "success";
      case "Prestasi": return "help";
      case "Umum": return "warning";
      default: return null;
    }
  };

  const columns = [
    { field: "ID", header: "ID", style: { width: "70px", textAlign: "center" } },
    { 
      field: "TANGGAL", 
      header: "Tanggal", 
      style: { width: "150px" },
      body: (row) => new Date(row.TANGGAL).toLocaleDateString("id-ID") 
    },
    { field: "JUDUL", header: "Judul Informasi", style: { minWidth: "200px" } },
    { 
      field: "KATEGORI", 
      header: "Kategori", 
      style: { width: "150px" },
      body: (row) => <Tag value={row.KATEGORI} severity={getSeverity(row.KATEGORI)} />
    },
    {
      header: "Aksi",
      body: (row) => (
        <div className="flex gap-2">
          <Button icon="pi pi-pencil" severity="warning" rounded text onClick={() => { setSelectedItem(row); setDialogMode("edit"); }} />
          <Button icon="pi pi-trash" severity="danger" rounded text onClick={() => handleDelete(row)} />
        </div>
      ),
      style: { width: "120px", textAlign: "center" },
    },
  ];

  return (
    <div className="card p-4">
      <ToastNotifier ref={toastRef} />
      <ConfirmDialog />

      <div className="flex justify-content-between align-items-center mb-4">
        <h3 className="m-0 font-semibold text-xl">Master Informasi Sekolah</h3>
        <div className="flex gap-2">
            <Button icon="pi pi-print" severity="secondary" onClick={() => setAdjustDialog(true)} tooltip="Cetak Laporan" />
            <Button label="Tambah Baru" icon="pi pi-plus" severity="info" onClick={() => { setDialogMode("add"); setSelectedItem(null); }} />
        </div>
      </div>

      <div className="mb-3">
        <span className="p-input-icon-left w-full md:w-20rem">
          <i className="pi pi-search" />
          <InputText
            value={searchKeyword}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Cari judul atau kategori..."
            className="w-full"
          />
        </span>
      </div>

      <CustomDataTable data={infoList} loading={loading} columns={columns} />

      <FormInfoSekolah
        visible={dialogMode !== null}
        onHide={() => { setDialogMode(null); setSelectedItem(null); }}
        selectedInfo={selectedItem}
        onSave={handleSave}
      />

      <AdjustPrintMarginLaporan
        adjustDialog={adjustDialog}
        setAdjustDialog={setAdjustDialog}
        dataInfo={infoList}
        setPdfUrl={setPdfUrl}
        setFileName={setFileName}
        setJsPdfPreviewOpen={setJsPdfPreviewOpen}
        dataAdjust={dataAdjust}
        setDataAdjust={setDataAdjust}
      />

      <Dialog
        visible={jsPdfPreviewOpen}
        onHide={() => setJsPdfPreviewOpen(false)}
        header="Preview Laporan"
        style={{ width: "85vw" }}
        maximized
        modal
      >
        <PDFViewer pdfUrl={pdfUrl} fileName={fileName} />
      </Dialog>
    </div>
  );
}