"use client";

import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { Button } from "primereact/button";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Dropdown } from "primereact/dropdown";

import ToastNotifier from "../../../components/ToastNotifier";
import HeaderBar from "../../../components/headerbar";
import CustomDataTable from "../../../components/DataTable";
import FormMapping from "./components/FormMapping";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function MappingRaporPage() {
  const toastRef = useRef(null);
  const isMounted = useRef(true);

  const [token, setToken] = useState("");
  const [dataList, setDataList] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [dialogVisible, setDialogVisible] = useState(false);

  // Filter Tingkat
  const [tingkatFilter, setTingkatFilter] = useState(1); // Default ID 1 (Tingkat X)
  const [tingkatOptions, setTingkatOptions] = useState([]);

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) {
      window.location.href = "/";
    } else {
      setToken(t);
      fetchMasterData(t);
    }

    return () => { isMounted.current = false; };
  }, []);

  // Ambil Master Tingkat dan Data Mapping
  const fetchMasterData = async (t) => {
    try {
      const resTingkat = await axios.get(`${API_URL}/master-tingkatan`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (resTingkat.data.status === "00") {
        const options = resTingkat.data.data.map(item => ({
          label: item.TINGKATAN,
          value: item.id
        }));
        setTingkatOptions(options);
        fetchData(t, tingkatFilter);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchData = async (t, idTingkat) => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/mapping-rapor?tingkatan_id=${idTingkat}`, {
        headers: { Authorization: `Bearer ${t}` },
      });

      if (!isMounted.current) return;

      if (res.data.status === "00") {
        setDataList(res.data.data || []);
        setOriginalData(res.data.data || []);
      }
    } catch (err) {
      toastRef.current?.showToast("01", "Gagal memuat data mapping");
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  };

  const handleSearch = (keyword) => {
    if (!keyword) {
      setDataList(originalData);
      return;
    }
    const lowerKeyword = keyword.toLowerCase();
    const filtered = originalData.filter((item) => 
      item.NAMA_MAPEL?.toLowerCase().includes(lowerKeyword) ||
      item.NAMA_LOKAL?.toLowerCase().includes(lowerKeyword)
    );
    setDataList(filtered);
  };

  const handleSubmit = async (formData) => {
    try {
      // API Mapping menggunakan Bulk Save sesuai diskusi sebelumnya
      const res = await axios.post(`${API_URL}/mapping-rapor/bulk`, {
        tingkatan_id: tingkatFilter,
        mappings: [formData] // Mengirim satu data dalam array
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.status === "00") {
        toastRef.current?.showToast("00", "Mapping berhasil disimpan");
        setDialogVisible(false);
        fetchData(token, tingkatFilter);
      }
    } catch (err) {
      toastRef.current?.showToast("01", "Gagal menyimpan mapping");
    }
  };

  const columns = [
    { field: "NO_URUT", header: "No. Urut", style: { width: "100px", textAlign: "center" } },
    { field: "NAMA_MAPEL", header: "Mata Pelajaran Asli", style: { minWidth: "200px" } },
    { field: "NAMA_LOKAL", header: "Nama di Rapor", style: { minWidth: "200px" }, body: (row) => <span className="font-bold">{row.NAMA_LOKAL || row.NAMA_MAPEL}</span> },
    { field: "KELOMPOK_ID", header: "Kelompok", style: { width: "150px" }, body: (row) => <span>{row.KELOMPOK_ID ? `ID: ${row.KELOMPOK_ID}` : '-'}</span> },
    {
      header: "Aksi",
      style: { width: "100px", textAlign: "center" },
      body: (rowData) => (
        <div className="flex gap-2 justify-content-center">
          <Button
            icon="pi pi-pencil"
            severity="secondary"
            text
            tooltip="Setting Rapor"
            onClick={() => {
              setSelectedData(rowData);
              setDialogVisible(true);
            }}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="card">
      <ToastNotifier ref={toastRef} />
      <ConfirmDialog />

      <h3 className="text-xl font-bold mb-4">Mapping Mata Pelajaran Rapor</h3>

      <div className="flex flex-column md:flex-row justify-content-between align-items-center gap-3 mb-4">
        <div className="flex gap-2 align-items-end">
          <div className="flex flex-column gap-1">
            <label className="text-sm font-medium">Pilih Tingkat</label>
            <Dropdown
              value={tingkatFilter}
              options={tingkatOptions}
              onChange={(e) => {
                setTingkatFilter(e.value);
                fetchData(token, e.value);
              }}
              placeholder="Pilih Tingkat"
              className="w-full md:w-12rem"
            />
          </div>
        </div>

        <HeaderBar
          title=""
          placeholder="Cari mapel..."
          onSearch={handleSearch}
          showAdd={false} // Mapping biasanya tidak menambah mapel baru, hanya edit yang ada
        />
      </div>

      <CustomDataTable 
        data={dataList} 
        loading={isLoading} 
        columns={columns} 
        rows={10}
        stripedRows 
      />

      <FormMapping
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