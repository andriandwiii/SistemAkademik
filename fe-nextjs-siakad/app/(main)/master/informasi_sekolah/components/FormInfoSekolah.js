"use client";

import { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";

const FormInfoSekolah = ({ visible, onHide, onSave, selectedInfo }) => {
  const [judul, setJudul] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [kategori, setKategori] = useState("Umum");
  const [tanggal, setTanggal] = useState(null);

  // Opsi kategori sesuai ENU di database
  const kategoriOptions = [
    { label: "Akademik", value: "Akademik" },
    { label: "Ekstrakurikuler", value: "Ekstrakurikuler" },
    { label: "Umum", value: "Umum" },
    { label: "Prestasi", value: "Prestasi" },
  ];

  const clearForm = () => {
    setJudul("");
    setDeskripsi("");
    setKategori("Umum");
    setTanggal(null);
  };

  useEffect(() => {
    if (selectedInfo) {
      setJudul(selectedInfo.JUDUL || "");
      setDeskripsi(selectedInfo.DESKRIPSI || "");
      setKategori(selectedInfo.KATEGORI || "Umum");
      // Konversi string tanggal dari DB ke Objek Date JS untuk Calendar
      setTanggal(selectedInfo.TANGGAL ? new Date(selectedInfo.TANGGAL) : null);
    } else {
      clearForm();
    }
  }, [selectedInfo]);

  const handleSubmit = () => {
    // Format tanggal ke YYYY-MM-DD sebelum dikirim ke BE
    const formattedDate = tanggal ? tanggal.toISOString().split('T')[0] : null;

    const data = {
      JUDUL: judul,
      DESKRIPSI: deskripsi,
      KATEGORI: kategori,
      TANGGAL: formattedDate,
    };

    onSave(data);
    clearForm();
  };

  return (
    <Dialog
      header={selectedInfo ? "Edit Informasi Sekolah" : "Tambah Informasi Baru"}
      visible={visible}
      style={{ width: "40vw" }}
      breakpoints={{ "960px": "75vw", "641px": "90vw" }}
      modal
      onHide={() => {
        clearForm();
        onHide();
      }}
    >
      <div className="p-fluid">
        {/* JUDUL */}
        <div className="field mb-3">
          <label htmlFor="judul" className="font-bold">Judul Informasi</label>
          <InputText
            id="judul"
            value={judul}
            onChange={(e) => setJudul(e.target.value)}
            placeholder="Masukkan judul pengumuman..."
            autoFocus
          />
        </div>

        {/* KATEGORI */}
        <div className="field mb-3">
          <label htmlFor="kategori" className="font-bold">Kategori</label>
          <Dropdown
            id="kategori"
            value={kategori}
            options={kategoriOptions}
            onChange={(e) => setKategori(e.value)}
            placeholder="Pilih Kategori"
          />
        </div>

        {/* TANGGAL */}
        <div className="field mb-3">
          <label htmlFor="tanggal" className="font-bold">Tanggal Publikasi</label>
          <Calendar
            id="tanggal"
            value={tanggal}
            onChange={(e) => setTanggal(e.value)}
            dateFormat="yy-mm-dd"
            showIcon
            placeholder="Pilih Tanggal"
          />
        </div>

        {/* DESKRIPSI */}
        <div className="field mb-3">
          <label htmlFor="deskripsi" className="font-bold">Deskripsi / Isi Berita</label>
          <InputTextarea
            id="deskripsi"
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
            rows={5}
            cols={30}
            autoResize
            placeholder="Tuliskan detail informasi di sini..."
          />
        </div>

        {/* Tombol Aksi */}
        <div className="flex justify-content-end gap-2 mt-4">
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
            label="Simpan Informasi"
            icon="pi pi-check"
            severity="primary"
            onClick={handleSubmit}
            disabled={!judul || !deskripsi || !tanggal}
          />
        </div>
      </div>
    </Dialog>
  );
};

export default FormInfoSekolah;