"use client";

import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { Button } from "primereact/button";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Dropdown } from "primereact/dropdown";
import { Dialog } from "primereact/dialog";
import { ProgressSpinner } from "primereact/progressspinner";
import dynamic from "next/dynamic";

// --- COMPONENTS ---
import ToastNotifier from "../../../components/ToastNotifier";
import HeaderBar from "../../../components/headerbar";
import CustomDataTable from "../../../components/DataTable";
import FormPredikat from "./components/FormPredikat";
import AdjustPrintMarginLaporanPredikat from "./print/AdjustPrintMarginLaporanPredikat";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Dynamic Import PDF Viewer
const PDFViewer = dynamic(() => import("../kkm/print/PDFViewer"), {
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <ProgressSpinner style={{ width: "50px", height: "50px" }} strokeWidth="4" />
    </div>
  ),
  ssr: false,
});

export default function MasterPredikatPage() {
  const toastRef = useRef(null);
  const isMounted = useRef(true);

  // --- STATE DATA ---
  const [token, setToken] = useState("");
  const [predikatList, setPredikatList] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPredikat, setSelectedPredikat] = useState(null);
  const [dialogVisible, setDialogVisible] = useState(false);

  // --- STATE PRINT ---
  const [adjustDialog, setAdjustDialog] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [jsPdfPreviewOpen, setJsPdfPreviewOpen] = useState(false);

  // --- STATE FILTER (updated: only tahun + tingkat) ---
  const [tahunFilter, setTahunFilter] = useState(null);
  const [tingkatFilter, setTingkatFilter] = useState(null);

  const [tahunOptions, setTahunOptions] = useState([]);
  const [tingkatOptions, setTingkatOptions] = useState([]);

  // --- 1. INITIAL LOAD ---
  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) {
      window.location.href = "/";
    } else {
      setToken(t);
      fetchPredikat(t);
    }

    return () => {
      isMounted.current = false;
      toastRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- 2. FETCH DATA ---
  const fetchPredikat = async (t) => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/master-predikat`, {
        headers: { Authorization: `Bearer ${t}` },
      });

      if (!isMounted.current) return;

      if (res.data.status === "00") {
        const data = res.data.data || [];

        // --- SORTING DARI A KE B (ASCENDING) ---
        data.sort((a, b) => a.ID - b.ID);

        // --- Build Filter Options: tahun + tingkat (hapus lainnya) ---
        const tahunSet = new Set();
        const tingkatSet = new Set();

        data.forEach((item) => {
          if (item.tahun_ajaran?.NAMA_TAHUN_AJARAN) {
            tahunSet.add(item.tahun_ajaran.NAMA_TAHUN_AJARAN);
          }
          if (item.TINGKATAN_ID) {
            tingkatSet.add(item.TINGKATAN_ID);
          }
        });

        setPredikatList(data);
        setOriginalData(data);

        setTahunOptions(Array.from(tahunSet).map((y) => ({ label: y, value: y })));
        setTingkatOptions(
          Array.from(tingkatSet).map((tg) => ({ label: `Kelas ${tg}`, value: tg }))
        );
      } else {
        toastRef.current?.showToast("01", res.data.message || "Gagal memuat data Predikat");
      }
    } catch (err) {
      console.error(err);
      toastRef.current?.showToast("01", "Gagal memuat data Predikat");
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  };

  // --- 3. HANDLE SEARCH & FILTER (updated to tahun + tingkat) ---
  const handleSearch = (keyword) => {
    if (!keyword) {
      applyFiltersWithValue(tahunFilter, tingkatFilter);
    } else {
      let filtered = [...originalData];

      // Apply dropdown filters first
      if (tahunFilter) {
        filtered = filtered.filter(
          (item) => item.tahun_ajaran?.NAMA_TAHUN_AJARAN === tahunFilter
        );
      }
      if (tingkatFilter) {
        filtered = filtered.filter((item) => item.TINGKATAN_ID === tingkatFilter);
      }

      // Then apply search keyword
      const lowerKeyword = keyword.toLowerCase();
      filtered = filtered.filter((item) => {
        const tahun = item.tahun_ajaran?.NAMA_TAHUN_AJARAN?.toLowerCase() || "";
        const tingkat = item.TINGKATAN_ID?.toString().toLowerCase() || "";
        const deskA = item.deskripsi?.A?.toLowerCase() || "";
        const deskB = item.deskripsi?.B?.toLowerCase() || "";

        return (
          tahun.includes(lowerKeyword) ||
          tingkat.includes(lowerKeyword) ||
          deskA.includes(lowerKeyword) ||
          deskB.includes(lowerKeyword)
        );
      });

      setPredikatList(filtered);
    }
  };

  const applyFiltersWithValue = (tahun, tingkat) => {
    let filtered = [...originalData];

    if (tahun) {
      filtered = filtered.filter((item) => item.tahun_ajaran?.NAMA_TAHUN_AJARAN === tahun);
    }
    if (tingkat) {
      filtered = filtered.filter((item) => item.TINGKATAN_ID === tingkat);
    }

    setPredikatList(filtered);
  };

  const resetFilter = () => {
    setTahunFilter(null);
    setTingkatFilter(null);
    setPredikatList(originalData);
  };

  // --- 4. CRUD ACTIONS ---
  const handleSubmit = async (data) => {
    try {
      if (selectedPredikat) {
        // UPDATE
        const res = await axios.put(
          `${API_URL}/master-predikat/${selectedPredikat.ID}`,
          data,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data.status === "00") {
          toastRef.current?.showToast("00", "Data Predikat berhasil diperbarui");
        } else {
          toastRef.current?.showToast("01", res.data.message || "Gagal update");
          return;
        }
      } else {
        // CREATE
        const res = await axios.post(`${API_URL}/master-predikat`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.status === "00") {
          toastRef.current?.showToast("00", "Data Predikat berhasil ditambahkan");
        } else {
          toastRef.current?.showToast("01", res.data.message || "Gagal tambah");
          return;
        }
      }

      if (isMounted.current) {
        await fetchPredikat(token);
        setDialogVisible(false);
        setSelectedPredikat(null);
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "Gagal menyimpan data";
      toastRef.current?.showToast("01", msg);
    }
  };

  const handleDelete = (rowData) => {
    confirmDialog({
      message: `Yakin hapus deskripsi mapel "${rowData.mapel?.NAMA_MAPEL}"?`,
      header: "Konfirmasi Hapus",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Ya, Hapus",
      rejectLabel: "Batal",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await axios.delete(`${API_URL}/master-predikat/${rowData.ID}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          toastRef.current?.showToast("00", "Data berhasil dihapus");
          if (isMounted.current) {
            await fetchPredikat(token);
          }
        } catch (err) {
          console.error(err);
          toastRef.current?.showToast("01", "Gagal menghapus data");
        }
      },
    });
  };

  const handleClosePdfPreview = () => {
    setJsPdfPreviewOpen(false);
    setTimeout(() => {
      setPdfUrl("");
    }, 300);
  };

  // --- 6. TABLE COLUMNS ---
  const predikatColumns = [
    {
      field: "ID",
      header: "ID",
      style: { width: "60px", textAlign: "center" },
      body: (row) => row.ID,
    },

    // ✅ KOLOM TAHUN AJARAN
    {
      field: "TAHUN_AJARAN",
      header: "Tahun Ajaran",
      style: { minWidth: "180px" },
      body: (row) => (
        <span className="font-bold text-blue-700">
          {row.tahun_ajaran?.NAMA_TAHUN_AJARAN || row.TAHUN_AJARAN_ID || "-"}
        </span>
      ),
    },

    // ✅ KOLOM TINGKATAN (NULLABLE)
    {
      field: "TINGKATAN",
      header: "Tingkatan",
      style: { minWidth: "100px", textAlign: "center" },
      body: (row) => {
        if (row.TINGKATAN_ID) {
          return (
            <span className="font-medium text-gray-700">
              Kelas {row.tingkatan?.TINGKATAN || row.TINGKATAN_ID}
            </span>
          );
        }
        return <span className="text-gray-400 italic text-sm">Semua Tingkat</span>;
      },
    },

    // ✅ PREDIKAT A
    {
      field: "DESKRIPSI_A",
      header: "Predikat A (Sangat Baik)",
      style: { minWidth: "250px", fontSize: "0.95rem", verticalAlign: "top" },
      body: (row) => <div className="line-clamp-3 text-green-700">{row.deskripsi?.A || "-"}</div>,
    },

    // ✅ PREDIKAT B
    {
      field: "DESKRIPSI_B",
      header: "Predikat B (Baik)",
      style: { minWidth: "250px", fontSize: "0.95rem", verticalAlign: "top" },
      body: (row) => <div className="line-clamp-3 text-blue-700">{row.deskripsi?.B || "-"}</div>,
    },

    // ✅ PREDIKAT C
    {
      field: "DESKRIPSI_C",
      header: "Predikat C (Cukup)",
      style: { minWidth: "250px", fontSize: "0.95rem", verticalAlign: "top" },
      body: (row) => <div className="line-clamp-3 text-orange-700">{row.deskripsi?.C || "-"}</div>,
    },

    // ✅ PREDIKAT D
    {
      field: "DESKRIPSI_D",
      header: "Predikat D (Kurang)",
      style: { minWidth: "250px", fontSize: "0.95rem", verticalAlign: "top" },
      body: (row) => <div className="line-clamp-3 text-red-700">{row.deskripsi?.D || "-"}</div>,
    },

    // ✅ AKSI
    {
      header: "Aksi",
      body: (rowData) => (
        <div className="flex gap-2 justify-content-center">
          <Button
            icon="pi pi-pencil"
            size="small"
            severity="warning"
            tooltip="Edit"
            tooltipOptions={{ position: "top" }}
            onClick={() => {
              setSelectedPredikat(rowData);
              setDialogVisible(true);
            }}
          />
          <Button
            icon="pi pi-trash"
            size="small"
            severity="danger"
            tooltip="Hapus"
            tooltipOptions={{ position: "top" }}
            onClick={() => handleDelete(rowData)}
          />
        </div>
      ),
      style: { width: "100px", textAlign: "center", verticalAlign: "top" },
    },
  ];

  return (
    <div className="card">
      <ToastNotifier ref={toastRef} />
      <ConfirmDialog />

      <h3 className="text-xl font-semibold mb-3">Master Predikat</h3>

      {/* --- FILTER & TOOLBAR SECTION --- */}
      <div className="flex flex-col md:flex-row justify-content-between md:items-center gap-4 mb-4">
        {/* Filter Dropdowns (only Tahun + Tingkatan) */}
        <div className="flex flex-wrap gap-2 items-end">
          <div className="flex flex-column gap-2">
            <label htmlFor="tahun-filter" className="text-sm font-medium">
              Tahun Ajaran
            </label>
            <Dropdown
              id="tahun-filter"
              value={tahunFilter}
              options={tahunOptions}
              onChange={(e) => {
                setTahunFilter(e.value);
                applyFiltersWithValue(e.value, tingkatFilter);
              }}
              placeholder="Pilih Tahun"
              className="w-52"
              showClear
            />
          </div>

          <div className="flex flex-column gap-2">
            <label htmlFor="tingkat-filter" className="text-sm font-medium">
              Tingkatan
            </label>
            <Dropdown
              id="tingkat-filter"
              value={tingkatFilter}
              options={tingkatOptions}
              onChange={(e) => {
                setTingkatFilter(e.value);
                applyFiltersWithValue(tahunFilter, e.value);
              }}
              placeholder="Pilih Tingkat"
              className="w-40"
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

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2">
          <Button
            icon="pi pi-print"
            className="p-button-warning mt-3"
            tooltip="Cetak Laporan"
            onClick={() => setAdjustDialog(true)}
            disabled={predikatList.length === 0 || isLoading}
          />

          <HeaderBar
            title=""
            placeholder="Cari predikat..."
            onSearch={handleSearch}
            onAddClick={() => {
              setSelectedPredikat(null);
              setDialogVisible(true);
            }}
          />
        </div>
      </div>

      {/* --- TABLE --- */}
      <CustomDataTable data={predikatList} loading={isLoading} columns={predikatColumns} />

      {/* Dialogs */}
      <FormPredikat
        visible={dialogVisible}
        onHide={() => {
          setDialogVisible(false);
          setSelectedPredikat(null);
        }}
        selectedItem={selectedPredikat}
        onSave={handleSubmit}
      />

      <AdjustPrintMarginLaporanPredikat
        adjustDialog={adjustDialog}
        setAdjustDialog={setAdjustDialog}
        dataPredikat={predikatList}
        setPdfUrl={setPdfUrl}
        setFileName={setFileName}
        setJsPdfPreviewOpen={setJsPdfPreviewOpen}
      />

      <Dialog
        visible={jsPdfPreviewOpen}
        onHide={handleClosePdfPreview}
        modal
        maximizable
        style={{ width: "90vw", height: "90vh" }}
        header={
          <div className="flex items-center gap-2">
            <i className="pi pi-file-pdf text-red-500"></i>
            <span>Preview - {fileName}</span>
          </div>
        }
        contentStyle={{ height: "calc(90vh - 60px)", padding: 0 }}
      >
        {pdfUrl && <PDFViewer pdfUrl={pdfUrl} fileName={fileName} paperSize="A4" />}
      </Dialog>
    </div>
  );
}
