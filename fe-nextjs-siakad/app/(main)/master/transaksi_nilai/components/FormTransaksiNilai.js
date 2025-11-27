"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { ColumnGroup } from "primereact/columngroup";
import { Row } from "primereact/row";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import { Toolbar } from "primereact/toolbar";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function EntryNilaiPage() {
  const toast = useRef(null);

  // FIXED — STATE FILTER
  const [filters, setFilters] = useState({
    TAHUN_AJARAN_ID: "",
    TINGKATAN_ID: "",
    JURUSAN_ID: "",
    KELAS_ID: "",
    KODE_MAPEL: "",
  });

  // DATA
  const [students, setStudents] = useState([]);
  const [meta, setMeta] = useState({
    kkm: 0,
    deskripsi_template: { A: "-", B: "-", C: "-", D: "-" },
  });

  const [loading, setLoading] = useState(false);

  // OPSI DROPDOWN
  const [opsiTahun, setOpsiTahun] = useState([]);
  const [opsiTingkat, setOpsiTingkat] = useState([]);
  const [opsiJurusan, setOpsiJurusan] = useState([]);
  const [opsiKelas, setOpsiKelas] = useState([]);
  const [opsiMapel, setOpsiMapel] = useState([]);

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
          resMapel,
        ] = await Promise.all([
          axios.get(`${API_URL}/master-tahun-ajaran`),
          axios.get(`${API_URL}/master-tingkatan`),
          axios.get(`${API_URL}/master-jurusan`),
          axios.get(`${API_URL}/master-kelas`),
          axios.get(`${API_URL}/master-mata-pelajaran`),
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

        // FIXED — KELAS STORE AS RAW LIST
        setOpsiKelas(resKelas.data.data);

        setOpsiMapel(resMapel.data.data.map(i => ({
          label: i.NAMA_MAPEL,
          value: i.KODE_MAPEL
        })));

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
      label: `${k.NAMA_KELAS}`,
      value: k.KELAS_ID
    }));

  // ========================================================
  // 2. FETCH ENTRY NILAI (TRIGGER ONLY WHEN NEEDED)
  // ========================================================
  useEffect(() => {
    if (filters.TAHUN_AJARAN_ID && filters.KELAS_ID && filters.KODE_MAPEL) {
      fetchEntryData();
    }
  }, [filters.TAHUN_AJARAN_ID, filters.KELAS_ID, filters.KODE_MAPEL]);

  const fetchEntryData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/transaksi-nilai`, {
        params: {
          kelasId: filters.KELAS_ID,
          mapelId: filters.KODE_MAPEL,
          tahunId: filters.TAHUN_AJARAN_ID,
        },
      });

      if (res.data.status === "00") {
        setStudents(res.data.data);
        setMeta(res.data.meta);

        toast.current.show({
          severity: "success",
          summary: "Data Dimuat",
          detail: `KKM: ${res.data.meta.kkm}`
        });
      } else {
        setStudents([]);
        toast.current.show({
          severity: "warn",
          summary: "Info",
          detail: res.data.message
        });
      }
    } catch (error) {
      console.error(error);
      setStudents([]);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Gagal mengambil data nilai"
      });
    }
    setLoading(false);
  };

  // ========================================================
  // 3. REAKTIF PREDIKAT (SAMA DENGAN BACKEND)
  // ========================================================
  const getPredikat = (nilai) => {
    if (nilai === null || nilai === "" || nilai === undefined) return "-";

    const kkm = parseFloat(meta.kkm);
    const val = parseFloat(nilai);
    const interval = (100 - kkm) / 3;

    if (val < kkm) return "D";
    if (val < kkm + interval) return "C";
    if (val < kkm + interval * 2) return "B";
    return "A";
  };

  const getDeskripsiText = (predikat) => {
    return meta.deskripsi_template[predikat] || "-";
  };

  // ========================================================
  // 4. HANDLE INPUT
  // ========================================================
  const onValueChange = (id, field, val) => {
    setStudents(prev =>
      prev.map(s => (s.id === id ? { ...s, [field]: val } : s))
    );
  };

  // ========================================================
  // 5. SIMPAN NILAI
  // ========================================================
  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = {
        kelasId: filters.KELAS_ID,
        mapelId: filters.KODE_MAPEL,
        tahunId: filters.TAHUN_AJARAN_ID,
        students: students
      };

      const res = await axios.post(`${API_URL}/transaksi-nilai`, payload);

      if (res.data.status === "00") {
        toast.current.show({
          severity: "success",
          summary: "Berhasil",
          detail: "Nilai berhasil disimpan"
        });
        fetchEntryData();
      }
    } catch (error) {
      console.error(error);
      toast.current.show({
        severity: "error",
        summary: "Gagal",
        detail: "Gagal menyimpan nilai"
      });
    }
    setLoading(false);
  };

  // ========================================================
  // 6. TABLE TEMPLATE
  // ========================================================
  const inputTemplate = (row, field) => (
    <InputNumber
      value={row[field] ?? null}
      onValueChange={(e) => onValueChange(row.id, field, e.value)}
      min={0}
      max={100}
      useGrouping={false}
      className="w-full"
      inputClassName="text-center font-semibold"
      placeholder="0"
    />
  );

  const predikatTemplate = (row, field) => {
    const pred = getPredikat(row[field]);

    return (
      <Tag
        value={pred}
        severity={
          pred === "A" ? "success" :
          pred === "B" ? "info" :
          pred === "C" ? "warning" :
          pred === "D" ? "danger" : null
        }
      />
    );
  };

  const deskripsiTemplate = (row, field) => {
    const pred = getPredikat(row[field]);
    return getDeskripsiText(pred);
  };

  // ========================================================
  // RENDER
  // ========================================================
  return (
    <div className="p-4">
      
      <Toast ref={toast} />

      {/* FILTER */}
      <div className="card p-4 mb-3">
        <div className="grid formgrid">
          
          <div className="field col-3">
            <label>Tahun Ajaran</label>
            <Dropdown
              value={filters.TAHUN_AJARAN_ID}
              options={opsiTahun}
              onChange={(e) => setFilters({ ...filters, TAHUN_AJARAN_ID: e.value })}
            />
          </div>

          <div className="field col-2">
            <label>Tingkat</label>
            <Dropdown
              value={filters.TINGKATAN_ID}
              options={opsiTingkat}
              onChange={(e) => setFilters({ ...filters, TINGKATAN_ID: e.value, KELAS_ID: "" })}
            />
          </div>

          <div className="field col-3">
            <label>Jurusan</label>
            <Dropdown
              value={filters.JURUSAN_ID}
              options={opsiJurusan}
              onChange={(e) => setFilters({ ...filters, JURUSAN_ID: e.value, KELAS_ID: "" })}
              showClear
            />
          </div>

          <div className="field col-2">
            <label>Kelas</label>
            <Dropdown
              value={filters.KELAS_ID}
              options={kelasFiltered}
              onChange={(e) => setFilters({ ...filters, KELAS_ID: e.value })}
            />
          </div>

          <div className="field col-2">
            <label>Mapel</label>
            <Dropdown
              value={filters.KODE_MAPEL}
              options={opsiMapel}
              onChange={(e) => setFilters({ ...filters, KODE_MAPEL: e.value })}
              filter
            />
          </div>

        </div>
      </div>

      {/* TABLE */}
      {students.length > 0 && (
        <div className="card p-3">
          <Toolbar 
            className="mb-3"
            right={
              <Button label="Simpan" icon="pi pi-save" severity="success" onClick={handleSave} loading={loading} />
            }
          />

          <DataTable value={students} showGridlines>
            
            <Column header="No" body={(d, o) => o.rowIndex + 1} />

            <Column header="Nama Siswa" field="nama" />

            <Column header="P(Nilai)" body={(r) => inputTemplate(r, "nilai_p")} />
            <Column header="P(Pred)" body={(r) => predikatTemplate(r, "nilai_p")} />
            <Column header="P(Deskripsi)" body={(r) => deskripsiTemplate(r, "nilai_p")} />

            <Column header="K(Nilai)" body={(r) => inputTemplate(r, "nilai_k")} />
            <Column header="K(Pred)" body={(r) => predikatTemplate(r, "nilai_k")} />
            <Column header="K(Deskripsi)" body={(r) => deskripsiTemplate(r, "nilai_k")} />

          </DataTable>
        </div>
      )}

    </div>
  );
}
