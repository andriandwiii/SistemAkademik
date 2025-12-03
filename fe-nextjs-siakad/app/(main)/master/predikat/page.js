"use client";

import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { Button } from "primereact/button";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Dropdown } from "primereact/dropdown";
import { Dialog } from "primereact/dialog";
import { ProgressSpinner } from "primereact/progressspinner";
import dynamic from "next/dynamic";
import { Tag } from "primereact/tag"; // ✅ import Tag

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

  // --- STATE FILTER ---
  // mapelFilter stores KODE_MAPEL (string)
  const [tahunFilter, setTahunFilter] = useState(null);
  const [mapelFilter, setMapelFilter] = useState(null);

  const [tahunOptions, setTahunOptions] = useState([]);
  const [mapelOptions, setMapelOptions] = useState([]); // { label: "Nama (KODE)", value: "KODE" }

  // -----------------------
  // Templates for Dropdown
  // -----------------------
  const mapelOptionTemplate = (option) => {
    if (!option) return null;
    // label expected like "Nama Mapel (KODE)"
    const nama = option.label?.split(" (")[0] ?? option.label;
    // value is kode
    return (
      <div className="flex align-items-center gap-2">
        <span>{nama}</span>
        <Tag value={option.value} severity="info" className="text-xs" />
      </div>
    );
  };

  const mapelValueTemplate = (selected) => {
    if (!selected) return <span className="text-500">Pilih Mata Pelajaran</span>;
    const opt = typeof selected === "object" && selected !== null
      ? selected
      : mapelOptions.find((o) => o.value === selected);
    if (!opt) return <span>{selected}</span>;
    const nama = opt.label?.split(" (")[0] ?? opt.label;
    return (
      <div className="flex align-items-center gap-2">
        <span>{nama}</span>
        <Tag value={opt.value} severity="info" className="text-xs" />
      </div>
    );
  };

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

        data.sort((a, b) => a.ID - b.ID);

        const tahunSet = new Set();
        // collect mapel by kode to ensure unique and preserve kode
        const mapelMap = {};

        data.forEach((item) => {
          if (item.tahun_ajaran?.NAMA_TAHUN_AJARAN) {
            tahunSet.add(item.tahun_ajaran.NAMA_TAHUN_AJARAN);
          }

          // prefer mata_pelajaran.KODE_MAPEL, fallback to row.KODE_MAPEL
          const kode = item.mata_pelajaran?.KODE_MAPEL || item.KODE_MAPEL || null;
          const nama = item.mata_pelajaran?.NAMA_MAPEL || null;
          if (kode) {
            mapelMap[kode] = nama || kode;
          }
        });

        setPredikatList(data);
        setOriginalData(data);

        setTahunOptions(Array.from(tahunSet).map((y) => ({ label: y, value: y })));
        const mapelOpts = Object.keys(mapelMap).map((kode) => ({
          label: `${mapelMap[kode]} (${kode})`,
          value: kode,
        }));
        setMapelOptions(mapelOpts);
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

  // --- 3. HANDLE SEARCH & FILTER ---
  const handleSearch = (keyword) => {
    if (!keyword) {
      applyFiltersWithValue(tahunFilter, mapelFilter);
      return;
    }

    let filtered = [...originalData];

    if (tahunFilter) {
      filtered = filtered.filter(
        (item) => item.tahun_ajaran?.NAMA_TAHUN_AJARAN === tahunFilter
      );
    }
    if (mapelFilter) {
      filtered = filtered.filter((item) => {
        const kode = item.mata_pelajaran?.KODE_MAPEL || item.KODE_MAPEL || "";
        return kode === mapelFilter;
      });
    }

    const lowerKeyword = keyword.toLowerCase();
    filtered = filtered.filter((item) => {
      const tahun = item.tahun_ajaran?.NAMA_TAHUN_AJARAN?.toLowerCase() || "";
      const mapelName = item.mata_pelajaran?.NAMA_MAPEL?.toLowerCase() || "";
      const mapelKode = (item.mata_pelajaran?.KODE_MAPEL || item.KODE_MAPEL || "").toLowerCase();
      const deskA = item.deskripsi?.A?.toLowerCase() || "";
      const deskB = item.deskripsi?.B?.toLowerCase() || "";
      const deskC = item.deskripsi?.C?.toLowerCase() || "";
      const deskD = item.deskripsi?.D?.toLowerCase() || "";

      return (
        tahun.includes(lowerKeyword) ||
        mapelName.includes(lowerKeyword) ||
        mapelKode.includes(lowerKeyword) ||
        deskA.includes(lowerKeyword) ||
        deskB.includes(lowerKeyword) ||
        deskC.includes(lowerKeyword) ||
        deskD.includes(lowerKeyword)
      );
    });

    setPredikatList(filtered);
  };

  const applyFiltersWithValue = (tahun, mapelKode) => {
    let filtered = [...originalData];

    if (tahun) {
      filtered = filtered.filter((item) => item.tahun_ajaran?.NAMA_TAHUN_AJARAN === tahun);
    }
    if (mapelKode) {
      filtered = filtered.filter((item) => {
        const kode = item.mata_pelajaran?.KODE_MAPEL || item.KODE_MAPEL || "";
        return kode === mapelKode;
      });
    }

    setPredikatList(filtered);
  };

  const resetFilter = () => {
    setTahunFilter(null);
    setMapelFilter(null);
    setPredikatList(originalData);
  };

  // --- 4. CRUD ACTIONS ---
  const handleSubmit = async (data) => {
    try {
      if (selectedPredikat) {
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
      message: `Yakin hapus data predikat ini?`,
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

    // ✅ KOLOM MATA PELAJARAN (tampilkan nama + kode)
    {
      field: "MATA_PELAJARAN",
      header: "Mata Pelajaran",
      style: { minWidth: "225px" },
      body: (row) => {
        const nama = row.mata_pelajaran?.NAMA_MAPEL || row.NAMA_MAPEL || "-";
        const kode = row.mata_pelajaran?.KODE_MAPEL || row.KODE_MAPEL || null;
        return (
          <div className="flex align-items-center gap-2">
            <span>{nama}</span>
            {kode && <Tag value={kode} severity="info" className="text-xs" />}
          </div>
        );
      },
    },

    {
      field: "TAHUN_AJARAN",
      header: "Tahun Ajaran",
      style: { minWidth: "150px" },
      body: (row) => row.tahun_ajaran?.NAMA_TAHUN_AJARAN || row.TAHUN_AJARAN_ID || "-",
    },

    {
      field: "DESKRIPSI_A",
      header: "Predikat A (Sangat Baik)",
      style: { minWidth: "250px" },
      body: (row) => <div className="line-clamp-3">{row.deskripsi?.A || "-"}</div>,
    },

    {
      field: "DESKRIPSI_B",
      header: "Predikat B (Baik)",
      style: { minWidth: "250px" },
      body: (row) => <div className="line-clamp-3">{row.deskripsi?.B || "-"}</div>,
    },

    {
      field: "DESKRIPSI_C",
      header: "Predikat C (Cukup)",
      style: { minWidth: "250px" },
      body: (row) => <div className="line-clamp-3">{row.deskripsi?.C || "-"}</div>,
    },

    {
      field: "DESKRIPSI_D",
      header: "Predikat D (Kurang)",
      style: { minWidth: "250px" },
      body: (row) => <div className="line-clamp-3">{row.deskripsi?.D || "-"}</div>,
    },

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
      style: { width: "100px", textAlign: "center" },
    },
  ];

  return (
    <div className="card">
      <ToastNotifier ref={toastRef} />
      <ConfirmDialog />

      <h3 className="text-xl font-semibold mb-3">Master Predikat</h3>

      <div className="flex flex-col md:flex-row justify-content-between md:items-center gap-4 mb-4">
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
                applyFiltersWithValue(e.value, mapelFilter);
              }}
              placeholder="Pilih Tahun"
              className="w-52"
              showClear
            />
          </div>

          {/* ✅ FILTER MAPEL: tampilkan nama + tag kode, value = KODE_MAPEL */}
          <div className="flex flex-column gap-2">
            <label htmlFor="mapel-filter" className="text-sm font-medium">
              Mata Pelajaran
            </label>
            <Dropdown
              id="mapel-filter"
              value={mapelFilter}
              options={mapelOptions}
              onChange={(e) => {
                setMapelFilter(e.value);
                applyFiltersWithValue(tahunFilter, e.value);
              }}
              placeholder="Pilih Mapel"
              className="w-52"
              showClear
              filter
              itemTemplate={mapelOptionTemplate}
              valueTemplate={mapelValueTemplate}
            />
          </div>

          <Button
            icon="pi pi-refresh"
            className="p-button-secondary mt-3"
            tooltip="Reset Filter"
            onClick={resetFilter}
          />
        </div>

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

      <CustomDataTable data={predikatList} loading={isLoading} columns={predikatColumns} />

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
