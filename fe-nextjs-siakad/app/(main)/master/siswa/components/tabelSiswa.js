"use client";

import { useState } from "react";
import { Button } from "primereact/button";
import CustomDataTable from "../../../../components/DataTable";
import SiswaDetailDialog from "./SiswaDetailDialog"; 
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const TabelSiswa = ({ data, loading, onEdit, onDelete }) => {
  const [selectedSiswa, setSelectedSiswa] = useState(null);
  const [visibleDetail, setVisibleDetail] = useState(false);

  // 🔹 Ambil detail siswa
  const handleDetail = async (row) => {
    try {
      const res = await axios.get(`${API_URL}/siswa/${row.SISWA_ID}`);
      setSelectedSiswa(res.data.data);
      setVisibleDetail(true);
    } catch (error) {
      console.error("Gagal mengambil detail siswa:", error);
      alert("Gagal mengambil detail siswa");
    }
  };

  // 🔹 Template aksi
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

  // 🔹 Kolom tabel
 const columns = [
  { field: "SISWA_ID", header: "ID", style: { minWidth: "70px" } },
  { field: "NIS", header: "NIS", style: { minWidth: "120px" } },
  { field: "NISN", header: "NISN", style: { minWidth: "120px" } },
  { field: "NAMA", header: "Nama", style: { minWidth: "200px" } },
  {
    field: "GENDER",
    header: "Jenis Kelamin",
    style: { minWidth: "120px" },
    body: (row) => (row.GENDER === "L" ? "Laki-laki" : "Perempuan"),
  },
  {
    field: "TGL_LAHIR",
    header: "Tanggal Lahir",
    style: { minWidth: "120px" },
    body: (row) => (row.TGL_LAHIR ? new Date(row.TGL_LAHIR).toLocaleDateString("id-ID") : "-"),
  },
  { field: "TEMPAT_LAHIR", header: "Tempat Lahir", style: { minWidth: "150px" } },
  { field: "AGAMA", header: "Agama", style: { minWidth: "100px" } },
  { field: "ALAMAT", header: "Alamat", style: { minWidth: "200px" } },
  { field: "NO_TELP", header: "No. Telp", style: { minWidth: "120px" } },
  { field: "STATUS", header: "Status", style: { minWidth: "100px" } },
  {
    field: "FOTO",
    header: "Foto",
    style: { minWidth: "80px" },
    body: (row) =>
      row.FOTO ? (
        <img
          src={`${API_URL}${row.FOTO}`}
          alt={row.NAMA}
          className="w-12 h-12 rounded-full object-cover"
        />
      ) : (
        <span>-</span>
      ),
  },
  {
    header: "Aksi",
    body: (row) => (
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
    ),
    style: { width: "150px" },
  },
];

  return (
    <>
      <CustomDataTable data={data} loading={loading} columns={columns} />
      <SiswaDetailDialog
        visible={visibleDetail}
        onHide={() => setVisibleDetail(false)}
        siswa={selectedSiswa}
      />
    </>
  );
};

export default TabelSiswa;
