"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "primereact/button";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { InputText } from "primereact/inputtext";
import { Dialog } from "primereact/dialog";
import dynamic from "next/dynamic";

import CustomDataTable from "../../../components/DataTable";
import ToastNotifier from "../../../components/ToastNotifier";
import FormTahunAjaran from "./components/FormTahunAjaran";
import AdjustPrintMarginLaporanTahunAjaran from "./print/AdjustPrintMarginLaporanTahunAjaran";

// Import PDF Viewer tanpa SSR
const PDFViewer = dynamic(() => import("./print/PDFViewer"), { ssr: false });

export default function MasterTahunAjaranPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const toastRef = useRef(null);
  const isMounted = useRef(true);

  const [tahunList, setTahunList] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTahun, setSelectedTahun] = useState(null);
  const [dialogMode, setDialogMode] = useState(null);

  // 🔹 Print
  const [adjustDialog, setAdjustDialog] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [jsPdfPreviewOpen, setJsPdfPreviewOpen] = useState(false);

  // 🔹 Search
  const [searchKeyword, setSearchKeyword] = useState("");

  useEffect(() => {
    fetchTahunAjaran();
    return () => {
      isMounted.current = false;
      toastRef.current = null;
    };
  }, []);

  // 🔹 Ambil data dari API
  const fetchTahunAjaran = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/master-tahun-ajaran`);
      const json = await res.json();
      if (!isMounted.current) return;
      const sorted = json.data?.sort((a, b) => a.ID - b.ID) || [];
      setTahunList(sorted);
      setOriginalData(sorted);
    } catch (err) {
      console.error(err);
      toastRef.current?.showToast("01", "Gagal memuat data Tahun Ajaran");
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  // ✅ Simpan data (Tambah / Edit)
  const handleSave = async (data) => {
    if (
      !data.TAHUN_AJARAN_ID ||
      !data.NAMA_TAHUN_AJARAN ||
      !data.STATUS ||
      data.TAHUN_AJARAN_ID.trim() === "" ||
      data.NAMA_TAHUN_AJARAN.trim() === "" ||
      data.STATUS.trim() === ""
    ) {
      toastRef.current?.showToast("01", "Harap isi semua field sebelum menyimpan");
      return;
    }

    try {
      if (dialogMode === "add") {
        await fetch(`${API_URL}/master-tahun-ajaran`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        toastRef.current?.showToast("00", "Tahun Ajaran berhasil ditambahkan");
      } else if (dialogMode === "edit" && selectedTahun) {
        await fetch(`${API_URL}/master-tahun-ajaran/${selectedTahun.ID}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        toastRef.current?.showToast("00", "Tahun Ajaran berhasil diperbarui");
      }

      if (isMounted.current) {
        await fetchTahunAjaran();
        setDialogMode(null);
        setSelectedTahun(null);
      }
    } catch (err) {
      console.error(err);
      toastRef.current?.showToast("01", "Gagal menyimpan data Tahun Ajaran");
    }
  };

  // ❌ Hapus data
  const handleDelete = (row) => {
    confirmDialog({
      message: `Yakin ingin menghapus Tahun Ajaran "${row.NAMA_TAHUN_AJARAN}"?`,
      header: "Konfirmasi Hapus",
      icon: "pi pi-exclamation-triangle",
      accept: async () => {
        try {
          await fetch(`${API_URL}/master-tahun-ajaran/${row.ID}`, { method: "DELETE" });
          toastRef.current?.showToast("00", "Tahun Ajaran berhasil dihapus");
          if (isMounted.current) await fetchTahunAjaran();
        } catch (err) {
          console.error(err);
          toastRef.current?.showToast("01", "Gagal menghapus data Tahun Ajaran");
        }
      },
      rejectLabel: "Batal",
      acceptLabel: "Hapus",
      acceptClassName: "p-button-danger",
    });
  };

  // 🔍 Search
  const handleSearch = (keyword) => {
    setSearchKeyword(keyword);
    if (!keyword) {
      setTahunList(originalData);
    } else {
      const filtered = originalData.filter(
        (t) =>
          t.NAMA_TAHUN_AJARAN.toLowerCase().includes(keyword.toLowerCase()) ||
          t.TAHUN_AJARAN_ID.toLowerCase().includes(keyword.toLowerCase()) ||
          t.STATUS.toLowerCase().includes(keyword.toLowerCase())
      );
      setTahunList(filtered);
    }
  };

  const actionBodyTemplate = (row) => (
    <div className="flex gap-2">
      <Button
        icon="pi pi-pencil"
        size="small"
        severity="warning"
        onClick={() => {
          setSelectedTahun(row);
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
  );

  const columns = [
    { field: "ID", header: "ID", style: { width: "60px" } },
    { field: "TAHUN_AJARAN_ID", header: "Kode Tahun" },
    { field: "NAMA_TAHUN_AJARAN", header: "Nama Tahun Ajaran" },
    { field: "STATUS", header: "Status" },
    { header: "Actions", body: actionBodyTemplate, style: { width: "120px" } },
  ];

  return (
    <div className="card p-4">
      <h3 className="text-xl font-semibold mb-4">Master Tahun Ajaran</h3>

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
            placeholder="Cari Tahun Ajaran..."
            className="w-64"
          />
        </span>

        <Button
          label="Tambah Tahun Ajaran"
          icon="pi pi-plus"
          onClick={() => {
            setDialogMode("add");
            setSelectedTahun(null);
          }}
        />
      </div>

      {/* 🔹 Data Table */}
      <CustomDataTable data={tahunList} loading={loading} columns={columns} />

      <ConfirmDialog />

      {/* 🔹 Form Input Tahun Ajaran */}
      <FormTahunAjaran
        visible={dialogMode !== null}
        onHide={() => {
          setDialogMode(null);
          setSelectedTahun(null);
        }}
        selectedTahunAjaran={selectedTahun}
        onSave={handleSave}
      />

      {/* 🔹 Print & PDF Preview */}
      <AdjustPrintMarginLaporanTahunAjaran
        adjustDialog={adjustDialog}
        setAdjustDialog={setAdjustDialog}
        dataTahunAjaran={tahunList}
        setPdfUrl={setPdfUrl}
        setFileName={setFileName}
        setJsPdfPreviewOpen={setJsPdfPreviewOpen}
      />

      <Dialog
        visible={jsPdfPreviewOpen}
        onHide={() => setJsPdfPreviewOpen(false)}
        modal
        style={{ width: "90vw", height: "90vh" }}
        header="Preview Laporan Tahun Ajaran"
      >
        <PDFViewer pdfUrl={pdfUrl} fileName={fileName} paperSize="A4" />
      </Dialog>

      <ToastNotifier ref={toastRef} />
    </div>
  );
}
