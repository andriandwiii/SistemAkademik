"use client";

import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";

const FormTarifBiaya = ({
  visible,
  onHide,
  onSave,
  selectedTarif,
  token,
}) => {
  const [tarifId, setTarifId] = useState("");
  const [komponenId, setKomponenId] = useState(null);
  const [kategoriId, setKategoriId] = useState(null);
  const [tahunAjaranId, setTahunAjaranId] = useState(null);
  const [tingkatanId, setTingkatanId] = useState(null);
  const [nominal, setNominal] = useState(null);

  const [komponenOptions, setKomponenOptions] = useState([]);
  const [kategoriOptions, setKategoriOptions] = useState([]);
  const [tahunAjaranOptions, setTahunAjaranOptions] = useState([]);
  const [tingkatanOptions, setTingkatanOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Inisialisasi form setiap kali dialog dibuka
  useEffect(() => {
    const initForm = async () => {
      if (!visible) return;

      setLoadingData(true);
      await Promise.all([
        fetchKomponen(),
        fetchKategori(),
        fetchTahunAjaran(),
        fetchTingkatan(),
      ]);
      setLoadingData(false);

      if (selectedTarif) {
        // Mode EDIT
        setTarifId(selectedTarif.TARIF_ID || "");
        setKomponenId(selectedTarif.KOMPONEN_ID || null);
        setKategoriId(selectedTarif.KATEGORI_ID || null);
        setTahunAjaranId(selectedTarif.TAHUN_AJARAN_ID || null);
        setTingkatanId(selectedTarif.TINGKATAN_ID || null);
        setNominal(selectedTarif.NOMINAL || null);
      } else {
        // Mode TAMBAH
        setTarifId("Auto Generate");
        setKomponenId(null);
        setKategoriId(null);
        setTahunAjaranId(null);
        setTingkatanId(null);
        setNominal(null);
      }
    };

    initForm();
  }, [visible, selectedTarif, token]);

  // === FETCH KOMPONEN BIAYA ===
  const fetchKomponen = async () => {
    try {
      const res = await fetch(`${API_URL}/master-komponen-biaya`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        console.error("Error fetch komponen biaya, status:", res.status);
        return;
      }

      const json = await res.json();
      console.log("Data komponen biaya dari API:", json);

      let komponenData = json.data || json || [];
      komponenData.sort((a, b) => (a.URUTAN || 0) - (b.URUTAN || 0));

      const options = komponenData.map((k) => ({
        label: `${k.NAMA_KOMPONEN} (${k.JENIS_BIAYA})`,
        value: k.KOMPONEN_ID,
      }));

      console.log("Komponen options:", options);
      setKomponenOptions(options);
    } catch (err) {
      console.error("Gagal fetch komponen biaya:", err);
    }
  };

  // === FETCH KATEGORI SISWA ===
  const fetchKategori = async () => {
    try {
      const res = await fetch(`${API_URL}/master-kategori-siswa`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      const data = json.data || [];

      setKategoriOptions(
        data.map((k) => ({
          label: k.NAMA_KATEGORI,
          value: k.KATEGORI_ID,
        }))
      );
    } catch (err) {
      console.error("Gagal fetch kategori siswa:", err);
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

  // === SUBMIT FORM ===
  const handleSubmit = async () => {
    // Validasi field wajib
    if (!komponenId || !kategoriId || !tahunAjaranId || !nominal) {
      return alert("Lengkapi field yang wajib diisi (Komponen, Kategori, Tahun Ajaran, dan Nominal)!");
    }

    const data = {
      KOMPONEN_ID: komponenId,
      KATEGORI_ID: kategoriId,
      TAHUN_AJARAN_ID: tahunAjaranId,
      TINGKATAN_ID: tingkatanId,
      NOMINAL: nominal,
    };

    // Tidak perlu kirim TARIF_ID karena backend yang generate

    setLoading(true);
    await onSave(data);
    setLoading(false);
  };

  // === UI DIALOG ===
  return (
    <Dialog
      header={selectedTarif ? "Edit Tarif Biaya" : "Tambah Tarif Biaya"}
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

        {/* Tarif ID - Tampilkan di semua mode (read-only) */}
        <div className="field">
          <label htmlFor="tarifId">ID Tarif</label>
          <InputText
            id="tarifId"
            value={tarifId}
            readOnly
            disabled
            className="p-disabled"
          />
          {!selectedTarif && (
            <small className="text-gray-500">
              ID akan di-generate otomatis dengan format TARIFXXXXX
            </small>
          )}
        </div>

        {/* Komponen Biaya */}
        <div className="field">
          <label htmlFor="komponen">
            Komponen Biaya <span className="text-red-500">*</span>
          </label>
          <Dropdown
            id="komponen"
            value={komponenId}
            options={komponenOptions}
            onChange={(e) => setKomponenId(e.value)}
            placeholder="Pilih komponen biaya"
            filter
            showClear
            disabled={loadingData}
            emptyMessage="Tidak ada data komponen biaya"
          />
        </div>

        {/* Kategori Siswa */}
        <div className="field">
          <label htmlFor="kategori">
            Kategori Siswa <span className="text-red-500">*</span>
          </label>
          <Dropdown
            id="kategori"
            value={kategoriId}
            options={kategoriOptions}
            onChange={(e) => setKategoriId(e.value)}
            placeholder="Pilih kategori siswa"
            filter
            showClear
            disabled={loadingData}
            emptyMessage="Tidak ada data kategori siswa"
          />
        </div>

        {/* Tahun Ajaran */}
        <div className="field">
          <label htmlFor="tahunAjaran">
            Tahun Ajaran <span className="text-red-500">*</span>
          </label>
          <Dropdown
            id="tahunAjaran"
            value={tahunAjaranId}
            options={tahunAjaranOptions}
            onChange={(e) => setTahunAjaranId(e.value)}
            placeholder="Pilih tahun ajaran"
            showClear
            disabled={loadingData}
            emptyMessage="Tidak ada data tahun ajaran"
          />
        </div>

        {/* Tingkatan */}
        <div className="field">
          <label htmlFor="tingkatan">
            Tingkatan <small className="text-gray-500">(Opsional)</small>
          </label>
          <Dropdown
            id="tingkatan"
            value={tingkatanId}
            options={tingkatanOptions}
            onChange={(e) => setTingkatanId(e.value)}
            placeholder="Pilih tingkatan"
            showClear
            disabled={loadingData}
            emptyMessage="Tidak ada data tingkatan"
          />
          <small className="text-gray-500">
            Kosongkan jika berlaku untuk semua tingkatan
          </small>
        </div>

        {/* Nominal */}
        <div className="field">
          <label htmlFor="nominal">
            Nominal (Rp) <span className="text-red-500">*</span>
          </label>
          <InputNumber
            id="nominal"
            value={nominal}
            onValueChange={(e) => setNominal(e.value)}
            mode="currency"
            currency="IDR"
            locale="id-ID"
            placeholder="Masukkan nominal"
            disabled={loadingData}
            minFractionDigits={0}
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

export default FormTarifBiaya;