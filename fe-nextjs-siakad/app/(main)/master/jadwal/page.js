"use client";

import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { Button } from "primereact/button";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Dropdown } from "primereact/dropdown";
import { Dialog } from "primereact/dialog";
import ToastNotifier from "../../../components/ToastNotifier";
import HeaderBar from "../../../components/headerbar";
import CustomDataTable from "../../../components/DataTable";
import FormJadwal from "./components/FormJadwal";
import DialogSiswaKelas from "./components/DialogSiswaKelas";
import AdjustPrintMarginAbsensi from "./print/AdjustPrintMarginAbsensi";
import AdjustPrintMarginJadwal from "./print/AdjustPrintMarginJadwal";
import dynamic from "next/dynamic";

const PDFViewer = dynamic(() => import("./print/PDFViewer"), { ssr: false });

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function JadwalPage() {
  const toastRef = useRef(null);
  const isMounted = useRef(true);

  const [token, setToken] = useState("");
  const [jadwal, setJadwal] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedJadwal, setSelectedJadwal] = useState(null);
  const [dialogVisible, setDialogVisible] = useState(false);

  // --- State untuk menyimpan data Waka Kurikulum ---
  const [namaKurikulum, setNamaKurikulum] = useState("");
  const [nipKurikulum, setNipKurikulum] = useState("");
  // --- BATAS TAMBAHAN STATE ---

  // Dialog Siswa
  const [siswaDialogVisible, setSiswaDialogVisible] = useState(false);
  const [selectedJadwalForSiswa, setSelectedJadwalForSiswa] = useState(null);

  // Print Absensi (Per Jadwal)
  const [adjustDialog, setAdjustDialog] = useState(false);
  const [selectedJadwalForPrint, setSelectedJadwalForPrint] = useState(null);

  // Dialog Print Semua Jadwal
  const [adjustJadwalDialog, setAdjustJadwalDialog] = useState(false);

  // State PDF Preview (Digunakan bersama)
  const [pdfUrl, setPdfUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [jsPdfPreviewOpen, setJsPdfPreviewOpen] = useState(false);

  // Filter
  const [hariFilter, setHariFilter] = useState(null);
  const [tingkatanFilter, setTingkatanFilter] = useState(null);
  const [jurusanFilter, setJurusanFilter] = useState(null);
  const [kelasFilter, setKelasFilter] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");

  const [hariOptions, setHariOptions] = useState([]);
  const [tingkatanOptions, setTingkatanOptions] = useState([]);
  const [jurusanOptions, setJurusanOptions] = useState([]);
  const [kelasOptions, setKelasOptions] = useState([]);

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) {
      window.location.href = "/";
    } else {
      setToken(t);
      fetchJadwal(t);
      // --- PANGGILAN FUNGSI ---
      fetchDataKurikulum(t);
      // --- BATAS PANGGILAN FUNGSI ---
    }

    return () => {
      isMounted.current = false;
      toastRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- FUNGSI BARU ---
  /**
   * Mengambil data user yang memiliki role KURIKULUM
   * untuk digunakan pada TTD di cetak laporan.
   */
  const fetchDataKurikulum = async (t) => {
    try {
      // PENTING: Ganti 'users/kurikulum' dengan endpoint API Anda
      // yang benar untuk mengambil user dengan role 'KURIKULUM'
      const res = await axios.get(`${API_URL}/users/kurikulum`, {
        headers: { Authorization: `Bearer ${t}` },
      });

      if (!isMounted.current) return;

      if (res.data.status === "00" && res.data.data) {
        // Asumsi data yang dikembalikan adalah objek user: { name: "...", nip: "..." }
        setNamaKurikulum(res.data.data.name || "Nama Kurikulum Tidak Ditemukan");
        
        // Sesuaikan 'nip' dengan nama kolom di tabel 'users' Anda
        // Jika tidak ada NIP di tabel users, ganti res.data.data.nip menjadi ""
        setNipKurikulum(res.data.data.nip || ""); 
      } else {
        setNamaKurikulum("Nama Kurikulum (error)");
      }
    } catch (err) {
      console.error("Gagal memuat data kurikulum:", err);
      if (isMounted.current) {
        setNamaKurikulum("Nama Kurikulum (gagal)");
      }
    }
  };
  // --- BATAS FUNGSI BARU ---

  const fetchJadwal = async (t) => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/jadwal`, {
        headers: { Authorization: `Bearer ${t}` },
      });

      if (!isMounted.current) return;

      if (res.data.status === "00") {
        const data = res.data.data || [];
        data.sort((a, b) => a.ID - b.ID);

        // Build filter options
        const hariSet = new Set();
        const tingkatanSet = new Set();
        const jurusanSet = new Set();
        const kelasSet = new Set();

        data.forEach((j) => {
          if (j.hari?.HARI) hariSet.add(j.hari.HARI);
          if (j.tingkatan?.TINGKATAN) tingkatanSet.add(j.tingkatan.TINGKATAN);
          if (j.jurusan?.NAMA_JURUSAN) jurusanSet.add(j.jurusan.NAMA_JURUSAN);
          if (j.kelas?.KELAS_ID) kelasSet.add(j.kelas.KELAS_ID);
        });

        setOriginalData(data);
        setHariOptions(Array.from(hariSet).map((h) => ({ label: h, value: h })));
        setTingkatanOptions(Array.from(tingkatanSet).map((t) => ({ label: t, value: t })));
        setJurusanOptions(Array.from(jurusanSet).map((j) => ({ label: j, value: j })));
        setKelasOptions(Array.from(kelasSet).map((k) => ({ label: k, value: k })));
      } else {
        toastRef.current?.showToast("01", res.data.message || "Gagal memuat data jadwal");
      }
    } catch (err) {
      console.error(err);
      toastRef.current?.showToast("01", "Gagal memuat data jadwal");
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  };

  // EFEK TERPUSAT UNTUK FILTER DAN SEARCH
  useEffect(() => {
    let filtered = [...originalData];

    // 1. Terapkan Filter Dropdown
    if (hariFilter) {
      filtered = filtered.filter((j) => j.hari?.HARI === hariFilter);
    }
    if (tingkatanFilter) {
      filtered = filtered.filter((j) => j.tingkatan?.TINGKATAN === tingkatanFilter);
    }
    if (jurusanFilter) {
      filtered = filtered.filter((j) => j.jurusan?.NAMA_JURUSAN === jurusanFilter);
    }
    if (kelasFilter) {
      filtered = filtered.filter((j) => j.kelas?.KELAS_ID === kelasFilter);
    }

    // 2. Terapkan Filter Pencarian
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(
        (j) =>
          j.guru?.NAMA_GURU?.toLowerCase().includes(keyword) ||
          j.guru?.NIP?.toLowerCase().includes(keyword) ||
          j.mata_pelajaran?.NAMA_MAPEL?.toLowerCase().includes(keyword) ||
          j.KODE_JADWAL?.toLowerCase().includes(keyword)
      );
    }

    // 3. Set state jadwal yang akan ditampilkan
    setJadwal(filtered);
  }, [originalData, hariFilter, tingkatanFilter, jurusanFilter, kelasFilter, searchKeyword]);

  // Search handler
  const handleSearch = (keyword) => {
    setSearchKeyword(keyword);
  };

  // Reset all filters
  const resetFilter = () => {
    setHariFilter(null);
    setTingkatanFilter(null);
    setJurusanFilter(null);
    setKelasFilter(null);
    setSearchKeyword("");
    
    // Jika HeaderBar Anda memerlukan 'value' prop untuk di-reset
    // Anda bisa meneruskan searchKeyword sebagai prop 'value' atau 'searchValue'
  };

  const handleSubmit = async (data) => {
    
    // --- VVVV TAMBAHKAN BLOK VALIDASI INI VVVV ---
    // 'data' diasumsikan berisi: { HARI, KODE_JP, NIP, KELAS_ID, ... }
    
    // 1. Cek Bentrok Guru
    // Cari jadwal lain (bukan jadwal yang sedang diedit)
    // yang memiliki guru, hari, dan jam yang sama.
    const bentrokGuru = originalData.find(j => 
        j.hari?.HARI === data.HARI &&
        j.jam_pelajaran?.KODE_JP === data.KODE_JP &&
        j.guru?.NIP === data.NIP &&
        j.ID !== selectedJadwal?.ID // Abaikan diri sendiri saat edit
    );

    if (bentrokGuru) {
        toastRef.current?.showToast("01", `Validasi Gagal: Guru (${bentrokGuru.guru?.NAMA_GURU}) sudah mengajar di kelas ${bentrokGuru.kelas?.KELAS_ID} pada hari dan jam yang sama.`);
        return; // Hentikan fungsi
    }

    // 2. Cek Bentrok Kelas
    // Cari jadwal lain (bukan jadwal yang sedang diedit)
    // yang memiliki kelas, hari, dan jam yang sama.
    const bentrokKelas = originalData.find(j => 
        j.hari?.HARI === data.HARI &&
        j.jam_pelajaran?.KODE_JP === data.KODE_JP &&
        j.kelas?.KELAS_ID === data.KELAS_ID &&
        j.ID !== selectedJadwal?.ID // Abaikan diri sendiri saat edit
    );

    if (bentrokKelas) {
        toastRef.current?.showToast("01", `Validasi Gagal: Kelas ${bentrokKelas.kelas?.KELAS_ID} sudah ada jadwal (${bentrokKelas.mata_pelajaran?.NAMA_MAPEL}) pada hari dan jam yang sama.`);
        return; // Hentikan fungsi
    }
    // --- ^^^^ BATAS BLOK VALIDASI ^^^^ ---

    // Jika lolos, lanjutkan ke try...catch
    try {
      if (selectedJadwal) {
        const res = await axios.put(`${API_URL}/jadwal/${selectedJadwal.ID}`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.status === "00") {
          toastRef.current?.showToast("00", "Jadwal berhasil diperbarui");
        } else {
          toastRef.current?.showToast("01", res.data.message || "Gagal memperbarui jadwal");
          return;
        }
      } else {
        const res = await axios.post(`${API_URL}/jadwal`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.status === "00") {
          toastRef.current?.showToast("00", "Jadwal berhasil ditambahkan");
        } else {
          toastRef.current?.showToast("01", res.data.message || "Gagal menambahkan jadwal");
          return;
        }
      }

      if (isMounted.current) {
        await fetchJadwal(token);
        setDialogVisible(false);
        setSelectedJadwal(null);
      }
    } catch (err) {
      console.error(err);
      // Tangkap juga error validasi dari backend (status 400)
      if (err.response?.status === 400) {
        toastRef.current?.showToast("01", err.response.data.message || "Validasi dari server gagal.");
      } else {
        toastRef.current?.showToast("01", err.response?.data?.message || "Gagal menyimpan jadwal");
      }
    }
  };

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
          if (isMounted.current) {
            await fetchJadwal(token);
          }
        } catch (err) {
          console.error(err);
          toastRef.current?.showToast("01", "Gagal menghapus jadwal");
        }
      },
    });
  };

  const handleViewSiswa = (rowData) => {
    setSelectedJadwalForSiswa(rowData);
    setSiswaDialogVisible(true);
  };

  const handlePrintAbsensi = (rowData) => {
    setSelectedJadwalForPrint(rowData);
    setAdjustDialog(true);
  };

  const jadwalColumns = [
    { field: "ID", header: "ID", style: { width: "60px" } },
    { field: "KODE_JADWAL", header: "Kode Jadwal", style: { minWidth: "120px" } },
    {
      field: "hari.HARI",
      header: "Hari",
      style: { minWidth: "100px" },
      body: (row) => row.hari?.HARI || "-",
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
      header: "Kelas",
      style: { minWidth: "100px" },
      body: (row) => row.kelas?.KELAS_ID || "-",
    },
    {
      field: "guru.NAMA_GURU",
      header: "Guru",
      style: { minWidth: "180px" },
      body: (row) => row.guru?.NAMA_GURU || "-",
    },
    {
      field: "mata_pelajaran.NAMA_MAPEL",
      header: "Mata Pelajaran",
      style: { minWidth: "150px" },
      body: (row) => row.mata_pelajaran?.NAMA_MAPEL || "-",
    },
    {
      field: "jam_pelajaran.JP_KE",
      header: "Jam Ke",
      style: { minWidth: "80px", textAlign: "center" },
      body: (row) => row.jam_pelajaran?.JP_KE || "-",
    },
    {
      field: "jam_pelajaran",
      header: "Waktu",
      style: { minWidth: "140px" },
      body: (row) =>
        row.jam_pelajaran?.WAKTU_MULAI && row.jam_pelajaran?.WAKTU_SELESAI
          ? `${row.jam_pelajaran.WAKTU_MULAI} - ${row.jam_pelajaran.WAKTU_SELESAI}`
          : "-",
    },
    {
      header: "Aksi",
      body: (rowData) => (
        <div className="flex gap-2">
          <Button
            icon="pi pi-print"
            size="small"
            severity="success"
            tooltip="Print Daftar Hadir"
            tooltipOptions={{ position: "top" }}
            onClick={() => handlePrintAbsensi(rowData)}
          />
          <Button
            icon="pi pi-users"
            size="small"
            severity="info"
            tooltip="Lihat Siswa"
            tooltipOptions={{ position: "top" }}
            onClick={() => handleViewSiswa(rowData)}
          />
          <Button
            icon="pi pi-pencil"
            size="small"
            severity="warning"
            tooltip="Edit"
            tooltipOptions={{ position: "top" }}
            onClick={() => {
              setSelectedJadwal(rowData);
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
      style: { width: "200px" },
    },
  ];

  return (
    <div className="card p-6 bg-white rounded-lg shadow-sm">
      <ToastNotifier ref={toastRef} />
      <ConfirmDialog />

      {/* 1. HEADER UTAMA (HANYA JUDUL) */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <h3 className="text-2xl font-semibold">Master Jadwal Pelajaran</h3>
      </div>

      {/* 2. FILTER & TOOLBAR (SEMUA KONTROL DI SINI) */}
      <div className="bg-gray-50 p-4 rounded-md mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          
          {/* Filter Hari */}
          <div style={{ minWidth: "140px" }}>
            <label htmlFor="hari-filter" className="text-sm font-medium block mb-1">
              Hari
            </label>
            <Dropdown
              id="hari-filter"
              value={hariFilter}
              options={hariOptions}
              onChange={(e) => setHariFilter(e.value)}
              placeholder="Pilih hari"
              className="w-full"
              showClear
            />
          </div>

          {/* Filter Tingkatan */}
          <div style={{ minWidth: "140px" }}>
            <label htmlFor="tingkatan-filter" className="text-sm font-medium block mb-1">
              Tingkatan
            </label>
            <Dropdown
              id="tingkatan-filter"
              value={tingkatanFilter}
              options={tingkatanOptions}
              onChange={(e) => setTingkatanFilter(e.value)}
              placeholder="Pilih tingkatan"
              className="w-full"
              showClear
            />
          </div>

          {/* Filter Jurusan */}
          <div style={{ minWidth: "140px" }}>
            <label htmlFor="jurusan-filter" className="text-sm font-medium block mb-1">
              Jurusan
            </label>
            <Dropdown
              id="jurusan-filter"
              value={jurusanFilter}
              options={jurusanOptions}
              onChange={(e) => setJurusanFilter(e.value)}
              placeholder="Pilih jurusan"
              className="w-full"
              showClear
            />
          </div>

          {/* Filter Kelas */}
          <div style={{ minWidth: "140px" }}>
            <label htmlFor="kelas-filter" className="text-sm font-medium block mb-1">
              Kelas
            </label>
            <Dropdown
              id="kelas-filter"
              value={kelasFilter}
              options={kelasOptions}
              onChange={(e) => setKelasFilter(e.value)}
              placeholder="Pilih kelas"
              className="w-full"
              showClear
            />
          </div>

          {/* Search Bar - Pindah ke kanan */}
          {/* 'md:ml-auto' mendorong sisa item ke kanan di layar medium+ */}
          <div className="flex-grow md:ml-auto" style={{ minWidth: "250px" }}>
            <label className="text-sm font-medium block mb-1">
              Cari (Kode, Guru, Mapel)
            </label>
            <HeaderBar
              placeholder="Ketik untuk mencari..."
              onSearch={handleSearch}
              // Jika HeaderBar Anda memerlukan value untuk reset:
              // searchValue={searchKeyword} 
            />
          </div>

          {/* Grup Tombol Aksi (Reset, Print, Add) */}
          <div className="flex gap-2">
            <Button 
              icon="pi pi-refresh" 
              severity="secondary" 
              tooltip="Reset Filter" 
              tooltipOptions={{ position: "top" }}
              onClick={resetFilter} 
            />
            <Button
              icon="pi pi-print"
              severity="info"
              tooltip="Cetak Laporan Jadwal"
              tooltipOptions={{ position: "top" }}
              onClick={() => setAdjustJadwalDialog(true)}
              disabled={jadwal.length === 0 || isLoading}
            />
            <Button
              icon="pi pi-plus"
              severity="primary"
              tooltip="Tambah Jadwal"
              tooltipOptions={{ position: "top" }}
              onClick={() => {
                setSelectedJadwal(null);
                setDialogVisible(true);
              }}
            />
          </div>

        </div>
      </div>

      {/* Tabel Data */}
      <div className="overflow-auto rounded-md border border-gray-200">
        <CustomDataTable data={jadwal} loading={isLoading} columns={jadwalColumns} />
      </div>

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
        jadwalList={originalData}
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

      {/* Dialog Print Pengaturan Absensi (per jadwal) */}
      <AdjustPrintMarginAbsensi
        adjustDialog={adjustDialog}
        setAdjustDialog={setAdjustDialog}
        jadwalData={selectedJadwalForPrint}
        token={token}
        setPdfUrl={setPdfUrl}
        setFileName={setFileName}
        setJsPdfPreviewOpen={setJsPdfPreviewOpen}
      />

      {/* Dialog Print Jadwal (Semua) */}
      <AdjustPrintMarginJadwal
        adjustDialog={adjustJadwalDialog}
        setAdjustDialog={setAdjustJadwalDialog}
        jadwalToPrint={jadwal}
        setPdfUrl={setPdfUrl}
        setFileName={setFileName}
        setJsPdfPreviewOpen={setJsPdfPreviewOpen}
        // --- PROPS UNTUK DIKIRIM ---
        namaKurikulum={namaKurikulum}
        nipKurikulum={nipKurikulum}
        // --- BATAS TAMBAHAN PROPS ---
      />

      {/* Dialog PDF Preview (Digunakan oleh kedua fungsi print) */}
      <Dialog visible={jsPdfPreviewOpen} onHide={() => setJsPdfPreviewOpen(false)} modal style={{ width: "90vw", height: "90vh" }} header={`Preview - ${fileName}`}>
        <PDFViewer pdfUrl={pdfUrl} fileName={fileName} paperSize="A4" />
      </Dialog>
    </div>
  );
}