"use client";

import { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";

export default function FormAbsensiSiswa({ visible, onHide, onSave, selectedAbsensi, token }) {
  const [siswaList, setSiswaList] = useState([]);
  const [jadwalList, setJadwalList] = useState([]);

  const [siswaId, setSiswaId] = useState(null);
  const [jadwalId, setJadwalId] = useState(null);
  const [tanggal, setTanggal] = useState("");
  const [jamAbsen, setJamAbsen] = useState("");
  const [status, setStatus] = useState("Hadir");
  const [keterangan, setKeterangan] = useState("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // 🔹 Ambil semua jadwal saat token tersedia
  useEffect(() => {
    if (token) {
      fetchJadwal();
    }
  }, [token]);

  // 🔹 Ambil siswa berdasarkan jadwal yang dipilih
  useEffect(() => {
    if (jadwalId && token) {
      fetchSiswaByJadwal(jadwalId);
    } else {
      setSiswaList([]);
      setSiswaId(null);
    }
  }, [jadwalId, token]);

  // 🔹 Prefill jika edit mode
  useEffect(() => {
    if (selectedAbsensi) {
      setSiswaId(selectedAbsensi.SISWA_ID || null);
      setJadwalId(selectedAbsensi.JADWAL_ID || null);
      setTanggal(selectedAbsensi.TANGGAL?.split("T")[0] || "");
      setJamAbsen(selectedAbsensi.JAM_ABSEN || "");
      setStatus(selectedAbsensi.STATUS || "Hadir");
      setKeterangan(selectedAbsensi.KETERANGAN || "");
    } else {
      setSiswaId(null);
      setJadwalId(null);
      setTanggal("");
      setJamAbsen("");
      setStatus("Hadir");
      setKeterangan("");
    }
  }, [selectedAbsensi, visible]);

  // 🔹 Fetch jadwal
  const fetchJadwal = async () => {
    try {
      const res = await fetch(`${API_URL}/jadwal`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();

      // ✅ Formatkan data agar readable
      const formatted = (json.data || []).map((j) => {
        const kelasFull =
          j.kelas && j.kelas.TINGKATAN && j.kelas.NAMA_JURUSAN && j.kelas.NAMA_KELAS
            ? `${j.kelas.TINGKATAN} ${j.kelas.NAMA_JURUSAN} ${j.kelas.NAMA_KELAS}`
            : j.kelas?.NAMA_KELAS || "-";

        return {
          ...j,
          displayLabel: `${j.mapel?.NAMA_MAPEL || "-"} - ${kelasFull} (${j.hari?.NAMA_HARI || "-"}) | ${j.guru?.NAMA_GURU || "-"}`,
        };
      });

      setJadwalList(formatted);
    } catch (err) {
      console.error("Error fetching jadwal:", err);
    }
  };

  // 🔹 Fetch siswa berdasarkan jadwal
  const fetchSiswaByJadwal = async (jadwalId) => {
    try {
      const res = await fetch(`${API_URL}/jadwal/${jadwalId}/siswa`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setSiswaList(json.data || []);
    } catch (err) {
      console.error("Error fetching siswa by jadwal:", err);
      setSiswaList([]);
    }
  };

  // 🔹 Submit data
  const handleSubmit = () => {
    if (!siswaId || !jadwalId || !tanggal || !jamAbsen) {
      alert("Lengkapi semua field wajib!");
      return;
    }
    onSave({
      SISWA_ID: siswaId,
      JADWAL_ID: jadwalId,
      TANGGAL: tanggal,
      JAM_ABSEN: jamAbsen,
      STATUS: status,
      KETERANGAN: keterangan,
    });
  };

  return (
    <Dialog
      header={selectedAbsensi ? "Edit Absensi Siswa" : "Tambah Absensi Siswa"}
      visible={visible}
      modal
      onHide={onHide}
      style={{ width: "35vw" }}
    >
      <div className="p-fluid">
        {/* 🔹 Dropdown Jadwal */}
        <div className="field">
          <label>Jadwal</label>
          <Dropdown
            value={jadwalId}
            options={jadwalList.map((j) => ({
              label: j.displayLabel,
              value: j.JADWAL_ID,
            }))}
            onChange={(e) => setJadwalId(e.value)}
            placeholder="Pilih Jadwal"
            filter
          />
        </div>

        {/* 🔹 Dropdown Siswa */}
        <div className="field">
          <label>Siswa</label>
          <Dropdown
            value={siswaId}
            options={siswaList.map((s) => ({
              label: s.NAMA,
              value: s.SISWA_ID,
            }))}
            onChange={(e) => setSiswaId(e.value)}
            placeholder={
              jadwalId ? "Pilih siswa dari jadwal ini" : "Pilih jadwal terlebih dahulu"
            }
            disabled={!jadwalId}
            filter
          />
        </div>

        {/* 🔹 Input Tanggal */}
        <div className="field">
          <label>Tanggal</label>
          <InputText type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} />
        </div>

        {/* 🔹 Input Jam */}
        <div className="field">
          <label>Jam Absen</label>
          <InputText type="time" value={jamAbsen} onChange={(e) => setJamAbsen(e.target.value)} />
        </div>

        {/* 🔹 Dropdown Status */}
        <div className="field">
          <label>Status</label>
          <Dropdown
            value={status}
            options={["Hadir", "Izin", "Sakit", "Alpa"].map((s) => ({
              label: s,
              value: s,
            }))}
            onChange={(e) => setStatus(e.value)}
          />
        </div>

        {/* 🔹 Input Keterangan */}
        <div className="field">
          <label>Keterangan</label>
          <InputText
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value)}
            placeholder="Opsional"
          />
        </div>

        {/* 🔹 Tombol Aksi */}
        <div className="flex justify-content-end gap-2 mt-3">
          <Button label="Batal" icon="pi pi-times" className="p-button-text" onClick={onHide} />
          <Button label="Simpan" icon="pi pi-check" onClick={handleSubmit} />
        </div>
      </div>
    </Dialog>
  );
}
