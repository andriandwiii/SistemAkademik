"use client";

import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { Button } from "primereact/button";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Dropdown } from "primereact/dropdown";

import ToastNotifier from "../../../components/ToastNotifier";
import HeaderBar from "../../../components/headerbar";
import CustomDataTable from "../../../components/DataTable";
import FormTarifBiaya from "./components/FormTarifBiaya";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function MasterTarifBiayaPage() {
  const toastRef = useRef(null);
  const isMounted = useRef(true);

  const [token, setToken] = useState("");
  const [tarifList, setTarifList] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTarif, setSelectedTarif] = useState(null);
  const [dialogVisible, setDialogVisible] = useState(false);

  // Filter
  const [komponenFilter, setKomponenFilter] = useState(null);
  const [kategoriFilter, setKategoriFilter] = useState(null);
  const [tahunAjaranFilter, setTahunAjaranFilter] = useState(null);
  const [tingkatanFilter, setTingkatanFilter] = useState(null);

  const [komponenOptions, setKomponenOptions] = useState([]);
  const [kategoriOptions, setKategoriOptions] = useState([]);
  const [tahunAjaranOptions, setTahunAjaranOptions] = useState([]);
  const [tingkatanOptions, setTingkatanOptions] = useState([]);

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) {
      window.location.href = "/";
    } else {
      setToken(t);
      fetchTarif(t);
    }

    return () => {
      isMounted.current = false;
      toastRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTarif = async (t) => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/master-tarif-biaya`, {
        headers: { Authorization: `Bearer ${t}` },
      });

      if (!isMounted.current) return;

      if (res.data.status === "00") {
        const data = res.data.data || [];
        data.sort((a, b) => a.id - b.id);

        // Build filter options
        const komponenSet = new Set();
        const kategoriSet = new Set();
        const tahunAjaranSet = new Set();
        const tingkatanSet = new Set();

        data.forEach((item) => {
          if (item.NAMA_KOMPONEN) komponenSet.add(item.NAMA_KOMPONEN);
          if (item.NAMA_KATEGORI) kategoriSet.add(item.NAMA_KATEGORI);
          if (item.NAMA_TAHUN_AJARAN) tahunAjaranSet.add(item.NAMA_TAHUN_AJARAN);
          if (item.TINGKATAN) tingkatanSet.add(item.TINGKATAN);
        });

        setTarifList(data);
        setOriginalData(data);
        setKomponenOptions(Array.from(komponenSet).map((k) => ({ label: k, value: k })));
        setKategoriOptions(Array.from(kategoriSet).map((k) => ({ label: k, value: k })));
        setTahunAjaranOptions(Array.from(tahunAjaranSet).map((ta) => ({ label: ta, value: ta })));
        setTingkatanOptions(Array.from(tingkatanSet).map((t) => ({ label: t, value: t })));
      } else {
        toastRef.current?.showToast("01", res.data.message || "Gagal memuat data tarif biaya");
      }
    } catch (err) {
      console.error(err);
      toastRef.current?.showToast("01", "Gagal memuat data tarif biaya");
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  };

  // Search handler
  const handleSearch = (keyword) => {
    if (!keyword) {
      applyFiltersWithValue(komponenFilter, kategoriFilter, tahunAjaranFilter, tingkatanFilter);
    } else {
      let filtered = [...originalData];

      // Apply dropdown filters first
      if (komponenFilter) {
        filtered = filtered.filter((t) => t.NAMA_KOMPONEN === komponenFilter);
      }
      if (kategoriFilter) {
        filtered = filtered.filter((t) => t.NAMA_KATEGORI === kategoriFilter);
      }
      if (tahunAjaranFilter) {
        filtered = filtered.filter((t) => t.NAMA_TAHUN_AJARAN === tahunAjaranFilter);
      }
      if (tingkatanFilter) {
        filtered = filtered.filter((t) => t.TINGKATAN === tingkatanFilter);
      }

      // Then apply search keyword
      const lowerKeyword = keyword.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.TARIF_ID?.toLowerCase().includes(lowerKeyword) ||
          t.NAMA_KOMPONEN?.toLowerCase().includes(lowerKeyword) ||
          t.NAMA_KATEGORI?.toLowerCase().includes(lowerKeyword)
      );

      setTarifList(filtered);
    }
  };

  // Apply all filters with values
  const applyFiltersWithValue = (komponen, kategori, tahunAjaran, tingkatan) => {
    let filtered = [...originalData];

    if (komponen) {
      filtered = filtered.filter((t) => t.NAMA_KOMPONEN === komponen);
    }
    if (kategori) {
      filtered = filtered.filter((t) => t.NAMA_KATEGORI === kategori);
    }
    if (tahunAjaran) {
      filtered = filtered.filter((t) => t.NAMA_TAHUN_AJARAN === tahunAjaran);
    }
    if (tingkatan) {
      filtered = filtered.filter((t) => t.TINGKATAN === tingkatan);
    }

    setTarifList(filtered);
  };

  // Reset all filters
  const resetFilter = () => {
    setKomponenFilter(null);
    setKategoriFilter(null);
    setTahunAjaranFilter(null);
    setTingkatanFilter(null);
    setTarifList(originalData);
  };

  const handleSubmit = async (data) => {
    try {
      if (selectedTarif) {
        const res = await axios.put(
          `${API_URL}/master-tarif-biaya/${selectedTarif.TARIF_ID}`,
          data,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data.status === "00") {
          toastRef.current?.showToast("00", "Tarif biaya berhasil diperbarui");
        } else {
          toastRef.current?.showToast("01", res.data.message || "Gagal memperbarui tarif biaya");
          return;
        }
      } else {
        const res = await axios.post(`${API_URL}/master-tarif-biaya`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.status === "00") {
          toastRef.current?.showToast("00", "Tarif biaya berhasil ditambahkan");
        } else {
          toastRef.current?.showToast("01", res.data.message || "Gagal menambahkan tarif biaya");
          return;
        }
      }

      if (isMounted.current) {
        await fetchTarif(token);
        setDialogVisible(false);
        setSelectedTarif(null);
      }
    } catch (err) {
      console.error(err);
      toastRef.current?.showToast("01", err.response?.data?.message || "Gagal menyimpan tarif biaya");
    }
  };

  const handleDelete = (rowData) => {
    confirmDialog({
      message: `Yakin ingin menghapus tarif biaya "${rowData.NAMA_KOMPONEN}" untuk kategori "${rowData.NAMA_KATEGORI}"?`,
      header: "Konfirmasi Hapus",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Ya",
      rejectLabel: "Batal",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await axios.delete(`${API_URL}/master-tarif-biaya/${rowData.TARIF_ID}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          toastRef.current?.showToast("00", "Tarif biaya berhasil dihapus");
          if (isMounted.current) {
            await fetchTarif(token);
          }
        } catch (err) {
          console.error(err);
          toastRef.current?.showToast("01", "Gagal menghapus tarif biaya");
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

  const tarifColumns = [
    { field: "id", header: "ID", style: { width: "60px" } },
    { field: "TARIF_ID", header: "ID Tarif", style: { minWidth: "120px" } },
    {
      field: "NAMA_KOMPONEN",
      header: "Komponen Biaya",
      style: { minWidth: "180px" },
      body: (row) => (
        <div>
          <div className="font-medium">{row.NAMA_KOMPONEN || "-"}</div>
          <small className="text-gray-500">{row.JENIS_BIAYA || ""}</small>
        </div>
      ),
    },
    {
      field: "NAMA_KATEGORI",
      header: "Kategori Siswa",
      style: { minWidth: "140px" },
      body: (row) => row.NAMA_KATEGORI || "-",
    },
    {
      field: "NAMA_TAHUN_AJARAN",
      header: "Tahun Ajaran",
      style: { minWidth: "140px" },
      body: (row) => row.NAMA_TAHUN_AJARAN || "-",
    },
    {
      field: "TINGKATAN",
      header: "Tingkatan",
      style: { minWidth: "100px" },
      body: (row) => row.TINGKATAN || <span className="text-gray-400">Semua</span>,
    },
    {
      field: "NOMINAL",
      header: "Nominal",
      style: { minWidth: "140px" },
      body: (row) => (
        <span className="font-semibold text-green-600">
          {formatRupiah(row.NOMINAL || 0)}
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
              setSelectedTarif(rowData);
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

      <h3 className="text-xl font-semibold mb-3">Master Tarif Biaya</h3>

      {/* Filter & Toolbar */}
      <div className="flex flex-col md:flex-row justify-content-between md:items-center gap-4 mb-4">
        {/* Filter Section */}
        <div className="flex flex-wrap gap-2 items-end">
          <div className="flex flex-column gap-2">
            <label htmlFor="komponen-filter" className="text-sm font-medium">
              Komponen Biaya
            </label>
            <Dropdown
              id="komponen-filter"
              value={komponenFilter}
              options={komponenOptions}
              onChange={(e) => {
                setKomponenFilter(e.value);
                applyFiltersWithValue(e.value, kategoriFilter, tahunAjaranFilter, tingkatanFilter);
              }}
              placeholder="Pilih komponen"
              className="w-52"
              showClear
            />
          </div>

          <div className="flex flex-column gap-2">
            <label htmlFor="kategori-filter" className="text-sm font-medium">
              Kategori Siswa
            </label>
            <Dropdown
              id="kategori-filter"
              value={kategoriFilter}
              options={kategoriOptions}
              onChange={(e) => {
                setKategoriFilter(e.value);
                applyFiltersWithValue(komponenFilter, e.value, tahunAjaranFilter, tingkatanFilter);
              }}
              placeholder="Pilih kategori"
              className="w-48"
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
                applyFiltersWithValue(komponenFilter, kategoriFilter, e.value, tingkatanFilter);
              }}
              placeholder="Pilih tahun ajaran"
              className="w-52"
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
                applyFiltersWithValue(komponenFilter, kategoriFilter, tahunAjaranFilter, e.value);
              }}
              placeholder="Pilih tingkatan"
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
          <HeaderBar
            title=""
            placeholder="Cari tarif (ID, Komponen, Kategori)"
            onSearch={handleSearch}
            onAddClick={() => {
              setSelectedTarif(null);
              setDialogVisible(true);
            }}
          />
        </div>
      </div>

      {/* Tabel Data */}
      <CustomDataTable data={tarifList} loading={isLoading} columns={tarifColumns} />

      {/* Form Tarif Biaya */}
      <FormTarifBiaya
        visible={dialogVisible}
        onHide={() => {
          setDialogVisible(false);
          setSelectedTarif(null);
        }}
        selectedTarif={selectedTarif}
        onSave={handleSubmit}
        token={token}
      />
    </div>
  );
}