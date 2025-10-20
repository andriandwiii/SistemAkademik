"use client";

import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";

const FormAset = ({ visible, onHide, onSave, selectedAset, token }) => {
  const [kodeAset, setKodeAset] = useState("");
  const [namaAset, setNamaAset] = useState("");
  const [jenisAset, setJenisAset] = useState("");
  const [jumlah, setJumlah] = useState(1);
  const [kondisi, setKondisi] = useState("Baik");
  const [gedungId, setGedungId] = useState(null);
  const [sumberDana, setSumberDana] = useState("");
  const [tanggalPembelian, setTanggalPembelian] = useState(null);
  const [hargaSatuan, setHargaSatuan] = useState(0);
  const [totalHarga, setTotalHarga] = useState(0);
  const [keterangan, setKeterangan] = useState("");
  const [status, setStatus] = useState("Aktif");

  const [gedungList, setGedungList] = useState([]);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Reset / isi data saat edit
  useEffect(() => {
    if (selectedAset) {
      setKodeAset(selectedAset.KODE_ASET || "");
      setNamaAset(selectedAset.NAMA_ASET || "");
      setJenisAset(selectedAset.JENIS_ASET || "");
      setJumlah(selectedAset.JUMLAH || 1);
      setKondisi(selectedAset.KONDISI || "Baik");
      setGedungId(selectedAset.GEDUNG_ID || null);
      setSumberDana(selectedAset.SUMBER_DANA || "");
      setTanggalPembelian(
        selectedAset.TANGGAL_PEMBELIAN ? new Date(selectedAset.TANGGAL_PEMBELIAN) : null
      );
      setHargaSatuan(selectedAset.HARGA_SATUAN || 0);
      setTotalHarga(selectedAset.TOTAL_HARGA || 0);
      setKeterangan(selectedAset.KETERANGAN || "");
      setStatus(selectedAset.STATUS || "Aktif");
    } else {
      setKodeAset("");
      setNamaAset("");
      setJenisAset("");
      setJumlah(1);
      setKondisi("Baik");
      setGedungId(null);
      setSumberDana("");
      setTanggalPembelian(null);
      setHargaSatuan(0);
      setTotalHarga(0);
      setKeterangan("");
      setStatus("Aktif");
    }
  }, [selectedAset, visible]);

  // Fetch master gedung
  useEffect(() => {
    if (token) fetchGedung();
  }, [token]);

  const fetchGedung = async () => {
    try {
      const res = await fetch(`${API_URL}/master-gedung`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      const data = json.data || [];
      setGedungList(data.map(g => ({ label: g.NAMA_GEDUNG, value: g.GEDUNG_ID })));
    } catch (err) {
      console.error("Gagal fetch gedung", err);
    }
  };

  // Hitung total harga otomatis
  useEffect(() => {
    setTotalHarga((hargaSatuan || 0) * (jumlah || 0));
  }, [hargaSatuan, jumlah]);

  const handleSubmit = () => {
    if (!kodeAset || !namaAset || !jenisAset) {
      return alert("Lengkapi semua field wajib!");
    }

    const data = {
      KODE_ASET: kodeAset,
      NAMA_ASET: namaAset,
      JENIS_ASET: jenisAset,
      JUMLAH: jumlah,
      KONDISI: kondisi,
      GEDUNG_ID: gedungId,
      SUMBER_DANA: sumberDana,
      TANGGAL_PEMBELIAN: tanggalPembelian
        ? tanggalPembelian.toISOString().split("T")[0]
        : null,
      HARGA_SATUAN: hargaSatuan,
      TOTAL_HARGA: totalHarga,
      KETERANGAN: keterangan,
      STATUS: status,
    };

    onSave(data);
  };

  return (
    <Dialog
      header={selectedAset ? "Edit Aset Sekolah" : "Tambah Aset Sekolah"}
      visible={visible}
      style={{ width: "35vw" }}
      modal
      onHide={onHide}
    >
      <div className="p-fluid">
        <div className="field">
          <label htmlFor="kode">Kode Aset</label>
          <InputText id="kode" value={kodeAset} onChange={e => setKodeAset(e.target.value)} />
        </div>

        <div className="field">
          <label htmlFor="nama">Nama Aset</label>
          <InputText id="nama" value={namaAset} onChange={e => setNamaAset(e.target.value)} />
        </div>

        <div className="field">
          <label htmlFor="jenis">Jenis Aset</label>
          <InputText id="jenis" value={jenisAset} onChange={e => setJenisAset(e.target.value)} />
        </div>

        <div className="field">
          <label htmlFor="jumlah">Jumlah</label>
          <InputNumber id="jumlah" value={jumlah} onValueChange={e => setJumlah(e.value)} />
        </div>

        <div className="field">
          <label htmlFor="kondisi">Kondisi</label>
          <Dropdown
            id="kondisi"
            value={kondisi}
            options={["Baik", "Rusak Ringan", "Rusak Berat"].map(k => ({ label: k, value: k }))}
            onChange={e => setKondisi(e.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="gedung">Gedung</label>
          <Dropdown
            id="gedung"
            value={gedungId}
            options={gedungList}
            onChange={e => setGedungId(e.value)}
            placeholder="Pilih Gedung"
          />
        </div>

        <div className="field">
          <label htmlFor="sumberDana">Sumber Dana</label>
          <InputText
            id="sumberDana"
            value={sumberDana}
            onChange={e => setSumberDana(e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="tanggal">Tanggal Pembelian</label>
          <Calendar
            id="tanggal"
            value={tanggalPembelian}
            onChange={e => setTanggalPembelian(e.value)}
            dateFormat="yy-mm-dd"
            showIcon
          />
        </div>

        <div className="field">
          <label htmlFor="hargaSatuan">Harga Satuan</label>
          <InputNumber
            id="hargaSatuan"
            value={hargaSatuan}
            onValueChange={e => setHargaSatuan(e.value)}
            mode="currency"
            currency="IDR"
            locale="id-ID"
          />
        </div>

        <div className="field">
          <label htmlFor="totalHarga">Total Harga</label>
          <InputNumber
            id="totalHarga"
            value={totalHarga}
            mode="currency"
            currency="IDR"
            locale="id-ID"
            readOnly
          />
        </div>

        <div className="field">
          <label htmlFor="keterangan">Keterangan</label>
          <InputText
            id="keterangan"
            value={keterangan}
            onChange={e => setKeterangan(e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="status">Status</label>
          <Dropdown
            id="status"
            value={status}
            options={["Aktif", "Tidak Aktif"].map(s => ({ label: s, value: s }))}
            onChange={e => setStatus(e.value)}
          />
        </div>

        <div className="flex justify-content-end gap-2 mt-3">
          <Button label="Batal" icon="pi pi-times" className="p-button-text" onClick={onHide} />
          <Button label="Simpan" icon="pi pi-check" onClick={handleSubmit} />
        </div>
      </div>
    </Dialog>
  );
};

export default FormAset;
