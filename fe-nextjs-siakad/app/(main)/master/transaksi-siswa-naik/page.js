// File: app/(main)/master/transaksi-siswa-naik/page.js

"use client";

import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { Button } from "primereact/button";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Dropdown } from "primereact/dropdown";
import { Dialog } from "primereact/dialog";
import { ProgressSpinner } from "primereact/progressspinner";
import { Tag } from "primereact/tag";
import ToastNotifier from "../../../components/ToastNotifier";
import HeaderBar from "../../../components/headerbar";
import CustomDataTable from "../../../components/DataTable";
import FormKenaikanKelas from "./components/FormKenaikanKelas";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function TransaksiSiswaNaikPage() {
  const toastRef = useRef(null);
  const isMounted = useRef(true);

  const [token, setToken] = useState("");
  const [riwayatKenaikan, setRiwayatKenaikan] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Filter
  const [tahunAjaranFilter, setTahunAjaranFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [tingkatanFilter, setTingkatanFilter] = useState(null);

  const [tahunAjaranOptions, setTahunAjaranOptions] = useState([]);
  const [statusOptions] = useState([
    { label: "Naik Kelas", value: "NAIK" },
    { label: "Tinggal Kelas", value: "TINGGAL" },
    { label: "Lulus", value: "LULUS" },
  ]);
  const [tingkatanOptions, setTingkatanOptions] = useState([]);

  // Dialog Wizard Kenaikan Kelas
  const [kenaikanDialogVisible, setKenaikanDialogVisible] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) {
      window.location.href = "/";
    } else {
      setToken(t);
      fetchRiwayatKenaikan(t);
    }

    return () => {
      isMounted.current = false;
      toastRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRiwayatKenaikan = async (t) => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/kenaikan-kelas`, {
        headers: { Authorization: `Bearer ${t}` },
      });

      if (!isMounted.current) return;

      if (res.data.status === "00") {
        const data = res.data.data || [];
        data.sort((a, b) => b.ID - a.ID);

        // Build filter options
        const tahunAjaranSet = new Set();
        const tingkatanSet = new Set();

        data.forEach((item) => {
          if (item.tahun_ajaran_lama?.NAMA_TAHUN_AJARAN) {
            tahunAjaranSet.add(item.tahun_ajaran_lama.NAMA_TAHUN_AJARAN);
          }
          if (item.tingkatan_asal?.TINGKATAN) {
            tingkatanSet.add(item.tingkatan_asal.TINGKATAN);
          }
        });

        setRiwayatKenaikan(data);
        setOriginalData(data);
        setTahunAjaranOptions(
          Array.from(tahunAjaranSet).map((ta) => ({ label: ta, value: ta }))
        );
        setTingkatanOptions(
          Array.from(tingkatanSet).map((t) => ({ label: t, value: t }))
        );
      } else {
        toastRef.current?.showToast("01", res.data.message || "Gagal memuat riwayat kenaikan");
      }
    } catch (err) {
      console.error(err);
      toastRef.current?.showToast("01", "Gagal memuat riwayat kenaikan kelas");
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  };

  // Search handler
  const handleSearch = (keyword) => {
    if (!keyword) {
      applyFiltersWithValue(tahunAjaranFilter, statusFilter, tingkatanFilter);
    } else {
      let filtered = [...originalData];

      // Apply dropdown filters first
      if (tahunAjaranFilter) {
        filtered = filtered.filter(
          (r) => r.tahun_ajaran_lama?.NAMA_TAHUN_AJARAN === tahunAjaranFilter
        );
      }
      if (statusFilter) {
        filtered = filtered.filter((r) => r.STATUS === statusFilter);
      }
      if (tingkatanFilter) {
        filtered = filtered.filter(
          (r) => r.tingkatan_asal?.TINGKATAN === tingkatanFilter
        );
      }

      // Then apply search keyword
      const lowerKeyword = keyword.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.siswa?.NAMA?.toLowerCase().includes(lowerKeyword) ||
          r.siswa?.NIS?.toLowerCase().includes(lowerKeyword) ||
          r.kelas_asal?.KELAS_ID?.toLowerCase().includes(lowerKeyword) ||
          r.kelas_tujuan?.KELAS_ID?.toLowerCase().includes(lowerKeyword)
      );

      setRiwayatKenaikan(filtered);
    }
  };

  // Apply all filters with values
  const applyFiltersWithValue = (tahunAjaran, status, tingkatan) => {
    let filtered = [...originalData];

    if (tahunAjaran) {
      filtered = filtered.filter(
        (r) => r.tahun_ajaran_lama?.NAMA_TAHUN_AJARAN === tahunAjaran
      );
    }
    if (status) {
      filtered = filtered.filter((r) => r.STATUS === status);
    }
    if (tingkatan) {
      filtered = filtered.filter((r) => r.tingkatan_asal?.TINGKATAN === tingkatan);
    }

    setRiwayatKenaikan(filtered);
  };

  // Reset all filters
  const resetFilter = () => {
    setTahunAjaranFilter(null);
    setStatusFilter(null);
    setTingkatanFilter(null);
    setRiwayatKenaikan(originalData);
  };

  // Handler untuk Kenaikan Kelas Massal
  const handleKenaikanKelasSubmit = async (data) => {
    try {
      const res = await axios.post(`${API_URL}/kenaikan-kelas`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.status === "00") {
        toastRef.current?.showToast(
          "00",
          res.data.message || "Proses Kenaikan Kelas Berhasil"
        );
        if (isMounted.current) {
          await fetchRiwayatKenaikan(token);
          setKenaikanDialogVisible(false);
        }
      } else {
        toastRef.current?.showToast(
          "01",
          res.data.message || "Proses Kenaikan Kelas Gagal"
        );
      }
    } catch (err) {
      console.error(err);
      toastRef.current?.showToast(
        "01",
        err.response?.data?.message || "Gagal memanggil API Kenaikan Kelas"
      );
    }
  };

  const handleDelete = (rowData) => {
    confirmDialog({
      message: `Apakah Anda yakin ingin menghapus riwayat kenaikan siswa "${rowData.siswa?.NAMA}"?`,
      header: "Konfirmasi Hapus",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Ya",
      rejectLabel: "Batal",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await axios.delete(`${API_URL}/kenaikan-kelas/${rowData.ID}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          toastRef.current?.showToast("00", "Riwayat kenaikan berhasil dihapus");
          if (isMounted.current) {
            await fetchRiwayatKenaikan(token);
          }
        } catch (err) {
          console.error(err);
          toastRef.current?.showToast("01", "Gagal menghapus riwayat kenaikan");
        }
      },
    });
  };

  const handleProsesKenaikanKelas = () => {
    setKenaikanDialogVisible(true);
  };

  // Status body template
  const statusBodyTemplate = (rowData) => {
    const statusMap = {
      NAIK: { label: "Naik Kelas", severity: "success" },
      TINGGAL: { label: "Tinggal Kelas", severity: "warning" },
      LULUS: { label: "Lulus", severity: "info" },
    };
    const status = statusMap[rowData.STATUS] || { label: rowData.STATUS, severity: "secondary" };
    return <Tag value={status.label} severity={status.severity} />;
  };

  const riwayatColumns = [
    { field: "ID", header: "ID", style: { width: "60px" } },
    {
      field: "siswa.NAMA",
      header: "Nama Siswa",
      style: { minWidth: "180px" },
      body: (row) => row.siswa?.NAMA || "-",
    },
    {
      field: "siswa.NIS",
      header: "NIS",
      style: { minWidth: "140px" },
      body: (row) => row.siswa?.NIS || "-",
    },
    {
      field: "tahun_ajaran_lama.NAMA_TAHUN_AJARAN",
      header: "TA Asal",
      style: { minWidth: "130px" },
      body: (row) => row.tahun_ajaran_lama?.NAMA_TAHUN_AJARAN || "-",
    },
    {
      field: "kelas_asal.KELAS_ID",
      header: "Kelas Asal",
      style: { minWidth: "100px" },
      body: (row) => row.kelas_asal?.KELAS_ID || "-",
    },
    {
      field: "tingkatan_asal.TINGKATAN",
      header: "Tingkat Asal",
      style: { minWidth: "100px" },
      body: (row) => row.tingkatan_asal?.TINGKATAN || "-",
    },
    {
      field: "STATUS",
      header: "Status",
      style: { minWidth: "120px" },
      body: statusBodyTemplate,
    },
    {
      field: "kelas_tujuan.KELAS_ID",
      header: "Kelas Tujuan",
      style: { minWidth: "110px" },
      body: (row) => row.kelas_tujuan?.KELAS_ID || "-",
    },
    {
      field: "tingkatan_tujuan.TINGKATAN",
      header: "Tingkat Tujuan",
      style: { minWidth: "110px" },
      body: (row) => row.tingkatan_tujuan?.TINGKATAN || "-",
    },
    {
      field: "tahun_ajaran_baru.NAMA_TAHUN_AJARAN",
      header: "TA Tujuan",
      style: { minWidth: "130px" },
      body: (row) => row.tahun_ajaran_baru?.NAMA_TAHUN_AJARAN || "-",
    },
    {
      header: "Aksi",
      body: (rowData) => (
        <div className="flex gap-2">
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
      style: { width: "100px" },
    },
  ];

  return (
    <div className="card">
      <ToastNotifier ref={toastRef} />
      <ConfirmDialog />

      <h3 className="text-xl font-semibold mb-3">Master Kenaikan Kelas</h3>

      {/* Filter & Toolbar */}
      <div className="flex flex-col md:flex-row justify-content-between md:items-center gap-4 mb-4">
        {/* Filter Section */}
        <div className="flex flex-wrap gap-2 items-end">
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
                applyFiltersWithValue(e.value, statusFilter, tingkatanFilter);
              }}
              placeholder="Pilih tahun ajaran"
              className="w-52"
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
                applyFiltersWithValue(tahunAjaranFilter, e.value, tingkatanFilter);
              }}
              placeholder="Pilih status"
              className="w-48"
              showClear
            />
          </div>

          <div className="flex flex-column gap-2">
            <label htmlFor="tingkatan-filter" className="text-sm font-medium">
              Tingkatan Asal
            </label>
            <Dropdown
              id="tingkatan-filter"
              value={tingkatanFilter}
              options={tingkatanOptions}
              onChange={(e) => {
                setTingkatanFilter(e.value);
                applyFiltersWithValue(tahunAjaranFilter, statusFilter, e.value);
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
            placeholder="Cari siswa (Nama, NIS, Kelas)"
            onSearch={handleSearch}
            onAddClick={handleProsesKenaikanKelas}
            addButtonLabel="Proses"
          />
        </div>
      </div>

      {/* Tabel Data */}
      <CustomDataTable
        data={riwayatKenaikan}
        loading={isLoading}
        columns={riwayatColumns}
      />

      {/* Dialog Wizard Kenaikan Kelas */}
      <FormKenaikanKelas
        visible={kenaikanDialogVisible}
        onHide={() => setKenaikanDialogVisible(false)}
        onSave={handleKenaikanKelasSubmit}
        token={token}
      />
    </div>
  );
}