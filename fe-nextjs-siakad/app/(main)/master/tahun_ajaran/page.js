"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Dialog } from "primereact/dialog";
import ToastNotifier from "../../../components/ToastNotifier";
import CustomDataTable from "../../../components/DataTable";
import FormTahunAjaran from "./components/FormTahunAjaran";
import dynamic from "next/dynamic";

// 🔹 Komponen Print (tanpa SSR)
const PDFViewer = dynamic(() => import("./print/PDFViewer"), { ssr: false });
const AdjustPrintMarginLaporan = dynamic(
  () => import("./print/AdjustPrintMarginLaporan"),
  { ssr: false }
);

export default function MasterTahunAjaranPage() {
  const toastRef = useRef(null);
  const [tahunList, setTahunList] = useState([]);
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

  // 🔹 Fetch data awal
  useEffect(() => {
    if (!token) window.location.href = "/";
    else fetchTahunAjaran();
  }, [token]);

  const fetchTahunAjaran = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/master-tahun-ajaran`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setTahunList(json.data || []);
    } catch (err) {
      console.error(err);
      toastRef.current?.showToast("01", "Gagal memuat data Tahun Ajaran");
    } finally {
      setLoading(false);
    }
  };

  // 🔍 Pencarian
  const handleSearch = (keyword) => {
    setSearchKeyword(keyword);
    if (!keyword) {
      fetchTahunAjaran();
    } else {
      const filtered = tahunList.filter(
        (t) =>
          t.NAMA_TAHUN_AJARAN?.toLowerCase().includes(keyword.toLowerCase()) ||
          t.STATUS?.toLowerCase().includes(keyword.toLowerCase())
      );
      setTahunList(filtered);
    }
  };

  // 💾 Simpan data
  const handleSave = async (data) => {
    setLoading(true);
    try {
      if (dialogMode === "add") {
        await fetch(`${API_URL}/master-tahun-ajaran`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        });
        toastRef.current?.showToast("00", "Tahun Ajaran berhasil ditambahkan");
      } else if (dialogMode === "edit" && selectedItem) {
        await fetch(`${API_URL}/master-tahun-ajaran/${selectedItem.ID}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        });
        toastRef.current?.showToast("00", "Tahun Ajaran berhasil diubah");
      }
      fetchTahunAjaran();
      setDialogMode(null);
      setSelectedItem(null);
    } catch (err) {
      console.error(err);
      toastRef.current?.showToast(
        "01",
        "Terjadi kesalahan saat menyimpan Tahun Ajaran"
      );
    } finally {
      setLoading(false);
    }
  };

  // ❌ Hapus data
  const handleDelete = (row) => {
    confirmDialog({
      message: `Yakin ingin menghapus Tahun Ajaran "${row.NAMA_TAHUN_AJARAN}"?`,
      header: "Konfirmasi Hapus",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Hapus",
      rejectLabel: "Batal",
      acceptClassName: "p-button-danger",
      accept: async () => {
        setLoading(true);
        try {
          await fetch(`${API_URL}/master-tahun-ajaran/${row.ID}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
          toastRef.current?.showToast("00", "Tahun Ajaran berhasil dihapus");
          fetchTahunAjaran();
        } catch (err) {
          console.error(err);
          toastRef.current?.showToast(
            "01",
            "Terjadi kesalahan saat menghapus Tahun Ajaran"
          );
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // 📋 Kolom tabel
  const columns = [
    { field: "ID", header: "ID", style: { width: "60px", textAlign: "center" } },
    { field: "TAHUN_AJARAN_ID", header: "Kode Tahun", style: { width: "120px" } },
    { field: "NAMA_TAHUN_AJARAN", header: "Nama Tahun Ajaran", style: { width: "200px" } },
    { field: "STATUS", header: "Status", style: { width: "150px" } },
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

      <h3 className="text-xl font-semibold mb-4">Master Tahun Ajaran</h3>

      {/* 🔹 Toolbar */}
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
            placeholder="Cari Tahun Ajaran atau Status..."
            className="w-64"
          />
        </span>

        <Button
          label="Tambah Tahun Ajaran"
          icon="pi pi-plus"
          severity="info"
          onClick={() => {
            setDialogMode("add");
            setSelectedItem(null);
          }}
        />
      </div>

      {/* 🔹 DataTable */}
      <CustomDataTable data={tahunList} loading={loading} columns={columns} />

      {/* 🔹 Form */}
      <FormTahunAjaran
        visible={dialogMode !== null}
        onHide={() => {
          setDialogMode(null);
          setSelectedItem(null);
        }}
        selectedTahunAjaran={selectedItem}
        onSave={handleSave}
      />

      {/* 🔹 Print */}
      <AdjustPrintMarginLaporan
        adjustDialog={adjustDialog}
        setAdjustDialog={setAdjustDialog}
        dataGedung={tahunList}
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
        header="Preview Laporan Tahun Ajaran"
        blockScroll
      >
        <PDFViewer pdfUrl={pdfUrl} fileName={fileName} />
      </Dialog>
    </div>
  );
}
