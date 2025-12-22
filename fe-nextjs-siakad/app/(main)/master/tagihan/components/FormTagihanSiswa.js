"use client";

import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { InputTextarea } from "primereact/inputtextarea";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";

const FormTagihanSiswa = ({
  visible,
  onHide,
  onSave,
  selectedTagihan,
  token,
}) => {
  const [tagihanId, setTagihanId] = useState("");
  const [nomorTagihan, setNomorTagihan] = useState("");
  const [nis, setNis] = useState(null);
  const [komponenId, setKomponenId] = useState(null);
  const [tahunAjaranId, setTahunAjaranId] = useState(null);
  const [bulan, setBulan] = useState(null);
  const [tahun, setTahun] = useState(new Date().getFullYear());
  const [nominal, setNominal] = useState(null);
  const [potongan, setPotongan] = useState(0);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState("BELUM_BAYAR");
  const [tglJatuhTempo, setTglJatuhTempo] = useState(null);
  const [tglLunas, setTglLunas] = useState(null);
  const [keterangan, setKeterangan] = useState("");

  const [siswaOptions, setSiswaOptions] = useState([]);
  const [komponenOptions, setKomponenOptions] = useState([]);
  const [tahunAjaranOptions, setTahunAjaranOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const statusOptions = [
    { label: "Belum Bayar", value: "BELUM_BAYAR" },
    { label: "Sebagian", value: "SEBAGIAN" },
    { label: "Lunas", value: "LUNAS" },
    { label: "Dispensasi", value: "DISPENSASI" },
  ];

  const bulanOptions = [
    { label: "Januari", value: 1 },
    { label: "Februari", value: 2 },
    { label: "Maret", value: 3 },
    { label: "April", value: 4 },
    { label: "Mei", value: 5 },
    { label: "Juni", value: 6 },
    { label: "Juli", value: 7 },
    { label: "Agustus", value: 8 },
    { label: "September", value: 9 },
    { label: "Oktober", value: 10 },
    { label: "November", value: 11 },
    { label: "Desember", value: 12 },
  ];

  // Inisialisasi form setiap kali dialog dibuka
  useEffect(() => {
    const initForm = async () => {
      if (!visible) return;

      setLoadingData(true);
      await Promise.all([
        fetchSiswa(),
        fetchKomponen(),
        fetchTahunAjaran(),
      ]);
      setLoadingData(false);

      if (selectedTagihan) {
        // Mode EDIT
        setTagihanId(selectedTagihan.TAGIHAN_ID || "");
        setNomorTagihan(selectedTagihan.NOMOR_TAGIHAN || "");
        setNis(selectedTagihan.NIS || null);
        setKomponenId(selectedTagihan.KOMPONEN_ID || null);
        setTahunAjaranId(selectedTagihan.TAHUN_AJARAN_ID || null);
        setBulan(selectedTagihan.BULAN || null);
        setTahun(selectedTagihan.TAHUN || new Date().getFullYear());
        setNominal(selectedTagihan.NOMINAL || null);
        setPotongan(selectedTagihan.POTONGAN || 0);
        setTotal(selectedTagihan.TOTAL || 0);
        setStatus(selectedTagihan.STATUS || "BELUM_BAYAR");
        setTglJatuhTempo(selectedTagihan.TGL_JATUH_TEMPO ? new Date(selectedTagihan.TGL_JATUH_TEMPO) : null);
        setTglLunas(selectedTagihan.TGL_LUNAS ? new Date(selectedTagihan.TGL_LUNAS) : null);
        setKeterangan(selectedTagihan.KETERANGAN || "");
      } else {
        // Mode TAMBAH
        resetForm();
      }
    };

    initForm();
  }, [visible, selectedTagihan, token]);

  // Auto-calculate total
  useEffect(() => {
    if (nominal !== null && potongan !== null) {
      setTotal(nominal - potongan);
    }
  }, [nominal, potongan]);

  const resetForm = () => {
    setTagihanId("Auto Generate");
    setNomorTagihan("Auto Generate");
    setNis(null);
    setKomponenId(null);
    setTahunAjaranId(null);
    setBulan(null);
    setTahun(new Date().getFullYear());
    setNominal(null);
    setPotongan(0);
    setTotal(0);
    setStatus("BELUM_BAYAR");
    setTglJatuhTempo(null);
    setTglLunas(null);
    setKeterangan("");
  };

  // === FETCH SISWA ===
  const fetchSiswa = async () => {
    try {
      const res = await fetch(`${API_URL}/siswa`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      const data = json.data || [];

      setSiswaOptions(
        data
          .filter((s) => s.STATUS === "Aktif")
          .map((s) => ({
            label: `${s.NIS} - ${s.NAMA}`,
            value: s.NIS,
          }))
      );
    } catch (err) {
      console.error("Gagal fetch siswa:", err);
    }
  };

  // === FETCH KOMPONEN BIAYA ===
  const fetchKomponen = async () => {
    try {
      const res = await fetch(`${API_URL}/master-komponen-biaya`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      let komponenData = json.data || json || [];
      komponenData.sort((a, b) => (a.URUTAN || 0) - (b.URUTAN || 0));

      setKomponenOptions(
        komponenData.map((k) => ({
          label: `${k.NAMA_KOMPONEN} (${k.JENIS_BIAYA})`,
          value: k.KOMPONEN_ID,
        }))
      );
    } catch (err) {
      console.error("Gagal fetch komponen biaya:", err);
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
    // Validasi field wajib
    if (!nis || !komponenId || !tahunAjaranId || !nominal) {
      return alert("Lengkapi field yang wajib diisi (NIS, Komponen, Tahun Ajaran, dan Nominal)!");
    }

    const data = {
      NIS: nis,
      KOMPONEN_ID: komponenId,
      TAHUN_AJARAN_ID: tahunAjaranId,
      BULAN: bulan,
      TAHUN: tahun,
      NOMINAL: nominal,
      POTONGAN: potongan || 0,
      STATUS: status,
      TGL_JATUH_TEMPO: tglJatuhTempo ? tglJatuhTempo.toISOString().split("T")[0] : null,
      TGL_LUNAS: tglLunas ? tglLunas.toISOString().split("T")[0] : null,
      KETERANGAN: keterangan || null,
    };

    setLoading(true);
    await onSave(data);
    setLoading(false);
  };

  // Format Rupiah untuk display
  const formatRupiah = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  // === UI DIALOG ===
  return (
    <Dialog
      header={selectedTagihan ? "Edit Tagihan Siswa" : "Tambah Tagihan Siswa"}
      visible={visible}
      style={{ width: "40vw" }}
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

        {/* ID Section - Read Only */}
        <div className="grid">
          <div className="col-6">
            <div className="field">
              <label htmlFor="tagihanId">ID Tagihan</label>
              <InputText
                id="tagihanId"
                value={tagihanId}
                readOnly
                disabled
                className="p-disabled"
              />
            </div>
          </div>
          <div className="col-6">
            <div className="field">
              <label htmlFor="nomorTagihan">No. Tagihan</label>
              <InputText
                id="nomorTagihan"
                value={nomorTagihan}
                readOnly
                disabled
                className="p-disabled"
              />
            </div>
          </div>
        </div>

        {!selectedTagihan && (
          <small className="text-gray-500 block mb-3">
            ID Tagihan dan Nomor Tagihan akan di-generate otomatis
          </small>
        )}

        {/* Siswa */}
        <div className="field">
          <label htmlFor="nis">
            Siswa <span className="text-red-500">*</span>
          </label>
          <Dropdown
            id="nis"
            value={nis}
            options={siswaOptions}
            onChange={(e) => setNis(e.value)}
            placeholder="Pilih siswa"
            filter
            showClear
            disabled={loadingData || !!selectedTagihan}
            emptyMessage="Tidak ada data siswa aktif"
          />
          {selectedTagihan && (
            <small className="text-gray-500">Siswa tidak dapat diubah saat edit</small>
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

        {/* Bulan & Tahun */}
        <div className="grid">
          <div className="col-6">
            <div className="field">
              <label htmlFor="bulan">
                Bulan <small className="text-gray-500">(Opsional, untuk SPP)</small>
              </label>
              <Dropdown
                id="bulan"
                value={bulan}
                options={bulanOptions}
                onChange={(e) => setBulan(e.value)}
                placeholder="Pilih bulan"
                showClear
                disabled={loadingData}
              />
            </div>
          </div>
          <div className="col-6">
            <div className="field">
              <label htmlFor="tahun">Tahun</label>
              <InputNumber
                id="tahun"
                value={tahun}
                onValueChange={(e) => setTahun(e.value)}
                useGrouping={false}
                placeholder="Masukkan tahun"
                disabled={loadingData}
              />
            </div>
          </div>
        </div>

        {/* Nominal & Potongan */}
        <div className="grid">
          <div className="col-6">
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
          </div>
          <div className="col-6">
            <div className="field">
              <label htmlFor="potongan">Potongan (Rp)</label>
              <InputNumber
                id="potongan"
                value={potongan}
                onValueChange={(e) => setPotongan(e.value)}
                mode="currency"
                currency="IDR"
                locale="id-ID"
                placeholder="Masukkan potongan"
                disabled={loadingData}
                minFractionDigits={0}
              />
            </div>
          </div>
        </div>

        {/* Total - Calculated */}
        <div className="field">
          <label htmlFor="total">Total yang Harus Dibayar</label>
          <InputText
            id="total"
            value={formatRupiah(total)}
            readOnly
            disabled
            className="p-disabled font-semibold text-green-600"
          />
        </div>

        {/* Status */}
        <div className="field">
          <label htmlFor="status">Status</label>
          <Dropdown
            id="status"
            value={status}
            options={statusOptions}
            onChange={(e) => setStatus(e.value)}
            placeholder="Pilih status"
            disabled={loadingData}
          />
        </div>

        {/* Tanggal Jatuh Tempo & Lunas */}
        <div className="grid">
          <div className="col-6">
            <div className="field">
              <label htmlFor="tglJatuhTempo">Tanggal Jatuh Tempo</label>
              <Calendar
                id="tglJatuhTempo"
                value={tglJatuhTempo}
                onChange={(e) => setTglJatuhTempo(e.value)}
                dateFormat="dd/mm/yy"
                placeholder="Pilih tanggal"
                showIcon
                disabled={loadingData}
              />
            </div>
          </div>
          <div className="col-6">
            <div className="field">
              <label htmlFor="tglLunas">Tanggal Lunas</label>
              <Calendar
                id="tglLunas"
                value={tglLunas}
                onChange={(e) => setTglLunas(e.value)}
                dateFormat="dd/mm/yy"
                placeholder="Pilih tanggal"
                showIcon
                disabled={loadingData}
              />
            </div>
          </div>
        </div>

        {/* Keterangan */}
        <div className="field">
          <label htmlFor="keterangan">Keterangan</label>
          <InputTextarea
            id="keterangan"
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value)}
            rows={3}
            placeholder="Masukkan keterangan tambahan"
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

export default FormTagihanSiswa;