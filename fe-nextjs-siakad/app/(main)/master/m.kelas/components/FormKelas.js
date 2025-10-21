"use client";

import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";

/**
 * FormKelas — tambah / edit kelas
 * Sesuai struktur tabel: KELAS_ID, GEDUNG_ID, RUANG_ID, STATUS
 */
const FormKelas = ({ visible, onHide, onSave, selectedKelas, token }) => {
  // state utama
  const [kelasId, setKelasId] = useState("");
  const [gedungId, setGedungId] = useState(null);
  const [ruangId, setRuangId] = useState(null);
  const [status, setStatus] = useState("Aktif");

  // list dropdown
  const [gedungList, setGedungList] = useState([]);
  const [ruangList, setRuangList] = useState([]);

  // loading
  const [loading, setLoading] = useState(false);

  // base URL API
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // kosongkan form
  const clearForm = () => {
    setKelasId("");
    setGedungId(null);
    setRuangId(null);
    setStatus("Aktif");
  };

  // ambil data dropdown dari API master-gedung dan master-ruang
  const fetchDropdownData = async () => {
    try {
      setLoading(true);

      const [gedungRes, ruangRes] = await Promise.all([
        fetch(`${API_URL}/master-gedung`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/master-ruang`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const gedungJson = await gedungRes.json();
      const ruangJson = await ruangRes.json();

      setGedungList(gedungJson.data || []);
      setRuangList(ruangJson.data || []);
    } catch (error) {
      console.error("❌ Gagal mengambil data dropdown:", error);
    } finally {
      setLoading(false);
    }
  };

  // fetch data saat dialog dibuka
  useEffect(() => {
    if (visible && token) {
      fetchDropdownData();
    }
  }, [visible, token]);

  // isi data kalau edit
  useEffect(() => {
    if (selectedKelas) {
      setKelasId(selectedKelas.KELAS_ID || "");
      setGedungId(selectedKelas.GEDUNG_ID || null);
      setRuangId(selectedKelas.RUANG_ID || null);
      setStatus(selectedKelas.STATUS || "Aktif");
    } else if (visible) {
      clearForm();
    }
  }, [selectedKelas, visible]);

  // handle simpan
  const handleSubmit = () => {
    const data = {
      KELAS_ID: kelasId,
      GEDUNG_ID: gedungId,
      RUANG_ID: ruangId,
      STATUS: status,
    };
    onSave(data);
    clearForm();
  };

  // opsi status
  const statusOptions = [
    { label: "Aktif", value: "Aktif" },
    { label: "Tidak Aktif", value: "Tidak Aktif" },
  ];

  return (
    <Dialog
      header={selectedKelas ? "Edit Kelas" : "Tambah Kelas"}
      visible={visible}
      style={{ width: "35vw" }}
      modal
      onHide={() => {
        clearForm();
        onHide();
      }}
      dismissableMask
    >
      <div className="p-fluid">
        {/* KELAS_ID */}
        <div className="field">
          <label htmlFor="kelasId">Kode Kelas</label>
          <InputText
            id="kelasId"
            value={kelasId}
            onChange={(e) => setKelasId(e.target.value)}
            placeholder="Masukkan Kode Kelas (mis. K001)"
            disabled={!!selectedKelas} // disable kalau edit
          />
        </div>

        {/* GEDUNG_ID */}
        <div className="field">
          <label htmlFor="gedung">Gedung</label>
          <Dropdown
            id="gedung"
            value={gedungId}
            options={gedungList.map((g) => ({
              label: `${g.NAMA_GEDUNG} (${g.GEDUNG_ID})`,
              value: g.GEDUNG_ID,
            }))}
            onChange={(e) => setGedungId(e.value)}
            placeholder="Pilih Gedung"
            filter
            showClear
            loading={loading}
            className="w-full"
          />
        </div>

        {/* RUANG_ID */}
        <div className="field">
          <label htmlFor="ruang">Ruang</label>
          <Dropdown
            id="ruang"
            value={ruangId}
            options={ruangList.map((r) => ({
              label: `${r.NAMA_RUANG} (${r.RUANG_ID})`,
              value: r.RUANG_ID,
            }))}
            onChange={(e) => setRuangId(e.value)}
            placeholder="Pilih Ruang"
            filter
            showClear
            loading={loading}
            className="w-full"
          />
        </div>

        {/* STATUS */}
        <div className="field">
          <label htmlFor="status">Status</label>
          <Dropdown
            id="status"
            value={status}
            options={statusOptions}
            onChange={(e) => setStatus(e.value)}
            placeholder="Pilih Status"
            className="w-full"
          />
        </div>

        {/* Tombol aksi */}
        <div className="flex justify-content-end gap-2 mt-3">
          <Button
            label="Batal"
            icon="pi pi-times"
            className="p-button-text"
            onClick={() => {
              clearForm();
              onHide();
            }}
          />
          <Button
            label="Simpan"
            icon="pi pi-check"
            onClick={handleSubmit}
            disabled={loading || !gedungId || !ruangId}
          />
        </div>
      </div>
    </Dialog>
  );
};

export default FormKelas;
