"use client";

import React, { useState, useEffect, useRef } from "react";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { ProgressSpinner } from "primereact/progressspinner";
import { Card } from "primereact/card";
import { Divider } from "primereact/divider";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Helper function untuk fetch dengan axios-like interface
const apiCall = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  return {
    data: await response.json()
  };
};

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
  const [isTableVisible, setIsTableVisible] = useState(false);

  // ============================ LOAD MASTER DATA ===============================
  useEffect(() => {
    const loadMaster = async () => {
      try {
        const [thn, tkt, jur] = await Promise.all([
          apiCall(`${API_URL}/master-tahun-ajaran`),
          apiCall(`${API_URL}/master-tingkatan`),
          apiCall(`${API_URL}/master-jurusan`),
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
        const res = await apiCall(`${API_URL}/transaksi-siswa`);
        
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
        const params = new URLSearchParams({
          kelasId: filters.KELAS_ID,
          tahunId: filters.TAHUN_AJARAN_ID
        });
        
        const res = await apiCall(`${API_URL}/transaksi-nilai/mapel?${params}`);

        if (res.data.status === "00") {
          const mapelOptions = (res.data.data || []).map(m => ({
            label: `${m.NAMA_MAPEL} (${m.KODE_MAPEL})`,
            value: m.KODE_MAPEL
          }));
          
          setOpsiMapel(mapelOptions);
          
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
      toast.current?.show({
        severity: "warn",
        summary: "Peringatan",
        detail: "Lengkapi filter terlebih dahulu"
      });
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        kelasId: filters.KELAS_ID,
        mapelId: filters.KODE_MAPEL,
        tahunId: filters.TAHUN_AJARAN_ID,
      });
      
      const res = await apiCall(`${API_URL}/transaksi-nilai?${params}`);

      if (res.data.status === "00") {
        setStudents(res.data.data);
        setMeta(res.data.meta);
        setIsTableVisible(true);

        toast.current?.show({
          severity: "success",
          summary: "Berhasil",
          detail: `Data dimuat. KKM: ${res.data.meta.kkm}`,
        });
      } else {
        setStudents([]);
        setIsTableVisible(false);
        toast.current?.show({
          severity: "warn",
          summary: "Info",
          detail: res.data.message
        });
      }
    } catch (e) {
      console.error(e);
      setStudents([]);
      setIsTableVisible(false);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Gagal memuat data nilai",
      });
    } finally {
      setLoading(false);
    }
  };

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

  // ============================ DELETE SATU SISWA =============================
  const deleteSingle = (row) => {
    confirmDialog({
      message: `Hapus nilai siswa ${row.nama}?`,
      header: "Konfirmasi Hapus",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await apiCall(`${API_URL}/transaksi-nilai/${row.id}`, {
            method: 'DELETE'
          });

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
      await apiCall(`${API_URL}/transaksi-nilai`, {
        method: 'POST',
        body: JSON.stringify({
          students,
          kelasId: filters.KELAS_ID,
          mapelId: filters.KODE_MAPEL,
          tahunId: filters.TAHUN_AJARAN_ID,
        })
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

  // ============================== HELPER: Save Single Grade =============================
  const saveGrades = async (rowData) => {
    try {
      const payload = {
        students: [
          {
            id: rowData.id,
            nilai_p: rowData.nilai_p === '' ? null : Number(rowData.nilai_p),
            nilai_k: rowData.nilai_k === '' ? null : Number(rowData.nilai_k)
          }
        ],
        kelasId: filters.KELAS_ID,
        mapelId: filters.KODE_MAPEL,
        tahunId: filters.TAHUN_AJARAN_ID
      };

      const res = await apiCall(`${API_URL}/transaksi-nilai`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      if (res.data?.status === '00') {
        toast.current?.show({
          severity: "success",
          summary: "Berhasil",
          detail: `Nilai siswa ${rowData.nama} berhasil disimpan!`,
        });
        fetchEntryData();
      } else {
        toast.current?.show({
          severity: "error",
          summary: "Gagal",
          detail: res.data?.message || 'Gagal menyimpan nilai',
        });
      }
    } catch (err) {
      console.error('Error save single:', err);
      toast.current?.show({
        severity: "error",
        summary: "Gagal",
        detail: 'Gagal menyimpan nilai',
      });
    }
  };

  // ============================== TEMPLATE COLUMNS =============================
  const nilaiTemplate = (row, field) => (
    <input
      type="text"
      value={row[field] ?? ''}
      onChange={(e) => {
        const val = e.target.value;
        if (val !== '' && isNaN(val)) return;
        if (val !== '' && (Number(val) < 0 || Number(val) > 100)) return;
        onValueChange(row.id, field, val === '' ? '' : val);
      }}
      className="p-inputtext p-component w-full text-center"
      placeholder="0"
    />
  );

  const predTpl = (row, field) => {
    const p = getPredikat(row[field]);
    return <span className="font-medium">{p}</span>;
  };

  const deskTpl = (row, field) => {
   return <span className="font-medium">{getDeskripsi(row[field])}</span>;
  };

  // ============================== ACTION COLUMN ===============================
  const actionTpl = (row) => (
    <div className="flex gap-2">
      <Button
        icon="pi pi-save"
        size="small"
        onClick={() => saveGrades(row)}
        tooltip="Simpan"
      />

      <Button
        icon="pi pi-trash"
        size="small"
        className="p-button-danger"
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

  const getSelectedMapelLabel = () => {
    const sel = filters.KODE_MAPEL;
    if (!sel) return '';
    const found = opsiMapel.find(o => o.value === sel);
    if (found) {
      const match = String(found.label).match(/^(.*)\s+\((.*)\)$/);
      return match ? `${match[1]} (${match[2]})` : String(found.label);
    }
    return String(sel);
  };

  // =============================== RENDER ====================================
  return (
    <div className="grid justify-content-center">
      <Toast ref={toast} />
      <ConfirmDialog />

      <div className="col-12 md:col-11">
        <Card className="mb-4 shadow-1">
          <h5 className="font-bold text-900">Entry Nilai Siswa</h5>
          <p className="text-sm text-500 mb-3">
            Pilih filter di bawah untuk menampilkan data nilai siswa. Klik &quot;Tampilkan Tabel&quot; untuk memuat data.
          </p>
          <Divider />

          <div className="p-fluid formgrid grid">
            {/* Tahun Ajaran */}
            <div className="field col-12 md:col-2">
              <label className="font-medium">Tahun Ajaran</label>
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
                aria-label="Pilih Tahun Ajaran"
              />
            </div>

            {/* Tingkat */}
            <div className="field col-12 md:col-2">
              <label className="font-medium">Tingkat</label>
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
                showClear
                aria-label="Pilih Tingkat"
              />
            </div>

            {/* Jurusan */}
            <div className="field col-12 md:col-2">
              <label className="font-medium">Jurusan</label>
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
                showClear
                aria-label="Pilih Jurusan"
              />
            </div>

            {/* Kelas */}
            <div className="field col-12 md:col-2">
              <label className="font-medium">Kelas</label>
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
                disabled={!filters.TAHUN_AJARAN_ID || kelasFiltered.length === 0}
                emptyMessage="Tidak ada kelas untuk tahun ini"
                aria-label="Pilih Kelas"
              />
              {filters.TAHUN_AJARAN_ID && kelasFiltered.length === 0 && (
                <small className="text-orange-600">Kelas untuk tahun ajaran ini belum tersedia.</small>
              )}
            </div>

            {/* Mata Pelajaran */}
            <div className="field col-12 md:col-3">
              <label className="font-medium">
                Mata Pelajaran
                {loadingMapel && <i className="pi pi-spin pi-spinner ml-2 text-sm" aria-hidden />}
              </label>
              <Dropdown
                value={filters.KODE_MAPEL}
                options={opsiMapel}
                onChange={(e) => setFilters({ ...filters, KODE_MAPEL: e.value })}
                placeholder="Pilih Mapel"
                filter
                disabled={!filters.KELAS_ID || loadingMapel}
                emptyMessage="Belum ada jadwal untuk kelas ini"
                aria-label="Pilih Mata Pelajaran"
                itemTemplate={mapelOptionTemplate}
                valueTemplate={mapelValueTemplate}
              />
              {filters.KELAS_ID && !loadingMapel && opsiMapel.length === 0 && (
                <small className="text-orange-600">Belum ada jadwal mata pelajaran untuk kelas ini.</small>
              )}
            </div>
          </div>

          <div className="flex justify-content-end gap-2 mt-4">
            <Button 
              label="Bersihkan" 
              icon="pi pi-times" 
              outlined 
              onClick={() => {
                setFilters({ 
                  TAHUN_AJARAN_ID: '', 
                  TINGKATAN_ID: '', 
                  JURUSAN_ID: '', 
                  KELAS_ID: '', 
                  KODE_MAPEL: '' 
                });
                setStudents([]);
                setIsTableVisible(false);
              }} 
            />
            <Button 
              label="Tampilkan Tabel" 
              icon="pi pi-check" 
              onClick={fetchEntryData}
              disabled={!filters.TAHUN_AJARAN_ID || !filters.KELAS_ID || !filters.KODE_MAPEL}
            />
          </div>

          {/* Info KKM */}
          {meta?.kkm && students.length > 0 && isTableVisible && (
            <>
              <Divider className="my-3" />
              <div className="p-3 bg-blue-50 border-round">
                <p className="m-0 text-sm">
                  <strong>KKM:</strong> {meta.kkm}
                  <strong className="ml-4">Interval:</strong>
                  {Object.entries(meta.interval_predikat || {}).map(([key, val]) => (
                    <span key={key} className="inline-flex items-center ml-3 text-sm">
                      <span className="font-semibold mr-1">{key}:</span>
                      <span>{val}</span>
                    </span>
                  ))}
                </p>
              </div>
            </>
          )}
        </Card>
      </div>

      {/* =============================== TABLE ================================ */}
      {loading && (
        <div className="col-12 md:col-11">
          <div className="flex justify-content-center p-8">
            <ProgressSpinner />
          </div>
        </div>
      )}

      {!loading && isTableVisible && students.length > 0 && (
        <div className="col-12 md:col-11">
          <Card className="shadow-1">
            <h5 className="font-bold text-900">
              Tabel Nilai ({filters.KELAS_ID} - {getSelectedMapelLabel()})
            </h5>
            <p className="text-sm text-500 mb-3">
              Isi nilai angka untuk setiap siswa, predikat dan deskripsi akan muncul otomatis.
            </p>
            <Divider className="my-2" />

            <div className="flex justify-content-end mb-3">
              <Button
                label="Simpan Semua"
                icon="pi pi-save"
                severity="success"
                onClick={saveAll}
                loading={loading}
              />
            </div>

            <DataTable
              value={students.map((s, idx) => ({
                ...s,
                no: idx + 1,
                namaSiswa: s.nama || s.NAMA || s.namaSiswa || 'Tanpa Nama'
              }))}
              scrollable
              scrollHeight="600px"
              showGridlines
              stripedRows
              paginator
              rows={10}
              rowsPerPageOptions={[10, 20, 50]}
            >
              <Column
                field="no"
                header="No."
                style={{ width: "50px" }}
              />

              <Column
                field="namaSiswa"
                header="Nama Siswa"
                style={{ minWidth: "150px" }}
              />

              {/* PENGETAHUAN */}
              <Column header="Angka (Pengetahuan)" body={(r) => nilaiTemplate(r, "nilai_p")} style={{ width: "100px" }} />
              <Column field="predikat_p" header="Predikat (Pengetahuan)" body={(r) => predTpl(r, "nilai_p")} style={{ width: "80px" }} />
              <Column field="deskripsi_p" header="Deskripsi (Pengetahuan)" body={(r) => deskTpl(r, "nilai_p")} style={{ minWidth: "200px" }} />

              {/* KETERAMPILAN */}
              <Column header="Angka (Keterampilan)" body={(r) => nilaiTemplate(r, "nilai_k")} style={{ width: "100px" }} />
              <Column field="predikat_k" header="Predikat (Keterampilan)" body={(r) => predTpl(r, "nilai_k")} style={{ width: "80px" }} />
              <Column field="deskripsi_k" header="Deskripsi (Keterampilan)" body={(r) => deskTpl(r, "nilai_k")} style={{ minWidth: "200px" }} />

              {/* ACTION */}
              <Column
                header="Aksi"
                body={actionTpl}
                style={{ width: "120px" }}
              />
            </DataTable>
          </Card>
        </div>
      )}

      {!loading && isTableVisible && students.length === 0 && (
        <div className="col-12 md:col-11">
          <Card className="p-6 text-center">
            <i className="pi pi-info-circle text-4xl text-gray-400 mb-3"></i>
            <p className="text-gray-600">Tidak ada data siswa atau KKM belum diatur</p>
          </Card>
        </div>
      )}
    </div>
  );
}