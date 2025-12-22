"use client";

import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { Button } from "primereact/button";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Dropdown } from "primereact/dropdown";
import { Dialog } from "primereact/dialog";
import { InputNumber } from "primereact/inputnumber";

import ToastNotifier from "../../../components/ToastNotifier";
import HeaderBar from "../../../components/headerbar";
import CustomDataTable from "../../../components/DataTable";
import FormTagihanSiswa from "./components/FormTagihanSiswa";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function TagihanSiswaPage() {
  const toastRef = useRef(null);
  const isMounted = useRef(true);

  const [token, setToken] = useState("");
  const [tagihanList, setTagihanList] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTagihan, setSelectedTagihan] = useState(null);
  const [dialogVisible, setDialogVisible] = useState(false);

  // Dialog Generate SPP
  const [generateDialogVisible, setGenerateDialogVisible] = useState(false);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [tahunAjaranGenerate, setTahunAjaranGenerate] = useState(null);
  const [bulanGenerate, setBulanGenerate] = useState(null);
  const [tahunGenerate, setTahunGenerate] = useState(new Date().getFullYear());

  // Filter
  const [nisFilter, setNisFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [tahunAjaranFilter, setTahunAjaranFilter] = useState(null);
  const [bulanFilter, setBulanFilter] = useState(null);

  const [siswaOptions, setSiswaOptions] = useState([]);
  const [tahunAjaranOptions, setTahunAjaranOptions] = useState([]);

  const statusOptions = [
    { label: "Belum Bayar", value: "BELUM_BAYAR" },
    { label: "Sebagian", value: "SEBAGIAN" },
    { label: "Lunas", value: "LUNAS" },
    { label: "Dispensasi", value: "DISPENSASI" },
  ];

  const bulanOptions = [
    { label: "Januari", value: 1 },
    { label: "Februari", value: 2 },
    { label: "Maret", value: 3 },
    { label: "April", value: 4 },
    { label: "Mei", value: 5 },
    { label: "Juni", value: 6 },
    { label: "Juli", value: 7 },
    { label: "Agustus", value: 8 },
    { label: "September", value: 9 },
    { label: "Oktober", value: 10 },
    { label: "November", value: 11 },
    { label: "Desember", value: 12 },
  ];

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) {
      window.location.href = "/";
    } else {
      setToken(t);
      initializeData(t);
    }

    return () => {
      isMounted.current = false;
      toastRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initializeData = async (t) => {
    await Promise.all([
      fetchTahunAjaran(t),
      fetchSiswa(t),
    ]);
    await fetchTagihan(t);
  };

  const fetchTagihan = async (t) => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/tagihan`, {
        headers: { Authorization: `Bearer ${t}` },
      });

      if (!isMounted.current) return;

      if (res.data.status === "00") {
        const data = res.data.data || [];
        data.sort((a, b) => a.id - b.id);
        setTagihanList(data);
        setOriginalData(data);
      } else {
        toastRef.current?.showToast("01", res.data.message || "Gagal memuat data tagihan");
      }
    } catch (err) {
      console.error(err);
      toastRef.current?.showToast("01", "Gagal memuat data tagihan");
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  };

  const fetchTahunAjaran = async (t) => {
    try {
      console.log("🔄 Fetching tahun ajaran from:", `${API_URL}/master-tahun-ajaran`);
      
      const res = await axios.get(`${API_URL}/master-tahun-ajaran`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      
      console.log("📅 Full Response:", res);
      console.log("📅 Response Status:", res.status);
      console.log("📅 Response Data:", res.data);
      
      // Cek berbagai kemungkinan struktur response
      let data = [];
      
      if (res.data && res.data.status === "00") {
        data = res.data.data || [];
      } else if (Array.isArray(res.data)) {
        // Jika response langsung array
        data = res.data;
      } else if (res.data && Array.isArray(res.data.data)) {
        data = res.data.data;
      }
      
      console.log("📅 Processed Data:", data);
      console.log("📅 Data Length:", data.length);
      
      if (data.length === 0) {
        console.warn("⚠️ Data tahun ajaran kosong!");
        toastRef.current?.showToast("01", "Data tahun ajaran kosong. Silakan tambahkan data di Master Tahun Ajaran.");
        setTahunAjaranOptions([]);
        return;
      }
      
      const options = data.map((ta) => {
        console.log("📅 Mapping item:", ta);
        return {
          label: ta.NAMA_TAHUN_AJARAN || ta.nama_tahun_ajaran || `Tahun Ajaran ${ta.TAHUN_AJARAN_ID || ta.id}`,
          value: ta.TAHUN_AJARAN_ID || ta.id || ta.tahun_ajaran_id,
        };
      });
      
      console.log("📅 Final Options:", options);
      setTahunAjaranOptions(options);
      
    } catch (err) {
      console.error("❌ Error fetch tahun ajaran:", err);
      console.error("❌ Error details:", err.response?.data);
      console.error("❌ Error status:", err.response?.status);
      toastRef.current?.showToast("01", `Gagal memuat data tahun ajaran: ${err.message}`);
      setTahunAjaranOptions([]);
    }
  };

  const fetchSiswa = async (t) => {
    try {
      const res = await axios.get(`${API_URL}/siswa`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (res.data.status === "00") {
        const data = res.data.data || [];
        setSiswaOptions(
          data
            .filter((s) => s.STATUS === "Aktif")
            .map((s) => ({
              label: `${s.NIS} - ${s.NAMA}`,
              value: s.NIS,
            }))
        );
      }
    } catch (err) {
      console.error("Error fetch siswa:", err);
    }
  };

  // Search handler
  const handleSearch = (keyword) => {
    if (!keyword) {
      applyFiltersWithValue(nisFilter, statusFilter, tahunAjaranFilter, bulanFilter);
    } else {
      let filtered = [...originalData];

      // Apply dropdown filters first
      if (nisFilter) {
        filtered = filtered.filter((t) => t.NIS === nisFilter);
      }
      if (statusFilter) {
        filtered = filtered.filter((t) => t.STATUS === statusFilter);
      }
      if (tahunAjaranFilter) {
        filtered = filtered.filter((t) => t.TAHUN_AJARAN_ID === tahunAjaranFilter);
      }
      if (bulanFilter) {
        filtered = filtered.filter((t) => t.BULAN === bulanFilter);
      }

      // Then apply search keyword
      const lowerKeyword = keyword.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.TAGIHAN_ID?.toLowerCase().includes(lowerKeyword) ||
          t.NOMOR_TAGIHAN?.toLowerCase().includes(lowerKeyword) ||
          t.NAMA_SISWA?.toLowerCase().includes(lowerKeyword) ||
          t.NAMA_KOMPONEN?.toLowerCase().includes(lowerKeyword)
      );

      setTagihanList(filtered);
    }
  };

  // Apply all filters with values
  const applyFiltersWithValue = (nis, status, tahunAjaran, bulan) => {
    let filtered = [...originalData];

    if (nis) {
      filtered = filtered.filter((t) => t.NIS === nis);
    }
    if (status) {
      filtered = filtered.filter((t) => t.STATUS === status);
    }
    if (tahunAjaran) {
      filtered = filtered.filter((t) => t.TAHUN_AJARAN_ID === tahunAjaran);
    }
    if (bulan) {
      filtered = filtered.filter((t) => t.BULAN === bulan);
    }

    setTagihanList(filtered);
  };

  // Reset all filters
  const resetFilter = () => {
    setNisFilter(null);
    setStatusFilter(null);
    setTahunAjaranFilter(null);
    setBulanFilter(null);
    setTagihanList(originalData);
  };

  const handleSubmit = async (data) => {
    try {
      if (selectedTagihan) {
        const res = await axios.put(
          `${API_URL}/tagihan/${selectedTagihan.TAGIHAN_ID}`,
          data,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data.status === "00") {
          toastRef.current?.showToast("00", "Tagihan berhasil diperbarui");
        } else {
          toastRef.current?.showToast("01", res.data.message || "Gagal memperbarui tagihan");
          return;
        }
      } else {
        const res = await axios.post(`${API_URL}/tagihan`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.status === "00") {
          toastRef.current?.showToast("00", "Tagihan berhasil ditambahkan");
        } else {
          toastRef.current?.showToast("01", res.data.message || "Gagal menambahkan tagihan");
          return;
        }
      }

      if (isMounted.current) {
        await fetchTagihan(token);
        setDialogVisible(false);
        setSelectedTagihan(null);
      }
    } catch (err) {
      console.error(err);
      toastRef.current?.showToast("01", err.response?.data?.message || "Gagal menyimpan tagihan");
    }
  };

  const handleDelete = (rowData) => {
    confirmDialog({
      message: `Yakin ingin menghapus tagihan "${rowData.NOMOR_TAGIHAN}" untuk siswa "${rowData.NAMA_SISWA}"?`,
      header: "Konfirmasi Hapus",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Ya",
      rejectLabel: "Batal",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await axios.delete(`${API_URL}/tagihan/${rowData.TAGIHAN_ID}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          toastRef.current?.showToast("00", "Tagihan berhasil dihapus");
          if (isMounted.current) {
            await fetchTagihan(token);
          }
        } catch (err) {
          console.error(err);
          toastRef.current?.showToast("01", "Gagal menghapus tagihan");
        }
      },
    });
  };

  // Handler saat membuka dialog generate
  const handleOpenGenerateDialog = async () => {
    console.log("🔄 Membuka dialog generate, refresh tahun ajaran...");
    
    // Refresh data tahun ajaran sebelum membuka dialog
    await fetchTahunAjaran(token);
    
    // Baru buka dialog
    setGenerateDialogVisible(true);
  };

  const handleGenerateSPP = async () => {
    if (!tahunAjaranGenerate || !bulanGenerate || !tahunGenerate) {
      toastRef.current?.showToast("01", "Lengkapi data tahun ajaran, bulan, dan tahun!");
      return;
    }

    confirmDialog({
      message: `Generate SPP untuk bulan ${bulanOptions.find(b => b.value === bulanGenerate)?.label} ${tahunGenerate}?`,
      header: "Konfirmasi Generate SPP Massal",
      icon: "pi pi-question-circle",
      acceptLabel: "Ya, Generate",
      rejectLabel: "Batal",
      accept: async () => {
        setGenerateLoading(true);
        try {
          const res = await axios.post(
            `${API_URL}/tagihan/generate/spp`,
            {
              tahun_ajaran_id: tahunAjaranGenerate,
              bulan: bulanGenerate,
              tahun: tahunGenerate,
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (res.data.status === "00") {
            const { summary } = res.data;
            toastRef.current?.showToast(
              "00",
              `Generate SPP selesai! Berhasil: ${summary.berhasil}, Sudah ada: ${summary.sudah_ada}, Gagal: ${summary.gagal}`
            );
            await fetchTagihan(token);
            setGenerateDialogVisible(false);
            setTahunAjaranGenerate(null);
            setBulanGenerate(null);
          } else {
            toastRef.current?.showToast("01", res.data.message || "Gagal generate SPP");
          }
        } catch (err) {
          console.error(err);
          toastRef.current?.showToast("01", "Gagal generate SPP massal");
        } finally {
          setGenerateLoading(false);
        }
      },
    });
  };

  const formatRupiah = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatTanggal = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      BELUM_BAYAR: { label: "Belum Bayar", severity: "danger" },
      SEBAGIAN: { label: "Sebagian", severity: "warning" },
      LUNAS: { label: "Lunas", severity: "success" },
      DISPENSASI: { label: "Dispensasi", severity: "info" },
    };

    const config = statusMap[status] || { label: status, severity: "secondary" };
    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold bg-${config.severity}-100 text-${config.severity}-700`}>
        {config.label}
      </span>
    );
  };

  const tagihanColumns = [
    { field: "id", header: "ID", style: { width: "60px" } },
    { field: "NOMOR_TAGIHAN", header: "No. Tagihan", style: { minWidth: "140px" } },
    {
      field: "NAMA_SISWA",
      header: "Siswa",
      style: { minWidth: "180px" },
      body: (row) => (
        <div>
          <div className="font-medium">{row.NAMA_SISWA || "-"}</div>
          <small className="text-gray-500">{row.NIS || ""}</small>
        </div>
      ),
    },
    {
      field: "NAMA_KOMPONEN",
      header: "Komponen Biaya",
      style: { minWidth: "150px" },
      body: (row) => (
        <div>
          <div>{row.NAMA_KOMPONEN || "-"}</div>
          {row.BULAN && (
            <small className="text-gray-500">
              {bulanOptions.find((b) => b.value === row.BULAN)?.label} {row.TAHUN}
            </small>
          )}
        </div>
      ),
    },
    {
      field: "NOMINAL",
      header: "Nominal",
      style: { minWidth: "120px" },
      body: (row) => formatRupiah(row.NOMINAL || 0),
    },
    {
      field: "POTONGAN",
      header: "Potongan",
      style: { minWidth: "120px" },
      body: (row) => (
        <span className="text-orange-600">{formatRupiah(row.POTONGAN || 0)}</span>
      ),
    },
    {
      field: "TOTAL",
      header: "Total",
      style: { minWidth: "120px" },
      body: (row) => (
        <span className="font-semibold text-green-600">{formatRupiah(row.TOTAL || 0)}</span>
      ),
    },
    {
      field: "STATUS",
      header: "Status",
      style: { minWidth: "120px" },
      body: (row) => getStatusBadge(row.STATUS),
    },
    {
      field: "TGL_JATUH_TEMPO",
      header: "Jatuh Tempo",
      style: { minWidth: "120px" },
      body: (row) => formatTanggal(row.TGL_JATUH_TEMPO),
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
              setSelectedTagihan(rowData);
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

      <div className="flex justify-content-between align-items-center mb-3">
        <h3 className="text-xl font-semibold">Tagihan Siswa</h3>
        <Button
          label="Generate SPP Massal"
          icon="pi pi-bolt"
          severity="info"
          onClick={handleOpenGenerateDialog}
        />
      </div>

      {/* Filter & Toolbar */}
      <div className="flex flex-col md:flex-row justify-content-between md:items-center gap-4 mb-4">
        {/* Filter Section */}
        <div className="flex flex-wrap gap-2 items-end">
          <div className="flex flex-column gap-2">
            <label htmlFor="nis-filter" className="text-sm font-medium">
              Siswa
            </label>
            <Dropdown
              id="nis-filter"
              value={nisFilter}
              options={siswaOptions}
              onChange={(e) => {
                setNisFilter(e.value);
                applyFiltersWithValue(e.value, statusFilter, tahunAjaranFilter, bulanFilter);
              }}
              placeholder="Pilih siswa"
              className="w-64"
              filter
              showClear
            />
          </div>

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
                applyFiltersWithValue(nisFilter, e.value, tahunAjaranFilter, bulanFilter);
              }}
              placeholder="Pilih status"
              className="w-40"
              showClear
            />
          </div>

          <div className="flex flex-column gap-2">
            <label htmlFor="tahun-ajaran-filter" className="text-sm font-medium">
              Tahun Ajaran
            </label>
            <Dropdown
              id="tahun-ajaran-filter"
              value={tahunAjaranFilter}
              options={tahunAjaranOptions}
              onChange={(e) => {
                setTahunAjaranFilter(e.value);
                applyFiltersWithValue(nisFilter, statusFilter, e.value, bulanFilter);
              }}
              placeholder="Pilih tahun ajaran"
              className="w-52"
              showClear
            />
          </div>

          <div className="flex flex-column gap-2">
            <label htmlFor="bulan-filter" className="text-sm font-medium">
              Bulan
            </label>
            <Dropdown
              id="bulan-filter"
              value={bulanFilter}
              options={bulanOptions}
              onChange={(e) => {
                setBulanFilter(e.value);
                applyFiltersWithValue(nisFilter, statusFilter, tahunAjaranFilter, e.value);
              }}
              placeholder="Pilih bulan"
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

        {/* Action Section */}
        <div className="flex items-center justify-end gap-2">
          <HeaderBar
            title=""
            placeholder="Cari tagihan (No. Tagihan, Siswa, Komponen)"
            onSearch={handleSearch}
            onAddClick={() => {
              setSelectedTagihan(null);
              setDialogVisible(true);
            }}
          />
        </div>
      </div>

      {/* Tabel Data */}
      <CustomDataTable data={tagihanList} loading={isLoading} columns={tagihanColumns} />

      {/* Form Tagihan Siswa */}
      <FormTagihanSiswa
        visible={dialogVisible}
        onHide={() => {
          setDialogVisible(false);
          setSelectedTagihan(null);
        }}
        selectedTagihan={selectedTagihan}
        onSave={handleSubmit}
        token={token}
      />

      {/* Dialog Generate SPP */}
      <Dialog
        header="Generate SPP Massal"
        visible={generateDialogVisible}
        style={{ width: "30vw" }}
        modal
        onHide={() => {
          setGenerateDialogVisible(false);
          setTahunAjaranGenerate(null);
          setBulanGenerate(null);
        }}
      >
        <div className="p-fluid">
          <div className="mb-3 p-3 bg-blue-50 border-round">
            <p className="text-sm text-blue-900 m-0">
              <i className="pi pi-info-circle mr-2"></i>
              Generate SPP akan membuat tagihan untuk semua siswa aktif berdasarkan tarif yang sudah ditentukan.
            </p>
          </div>

          <div className="field">
            <label htmlFor="tahun-ajaran-generate">
              Tahun Ajaran <span className="text-red-500">*</span>
            </label>
            <Dropdown
              id="tahun-ajaran-generate"
              value={tahunAjaranGenerate}
              options={tahunAjaranOptions}
              onChange={(e) => {
                console.log("Selected Tahun Ajaran:", e.value);
                setTahunAjaranGenerate(e.value);
              }}
              placeholder="Pilih tahun ajaran"
              emptyMessage="Tidak ada data tahun ajaran"
              filter
            />
            {tahunAjaranOptions.length === 0 && (
              <small className="text-red-500">
                Data tahun ajaran belum tersedia. Pastikan master tahun ajaran sudah terisi.
              </small>
            )}
          </div>

          <div className="field">
            <label htmlFor="bulan-generate">
              Bulan <span className="text-red-500">*</span>
            </label>
            <Dropdown
              id="bulan-generate"
              value={bulanGenerate}
              options={bulanOptions}
              onChange={(e) => setBulanGenerate(e.value)}
              placeholder="Pilih bulan"
            />
          </div>

          <div className="field">
            <label htmlFor="tahun-generate">
              Tahun <span className="text-red-500">*</span>
            </label>
            <InputNumber
              id="tahun-generate"
              value={tahunGenerate}
              onValueChange={(e) => setTahunGenerate(e.value)}
              useGrouping={false}
              placeholder="Masukkan tahun"
            />
          </div>

          <div className="flex justify-content-end gap-2 mt-3">
            <Button
              label="Batal"
              icon="pi pi-times"
              className="p-button-text"
              onClick={() => {
                setGenerateDialogVisible(false);
                setTahunAjaranGenerate(null);
                setBulanGenerate(null);
              }}
              disabled={generateLoading}
            />
            <Button
              label={generateLoading ? "Processing..." : "Generate"}
              icon="pi pi-bolt"
              onClick={handleGenerateSPP}
              disabled={generateLoading}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}