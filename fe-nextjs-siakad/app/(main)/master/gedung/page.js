"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Dialog } from "primereact/dialog";
import ToastNotifier from "../../../components/ToastNotifier";
import CustomDataTable from "../../../components/DataTable";
import FormGedung from "./components/FormGedung";
import dynamic from "next/dynamic";

// 🔹 Buat komponen print dinamis tanpa SSR
const PDFViewer = dynamic(() => import("./print/PDFViewer"), { ssr: false });
const AdjustPrintMarginLaporan = dynamic(
  () => import("./print/AdjustPrintMarginLaporan"),
  { ssr: false }
);

export default function MasterGedungPage() {
  const toastRef = useRef(null);
  const [gedungList, setGedungList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [dialogMode, setDialogMode] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");

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
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : "";

  // 🔹 Ambil token dan fetch data
  useEffect(() => {
    if (!token) window.location.href = "/";
    else fetchGedung();
  }, [token]);

  // 🔹 Fetch semua data gedung
  const fetchGedung = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/master-gedung`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setGedungList(json.data || []);
    } catch (err) {
      console.error(err);
      toastRef.current?.showToast("01", "Gagal memuat data gedung");
    } finally {
      setLoading(false);
    }
  };

  // 🔍 Search filter
  const handleSearch = (keyword) => {
    setSearchKeyword(keyword);
    if (!keyword) {
      fetchGedung();
    } else {
      const filtered = gedungList.filter(
        (g) =>
          g.NAMA_GEDUNG?.toLowerCase().includes(keyword.toLowerCase()) ||
          g.LOKASI?.toLowerCase().includes(keyword.toLowerCase())
      );
      setGedungList(filtered);
    }
  };

  // 💾 Save handler
  const handleSave = async (data) => {
    setLoading(true);
    try {
      if (dialogMode === "add") {
        await fetch(`${API_URL}/master-gedung`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        });
        toastRef.current?.showToast("00", "Gedung berhasil ditambahkan");
      } else if (dialogMode === "edit" && selectedItem) {
        await fetch(`${API_URL}/master-gedung/${selectedItem.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        });
        toastRef.current?.showToast("00", "Gedung berhasil diubah");
      }
      fetchGedung();
      setDialogMode(null);
      setSelectedItem(null);
    } catch (err) {
      console.error(err);
      toastRef.current?.showToast("01", "Terjadi kesalahan saat menyimpan gedung");
    } finally {
      setLoading(false);
    }
  };

  // ❌ Delete handler
  const handleDelete = (row) => {
    confirmDialog({
      message: `Yakin ingin menghapus gedung "${row.NAMA_GEDUNG}"?`,
      header: "Konfirmasi Hapus",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Hapus",
      rejectLabel: "Batal",
      acceptClassName: "p-button-danger",
      accept: async () => {
        setLoading(true);
        try {
          await fetch(`${API_URL}/master-gedung/${row.id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
          toastRef.current?.showToast("00", "Gedung berhasil dihapus");
          fetchGedung();
        } catch (err) {
          console.error(err);
          toastRef.current?.showToast("01", "Terjadi kesalahan saat menghapus gedung");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // 🧩 Kolom tabel
  const columns = [
    { field: "id", header: "ID", style: { width: "60px", textAlign: "center" } },
    { field: "GEDUNG_ID", header: "Kode Gedung", style: { width: "200px" } },
    { field: "NAMA_GEDUNG", header: "Nama Gedung", style: { width: "250px" } },
    { field: "LOKASI", header: "Lokasi", style: { minWidth: "250px" } },
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

      <h3 className="text-xl font-semibold mb-4">Master Gedung</h3>

      {/* 🔹 Toolbar atas */}
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
            placeholder="Cari nama atau lokasi..."
            className="w-64"
          />
        </span>

        <Button
          label="Tambah Gedung"
          icon="pi pi-plus"
          severity="info"
          onClick={() => {
            setDialogMode("add");
            setSelectedItem(null);
          }}
        />
      </div>

      {/* 🔹 DataTable */}
      <CustomDataTable data={gedungList} loading={loading} columns={columns} />

      {/* 🔹 Form */}
      <FormGedung
        visible={dialogMode !== null}
        onHide={() => {
          setDialogMode(null);
          setSelectedItem(null);
        }}
        selectedGedung={selectedItem}
        onSave={handleSave}
      />

      {/* 🔹 Print Dialog */}
      <AdjustPrintMarginLaporan
        adjustDialog={adjustDialog}
        setAdjustDialog={setAdjustDialog}
        dataGedung={gedungList}
        setPdfUrl={setPdfUrl}
        setFileName={setFileName}
        setJsPdfPreviewOpen={setJsPdfPreviewOpen}
        dataAdjust={dataAdjust}
        setDataAdjust={setDataAdjust}
      />

      {/* 🔹 PDF Preview */}
      <Dialog
        visible={jsPdfPreviewOpen}
        onHide={() => setJsPdfPreviewOpen(false)}
        modal
        style={{ width: "90vw", height: "90vh" }}
        header="Preview Laporan Gedung"
        blockScroll
      >
        <PDFViewer pdfUrl={pdfUrl} fileName={fileName} />
      </Dialog>
    </div>
  );
}
