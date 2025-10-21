"use client";

import { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";

const FormRuang = ({ visible, onHide, onSave, selectedRuang }) => {
  const [ruangId, setRuangId] = useState("");
  const [namaRuang, setNamaRuang] = useState("");
  const [deskripsi, setDeskripsi] = useState("");

  useEffect(() => {
    if (selectedRuang) {
      setRuangId(selectedRuang.RUANG_ID || "");
      setNamaRuang(selectedRuang.NAMA_RUANG || "");
      setDeskripsi(selectedRuang.DESKRIPSI || "");
    } else {
      setRuangId("");
      setNamaRuang("");
      setDeskripsi("");
    }
  }, [selectedRuang]);

  const handleSubmit = () => {
    const data = {
      RUANG_ID: ruangId,
      NAMA_RUANG: namaRuang,
      DESKRIPSI: deskripsi,
    };
    onSave(data);
  };

  return (
    <Dialog
      header={selectedRuang ? "Edit Ruang" : "Tambah Ruang"}
      visible={visible}
      style={{ width: "30vw" }}
      modal
      onHide={onHide}
    >
      <div className="p-fluid">
        {/* 🔹 Kode Ruang */}
        <div className="field">
          <label htmlFor="ruangId">Kode Ruang</label>
          <InputText
            id="ruangId"
            value={ruangId}
            onChange={(e) => setRuangId(e.target.value)}
            disabled={!!selectedRuang} // Nonaktif saat edit
          />
        </div>

        {/* 🔹 Nama Ruang */}
        <div className="field">
          <label htmlFor="namaRuang">Nama Ruang</label>
          <InputText
            id="namaRuang"
            value={namaRuang}
            onChange={(e) => setNamaRuang(e.target.value)}
            placeholder="Masukkan nama ruang"
          />
        </div>

        {/* 🔹 Deskripsi */}
        <div className="field">
          <label htmlFor="deskripsi">Deskripsi</label>
          <InputText
            id="deskripsi"
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
            placeholder="Masukkan deskripsi ruang"
          />
        </div>

        {/* 🔹 Tombol Aksi */}
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

export default FormRuang;
