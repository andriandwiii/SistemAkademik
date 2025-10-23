"use client";

import { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";

const FormAgama = ({ visible, onHide, onSave, selectedAgama }) => {
  const [idAgama, setIdAgama] = useState("");
  const [namaAgama, setNamaAgama] = useState("");

  // ✅ Reset form
  const clearForm = () => {
    setIdAgama("");
    setNamaAgama("");
  };

  useEffect(() => {
    if (selectedAgama) {
      // Mode edit
      setIdAgama(selectedAgama.IDAGAMA || "");
      setNamaAgama(selectedAgama.NAMAAGAMA || "");
    } else {
      // Mode tambah baru
      clearForm();
    }
  }, [selectedAgama]);

  const handleSubmit = () => {
    const data = {
      IDAGAMA: idAgama,
      NAMAAGAMA: namaAgama,
    };

    onSave(data);
    clearForm(); // Kosongkan setelah simpan
  };

  return (
    <Dialog
      header={selectedAgama ? "Edit Agama" : "Tambah Agama"}
      visible={visible}
      style={{ width: "30vw" }}
      modal
      onHide={() => {
        clearForm();
        onHide();
      }}
    >
      <div className="p-fluid">
       

        {/* NAMAAGAMA */}
        <div className="field">
          <label htmlFor="namaAgama">Nama Agama</label>
          <InputText
            id="namaAgama"
            value={namaAgama}
            onChange={(e) => setNamaAgama(e.target.value)}
            placeholder="Contoh: Islam, Kristen, Hindu"
          />
        </div>

        {/* Tombol Aksi */}
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
          />
        </div>
      </div>
    </Dialog>
  );
};

export default FormAgama;
