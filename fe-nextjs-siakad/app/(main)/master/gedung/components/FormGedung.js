"use client";

import { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";

const FormGedung = ({ visible, onHide, onSave, selectedGedung }) => {
  const [gedungId, setGedungId] = useState("");   // GEDUNG_ID
  const [namaGedung, setNamaGedung] = useState(""); // NAMA_GEDUNG
  const [lokasi, setLokasi] = useState("");         // LOKASI

  useEffect(() => {
    if (selectedGedung) {
      // Jika sedang edit, isi field dari data yang dipilih
      setGedungId(selectedGedung.GEDUNG_ID || "");
      setNamaGedung(selectedGedung.NAMA_GEDUNG || "");
      setLokasi(selectedGedung.LOKASI || "");
    } else {
      // Jika tambah baru, kosongkan semua field
      setGedungId("");
      setNamaGedung("");
      setLokasi("");
    }
  }, [selectedGedung]);

  const handleSubmit = () => {
    const data = {
      GEDUNG_ID: gedungId,
      NAMA_GEDUNG: namaGedung,
      LOKASI: lokasi,
    };
    onSave(data);
  };

  return (
    <Dialog
      header={selectedGedung ? "Edit Gedung" : "Tambah Gedung"}
      visible={visible}
      style={{ width: "30vw" }}
      modal
      onHide={onHide}
    >
      <div className="p-fluid">
        {/* GEDUNG_ID */}
        <div className="field">
          <label htmlFor="gedungId">Kode Gedung</label>
          <InputText
            id="gedungId"
            value={gedungId}
            onChange={(e) => setGedungId(e.target.value)}
            disabled={!!selectedGedung} // disable kalau mode edit
          />
        </div>

        {/* NAMA_GEDUNG */}
        <div className="field">
          <label htmlFor="namaGedung">Nama Gedung</label>
          <InputText
            id="namaGedung"
            value={namaGedung}
            onChange={(e) => setNamaGedung(e.target.value)}
          />
        </div>

        {/* LOKASI */}
        <div className="field">
          <label htmlFor="lokasi">Lokasi</label>
          <InputText
            id="lokasi"
            value={lokasi}
            onChange={(e) => setLokasi(e.target.value)}
          />
        </div>

        {/* Tombol Aksi */}
        <div className="flex justify-content-end gap-2 mt-3">
          <Button
            label="Batal"
            icon="pi pi-times"
            className="p-button-text"
            onClick={onHide}
          />
          <Button
            label="Simpan"
            icon="pi pi-check"
            onClick={handleSubmit}
          />
        </div>
      </div>
    </Dialog>
  );
};

export default FormGedung;
