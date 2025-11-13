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
  const [loading, setLoading] = useState(false); // Loading saat tombol simpan ditekan
  const [loadingData, setLoadingData] = useState(false); // Loading saat ambil data master

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // 🔹 Generate Kode Jadwal Otomatis (Client Side Logic)
  const generateKodeJadwal = () => {
    if (!jadwalList || jadwalList.length === 0) {
      return "JDW001";
    }
    // Ambil kode terakhir, misal "JDW025", ambil angkanya saja
    const lastJadwal = jadwalList[0]; // Asumsi list sudah di-sort desc dari parent
    const lastKode = lastJadwal?.KODE_JADWAL || "JDW000";
    
    // Regex untuk mengambil angka di belakang
    const numericPartMatch = lastKode.match(/\d+$/);
    const numericPart = numericPartMatch ? parseInt(numericPartMatch[0], 10) : 0;
    
    const nextNumber = numericPart + 1;
    return `JDW${nextNumber.toString().padStart(3, "0")}`;
  };

  // 🔹 Efek saat Modal Dibuka (Init Data)
  useEffect(() => {
    const initForm = async () => {
      if (!visible) return;

      setLoadingData(true);
      
      // 1. Ambil semua data master untuk dropdown
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

      // 2. Set Nilai Form
      if (selectedJadwal) {
        // === MODE EDIT ===
        setKodeJadwal(selectedJadwal.KODE_JADWAL || "");
        setHari(selectedJadwal.HARI || null); // Pastikan key sesuai dengan respons API (biasanya HARI langsung)
        setTingkatanId(selectedJadwal.TINGKATAN_ID || selectedJadwal.tingkatan?.TINGKATAN_ID || null);
        setJurusanId(selectedJadwal.JURUSAN_ID || selectedJadwal.jurusan?.JURUSAN_ID || null);
        setKelasId(selectedJadwal.KELAS_ID || selectedJadwal.kelas?.KELAS_ID || null);
        setNip(selectedJadwal.NIP || selectedJadwal.guru?.NIP || null);
        setKodeMapel(selectedJadwal.KODE_MAPEL || selectedJadwal.mata_pelajaran?.KODE_MAPEL || null);
        setKodeJp(selectedJadwal.KODE_JP || selectedJadwal.jam_pelajaran?.KODE_JP || null);
        setTahunAjaranId(selectedJadwal.TAHUN_AJARAN_ID || selectedJadwal.tahun_ajaran?.TAHUN_AJARAN_ID || null);
      } else {
        // === MODE TAMBAH ===
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
    } catch (err) { console.error(err); }
  };

  const fetchTingkatan = async () => {
    try {
      const res = await fetch(`${API_URL}/master-tingkatan`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      const data = json.data || [];
      setTingkatanOptions(data.map((t) => ({ label: t.TINGKATAN, value: t.TINGKATAN_ID })));
    } catch (err) { console.error(err); }
  };

  const fetchJurusan = async () => {
    try {
      const res = await fetch(`${API_URL}/master-jurusan`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      const data = json.data || [];
      setJurusanOptions(data.map((j) => ({ label: j.NAMA_JURUSAN, value: j.JURUSAN_ID })));
    } catch (err) { console.error(err); }
  };

  const fetchKelas = async () => {
    try {
      const res = await fetch(`${API_URL}/master-kelas`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      const data = json.data || [];
      setKelasOptions(data.map((k) => ({ label: k.NAMA_KELAS || k.KELAS_ID, value: k.KELAS_ID })));
    } catch (err) { console.error(err); }
  };

  const fetchGuru = async () => {
    try {
      const res = await fetch(`${API_URL}/master-guru`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      const data = json.data || [];
      // Sort guru by nama
      data.sort((a, b) => (a.NAMA || "").localeCompare(b.NAMA || ""));
      setGuruOptions(data.map((g) => ({ label: `${g.NIP} | ${g.NAMA}`, value: g.NIP })));
    } catch (err) { console.error(err); }
  };

  const fetchMapel = async () => {
    try {
      const res = await fetch(`${API_URL}/master-mata-pelajaran`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      const data = json.data || [];
      setMapelOptions(data.map((mp) => ({ label: `${mp.KODE_MAPEL} | ${mp.NAMA_MAPEL}`, value: mp.KODE_MAPEL })));
    } catch (err) { console.error(err); }
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
    } catch (err) { console.error(err); }
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
    } catch (err) { console.error(err); }
  };

  // ================= SUBMIT LOGIC =================

  const handleSubmit = async () => {
    // 1. Validasi Frontend
    if (
      !hari ||
      !tingkatanId ||
      !jurusanId ||
      !kelasId ||
      !nip ||
      !kodeMapel ||
      !kodeJp ||
      !tahunAjaranId // Wajib ada
    ) {
      return alert("Mohon lengkapi semua field formulir!");
    }

    // 2. Persiapan Data (Sesuaikan Key dengan Backend Controller)
    const data = {
      HARI: hari,
      TINGKATAN_ID: tingkatanId,
      JURUSAN_ID: jurusanId,
      KELAS_ID: kelasId,
      NIP: nip,
      KODE_MAPEL: kodeMapel,
      KODE_JP: kodeJp,
      TAHUN_AJARAN_ID: tahunAjaranId, // ✅ KEY SUDAH DIPERBAIKI (Match Backend)
    };

    console.log("📤 Mengirim Data:", data);

    // 3. Kirim ke Parent Component
    setLoading(true);
    await onSave(data);
    setLoading(false);
  };

  return (
    <Dialog
      header={selectedJadwal ? "Edit Jadwal Pelajaran" : "Tambah Jadwal Pelajaran"}
      visible={visible}
      style={{ width: "450px" }} // Sedikit diperlebar agar nyaman
      modal
      onHide={onHide}
      className="p-fluid"
    >
      {loadingData ? (
        <div className="flex flex-column align-items-center justify-content-center p-5">
          <i className="pi pi-spin pi-spinner" style={{ fontSize: "2rem", color: "var(--primary-color)" }}></i>
          <span className="mt-2">Memuat data master...</span>
        </div>
      ) : (
        <div className="formgrid grid">
          
          {/* Kode Jadwal */}
          <div className="field col-12">
            <label htmlFor="kodeJadwal">Kode Jadwal</label>
            <InputText id="kodeJadwal" value={kodeJadwal} disabled className="p-disabled opacity-100 font-bold" />
            {!selectedJadwal && <small className="text-gray-500">Kode dibuat otomatis</small>}
          </div>

          {/* Tahun Ajaran */}
          <div className="field col-12">
            <label htmlFor="tahunAjaran">Tahun Ajaran <span className="text-red-500">*</span></label>
            <Dropdown
              id="tahunAjaran"
              value={tahunAjaranId}
              options={tahunAjaranOptions}
              onChange={(e) => setTahunAjaranId(e.value)}
              placeholder="Pilih Tahun Ajaran"
              filter
              showClear
            />
          </div>

          {/* Hari */}
          <div className="field col-12 md:col-6">
            <label htmlFor="hari">Hari <span className="text-red-500">*</span></label>
            <Dropdown
              id="hari"
              value={hari}
              options={hariOptions}
              onChange={(e) => setHari(e.value)}
              placeholder="Pilih Hari"
              showClear
            />
          </div>

          {/* Tingkatan */}
          <div className="field col-12 md:col-6">
            <label htmlFor="tingkatan">Tingkatan <span className="text-red-500">*</span></label>
            <Dropdown
              id="tingkatan"
              value={tingkatanId}
              options={tingkatanOptions}
              onChange={(e) => setTingkatanId(e.value)}
              placeholder="Pilih Tingkatan"
              showClear
            />
          </div>

          {/* Jurusan */}
          <div className="field col-12">
            <label htmlFor="jurusan">Jurusan <span className="text-red-500">*</span></label>
            <Dropdown
              id="jurusan"
              value={jurusanId}
              options={jurusanOptions}
              onChange={(e) => setJurusanId(e.value)}
              placeholder="Pilih Jurusan"
              filter
              showClear
            />
          </div>

          {/* Kelas */}
          <div className="field col-12">
            <label htmlFor="kelas">Kelas <span className="text-red-500">*</span></label>
            <Dropdown
              id="kelas"
              value={kelasId}
              options={kelasOptions}
              onChange={(e) => setKelasId(e.value)}
              placeholder="Pilih Kelas"
              filter
              showClear
            />
          </div>

          {/* Mata Pelajaran */}
          <div className="field col-12">
            <label htmlFor="mapel">Mata Pelajaran <span className="text-red-500">*</span></label>
            <Dropdown
              id="mapel"
              value={kodeMapel}
              options={mapelOptions}
              onChange={(e) => setKodeMapel(e.value)}
              placeholder="Cari Mata Pelajaran..."
              filter
              showClear
            />
          </div>

          {/* Guru */}
          <div className="field col-12">
            <label htmlFor="guru">Guru Pengajar <span className="text-red-500">*</span></label>
            <Dropdown
              id="guru"
              value={nip}
              options={guruOptions}
              onChange={(e) => setNip(e.value)}
              placeholder="Cari Guru (Nama/NIP)..."
              filter
              showClear
            />
          </div>

          {/* Jam Pelajaran */}
          <div className="field col-12">
            <label htmlFor="jp">Jam Pelajaran <span className="text-red-500">*</span></label>
            <Dropdown
              id="jp"
              value={kodeJp}
              options={jamPelajaranOptions}
              onChange={(e) => setKodeJp(e.value)}
              placeholder="Pilih Jam..."
              filter
              showClear
            />
          </div>

        </div>
      )}

      {/* Footer Tombol */}
      <div className="flex justify-content-end gap-2 mt-4">
        <Button 
          label="Batal" 
          icon="pi pi-times" 
          className="p-button-text p-button-secondary" 
          onClick={onHide} 
          disabled={loading}
        />
        <Button 
          label={loading ? "Menyimpan..." : "Simpan Jadwal"} 
          icon={loading ? "pi pi-spin pi-spinner" : "pi pi-check"} 
          onClick={handleSubmit} 
          disabled={loading || loadingData} 
        />
      </div>
    </Dialog>
  );
};

export default FormJadwal;