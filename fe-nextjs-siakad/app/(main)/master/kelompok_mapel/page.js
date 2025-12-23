"use client";

import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { Button } from "primereact/button";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Dropdown } from "primereact/dropdown";

import ToastNotifier from "../../../components/ToastNotifier";
import HeaderBar from "../../../components/headerbar";
import CustomDataTable from "../../../components/DataTable";
import FormKelompokMapel from "./components/FormKelompokMapel";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function MasterKelompokMapelPage() {
  const toastRef = useRef(null);
  const isMounted = useRef(true);

  const [token, setToken] = useState("");
  const [dataList, setDataList] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [dialogVisible, setDialogVisible] = useState(false);

  // Filter
  const [statusFilter, setStatusFilter] = useState(null);
  const [statusOptions, setStatusOptions] = useState([]);

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) {
      window.location.href = "/";
    } else {
      setToken(t);
      fetchData(t);
    }

    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchData = async (t) => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/master-kelompok`, {
        headers: { Authorization: `Bearer ${t}` },
      });

      if (!isMounted.current) return;

      if (res.data.status === "00") {
        const data = res.data.data || [];
        setDataList(data);
        setOriginalData(data);

        const statusSet = new Set(data.map((item) => item.STATUS));
        setStatusOptions(Array.from(statusSet).map((s) => ({ label: s, value: s })));
      } else {
        toastRef.current?.showToast("01", res.data.message || "Gagal memuat data");
      }
    } catch (err) {
      console.error(err);
      toastRef.current?.showToast("01", "Gagal menghubungkan ke server");
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  };

  const handleSearch = (keyword) => {
    if (!keyword) {
      applyFilters(statusFilter);
      return;
    }

    const lowerKeyword = keyword.toLowerCase();
    const filtered = originalData.filter((item) => {
      const matchesStatus = statusFilter ? item.STATUS === statusFilter : true;
      const matchesSearch = 
        item.KELOMPOK?.toLowerCase().includes(lowerKeyword) ||
        item.NAMA_KELOMPOK?.toLowerCase().includes(lowerKeyword);
      
      return matchesStatus && matchesSearch;
    });

    setDataList(filtered);
  };

  const applyFilters = (status) => {
    let filtered = [...originalData];
    if (status) {
      filtered = filtered.filter((item) => item.STATUS === status);
    }
    setDataList(filtered);
  };

  const resetFilter = () => {
    setStatusFilter(null);
    setDataList(originalData);
  };

  const handleSubmit = async (formData) => {
    try {
      if (selectedData) {
        const res = await axios.put(`${API_URL}/master-kelompok/${selectedData.ID}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.status === "00") toastRef.current?.showToast("00", "Data berhasil diperbarui");
      } else {
        const res = await axios.post(`${API_URL}/master-kelompok`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.status === "00") toastRef.current?.showToast("00", "Data berhasil ditambahkan");
      }

      setDialogVisible(false);
      fetchData(token);
    } catch (err) {
      toastRef.current?.showToast("01", err.response?.data?.message || "Terjadi kesalahan");
    }
  };

  const handleDelete = (rowData) => {
    confirmDialog({
      message: `Hapus kelompok "${rowData.NAMA_KELOMPOK}"?`,
      header: "Konfirmasi Hapus",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Ya, Hapus",
      rejectLabel: "Batal",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await axios.delete(`${API_URL}/master-kelompok/${rowData.ID}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          toastRef.current?.showToast("00", "Data berhasil dihapus");
          fetchData(token);
        } catch (err) {
          toastRef.current?.showToast("01", "Gagal menghapus data");
        }
      },
    });
  };

  const columns = [
    { field: "ID", header: "ID", style: { width: "70px", textAlign: "center" } },
    { 
      field: "KELOMPOK", 
      header: "Kelompok", 
      style: { width: "120px", textAlign: "center" },
      // Warna biru dihapus, hanya tebal saja
      body: (row) => <span className="font-bold">{row.KELOMPOK}</span>
    },
    { field: "NAMA_KELOMPOK", header: "Nama Kelompok", style: { minWidth: "250px" } },
    {
      field: "STATUS",
      header: "Status",
      style: { width: "150px", textAlign: "center" },
      // Background dan warna teks hijau/merah dihapus total
      body: (row) => <span>{row.STATUS}</span>
    },
    {
      header: "Aksi",
      style: { width: "120px", textAlign: "center" },
      body: (rowData) => (
        <div className="flex gap-2 justify-content-center">
          <Button
            icon="pi pi-pencil"
            severity="secondary"
            text
            tooltip="Ubah"
            onClick={() => {
              setSelectedData(rowData);
              setDialogVisible(true);
            }}
          />
          <Button
            icon="pi pi-trash"
            severity="secondary"
            text
            tooltip="Hapus"
            onClick={() => handleDelete(rowData)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="card">
      <ToastNotifier ref={toastRef} />
      <ConfirmDialog />

      <h3 className="text-xl font-bold mb-4">Master Kelompok Mata Pelajaran</h3>

      <div className="flex flex-column md:flex-row justify-content-between align-items-center gap-3 mb-4">
        <div className="flex gap-2 align-items-end">
          <div className="flex flex-column gap-1">
            <label className="text-sm font-medium">Filter Status</label>
            <Dropdown
              value={statusFilter}
              options={statusOptions}
              onChange={(e) => {
                setStatusFilter(e.value);
                applyFilters(e.value);
              }}
              placeholder="Semua Status"
              showClear
              className="w-full md:w-12rem"
            />
          </div>
          <Button 
            icon="pi pi-refresh" 
            severity="secondary" 
            text 
            onClick={resetFilter} 
            tooltip="Reset Filter"
          />
        </div>

        <HeaderBar
          title=""
          placeholder="Cari kelompok atau nama..."
          onSearch={handleSearch}
          onAddClick={() => {
            setSelectedData(null);
            setDialogVisible(true);
          }}
        />
      </div>

      <CustomDataTable 
        data={dataList} 
        loading={isLoading} 
        columns={columns} 
        rows={10}
        stripedRows // Tambahan agar tabel lebih mudah dibaca meski tanpa warna status
      />

      <FormKelompokMapel
        visible={dialogVisible}
        onHide={() => {
            setDialogVisible(false);
            setSelectedData(null);
        }}
        selectedData={selectedData}
        onSave={handleSubmit}
      />
    </div>
  );
}