"use client";

import { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";

const FormJurusan = ({ visible, onHide, onSave, selectedJurusan }) => {
  const [namaJurusan, setNamaJurusan] = useState("");
  const [deskripsi, setDeskripsi] = useState("");

  useEffect(() => {
    if (selectedJurusan) {
      setNamaJurusan(selectedJurusan.NAMA_JURUSAN || "");
      setDeskripsi(selectedJurusan.DESKRIPSI || "");
    } else {
      setNamaJurusan("");
      setDeskripsi("");
    }
  }, [selectedJurusan]);

  const handleSubmit = () => {
    const data = {
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
