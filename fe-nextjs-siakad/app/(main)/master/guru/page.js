"use client";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { ProgressSpinner } from "primereact/progressspinner";
import dynamic from "next/dynamic";
import TabelGuru from "./components/tabelGuru";
import FormGuru from "./components/formDialogGuru";
import HeaderBar from "@/app/components/headerbar";
import ToastNotifier from "@/app/components/ToastNotifier";
import FilterTanggal from "@/app/components/filterTanggal";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import AdjustPrintMarginLaporan from "./print/AdjustPrintMarginLaporan";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Dynamic import PDFViewer dengan loading fallback
const PDFViewer = dynamic(() => import("./print/PDFViewer"), {
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <ProgressSpinner style={{ width: "50px", height: "50px" }} strokeWidth="4" />
    </div>
  ),
  ssr: false,
});

const GuruPage = () => {
  const toastRef = useRef(null);
  const [token, setToken] = useState("");
  
  const [data, setData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  
  const [formData, setFormData] = useState({
    GURU_ID: 0,
    NIP: "",
    NAMA: "",
    PANGKAT: "",
    KODE_JABATAN: "",
    STATUS_KEPEGAWAIAN: "Aktif",
    EMAIL: "",
    TGL_LAHIR: "",
    TEMPAT_LAHIR: "",
    GENDER: "",
    ALAMAT: "",
    NO_TELP: "",
    PENDIDIKAN_TERAKHIR: "",
    TAHUN_LULUS: "",
    UNIVERSITAS: "",
    NO_SERTIFIKAT_PENDIDIK: "",
    TAHUN_SERTIFIKAT: "",
    MAPEL_DIAMPU: "",
    FOTO: null,
  });
  
  const [errors, setErrors] = useState({});

  // Filter tanggal
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // PDF Preview
  const [adjustDialog, setAdjustDialog] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [jsPdfPreviewOpen, setJsPdfPreviewOpen] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) {
      window.location.href = "/";
    } else {
      setToken(t);
      fetchGuru(t);
    }
  }, []);

  const fetchGuru = async (t) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/master-guru`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (res.data.status === "00") {
        const guruData = Array.isArray(res.data.data) ? res.data.data : [res.data.data];
        const sorted = guruData.sort((a, b) => b.GURU_ID - a.GURU_ID);
        setData(sorted);
        setOriginalData(sorted);
      } else {
        toastRef.current?.showToast("01", res.data.message || "Gagal mengambil data");
      }
    } catch (err) {
      console.error("Gagal mengambil data:", err);
      toastRef.current?.showToast("01", "Gagal mengambil data");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (keyword) => {
    if (!keyword) {
      setData(originalData);
    } else {
      const filtered = originalData.filter(
        (item) =>
          item.NIP?.toLowerCase().includes(keyword.toLowerCase()) ||
          item.NAMA?.toLowerCase().includes(keyword.toLowerCase()) ||
          item.EMAIL?.toLowerCase().includes(keyword.toLowerCase()) ||
          item.JABATAN?.toLowerCase().includes(keyword.toLowerCase())
      );
      setData(filtered);
    }
  };

  // Filter tanggal lahir
  const handleDateFilter = () => {
    if (!startDate && !endDate) return setData(originalData);
    const filtered = originalData.filter((item) => {
      const birthDate = new Date(item.TGL_LAHIR);
      const from = startDate ? new Date(startDate.setHours(0, 0, 0, 0)) : null;
      const to = endDate ? new Date(endDate.setHours(23, 59, 59, 999)) : null;
      return (!from || birthDate >= from) && (!to || birthDate <= to);
    });
    setData(filtered);
  };

  const resetFilter = () => {
    setStartDate(null);
    setEndDate(null);
    setData(originalData);
  };

  const handleEdit = (row) => {
    setFormData({ 
      ...row,
      FOTO: null // Reset foto saat edit
    });
    setDialogVisible(true);
  };

  const handleDelete = (row) => {
    confirmDialog({
      message: `Apakah Anda yakin ingin menghapus guru ${row.NAMA}?`,
      header: "Konfirmasi Hapus",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Ya",
      rejectLabel: "Batal",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await axios.delete(`${API_URL}/master-guru/${row.GURU_ID}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          fetchGuru(token);
          toastRef.current?.showToast("00", "Data berhasil dihapus");
        } catch (err) {
          console.error("Gagal menghapus data:", err);
          toastRef.current?.showToast("01", "Gagal menghapus data");
        }
      },
    });
  };

  const resetForm = () => {
    setFormData({
      GURU_ID: 0,
      NIP: "",
      NAMA: "",
      PANGKAT: "",
      KODE_JABATAN: "",
      STATUS_KEPEGAWAIAN: "Aktif",
      EMAIL: "",
      TGL_LAHIR: "",
      TEMPAT_LAHIR: "",
      GENDER: "",
      ALAMAT: "",
      NO_TELP: "",
      PENDIDIKAN_TERAKHIR: "",
      TAHUN_LULUS: "",
      UNIVERSITAS: "",
      NO_SERTIFIKAT_PENDIDIK: "",
      TAHUN_SERTIFIKAT: "",
      MAPEL_DIAMPU: "",
      FOTO: null,
    });
    setErrors({});
  };

  const handlePrintClick = () => {
    handleDateFilter();
    setAdjustDialog(true);
  };

  const handleClosePdfPreview = () => {
    setJsPdfPreviewOpen(false);
    // Clear PDF URL untuk free memory
    setTimeout(() => {
      setPdfUrl("");
    }, 300);
  };

  return (
    <div className="card">
      <ToastNotifier ref={toastRef} />
      <ConfirmDialog />
      
      <h3 className="text-xl font-semibold mb-3">Master Guru</h3>
      
      {/* Filter & Toolbar */}
      <div className="flex flex-col md:flex-row justify-content-between md:items-center gap-4 mb-4">
        <FilterTanggal
          startDate={startDate}
          endDate={endDate}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
          handleDateFilter={handleDateFilter}
          resetFilter={resetFilter}
        />

        <div className="flex items-center justify-end gap-2">
          <Button
            icon="pi pi-print"
            className="p-button-warning"
            tooltip="Cetak Laporan"
            tooltipOptions={{ position: "bottom" }}
            onClick={handlePrintClick}
            disabled={data.length === 0 }
          />

          <HeaderBar
            title=""
            placeholder="Cari guru (NIP, Nama, Email, Jabatan)"
            onSearch={handleSearch}
            onAddClick={() => {
              resetForm();
              setDialogVisible(true);
            }}
          />
        </div>
      </div>

      {/* Tabel Guru */}
      <TabelGuru
        data={data}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      
      {/* Form Dialog */}
      <FormGuru
        visible={dialogVisible}
        onHide={() => {
          setDialogVisible(false);
          resetForm();
        }}
        formData={formData}
        setFormData={setFormData}
        errors={errors}
        reloadData={() => fetchGuru(token)} 
        toastRef={toastRef}
      />

      {/* Dialog Adjust Print Margin */}
      <AdjustPrintMarginLaporan
        adjustDialog={adjustDialog}
        setAdjustDialog={setAdjustDialog}
        dataGuru={data}
        setPdfUrl={setPdfUrl}
        setFileName={setFileName}
        setJsPdfPreviewOpen={setJsPdfPreviewOpen}
      />

      {/* Dialog PDF Preview */}
      <Dialog
        visible={jsPdfPreviewOpen}
        onHide={handleClosePdfPreview}
        modal
        maximizable
        style={{ width: "90vw", height: "90vh" }}
        header={
          <div className="flex items-center gap-2">
            <i className="pi pi-file-pdf text-red-500"></i>
            <span>Preview Laporan Guru</span>
          </div>
        }
        contentStyle={{ height: "calc(90vh - 60px)", padding: 0 }}
      >
        {pdfUrl && (
          <PDFViewer 
            pdfUrl={pdfUrl} 
            fileName={fileName || "laporan-guru"} 
            paperSize="A4" 
          />
        )}
      </Dialog>
    </div>
  );
};

export default GuruPage;