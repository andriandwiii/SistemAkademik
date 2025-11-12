"use client";

import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";

const FormJadwal = ({
  visible,
  onHide,
  onSave,
  selectedJadwal,
  token,
  jadwalList,
}) => {
  const [kodeJadwal, setKodeJadwal] = useState("");
  const [hari, setHari] = useState(null);
  const [tingkatanId, setTingkatanId] = useState(null);
  const [jurusanId, setJurusanId] = useState(null);
  const [kelasId, setKelasId] = useState(null);
  const [nip, setNip] = useState(null);
  const [kodeMapel, setKodeMapel] = useState(null);
  const [kodeJp, setKodeJp] = useState(null);
  const [tahunAjaranId, setTahunAjaranId] = useState(null); // 🟢 baru

  const [hariOptions, setHariOptions] = useState([]);
  const [tingkatanOptions, setTingkatanOptions] = useState([]);
  const [jurusanOptions, setJurusanOptions] = useState([]);
  const [kelasOptions, setKelasOptions] = useState([]);
  const [guruOptions, setGuruOptions] = useState([]);
  const [mapelOptions, setMapelOptions] = useState([]);
  const [jamPelajaranOptions, setJamPelajaranOptions] = useState([]);
  const [tahunAjaranOptions, setTahunAjaranOptions] = useState([]); // 🟢 baru

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Generate Kode Jadwal otomatis (untuk mode tambah)
  const generateKodeJadwal = () => {
    if (!jadwalList || jadwalList.length === 0) {
      return "JDW001";
    }

    const lastJadwal = jadwalList[0];
    const lastKode = lastJadwal?.KODE_JADWAL || "JDW000";
    const numericPart = parseInt(lastKode.replace("JDW", ""), 10);
    const nextNumber = isNaN(numericPart) ? 1 : numericPart + 1;
    return `JDW${nextNumber.toString().padStart(3, "0")}`;
  };

  // Inisialisasi form
  useEffect(() => {
    const initForm = async () => {
      if (!visible) return;

      setLoadingData(true);
      await Promise.all([
        fetchHari(),
        fetchTingkatan(),
        fetchJurusan(),
        fetchKelas(),
        fetchGuru(),
        fetchMapel(),
        fetchJamPelajaran(),
        fetchTahunAjaran(), // 🟢 baru
      ]);
      setLoadingData(false);

      if (selectedJadwal) {
        // Mode EDIT
        setKodeJadwal(selectedJadwal.KODE_JADWAL || "");
        setHari(selectedJadwal.hari?.HARI || null);
        setTingkatanId(selectedJadwal.tingkatan?.TINGKATAN_ID || null);
        setJurusanId(selectedJadwal.jurusan?.JURUSAN_ID || null);
        setKelasId(selectedJadwal.kelas?.KELAS_ID || null);
        setNip(selectedJadwal.guru?.NIP || null);
        setKodeMapel(selectedJadwal.mata_pelajaran?.KODE_MAPEL || null);
        setKodeJp(selectedJadwal.jam_pelajaran?.KODE_JP || null);
        setTahunAjaranId(selectedJadwal.tahun_ajaran?.ID_TAHUN_AJARAN || null); // 🟢 baru
      } else {
        // Mode TAMBAH
        const newKode = generateKodeJadwal();
        setKodeJadwal(newKode);
        setHari(null);
        setTingkatanId(null);
        setJurusanId(null);
        setKelasId(null);
        setNip(null);
        setKodeMapel(null);
        setKodeJp(null);
        setTahunAjaranId(null); // 🟢 baru
      }
    };

    initForm();
  }, [visible, selectedJadwal, token, jadwalList]);

  // === FETCH HARI ===
  const fetchHari = async () => {
    try {
      const res = await fetch(`${API_URL}/master-hari`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      const data = json.data || [];
      setHariOptions(
        data.map((h) => ({
          label: h.NAMA_HARI,
          value: h.NAMA_HARI,
        }))
      );
    } catch (err) {
      console.error("Gagal fetch hari:", err);
    }
  };

  // === FETCH TINGKATAN ===
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

  // === FETCH JURUSAN ===
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

  // === FETCH KELAS ===
  const fetchKelas = async () => {
    try {
      const res = await fetch(`${API_URL}/master-kelas`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      const data = json.data || [];
      setKelasOptions(
        data.map((k) => ({
          label: k.NAMA_KELAS || k.KELAS_ID,
          value: k.KELAS_ID,
        }))
      );
    } catch (err) {
      console.error("Gagal fetch kelas:", err);
    }
  };

  // === FETCH GURU ===
  const fetchGuru = async () => {
    try {
      const res = await fetch(`${API_URL}/master-guru`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      const data = json.data || [];
      data.sort((a, b) => (a.NAMA || "").localeCompare(b.NAMA || ""));
      setGuruOptions(
        data.map((g) => ({
          label: `${g.NIP} | ${g.NAMA}`,
          value: g.NIP,
        }))
      );
    } catch (err) {
      console.error("Gagal fetch guru:", err);
    }
  };

  // === FETCH MATA PELAJARAN ===
  const fetchMapel = async () => {
    try {
      const res = await fetch(`${API_URL}/master-mata-pelajaran`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      const data = json.data || [];
      setMapelOptions(
        data.map((mp) => ({
          label: `${mp.KODE_MAPEL} | ${mp.NAMA_MAPEL}`,
          value: mp.KODE_MAPEL,
        }))
      );
    } catch (err) {
      console.error("Gagal fetch mapel:", err);
    }
  };

  // === FETCH JAM PELAJARAN ===
  const fetchJamPelajaran = async () => {
    try {
      const res = await fetch(`${API_URL}/master-jam-pelajaran`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      const data = json.data || [];
      setJamPelajaranOptions(
        data.map((jp) => ({
          label: `Jam ke-${jp.JP_KE} | ${jp.WAKTU_MULAI} - ${jp.WAKTU_SELESAI}`,
          value: jp.KODE_JP,
        }))
      );
    } catch (err) {
      console.error("Gagal fetch jam pelajaran:", err);
    }
  };

  // === FETCH TAHUN AJARAN ===
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

  // === SUBMIT FORM ===
  const handleSubmit = async () => {
    if (
      !hari ||
      !tingkatanId ||
      !jurusanId ||
      !kelasId ||
      !nip ||
      !kodeMapel ||
      !kodeJp ||
      !tahunAjaranId // 🟢 validasi baru
    ) {
      return alert("Lengkapi semua field!");
    }

    const data = {
      HARI: hari,
      TINGKATAN_ID: tingkatanId,
      JURUSAN_ID: jurusanId,
      KELAS_ID: kelasId,
      NIP: nip,
      KODE_MAPEL: kodeMapel,
      KODE_JP: kodeJp,
      ID_TAHUN_AJARAN: tahunAjaranId, // 🟢 dikirim ke backend
    };

    setLoading(true);
    await onSave(data);
    setLoading(false);
  };

  return (
    <Dialog
      header={selectedJadwal ? "Edit Jadwal" : "Tambah Jadwal"}
      visible={visible}
      style={{ width: "35vw" }}
      modal
      onHide={onHide}
    >
      <div className="p-fluid">
        {loadingData && (
          <div className="text-center mb-3">
            <i className="pi pi-spin pi-spinner" style={{ fontSize: "2rem" }}></i>
            <p>Memuat data...</p>
          </div>
        )}

        {/* === Kode Jadwal === */}
        <div className="field">
          <label htmlFor="kodeJadwal">Kode Jadwal</label>
          <InputText value={kodeJadwal} readOnly disabled className="p-disabled" />
          {!selectedJadwal && <small>Kode di-generate otomatis</small>}
        </div>

        {/* Tahun Ajaran */}
        <div className="field">
          <label htmlFor="tahunAjaran">
            Tahun Ajaran 
          </label>
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

        {/* Hari */}
        <div className="field">
          <label htmlFor="hari">Hari</label>
          <Dropdown
            id="hari"
            value={hari}
            options={hariOptions}
            onChange={(e) => setHari(e.value)}
            placeholder="Pilih hari"
            showClear
            disabled={loadingData}
          />
        </div>

        {/* Tingkatan */}
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

        {/* Jurusan */}
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

        {/* Kelas */}
        <div className="field">
          <label htmlFor="kelas">Kelas</label>
          <Dropdown
            id="kelas"
            value={kelasId}
            options={kelasOptions}
            onChange={(e) => setKelasId(e.value)}
            placeholder="Pilih kelas"
            filter
            showClear
            disabled={loadingData}
          />
        </div>

        {/* Guru */}
        <div className="field">
          <label htmlFor="guru">Guru Pengajar</label>
          <Dropdown
            id="guru"
            value={nip}
            options={guruOptions}
            onChange={(e) => setNip(e.value)}
            placeholder="Pilih guru"
            filter
            showClear
            disabled={loadingData}
          />
        </div>

        {/* Mata Pelajaran */}
        <div className="field">
          <label htmlFor="mapel">Mata Pelajaran</label>
          <Dropdown
            id="mapel"
            value={kodeMapel}
            options={mapelOptions}
            onChange={(e) => setKodeMapel(e.value)}
            placeholder="Pilih mata pelajaran"
            filter
            showClear
            disabled={loadingData}
          />
        </div>

        {/* Jam Pelajaran */}
        <div className="field">
          <label htmlFor="jamPelajaran">Jam Pelajaran</label>
          <Dropdown
            id="jamPelajaran"
            value={kodeJp}
            options={jamPelajaranOptions}
            onChange={(e) => setKodeJp(e.value)}
            placeholder="Pilih jam pelajaran"
            filter
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

export default FormJadwal;
