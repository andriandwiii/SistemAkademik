"use client";

import { useState } from "react";
import { Button } from "primereact/button";
import CustomDataTable from "../../../../../components/DataTable";
import SiswaDetailDialog from "./SiswaDetailDialog";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const TabelSiswa = ({ data, loading, onEdit, onDelete }) => {
  const [selectedSiswa, setSelectedSiswa] = useState(null);
  const [visibleDetail, setVisibleDetail] = useState(false);

  // Helper function untuk build foto URL (sama seperti guru)
  const getFotoUrl = (fotoPath) => {
    if (!fotoPath) return null;
    
    // Jika sudah URL lengkap
    if (fotoPath.startsWith('http://') || fotoPath.startsWith('https://')) {
      return fotoPath;
    }
    
    // Remove /api dari API_URL dan append foto path
    return `${API_URL.replace("/api", "")}${fotoPath}`;
  };

  const fotoTemplate = (row) => {
    const fotoUrl = getFotoUrl(row.FOTO);
    
    if (fotoUrl) {
      return (
        <div className="flex justify-center">
          <img
            src={fotoUrl}
            alt={row.NAMA}
            className="w-12 h-12 rounded-full object-cover cursor-pointer border-2 border-gray-300"
            onError={(e) => {
              // Jika gambar gagal load, tampilkan icon default
              console.error('Failed to load image:', fotoUrl);
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'flex';
            }}
          />
          <div className="w-12 h-12 bg-gray-300 rounded-full hidden items-center justify-center">
            <i className="pi pi-user text-gray-600"></i>
          </div>
        </div>
      );
    }
    
    return (
      <div className="flex justify-center">
        <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
          <i className="pi pi-user text-gray-600"></i>
        </div>
      </div>
    );
  };

  const handleDetail = async (row) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/siswa/${row.SISWA_ID}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedSiswa(res.data.data);
      setVisibleDetail(true);
    } catch (error) {
      console.error("Gagal mengambil detail siswa:", error);
      alert("Gagal mengambil detail siswa");
    }
  };

  const actionTemplate = (row) => (
    <div className="flex gap-2">
      <Button
        icon="pi pi-search"
        size="small"
        severity="info"
        onClick={() => handleDetail(row)}
        tooltip="Detail"
        tooltipOptions={{ position: "top" }}
      />
      <Button
        icon="pi pi-pencil"
        size="small"
        severity="warning"
        onClick={() => onEdit(row)}
        tooltip="Edit"
        tooltipOptions={{ position: "top" }}
      />
      <Button
        icon="pi pi-trash"
        size="small"
        severity="danger"
        onClick={() => onDelete(row)}
        tooltip="Hapus"
        tooltipOptions={{ position: "top" }}
      />
    </div>
  );

  const columns = [
    { 
      field: "SISWA_ID", 
      header: "ID", 
      style: { minWidth: "70px" } 
    },
    { 
      header: "Foto", 
      body: fotoTemplate, 
      style: { minWidth: "80px", textAlign: "center" } 
    },
    { 
      field: "NIS", 
      header: "NIS", 
      style: { minWidth: "120px" } 
    },
    { 
      field: "NISN", 
      header: "NISN", 
      style: { minWidth: "120px" } 
    },
    {
      field: "NAMA",
      header: "Nama Lengkap",
      style: { minWidth: "200px" },
    },
    {
      field: "GENDER",
      header: "JK",
      style: { minWidth: "80px" },
      body: (row) => (row.GENDER === "L" ? "L" : "P"),
    },
    {
      field: "TGL_LAHIR",
      header: "Tgl Lahir",
      style: { minWidth: "120px" },
      body: (row) =>
        row.TGL_LAHIR
          ? new Date(row.TGL_LAHIR).toLocaleDateString("id-ID")
          : "-",
    },
    { 
      field: "TEMPAT_LAHIR", 
      header: "Tempat Lahir", 
      style: { minWidth: "150px" } 
    },
    { 
      field: "AGAMA", 
      header: "Agama", 
      style: { minWidth: "100px" } 
    },
    {
      field: "STATUS",
      header: "Status",
      style: { minWidth: "100px" },
    },
    { 
      field: "EMAIL", 
      header: "Email", 
      style: { minWidth: "200px" } 
    },
    { 
      field: "NO_TELP", 
      header: "No. Telp", 
      style: { minWidth: "130px" } 
    },
    { 
      header: "Aksi", 
      body: actionTemplate, 
      style: { width: "150px" } 
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