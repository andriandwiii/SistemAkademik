"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import { Toolbar } from "primereact/toolbar";
import { Dialog } from "primereact/dialog";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { ProgressSpinner } from "primereact/progressspinner";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function EntryNilaiPage() {
  const toast = useRef(null);

  // =============================== FILTERS =====================================
  const [filters, setFilters] = useState({
    TAHUN_AJARAN_ID: "",
    TINGKATAN_ID: "",
    JURUSAN_ID: "",
    KELAS_ID: "",
    KODE_MAPEL: "",
  });

  // =============================== DATA NILAI ==================================
  const [students, setStudents] = useState([]);
  const [meta, setMeta] = useState({
    kkm: 75,
    deskripsi_template: {},
    interval_predikat: {}
  });

  // =============================== MASTER OPSI ==================================
  const [opsiTahun, setOpsiTahun] = useState([]);
  const [opsiTingkat, setOpsiTingkat] = useState([]);
  const [opsiJurusan, setOpsiJurusan] = useState([]);
  const [opsiKelas, setOpsiKelas] = useState([]);
  const [opsiMapel, setOpsiMapel] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingMapel, setLoadingMapel] = useState(false);

  // =============================== EDIT FORM ====================================
  const [editDialog, setEditDialog] = useState(false);
  const [editRow, setEditRow] = useState(null);

  // ============================ LOAD MASTER DATA ===============================
  useEffect(() => {
    const loadMaster = async () => {
      try {
        const [thn, tkt, jur, trxSiswa] = await Promise.all([
          axios.get(`${API_URL}/master-tahun-ajaran`),
          axios.get(`${API_URL}/master-tingkatan`),
          axios.get(`${API_URL}/master-jurusan`),
          axios.get(`${API_URL}/transaksi-siswa`),
        ]);

        setOpsiTahun((thn.data.data || []).map((i) => ({
          label: i.NAMA_TAHUN_AJARAN,
          value: i.TAHUN_AJARAN_ID,
        })));

        setOpsiTingkat((tkt.data.data || []).map((i) => ({
          label: i.TINGKATAN,
          value: i.TINGKATAN_ID,
        })));

        setOpsiJurusan((jur.data.data || []).map((i) => ({
          label: i.NAMA_JURUSAN,
          value: i.JURUSAN_ID,
        })));

        setOpsiKelas([]);
      } catch (e) {
        console.error("Error loading master data:", e);
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: "Gagal memuat data master"
        });
      }
    };

    loadMaster();
  }, []);

  // ===================== RELOAD KELAS SAAT TAHUN BERUBAH ======================
  useEffect(() => {
    const loadKelasByTahun = async () => {
      if (!filters.TAHUN_AJARAN_ID) {
        setOpsiKelas([]);
        return;
      }

      try {
        const res = await axios.get(`${API_URL}/transaksi-siswa`);
        
        const trxFiltered = (res.data.data || []).filter(
          trx => trx.tahun_ajaran.TAHUN_AJARAN_ID === filters.TAHUN_AJARAN_ID
        );
        
        const kelasUnique = [];
        const kelasSeen = new Set();
        
        trxFiltered.forEach(trx => {
          const kelasId = trx.kelas.KELAS_ID;
          
          if (!kelasSeen.has(kelasId)) {
            kelasSeen.add(kelasId);
            kelasUnique.push({
              KELAS_ID: trx.kelas.KELAS_ID,
              TINGKATAN_ID: trx.tingkatan.TINGKATAN_ID,
              JURUSAN_ID: trx.jurusan.JURUSAN_ID,
              NAMA_RUANG: trx.kelas.NAMA_RUANG,
              GEDUNG_ID: trx.kelas.GEDUNG_ID,
              RUANG_ID: trx.kelas.RUANG_ID,
            });
          }
        });
        
        setOpsiKelas(kelasUnique);
        
      } catch (e) {
        console.error("Error loading kelas by tahun:", e);
      }
    };

    loadKelasByTahun();
  }, [filters.TAHUN_AJARAN_ID]);

  // ============== LOAD MAPEL DARI JADWAL SAAT KELAS DIPILIH ===================
  useEffect(() => {
    const loadMapelByKelas = async () => {
      if (!filters.KELAS_ID || !filters.TAHUN_AJARAN_ID) {
        setOpsiMapel([]);
        return;
      }

      setLoadingMapel(true);
      try {
        const res = await axios.get(`${API_URL}/transaksi-nilai/mapel`, {
          params: {
            kelasId: filters.KELAS_ID,
            tahunId: filters.TAHUN_AJARAN_ID
          }
        });

        if (res.data.status === "00") {
          // Build options label as "Nama Mapel (KODE)"
          const mapelOptions = (res.data.data || []).map(m => ({
            label: `${m.NAMA_MAPEL} (${m.KODE_MAPEL})`,
            value: m.KODE_MAPEL
          }));
          
          setOpsiMapel(mapelOptions);
          
          // Reset pilihan mapel jika yang sebelumnya tidak ada di list baru
          if (filters.KODE_MAPEL) {
            const exists = mapelOptions.find(m => m.value === filters.KODE_MAPEL);
            if (!exists) {
              setFilters(prev => ({ ...prev, KODE_MAPEL: "" }));
            }
          }
        } else {
          setOpsiMapel([]);
          toast.current?.show({
            severity: "info",
            summary: "Info",
            detail: "Belum ada jadwal untuk kelas ini"
          });
        }
      } catch (e) {
        console.error("Error loading mapel by kelas:", e);
        setOpsiMapel([]);
        toast.current?.show({
          severity: "warn",
          summary: "Peringatan",
          detail: "Gagal memuat mata pelajaran"
        });
      } finally {
        setLoadingMapel(false);
      }
    };

    loadMapelByKelas();
  }, [filters.KELAS_ID, filters.TAHUN_AJARAN_ID]);

  // ============================ FILTER KELAS DINAMIS ===========================
  const kelasFiltered = opsiKelas
    .filter(k => {
      const tingkatMatch = !filters.TINGKATAN_ID || k.TINGKATAN_ID === filters.TINGKATAN_ID;
      const jurusanMatch = !filters.JURUSAN_ID || k.JURUSAN_ID === filters.JURUSAN_ID;
      
      return tingkatMatch && jurusanMatch;
    })
    .map(k => ({
      label: `${k.KELAS_ID} ${k.NAMA_RUANG ? `- ${k.NAMA_RUANG}` : ''}`,
      value: k.KELAS_ID
    }));

  // ============================ LOAD NILAI ===================================
  const fetchEntryData = async () => {
    if (!filters.TAHUN_AJARAN_ID || !filters.KELAS_ID || !filters.KODE_MAPEL) {
      return;
    }

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

        toast.current?.show({
          severity: "success",
          summary: "Berhasil",
          detail: `Data dimuat. KKM: ${res.data.meta.kkm}`,
        });
      } else {
        setStudents([]);
        toast.current?.show({
          severity: "warn",
          summary: "Info",
          detail: res.data.message
        });
      }
    } catch (e) {
      console.error(e);
      setStudents([]);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Gagal memuat data nilai",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntryData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.TAHUN_AJARAN_ID, filters.KELAS_ID, filters.KODE_MAPEL]);

  // ========================== PREDIKAT DINAMIS ================================
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

  const getDeskripsi = (nilai) => {
    const pred = getPredikat(nilai);
    return meta.deskripsi_template[pred] || "-";
  };

  // ========================== UPDATE NILAI ====================================
  const onValueChange = (id, field, val) => {
    setStudents(prev =>
      prev.map(s => (s.id === id ? { ...s, [field]: val } : s))
    );
  };

  // ========================== UPDATE SATU SISWA ================================
  const updateSingle = async () => {
    try {
      await axios.put(`${API_URL}/transaksi-nilai/${editRow.id}`, editRow);

      toast.current?.show({
        severity: "success",
        summary: "Berhasil",
        detail: "Nilai berhasil diperbarui",
      });

      setEditDialog(false);
      fetchEntryData();
    } catch (e) {
      console.error(e);
      toast.current?.show({
        severity: "error",
        summary: "Gagal",
        detail: "Gagal memperbarui nilai",
      });
    }
  };

  // ============================ DELETE SATU SISWA =============================
  const deleteSingle = (row) => {
    confirmDialog({
      message: `Hapus nilai siswa ${row.nama}?`,
      header: "Konfirmasi Hapus",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await axios.delete(`${API_URL}/transaksi-nilai/${row.id}`);

          toast.current?.show({
            severity: "success",
            summary: "Berhasil",
            detail: "Nilai berhasil dihapus",
          });

          fetchEntryData();
        } catch (e) {
          console.error(e);
          toast.current?.show({
            severity: "error",
            summary: "Gagal",
            detail: "Tidak dapat menghapus nilai",
          });
        }
      },
    });
  };

  // ============================== SAVE ALL ====================================
  const saveAll = async () => {
    if (students.length === 0) {
      toast.current?.show({
        severity: "warn",
        summary: "Peringatan",
        detail: "Tidak ada data untuk disimpan"
      });
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_URL}/transaksi-nilai`, {
        students,
        kelasId: filters.KELAS_ID,
        mapelId: filters.KODE_MAPEL,
        tahunId: filters.TAHUN_AJARAN_ID,
      });

      toast.current?.show({
        severity: "success",
        summary: "Berhasil",
        detail: "Semua nilai berhasil disimpan",
      });

      fetchEntryData();
    } catch (e) {
      console.error(e);
      toast.current?.show({
        severity: "error",
        summary: "Gagal",
        detail: "Tidak dapat menyimpan nilai",
      });
    } finally {
      setLoading(false);
    }
  };

  // ============================== TEMPLATE COLUMNS =============================
  const inputTpl = (row, field) => (
    <InputNumber
      value={row[field] ?? null}
      onValueChange={(e) => onValueChange(row.id, field, e.value)}
      min={0}
      max={100}
      className="w-full"
      inputClassName="text-center"
      placeholder="0"
    />
  );

  // ---------- CHANGED: show predikat as plain text (no colors) ----------
  const predTpl = (row, field) => {
    const p = getPredikat(row[field]);
    return <span className="font-medium">{p}</span>;
  };
  // -----------------------------------------------------------------------

  const deskTpl = (row, field) => {
   return <span className="font-medium">{getDeskripsi(row[field])}</span>;
  };

  // ============================== ACTION COLUMN ===============================
  const actionTpl = (row) => (
    <div className="flex gap-2 justify-center">
      <Button
        icon="pi pi-pencil"
        severity="warning"
        size="small"
        onClick={() => {
          setEditRow({ ...row });
          setEditDialog(true);
        }}
        tooltip="Edit"
      />

      <Button
        icon="pi pi-trash"
        severity="danger"
        size="small"
        onClick={() => deleteSingle(row)}
        tooltip="Hapus"
      />
    </div>
  );

  // ----------------------------
  // Dropdown item/value template for Mapel
  // ----------------------------
  const mapelOptionTemplate = (option) => {
    if (!option) return null;
    const nama = option.label?.split(" (")[0] ?? option.label;
    return (
      <div className="flex align-items-center gap-2">
        <span>{nama}</span>
        <Tag value={option.value} severity="info" className="text-xs" />
      </div>
    );
  };

  const mapelValueTemplate = (selected) => {
    if (!selected) return <span className="text-500">Pilih Mapel</span>;
    const opt = typeof selected === "object" && selected !== null
      ? selected
      : opsiMapel.find((o) => o.value === selected);
    if (!opt) return <span>{selected}</span>;
    const nama = opt.label?.split(" (")[0] ?? opt.label;
    return (
      <div className="flex align-items-center gap-2">
        <span>{nama}</span>
        <Tag value={opt.value} severity="info" className="text-xs" />
      </div>
    );
  };

  // =============================== RENDER ====================================
  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <Toast ref={toast} />
      <ConfirmDialog />

      <h2 className="text-2xl font-bold mb-4">Entry Nilai Siswa</h2>

      {/* ============================ FILTER ============================ */}
      <div className="card mb-4 p-4 bg-white shadow-sm rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          {/* Tahun Ajaran */}
          <div className="col-span-12 md:col-span-3">
            <label className="block text-sm font-medium mb-2">Tahun Ajaran</label>
            <Dropdown
              value={filters.TAHUN_AJARAN_ID}
              options={opsiTahun}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  TAHUN_AJARAN_ID: e.value,
                  TINGKATAN_ID: "",
                  JURUSAN_ID: "",
                  KELAS_ID: "",
                  KODE_MAPEL: "",
                })
              }
              placeholder="Pilih Tahun"
              className="w-full"
              aria-label="Pilih Tahun Ajaran"
            />
          </div>

          {/* Tingkat */}
          <div className="col-span-12 md:col-span-2">
            <label className="block text-sm font-medium mb-2">Tingkat</label>
            <Dropdown
              value={filters.TINGKATAN_ID}
              options={opsiTingkat}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  TINGKATAN_ID: e.value,
                  KELAS_ID: "",
                  KODE_MAPEL: "",
                })
              }
              placeholder="Pilih Tingkat"
              className="w-full"
              aria-label="Pilih Tingkat"
            />
          </div>

          {/* Jurusan */}
          <div className="col-span-12 md:col-span-3">
            <label className="block text-sm font-medium mb-2">Jurusan</label>
            <Dropdown
              value={filters.JURUSAN_ID}
              options={opsiJurusan}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  JURUSAN_ID: e.value,
                  KELAS_ID: "",
                  KODE_MAPEL: "",
                })
              }
              placeholder="Pilih Jurusan"
              className="w-full"
              showClear
              aria-label="Pilih Jurusan"
            />
          </div>

          {/* Kelas */}
          <div className="col-span-12 md:col-span-2">
            <label className="block text-sm font-medium mb-2">Kelas</label>
            <Dropdown
              value={filters.KELAS_ID}
              options={kelasFiltered}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  KELAS_ID: e.value,
                  KODE_MAPEL: "",
                })
              }
              placeholder="Pilih Kelas"
              className="w-full"
              disabled={!filters.TAHUN_AJARAN_ID || kelasFiltered.length === 0}
              emptyMessage="Tidak ada kelas untuk tahun ini"
              aria-label="Pilih Kelas"
            />
            {filters.TAHUN_AJARAN_ID && kelasFiltered.length === 0 && (
              <p className="mt-2 text-xs text-orange-600">Kelas untuk tahun ajaran ini belum tersedia.</p>
            )}
          </div>

          {/* Mata Pelajaran */}
          <div className="col-span-12 md:col-span-2">
            <label className="block text-sm font-medium mb-2">
              Mata Pelajaran
              {loadingMapel && <i className="pi pi-spin pi-spinner ml-2 text-sm" aria-hidden />}
            </label>
            <Dropdown
              value={filters.KODE_MAPEL}
              options={opsiMapel}
              onChange={(e) => setFilters({ ...filters, KODE_MAPEL: e.value })}
              placeholder="Pilih Mapel"
              className="w-full"
              filter
              disabled={!filters.KELAS_ID || loadingMapel}
              emptyMessage="Belum ada jadwal untuk kelas ini"
              aria-label="Pilih Mata Pelajaran"
              itemTemplate={mapelOptionTemplate}
              valueTemplate={mapelValueTemplate}
            />
            {filters.KELAS_ID && !loadingMapel && opsiMapel.length === 0 && (
              <p className="mt-2 text-xs text-orange-600">Belum ada jadwal mata pelajaran untuk kelas ini.</p>
            )}
          </div>
        </div>

        {/* Info KKM */}
        {meta?.kkm && students.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-md">
            <p className="m-0 text-sm">
              <strong>KKM:</strong> {meta.kkm}
              <strong className="ml-4">Interval:</strong>
              {Object.entries(meta.interval_predikat || {}).map(([key, val], idx) => (
                <span key={key} className="inline-flex items-center ml-3 text-sm">
                  <span className="font-semibold mr-1">{key}:</span>
                  <span>{val}</span>
                </span>
              ))}
            </p>
          </div>
        )}
      </div>


      {/* =============================== TABLE ================================ */}
      {loading && (
        <div className="flex justify-center p-8">
          <ProgressSpinner />
        </div>
      )}

      {!loading && students.length > 0 && (
        <div className="card bg-white shadow-sm border-round">

          <Toolbar
            className="mb-3"
            right={
              <Button
                label="Simpan Semua"
                icon="pi pi-save"
                severity="success"
                onClick={saveAll}
                loading={loading}
              />
            }
          />

          <DataTable
            value={students}
            scrollable
            scrollHeight="600px"
            showGridlines
            stripedRows
          >
            <Column
              header="No"
              body={(d, opt) => opt.rowIndex + 1}
              style={{ width: "60px", textAlign: "center" }}
            />

            <Column
              field="nama"
              header="Nama Siswa"
              style={{ minWidth: "200px" }}
            />

            {/* PENGETAHUAN */}
            <Column header="Nilai Pengetahuan" body={(r) => inputTpl(r, "nilai_p")} style={{ width: "120px" }} />
            <Column header="Predikat" body={(r) => predTpl(r, "nilai_p")} style={{ width: "80px" }} />
            <Column header="Deskripsi" body={(r) => deskTpl(r, "nilai_p")} style={{ minWidth: "200px" }} />

            {/* KETERAMPILAN */}
            <Column header="Nilai Keterampilan" body={(r) => inputTpl(r, "nilai_k")} style={{ width: "120px" }} />
            <Column header="Predikat" body={(r) => predTpl(r, "nilai_k")} style={{ width: "80px" }} />
            <Column header="Deskripsi" body={(r) => deskTpl(r, "nilai_k")} style={{ minWidth: "200px" }} />

            {/* ACTION */}
            <Column
              header="Aksi"
              body={actionTpl}
              style={{ width: "120px" }}
            />
          </DataTable>
        </div>
      )}

      {!loading && students.length === 0 && filters.KELAS_ID && filters.KODE_MAPEL && (
        <div className="card p-6 bg-white text-center">
          <i className="pi pi-info-circle text-4xl text-gray-400 mb-3"></i>
          <p className="text-gray-600">Tidak ada data siswa atau KKM belum diatur</p>
        </div>
      )}

      {/* ============================ EDIT DIALOG ============================= */}
      <Dialog
        visible={editDialog}
        onHide={() => setEditDialog(false)}
        header="Edit Nilai Siswa"
        modal
        style={{ width: "400px" }}
      >
        {editRow && (
          <div className="flex flex-column gap-3">
            <h4 className="m-0">{editRow.nama}</h4>

            <div>
              <label className="block mb-2">Nilai Pengetahuan</label>
              <InputNumber
                className="w-full"
                value={editRow.nilai_p}
                onValueChange={(e) =>
                  setEditRow({ ...editRow, nilai_p: e.value })
                }
                min={0}
                max={100}
              />
            </div>

            <div>
              <label className="block mb-2">Nilai Keterampilan</label>
              <InputNumber
                className="w-full"
                value={editRow.nilai_k}
                onValueChange={(e) =>
                  setEditRow({ ...editRow, nilai_k: e.value })
                }
                min={0}
                max={100}
              />
            </div>

            <Button 
              label="Simpan" 
              severity="success" 
              onClick={updateSingle}
              className="w-full" 
            />
          </div>
        )}
      </Dialog>
    </div>
  );
}
