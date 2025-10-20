"use client";
import { useState } from "react";
import { Button } from "primereact/button";
import CustomDataTable from "../../../../components/DataTable";
import GuruDetailDialog from "./GuruDetailDialog";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const TabelGuru = ({ data, loading, onEdit, onDelete }) => {
  const [selectedGuru, setSelectedGuru] = useState(null);
  const [visibleDetail, setVisibleDetail] = useState(false);

  const namaLengkapTemplate = (row) => {
    const depan = row.GELAR_DEPAN ? row.GELAR_DEPAN + " " : "";
    const belakang = row.GELAR_BELAKANG ? ", " + row.GELAR_BELAKANG : "";
    return `${depan}${row.NAMA}${belakang}`;
  };

  const handleDetail = async (row) => {
    try {
      const res = await axios.get(`${API_URL}/master-guru/${row.GURU_ID}`);
      setSelectedGuru(res.data.data);
      setVisibleDetail(true);
    } catch (error) {
      console.error("Gagal mengambil detail guru:", error);
      alert("Gagal mengambil detail guru");
    }
  };

  const actionTemplate = (row) => (
    <div className="flex gap-2">
      <Button
        icon="pi pi-search"
        size="small"
        severity="info"
        onClick={() => handleDetail(row)}
      />
      <Button
        icon="pi pi-pencil"
        size="small"
        severity="warning"
        onClick={() => onEdit(row)}
      />
      <Button
        icon="pi pi-trash"
        size="small"
        severity="danger"
        onClick={() => onDelete(row)}
      />
    </div>
  );

  const columns = [
    { field: "GURU_ID", header: "ID", style: { minWidth: "70px" } },
    { field: "NIP", header: "NIP", style: { minWidth: "140px" } },
    {
      header: "Nama Lengkap",
      body: namaLengkapTemplate,
      style: { minWidth: "200px" },
    },
    { field: "PANGKAT", header: "Pangkat", style: { minWidth: "120px" } },
    { field: "JABATAN", header: "Jabatan", style: { minWidth: "150px" } },
    {
      field: "STATUS_KEPEGAWAIAN",
      header: "Status",
      style: { minWidth: "120px" },
    },
    { field: "EMAIL", header: "Email", style: { minWidth: "200px" } },
    { field: "NO_TELP", header: "No. Telp", style: { minWidth: "130px" } },
    { header: "Aksi", body: actionTemplate, style: { width: "150px" } },
  ];

  return (
    <>
      <CustomDataTable data={data} loading={loading} columns={columns} />
      <GuruDetailDialog
        visible={visibleDetail}
        onHide={() => setVisibleDetail(false)}
        guru={selectedGuru}
      />
    </>
  );
};

export default TabelGuru;