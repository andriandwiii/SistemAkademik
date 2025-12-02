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
import FormKKM from "./components/FormKKM";
import AdjustPrintMarginLaporanKKM from "./print/AdjustPrintMarginLaporanKKM";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const PDFViewer = dynamic(() => import("./print/PDFViewer"), {
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <ProgressSpinner style={{ width: "50px", height: "50px" }} strokeWidth="4" />
    </div>
  ),
  ssr: false,
});

export default function MasterKKMPage() {
  const toastRef = useRef(null);
  const isMounted = useRef(true);

  const [token, setToken] = useState("");
  const [kkmList, setKkmList] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedKKM, setSelectedKKM] = useState(null);
  const [dialogVisible, setDialogVisible] = useState(false);

  // Print
  const [adjustDialog, setAdjustDialog] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [jsPdfPreviewOpen, setJsPdfPreviewOpen] = useState(false);

  // Filter
  const [statusFilter, setStatusFilter] = useState(null);
  const [mapelFilter, setMapelFilter] = useState(null);
  const [tahunFilter, setTahunFilter] = useState(null); // <-- added

  const [statusOptions, setStatusOptions] = useState([]);
  const [mapelOptions, setMapelOptions] = useState([]);
  const [tahunOptions, setTahunOptions] = useState([]); // <-- added

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) {
      window.location.href = "/";
    } else {
      setToken(t);
      fetchKKM(t);
    }

    return () => {
      isMounted.current = false;
      toastRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchKKM = async (t) => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/master-kkm`, {
        headers: { Authorization: `Bearer ${t}` },
      });

      if (!isMounted.current) return;

      if (res.data.status === "00") {
        const data = res.data.data || [];
        data.sort((a, b) => a.ID - b.ID);

        // Build filter options
        const statusSet = new Set();
        const mapelSet = new Set();
        const tahunSet = new Set(); // <-- added

        data.forEach((k) => {
          if (k.STATUS) statusSet.add(k.STATUS);
          if (k.NAMA_MAPEL) mapelSet.add(k.NAMA_MAPEL);
          if (k.NAMA_TAHUN_AJARAN) tahunSet.add(k.NAMA_TAHUN_AJARAN); // <-- added
        });

        setKkmList(data);
        setOriginalData(data);
        setStatusOptions(Array.from(statusSet).map((s) => ({ label: s, value: s })));
        setMapelOptions(Array.from(mapelSet).map((m) => ({ label: m, value: m })));
        setTahunOptions(Array.from(tahunSet).map((t) => ({ label: t, value: t }))); // <-- added
      } else {
        toastRef.current?.showToast("01", res.data.message || "Gagal memuat data KKM");
      }
    } catch (err) {
      console.error(err);
      toastRef.current?.showToast("01", "Gagal memuat data KKM");
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  };

  // Search handler
  const handleSearch = (keyword) => {
    if (!keyword) {
      applyFiltersWithValue(statusFilter, mapelFilter, tahunFilter); // <-- include tahunFilter
    } else {
      let filtered = [...originalData];

      // Apply dropdown filters first
      if (statusFilter) {
        filtered = filtered.filter((k) => k.STATUS === statusFilter);
      }
      if (mapelFilter) {
        filtered = filtered.filter((k) => k.NAMA_MAPEL === mapelFilter);
      }
      if (tahunFilter) {
        filtered = filtered.filter((k) => k.NAMA_TAHUN_AJARAN === tahunFilter);
      }

      // Then apply search keyword
      const lowerKeyword = keyword.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.KODE_KKM?.toLowerCase().includes(lowerKeyword) ||
          item.KODE_MAPEL?.toLowerCase().includes(lowerKeyword) ||
          item.NAMA_MAPEL?.toLowerCase().includes(lowerKeyword) ||
          item.KETERANGAN?.toLowerCase().includes(lowerKeyword)
      );

      setKkmList(filtered);
    }
  };

  // Apply all filters with values (updated to accept tahun)
  const applyFiltersWithValue = (status, mapel, tahun) => {
    let filtered = [...originalData];

    if (status) {
      filtered = filtered.filter((k) => k.STATUS === status);
    }
    if (mapel) {
      filtered = filtered.filter((k) => k.NAMA_MAPEL === mapel);
    }
    if (tahun) {
      filtered = filtered.filter((k) => k.NAMA_TAHUN_AJARAN === tahun);
    }

    setKkmList(filtered);
  };

  // Reset all filters
  const resetFilter = () => {
    setStatusFilter(null);
    setMapelFilter(null);
    setTahunFilter(null); // <-- added
    setKkmList(originalData);
  };

  const handleSubmit = async (data) => {
    try {
      if (selectedKKM) {
        const res = await axios.put(
          `${API_URL}/master-kkm/${selectedKKM.ID}`,
          data,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data.status === "00") {
          toastRef.current?.showToast("00", "Data KKM berhasil diperbarui");
        } else {
          toastRef.current?.showToast("01", res.data.message || "Gagal memperbarui data KKM");
          return;
        }
      } else {
        const res = await axios.post(`${API_URL}/master-kkm`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.status === "00") {
          toastRef.current?.showToast("00", "Data KKM berhasil ditambahkan");
        } else {
          toastRef.current?.showToast("01", res.data.message || "Gagal menambahkan data KKM");
          return;
        }
      }

      if (isMounted.current) {
        await fetchKKM(token);
        setDialogVisible(false);
        setSelectedKKM(null);
      }
    } catch (err) {
      console.error(err);
      toastRef.current?.showToast("01", err.response?.data?.message || "Gagal menyimpan data KKM");
    }
  };

  const handleDelete = (rowData) => {
    confirmDialog({
      message: `Yakin ingin menghapus data KKM "${rowData.KODE_KKM}" (${rowData.NAMA_MAPEL || rowData.KODE_MAPEL})?`,
      header: "Konfirmasi Hapus",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Ya",
      rejectLabel: "Batal",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await axios.delete(`${API_URL}/master-kkm/${rowData.ID}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          toastRef.current?.showToast("00", "Data KKM berhasil dihapus");
          if (isMounted.current) {
            await fetchKKM(token);
          }
        } catch (err) {
          console.error(err);
          toastRef.current?.showToast("01", "Gagal menghapus data KKM");
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

  const kkmColumns = [
    { field: "ID", header: "ID", style: { width: "60px" } },
    { field: "KODE_KKM", header: "Kode KKM", style: { minWidth: "120px" } },
    {
      field: "NAMA_MAPEL",
      header: "Mata Pelajaran",
      style: { minWidth: "200px" },
      body: (row) => row.NAMA_MAPEL || row.KODE_MAPEL || "-",
    },
    // ✅ TAMBAH KOLOM TAHUN AJARAN
    {
      field: "NAMA_TAHUN_AJARAN",
      header: "Tahun Ajaran",
      style: { minWidth: "150px" },
      body: (row) => (
        <span className="font-medium text-blue-600">
          {row.NAMA_TAHUN_AJARAN || row.TAHUN_AJARAN_ID || "-"}
        </span>
      ),
    },
    {
      field: "KOMPLEKSITAS",
      header: "Kompleksitas",
      style: { minWidth: "120px", textAlign: "center" },
    },
    {
      field: "DAYA_DUKUNG",
      header: "Daya Dukung",
      style: { minWidth: "120px", textAlign: "center" },
    },
    {
      field: "INTAKE",
      header: "Intake",
      style: { minWidth: "100px", textAlign: "center" },
    },
    {
      field: "KKM",
      header: "Nilai KKM",
      style: { minWidth: "100px", textAlign: "center" },
    },
    {
      field: "STATUS",
      header: "Status",
      style: { minWidth: "100px" },
      body: (row) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            row.STATUS === "Aktif"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {row.STATUS}
        </span>
      ),
    },
    {
      header: "Aksi",
      body: (rowData) => (
        <div className="flex gap-2">
          <Button
            icon="pi pi-pencil"
            size="small"
            severity="warning"
            tooltip="Edit"
            tooltipOptions={{ position: "top" }}
            onClick={() => {
              setSelectedKKM(rowData);
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
      style: { width: "120px" },
    },
  ];

  return (
    <div className="card">
      <ToastNotifier ref={toastRef} />
      <ConfirmDialog />

      <h3 className="text-xl font-semibold mb-3">Master Kriteria Ketuntasan Minimal (KKM)</h3>

      {/* Filter & Toolbar */}
      <div className="flex flex-col md:flex-row justify-content-between md:items-center gap-4 mb-4">
        {/* Filter Section */}
        <div className="flex flex-wrap gap-2 items-end">
          <div className="flex flex-column gap-2">
            <label htmlFor="status-filter" className="text-sm font-medium">
              Status
            </label>
            <Dropdown
              id="status-filter"
              value={statusFilter}
              options={statusOptions}
              onChange={(e) => {
                setStatusFilter(e.value);
                applyFiltersWithValue(e.value, mapelFilter, tahunFilter); // <-- include tahunFilter
              }}
              placeholder="Pilih status"
              className="w-48"
              showClear
            />
          </div>

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
                applyFiltersWithValue(statusFilter, e.value, tahunFilter); // <-- include tahunFilter
              }}
              placeholder="Pilih mata pelajaran"
              className="w-52"
              showClear
            />
          </div>

          {/* ✅ TAMBAH DROPDOWN FILTER TAHUN AJARAN (setelah filter status/mapel) */}
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
                applyFiltersWithValue(statusFilter, mapelFilter, e.value);
              }}
              placeholder="Pilih tahun ajaran"
              className="w-52"
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
            tooltip="Cetak Laporan KKM"
            onClick={() => setAdjustDialog(true)}
            disabled={kkmList.length === 0 || isLoading}
          />

          <HeaderBar
            title=""
            placeholder="Cari KKM (Kode, Mapel, Keterangan)"
            onSearch={handleSearch}
            onAddClick={() => {
              setSelectedKKM(null);
              setDialogVisible(true);
            }}
          />
        </div>
      </div>

      {/* Tabel Data */}
      <CustomDataTable data={kkmList} loading={isLoading} columns={kkmColumns} />

      {/* Form KKM */}
      <FormKKM
        visible={dialogVisible}
        onHide={() => {
          setDialogVisible(false);
          setSelectedKKM(null);
        }}
        selectedKKM={selectedKKM}
        onSave={handleSubmit}
        token={token}
        kkmList={originalData}
      />

      {/* Dialog Print */}
      <AdjustPrintMarginLaporanKKM
        adjustDialog={adjustDialog}
        setAdjustDialog={setAdjustDialog}
        dataKKM={kkmList}
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
