"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function FormBukuInduk() {
  const toast = useRef(null);

  // STATE FILTER
  const [filters, setFilters] = useState({
    TAHUN_AJARAN_ID: "",
    TINGKATAN_ID: "",
    JURUSAN_ID: "",
    KELAS_ID: "",
    SEMESTER: "1", // Default semester 1
  });

  // DATA SISWA
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  // OPSI DROPDOWN
  const [opsiTahun, setOpsiTahun] = useState([]);
  const [opsiTingkat, setOpsiTingkat] = useState([]);
  const [opsiJurusan, setOpsiJurusan] = useState([]);
  const [opsiKelas, setOpsiKelas] = useState([]);

  // ========================================================
  // 1. FETCH MASTER DATA (Sama dengan Entry Nilai)
  // ========================================================
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [resTahun, resTingkat, resJurusan, resKelas] = await Promise.all([
          axios.get(`${API_URL}/master-tahun-ajaran`),
          axios.get(`${API_URL}/master-tingkatan`),
          axios.get(`${API_URL}/master-jurusan`),
          axios.get(`${API_URL}/master-kelas`),
        ]);

        setOpsiTahun(resTahun.data.data.map(i => ({
          label: i.NAMA_TAHUN_AJARAN,
          value: i.TAHUN_AJARAN_ID
        })));

        setOpsiTingkat(resTingkat.data.data.map(i => ({
          label: i.TINGKATAN,
          value: i.TINGKATAN_ID
        })));

        setOpsiJurusan(resJurusan.data.data.map(i => ({
          label: i.NAMA_JURUSAN,
          value: i.JURUSAN_ID
        })));

        setOpsiKelas(resKelas.data.data);
      } catch (error) {
        console.error("Gagal load master:", error);
      }
    };
    fetchMasterData();
  }, []);

  // FILTER KELAS BERDASARKAN TINGKAT & JURUSAN
  const kelasFiltered = opsiKelas
    .filter(k =>
      (!filters.TINGKATAN_ID || k.TINGKATAN_ID === filters.TINGKATAN_ID) &&
      (!filters.JURUSAN_ID || k.JURUSAN_ID === filters.JURUSAN_ID)
    )
    .map(k => ({
      label: `${k.NAMA_KELAS}`,
      value: k.KELAS_ID
    }));

  // ========================================================
  // 2. FETCH DAFTAR SISWA (Trigger saat filter Tahun & Kelas Berubah)
  // ========================================================
  useEffect(() => {
    if (filters.TAHUN_AJARAN_ID && filters.KELAS_ID) {
      fetchSiswaData();
    }
  }, [filters.TAHUN_AJARAN_ID, filters.KELAS_ID]);

  const fetchSiswaData = async () => {
    setLoading(true);
    try {
      // Sesuaikan endpoint ini dengan API list siswa per kelas Anda
      const res = await axios.get(`${API_URL}/transaksi-siswa-kelas`, {
        params: {
          kelasId: filters.KELAS_ID,
          tahunId: filters.TAHUN_AJARAN_ID,
        },
      });

      if (res.data.status === "00") {
        setStudents(res.data.data);
      } else {
        setStudents([]);
      }
    } catch (error) {
      console.error(error);
      setStudents([]);
    }
    setLoading(false);
  };

  // ========================================================
  // 3. LOGIKA PRINT (Buka Tab Baru ke Page Print)
  // ========================================================
  const onPrint = (nis) => {
    // Membuka tab baru ke page print yang kita buat tadi
    const url = `/raport/${nis}?tahun_ajaran=${filters.TAHUN_AJARAN_ID}&semester=${filters.SEMESTER}`;
    window.open(url, "_blank");
  };

  // ========================================================
  // 4. TEMPLATE KOLOM
  // ========================================================
  const actionBodyTemplate = (rowData) => {
    return (
      <Button 
        icon="pi pi-print" 
        label="Cetak Raport" 
        className="p-button-outlined p-button-info p-button-sm p-button-rounded" 
        onClick={() => onPrint(rowData.NIS)} 
      />
    );
  };

  // ========================================================
  // RENDER
  // ========================================================
  return (
    <div className="p-4">
      <Toast ref={toast} />

      {/* FILTER BOX */}
      <div className="card p-4 mb-3 shadow-1 border-round-xl">
        <h5 className="mb-4 text-xl font-bold"><i className="pi pi-print mr-2"></i>Cetak Buku Induk / Raport</h5>
        <div className="grid formgrid">
          
          <div className="field col-12 md:col-3">
            <label className="font-semibold">Tahun Ajaran</label>
            <Dropdown
              className="w-full"
              value={filters.TAHUN_AJARAN_ID}
              options={opsiTahun}
              onChange={(e) => setFilters({ ...filters, TAHUN_AJARAN_ID: e.value })}
              placeholder="Pilih Tahun"
            />
          </div>

          <div className="field col-12 md:col-2">
            <label className="font-semibold">Semester</label>
            <Dropdown
              className="w-full"
              value={filters.SEMESTER}
              options={[
                { label: "Semester 1", value: "1" },
                { label: "Semester 2", value: "2" },
              ]}
              onChange={(e) => setFilters({ ...filters, SEMESTER: e.value })}
            />
          </div>

          <div className="field col-12 md:col-2">
            <label className="font-semibold">Tingkat</label>
            <Dropdown
              className="w-full"
              value={filters.TINGKATAN_ID}
              options={opsiTingkat}
              onChange={(e) => setFilters({ ...filters, TINGKATAN_ID: e.value, KELAS_ID: "" })}
              placeholder="Pilih Tingkat"
            />
          </div>

          <div className="field col-12 md:col-3">
            <label className="font-semibold">Jurusan</label>
            <Dropdown
              className="w-full"
              value={filters.JURUSAN_ID}
              options={opsiJurusan}
              onChange={(e) => setFilters({ ...filters, JURUSAN_ID: e.value, KELAS_ID: "" })}
              showClear
              placeholder="Semua Jurusan"
            />
          </div>

          <div className="field col-12 md:col-2">
            <label className="font-semibold">Kelas</label>
            <Dropdown
              className="w-full"
              value={filters.KELAS_ID}
              options={kelasFiltered}
              onChange={(e) => setFilters({ ...filters, KELAS_ID: e.value })}
              placeholder="Pilih Kelas"
              disabled={!filters.TINGKATAN_ID}
            />
          </div>

        </div>
      </div>

      {/* TABLE DAFTAR SISWA */}
      <div className="card shadow-1 border-round-xl overflow-hidden">
        <DataTable 
          value={students} 
          loading={loading} 
          showGridlines 
          stripedRows 
          rows={10} 
          paginator 
          emptyMessage="Silakan pilih filter untuk menampilkan data siswa."
          responsiveLayout="scroll"
        >
          <Column header="No" body={(d, o) => o.rowIndex + 1} className="text-center" style={{ width: '50px' }} />
          <Column header="NIS" field="NIS" className="font-medium" style={{ width: '150px' }} />
          <Column header="Nama Lengkap Siswa" field="NAMA" />
          <Column 
            header="Aksi" 
            body={actionBodyTemplate} 
            className="text-center" 
            style={{ width: '200px' }} 
          />
        </DataTable>
      </div>

    </div>
  );
}