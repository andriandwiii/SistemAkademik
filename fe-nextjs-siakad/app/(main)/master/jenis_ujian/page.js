"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Dialog } from "primereact/dialog";
import ToastNotifier from "../../../components/ToastNotifier";
import CustomDataTable from "../../../components/DataTable";
import FormJenisUjian from "./components/formjenisujian";
import dynamic from "next/dynamic";

// 🔹 Komponen print (tanpa SSR)
const PDFViewer = dynamic(() => import("./print/PDFViewer"), { ssr: false });
const AdjustPrintMarginLaporan = dynamic(
  () => import("./print/AdjustPrintMarginJenisUjian"),
  { ssr: false }
);

export default function MasterJenisUjianPage() {
  const toastRef = useRef(null);

  const [jenisUjianList, setJenisUjianList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUjian, setSelectedUjian] = useState(null);
  const [dialogMode, setDialogMode] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");

  // 🔹 Print state
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

  // 🔹 Auth & fetch awal
  useEffect(() => {
    if (!token) window.location.href = "/";
    else fetchJenisUjian();
  }, [token]);

  // 🔹 Fetch data jenis ujian
  const fetchJenisUjian = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/master-jenis-ujian`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setJenisUjianList(json.data || []);
    } catch (err) {
      console.error(err);
      toastRef.current?.showToast("01", "Gagal memuat data jenis ujian");
    } finally {
      setLoading(false);
    }
  };

  // 🔍 Search
  const handleSearch = (keyword) => {
    setSearchKeyword(keyword);
    if (!keyword) {
      fetchJenisUjian();
    } else {
      const filtered = jenisUjianList.filter(
        (j) =>
          j.NAMA_UJIAN?.toLowerCase().includes(keyword.toLowerCase()) ||
          j.KODE_UJIAN?.toLowerCase().includes(keyword.toLowerCase())
      );
      setJenisUjianList(filtered);
    }
  };

  // 💾 Save
  const handleSave = async (data) => {
    setLoading(true);
    try {
      if (dialogMode === "add") {
        await fetch(`${API_URL}/master-jenis-ujian`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        });
        toastRef.current?.showToast("00", "Jenis ujian berhasil ditambahkan");
      } else if (dialogMode === "edit" && selectedUjian) {
        await fetch(
          `${API_URL}/master-jenis-ujian/${selectedUjian.ID}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
          }
        );
        toastRef.current?.showToast("00", "Jenis ujian berhasil diubah");
      }

      fetchJenisUjian();
      setDialogMode(null);
      setSelectedUjian(null);
    } catch (err) {
      console.error(err);
      toastRef.current?.showToast(
        "01",
        "Terjadi kesalahan saat menyimpan jenis ujian"
      );
    } finally {
      setLoading(false);
    }
  };

  // ❌ Delete
  const handleDelete = (row) => {
    confirmDialog({
      message: `Yakin ingin menghapus jenis ujian "${row.NAMA_UJIAN}"?`,
      header: "Konfirmasi Hapus",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Hapus",
      rejectLabel: "Batal",
      acceptClassName: "p-button-danger",
      accept: async () => {
        setLoading(true);
        try {
          await fetch(
            `${API_URL}/master-jenis-ujian/${row.ID}`,
            {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          toastRef.current?.showToast(
            "00",
            "Jenis ujian berhasil dihapus"
          );
          fetchJenisUjian();
        } catch (err) {
          console.error(err);
          toastRef.current?.showToast(
            "01",
            "Terjadi kesalahan saat menghapus jenis ujian"
          );
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // 🧩 Kolom tabel
  const columns = [
    { field: "ID", header: "ID", style: { width: "60px", textAlign: "center" } },
    { field: "KODE_UJIAN", header: "Kode Ujian", style: { width: "200px" } },
    { field: "NAMA_UJIAN", header: "Nama Ujian", style: { width: "250px" } },
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
              setSelectedUjian(row);
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

      <h3 className="text-xl font-semibold mb-4">Master Jenis Ujian</h3>

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
            placeholder="Cari kode atau nama ujian..."
            className="w-64"
          />
        </span>

        <Button
          label="Tambah Jenis Ujian"
          icon="pi pi-plus"
          severity="info"
          onClick={() => {
            setDialogMode("add");
            setSelectedUjian(null);
          }}
        />
      </div>

      {/* 🔹 DataTable */}
      <CustomDataTable
        data={jenisUjianList}
        loading={loading}
        columns={columns}
      />

      {/* 🔹 Form */}
      <FormJenisUjian
        visible={dialogMode !== null}
        selectedUjian={selectedUjian}
        onHide={() => {
          setDialogMode(null);
          setSelectedUjian(null);
        }}
        onSave={handleSave}
      />

      {/* 🔹 Print Dialog */}
      <AdjustPrintMarginLaporan
        adjustDialog={adjustDialog}
        setAdjustDialog={setAdjustDialog}
        dataJenisUjian={jenisUjianList}
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
        header="Preview Laporan Jenis Ujian"
        blockScroll
      >
        <PDFViewer pdfUrl={pdfUrl} fileName={fileName} />
      </Dialog>
    </div>
  );
}
