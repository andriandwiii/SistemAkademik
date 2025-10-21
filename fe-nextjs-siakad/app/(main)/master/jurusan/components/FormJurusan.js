"use client";

import { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";

const FormJurusan = ({ visible, onHide, onSave, selectedJurusan }) => {
  const [jurusanId, setJurusanId] = useState("");  // Menambahkan state untuk JURUSAN_ID
  const [namaJurusan, setNamaJurusan] = useState("");
  const [deskripsi, setDeskripsi] = useState("");

  useEffect(() => {
    if (selectedJurusan) {
      setJurusanId(selectedJurusan.JURUSAN_ID || "");  // Mengatur JURUSAN_ID dari selectedJurusan
      setNamaJurusan(selectedJurusan.NAMA_JURUSAN || "");
      setDeskripsi(selectedJurusan.DESKRIPSI || "");
    } else {
      setJurusanId("");  // Kosongkan saat menambah jurusan baru
      setNamaJurusan("");
      setDeskripsi("");
    }
  }, [selectedJurusan]);

  const handleSubmit = () => {
    const data = {
      JURUSAN_ID: jurusanId,  // Menambahkan JURUSAN_ID ke dalam data
      NAMA_JURUSAN: namaJurusan,
      DESKRIPSI: deskripsi,
    };
    onSave(data);
  };

  return (
    <Dialog
      header={selectedJurusan ? "Edit Jurusan" : "Tambah Jurusan"}
      visible={visible}
      style={{ width: "30vw" }}
      modal
      onHide={onHide}
    >
      <div className="p-fluid">
        <div className="field">
          <label htmlFor="jurusanId">Kode Jurusan</label>
          <InputText
            id="jurusanId"
            value={jurusanId}
            onChange={(e) => setJurusanId(e.target.value)}
            disabled={!!selectedJurusan}  // Nonaktifkan jika sedang mengedit jurusan
          />
        </div>
        <div className="field">
          <label htmlFor="namaJurusan">Nama Jurusan</label>
          <InputText
            id="namaJurusan"
            value={namaJurusan}
            onChange={(e) => setNamaJurusan(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="deskripsi">Deskripsi</label>
          <InputText
            id="deskripsi"
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
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

export default FormJurusan;
