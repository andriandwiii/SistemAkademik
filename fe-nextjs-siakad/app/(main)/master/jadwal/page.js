"use client";

import axios from "axios";
import { useEffect, useState, useRef, useCallback } from "react";
import { Button } from "primereact/button";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Dropdown } from "primereact/dropdown";
import { Dialog } from "primereact/dialog";
import { ProgressSpinner } from "primereact/progressspinner";
import ToastNotifier from "../../../components/ToastNotifier";
import HeaderBar from "../../../components/headerbar";
import CustomDataTable from "../../../components/DataTable";
import FormJadwal from "./components/FormJadwal";
import DialogSiswaKelas from "./components/DialogSiswaKelas";
import AdjustPrintMarginAbsensi from "./print/AdjustPrintMarginAbsensi";
import AdjustPrintMarginJadwal from "./print/AdjustPrintMarginJadwal";
import dynamic from "next/dynamic";

const PDFViewer = dynamic(() => import("./print/PDFViewer"), {
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <ProgressSpinner style={{ width: "50px", height: "50px" }} strokeWidth="4" />
    </div>
  ),
  ssr: false,
});

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const URUTAN_HARI = { "Senin": 1, "Selasa": 2, "Rabu": 3, "Kamis": 4, "Jumat": 5, "Sabtu": 6, "Minggu": 7 };

const getTingkatScore = (txt) => {
  if (!txt) return 99;
  const t = txt.toUpperCase();
  if (t.startsWith("XII")) return 3;
  if (t.startsWith("XI")) return 2;
  if (t.startsWith("X")) return 1;
  return 9;
};

export default function JadwalPage() {
  const toastRef = useRef(null);
  const isMounted = useRef(true);

  // State Utama
  const [token, setToken] = useState("");
  const [jadwal, setJadwal] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedJadwal, setSelectedJadwal] = useState(null);
  const [dialogVisible, setDialogVisible] = useState(false);

  // State Kurikulum
  const [namaKurikulum, setNamaKurikulum] = useState("");
  const [nipKurikulum, setNipKurikulum] = useState("");

  // Dialog Siswa
  const [siswaDialogVisible, setSiswaDialogVisible] = useState(false);
  const [selectedJadwalForSiswa, setSelectedJadwalForSiswa] = useState(null);

  // Print Dialog
  const [adjustDialog, setAdjustDialog] = useState(false);
  const [selectedJadwalForPrint, setSelectedJadwalForPrint] = useState(null);
  const [adjustJadwalDialog, setAdjustJadwalDialog] = useState(false);

  // PDF Preview
  const [pdfUrl, setPdfUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [jsPdfPreviewOpen, setJsPdfPreviewOpen] = useState(false);

  // Filter State
  const [hariFilter, setHariFilter] = useState(null);
  const [tingkatanFilter, setTingkatanFilter] = useState(null);
  const [kelasFilter, setKelasFilter] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");

  // Filter Options
  const [hariOptions, setHariOptions] = useState([]);
  const [tingkatanOptions, setTingkatanOptions] = useState([]);
  const [kelasOptions, setKelasOptions] = useState([]);

  // Sorting function
  const sortDataOtomatis = useCallback((data) => {
    return [...data].sort((a, b) => {
      const hA = a.hari?.HARI || a.HARI || "";
      const hB = b.hari?.HARI || b.HARI || "";
      if ((URUTAN_HARI[hA] || 99) !== (URUTAN_HARI[hB] || 99)) 
        return (URUTAN_HARI[hA] || 99) - (URUTAN_HARI[hB] || 99);

      const kA = a.kelas?.KELAS_ID || a.KELAS_ID || "";
      const kB = b.kelas?.KELAS_ID || b.KELAS_ID || "";
      const sA = getTingkatScore(kA), sB = getTingkatScore(kB);
      if (sA !== sB) return sA - sB;

      const compK = kA.localeCompare(kB, undefined, { numeric: true });
      if (compK !== 0) return compK;

      const jpA = parseInt(a.jam_pelajaran?.JP_KE || a.KODE_JP || 0);
      const jpB = parseInt(b.jam_pelajaran?.JP_KE || b.KODE_JP || 0);
      return jpA - jpB;
    });
  }, []);

  // Fetch Data Kurikulum
  const fetchDataKurikulum = async (t) => {
    try {
      const res = await axios.get(`${API_URL}/users/kurikulum`, {
        headers: { Authorization: `Bearer ${t}` },
      });

      if (!isMounted.current) return;

      if (res.data.status === "00" && res.data.data) {
        setNamaKurikulum(res.data.data.name || "");
        setNipKurikulum(res.data.data.nip || "");
      }
    } catch (err) {
      console.error("Gagal memuat data kurikulum:", err);
    }
  };

  // Fetch Jadwal
  const fetchJadwal = async (t) => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/jadwal`, {
        headers: { Authorization: `Bearer ${t}` },
      });

      if (!isMounted.current) return;

      if (res.data.status === "00") {
        const raw = res.data.data || [];
        setOriginalData(raw);
        setJadwal(sortDataOtomatis(raw));

        // Build filter options
        const hSet = new Set(), tSet = new Set(), kSet = new Set();
        raw.forEach((d) => {
          if (d.hari?.HARI) hSet.add(d.hari.HARI);
          if (d.tingkatan?.TINGKATAN) tSet.add(d.tingkatan.TINGKATAN);
          if (d.kelas?.KELAS_ID) kSet.add(d.kelas.KELAS_ID);
        });

        setHariOptions(
          Array.from(hSet)
            .sort((a, b) => (URUTAN_HARI[a] || 99) - (URUTAN_HARI[b] || 99))
            .map((v) => ({ label: v, value: v }))
        );
        setTingkatanOptions(
          Array.from(tSet)
            .sort()
            .map((v) => ({ label: v, value: v }))
        );
        setKelasOptions(
          Array.from(kSet)
            .sort((a, b) => {
              const s1 = getTingkatScore(a), s2 = getTingkatScore(b);
              return s1 !== s2 ? s1 - s2 : a.localeCompare(b, undefined, { numeric: true });
            })
            .map((v) => ({ label: v, value: v }))
        );
      }
    } catch (err) {
      console.error(err);
      toastRef.current?.showToast("01", "Gagal memuat data jadwal");
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  };

  // Apply Filters
  const applyFilters = useCallback((hari, tingkatan, kelas, keyword = "") => {
    let filtered = [...originalData];

    if (hari) filtered = filtered.filter((x) => (x.hari?.HARI || x.HARI) === hari);
    if (tingkatan) filtered = filtered.filter((x) => (x.tingkatan?.TINGKATAN || x.TINGKATAN_ID) === tingkatan);
    if (kelas) filtered = filtered.filter((x) => (x.kelas?.KELAS_ID || x.KELAS_ID) === kelas);

    if (keyword) {
      const low = keyword.toLowerCase();
      filtered = filtered.filter(
        (x) =>
          (x.guru?.NAMA_GURU || "").toLowerCase().includes(low) ||
          (x.kelas?.KELAS_ID || "").toLowerCase().includes(low) ||
          (x.mata_pelajaran?.NAMA_MAPEL || "").toLowerCase().includes(low) ||
          (x.KODE_JADWAL || "").toLowerCase().includes(low)
      );
    }

    setJadwal(sortDataOtomatis(filtered));
  }, [originalData, sortDataOtomatis]);

  // Reset Filter
  const resetFilter = () => {
    setHariFilter(null);
    setTingkatanFilter(null);
    setKelasFilter(null);
    setSearchKeyword("");
    setJadwal(sortDataOtomatis(originalData));
  };

  // Handle Search
  const handleSearch = (keyword) => {
    setSearchKeyword(keyword);
    applyFilters(hariFilter, tingkatanFilter, kelasFilter, keyword);
  };

  // Handle Submit Form
  const handleSubmit = async (data) => {
    // Validasi Bentrok Guru
    const bentrokGuru = originalData.find(
      (j) =>
        (j.hari?.HARI || j.HARI) === data.HARI &&
        (j.jam_pelajaran?.KODE_JP || j.KODE_JP) === data.KODE_JP &&
        (j.guru?.NIP || j.NIP) === data.NIP &&
        j.ID !== selectedJadwal?.ID
    );
    if (bentrokGuru) {
      toastRef.current?.showToast(
        "01",
        `Validasi Gagal: Guru sudah mengajar di kelas ${bentrokGuru.kelas?.KELAS_ID} pada jam ini.`
      );
      return;
    }

    // Validasi Bentrok Kelas
    const bentrokKelas = originalData.find(
      (j) =>
        (j.hari?.HARI || j.HARI) === data.HARI &&
        (j.jam_pelajaran?.KODE_JP || j.KODE_JP) === data.KODE_JP &&
        (j.kelas?.KELAS_ID || j.KELAS_ID) === data.KELAS_ID &&
        j.ID !== selectedJadwal?.ID
    );
    if (bentrokKelas) {
      toastRef.current?.showToast("01", `Validasi Gagal: Kelas ini sudah terisi jadwal lain pada jam ini.`);
      return;
    }

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = selectedJadwal
        ? await axios.put(`${API_URL}/jadwal/${selectedJadwal.ID}`, data, config)
        : await axios.post(`${API_URL}/jadwal`, data, config);

      if (res.data.status === "00") {
        toastRef.current?.showToast("00", selectedJadwal ? "Jadwal berhasil diperbarui" : "Jadwal berhasil ditambahkan");
        setDialogVisible(false);
        setSelectedJadwal(null);
        fetchJadwal(token);
      }
    } catch (err) {
      toastRef.current?.showToast("01", err.response?.data?.message || "Gagal menyimpan jadwal");
    }
  };

  // Handle Delete
  const handleDelete = (rowData) => {
    confirmDialog({
      message: `Apakah Anda yakin ingin menghapus jadwal "${rowData.KODE_JADWAL}"?`,
      header: "Konfirmasi Hapus",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Ya",
      rejectLabel: "Batal",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await axios.delete(`${API_URL}/jadwal/${rowData.ID}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          toastRef.current?.showToast("00", "Jadwal berhasil dihapus");
          fetchJadwal(token);
        } catch (err) {
          toastRef.current?.showToast("01", "Gagal menghapus jadwal");
        }
      },
    });
  };

  // Handle Close PDF Preview
  const handleClosePdfPreview = () => {
    setJsPdfPreviewOpen(false);
    setTimeout(() => setPdfUrl(""), 300);
  };

  // Initial Load
  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) {
      window.location.href = "/";
    } else {
      setToken(t);
      fetchJadwal(t);
      fetchDataKurikulum(t);
    }

    return () => {
      isMounted.current = false;
    };
  }, []);

  // Columns Definition
  const jadwalColumns = [
    { field: "KODE_JADWAL", header: "Kode", style: { minWidth: "100px" } },
    { field: "HARI", header: "Hari", body: (r) => r.hari?.HARI || r.HARI },
    { field: "KELAS_ID", header: "Kelas", body: (r) => r.kelas?.KELAS_ID || r.KELAS_ID },
    { field: "GURU", header: "Guru", body: (r) => r.guru?.NAMA_GURU || r.NIP, style: { minWidth: "180px" } },
    { field: "MAPEL", header: "Mata Pelajaran", body: (r) => r.mata_pelajaran?.NAMA_MAPEL, style: { minWidth: "150px" } },
    {
      header: "Jam & Waktu",
      style: { minWidth: "160px" },
      body: (r) => (
        <div className="flex flex-column">
          <span className="font-bold">Ke-{r.jam_pelajaran?.JP_KE || r.KODE_JP}</span>
          {r.jam_pelajaran?.WAKTU_MULAI && (
            <small className="text-gray-500 italic">
              ({r.jam_pelajaran.WAKTU_MULAI.substring(0, 5)} - {r.jam_pelajaran.WAKTU_SELESAI.substring(0, 5)})
            </small>
          )}
        </div>
      ),
    },
    {
      header: "Aksi",
      body: (r) => (
        <div className="flex gap-1">
          <Button
            icon="pi pi-print"
            size="small"
            severity="success"
            tooltip="Cetak Absensi"
            tooltipOptions={{ position: "top" }}
            onClick={() => {
              setSelectedJadwalForPrint(r);
              setAdjustDialog(true);
            }}
          />
          <Button
            icon="pi pi-users"
            size="small"
            severity="info"
            tooltip="Daftar Siswa"
            tooltipOptions={{ position: "top" }}
            onClick={() => {
              setSelectedJadwalForSiswa(r);
              setSiswaDialogVisible(true);
            }}
          />
          <Button
            icon="pi pi-pencil"
            size="small"
            severity="warning"
            tooltip="Edit"
            tooltipOptions={{ position: "top" }}
            onClick={() => {
              setSelectedJadwal(r);
              setDialogVisible(true);
            }}
          />
          <Button
            icon="pi pi-trash"
            size="small"
            severity="danger"
            tooltip="Hapus"
            tooltipOptions={{ position: "top" }}
            onClick={() => handleDelete(r)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="card">
      <ToastNotifier ref={toastRef} />
      <ConfirmDialog />

      <h3 className="text-xl font-semibold mb-4">Master Jadwal Pelajaran</h3>

      {/* Filter & Toolbar */}
      <div className="flex flex-column md:flex-row justify-content-between gap-4 mb-4">
        {/* Filter Section */}
        <div className="flex flex-wrap gap-2 items-end">
          <div className="flex flex-column gap-2">
            <label htmlFor="hari-filter" className="text-sm font-medium">
              Hari
            </label>
            <Dropdown
              id="hari-filter"
              value={hariFilter}
              options={hariOptions}
              onChange={(e) => {
                setHariFilter(e.value);
                applyFilters(e.value, tingkatanFilter, kelasFilter, searchKeyword);
              }}
              placeholder="Pilih hari"
              className="w-40"
              showClear
            />
          </div>

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
                applyFilters(hariFilter, e.value, kelasFilter, searchKeyword);
              }}
              placeholder="Pilih tingkatan"
              className="w-40"
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
                applyFilters(hariFilter, tingkatanFilter, e.value, searchKeyword);
              }}
              placeholder="Pilih kelas"
              className="w-48"
              showClear
            />
          </div>

          <Button
            icon="pi pi-refresh"
            severity="secondary"
            tooltip="Reset Filter"
            tooltipOptions={{ position: "top" }}
            onClick={resetFilter}
            className="mt-3"
          />
        </div>

        {/* Action Section */}
        <div className="flex items-center gap-2">
          <Button
            icon="pi pi-print"
            severity="warning"
            tooltip="Cetak Laporan Jadwal"
            tooltipOptions={{ position: "top" }}
            onClick={() => setAdjustJadwalDialog(true)}
            disabled={jadwal.length === 0 || isLoading}
            className="mt-3"
          />

          <HeaderBar
            placeholder="Cari jadwal (Guru, Kelas, Mapel)"
            onSearch={handleSearch}
            onAddClick={() => {
              setSelectedJadwal(null);
              setDialogVisible(true);
            }}
          />
        </div>
      </div>

      {/* Tabel Data */}
      <CustomDataTable data={jadwal} loading={isLoading} columns={jadwalColumns} />

      {/* Form Jadwal */}
      <FormJadwal
        visible={dialogVisible}
        onHide={() => {
          setDialogVisible(false);
          setSelectedJadwal(null);
        }}
        selectedJadwal={selectedJadwal}
        onSave={handleSubmit}
        token={token}
      />

      {/* Dialog Siswa Kelas */}
      <DialogSiswaKelas
        visible={siswaDialogVisible}
        onHide={() => {
          setSiswaDialogVisible(false);
          setSelectedJadwalForSiswa(null);
        }}
        jadwalData={selectedJadwalForSiswa}
        token={token}
      />

      {/* Dialog Print Absensi */}
      <AdjustPrintMarginAbsensi
        adjustDialog={adjustDialog}
        setAdjustDialog={setAdjustDialog}
        jadwalData={selectedJadwalForPrint}
        token={token}
        setPdfUrl={setPdfUrl}
        setFileName={setFileName}
        setJsPdfPreviewOpen={setJsPdfPreviewOpen}
      />

      {/* Dialog Print Jadwal */}
      <AdjustPrintMarginJadwal
        adjustDialog={adjustJadwalDialog}
        setAdjustDialog={setAdjustJadwalDialog}
        jadwalToPrint={jadwal}
        setPdfUrl={setPdfUrl}
        setFileName={setFileName}
        setJsPdfPreviewOpen={setJsPdfPreviewOpen}
        namaKurikulum={namaKurikulum}
        nipKurikulum={nipKurikulum}
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
        {pdfUrl && <PDFViewer pdfUrl={pdfUrl} fileName={fileName} />}
      </Dialog>
    </div>
  );
}