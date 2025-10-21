"use client";

import { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";

const FormJurusan = ({ visible, onHide, onSave, selectedJurusan }) => {
  const [jurusanId, setJurusanId] = useState("");  // JURUSAN_ID
  const [namaJurusan, setNamaJurusan] = useState(""); // NAMA_JURUSAN
  const [deskripsi, setDeskripsi] = useState("");     // DESKRIPSI

  // ✅ Fungsi untuk mengosongkan semua field
  const clearForm = () => {
    setJurusanId("");
    setNamaJurusan("");
    setDeskripsi("");
  };

  useEffect(() => {
    if (selectedJurusan) {
      // Mode edit
      setJurusanId(selectedJurusan.JURUSAN_ID || "");
      setNamaJurusan(selectedJurusan.NAMA_JURUSAN || "");
      setDeskripsi(selectedJurusan.DESKRIPSI || "");
    } else {
      // Mode tambah baru
      clearForm();
    }
  }, [selectedJurusan]);

  const handleSubmit = () => {
    const data = {
      JURUSAN_ID: jurusanId,
      NAMA_JURUSAN: namaJurusan,
      DESKRIPSI: deskripsi,
    };

    onSave(data);

    // ✅ Setelah simpan, langsung kosongkan form
    clearForm();
  };

  return (
    <Dialog
      header={selectedJurusan ? "Edit Jurusan" : "Tambah Jurusan"}
      visible={visible}
      style={{ width: "30vw" }}
      modal
      onHide={() => {
        clearForm(); // ✅ Bersihkan juga saat dialog ditutup
        onHide();
      }}
    >
      <div className="p-fluid">
        {/* JURUSAN_ID */}
        <div className="field">
          <label htmlFor="jurusanId">Kode Jurusan</label>
          <InputText
            id="jurusanId"
            value={jurusanId}
            onChange={(e) => setJurusanId(e.target.value)}
            disabled={!!selectedJurusan} // Disable kalau mode edit
          />
        </div>

        {/* NAMA_JURUSAN */}
        <div className="field">
          <label htmlFor="namaJurusan">Nama Jurusan</label>
          <InputText
            id="namaJurusan"
            value={namaJurusan}
            onChange={(e) => setNamaJurusan(e.target.value)}
          />
        </div>

        {/* DESKRIPSI */}
        <div className="field">
          <label htmlFor="deskripsi">Deskripsi</label>
          <InputText
            id="deskripsi"
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
          />
        </div>

        {/* Tombol Aksi */}
        <div className="flex justify-content-end gap-2 mt-3">
          <Button
            label="Batal"
            icon="pi pi-times"
            className="p-button-text"
            onClick={() => {
              clearForm(); // ✅ Reset juga saat batal
              onHide();
            }}
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

export default FormJurusan;
