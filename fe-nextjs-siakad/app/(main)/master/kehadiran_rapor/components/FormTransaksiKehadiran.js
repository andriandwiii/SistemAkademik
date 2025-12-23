"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Toast } from "primereact/toast";
import { Toolbar } from "primereact/toolbar";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function EntryKehadiranPage() {
  const toast = useRef(null);

  // STATE FILTER (Sama dengan Entry Nilai, tanpa Mapel)
  const [filters, setFilters] = useState({
    TAHUN_AJARAN_ID: "",
    TINGKATAN_ID: "",
    JURUSAN_ID: "",
    KELAS_ID: "",
  });

  // DATA
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  // OPSI DROPDOWN
  const [opsiTahun, setOpsiTahun] = useState([]);
  const [opsiTingkat, setOpsiTingkat] = useState([]);
  const [opsiJurusan, setOpsiJurusan] = useState([]);
  const [opsiKelas, setOpsiKelas] = useState([]);

  // ========================================================
  // 1. FETCH MASTER DATA
  // ========================================================
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [
          resTahun,
          resTingkat,
          resJurusan,
          resKelas,
        ] = await Promise.all([
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
        toast.current.show({
          severity: "error",
          summary: "Gagal",
          detail: "Gagal memuat data master"
        });
      }
    };
    fetchMasterData();
  }, []);

  // ========================================================
  // 1B. FILTER KELAS BY TINGKAT & JURUSAN
  // ========================================================
  const kelasFiltered = opsiKelas
    .filter(k =>
      (!filters.TINGKATAN_ID || k.TINGKATAN_ID === filters.TINGKATAN_ID) &&
      (!filters.JURUSAN_ID || k.JURUSAN_ID === filters.JURUSAN_ID)
    )
    .map(k => ({
      label: `${k.KELAS_ID}`, // Menggunakan KELAS_ID sesuai screenshot DB kamu sebelumnya
      value: k.KELAS_ID
    }));

  // ========================================================
  // 2. FETCH DATA KEHADIRAN (TRIGGER OTOMATIS)
  // ========================================================
  useEffect(() => {
    if (filters.TAHUN_AJARAN_ID && filters.KELAS_ID) {
      fetchEntryData();
    }
  }, [filters.TAHUN_AJARAN_ID, filters.KELAS_ID]);

  const fetchEntryData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/kehadiran/cek-kehadiran`, {
        params: {
          kelas_id: filters.KELAS_ID,
          tahun_ajaran_id: filters.TAHUN_AJARAN_ID,
          tingkatan_id: filters.TINGKATAN_ID,
          jurusan_id: filters.JURUSAN_ID
        },
      });

      // Sesuaikan dengan format response backend kamu
      const data = res.data.data || res.data; 
      setStudents(data);
      
      toast.current.show({
        severity: "success",
        summary: "Data Dimuat",
        detail: `Berhasil mengambil daftar siswa`
      });
    } catch (error) {
      console.error(error);
      setStudents([]);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Gagal mengambil data kehadiran (Error 500)"
      });
    }
    setLoading(false);
  };

  // ========================================================
  // 3. HANDLE INPUT
  // ========================================================
  const onValueChange = (nis, field, val) => {
    setStudents(prev =>
      prev.map(s => (s.NIS === nis ? { ...s, [field]: val } : s))
    );
  };

  // ========================================================
  // 4. SIMPAN KEHADIRAN
  // ========================================================
  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = {
        kelas_id: filters.KELAS_ID,
        tahun_ajaran_id: filters.TAHUN_AJARAN_ID,
        tingkatan_id: filters.TINGKATAN_ID,
        jurusan_id: filters.JURUSAN_ID,
        data_kehadiran: students
      };

      const res = await axios.post(`${API_URL}/kehadiran/simpan-kehadiran`, payload);

      if (res.data.status === "00" || res.status === 200) {
        toast.current.show({
          severity: "success",
          summary: "Berhasil",
          detail: "Data kehadiran berhasil disimpan"
        });
        fetchEntryData();
      }
    } catch (error) {
      console.error(error);
      toast.current.show({
        severity: "error",
        summary: "Gagal",
        detail: "Gagal menyimpan data kehadiran"
      });
    }
    setLoading(false);
  };

  // ========================================================
  // 5. TABLE TEMPLATE
  // ========================================================
  const inputTemplate = (row, field) => (
    <InputNumber
      value={row[field] ?? 0}
      onValueChange={(e) => onValueChange(row.NIS, field, e.value)}
      min={0}
      max={200}
      showButtons
      buttonLayout="horizontal"
      incrementButtonIcon="pi pi-plus"
      decrementButtonIcon="pi pi-minus"
      inputClassName="text-center font-semibold"
      className="w-full"
    />
  );

  return (
    <div className="p-4">
      <Toast ref={toast} />

      {/* FILTER SECTION */}
      <Card className="mb-3">
        <div className="grid formgrid p-fluid">
          
          <div className="field col-12 md:col-3">
            <label className="font-bold">Tahun Ajaran</label>
            <Dropdown
              value={filters.TAHUN_AJARAN_ID}
              options={opsiTahun}
              onChange={(e) => setFilters({ ...filters, TAHUN_AJARAN_ID: e.value })}
              placeholder="Pilih Tahun"
            />
          </div>

          <div className="field col-12 md:col-2">
            <label className="font-bold">Tingkat</label>
            <Dropdown
              value={filters.TINGKATAN_ID}
              options={opsiTingkat}
              onChange={(e) => setFilters({ ...filters, TINGKATAN_ID: e.value, KELAS_ID: "" })}
              placeholder="Pilih Tingkat"
            />
          </div>

          <div className="field col-12 md:col-3">
            <label className="font-bold">Jurusan</label>
            <Dropdown
              value={filters.JURUSAN_ID}
              options={opsiJurusan}
              onChange={(e) => setFilters({ ...filters, JURUSAN_ID: e.value, KELAS_ID: "" })}
              placeholder="Pilih Jurusan"
              showClear
            />
          </div>

          <div className="field col-12 md:col-2">
            <label className="font-bold">Kelas</label>
            <Dropdown
              value={filters.KELAS_ID}
              options={kelasFiltered}
              onChange={(e) => setFilters({ ...filters, KELAS_ID: e.value })}
              placeholder="Pilih Kelas"
            />
          </div>

          <div className="field col-12 md:col-2 flex align-items-end">
            <Button label="Refresh" icon="pi pi-refresh" onClick={fetchEntryData} loading={loading} />
          </div>

        </div>
      </Card>

      {/* TABLE SECTION */}
      {students.length > 0 && (
        <Card>
          <Toolbar 
            className="mb-3"
            left={<h5 className="m-0 font-bold text-primary">Daftar Kehadiran Siswa</h5>}
            right={
              <Button label="Simpan Kehadiran" icon="pi pi-save" severity="success" onClick={handleSave} loading={loading} />
            }
          />

          <DataTable value={students} showGridlines responsiveLayout="scroll" paginator rows={10}>
            <Column header="No" body={(d, o) => o.rowIndex + 1} style={{ width: '4rem', textAlign: 'center' }} />
            <Column header="NIS" field="NIS" style={{ width: '10rem' }} />
            <Column header="Nama Siswa" field="NAMA_SISWA" sortable />

            <Column header="Sakit (Hari)" body={(r) => inputTemplate(r, "SAKIT")} headerStyle={{ textAlign: 'center' }} />
            <Column header="Izin (Hari)" body={(r) => inputTemplate(r, "IZIN")} headerStyle={{ textAlign: 'center' }} />
            <Column header="Alpa (Hari)" body={(r) => inputTemplate(r, "ALPA")} headerStyle={{ textAlign: 'center' }} />

          </DataTable>
        </Card>
      )}
    </div>
  );
}