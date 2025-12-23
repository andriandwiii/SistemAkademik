"use client";
import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { Button } from "primereact/button";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import ToastNotifier from "../../../components/ToastNotifier";
import CustomDataTable from "../../../components/DataTable";
import FormGabungMapel from "./components/FormGabungMapel";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function TransaksiMapelPage() {
  const toastRef = useRef(null);
  const [dataList, setDataList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [dialogVisible, setDialogVisible] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/transaksi-mapel`);
      setDataList(res.data.data);
    } catch (err) {
      toastRef.current?.showToast("01", "Gagal mengambil data");
    } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (formData) => {
    try {
      if (selectedData) {
        const updatePayload = {
            MAPEL_INDUK_ID: formData.MAPEL_INDUK_ID,
            MAPEL_KOMPONEN_ID: formData.MAPEL_KOMPONEN_IDS[0],
            JURUSAN_ID_REF: formData.JURUSAN_ID_REF,
            KETERANGAN: formData.KETERANGAN
        };
        await axios.put(`${API_URL}/transaksi-mapel/${selectedData.ID}`, updatePayload);
      } else {
        await axios.post(`${API_URL}/transaksi-mapel`, formData);
      }
      toastRef.current?.showToast("00", "Simpan berhasil");
      setDialogVisible(false);
      fetchData();
    } catch (err) {
      toastRef.current?.showToast("01", err.response?.data?.message || "Error");
    }
  };

  const columns = [
    { header: "No", body: (_, opt) => opt.rowIndex + 1, style: { width: "3rem" } },
    { field: "NAMA_MAPEL_INDUK", header: "Mapel Induk", sortable: true },
    { field: "NAMA_MAPEL_KOMPONEN", header: "Mapel Komponen", sortable: true },
    { field: "NAMA_JURUSAN", header: "Jurusan", sortable: true },
    {
      header: "Aksi",
      body: (rowData) => (
        <div className="flex gap-2">
          <Button icon="pi pi-pencil" rounded text severity="warning" onClick={() => { setSelectedData(rowData); setDialogVisible(true); }} />
          <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => {
            confirmDialog({
              message: "Hapus data ini?",
              accept: async () => {
                await axios.delete(`${API_URL}/transaksi-mapel/${rowData.ID}`);
                fetchData();
              }
            });
          }} />
        </div>
      ),
    },
  ];

  return (
    <div className="card">
      <ToastNotifier ref={toastRef} />
      <ConfirmDialog />
      <div className="flex justify-content-between mb-4">
        <h3>Kelola Gabung Mapel</h3>
        <Button label="Tambah Baru" icon="pi pi-plus" onClick={() => { setSelectedData(null); setDialogVisible(true); }} />
      </div>
      <CustomDataTable data={dataList} columns={columns} loading={isLoading} />
      <FormGabungMapel visible={dialogVisible} onHide={() => setDialogVisible(false)} onSave={handleSubmit} selectedData={selectedData} />
    </div>
  );
}