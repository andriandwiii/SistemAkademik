'use client';

import axios from "axios"; // Import axios
import { useState, useRef, useEffect, useCallback } from "react";
// PrimeReact Components
import { Button } from "primereact/button";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { InputText } from "primereact/inputtext";
import { ProgressSpinner } from "primereact/progressspinner"; // Tambahkan ProgressSpinner

// Custom Components (Asumsi Lokasi Impor)
import ToastNotifier from "../../../../components/ToastNotifier";
import CustomDataTable from "../../../../components/DataTable";
import FormCatatanBKModal from "./components/FormcatatanBK";

// Ganti ini dengan URL API Catatan BK yang sebenarnya
const API_URL_CATATAN = "/api/catatanbk";
// Ganti ini dengan Token yang sebenarnya jika diperlukan (asumsi diambil dari localStorage)
const API_TOKEN_PLACEHOLDER = "your-auth-token"; 

// --- Placeholder API Functions (Ganti dengan implementasi backend nyata) ---
const fetchCatatanBKAPI = async (token) => {
    // --- SIMULASI FETCH DARI API ---
    await new Promise(resolve => setTimeout(resolve, 500)); 
    // Data dummy yang sama, dikembalikan seolah-olah dari API
    return [
        { id: 1, nama: 'Aldi Saputra', kelas: 'X IPA 1', catatan: 'Sering terlambat', tanggal: '2025-01-10' },
        { id: 2, nama: 'Rina Permatasari', kelas: 'XI IPS 2', catatan: 'Tidak mengerjakan PR', tanggal: '2025-01-11' },
        { id: 3, nama: 'Dewi Anggraini', kelas: 'XII IPA 3', catatan: 'Berkelahi di kelas', tanggal: '2025-01-13' }
    ];
    // --- AKHIR SIMULASI ---

    /* Contoh implementasi axios nyata:
    const res = await axios.get(`${API_URL_CATATAN}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.data;
    */
};

const saveCatatanBKAPI = async (data, mode, token) => {
    // --- SIMULASI SAVE/UPDATE KE API ---
    await new Promise(resolve => setTimeout(resolve, 300));
    if (mode === 'add') {
        return { ...data, id: Date.now() }; // Simulasikan ID baru dari DB
    } else {
        return data; // Kembalikan data yang diupdate
    }
    // --- AKHIR SIMULASI ---

    /* Contoh implementasi axios nyata:
    if (mode === 'add') {
        const res = await axios.post(`${API_URL_CATATAN}`, data, { headers: { Authorization: `Bearer ${token}` } });
        return res.data.data;
    } else {
        const res = await axios.put(`${API_URL_CATATAN}/${data.id}`, data, { headers: { Authorization: `Bearer ${token}` } });
        return res.data.data;
    }
    */
};

const deleteCatatanBKAPI = async (id, token) => {
    // --- SIMULASI DELETE DARI API ---
    await new Promise(resolve => setTimeout(resolve, 300));
    return true; 
    // --- AKHIR SIMULASI ---

    /* Contoh implementasi axios nyata:
    await axios.delete(`${API_URL_CATATAN}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    return true;
    */
};
// --------------------------------------------------------------------------

export default function PageCatatanBK() {
  const toastRef = useRef(null);
  const isMounted = useRef(true); // Ref untuk mencegah state update pada unmounted component

  const [token, setToken] = useState(API_TOKEN_PLACEHOLDER); // Placeholder token
  const [records, setRecords] = useState([]);
  const [originalData, setOriginalData] = useState([]); // Untuk filter
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogMode, setDialogMode] = useState("add"); 
  const [globalFilter, setGlobalFilter] = useState("");

  // --- FUNGSI AMBIL DATA (READ) ---
  const fetchRecords = useCallback(async (t) => {
    setIsLoading(true);
    try {
        const data = await fetchCatatanBKAPI(t);

        if (!isMounted.current) return;

        setRecords(data);
        setOriginalData(data);
    } catch (err) {
        console.error("Gagal memuat data catatan BK:", err);
        if (isMounted.current) {
            toastRef.current?.showToast("01", "Gagal memuat data catatan BK.");
        }
    } finally {
        if (isMounted.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Inisialisasi token dan fetch data
    const t = localStorage.getItem("token") || API_TOKEN_PLACEHOLDER;
    setToken(t);
    fetchRecords(t);

    return () => {
        isMounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  // --- FUNGSI SIMPAN/UPDATE DATA (CREATE/UPDATE) ---
  const handleSubmit = async (data) => {
    setIsLoading(true);
    try {
        const savedData = await saveCatatanBKAPI(data, dialogMode, token);

        if (dialogMode === "add") {
            // Tambah data baru ke state
            setRecords(prev => [...prev, savedData]);
            setOriginalData(prev => [...prev, savedData]);
            toastRef.current?.showToast("00", "Berhasil menambahkan catatan");
        } else {
            // Update data yang sudah ada di state
            const updatedRecords = prev => 
                prev.map(r => r.id === savedData.id ? savedData : r);
                
            setRecords(updatedRecords);
            setOriginalData(updatedRecords);
            toastRef.current?.showToast("00", "Berhasil memperbarui catatan");
        }

        if (isMounted.current) {
            setDialogVisible(false);
            setSelectedRecord(null);
        }
    } catch (err) {
        console.error(err);
        toastRef.current?.showToast("01", err.response?.data?.message || `Gagal ${dialogMode === 'add' ? 'menambah' : 'memperbarui'} catatan`);
    } finally {
        if (isMounted.current) setIsLoading(false);
    }
  };

  // --- FUNGSI HAPUS DATA (DELETE) ---
  const handleDelete = (row) => {
    confirmDialog({
      message: `Yakin ingin menghapus catatan "${row.nama}"?`,
      header: "Konfirmasi Hapus",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Hapus",
      rejectLabel: "Batal",
      acceptClassName: "p-button-danger",
      accept: async () => {
        setIsLoading(true);
        try {
            await deleteCatatanBKAPI(row.id, token);
            
            const filteredRecords = prev => prev.filter(r => r.id !== row.id);
            setRecords(filteredRecords);
            setOriginalData(filteredRecords);
            
            toastRef.current?.showToast("00", "Catatan berhasil dihapus");
        } catch (err) {
            console.error(err);
            toastRef.current?.showToast("01", "Gagal menghapus catatan");
        } finally {
            if (isMounted.current) setIsLoading(false);
        }
      },
    });
  };

  // Template untuk kolom Aksi (Edit dan Hapus)
  const actionBodyTemplate = (row) => (
    <div className="flex gap-2">
      <Button
        icon="pi pi-pencil"
        size="small"
        severity="warning"
        tooltip="Edit"
        tooltipOptions={{ position: "top" }}
        onClick={() => {
          setSelectedRecord(row);
          setDialogMode("edit");
          setDialogVisible(true);
        }}
        disabled={isLoading}
      />
      <Button
        icon="pi pi-trash"
        size="small"
        severity="danger"
        tooltip="Hapus"
        tooltipOptions={{ position: "top" }}
        onClick={() => handleDelete(row)}
        disabled={isLoading}
      />
    </div>
  );

  // Definisi Kolom untuk DataTable
  const columns = [
      { field: "id", header: "ID", style: { width: "60px", textAlign: "center" } },
    { field: "nama", header: "Nama Siswa", sortable: true },
    { field: "kelas", header: "Kelas", sortable: true },
    { field: "catatan", header: "Catatan" },
    { field: "tanggal", header: "Tanggal", sortable: true },
    { header: "Aksi", body: actionBodyTemplate, style: { width: "120px" } },
  ];

  // Logika Filter Pencarian Global
  const filteredRecords = records.filter(r =>
    r.nama.toLowerCase().includes(globalFilter.toLowerCase()) ||
    r.kelas.toLowerCase().includes(globalFilter.toLowerCase()) ||
    r.catatan.toLowerCase().includes(globalFilter.toLowerCase())
  );

  return (
    <div className="card p-3">
      <ToastNotifier ref={toastRef} />
      <ConfirmDialog />

      <h3 className="font-semibold text-xl mb-3">Catatan Bimbingan Konseling</h3>

      {/* Bagian Header Kontrol: Pencarian dan Tombol Tambah BERDEKATAN */}
      <div className="flex items-center gap-3 mb-4"> 
        {/* Input Pencarian */}
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            placeholder="Cari nama, kelas, atau catatan..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            disabled={isLoading}
          />
        </span>

        {/* Tombol Tambah Catatan */}
        <Button
          label="Tambah Catatan"
          icon="pi pi-plus"
          onClick={() => {
            setDialogMode("add");
            setSelectedRecord(null);
            setDialogVisible(true);
          }}
          disabled={isLoading}
        />
      </div>

      {/* Tampilan Data */}
      {/* Menggunakan ProgressSpinner saat loading */}
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <ProgressSpinner style={{ width: "50px", height: "50px" }} strokeWidth="4" />
        </div>
      ) : (
        <CustomDataTable data={filteredRecords} columns={columns} loading={isLoading} />
      )}
      
      {/* Modal Tambah/Edit Catatan */}
      <FormCatatanBKModal
        visible={dialogVisible}
        mode={dialogMode}
        record={selectedRecord}
        onHide={() => setDialogVisible(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}