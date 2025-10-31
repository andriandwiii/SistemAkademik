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

  // Helper function untuk build foto URL (sama seperti siswa)
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
      field: "GURU_ID", 
      header: "ID", 
      style: { minWidth: "70px" } 
    },
    { 
      header: "Foto", 
      body: fotoTemplate, 
      style: { minWidth: "80px", textAlign: "center" } 
    },
    { 
      field: "NIP", 
      header: "NIP", 
      style: { minWidth: "140px" } 
    },
    {
      field: "NAMA",
      header: "Nama Lengkap",
      style: { minWidth: "200px" },
    },
    { 
      field: "PANGKAT", 
      header: "Pangkat", 
      style: { minWidth: "120px" } 
    },
    { 
      field: "JABATAN", 
      header: "Jabatan", 
      style: { minWidth: "150px" } 
    },
    {
      field: "STATUS_KEPEGAWAIAN",
      header: "Status",
      style: { minWidth: "120px" },
    },
    { 
      field: "KEAHLIAN",  // Ganti MAPEL_DIAMPU menjadi KEAHLIAN
      header: "Keahlian", 
      style: { minWidth: "150px" } 
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
      <GuruDetailDialog
        visible={visibleDetail}
        onHide={() => setVisibleDetail(false)}
        guru={selectedGuru}
      />
    </>
  );
};

export default TabelGuru;
