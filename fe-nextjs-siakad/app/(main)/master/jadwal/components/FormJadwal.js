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
  // === STATE DATA FORM ===
  const [kodeJadwal, setKodeJadwal] = useState("");
  const [hari, setHari] = useState(null);
  const [tingkatanId, setTingkatanId] = useState(null);
  const [jurusanId, setJurusanId] = useState(null);
  const [kelasId, setKelasId] = useState(null);
  const [nip, setNip] = useState(null);
  const [kodeMapel, setKodeMapel] = useState(null);
  const [kodeJp, setKodeJp] = useState(null);
  const [tahunAjaranId, setTahunAjaranId] = useState(null);
  const [semester, setSemester] = useState("GANJIL");

  // === STATE OPSI DROPDOWN ===
  const [hariOptions, setHariOptions] = useState([]);
  const [tingkatanOptions, setTingkatanOptions] = useState([]);
  const [jurusanOptions, setJurusanOptions] = useState([]);
  const [kelasOptions, setKelasOptions] = useState([]);
  const [guruOptions, setGuruOptions] = useState([]);
  const [mapelOptions, setMapelOptions] = useState([]);
  const [jamPelajaranOptions, setJamPelajaranOptions] = useState([]);
  const [tahunAjaranOptions, setTahunAjaranOptions] = useState([]);

  // === STATE LOADING ===
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Generate Kode Jadwal Otomatis
  const generateKodeJadwal = () => {
    if (!jadwalList || jadwalList.length === 0) {
      return "JDW001";
    }

    const lastJadwal = jadwalList[0];
    const lastKode = lastJadwal?.KODE_JADWAL || "JDW000";
    
    const numericPartMatch = lastKode.match(/\d+$/);
    const numericPart = numericPartMatch ? parseInt(numericPartMatch[0], 10) : 0;
    
    const nextNumber = numericPart + 1;
    return `JDW${nextNumber.toString().padStart(3, "0")}`;
  };

  // Efek saat Modal Dibuka (Init Data)
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
        fetchTahunAjaran(),
      ]);

      setLoadingData(false);

      if (selectedJadwal) {
        // MODE EDIT
        setKodeJadwal(selectedJadwal.KODE_JADWAL || "");
        setHari(selectedJadwal.HARI || null);
        setTingkatanId(selectedJadwal.TINGKATAN_ID || selectedJadwal.tingkatan?.TINGKATAN_ID || null);
        setJurusanId(selectedJadwal.JURUSAN_ID || selectedJadwal.jurusan?.JURUSAN_ID || null);
        setKelasId(selectedJadwal.KELAS_ID || selectedJadwal.kelas?.KELAS_ID || null);
        setNip(selectedJadwal.NIP || selectedJadwal.guru?.NIP || null);
        setKodeMapel(selectedJadwal.KODE_MAPEL || selectedJadwal.mata_pelajaran?.KODE_MAPEL || null);
        setKodeJp(selectedJadwal.KODE_JP || selectedJadwal.jam_pelajaran?.KODE_JP || null);
        setTahunAjaranId(selectedJadwal.TAHUN_AJARAN_ID || selectedJadwal.tahun_ajaran?.TAHUN_AJARAN_ID || null);
        setSemester(selectedJadwal.SEMESTER || "GANJIL");
      } else {
        // MODE TAMBAH
        const newKode = generateKodeJadwal();
        setKodeJadwal(newKode);
        setHari(null);
        setTingkatanId(null);
        setJurusanId(null);
        setKelasId(null);
        setNip(null);
        setKodeMapel(null);
        setKodeJp(null);
        setTahunAjaranId(null);
        setSemester("GANJIL");
      }
    };

    initForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, selectedJadwal, token]);

  // ================= API FETCH FUNCTIONS =================

  const fetchHari = async () => {
    try {
      const res = await fetch(`${API_URL}/master-hari`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      const data = json.data || [];
      setHariOptions(data.map((h) => ({ label: h.NAMA_HARI, value: h.NAMA_HARI })));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTingkatan = async () => {
    try {
      const res = await fetch(`${API_URL}/master-tingkatan`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      const data = json.data || [];
      setTingkatanOptions(data.map((t) => ({ label: t.TINGKATAN, value: t.TINGKATAN_ID })));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchJurusan = async () => {
    try {
      const res = await fetch(`${API_URL}/master-jurusan`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      const data = json.data || [];
      setJurusanOptions(data.map((j) => ({ label: j.NAMA_JURUSAN, value: j.JURUSAN_ID })));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchKelas = async () => {
    try {
      const res = await fetch(`${API_URL}/master-kelas`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      const data = json.data || [];
      setKelasOptions(data.map((k) => ({ label: k.NAMA_KELAS || k.KELAS_ID, value: k.KELAS_ID })));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchGuru = async () => {
    try {
      const res = await fetch(`${API_URL}/master-guru`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      const data = json.data || [];
      data.sort((a, b) => (a.NAMA || "").localeCompare(b.NAMA || ""));
      setGuruOptions(data.map((g) => ({ label: `${g.NIP} | ${g.NAMA}`, value: g.NIP })));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMapel = async () => {
    try {
      const res = await fetch(`${API_URL}/master-mata-pelajaran`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      const data = json.data || [];
      setMapelOptions(data.map((mp) => ({ label: `${mp.KODE_MAPEL} | ${mp.NAMA_MAPEL}`, value: mp.KODE_MAPEL })));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchJamPelajaran = async () => {
    try {
      const res = await fetch(`${API_URL}/master-jam-pelajaran`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      const data = json.data || [];
      setJamPelajaranOptions(data.map((jp) => ({ 
        label: `Jam ke-${jp.JP_KE} | ${jp.WAKTU_MULAI} - ${jp.WAKTU_SELESAI}`, 
        value: jp.KODE_JP 
      })));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTahunAjaran = async () => {
    try {
      const res = await fetch(`${API_URL}/master-tahun-ajaran`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      const data = json.data || [];
      setTahunAjaranOptions(data.map((ta) => ({ 
        label: ta.NAMA_TAHUN_AJARAN || ta.TAHUN_AJARAN_ID, 
        value: ta.TAHUN_AJARAN_ID 
      })));
    } catch (err) {
      console.error(err);
    }
  };

  // ================= SUBMIT LOGIC =================

  const handleSubmit = async () => {
    // Validasi Frontend
    if (
      !hari ||
      !tingkatanId ||
      !jurusanId ||
      !kelasId ||
      !nip ||
      !kodeMapel ||
      !kodeJp ||
      !tahunAjaranId ||
      !semester
    ) {
      return alert("Mohon lengkapi semua field formulir!");
    }

    // Persiapan Data
    const data = {
      HARI: hari,
      TINGKATAN_ID: tingkatanId,
      JURUSAN_ID: jurusanId,
      KELAS_ID: kelasId,
      NIP: nip,
      KODE_MAPEL: kodeMapel,
      KODE_JP: kodeJp,
      TAHUN_AJARAN_ID: tahunAjaranId,
      SEMESTER: semester,
    };

    setLoading(true);
    await onSave(data);
    setLoading(false);
  };

  return (
    <Dialog
      header={selectedJadwal ? "Edit Jadwal Pelajaran" : "Tambah Jadwal Pelajaran"}
      visible={visible}
      style={{ width: "30vw" }}
      modal
      onHide={onHide}
    >
      <div className="p-fluid">
        {loadingData && (
          <div className="text-center mb-3">
            <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>
            <p>Memuat data...</p>
          </div>
        )}

        {/* Kode Jadwal */}
        <div className="field">
          <label htmlFor="kodeJadwal">Kode Jadwal</label>
          <InputText
            id="kodeJadwal"
            value={kodeJadwal}
            disabled
            className="p-disabled"
          />
          {!selectedJadwal && <small className="text-gray-500">Kode dibuat otomatis</small>}
        </div>

        {/* Tahun Ajaran */}
        <div className="field">
          <label htmlFor="tahunAjaran">Tahun Ajaran</label>
          <Dropdown
            id="tahunAjaran"
            value={tahunAjaranId}
            options={tahunAjaranOptions}
            onChange={(e) => setTahunAjaranId(e.value)}
            placeholder="Pilih Tahun Ajaran"
            filter
            showClear
            disabled={loadingData}
          />
        </div>

        {/* Semester */}
        <div className="field">
          <label htmlFor="semester">Semester</label>
          <Dropdown
            id="semester"
            value={semester}
            options={[
              { label: "Ganjil", value: "GANJIL" },
              { label: "Genap", value: "GENAP" }
            ]}
            onChange={(e) => setSemester(e.value)}
            placeholder="Pilih Semester"
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
            placeholder="Pilih Hari"
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
            placeholder="Pilih Tingkatan"
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
            placeholder="Pilih Jurusan"
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
            placeholder="Pilih Kelas"
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
            placeholder="Cari Mata Pelajaran..."
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
            placeholder="Cari Guru (Nama/NIP)..."
            filter
            showClear
            disabled={loadingData}
          />
        </div>

        {/* Jam Pelajaran */}
        <div className="field">
          <label htmlFor="jp">Jam Pelajaran</label>
          <Dropdown
            id="jp"
            value={kodeJp}
            options={jamPelajaranOptions}
            onChange={(e) => setKodeJp(e.value)}
            placeholder="Pilih Jam..."
            filter
            showClear
            disabled={loadingData}
          />
        </div>

        {/* Footer Tombol */}
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