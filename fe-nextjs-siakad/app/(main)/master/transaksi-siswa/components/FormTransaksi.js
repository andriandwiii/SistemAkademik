"use client";

import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";

const FormTransaksi = ({
  visible,
  onHide,
  onSave,
  selectedTransaksi,
  token,
  transaksiList,
}) => {
  const [siswaId, setSiswaId] = useState(null);
  const [kelasId, setKelasId] = useState(null);
  const [tahunAjaran, setTahunAjaran] = useState("");
  const [status, setStatus] = useState("Aktif");

  const [siswaOptions, setSiswaOptions] = useState([]);
  const [kelasOptions, setKelasOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Inisialisasi form setiap kali dialog dibuka
  useEffect(() => {
    const initForm = async () => {
      if (!visible) return;

      await fetchSiswa();
      await fetchKelas();

      if (selectedTransaksi) {
        setSiswaId(
          selectedTransaksi.SISWA_ID ||
            selectedTransaksi.siswa?.SISWA_ID ||
            null
        );
        setKelasId(
          selectedTransaksi.KELAS_ID ||
            selectedTransaksi.kelas?.KELAS_ID ||
            null
        );
        setTahunAjaran(selectedTransaksi.TAHUN_AJARAN?.toString() || "");
        setStatus(selectedTransaksi.STATUS || "Aktif");
      } else {
        setSiswaId(null);
        setKelasId(null);
        setTahunAjaran("");
        setStatus("Aktif");
      }
    };

    initForm();
  }, [visible, selectedTransaksi, transaksiList, token]);

  // === FETCH SISWA ===
  const fetchSiswa = async () => {
    try {
      const res = await fetch(`${API_URL}/siswa`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      let siswaData = json.data || [];

      // Pastikan siswa yang sudah ditransaksikan tidak muncul lagi
      const usedSiswaIds = transaksiList.map(
        (t) => t.SISWA_ID || t.siswa?.SISWA_ID
      );
      const currentSiswaId =
        selectedTransaksi?.SISWA_ID || selectedTransaksi?.siswa?.SISWA_ID;

      siswaData = siswaData.filter(
        (s) => !usedSiswaIds.includes(s.SISWA_ID) || s.SISWA_ID === currentSiswaId
      );
      siswaData.sort((a, b) => a.NAMA.localeCompare(b.NAMA));

      setSiswaOptions(
        siswaData.map((s) => ({
          label: `${s.NIS} - ${s.NAMA}`,
          value: s.SISWA_ID,
        }))
      );
    } catch (err) {
      console.error("Gagal fetch siswa:", err);
    }
  };

  // === FETCH KELAS ===
  const fetchKelas = async () => {
    try {
      const res = await fetch(`${API_URL}/master-kelas`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      const kelasData = json.data || [];

      // Gunakan fullName dari backend agar sama seperti tampilan tabel
      setKelasOptions(
        kelasData.map((k) => ({
          label: k.fullName || `${k.TINGKATAN} ${k.NAMA_JURUSAN} ${k.NAMA_RUANG}`,
          value: k.KELAS_ID,
        }))
      );
    } catch (err) {
      console.error("Gagal fetch kelas:", err);
    }
  };

  // === SUBMIT FORM ===
  const handleSubmit = async () => {
    if (!siswaId || !kelasId || !tahunAjaran)
      return alert("Lengkapi semua field!");

    const data = {
      SISWA_ID: siswaId,
      KELAS_ID: kelasId,
      TAHUN_AJARAN: parseInt(tahunAjaran),
      STATUS: status,
    };

    setLoading(true);
    await onSave(data);
    setLoading(false);
  };

  // === UI DIALOG ===
  return (
    <Dialog
      header={selectedTransaksi ? "Edit Transaksi" : "Tambah Transaksi"}
      visible={visible}
      style={{ width: "30vw" }}
      modal
      onHide={onHide}
    >
      <div className="p-fluid">
        {/* Siswa */}
        <div className="field">
          <label htmlFor="siswa">Siswa</label>
          <Dropdown
            id="siswa"
            value={siswaId}
            options={siswaOptions}
            onChange={(e) => setSiswaId(e.value)}
            placeholder="Pilih siswa"
            filter
            showClear
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
          />
        </div>

        {/* Tahun Ajaran */}
        <div className="field">
          <label htmlFor="tahunAjaran">Tahun Ajaran</label>
          <InputText
            id="tahunAjaran"
            value={tahunAjaran}
            onChange={(e) => setTahunAjaran(e.target.value)}
            placeholder="Contoh: 2025"
          />
        </div>

        {/* Status */}
        <div className="field">
          <label htmlFor="status">Status</label>
          <Dropdown
            id="status"
            value={status}
            options={["Aktif", "Lulus", "Pindah", "Nonaktif"].map((s) => ({
              label: s,
              value: s,
            }))}
            onChange={(e) => setStatus(e.value)}
          />
        </div>

        {/* Tombol */}
        <div className="flex justify-content-end gap-2 mt-3">
          <Button
            label="Batal"
            icon="pi pi-times"
            className="p-button-text"
            onClick={onHide}
          />
          <Button
            label={loading ? "Menyimpan..." : "Simpan"}
            icon="pi pi-check"
            onClick={handleSubmit}
            disabled={loading}
          />
        </div>
      </div>
    </Dialog>
  );
};

export default FormTransaksi;
