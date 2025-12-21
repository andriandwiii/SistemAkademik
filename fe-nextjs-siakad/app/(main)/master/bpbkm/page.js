"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Tag } from "primereact/tag";
import { ConfirmDialog } from "primereact/confirmdialog";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { ProgressSpinner } from "primereact/progressspinner";
import dynamic from "next/dynamic";
import axios from "axios";

import CustomDataTable from "../../../components/DataTable";
import ToastNotifier from "../../../components/ToastNotifier";
import HeaderBar from "../../../components/headerbar";
import FormBK from "./components/FormBK";
import AdjustPrintMarginLaporan from "./print/AdjustPrintMarginLaporan";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Dynamic import PDFViewer
const PDFViewer = dynamic(() => import("./print/PDFViewer"), {
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <ProgressSpinner style={{ width: "50px", height: "50px" }} strokeWidth="4" />
    </div>
  ),
  ssr: false,
});

export default function MonitoringBKPage() {
  const toastRef = useRef(null);
  const isMounted = useRef(true);

  const [token, setToken] = useState("");
  const [userProfile, setUserProfile] = useState(null);
  const [dataAbsensi, setDataAbsensi] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Filter States
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedKelas, setSelectedKelas] = useState(null);
  const [kelasOptions, setKelasOptions] = useState([]);

  // Form State
  const [showFormBK, setShowFormBK] = useState(false);
  const [selectedAbsensi, setSelectedAbsensi] = useState(null);

  // Print States
  const [adjustDialog, setAdjustDialog] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [jsPdfPreviewOpen, setJsPdfPreviewOpen] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem("token");
    const profile = JSON.parse(localStorage.getItem("user") || "{}");
    
    if (!t) {
      window.location.href = "/";
    } else {
      setToken(t);
      setUserProfile(profile);
      fetchMasterKelas(t);
      fetchMonitoring(t, selectedDate, selectedKelas);
    }

    return () => {
      isMounted.current = false;
      toastRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch master kelas untuk dropdown filter
  const fetchMasterKelas = async (t) => {
    try {
      const res = await axios.get(`${API_URL}/master-kelas`, {
        headers: { Authorization: `Bearer ${t}` },
      });

      if (!isMounted.current) return;

      if (res.data.status === "00") {
        const data = res.data.data || [];
        const options = data.map((k) => ({
          label: k.KELAS_ID,
          value: k.KELAS_ID,
        }));
        setKelasOptions(options);
      }
    } catch (err) {
      console.error("Gagal memuat master kelas:", err);
    }
  };

  // Fetch data monitoring BK
  const fetchMonitoring = async (t, date, kelasId) => {
    if (!t || !date) return;

    setIsLoading(true);
    try {
      // Format tanggal ke YYYY-MM-DD
      const offset = date.getTimezoneOffset();
      const adjustedDate = new Date(date.getTime() - offset * 60 * 1000);
      const formattedDate = adjustedDate.toISOString().split("T")[0];

      const params = new URLSearchParams();
      params.append("tanggal", formattedDate);
      if (kelasId) params.append("kelasId", kelasId);

      const res = await axios.get(
        `${API_URL}/tu-absensi/monitoring?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${t}` },
        }
      );

      if (!isMounted.current) return;

      if (res.data.status === "00") {
        const rawData = res.data.data || [];
        
        // Filter hanya status yang perlu ditangani BK
        const filteredData = rawData.filter((item) =>
          ["ALPA", "IZIN", "SAKIT", "BOLOS"].includes(item.STATUS?.toUpperCase())
        );

        setDataAbsensi(filteredData);
        setOriginalData(filteredData);
      } else {
        toastRef.current?.showToast("01", res.data.message || "Gagal memuat data monitoring");
      }
    } catch (err) {
      console.error(err);
      toastRef.current?.showToast("01", "Gagal memuat data monitoring BK");
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  };

  // Handle perubahan filter
  const handleDateChange = (e) => {
    setSelectedDate(e.value);
    if (token) {
      fetchMonitoring(token, e.value, selectedKelas);
    }
  };

  const handleKelasChange = (e) => {
    setSelectedKelas(e.value);
    if (token) {
      fetchMonitoring(token, selectedDate, e.value);
    }
  };

  const handleRefresh = () => {
    if (token) {
      fetchMonitoring(token, selectedDate, selectedKelas);
    }
  };

  const resetFilter = () => {
    setSelectedDate(new Date());
    setSelectedKelas(null);
    if (token) {
      fetchMonitoring(token, new Date(), null);
    }
  };

  // Search handler
  const handleSearch = (keyword) => {
    if (!keyword) {
      setDataAbsensi(originalData);
    } else {
      const lowerKeyword = keyword.toLowerCase();
      const filtered = originalData.filter((item) =>
        (item.siswa?.NAMA || item.NAMA || "").toLowerCase().includes(lowerKeyword) ||
        (item.NIS || "").toLowerCase().includes(lowerKeyword) ||
        (item.KELAS_ID || "").toLowerCase().includes(lowerKeyword)
      );
      setDataAbsensi(filtered);
    }
  };

  // Handle save dari FormBK
  const handleSaveSuccess = () => {
    toastRef.current?.showToast("00", "Data BK berhasil disimpan");
    if (isMounted.current) {
      fetchMonitoring(token, selectedDate, selectedKelas);
      setShowFormBK(false);
      setSelectedAbsensi(null);
    }
  };

  const handleClosePdfPreview = () => {
    setJsPdfPreviewOpen(false);
    setTimeout(() => {
      setPdfUrl("");
    }, 300);
  };

  // Kolom tabel
  const columns = [
    {
      field: "TANGGAL",
      header: "Tanggal",
      style: { minWidth: "100px" },
      body: (row) => new Date(row.TANGGAL).toLocaleDateString("id-ID"),
    },
    {
      field: "NIS",
      header: "NIS",
      style: { minWidth: "100px" },
    },
    {
      field: "siswa.NAMA",
      header: "Nama Siswa",
      style: { minWidth: "180px" },
      body: (row) => (
        <span className="font-semibold">{row.siswa?.NAMA || row.NAMA || "-"}</span>
      ),
    },
    {
      field: "KELAS_ID",
      header: "Kelas",
      style: { minWidth: "80px" },
    },
    {
      field: "STATUS",
      header: "Status",
      style: { minWidth: "100px" },
      body: (row) => {
        const statusColors = {
          ALPA: "danger",
          IZIN: "info",
          SAKIT: "warning",
          BOLOS: "danger",
        };
        const severity = statusColors[row.STATUS?.toUpperCase()] || "secondary";
        return <Tag value={row.STATUS} severity={severity} />;
      },
    },
    {
      field: "CATATAN_BK",
      header: "Catatan BK",
      style: { minWidth: "250px" },
      body: (row) => (
        <div className="text-sm line-clamp-2">
          {row.CATATAN_BK || (
            <span className="text-gray-400 italic">Belum ada catatan...</span>
          )}
        </div>
      ),
    },
    {
      field: "SUDAH_DITANGGANI",
      header: "Status Proses",
      style: { minWidth: "120px" },
      body: (row) => {
        const isSelesai = row.SUDAH_DITANGGANI === 1;
        return (
          <Tag
            value={isSelesai ? "Selesai" : "Pending"}
            severity={isSelesai ? "success" : "danger"}
            rounded
          />
        );
      },
    },
    {
      header: "Aksi",
      body: (rowData) => (
        <div className="flex gap-2">
          <Button
            icon="pi pi-shield"
            size="small"
            severity="warning"
            tooltip="Tangani BK"
            tooltipOptions={{ position: "top" }}
            onClick={() => {
              setSelectedAbsensi(rowData);
              setShowFormBK(true);
            }}
          />
        </div>
      ),
      style: { width: "100px" },
    },
  ];

  return (
    <div className="card">
      <ToastNotifier ref={toastRef} />
      <ConfirmDialog />

      <h3 className="text-xl font-semibold mb-3">Monitoring BK</h3>

      {/* Filter & Toolbar */}
      <div className="flex flex-col md:flex-row justify-content-between md:items-center gap-4 mb-4">
        {/* Filter Section */}
        <div className="flex flex-wrap gap-2 items-end">
          <div className="flex flex-column gap-2">
            <label htmlFor="date-filter" className="text-sm font-medium">
              Tanggal
            </label>
            <Calendar
              id="date-filter"
              value={selectedDate}
              onChange={handleDateChange}
              dateFormat="yy-mm-dd"
              showIcon
              className="w-48"
            />
          </div>

          <div className="flex flex-column gap-2">
            <label htmlFor="kelas-filter" className="text-sm font-medium">
              Kelas
            </label>
            <Dropdown
              id="kelas-filter"
              value={selectedKelas}
              options={kelasOptions}
              onChange={handleKelasChange}
              placeholder="Pilih kelas"
              className="w-40"
              showClear
            />
          </div>

          <Button
            icon="pi pi-refresh"
            className="p-button-secondary mt-3"
            tooltip="Refresh Data"
            onClick={handleRefresh}
            loading={isLoading}
          />

          <Button
            icon="pi pi-filter-slash"
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
            tooltip="Cetak Laporan Monitoring BK"
            onClick={() => setAdjustDialog(true)}
            disabled={dataAbsensi.length === 0 || isLoading}
          />

          <HeaderBar
            title=""
            placeholder="Cari siswa (Nama, NIS, Kelas)"
            onSearch={handleSearch}
            hideAddButton={true}
          />
        </div>
      </div>

      {/* Info Badge */}
      {dataAbsensi.length > 0 && (
        <div className="mb-3">
          <Tag
            severity="info"
            value={`${dataAbsensi.length} siswa memerlukan penanganan BK`}
          />
        </div>
      )}

      {/* Tabel Data */}
      <CustomDataTable
        data={dataAbsensi}
        loading={isLoading}
        columns={columns}
        paginator
        rows={10}
        stripedRows
      />

      {/* Form BK */}
      {showFormBK && (
        <FormBK
          visible={showFormBK}
          onHide={() => {
            setShowFormBK(false);
            setSelectedAbsensi(null);
          }}
          editData={selectedAbsensi}
          token={token}
          userProfile={userProfile}
          onSaveSuccess={handleSaveSuccess}
        />
      )}

      {/* Dialog Print */}
      <AdjustPrintMarginLaporan
        adjustDialog={adjustDialog}
        setAdjustDialog={setAdjustDialog}
        dataMonitoring={dataAbsensi}
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