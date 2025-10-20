"use client";

import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";

/**
 * Komponen FormKelas — digunakan untuk menambah atau mengedit data kelas.
 * Mengambil data dropdown dari API (ruang, jurusan, gedung, tingkatan).
 */
const FormKelas = ({ visible, onHide, onSave, selectedKelas, token }) => {
  // State utama form
  const [ruangId, setRuangId] = useState(null);
  const [tingkatanId, setTingkatanId] = useState(null);
  const [jurusanId, setJurusanId] = useState(null);
  const [gedungId, setGedungId] = useState(null);

  // List dropdown
  const [jurusanList, setJurusanList] = useState([]);
  const [gedungList, setGedungList] = useState([]);
  const [tingkatanList, setTingkatanList] = useState([]);
  const [ruangList, setRuangList] = useState([]);

  // Loading state (biar UX lebih halus)
  const [loading, setLoading] = useState(false);

  // Ambil URL dari .env.local
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Reset atau isi ulang form saat dialog dibuka
  useEffect(() => {
    if (selectedKelas) {
      setRuangId(selectedKelas.RUANG_ID || null);
      setTingkatanId(selectedKelas.TINGKATAN_ID || null);
      setJurusanId(selectedKelas.JURUSAN_ID || null);
      setGedungId(selectedKelas.GEDUNG_ID || null);
    } else if (visible) {
      setRuangId(null);
      setTingkatanId(null);
      setJurusanId(null);
      setGedungId(null);
    }
  }, [selectedKelas, visible]);

  // Fetch semua data dropdown saat token tersedia
  useEffect(() => {
    if (token) {
      fetchAllDropdowns();
    }
  }, [token]);

  // Fungsi untuk ambil semua data dropdown paralel (lebih cepat)
  const fetchAllDropdowns = async () => {
    try {
      setLoading(true);

      const [ruangRes, jurusanRes, gedungRes, tingkatanRes] = await Promise.all([
        fetch(`${API_URL}/master-ruang`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/master-jurusan`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/master-gedung`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/master-tingkatan`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const [ruangJson, jurusanJson, gedungJson, tingkatanJson] = await Promise.all([
        ruangRes.json(),
        jurusanRes.json(),
        gedungRes.json(),
        tingkatanRes.json(),
      ]);

      setRuangList(ruangJson.data || []);
      setJurusanList(jurusanJson.data || []);
      setGedungList(gedungJson.data || []);
      setTingkatanList(tingkatanJson.data || []);
    } catch (error) {
      console.error("Gagal mengambil data dropdown:", error);
    } finally {
      setLoading(false);
    }
  };

  // Kirim data ke parent saat simpan
  const handleSubmit = () => {
    const data = {
      ruang_id: ruangId,
      jurusan_id: jurusanId,
      gedung_id: gedungId,
      tingkatan_id: tingkatanId,
    };
    onSave(data);
  };

  return (
    <Dialog
      header={selectedKelas ? "Edit Kelas" : "Tambah Kelas"}
      visible={visible}
      style={{ width: "30vw" }}
      modal
      onHide={onHide}
      dismissableMask
    >
      <div className="p-fluid">
        {/* Nama Kelas */}
        <div className="field">
          <label htmlFor="ruang">Nama Kelas</label>
          <Dropdown
            id="ruang"
            value={ruangId}
            options={ruangList.map((r) => ({
              label: r.NAMA_RUANG,
              value: r.RUANG_ID,
            }))}
            onChange={(e) => setRuangId(e.value)}
            placeholder="Pilih Nama Kelas"
            filter
            showClear
            loading={loading}
          />
        </div>

        {/* Jurusan */}
        <div className="field">
          <label htmlFor="jurusan">Jurusan</label>
          <Dropdown
            id="jurusan"
            value={jurusanId}
            options={jurusanList.map((j) => ({
              label: j.NAMA_JURUSAN,
              value: j.JURUSAN_ID,
            }))}
            onChange={(e) => setJurusanId(e.value)}
            placeholder="Pilih Jurusan"
            filter
            showClear
            loading={loading}
          />
        </div>

        {/* Gedung */}
        <div className="field">
          <label htmlFor="gedung">Gedung</label>
          <Dropdown
            id="gedung"
            value={gedungId}
            options={gedungList.map((g) => ({
              label: g.NAMA_GEDUNG,
              value: g.GEDUNG_ID,
            }))}
            onChange={(e) => setGedungId(e.value)}
            placeholder="Pilih Gedung"
            filter
            showClear
            loading={loading}
          />
        </div>

        {/* Tingkatan */}
        <div className="field">
          <label htmlFor="tingkatan">Tingkatan</label>
          <Dropdown
            id="tingkatan"
            value={tingkatanId}
            options={tingkatanList.map((t) => ({
              label: t.TINGKATAN,
              value: t.TINGKATAN_ID,
            }))}
            onChange={(e) => setTingkatanId(e.value)}
            placeholder="Pilih Tingkatan"
            filter
            showClear
            loading={loading}
          />
        </div>

        {/* Tombol aksi */}
        <div className="flex justify-content-end gap-2 mt-3">
          <Button
            label="Batal"
            icon="pi pi-times"
            className="p-button-text"
            onClick={onHide}
          />
          <Button
            label="Simpan"
            icon="pi pi-check"
            onClick={handleSubmit}
            disabled={loading || !ruangId || !jurusanId || !gedungId || !tingkatanId}
          />
        </div>
      </div>
    </Dialog>
  );
};

export default FormKelas;
