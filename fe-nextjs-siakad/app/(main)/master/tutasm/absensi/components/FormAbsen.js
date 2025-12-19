"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { ProgressSpinner } from "primereact/progressspinner";
import { Toast } from "primereact/toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const FormAbsen = ({ visible, onHide, token, userProfile, onSaveSuccess, editData }) => {
  const toast = useRef(null);
  const [loading, setLoading] = useState(false);
  
  // Master Data State
  const [kelasSiswaMap, setKelasSiswaMap] = useState(new Map());
  const [petugasOptions, setPetugasOptions] = useState([]); 

  // Selection State
  const [selectedKelas, setSelectedKelas] = useState(null);
  const [tanggal, setTanggal] = useState(new Date());
  const [siswaList, setSiswaList] = useState([]); 
  const [nipPenginput, setNipPenginput] = useState("");
  const [singleStatus, setSingleStatus] = useState("HADIR");

  const statusOptions = [
    { label: "HADIR", value: "HADIR" },
    { label: "ALPA", value: "ALPA" },
    { label: "IZIN", value: "IZIN" },
    { label: "SAKIT", value: "SAKIT" },
    { label: "MEMBOLOS", value: "MEMBOLOS" },
  ];

  // 1. Fetch Master Data
  useEffect(() => {
    if (!visible || !token) return;

    const loadInitialData = async () => {
      setLoading(true);
      try {
        const [resSiswa, resPetugas] = await Promise.all([
          fetch(`${API_URL}/transaksi-siswa`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/master-guru/petugas-tu`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        const jsonSiswa = await resSiswa.json();
        const jsonPetugas = await resPetugas.json();

        const kMap = new Map();
        if (jsonSiswa.data) {
          jsonSiswa.data.forEach((t) => {
            const kelasId = t.kelas?.KELAS_ID || t.KELAS_ID;
            if (!kelasId) return;
            if (!kMap.has(kelasId)) {
              kMap.set(kelasId, {
                TINGKATAN_ID: t.tingkatan?.TINGKATAN_ID || t.TINGKATAN_ID,
                JURUSAN_ID: t.jurusan?.JURUSAN_ID || t.JURUSAN_ID,
                siswa: []
              });
            }
            kMap.get(kelasId).siswa.push({
              NIS: t.siswa?.NIS || t.NIS,
              NAMA: t.siswa?.NAMA || t.NAMA,
              STATUS: "HADIR"
            });
          });
        }
        setKelasSiswaMap(kMap);
        setPetugasOptions(jsonPetugas.data?.map(g => ({ label: `${g.NAMA} (${g.NIP})`, value: g.NIP })) || []);
      } catch (err) {
        toast.current.show({ severity: 'error', summary: 'Error', detail: 'Gagal memuat data master' });
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [visible, token]);

  // 2. Setup Data Mode (Edit vs Masal)
  useEffect(() => {
    if (visible) {
      if (editData) {
        setTanggal(new Date(editData.TANGGAL));
        setSelectedKelas(editData.posisi?.KELAS || editData.KELAS_ID);
        setSingleStatus(editData.STATUS);
        setNipPenginput(editData.INPUT_OLEH_ID || "");
      } else {
        setTanggal(new Date());
        setSelectedKelas(null);
        setSiswaList([]);
        if (userProfile) {
          const nip = userProfile.nip || userProfile.NIP || userProfile.id;
          setNipPenginput(nip || "");
        }
      }
    }
  }, [visible, editData, userProfile]);

  const kelasOptions = useMemo(() => {
    return Array.from(kelasSiswaMap.keys()).map(k => ({ label: k, value: k }));
  }, [kelasSiswaMap]);

  const handleKelasChange = (kelasId) => {
    setSelectedKelas(kelasId);
    if (!editData) { 
      const data = kelasSiswaMap.get(kelasId);
      setSiswaList(data ? data.siswa.map(s => ({ ...s })) : []);
    }
  };

  const handleSubmit = async () => {
    if (editData) {
        if (!selectedKelas) return toast.current.show({ severity: 'warn', detail: 'Kelas harus dipilih!' });
    } else {
        if (!selectedKelas || !nipPenginput) return toast.current.show({ severity: 'warn', detail: 'Lengkapi kelas dan petugas!' });
        if (siswaList.length === 0) return toast.current.show({ severity: 'warn', detail: 'Daftar siswa kosong!' });
    }

    setLoading(true);
    try {
      let res;
      // Perbaikan Format Tanggal (Safe dari timezone shift)
      const tglStr = `${tanggal.getFullYear()}-${String(tanggal.getMonth() + 1).padStart(2, '0')}-${String(tanggal.getDate()).padStart(2, '0')}`;

      if (editData) {
        res = await fetch(`${API_URL}/tu-absensi/monitoring/${editData.ABSENSI_ID}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            STATUS: singleStatus,
            TANGGAL: tglStr,
            KELAS_ID: selectedKelas,
            ROLE: "TU"
          }),
        });
      } else {
        const infoKelas = kelasSiswaMap.get(selectedKelas);
        res = await fetch(`${API_URL}/tu-absensi/masal`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            tanggal: tglStr,
            kelasId: selectedKelas,
            tingkatanId: infoKelas.TINGKATAN_ID,
            inputOlehId: nipPenginput,
            dataAbsen: siswaList,
          }),
        });
      }

      const json = await res.json();
      if (json.status === "00") {
        toast.current.show({ severity: 'success', summary: 'Berhasil', detail: 'Data disimpan' });
        onSaveSuccess();
        onHide();
      } else {
        throw new Error(json.message);
      }
    } catch (error) {
      toast.current.show({ severity: 'error', summary: 'Gagal', detail: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toast ref={toast} />
      <Dialog 
        header={editData ? `Edit Absensi: ${editData.siswa?.NAMA || 'Siswa'}` : "Input Absensi Masal"} 
        visible={visible} 
        style={{ width: editData ? "30vw" : "65vw" }} 
        modal 
        onHide={onHide}
        footer={
          <div className="flex justify-content-end gap-2">
            <Button label="Batal" icon="pi pi-times" onClick={onHide} className="p-button-text p-button-secondary" />
            <Button label={editData ? "Update" : "Simpan Masal"} icon="pi pi-check" onClick={handleSubmit} loading={loading} className="p-button-primary" />
          </div>
        }
      >
        <div className="p-fluid grid mt-2">
          <div className={editData ? "col-12 mb-2" : "col-12 md:col-4 mb-2"}>
            <label className="font-bold mb-2 block text-900">Tanggal</label>
            <Calendar value={tanggal} onChange={(e) => setTanggal(e.value)} dateFormat="yy-mm-dd" showIcon />
          </div>

          <div className={editData ? "col-12 mb-2" : "col-12 md:col-4 mb-2"}>
            <label className="font-bold mb-2 block text-900">Kelas</label>
            <Dropdown value={selectedKelas} options={kelasOptions} onChange={(e) => handleKelasChange(e.value)} placeholder="-- Pilih Kelas --" filter />
          </div>

          {editData ? (
            <div className="col-12 mb-2">
              <label className="font-bold mb-2 block text-primary">Status Kehadiran</label>
              <Dropdown value={singleStatus} options={statusOptions} onChange={(e) => setSingleStatus(e.value)} />
            </div>
          ) : (
            <div className="col-12 md:col-4 mb-2">
              <label className="font-bold mb-2 block text-primary">Petugas Penginput</label>
              <Dropdown value={nipPenginput} options={petugasOptions} onChange={(e) => setNipPenginput(e.value)} filter placeholder="Petugas" />
            </div>
          )}
        </div>

        {!editData && (
          <div className="mt-4 border-top-1 border-300 pt-3">
            <h5 className="mb-3 text-700"><i className="pi pi-users mr-2"></i>Daftar Siswa</h5>
            <DataTable value={siswaList} size="small" scrollable scrollHeight="350px" className="p-datatable-gridlines shadow-1" emptyMessage="Pilih kelas untuk melihat daftar siswa.">
              <Column field="NIS" header="NIS" style={{ width: "25%" }} />
              <Column field="NAMA" header="Nama Siswa" style={{ width: "45%" }} />
              <Column header="Status" body={(rowData) => (
                  <Dropdown 
                    value={rowData.STATUS} 
                    options={statusOptions} 
                    onChange={(e) => {
                      setSiswaList(prev => prev.map(s => s.NIS === rowData.NIS ? { ...s, STATUS: e.value } : s));
                    }} 
                  />
              )} style={{ width: "30%" }} />
            </DataTable>
          </div>
        )}
      </Dialog>
    </>
  );
};

export default FormAbsen;