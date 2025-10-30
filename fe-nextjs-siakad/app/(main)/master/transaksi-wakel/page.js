"use client";

import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { Button } from "primereact/button";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Dropdown } from "primereact/dropdown";
import { Dialog } from "primereact/dialog";
import { ProgressSpinner } from "primereact/progressspinner";
import dynamic from "next/dynamic";
import ToastNotifier from "../../../components/ToastNotifier";
import HeaderBar from "../../../components/headerbar";
import CustomDataTable from "../../../components/DataTable";
import FormTransaksiWakel from "./components/FormTransaksi";
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

export default function TransaksiWakelPage() {
  const toastRef = useRef(null);
  const isMounted = useRef(true);

  const [token, setToken] = useState("");
  const [transaksi, setTransaksi] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTransaksi, setSelectedTransaksi] = useState(null);
  const [dialogVisible, setDialogVisible] = useState(false);

  // Filter
  const [tingkatanFilter, setTingkatanFilter] = useState(null);
  const [jurusanFilter, setJurusanFilter] = useState(null);
  const [kelasFilter, setKelasFilter] = useState(null);
  const [tingkatanOptions, setTingkatanOptions] = useState([]);
  const [jurusanOptions, setJurusanOptions] = useState([]);
  const [kelasOptions, setKelasOptions] = useState([]);

  // Print
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
      fetchTransaksi(t);
    }

    return () => {
      isMounted.current = false;
      toastRef.current = null;
    };
  }, []);

  const fetchTransaksi = async (t) => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/transaksi-wakel`, {
        headers: { Authorization: `Bearer ${t}` },
      });

      if (!isMounted.current) return;

      if (res.data.status === "00") {
        const data = res.data.data || [];

        // Build filter options
        const tingkatanSet = new Set();
        const jurusanSet = new Set();
        const kelasSet = new Set();

        data.forEach((t) => {
          if (t.tingkatan?.TINGKATAN) tingkatanSet.add(t.tingkatan.TINGKATAN);
          if (t.jurusan?.NAMA_JURUSAN) jurusanSet.add(t.jurusan.NAMA_JURUSAN);
          if (t.kelas?.KELAS_ID) kelasSet.add(t.kelas.KELAS_ID);
        });

        setTransaksi(data);
        setOriginalData(data);
        setTingkatanOptions(
          Array.from(tingkatanSet).map((t) => ({ label: t, value: t }))
        );
        setJurusanOptions(
          Array.from(jurusanSet).map((j) => ({ label: j, value: j }))
        );
        setKelasOptions(
          Array.from(kelasSet).map((k) => ({ label: k, value: k }))
        );
      } else {
        toastRef.current?.showToast("01", res.data.message || "Gagal memuat data wali kelas");
      }
    } catch (err) {
      console.error(err);
      toastRef.current?.showToast("01", "Gagal memuat data wali kelas");
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  };

  // Search handler
  const handleSearch = (keyword) => {
    if (!keyword) {
      setTransaksi(originalData);
    } else {
      const filtered = originalData.filter(
        (t) =>
          t.guru?.NAMA?.toLowerCase().includes(keyword.toLowerCase()) ||
          t.guru?.NIP?.toLowerCase().includes(keyword.toLowerCase())
      );
      setTransaksi(filtered);
    }
  };

  // Apply all filters with values
  const applyFiltersWithValue = (tingkatan, jurusan, kelas) => {
    let filtered = [...originalData];

    // Filter by tingkatan
    if (tingkatan) {
      filtered = filtered.filter((t) => t.tingkatan?.TINGKATAN === tingkatan);
    }

    // Filter by jurusan
    if (jurusan) {
      filtered = filtered.filter((t) => t.jurusan?.NAMA_JURUSAN === jurusan);
    }

    // Filter by kelas
    if (kelas) {
    filtered = filtered.filter((t) => t.kelas?.KELAS_ID === kelas);
    }

    setTransaksi(filtered);
  };

  // Reset all filters
  const resetFilter = () => {
    setTingkatanFilter(null);
    setJurusanFilter(null);
    setKelasFilter(null);
    setTransaksi(originalData);
  };

  const handleSubmit = async (data) => {
    try {
      if (selectedTransaksi) {
        // Edit mode
        const res = await axios.put(
          `${API_URL}/transaksi-wakel/${selectedTransaksi.ID}`,
          data,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.data.status === "00") {
          toastRef.current?.showToast("00", "Wali kelas berhasil diperbarui");
        } else {
          toastRef.current?.showToast("01", res.data.message || "Gagal memperbarui wali kelas");
          return;
        }
      } else {
        // Add mode
        const res = await axios.post(
          `${API_URL}/transaksi-wakel`,
          data,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.data.status === "00") {
          toastRef.current?.showToast("00", "Wali kelas berhasil ditambahkan");
        } else {
          toastRef.current?.showToast("01", res.data.message || "Gagal menambahkan wali kelas");
          return;
        }
      }

      if (isMounted.current) {
        await fetchTransaksi(token);
        setDialogVisible(false);
        setSelectedTransaksi(null);
      }
    } catch (err) {
      console.error(err);
      toastRef.current?.showToast("01", err.response?.data?.message || "Gagal menyimpan wali kelas");
    }
  };

  const handleDelete = (rowData) => {
    confirmDialog({
      message: `Apakah Anda yakin ingin menghapus wali kelas "${rowData.guru?.NAMA}"?`,
      header: "Konfirmasi Hapus",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Ya",
      rejectLabel: "Batal",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await axios.delete(`${API_URL}/transaksi-wakel/${rowData.ID}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          toastRef.current?.showToast("00", "Wali kelas berhasil dihapus");
          if (isMounted.current) await fetchTransaksi(token);
        } catch (err) {
          console.error(err);
          toastRef.current?.showToast("01", "Gagal menghapus wali kelas");
        }
      },
    });
  };

  const handlePrintClick = () => {
    setAdjustDialog(true);
  };

  const handleClosePdfPreview = () => {
    setJsPdfPreviewOpen(false);
    // Clear PDF URL untuk free memory
    setTimeout(() => {
      setPdfUrl("");
    }, 300);
  };

  const transaksiColumns = [
    { field: "ID", header: "ID", style: { width: "60px" } },
    {
      field: "TRANSAKSI_ID",
      header: "ID Transaksi",
      style: { minWidth: "140px" },
    },
    {
      field: "guru.NAMA",
      header: "Nama Guru",
      style: { minWidth: "180px" },
      body: (row) => row.guru?.NAMA || "-",
    },
    {
      field: "guru.NIP",
      header: "NIP",
      style: { minWidth: "140px" },
      body: (row) => row.guru?.NIP || "-",
    },
    {
      field: "tingkatan.TINGKATAN",
      header: "Tingkatan",
      style: { minWidth: "100px" },
      body: (row) => row.tingkatan?.TINGKATAN || "-",
    },
    {
      field: "jurusan.NAMA_JURUSAN",
      header: "Jurusan",
      style: { minWidth: "140px" },
      body: (row) => row.jurusan?.NAMA_JURUSAN || "-",
    },
    {
    field: "kelas.KELAS_ID",
    header: "Kelas ID",
    style: { minWidth: "120px" },
    body: (row) => row.kelas?.KELAS_ID || "-",
    },

    {
      header: "Aksi",
      body: (rowData) => (
        <div className="flex gap-2">
          <Button
            icon="pi pi-pencil"
            size="small"
            severity="warning"
            onClick={() => {
              setSelectedTransaksi(rowData);
              setDialogVisible(true);
            }}
          />
          <Button
            icon="pi pi-trash"
            size="small"
            severity="danger"
            onClick={() => handleDelete(rowData)}
          />
        </div>
      ),
      style: { width: "120px" },
    },
  ];

  return (
    <div className="card">
      <ToastNotifier ref={toastRef} />
      <ConfirmDialog />

      <h3 className="text-xl font-semibold mb-3">Transaksi Guru Wali Kelas</h3>

      {/* Filter & Toolbar */}
      <div className="flex flex-col md:flex-row justify-content-between md:items-center gap-4 mb-4">
        {/* Filter Section */}
        <div className="flex flex-wrap gap-2 items-end">
          <div className="flex flex-column gap-2">
            <label htmlFor="tingkatan-filter" className="text-sm font-medium">
              Tingkatan
            </label>
            <Dropdown
              id="tingkatan-filter"
              value={tingkatanFilter}
              options={tingkatanOptions}
              onChange={(e) => {
                setTingkatanFilter(e.value);
                applyFiltersWithValue(e.value, jurusanFilter, kelasFilter);
              }}
              placeholder="Pilih tingkatan"
              className="w-48"
              showClear
            />
          </div>

          <div className="flex flex-column gap-2">
            <label htmlFor="jurusan-filter" className="text-sm font-medium">
              Jurusan
            </label>
            <Dropdown
              id="jurusan-filter"
              value={jurusanFilter}
              options={jurusanOptions}
              onChange={(e) => {
                setJurusanFilter(e.value);
                applyFiltersWithValue(tingkatanFilter, e.value, kelasFilter);
              }}
              placeholder="Pilih jurusan"
              className="w-52"
              showClear
            />
          </div>

          <div className="flex flex-column gap-2">
            <label htmlFor="kelas-filter" className="text-sm font-medium">
              Kelas
            </label>
            <Dropdown
              id="kelas-filter"
              value={kelasFilter}
              options={kelasOptions}
              onChange={(e) => {
                setKelasFilter(e.value);
                applyFiltersWithValue(tingkatanFilter, jurusanFilter, e.value);
              }}
              placeholder="Pilih kelas"
              className="w-48"
              showClear
            />
          </div>

        <Button
        icon="pi pi-refresh"
        className="p-button-secondary mt-3"
        tooltip="Reset Filter"
        onClick={resetFilter}
        />
        </div>

        {/* Action Section */}
        <div className="flex items-center justify-end gap-2">
          <Button
            icon="pi pi-print"
            className="p-button-warning mt-3"
            tooltip="Cetak Laporan"
            onClick={handlePrintClick}
            disabled={transaksi.length === 0}
          />

          <HeaderBar
            title=""
            placeholder="Cari guru (Nama, NIP)"
            onSearch={handleSearch}
            onAddClick={() => {
              setSelectedTransaksi(null);
              setDialogVisible(true);
            }}
          />
        </div>
      </div>

      {/* Tabel Data */}
      <CustomDataTable
        data={transaksi}
        loading={isLoading}
        columns={transaksiColumns}
      />

      {/* Form Transaksi Wali Kelas */}
      <FormTransaksiWakel
        visible={dialogVisible}
        onHide={() => {
          setDialogVisible(false);
          setSelectedTransaksi(null);
        }}
        selectedTransaksi={selectedTransaksi}
        onSave={handleSubmit}
        token={token}
        transaksiList={originalData}
      />

      {/* Dialog Adjust Print Margin */}
      <AdjustPrintMarginLaporan
        adjustDialog={adjustDialog}
        setAdjustDialog={setAdjustDialog}
        dataTransaksi={transaksi}
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
            <span>Preview Laporan Wali Kelas</span>
          </div>
        }
        contentStyle={{ height: "calc(90vh - 60px)", padding: 0 }}
      >
        {pdfUrl && (
          <PDFViewer
            pdfUrl={pdfUrl}
            fileName={fileName || "laporan-wali-kelas"}
            paperSize="A4"
          />
        )}
      </Dialog>
    </div>
  );
}