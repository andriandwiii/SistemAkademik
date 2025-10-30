"use client";

import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";

const FormTransaksiWakel = ({
  visible,
  onHide,
  onSave,
  selectedTransaksi,
  token,
  transaksiList,
}) => {
  const [transaksiId, setTransaksiId] = useState("");
  const [nip, setNip] = useState(null);
  const [tingkatanId, setTingkatanId] = useState(null);
  const [jurusanId, setJurusanId] = useState(null);
  const [kelasId, setKelasId] = useState(null);

  const [guruOptions, setGuruOptions] = useState([]);
  const [tingkatanOptions, setTingkatanOptions] = useState([]);
  const [jurusanOptions, setJurusanOptions] = useState([]);
  const [kelasOptions, setKelasOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Generate ID Transaksi otomatis (untuk mode tambah)
  const generateTransaksiId = () => {
    if (!transaksiList || transaksiList.length === 0) {
      return "TRXG000001";
    }

    // Ambil transaksi terakhir
    const lastTransaksi = transaksiList[0]; // Asumsi list sudah diurutkan desc
    const lastId = lastTransaksi?.TRANSAKSI_ID || "TRXG000000";

    // Extract angka dari ID terakhir
    const numericPart = parseInt(lastId.replace("TRXG", ""), 10);
    const nextNumber = isNaN(numericPart) ? 1 : numericPart + 1;

    // Format: TRXG + angka 6 digit
    return `TRXG${nextNumber.toString().padStart(6, "0")}`;
  };

  // Inisialisasi form setiap kali dialog dibuka
  useEffect(() => {
    const initForm = async () => {
      if (!visible) return;

      setLoadingData(true);
      await Promise.all([
        fetchGuru(),
        fetchTingkatan(),
        fetchJurusan(),
        fetchKelas(),
      ]);
      setLoadingData(false);

      if (selectedTransaksi) {
        // Mode EDIT
        setTransaksiId(selectedTransaksi.TRANSAKSI_ID || "");
        setNip(selectedTransaksi.guru?.NIP || null);
        setTingkatanId(selectedTransaksi.tingkatan?.TINGKATAN_ID || null);
        setJurusanId(selectedTransaksi.jurusan?.JURUSAN_ID || null);
        setKelasId(selectedTransaksi.kelas?.KELAS_ID || null);
      } else {
        // Mode TAMBAH - Generate ID otomatis
        const newId = generateTransaksiId();
        setTransaksiId(newId);
        setNip(null);
        setTingkatanId(null);
        setJurusanId(null);
        setKelasId(null);
      }
    };

    initForm();
  }, [visible, selectedTransaksi, token, transaksiList]);

  // === FETCH GURU ===
  const fetchGuru = async () => {
    try {
      const res = await fetch(`${API_URL}/master-guru`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) {
        console.error("Error fetch guru, status:", res.status);
        return;
      }

      const json = await res.json();
      console.log("Data guru dari API:", json);
      
      let guruData = json.data || json || [];

      // Filter guru yang sudah ada di transaksi (kecuali yang sedang diedit)
      const usedNip = transaksiList.map((t) => t.guru?.NIP);
      const currentNip = selectedTransaksi?.guru?.NIP;

      guruData = guruData.filter(
        (g) => !usedNip.includes(g.NIP) || g.NIP === currentNip
      );
      
      guruData.sort((a, b) => (a.NAMA || "").localeCompare(b.NAMA || ""));

      const options = guruData.map((g) => ({
        label: `${g.NIP} | ${g.NAMA}`,
        value: g.NIP,
      }));

      console.log("Guru options:", options);
      setGuruOptions(options);
    } catch (err) {
      console.error("Gagal fetch guru:", err);
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

    // Menampilkan hanya KELAS_ID di dropdown
    setKelasOptions(
      data.map((k) => ({
        label: k.KELAS_ID,  // tampilkan ID kelas
        value: k.KELAS_ID,  // kirim value ID kelas ke backend
      }))
    );
  } catch (err) {
    console.error("Gagal fetch kelas:", err);
  }
};


  // === SUBMIT FORM ===
  const handleSubmit = async () => {
    // Validasi field
    if (!nip || !tingkatanId || !jurusanId || !kelasId) {
      return alert("Lengkapi semua field!");
    }

    const data = {
      NIP: nip,
      TINGKATAN_ID: tingkatanId,
      JURUSAN_ID: jurusanId,
      KELAS_ID: kelasId,
    };

    // Tidak perlu kirim TRANSAKSI_ID karena backend yang generate

    setLoading(true);
    await onSave(data);
    setLoading(false);
  };

  // === UI DIALOG ===
  return (
    <Dialog
      header={selectedTransaksi ? "Edit Wali Kelas" : "Tambah Wali Kelas"}
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
              ID akan di-generate otomatis dengan format TRXGXXXXXX
            </small>
          )}
        </div>

        {/* Guru (NIP) */}
        <div className="field">
          <label htmlFor="guru">
            Guru Wali Kelas
          </label>
          <Dropdown
            id="guru"
            value={nip}
            options={guruOptions}
            onChange={(e) => setNip(e.value)}
            placeholder="Pilih guru"
            filter
            showClear
            disabled={loadingData}
            emptyMessage="Tidak ada data guru"
          />
          {guruOptions.length === 0 && !loadingData && (
            <small className="text-red-500">
              Data guru kosong atau semua guru sudah menjadi wali kelas
            </small>
          )}
        </div>

        {/* Tingkatan */}
        <div className="field">
          <label htmlFor="tingkatan">
            Tingkatan
          </label>
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
          <label htmlFor="jurusan">
            Jurusan
          </label>
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
          <label htmlFor="kelas">
            Kelas 
          </label>
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

        {/* Tombol */}
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

export default FormTransaksiWakel;