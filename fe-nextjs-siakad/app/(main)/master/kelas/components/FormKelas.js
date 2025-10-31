"use client";

import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";

const FormKelas = ({ visible, onHide, onSave, selectedKelas, token }) => {
  const [namaKelas, setNamaKelas] = useState("");
  const [tingkatan, setTingkatan] = useState("");
  const [jurusanId, setJurusanId] = useState(null);
  const [gedungId, setGedungId] = useState(null);

  const [jurusanList, setJurusanList] = useState([]);
  const [gedungList, setGedungList] = useState([]);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Reset form saat dialog visible atau selectedKelas berubah
  useEffect(() => {
    if (selectedKelas) {
      setNamaKelas(selectedKelas.NAMA_KELAS || "");
      setTingkatan(selectedKelas.TINGKATAN || "");
      setJurusanId(selectedKelas.JURUSAN_ID || null);
      setGedungId(selectedKelas.GEDUNG_ID || null);
    } else if (visible) {
      setNamaKelas("");
      setTingkatan("");
      setJurusanId(null);
      setGedungId(null);
    }
  }, [selectedKelas, visible]);

  useEffect(() => {
    if (token) {
      fetchJurusan();
      fetchGedung();
    }
  }, [token]);

  const fetchJurusan = async () => {
    try {
      const res = await fetch(`${API_URL}/master-jurusan`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setJurusanList(json.data || []);
    } catch (err) {
      console.error("Gagal fetch jurusan", err);
    }
  };

  const fetchGedung = async () => {
    try {
      const res = await fetch(`${API_URL}/master-gedung`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setGedungList(json.data || []);
    } catch (err) {
      console.error("Gagal fetch gedung", err);
    }
  };

  const handleSubmit = () => {
    const data = {
      NAMA_KELAS: namaKelas,
      JURUSAN_ID: jurusanId,
      GEDUNG_ID: gedungId,
      TINGKATAN: tingkatan,
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
    >
      <div className="p-fluid">
        <div className="field">
          <label htmlFor="namaKelas">Nama Kelas</label>
          <InputText
            id="namaKelas"
            value={namaKelas}
            onChange={(e) => setNamaKelas(e.target.value)}
          />
        </div>

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
          />
        </div>

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
          />
        </div>

        <div className="field">
          <label htmlFor="tingkatan">Tingkatan</label>
          <InputText
            id="tingkatan"
            value={tingkatan}
            onChange={(e) => setTingkatan(e.target.value)}
          />
        </div>

        <div className="flex justify-content-end gap-2 mt-3">
          <Button
            label="Batal"
            icon="pi pi-times"
            className="p-button-text"
            onClick={onHide}
          />
          <Button label="Simpan" icon="pi pi-check" onClick={handleSubmit} />
        </div>
      </div>
    </Dialog>
  );
};

export default FormKelas;
