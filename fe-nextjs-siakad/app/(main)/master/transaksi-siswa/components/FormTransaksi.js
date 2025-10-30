"use client";

import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";

/**
 * FormTransaksi Component
 * Komponen untuk menambah & mengedit data transaksi
 */
const FormTransaksi = ({
  visible,
  onHide,
  onSave,
  selectedTransaksi,
  token,
  transaksiList,
}) => {
  const [transaksiId, setTransaksiId] = useState("");
  const [nis, setNis] = useState(null);
  const [tingkatanId, setTingkatanId] = useState(null);
  const [jurusanId, setJurusanId] = useState(null);
  const [kelasId, setKelasId] = useState(null);
  const [tahunAjaranId, setTahunAjaranId] = useState(null);

  const [siswaOptions, setSiswaOptions] = useState([]);
  const [tingkatanOptions, setTingkatanOptions] = useState([]);
  const [jurusanOptions, setJurusanOptions] = useState([]);
  const [kelasOptions, setKelasOptions] = useState([]);
  const [tahunAjaranOptions, setTahunAjaranOptions] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Generate ID Transaksi otomatis (untuk mode tambah)
  const generateTransaksiId = () => {
    if (!transaksiList || transaksiList.length === 0) {
      return "TRXS000001";
    }

    // Ambil transaksi terakhir
    const lastTransaksi = transaksiList[0]; // Asumsi list sudah diurutkan desc
    const lastId = lastTransaksi?.TRANSAKSI_ID || "TRXS000000";

    // Extract angka dari ID terakhir
    const numericPart = parseInt(lastId.replace("TRXS", ""), 10);
    const nextNumber = isNaN(numericPart) ? 1 : numericPart + 1;

    // Format: TRXS + angka 6 digit
    return `TRXS${nextNumber.toString().padStart(6, "0")}`;
  };

  // Inisialisasi form setiap kali dialog dibuka
  useEffect(() => {
    const initForm = async () => {
      if (!visible) return;

      setLoadingData(true);
      await Promise.all([
        fetchSiswa(),
        fetchTingkatan(),
        fetchJurusan(),
        fetchKelas(),
        fetchTahunAjaran(),
      ]);
      setLoadingData(false);

      if (selectedTransaksi) {
        // Jika Edit
        setTransaksiId(selectedTransaksi.TRANSAKSI_ID || "");
        setNis(selectedTransaksi.siswa?.NIS || null);
        setTingkatanId(selectedTransaksi.tingkatan?.TINGKATAN_ID || null);
        setJurusanId(selectedTransaksi.jurusan?.JURUSAN_ID || null);
        setKelasId(selectedTransaksi.kelas?.KELAS_ID || null);
        setTahunAjaranId(
          selectedTransaksi.tahun_ajaran?.TAHUN_AJARAN_ID || null
        );
      } else {
        // Mode TAMBAH - Generate ID otomatis
        const newId = generateTransaksiId();
        setTransaksiId(newId);
        setNis(null);
        setTingkatanId(null);
        setJurusanId(null);
        setKelasId(null);
        setTahunAjaranId(null);
      }
    };

    initForm();
  }, [visible, selectedTransaksi, token, transaksiList]);

  // === Fetch Data dari API ===
  const fetchSiswa = async () => {
    try {
      const res = await fetch(`${API_URL}/siswa`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      console.log("Data siswa dari API:", json);
      
      let siswaData = json.data || json || [];

      // Filter siswa yang sudah ada di transaksi (kecuali yang sedang diedit)
      const usedNis = transaksiList.map((t) => t.siswa?.NIS);
      const currentNis = selectedTransaksi?.siswa?.NIS;

      const filtered = siswaData.filter(
        (s) => !usedNis.includes(s.NIS) || s.NIS === currentNis
      );
      
      siswaData.sort((a, b) => (a.NAMA || "").localeCompare(b.NAMA || ""));

      const options = siswaData.map((s) => ({
        label: `${s.NIS} | ${s.NAMA}`,
        value: s.NIS,
      }));

      console.log("Siswa options:", options);
      setSiswaOptions(options);
    } catch (err) {
      console.error("Gagal fetch siswa:", err);
    }
  };

  const fetchTingkatan = async () => {
    try {
      const res = await fetch(`${API_URL}/master-tingkatan`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      const data = json.data || [];

      setTingkatanOptions(
        data.map((t) => ({
          label: t.TINGKATAN,
          value: t.TINGKATAN_ID,
        }))
      );
    } catch (err) {
      console.error("Gagal fetch tingkatan:", err);
    }
  };

  const fetchJurusan = async () => {
    try {
      const res = await fetch(`${API_URL}/master-jurusan`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      const data = json.data || [];

      setJurusanOptions(
        data.map((j) => ({
          label: j.NAMA_JURUSAN,
          value: j.JURUSAN_ID,
        }))
      );
    } catch (err) {
      console.error("Gagal fetch jurusan:", err);
    }
  };

  const fetchKelas = async () => {
    try {
      const res = await fetch(`${API_URL}/master-kelas`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      const data = json.data || [];

      setKelasOptions(data);
    } catch (err) {
      console.error("Gagal fetch kelas:", err);
    }
  };

  const fetchTahunAjaran = async () => {
    try {
      const res = await fetch(`${API_URL}/master-tahun-ajaran`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      const data = json.data || [];

      setTahunAjaranOptions(
        data.map((ta) => ({
          label: ta.NAMA_TAHUN_AJARAN,
          value: ta.TAHUN_AJARAN_ID,
        }))
      );
    } catch (err) {
      console.error("Gagal fetch tahun ajaran:", err);
    }
  };

  // === Submit Form ===
  const handleSubmit = async () => {
    // Validasi field
    if (!nis || !tingkatanId || !jurusanId || !kelasId || !tahunAjaranId) {
      return alert("Lengkapi semua field!");
    }

    const data = {
      NIS: nis,
      TINGKATAN_ID: tingkatanId,
      JURUSAN_ID: jurusanId,
      KELAS_ID: kelasId,
      TAHUN_AJARAN_ID: tahunAjaranId,
    };

    // Tidak perlu kirim TRANSAKSI_ID karena backend yang generate

    setLoading(true);
    await onSave(data);
    setLoading(false);
  };

  return (
    <Dialog
      header={selectedTransaksi ? "Edit Transaksi" : "Tambah Transaksi"}
      visible={visible}
      style={{ width: "32vw" }}
      modal
      onHide={onHide}
    >
      <div className="p-fluid">
        {/* Loading Spinner */}
        {loadingData && (
          <div className="text-center mb-3">
            <i className="pi pi-spin pi-spinner" style={{ fontSize: "2rem" }}></i>
            <p>Memuat data...</p>
          </div>
        )}

        {/* Transaksi ID - Tampilkan di semua mode (read-only) */}
        <div className="field">
          <label htmlFor="transaksiId">
            ID Transaksi
          </label>
          <InputText
            id="transaksiId"
            value={transaksiId}
            readOnly
            disabled
            className="p-disabled"
          />
          {!selectedTransaksi && (
            <small className="text-gray-500">
              ID akan di-generate otomatis dengan format TRXSXXXXXX
            </small>
          )}
        </div>

        {/* SISWA */}
        <div className="field">
          <label htmlFor="siswa">Siswa</label>
          <Dropdown
            id="siswa"
            value={nis}
            options={siswaOptions}
            onChange={(e) => setNis(e.value)}
            placeholder="Pilih siswa"
            filter
            showClear
            disabled={loadingData}
          />
        </div>

        {/* TINGKATAN */}
        <div className="field">
          <label htmlFor="tingkatan">Tingkatan</label>
          <Dropdown
            id="tingkatan"
            value={tingkatanId}
            options={tingkatanOptions}
            onChange={(e) => setTingkatanId(e.value)}
            placeholder="Pilih tingkatan"
            showClear
            disabled={loadingData}
          />
        </div>

        {/* JURUSAN */}
        <div className="field">
          <label htmlFor="jurusan">Jurusan</label>
          <Dropdown
            id="jurusan"
            value={jurusanId}
            options={jurusanOptions}
            onChange={(e) => setJurusanId(e.value)}
            placeholder="Pilih jurusan"
            filter
            showClear
            disabled={loadingData}
          />
        </div>

        {/* KODE KELAS */}
        <div className="field">
          <label htmlFor="kelas">Kode Kelas</label>
          <Dropdown
            id="kelas"
            value={kelasId}
            options={kelasOptions.map((k) => ({
              label: k.KODE_KELAS || `${k.KELAS_ID}`,
              value: k.KELAS_ID,
            }))}
            onChange={(e) => setKelasId(e.value)}
            placeholder="Pilih kode kelas"
            filter
            showClear
            disabled={loadingData}
          />
        </div>

        {/* KELAS (Nama Ruang) */}
        <div className="field">
          <label htmlFor="kelas">Nama Ruang</label>
          <Dropdown
            id="kelas"
            value={kelasId}
            options={kelasOptions.map((k) => ({
              label: k.NAMA_RUANG || "-",
              value: k.KELAS_ID,
            }))}
            onChange={(e) => setKelasId(e.value)}
            placeholder="Pilih nama ruang"
            filter
            showClear
            disabled={loadingData}
          />
        </div>

        {/* TAHUN AJARAN */}
        <div className="field">
          <label htmlFor="tahunAjaran">Tahun Ajaran</label>
          <Dropdown
            id="tahunAjaran"
            value={tahunAjaranId}
            options={tahunAjaranOptions}
            onChange={(e) => setTahunAjaranId(e.value)}
            placeholder="Pilih tahun ajaran"
            showClear
            disabled={loadingData}
          />
        </div>

        {/* Tombol Aksi */}
        <div className="flex justify-content-end gap-2 mt-3">
          <Button
            label="Batal"
            icon="pi pi-times"
            className="p-button-text"
            onClick={onHide}
            disabled={loading}
          />
          <Button
            label={loading ? "Menyimpan..." : "Simpan"}
            icon="pi pi-check"
            onClick={handleSubmit}
            disabled={loading || loadingData}
          />
        </div>
      </div>
    </Dialog>
  );
};

export default FormTransaksi;
